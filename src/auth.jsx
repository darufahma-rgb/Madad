/* Madad, auth system, profile, progress, single-device policy */

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

const tryLogin = (code, { forceTakeover = false } = {}) => {
  const member = findMember(code);
  if (!member) return { ok: false, status: LOGIN_RESULT.NOT_FOUND };
  if (member.status === "disabled") return { ok: false, status: LOGIN_RESULT.DISABLED, member };
  if (member.status === "expired") return { ok: false, status: LOGIN_RESULT.EXPIRED, member };

  const deviceId = getDeviceId();
  const deviceLabel = getDeviceLabel();

  // Single device policy
  if (member.device && member.deviceId && member.deviceId !== deviceId && !forceTakeover) {
    return { ok: false, status: LOGIN_RESULT.DEVICE_CONFLICT, member };
  }

  // Bind device
  const members = loadMembers();
  const idx = members.findIndex(m => m.code === member.code);
  if (idx >= 0) {
    members[idx] = { ...members[idx], device: deviceLabel, deviceId, lastLogin: new Date().toISOString() };
    saveMembers(members);
  }

  const session = {
    code: member.code,
    name: member.name,
    deviceId,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
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
    // Validate session still matches member record (device not reset by admin)
    const member = findMember(s.code);
    if (!member || member.status !== "active") {
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
const getProfile = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return raw ? JSON.parse(raw) : null;
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
  if (totalDone < 8) return { id: "growing", icon: "⚡", label: "Bertumbuh" };
  return { id: "ready", icon: "🚀", label: "AI-ready" };
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
const { useState: useStateAuth, useEffect: useEffectAuth, useCallback: useCallbackAuth } = React;

const useAuth = () => {
  const [session, setSession] = useStateAuth(getSession());
  const [profile, setProfileState] = useStateAuth(getProfile());
  const [progress, setProgressState] = useStateAuth(getProgress());

  const refresh = useCallbackAuth(() => {
    setSession(getSession());
    setProfileState(getProfile());
    setProgressState(getProgress());
  }, []);

  useEffectAuth(() => {
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("madad:refresh", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("madad:refresh", onStorage);
    };
  }, [refresh]);

  const fireRefresh = () => window.dispatchEvent(new Event("madad:refresh"));

  return {
    session, profile, progress,
    login: (code, opts) => { const r = tryLogin(code, opts); if (r.ok) fireRefresh(); return r; },
    logout: () => { logout(); fireRefresh(); },
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
const saveNotes = (notes) => {
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  window.dispatchEvent(new Event("madad:refresh"));
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
  useAuth,
});
