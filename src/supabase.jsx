import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
/* Talqeeh — Supabase Client & Member API (Fase 1)
   Member management via Supabase. Data user pribadi tetap localStorage.
*/

let _supabase = null;
let _supabaseReady = false;
let _supabaseReadyCallbacks = [];
let _resolveReady, _rejectReady;
const _readyPromise = new Promise((resolve, reject) => { _resolveReady = resolve; _rejectReady = reject; });
_readyPromise.catch(() => {});

const _onSupabaseReady = (fn) => {
  if (_supabaseReady) { fn(); return; }
  _supabaseReadyCallbacks.push(fn);
};

const whenSupabaseReady = () => _readyPromise;

/* ── Pengaturan publik dari admin (URL Mayar, harga AI, WA admin) ── */
let _appSettings = {};
const getAppSettings = () => _appSettings;
const useAppSettings = () => {
  const [settings, setSettings] = useState(_appSettings);
  useEffect(() => {
    const onLoad = () => setSettings(_appSettings);
    window.addEventListener('talqeeh:settings', onLoad);
    onLoad();
    return () => window.removeEventListener('talqeeh:settings', onLoad);
  }, []);
  return settings;
};
// Hanya buka link https (nilai berasal dari pengaturan admin).
const safeHttpsUrl = (url) => (typeof url === 'string' && /^https:\/\//i.test(url.trim()) ? url.trim() : null);

// Load config from server (keeps credentials out of source code)
fetch('/api/config')
  .then(r => r.json())
  .then(({ supabaseUrl, supabaseAnonKey, settings }) => {
    _appSettings = settings || {};
    window.dispatchEvent(new Event('talqeeh:settings'));
    // PKCE: Google redirects back to /?code=… (query string), which doesn't clash with the hash router.
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
    });
    _supabaseReady = true;
    _resolveReady(_supabase);
    _supabaseReadyCallbacks.forEach(fn => fn());
    _supabaseReadyCallbacks = [];
  })
  .catch(err => {
    console.error('Failed to load app config:', err);
    _rejectReady(err);
  });

const _getClient = () => _supabase;

const getAccessToken = async () => {
  try {
    const client = await whenSupabaseReady();
    const { data } = await client.auth.getSession();
    return data?.session?.access_token || null;
  } catch { return null; }
};

// fetch() to our own /api/* with the logged-in user's Supabase token attached.
const authFetch = async (url, opts = {}, token) => {
  const accessToken = token || await getAccessToken();
  return fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
};

/* ── Status check ── */
const checkSupabase = async () => {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    return data.supabase === true;
  } catch { return false; }
};

/* ── Offline fallback ── */
const sbGetAllMembersFallback = () => {
  try {
    const raw = localStorage.getItem("madad_members");
    if (raw) return JSON.parse(raw);
    return typeof DEFAULT_MEMBERS !== "undefined" ? DEFAULT_MEMBERS : [];
  } catch { return []; }
};

Object.assign(window, {
  _onSupabaseReady,
  whenSupabaseReady,
  authFetch,
  getAppSettings, useAppSettings, safeHttpsUrl,
  checkSupabase,
  sbGetAllMembersFallback,
});

/* ============================================================
   USER DATA API (Fase 2) — Sync data pribadi user ke Supabase
   Pola: localStorage dulu (instant), Supabase background (sync)
   ============================================================ */

const getMemberCode = () => {
  try {
    const s = JSON.parse(localStorage.getItem("madad_session") || "{}");
    return s.code || null;
  } catch { return null; }
};

// Member yang sudah bayar Library (bukan akun gratis). Dipakai untuk membuka bank soal penuh & reward member.
const isPaidMember = () => {
  try {
    const s = JSON.parse(localStorage.getItem("madad_session") || "{}");
    return !!s.code && s.tier !== "free";
  } catch { return false; }
};

/* ── AI ADD-ON SUBSCRIPTION (Mayar) ── */

