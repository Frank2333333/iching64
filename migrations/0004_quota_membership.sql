-- 会员与配额体系
-- 1) users 加会员字段（plan/到期/订单）
-- 2) usage_daily 每用户每天用量计数（报告/对话）
-- 3) orders 订单表（支付渠道预留，本次不接具体第三方）

-- ============ users 扩展 ============
ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';        -- 'free' | 'member'
ALTER TABLE users ADD COLUMN member_expires_at INTEGER;                -- 会员到期时间戳(ms)，NULL=从未开通过
ALTER TABLE users ADD COLUMN member_order_id TEXT;                     -- 最近一次开通订单ID

-- ============ 每日用量计数 ============
CREATE TABLE IF NOT EXISTS usage_daily (
  user_id TEXT NOT NULL,
  day TEXT NOT NULL,                    -- 'YYYY-MM-DD'（UTC+8）
  report_count INTEGER NOT NULL DEFAULT 0,  -- 人生报告生成次数(overview触发)
  chat_count INTEGER NOT NULL DEFAULT 0,    -- 所有AI对话次数(追问/解卦/八字紫微解读/经典/章节)
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, day)
);
CREATE INDEX IF NOT EXISTS idx_usage_daily_user ON usage_daily(user_id);

-- ============ 订单表（支付预留）============
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,                  -- 订单号
  user_id TEXT NOT NULL,
  plan TEXT NOT NULL,                   -- 'monthly' | 'yearly'
  amount INTEGER NOT NULL,              -- 金额(分)
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending'|'paid'|'failed'|'expired'
  created_at INTEGER NOT NULL,
  paid_at INTEGER,
  channel TEXT,                         -- 支付渠道 'alipay' 等，预留
  channel_order_id TEXT,                -- 第三方订单号，预留
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
