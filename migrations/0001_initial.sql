-- Users 表（替代 data/users.json）
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  last_login_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Feedback 表（替代 data/feedback.json）
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  contact TEXT,
  user_agent TEXT,
  url TEXT,
  timestamp INTEGER,
  client_ip TEXT,
  server_timestamp INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_server_timestamp ON feedback(server_timestamp DESC);

-- 八字档案表（替代 data/bazi-profiles.json）
CREATE TABLE IF NOT EXISTS bazi_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  input_mode TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_bazi_profiles_user_id ON bazi_profiles(user_id);
