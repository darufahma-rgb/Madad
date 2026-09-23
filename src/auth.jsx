import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqih, auth system (Google via Supabase Auth), profile, progress */

// NOTE: Storage keys tetap pakai prefix 'madad_' untuk backward compatibility
// dengan user yang sudah punya data dari versi sebelumnya.
// Tidak perlu di-rename ke 'talqih_'.
const STORAGE_KEYS = {
  SESSION:          "madad_session",
  LEGACY_CODE:      "madad_legacy_code",
  PROFILE:          "madad_profile",
  PROGRESS:         "madad_progress",
  MEMBERS:          "madad_members",
  ADMIN:            "madad_admin",
  NOTES:            "madad_notes",
  MUQARANAH_CUSTOM: "madad_muqaranah_custom",
  INTENTIONS:       "madad_intentions",
  PRESENCE:         "madad_presence",
  MADDAH_ACTIVITY:  "talqee_maddah_activity",
};

// Data belajar per-user di localStorage; dibersihkan kalau member lain login di browser yang sama.
const USER_DATA_KEYS = [
  STORAGE_KEYS.PROFILE, STORAGE_KEYS.PROGRESS, STORAGE_KEYS.NOTES,
  STORAGE_KEYS.MUQARANAH_CUSTOM, STORAGE_KEYS.INTENTIONS, STORAGE_KEYS.PRESENCE,
  STORAGE_KEYS.MADDAH_ACTIVITY,
];

/* ---------- Code generation (kode aktivasi member) ---------- */
const generateCode = (existingCodes = []) => {
  const seg = (n) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  };
  for (let i = 0; i < 50; i++) {
    const c = `MSR-${seg(4)}-${seg(4)}`;
    if (!existingCodes.includes(c)) return c;
  }
  return `MSR-${seg(4)}-${seg(4)}`;
};

/* ---------- Login Google (Supabase Auth) ----------
   Identitas = akun Google. Server (/api/login) menerjemahkan token Google jadi member.
   `madad_session` tetap berbentuk {code, name, ...} supaya semua halaman lama tetap jalan.
   authState.status: loading | signed_out | member | needs_activation | inactive */

let authState = { status: "loading", email: null };
const getAuthState = () => authState;
const setAuthState = (next) => {
  authState = next;
  window.dispatchEvent(new Event("madad:refresh"));
};

const readSessionRaw = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || "null"); }
  catch { return null; }
};

const applyMember = async (member) => {
  const prev = readSessionRaw();
  const previousCode = prev?.code || localStorage.getItem(STORAGE_KEYS.LEGACY_CODE);
  if (previousCode && previousCode !== member.code) {
    USER_DATA_KEYS.forEach(k => localStorage.removeItem(k));
  }
  const firstSignIn = !prev || prev.code !== member.code;

  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({
    code:              member.code,
    name:              member.name,
    email:             member.email,
    loggedInAt:        firstSignIn ? new Date().toISOString() : prev.loggedInAt,
    authVersion:       2,
    supabaseValidated: true,
  }));
  localStorage.removeItem(STORAGE_KEYS.LEGACY_CODE);

  if (firstSignIn) await sbPullAllUserData().catch(e => console.warn("Pull failed:", e.message));
  setAuthState({ status: "member", email: member.email });
};

const redeemMemberCode = async (code, token) => {
  try {
    const res = await authFetch("/api/login?action=redeem", {
      method: "POST",
      body: JSON.stringify({ code: (code || "").trim().toUpperCase() }),
    }, token);
    const data = await res.json();
    if (data.ok) { await applyMember(data.member); return { ok: true }; }
    return { ok: false, status: data.status || "error" };
  } catch {
    return { ok: false, status: "error" };
  }
};

const syncMemberSession = async (supaSession) => {
  if (!supaSession) {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    setAuthState({ status: "signed_out", email: null });
    return;
  }
  const email = supaSession.user?.email || null;
  const token = supaSession.access_token;

  try {
    const res  = await authFetch("/api/login?action=session", { method: "POST", body: "{}" }, token);
    const data = await res.json();

    if (data.ok) return await applyMember(data.member);

    if (data.status === "not_member") {
      // Member lama dari login-kode: coba tautkan kode lamanya otomatis.
      const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_CODE);
      let legacyError = null;
      if (legacy) {
        const r = await redeemMemberCode(legacy, token);
        if (r.ok) return;
        legacyError = r.status;
        localStorage.removeItem(STORAGE_KEYS.LEGACY_CODE);
      }
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      setAuthState({ status: "needs_activation", email, prefillCode: legacy, lastError: legacyError });
      return;
    }

    if (data.status === "disabled" || data.status === "expired") {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      setAuthState({ status: "inactive", email, reason: data.status });
      return;
    }

    // Server/jaringan bermasalah: jangan logout member yang sesinya masih ada.
    setAuthState({ status: readSessionRaw() ? "member" : "signed_out", email });
  } catch {
    setAuthState({ status: readSessionRaw() ? "member" : "signed_out", email });
  }
};