const checkAiSubscription = async () => {
  const code = getMemberCode();
  if (!code) return { active: false };
  try {
    const res = await authFetch('/api/ai-partner?action=status', { method: 'POST', body: '{}' });
    const data = await res.json();
    return { active: !!data.active, tier: data.tier || (data.active ? 'pro' : 'none'), trial: data.trial || null, expiresAt: data.expires_at || null };
  } catch {
    return { active: false, tier: 'none', trial: null };
  }
};

/* ── PEMBAYARAN (Mayar API) ── */

// Buat tagihan untuk paket 'library' | 'library_ai' | 'ai'. Harga ditentukan server.
const createCheckout = async (plan) => {
  try {
    const res = await authFetch('/api/login?action=checkout', { method: 'POST', body: JSON.stringify({ plan }) });
    const data = await res.json().catch(() => ({}));
    if (res.status === 429) return { ok: false, status: 'rate_limited' };
    return data.ok ? data : { ok: false, status: data.status || 'error' };
  } catch {
    return { ok: false, status: 'network' };
  }
};

// Status tagihan: 'pending' | 'paid' | 'expired' | 'not_found' | 'error'.
const checkCheckout = async (id) => {
  try {
    const res = await authFetch('/api/login?action=checkout-status', { method: 'POST', body: JSON.stringify({ id }) });
    const data = await res.json().catch(() => ({}));
    if (res.status === 404) return { status: 'not_found' };
    return data.ok ? { status: data.status, plan: data.plan } : { status: 'error' };
  } catch {
    return { status: 'error' };
  }
};

/* ── NOTES (Kurasah) ── */

const sbSaveNote = async (note) => {
  const client = _getClient();
  if (!client) return;
  const code = getMemberCode();
  if (!code) return;
  const { error } = await client.from("user_notes").upsert({
    member_code: code,
    note_id:    note.id,
    title:      note.title || "",
    body:       note.body  || "",
    tags:       note.tags  || [],
    source:     note.source || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "member_code,note_id" });
  if (error) throw error;
};

const sbDeleteNote = async (noteId) => {
  const client = _getClient();
  if (!client) return;
  const code = getMemberCode();
  if (!code) return;
  await client.from("user_notes")
    .delete().eq("member_code", code).eq("note_id", noteId);
};

const sbLoadNotes = async () => {
  const client = _getClient();
  if (!client) return null;
  const code = getMemberCode();
  if (!code) return null;
  const { data, error } = await client.from("user_notes")
    .select("*").eq("member_code", code).order("updated_at", { ascending: false });
  if (error) throw error;
  return data.map(r => ({
    id: r.note_id, title: r.title, body: r.body,
    tags: r.tags || [], source: r.source,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }));
};

/* ── PROGRESS ── */

const sbSaveProgress = async (progress) => {
  const client = _getClient();
  if (!client) return;
  const code = getMemberCode();
  if (!code) return;
  await client.from("user_progress").upsert({
    member_code: code, progress,
    updated_at: new Date().toISOString(),
  }, { onConflict: "member_code" });
};

const sbLoadProgress = async () => {
  const client = _getClient();
  if (!client) return null;
  const code = getMemberCode();
  if (!code) return null;
  const { data } = await client.from("user_progress")
    .select("progress").eq("member_code", code).single();
  return data?.progress || null;
};

/* ── INTENTIONS (Niat) ── */

const sbSaveIntention = async (intentionData) => {
  const client = _getClient();
  if (!client) return;
  const code = getMemberCode();
  if (!code) return;
  const today = new Date().toISOString().slice(0, 10);
  await client.from("user_intentions").upsert({
    member_code: code, today_date: today,
    intention:  intentionData,
    updated_at: new Date().toISOString(),
  }, { onConflict: "member_code,today_date" });
};

