-- 人生报告历史会话表（登录用户跨设备同步）
-- 每条历史 = 一份人生报告（生辰+总览+5章节+多个聊天）
-- 生辰/sections/chats 用 JSON 列存整体（历史是产出物，不需跨功能复用字段）
CREATE TABLE IF NOT EXISTS life_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  name TEXT,                          -- 用户自定义名称（NULL 则前端显示生辰摘要）
  birth TEXT NOT NULL,                -- 生辰 JSON {year,month,day,hour,minute,gender,birthplace,useSolarTime,focus}
  overview TEXT,                      -- 本命总览内容
  sections TEXT,                      -- 5章节 JSON {career,wealth,marriage,health,trend} 值为 string|null
  chats TEXT,                         -- 聊天数组 JSON [[{role,content,timestamp},...],...]
  active_chat_index INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_life_history_user_id ON life_history(user_id);
