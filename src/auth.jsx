import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
/* Talqih, auth system, profile, progress, single-device policy */

// NOTE: Storage keys tetap pakai prefix 'madad_' untuk backward compatibility
// dengan user yang sudah punya data dari versi sebelumnya.
// Tidak perlu di-rename ke 'talqih_'.
const STORAGE_KEYS = {
  SESSION:          "madad_session",
  PROFILE:          "madad_profile",
  PROGRESS:         "madad_progress",
  DEVICE:           "madad_device",
  MEMBERS:          "madad_members",
  ADMIN:            "madad_admin",
  NOTES:            "madad_notes",
  MUQARANAH_CUSTOM: "madad_muqaranah_custom",
  INTENTIONS:       "madad_intentions",
  PRESENCE:         "madad_presence",
  MADDAH_ACTIVITY:  "talqee_maddah_activity",
};

/* ---------- Device ID ---------- */
const getDeviceId = () => {
  let id = localStorage.getItem(STORAGE_KEYS.DEVICE);
  if (!id) {
    id = "dev_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(STORAGE_KEYS.DEVICE, id);
  }
  return id;
};
const getDeviceLabel = () => {
  const ua = navigator.userAgent;
  let kind = "Browser";
  if (/iPhone|iPad/.test(ua)) kind = "iOS";
  else if (/Android/.test(ua)) kind = "Android";
  else if (/Mac/.test(ua)) kind = "Mac";
  else if (/Windows/.test(ua)) kind = "Windows";
  else if (/Linux/.test(ua)) kind = "Linux";
  return kind;
};

/* ---------- Members pool (admin-managed) ---------- */
const loadMembers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(DEFAULT_MEMBERS));
      return [...DEFAULT_MEMBERS];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [...DEFAULT_MEMBERS];
  }
};
const saveMembers = (members) => {
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
};

const findMember = (code) => {
  const members = loadMembers();
  return members.find(m => m.code.toUpperCase().trim() === code.toUpperCase().trim());
};

/* ---------- Code generation ---------- */
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

/* ---------- Login flow ---------- */
const LOGIN_RESULT = {
  OK: "ok",
  NOT_FOUND: "not_found",
  EXPIRED: "expired",
  DISABLED: "disabled",
  DEVICE_CONFLICT: "device_conflict",
};

const tryLogin = async (code, { forceTakeover = false } = {}) => {
  const deviceId    = getDeviceId();
  const deviceLabel = getDeviceLabel();

  let member = null;
  try {
    member = await sbGetMemberByCode(code);
  } catch (err) {
    console.warn("Supabase unreachable, fallback ke localStorage:", err.message);
    const all = sbGetAllMembersFallback();
    member = all.find(m => m.code === code.trim().toUpperCase()) || null;
  }

  if (!member) return { ok: false, status: LOGIN_RESULT.NOT_FOUND };
  if (member.status === "disabled") return { ok: false, status: LOGIN_RESULT.DISABLED, member };
  if (member.status === "expired")  return { ok: false, status: LOGIN_RESULT.EXPIRED, member };

  if (member.deviceId && member.deviceId !== deviceId && !forceTakeover) {
    return { ok: false, status: LOGIN_RESULT.DEVICE_CONFLICT, member };
  }

  try {
    await sbBindDevice(member.code, deviceId, deviceLabel);
  } catch (err) {
    console.warn("Tidak bisa update device ke Supabase:", err.message);
    const all = sbGetAllMembersFallback();
    const idx = all.findIndex(m => m.code === member.code);
    if (idx !== -1) {
      all[idx] = { ...all[idx], device: deviceLabel, deviceId, lastLogin: new Date().toISOString() };
      localStorage.setItem("madad_members", JSON.stringify(all));
    }
  }

  const session = {
    code: member.code,
    name: member.name,
    deviceId,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  // Tarik data user dari Supabase ke localStorage (background, non-blocking)
  sbPullAllUserData().catch(e => console.warn("Pull failed:", e.message));
  return { ok: true, status: LOGIN_RESULT.OK, member, session };
};

const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
};

const getSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    const s = JSON.parse(raw);

    // Fast path: cek di localStorage dulu
    const member = findMember(s.code);

    // Member tidak ada di localStorage — kemungkinan device baru / localStorage bersih
    // Izinkan session, validasi async di useAuth() akan konfirmasi ke Supabase
    if (!member) {
      if (s.supabaseValidated) return s;
      return { ...s, needsValidation: true };
    }

    if (member.status !== "active") {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      return null;
    }
    // If device was reset by admin or another device took over
    if (member.deviceId && member.deviceId !== s.deviceId) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      return null;
    }
    return s;
  } catch (e) { return null; }
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
  const [loginLoading,  setLoginLoading]  = useState(false);

  const fireRefresh = () => window.dispatchEvent(new Event("madad:refresh"));

  const syncFromStorage = useCallback(() => {
    setSession(getSession());
    setProfileState(getProfile());
    setProgressState(getProgress());
  }, []);

  useEffect(() => {
    window.addEventListener("storage",       syncFromStorage);
    window.addEventListener("madad:refresh", syncFromStorage);
    return () => {
      window.removeEventListener("storage",       syncFromStorage);
      window.removeEventListener("madad:refresh", syncFromStorage);
    };
  }, [syncFromStorage]);

  // Background Supabase session validation (non-blocking)
  useEffect(() => {
    const s = getSession();
    if (!s) return;
    (async () => {
      try {
        const member = await sbGetMemberByCode(s.code);
        if (!member || member.status === "disabled") {
          logout();
          setSession(null);
          setProfileState(null);
          setProgressState(null);
          fireRefresh();
        } else if (member.deviceId && member.deviceId !== s.deviceId) {
          logout();
          setSession(null);
          setProfileState(null);
          setProgressState(null);
          fireRefresh();
        } else if (s.needsValidation) {
          // Session valid di Supabase — tandai & simpan member ke localStorage
          const updatedSession = { ...s, supabaseValidated: true, needsValidation: false };
          localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedSession));
          setSession(updatedSession);
          const currentMembers = loadMembers();
          if (!currentMembers.find(m => m.code === member.code)) {
            saveMembers([...currentMembers, {
              code: member.code,
              status: member.status,
              deviceId: member.deviceId,
              name: s.name || member.code,
            }]);
          }
        }
      } catch (e) {
        // Supabase offline — kalau butuh validasi, beri benefit of doubt
        if (s.needsValidation) {
          const updatedSession = { ...s, supabaseValidated: true, needsValidation: false };
          localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedSession));
          setSession(updatedSession);
        }
      }
    })();
  }, []);

  const login = async (code, opts) => {
    setLoginLoading(true);
    try {
      const r = await tryLogin(code, opts);
      if (r.ok) {
        setSession(getSession());
        setProfileState(getProfile());
        setProgressState(getProgress());
        fireRefresh();
      }
      return r;
    } finally {
      setLoginLoading(false);
    }
  };

  return {
    session, profile, progress, loginLoading,
    login,
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
  STORAGE_KEYS, LOGIN_RESULT,
  getDeviceId, getDeviceLabel,
  loadMembers, saveMembers, findMember, generateCode,
  tryLogin, logout, getSession,
  getProfile, saveProfile, clearProfile,
  getProgress, saveProgress, markModuleComplete, setLastActivity,
  computePathProgress, computeStage,
  isAdminLoggedIn, setAdminLoggedIn,
  loadNotes, saveNotes,
  loadMaddahActivity, trackMaddahOpen, trackPromptCopied,
  useAuth,
});
