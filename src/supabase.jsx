/* Talqee — Supabase Client & Member API (Fase 1)
   Member management via Supabase. Data user pribadi tetap localStorage.
*/

const SUPABASE_URL      = "https://rhgecuchhkrcwuxenrfb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZ2VjdWNoaGtyY3d1eGVucmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Njg1NDcsImV4cCI6MjA5NTU0NDU0N30.5bAzm8NHKYiHa6qtdn4jlJffF7m_MPZDhIWPTCUGZr0";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ── Status check ── */
const checkSupabase = async () => {
  try {
    const { error } = await _supabase.from("members").select("id").limit(1);
    return !error;
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
  const { data, error } = await _supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(sbToMember);
};

const sbGetMemberByCode = async (code) => {
  const { data, error } = await _supabase
    .from("members")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return sbToMember(data);
};

const sbAddMember = async (member) => {
  const row = memberToSb(member);
  const { data, error } = await _supabase
    .from("members")
    .insert([row])
    .select()
    .single();
  if (error) throw error;
  return sbToMember(data);
};

const sbUpdateMember = async (code, updates) => {
  const row = memberToSb(updates);
  const { data, error } = await _supabase
    .from("members")
    .update(row)
    .eq("code", code)
    .select()
    .single();
  if (error) throw error;
  return sbToMember(data);
};

const sbDeleteMember = async (code) => {
  const { error } = await _supabase.from("members").delete().eq("code", code);
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
  _supabase,
  checkSupabase,
  sbGetAllMembers,
  sbGetMemberByCode,
  sbAddMember,
  sbUpdateMember,
  sbDeleteMember,
  sbBindDevice,
  sbResetDevice,
  sbGetAllMembersFallback,
});