const sbLoadIntentions = async () => {
  const client = _getClient();
  if (!client) return null;
  const code = getMemberCode();
  if (!code) return null;
  const { data } = await client.from("user_intentions")
    .select("today_date,intention").eq("member_code", code)
    .order("today_date", { ascending: false }).limit(60);
  if (!data) return null;
  const result = { daysWithIntention: [] };
  data.forEach(r => {
    if (r.today_date === new Date().toISOString().slice(0, 10)) {
      Object.assign(result, r.intention || {}, { todayDate: r.today_date });
    }
    result.daysWithIntention.push(r.today_date);
  });
  return result;
};

/* ── PRESENCE (Ritme) ── */

const sbSavePresence = async (presence) => {
  const client = _getClient();
  if (!client) return;
  const code = getMemberCode();
  if (!code) return;
  await client.from("user_presence").upsert({
    member_code: code, days_present: presence.daysPresent || [],
    updated_at: new Date().toISOString(),
  }, { onConflict: "member_code" });
};

const sbLoadPresence = async () => {
  const client = _getClient();
  if (!client) return null;
  const code = getMemberCode();
  if (!code) return null;
  const { data } = await client.from("user_presence")
    .select("days_present").eq("member_code", code).single();
  return data ? { daysPresent: data.days_present || [] } : null;
};

/* ── PROFILES ── */

const sbSaveProfile = async (profile) => {
  const client = _getClient();
  if (!client) return;
  const code = getMemberCode();
  if (!code) return;
  const { error } = await client.from("user_profiles").upsert({
    member_code: code,
    profile,
    updated_at: new Date().toISOString(),
  }, { onConflict: "member_code" });
  if (error) throw error;
};

const sbLoadProfile = async () => {
  const client = _getClient();
  if (!client) return null;
  const code = getMemberCode();
  if (!code) return null;
  const { data } = await client.from("user_profiles")
    .select("profile").eq("member_code", code).single();
  return data?.profile || null;
};

/* ── MADDAH ACTIVITY ── */

const sbSaveMaddahActivity = async (activity) => {
  const client = _getClient();
  if (!client) return;
  const code = getMemberCode();
  if (!code) return;
  const rows = Object.entries(activity).map(([maddah_id, act]) => ({
    member_code:    code,
    maddah_id,
    opens:          act.opens || 0,
    prompts_copied: act.promptsCopied || 0,
    last_open:      act.lastOpen || null,
    updated_at:     new Date().toISOString(),
  }));
  if (rows.length === 0) return;
  const { error } = await client.from("user_maddah_activity").upsert(rows, {
    onConflict: "member_code,maddah_id",
  });
  if (error) throw error;
};

const sbLoadMaddahActivity = async () => {
  const client = _getClient();
  if (!client) return null;
  const code = getMemberCode();
  if (!code) return null;
  const { data } = await client.from("user_maddah_activity")
    .select("*").eq("member_code", code);
  if (!data) return null;
  const activity = {};
  data.forEach(r => {
    activity[r.maddah_id] = {
      opens:          r.opens || 0,
      promptsCopied:  r.prompts_copied || 0,
      lastOpen:       r.last_open,
    };
  });
  return activity;
};

/* ── MUQARANAH CUSTOM ── */

const sbSaveMuqaranah = async (entry) => {
  const client = _getClient();
  if (!client) return;
  const code = getMemberCode();
  if (!code) return;
  await client.from("user_muqaranah").upsert({
    member_code: code, entry_id: entry.id, data: entry,
    updated_at: new Date().toISOString(),
  }, { onConflict: "member_code,entry_id" });
};

const sbDeleteMuqaranah = async (entryId) => {
  const client = _getClient();
  if (!client) return;
  const code = getMemberCode();
  if (!code) return;
  await client.from("user_muqaranah")
    .delete().eq("member_code", code).eq("entry_id", entryId);
};

const sbLoadMuqaranah = async () => {
  const client = _getClient();
  if (!client) return null;
  const code = getMemberCode();
  if (!code) return null;
  const { data } = await client.from("user_muqaranah")
    .select("data").eq("member_code", code).order("updated_at", { ascending: false });
  return data ? data.map(r => r.data) : null;
};

