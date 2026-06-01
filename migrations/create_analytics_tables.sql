-- Run this in your Supabase Dashboard → SQL Editor
-- Adds user_profiles and user_maddah_activity tables for admin analytics

CREATE TABLE IF NOT EXISTS user_profiles (
  member_code text PRIMARY KEY,
  profile     jsonb NOT NULL DEFAULT '{}',
  updated_at  timestamptz DEFAULT now()
);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_user_profiles" ON user_profiles FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS user_maddah_activity (
  member_code    text NOT NULL,
  maddah_id      text NOT NULL,
  opens          integer DEFAULT 0,
  prompts_copied integer DEFAULT 0,
  last_open      timestamptz,
  updated_at     timestamptz DEFAULT now(),
  PRIMARY KEY (member_code, maddah_id)
);
ALTER TABLE user_maddah_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_maddah_activity" ON user_maddah_activity FOR ALL USING (true) WITH CHECK (true);