let syncQueue = Promise.resolve();
const queueSync = (supaSession) => {
  syncQueue = syncQueue.then(() => syncMemberSession(supaSession));
  return syncQueue;
};

// Buang ?code=… sisa callback OAuth dari URL (hash route tetap dipertahankan).
const cleanOAuthParams = () => {
  const url = new URL(window.location.href);
  const keys = ["code", "state", "error", "error_code", "error_description"];
  if (!keys.some(k => url.searchParams.has(k))) return;
  keys.forEach(k => url.searchParams.delete(k));
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
};

whenSupabaseReady()
  .then(client => {
    client.auth.onAuthStateChange((event, supaSession) => {
      if (event === "TOKEN_REFRESHED") return;
      cleanOAuthParams();
      // Ditunda: supabase-js melarang memanggil API auth lain di dalam callback ini.
      setTimeout(() => queueSync(supaSession), 0);
    });
  })
  .catch(() => setAuthState({ status: readSessionRaw() ? "member" : "signed_out", email: null }));

const signInWithGoogle = async () => {
  const client = await whenSupabaseReady();
  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + "/", queryParams: { prompt: "select_account" } },
  });
  if (error) throw error;
};

const logout = async () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  setAuthState({ status: "signed_out", email: null });
  try {
    const client = await whenSupabaseReady();
    await client.auth.signOut();
  } catch {}
};

const getSession = () => {
  const s = readSessionRaw();
  if (!s) return null;
  if (s.authVersion === 2 && s.code) return s;
  // Sesi lama (login pakai kode): simpan kodenya untuk aktivasi otomatis setelah login Google.
  if (s.code) localStorage.setItem(STORAGE_KEYS.LEGACY_CODE, s.code);
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  return null;
};

/* ---------- Profile ---------- */
const migrateProfile = (profile) => {
  if (!profile) return profile;
  if (profile.field && !profile.faculty) {
    const map = { syariah: "syariah", bahasa: "lughah", ushuluddin: "ushuluddin", kedokteran: "umum", teknik: "umum", lainnya: "umum" };
    profile.faculty = map[profile.field] || "umum";
  }
  if (!profile.level) profile.level = "1";
  return profile;
};

const getProfile = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const profile = raw ? JSON.parse(raw) : null;
    return migrateProfile(profile);
  } catch (e) { return null; }
};
const saveProfile = (profile) => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  if (typeof sbSaveProfile !== "undefined") sbSaveProfile(profile).catch(() => {});
};
const clearProfile = () => {
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
};

/* ---------- Progress ---------- */
const getProgress = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return raw ? JSON.parse(raw) : { modules: {}, lastActivity: null };
  } catch (e) { return { modules: {}, lastActivity: null }; }
};
const saveProgress = (progress) => {
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  sbSaveProgress(progress).catch(() => {});
};
const markModuleComplete = (pathId, moduleId) => {
  const p = getProgress();
  p.modules = p.modules || {};
  p.modules[`${pathId}.${moduleId}`] = { completed: true, completedAt: new Date().toISOString() };
  saveProgress(p);
};
const setLastActivity = (label, pathId, moduleId) => {
  const p = getProgress();
  p.lastActivity = { label, pathId, moduleId, ts: new Date().toISOString() };
  saveProgress(p);
};

const computePathProgress = (pathId) => {
  const path = LEARNING_PATHS.find(p => p.id === pathId);
  if (!path) return 0;
  const progress = getProgress();
  const done = path.modules.filter(m => progress.modules?.[`${pathId}.${m.id}`]?.completed).length;
  return Math.round((done / path.modules.length) * 100);
};