/* ── BANK SOAL PROGRESS (self-check "Paham" / "Belum") ── */

const sbSaveSoalProgress = async (soalKey, status) => {
  const client = _getClient();
  if (!client) return;
  const code = getMemberCode();
  if (!code) return;
  const { error } = await client.from("user_soal_progress").upsert({
    member_code: code,
    soal_key:    soalKey,
    status,
    updated_at:  new Date().toISOString(),
  }, { onConflict: "member_code,soal_key" });
  if (error) throw error;
};

const sbLoadSoalProgress = async () => {
  const client = _getClient();
  if (!client) return null;
  const code = getMemberCode();
  if (!code) return null;
  const { data, error } = await client.from("user_soal_progress")
    .select("soal_key,status").eq("member_code", code);
  if (error) return null;
  const map = {};
  (data || []).forEach(r => { map[r.soal_key] = r.status; });
  return map;
};

/* ── SYNC ENGINE ── */

// Pull semua data dari Supabase ke localStorage (saat login / app load)
const sbPullAllUserData = async () => {
  const results = await Promise.allSettled([
    sbLoadNotes().then(d => d && d.length > 0 && localStorage.setItem("madad_notes", JSON.stringify(d))),
    sbLoadProgress().then(d => d && localStorage.setItem("madad_progress", JSON.stringify(d))),
    sbLoadIntentions().then(d => d && localStorage.setItem("madad_intentions", JSON.stringify(d))),
    sbLoadPresence().then(d => d && localStorage.setItem("madad_presence", JSON.stringify(d))),
    sbLoadMuqaranah().then(d => d && d.length > 0 && localStorage.setItem("madad_muqaranah_custom", JSON.stringify(d))),
    sbLoadProfile().then(d => d && localStorage.setItem("madad_profile", JSON.stringify(d))),
    sbLoadMaddahActivity().then(d => d && Object.keys(d).length > 0 && localStorage.setItem("talqee_maddah_activity", JSON.stringify(d))),
  ]);
  const failed = results.filter(r => r.status === "rejected").length;
  return { success: results.length - failed, failed };
};

// Push data dari localStorage ke Supabase (background, saat login pertama kali)
const sbPushAllUserData = async () => {
  const get = (key, fb) => { try { return JSON.parse(localStorage.getItem(key)) || fb; } catch { return fb; } };
  const notes          = get("madad_notes", []);
  const progress       = get("madad_progress", {});
  const intentions     = get("madad_intentions", {});
  const presence       = get("madad_presence", { daysPresent: [] });
  const muqaranah      = get("madad_muqaranah_custom", []);
  const profile        = get("madad_profile", null);
  const maddahActivity = get("talqee_maddah_activity", {});
  await Promise.allSettled([
    ...notes.map(n => sbSaveNote(n)),
    sbSaveProgress(progress),
    sbSaveIntention(intentions),
    sbSavePresence(presence),
    ...muqaranah.map(m => sbSaveMuqaranah(m)),
    profile && sbSaveProfile(profile),
    Object.keys(maddahActivity).length > 0 && sbSaveMaddahActivity(maddahActivity),
  ].filter(Boolean));
};

Object.assign(window, {
  getMemberCode, isPaidMember,
  checkAiSubscription, createCheckout, checkCheckout,
  sbLoadNotes, sbSaveNote, sbDeleteNote,
  sbLoadProgress, sbSaveProgress,
  sbLoadIntentions, sbSaveIntention,
  sbLoadPresence, sbSavePresence,
  sbLoadMuqaranah, sbSaveMuqaranah, sbDeleteMuqaranah,
  sbSaveProfile, sbLoadProfile,
  sbSaveMaddahActivity, sbLoadMaddahActivity,
  sbSaveSoalProgress, sbLoadSoalProgress,
  sbPullAllUserData,
  sbPushAllUserData,
});

