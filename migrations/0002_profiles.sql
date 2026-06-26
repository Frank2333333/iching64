-- 通用人物档案表（八字/紫微等全平台共用，以生辰为核心）
-- 替代 bazi_profiles 的单一功能档案；生辰字段提取为独立列，便于跨功能复用
-- 旧 bazi_profiles 表保留作备份，不 DROP
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  input_mode TEXT NOT NULL,            -- 'birthdate'（全平台）| 'pillars'（仅八字）
  gender TEXT,                         -- 'male' | 'female'
  year INTEGER,
  month INTEGER,
  day INTEGER,
  hour INTEGER,
  minute INTEGER,
  birthplace TEXT,
  use_solar_time INTEGER DEFAULT 0,    -- 0/1
  pillars TEXT,                        -- 直接四柱 JSON: {"year","month","day","hour"}
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- 从 bazi_profiles 迁移旧档案
-- birthdate 模式：从 data JSON 提取生辰字段
INSERT OR IGNORE INTO profiles
  (id, user_id, name, input_mode, gender, year, month, day, hour, minute, birthplace, use_solar_time, pillars, created_at)
SELECT
  id, user_id, name, 'birthdate',
  json_extract(data, '$.gender'),
  json_extract(data, '$.year'),
  json_extract(data, '$.month'),
  json_extract(data, '$.day'),
  json_extract(data, '$.hour'),
  json_extract(data, '$.minute'),
  json_extract(data, '$.birthplace'),
  CASE WHEN json_extract(data, '$.useSolarTime') = 1 THEN 1 ELSE 0 END,
  NULL,
  created_at
FROM bazi_profiles
WHERE input_mode = 'birthdate';

-- pillars 模式：提取四柱
INSERT OR IGNORE INTO profiles
  (id, user_id, name, input_mode, pillars, created_at)
SELECT
  id, user_id, name, 'pillars',
  json_extract(data, '$.pillars'),
  created_at
FROM bazi_profiles
WHERE input_mode = 'pillars';