const computeStage = () => {
  const progress = getProgress();
  const totalDone = Object.keys(progress.modules || {}).filter(k => progress.modules[k]?.completed).length;
  if (totalDone < 3) return { id: "starting", icon: "🌱", label: "Baru mulai" };
  if (totalDone < 8) return { id: "growing", icon: "🌿", label: "Bertumbuh" };
  return { id: "ready", icon: "🕌", label: "Siap menjelajah" };
};

/* ---------- Admin auth ---------- */
const isAdminLoggedIn = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN) || "false");
  } catch (e) { return false; }
};
const setAdminLoggedIn = (v) => {
  localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(!!v));
};

/* ---------- React hook for session state ---------- */

const useAuth = () => {
  const [session,       setSession]       = useState(getSession());
  const [profile,       setProfileState]  = useState(getProfile());
  const [progress,      setProgressState] = useState(getProgress());
  const [auth,          setAuth]          = useState(getAuthState());

  const fireRefresh = () => window.dispatchEvent(new Event("madad:refresh"));

  const syncFromStorage = useCallback(() => {
    setSession(getSession());
    setProfileState(getProfile());
    setProgressState(getProgress());
    setAuth(getAuthState());
  }, []);

  useEffect(() => {
    window.addEventListener("storage",       syncFromStorage);
    window.addEventListener("madad:refresh", syncFromStorage);
    return () => {
      window.removeEventListener("storage",       syncFromStorage);
      window.removeEventListener("madad:refresh", syncFromStorage);
    };
  }, [syncFromStorage]);

  return {
    session, profile, progress,
    authStatus: auth.status,
    authInfo:   auth,
    signInWithGoogle,
    redeemCode: redeemMemberCode,
    logout: () => { logout(); setSession(null); setProfileState(null); setProgressState(null); fireRefresh(); },
    saveProfile: (p) => { saveProfile(p); fireRefresh(); },
    clearProfile: () => { clearProfile(); fireRefresh(); },
    markModuleComplete: (pathId, mId) => { markModuleComplete(pathId, mId); fireRefresh(); },
    setLastActivity: (label, pathId, moduleId) => { setLastActivity(label, pathId, moduleId); fireRefresh(); },
    refresh: fireRefresh,
  };
};

/* ---------- Notes (Kurasah) ---------- */
const loadNotes = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
};
const saveNotes = (notes, changedNoteId = null) => {
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  window.dispatchEvent(new Event("madad:refresh"));
  if (changedNoteId) {
    // Hanya sync note yang berubah — 1 request saja
    const changedNote = notes.find(n => n.id === changedNoteId);
    if (changedNote) sbSaveNote(changedNote).catch(() => {});
  } else {
    // Sync semua, stagger supaya tidak flood Supabase
    notes.forEach((n, i) => {
      setTimeout(() => sbSaveNote(n).catch(() => {}), i * 150);
    });
  }
};

/* ---------- Maddah Activity Tracking ---------- */
const loadMaddahActivity = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.MADDAH_ACTIVITY)) || {}; }
  catch { return {}; }
};

const saveMaddahActivity = (activity) => {
  localStorage.setItem(STORAGE_KEYS.MADDAH_ACTIVITY, JSON.stringify(activity));
  if (typeof sbSaveMaddahActivity !== "undefined") sbSaveMaddahActivity(activity).catch(() => {});
};

const trackMaddahOpen = (maddahId) => {
  const activity = loadMaddahActivity();
  if (!activity[maddahId]) activity[maddahId] = { opens: 0, promptsCopied: 0, lastOpen: null };
  activity[maddahId].opens += 1;
  activity[maddahId].lastOpen = new Date().toISOString();
  saveMaddahActivity(activity);
};

const trackPromptCopied = (maddahId) => {
  const activity = loadMaddahActivity();
  if (!activity[maddahId]) activity[maddahId] = { opens: 0, promptsCopied: 0, lastOpen: null };
  activity[maddahId].promptsCopied += 1;
  saveMaddahActivity(activity);
};

/* ============ EXPORTS ============ */
Object.assign(window, {
  STORAGE_KEYS,
  isAdminLoggedIn, setAdminLoggedIn,
  generateCode,
  signInWithGoogle, redeemMemberCode, getAuthState,
  useAuth, getSession,
  getProfile, saveProfile, clearProfile,
  getProgress, saveProgress, markModuleComplete, setLastActivity,
  computePathProgress, computeStage,
  loadNotes, saveNotes,
  loadMaddahActivity, trackMaddahOpen, trackPromptCopied,
});
