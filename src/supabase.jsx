import { createClient } from '@supabase/supabase-js';
/* Talqeeh — Supabase Client & Member API (Fase 1)
   Member management via Supabase. Data user pribadi tetap localStorage.
*/

let _supabase = null;
let _supabaseReady = false;
let _supabaseReadyCallbacks = [];

const _onSupabaseReady = (fn) => {
  if (_supabaseReady) { fn(); return; }
  _supabaseReadyCallbacks.push(fn);
};

// Load config from server (keeps credentials out of source code)
fetch('/api/config')
  .then(r => r.json())
  .then(({ supabaseUrl, supabaseAnonKey }) => {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
    _supabaseReady = true;
    _supabaseReadyCallbacks.forEach(fn => fn());
    _supabaseReadyCallbacks = [];
  })
  .catch(err => {
    console.error('Failed to load app config:', err);
  });

const _getClient = () => _supabase;

/* ── Status check ── */
const checkSupabase = async () => {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    return data.supabase === true;
  } catch { return false; }
};

/* ── Format converters ── */
const sbToMember = (row) => {
  if (!row) return null;
  return {
    code:      row.code,
    name:      row.name,
    whatsapp:  row.whatsapp  || "",
    duration:  row.duration  || 30,
    status:    row.status    || "active",
    createdAt: row.created_at ? row.created_at.slice(0, 10) : "",
    expiresAt: row.expires_at || "",
    device:    row.device    || null,
    deviceId:  row.device_id || null,
    lastLogin: row.last_login || null,
    notes:     row.notes     || "",
    _id:       row.id,
  };
};

const memberToSb = (member) => {
  const row = {};
  if (member.code      !== undefined) row.code       = member.code;
  if (member.name      !== undefined) row.name       = member.name;
  if (member.whatsapp  !== undefined) row.whatsapp   = member.whatsapp;
  if (member.duration  !== undefined) row.duration   = member.duration;
  if (member.status    !== undefined) row.status     = member.status;
  if (member.expiresAt !== undefined) row.expires_at = member.expiresAt;
  if (member.device    !== undefined) row.device     = member.device;
  if (member.deviceId  !== undefined) row.device_id  = member.deviceId;
  if (member.lastLogin !== undefined) row.last_login = member.lastLogin;
  if (member.notes     !== undefined) row.notes      = member.notes;
  return row;
};

/* ── CRUD ── */
const sbGetAllMembers = async () => {
  const client = _getClient();
  if (!client) throw new Error("Supabase not ready");
  const { data, error } = await client
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(sbToMember);
};

const sbGetMemberByCode = async (code) => {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!data.ok) return null;
    return data.member;
  } catch {
    return null;
  }
};

const sbAddMember = async (member) => {
  const client = _getClient();
  if (!client) throw new Error("Supabase not ready");
  const row = memberToSb(member);
  const { data, error } = await client
    .from("members")
    .insert([row])
    .select()
    .single();
  if (error) throw error;
  return sbToMember(data);
};

const sbUpdateMember = async (code, updates) => {
  const client = _getClient();
  if (!client) throw new Error("Supabase not ready");
  const row = memberToSb(updates);
  const { error } = await client
    .from("members")
    .update(row)
    .eq("code", code);
  if (error) throw error;
  return { code, ...updates };
};

const sbDeleteMember = async (code) => {
  const client = _getClient();
  if (!client) throw new Error("Supabase not ready");
  const { error } = await client.from("members").delete().eq("code", code);
  if (error) throw error;
};

const sbBindDevice = async (code, deviceId, deviceLabel) => {
  return sbUpdateMember(code, {
    deviceId,
    device:    deviceLabel,
    lastLogin: new Date().toISOString(),
  });
};

const sbResetDevice = async (code) => {
  return sbUpdateMember(code, { deviceId: null, device: null });
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

