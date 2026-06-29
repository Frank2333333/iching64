/**
 * Cloudflare Pages Functions — Hono catch-all 路由
 * 替代整个 Express 应用（server/api.cjs）
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { signJWT, verifyJWT } from '../../server-workers/utils/auth';
import { getAIDivination, chatWithAI } from '../../server-workers/services/divination-ai';
import { getBaziFortune, chatWithBazi } from '../../server-workers/services/bazi-ai';
import { getZiweiFortune, chatWithZiwei } from '../../server-workers/services/ziwei-ai';
import { interpretParagraph } from '../../server-workers/services/classics-ai';
import { getLifeReportOverview, getLifeReportSection, chatWithLifeReport, getDailyFortune, type SectionType } from '../../server-workers/services/life-report-ai';

// ==================== 类型定义 ====================

type Bindings = {
  DB: D1Database;
  AUTH_KV: KVNamespace;
  JWT_SECRET: string;
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  OPENAI_BASE_URL: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
};

type Variables = {
  userId: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ==================== 中间件 ====================

app.use('*', cors());
app.use('*', async (c, next) => {
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`);
  await next();
});

// ==================== JWT 认证中间件 ====================

const authMiddleware = async (c: any, next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: '未登录' }, 401);
  }
  const token = authHeader.substring(7);
  try {
    const decoded = await verifyJWT(token, c.env.JWT_SECRET || 'fallback-secret');
    c.set('userId', decoded.userId);
    await next();
  } catch {
    return c.json({ success: false, error: '登录已过期' }, 401);
  }
};

// ==================== 配额与会员体系 ====================

// 等级额度（后台可调：改这里即生效）
const QUOTA = {
  free:   { profiles: 3, reportPerDay: 1, chatPerDay: 10 },
  member: { profiles: 5, reportPerDay: 3, chatPerDay: 30 },
  admin:  { profiles: Infinity, reportPerDay: Infinity, chatPerDay: Infinity }, // 站长/内部账号，无限制
};
// 会员价格（分，后台可调）
const PLAN_PRICE: Record<string, number> = { monthly: 1900, yearly: 12800 };

/** 当天日期串（UTC+8），用于按天计数与跨天重置 */
function getTodayDay(): string {
  const now = new Date();
  const utc8 = new Date(now.getTime() + 8 * 3600 * 1000);
  const y = utc8.getUTCFullYear();
  const m = String(utc8.getUTCMonth() + 1).padStart(2, '0');
  const d = String(utc8.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 判定用户当前有效等级：admin 永久无限制；member 且未过期 → member；否则 free（过期自动降级，不删字段） */
function effectivePlan(user: { plan?: string; member_expires_at?: number | null }): 'free' | 'member' | 'admin' {
  if (user?.plan === 'admin') return 'admin';
  if (user?.plan === 'member' && user?.member_expires_at && user.member_expires_at > Date.now()) {
    return 'member';
  }
  return 'free';
}

/** 取当日用量 {report, chat}，无记录返回 0 */
async function getDailyUsage(db: D1Database, userId: string): Promise<{ report: number; chat: number }> {
  const day = getTodayDay();
  const row = await db.prepare('SELECT report_count, chat_count FROM usage_daily WHERE user_id = ? AND day = ?').bind(userId, day).first();
  return { report: (row?.report_count as number) || 0, chat: (row?.chat_count as number) || 0 };
}

/** 用量+1（report 或 chat）。成功后调用，避免失败请求也计数 */
async function incrUsage(db: D1Database, userId: string, type: 'report' | 'chat'): Promise<void> {
  const day = getTodayDay();
  const col = type === 'report' ? 'report_count' : 'chat_count';
  await db.prepare(
    `INSERT INTO usage_daily (user_id, day, report_count, chat_count, updated_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, day) DO UPDATE SET ${col} = ${col} + 1, updated_at = ?`
  ).bind(userId, day, type === 'report' ? 1 : 0, type === 'chat' ? 1 : 0, Date.now(), Date.now()).run();
}

/** 配额中间件：需先挂 authMiddleware。检查当日用量是否超限，超限返回 403 */
const quotaMiddleware = (type: 'report' | 'chat') => async (c: any, next: () => Promise<void>) => {
  const userId = c.get('userId') as string;
  const user = await c.env.DB.prepare('SELECT plan, member_expires_at FROM users WHERE id = ?').bind(userId).first();
  if (!user) return c.json({ success: false, error: '用户不存在' }, 401);
  const plan = effectivePlan(user as any);
  const limit = QUOTA[plan][type === 'report' ? 'reportPerDay' : 'chatPerDay'];
  const usage = await getDailyUsage(c.env.DB, userId);
  const used = type === 'report' ? usage.report : usage.chat;
  if (used >= limit) {
    return c.json({
      success: false,
      error: type === 'report' ? '今日报告生成额度已用完，明日重置' : '今日对话额度已用完，明日重置',
      code: 'QUOTA_EXCEEDED',
      quota: { type, used, limit, plan },
    }, 403);
  }
  // 注入 plan 供路由内计数参考
  c.set('userPlan', plan);
  await next();
};


// ==================== 健康检查 ====================

app.get('/api/health', (c) => {
  const aiEnabled = !!(c.env.OPENAI_API_KEY && c.env.OPENAI_API_KEY !== 'your-openai-api-key-here');
  return c.json({
    success: true,
    status: 'ok',
    timestamp: Date.now(),
    services: {
      feedback: true,
      aiDivination: aiEnabled,
      baziAI: aiEnabled,
      ziweiAI: aiEnabled,
      classicsAI: aiEnabled,
    },
  });
});

// ==================== 反馈 API ====================

app.get('/api/feedback', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM feedback ORDER BY server_timestamp DESC'
    ).all();
    return c.json({ success: true, data: results });
  } catch (error) {
    console.error('获取反馈失败:', error);
    return c.json({ success: false, error: '获取反馈失败' }, 500);
  }
});

app.post('/api/feedback', async (c) => {
  try {
    const { type, content, contact, userAgent, url, timestamp } = await c.req.json();

    if (!type || !content) {
      return c.json({ success: false, error: '反馈类型和内容不能为空' }, 400);
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const clientIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    const serverTimestamp = Date.now();

    await c.env.DB.prepare(
      'INSERT INTO feedback (id, type, content, contact, user_agent, url, timestamp, client_ip, server_timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id, type, content.trim(), contact?.trim() ?? null,
      userAgent ?? c.req.header('user-agent') ?? null, url ?? c.req.header('referer') ?? null,
      timestamp ?? Date.now(), clientIP, serverTimestamp
    ).run();

    return c.json({
      success: true,
      data: { id, type, content: content.trim(), contact, userAgent, url, timestamp, clientIP, serverTimestamp },
    });
  } catch (error) {
    console.error('提交反馈失败:', error);
    return c.json({ success: false, error: '提交反馈失败' }, 500);
  }
});

app.delete('/api/feedback', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM feedback').run();
    return c.json({ success: true, message: '所有反馈已清空' });
  } catch (error) {
    console.error('清空反馈失败:', error);
    return c.json({ success: false, error: '清空反馈失败' }, 500);
  }
});

app.delete('/api/feedback/:id', async (c) => {
  try {
    const { id } = c.req.param();
    await c.env.DB.prepare('DELETE FROM feedback WHERE id = ?').bind(id).run();
    return c.json({ success: true, message: '反馈已删除' });
  } catch (error) {
    console.error('删除反馈失败:', error);
    return c.json({ success: false, error: '删除反馈失败' }, 500);
  }
});

// ==================== AI 解卦 API ====================

app.post('/api/divination/ai', authMiddleware, quotaMiddleware('chat'), async (c) => {
  try {
    const divinationData = await c.req.json();

    if (!divinationData || !divinationData.gua) {
      return c.json({ success: false, error: '解卦数据不完整，缺少本卦信息' }, 400);
    }

    if (!c.env.OPENAI_API_KEY || c.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return c.json({ success: false, error: 'AI 解卦服务未配置，请在服务器配置 OpenAI API Key' }, 503);
    }

    console.log(`[API] AI 解卦请求: ${divinationData.gua?.name || 'unknown'}`);
    const aiResult = await getAIDivination(divinationData, c.env);
    await incrUsage(c.env.DB, c.get('userId'), 'chat');

    return c.json({
      success: true,
      data: { interpretation: aiResult, model: c.env.OPENAI_MODEL || 'gpt-4o-mini', timestamp: Date.now() },
    });
  } catch (error: unknown) {
    console.error('AI 解卦失败:', error);
    const msg = (error as Error).message || 'AI 解卦服务暂时不可用';
    return c.json({ success: false, error: msg }, 500);
  }
});

app.post('/api/divination/chat', authMiddleware, quotaMiddleware('chat'), async (c) => {
  try {
    const { message, divinationData, history } = await c.req.json();

    if (!message || !message.trim()) {
      return c.json({ success: false, error: '消息内容不能为空' }, 400);
    }
    if (!divinationData || !divinationData.gua) {
      return c.json({ success: false, error: '解卦数据不完整' }, 400);
    }
    if (!c.env.OPENAI_API_KEY || c.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return c.json({ success: false, error: 'AI 对话服务未配置' }, 503);
    }

    console.log(`[API] AI 对话请求: ${divinationData.gua?.name || 'unknown'}`);
    const aiResult = await chatWithAI(
      { message: message.trim(), divinationData, history: history || [] },
      c.env,
    );
    await incrUsage(c.env.DB, c.get('userId'), 'chat');

    return c.json({
      success: true,
      data: { message: aiResult, model: c.env.OPENAI_MODEL || 'gpt-4o-mini', timestamp: Date.now() },
    });
  } catch (error: unknown) {
    console.error('AI 对话失败:', error);
    const msg = (error as Error).message || 'AI 对话服务暂时不可用';
    return c.json({ success: false, error: msg }, 500);
  }
});

// ==================== 八字排盘 API ====================

app.post('/api/bazi/ai', authMiddleware, quotaMiddleware('chat'), async (c) => {
  try {
    const input = await c.req.json();

    const hasPillars = input?.pillars && input.pillars.year && input.pillars.month && input.pillars.day && input.pillars.hour;
    const hasBirthdate = input?.year && input?.month && input?.day && input?.hour != null;

    if (!input || (!hasPillars && !hasBirthdate)) {
      return c.json({ success: false, error: '出生信息不完整，缺少年月日时；或直接输入八字需提供四柱信息' }, 400);
    }

    if (!c.env.OPENAI_API_KEY || c.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return c.json({ success: false, error: 'AI 八字排盘服务未配置' }, 503);
    }

    console.log(`[API] 八字排盘请求`);
    const aiResult = await getBaziFortune(input, c.env);
    await incrUsage(c.env.DB, c.get('userId'), 'chat');

    return c.json({
      success: true,
      data: { interpretation: aiResult, model: c.env.OPENAI_MODEL || 'gpt-4o-mini', timestamp: Date.now() },
    });
  } catch (error: unknown) {
    console.error('AI 八字排盘失败:', error);
    const msg = (error as Error).message || 'AI 八字排盘服务暂时不可用';
    return c.json({ success: false, error: msg }, 500);
  }
});

app.post('/api/bazi/chat', authMiddleware, quotaMiddleware('chat'), async (c) => {
  try {
    const { message, baziInput, history, initialInterpretationSummary } = await c.req.json();

    if (!message || !message.trim()) {
      return c.json({ success: false, error: '消息内容不能为空' }, 400);
    }
    if (!baziInput || (!baziInput.year && !baziInput.pillars)) {
      return c.json({ success: false, error: '命盘信息不完整' }, 400);
    }
    if (!c.env.OPENAI_API_KEY || c.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return c.json({ success: false, error: 'AI 对话服务未配置' }, 503);
    }

    console.log(`[API] 八字对话请求`);
    const aiResult = await chatWithBazi(
      { message: message.trim(), baziInput, history: history || [], initialInterpretationSummary },
      c.env,
    );
    await incrUsage(c.env.DB, c.get('userId'), 'chat');

    return c.json({
      success: true,
      data: { message: aiResult, model: c.env.OPENAI_MODEL || 'gpt-4o-mini', timestamp: Date.now() },
    });
  } catch (error: unknown) {
    console.error('AI 八字对话失败:', error);
    const msg = (error as Error).message || 'AI 对话服务暂时不可用';
    return c.json({ success: false, error: msg }, 500);
  }
});

// ==================== 紫微斗数 API ====================

app.post('/api/ziwei/ai', authMiddleware, quotaMiddleware('chat'), async (c) => {
  try {
    const input = await c.req.json();

    const hasBirthdate = input?.year && input?.month && input?.day && input?.hour != null;

    if (!input || (!hasBirthdate && !input.chart)) {
      return c.json({ success: false, error: '出生信息不完整，缺少年月日时' }, 400);
    }

    if (!c.env.OPENAI_API_KEY || c.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return c.json({ success: false, error: 'AI 紫微斗数服务未配置' }, 503);
    }

    console.log(`[API] 紫微斗数请求`);
    const aiResult = await getZiweiFortune(input, c.env);
    await incrUsage(c.env.DB, c.get('userId'), 'chat');

    return c.json({
      success: true,
      data: { interpretation: aiResult, model: c.env.OPENAI_MODEL || 'gpt-4o-mini', timestamp: Date.now() },
    });
  } catch (error: unknown) {
    console.error('AI 紫微斗数失败:', error);
    const msg = (error as Error).message || 'AI 紫微斗数服务暂时不可用';
    return c.json({ success: false, error: msg }, 500);
  }
});

app.post('/api/ziwei/chat', authMiddleware, quotaMiddleware('chat'), async (c) => {
  try {
    const { message, ziweiInput, history, initialInterpretationSummary } = await c.req.json();

    if (!message || !message.trim()) {
      return c.json({ success: false, error: '消息内容不能为空' }, 400);
    }
    if (!ziweiInput || (!ziweiInput.year && !ziweiInput.chart)) {
      return c.json({ success: false, error: '命盘信息不完整' }, 400);
    }
    if (!c.env.OPENAI_API_KEY || c.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return c.json({ success: false, error: 'AI 对话服务未配置' }, 503);
    }

    console.log(`[API] 紫微斗数对话请求`);
    const aiResult = await chatWithZiwei(
      { message: message.trim(), ziweiInput, history: history || [], initialInterpretationSummary },
      c.env,
    );
    await incrUsage(c.env.DB, c.get('userId'), 'chat');

    return c.json({
      success: true,
      data: { message: aiResult, model: c.env.OPENAI_MODEL || 'gpt-4o-mini', timestamp: Date.now() },
    });
  } catch (error: unknown) {
    console.error('AI 紫微斗数对话失败:', error);
    const msg = (error as Error).message || 'AI 对话服务暂时不可用';
    return c.json({ success: false, error: msg }, 500);
  }
});

// ==================== 经典文献 API ====================

app.post('/api/classics/ai', authMiddleware, quotaMiddleware('chat'), async (c) => {
  try {
    const { bookTitle, chapterTitle, text, question } = await c.req.json();

    if (!bookTitle || !chapterTitle || !text) {
      return c.json({ success: false, error: '经典文献信息不完整' }, 400);
    }

    if (!c.env.OPENAI_API_KEY || c.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return c.json({ success: false, error: 'AI 解读服务未配置' }, 503);
    }

    console.log(`[API] 经典文献解读请求: ${bookTitle} · ${chapterTitle}`);
    const aiResult = await interpretParagraph({ bookTitle, chapterTitle, text, question }, c.env);
    await incrUsage(c.env.DB, c.get('userId'), 'chat');

    return c.json({
      success: true,
      data: { interpretation: aiResult, model: c.env.OPENAI_MODEL || 'gpt-4o-mini', timestamp: Date.now() },
    });
  } catch (error: unknown) {
    console.error('经典文献解读失败:', error);
    const msg = (error as Error).message || 'AI 解读服务暂时不可用';
    return c.json({ success: false, error: msg }, 500);
  }
});

// ==================== 认证 API ====================

app.post('/api/auth/send-code', async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return c.json({ success: false, error: '请输入有效的邮箱地址' }, 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 存储到 KV，TTL 600 秒（10 分钟）
    await c.env.AUTH_KV.put(
      `verify:${normalizedEmail}`,
      JSON.stringify({ code, attempts: 0 }),
      { expirationTtl: 600 },
    );

    // 发送邮件
    if (c.env.RESEND_API_KEY && c.env.RESEND_API_KEY !== 'your-resend-api-key') {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(c.env.RESEND_API_KEY);
        await resend.emails.send({
          from: c.env.RESEND_FROM_EMAIL || 'IChing64 <noreply@iching64.fun>',
          to: normalizedEmail,
          subject: 'IChing64 验证码',
          html: `<p>您的验证码是：<strong>${code}</strong></p><p>有效期10分钟，请勿泄露。</p>`,
        });
      } catch (emailErr) {
        console.error('发送邮件失败:', emailErr);
      }
    } else {
      console.log(`[开发环境] 验证码: ${code} -> ${normalizedEmail}`);
    }

    return c.json({ success: true, message: '验证码已发送' });
  } catch (error) {
    console.error('发送验证码失败:', error);
    return c.json({ success: false, error: '发送失败' }, 500);
  }
});

app.post('/api/auth/verify-code', async (c) => {
  try {
    const { email, code } = await c.req.json();
    if (!email || !email.trim() || !code || !code.trim()) {
      return c.json({ success: false, error: '邮箱和验证码不能为空' }, 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const stored = await c.env.AUTH_KV.get(`verify:${normalizedEmail}`);

    if (!stored) {
      return c.json({ success: false, error: '验证码不存在或已过期' }, 400);
    }

    const record = JSON.parse(stored) as { code: string; attempts: number };

    if (record.attempts >= 5) {
      await c.env.AUTH_KV.delete(`verify:${normalizedEmail}`);
      return c.json({ success: false, error: '尝试次数过多，请重新获取验证码' }, 400);
    }

    record.attempts += 1;

    if (record.code !== code.trim()) {
      // 更新尝试次数
      await c.env.AUTH_KV.put(`verify:${normalizedEmail}`, JSON.stringify(record), { expirationTtl: 600 });
      return c.json({ success: false, error: '验证码错误' }, 400);
    }

    // 验证成功，删除验证码
    await c.env.AUTH_KV.delete(`verify:${normalizedEmail}`);

    // D1 中 upsert 用户
    const existing = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(normalizedEmail).first();

    let userId: string;
    if (existing) {
      userId = existing.id as string;
      await c.env.DB.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').bind(Date.now(), userId).run();
    } else {
      userId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await c.env.DB.prepare(
        'INSERT INTO users (id, email, created_at, last_login_at) VALUES (?, ?, ?, ?)'
      ).bind(userId, normalizedEmail, Date.now(), Date.now()).run();
    }

    const token = await signJWT({ userId, email: normalizedEmail }, c.env.JWT_SECRET || 'fallback-secret');

    return c.json({
      success: true,
      data: { token, user: { id: userId, email: normalizedEmail } },
    });
  } catch (error) {
    console.error('验证登录失败:', error);
    return c.json({ success: false, error: '登录失败' }, 500);
  }
});

app.get('/api/auth/me', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();

    if (!user) {
      return c.json({ success: false, error: '用户不存在' }, 401);
    }

    const plan = effectivePlan(user as any);
    const usage = await getDailyUsage(c.env.DB, userId);
    const profileCnt = await c.env.DB.prepare('SELECT COUNT(*) as n FROM profiles WHERE user_id = ?').bind(userId).first();
    const profileUsed = (profileCnt?.n as number) || 0;

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        plan,
        memberExpiresAt: (user as any).member_expires_at ?? null,
        quota: {
          report: { used: usage.report, limit: QUOTA[plan].reportPerDay },
          chat:   { used: usage.chat,   limit: QUOTA[plan].chatPerDay },
          profiles: { used: profileUsed, limit: QUOTA[plan].profiles },
        },
      },
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return c.json({ success: false, error: '获取失败' }, 500);
  }
});

// ==================== 八字档案 API ====================

app.get('/api/bazi/profiles', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM bazi_profiles WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all();

    // D1 存储的 data 是 JSON 字符串，需要解析
    const profiles = (results || []).map((p: any) => ({
      ...p,
      data: typeof p.data === 'string' ? JSON.parse(p.data) : p.data,
    }));

    return c.json({ success: true, data: profiles });
  } catch (error) {
    console.error('获取八字档案失败:', error);
    return c.json({ success: false, error: '获取失败' }, 500);
  }
});

app.post('/api/bazi/profiles', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { name, inputMode, data } = await c.req.json();

    if (!name || !name.trim()) {
      return c.json({ success: false, error: '档案名称不能为空' }, 400);
    }
    if (!inputMode || !['birthdate', 'pillars'].includes(inputMode)) {
      return c.json({ success: false, error: 'inputMode 无效' }, 400);
    }
    if (!data || typeof data !== 'object') {
      return c.json({ success: false, error: '数据不能为空' }, 400);
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 检查同名档案是否存在
    const existing = await c.env.DB.prepare(
      'SELECT id FROM bazi_profiles WHERE user_id = ? AND name = ?'
    ).bind(userId, name.trim()).first();

    const overwritten = !!existing;

    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO bazi_profiles (id, user_id, name, input_mode, data, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, userId, name.trim(), inputMode, JSON.stringify(data), Date.now()).run();

    return c.json({
      success: true,
      data: { id, userId, name: name.trim(), inputMode, data, createdAt: Date.now() },
      overwritten,
    });
  } catch (error) {
    console.error('保存八字档案失败:', error);
    return c.json({ success: false, error: '保存失败' }, 500);
  }
});

app.delete('/api/bazi/profiles/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();

    await c.env.DB.prepare(
      'DELETE FROM bazi_profiles WHERE id = ? AND user_id = ?'
    ).bind(id, userId).run();

    return c.json({ success: true, message: '已删除' });
  } catch (error) {
    console.error('删除八字档案失败:', error);
    return c.json({ success: false, error: '删除失败' }, 500);
  }
});

// ==================== 通用档案 API（八字/紫微等全平台共用）====================

app.get('/api/profiles', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM profiles WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all();

    const profiles = (results || []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      userId: p.user_id as string,
      name: p.name as string,
      inputMode: p.input_mode as 'birthdate' | 'pillars',
      gender: (p.gender ?? null) as 'male' | 'female' | null,
      year: (p.year ?? null) as number | null,
      month: (p.month ?? null) as number | null,
      day: (p.day ?? null) as number | null,
      hour: (p.hour ?? null) as number | null,
      minute: (p.minute ?? null) as number | null,
      birthplace: (p.birthplace ?? null) as string | null,
      useSolarTime: !!p.use_solar_time,
      pillars: p.pillars ? (typeof p.pillars === 'string' ? JSON.parse(p.pillars as string) : p.pillars) : null,
      createdAt: p.created_at as number,
    }));

    return c.json({ success: true, data: profiles });
  } catch (error) {
    console.error('获取档案失败:', error);
    return c.json({ success: false, error: '获取失败' }, 500);
  }
});

app.post('/api/profiles', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { name, inputMode, gender, year, month, day, hour, minute, birthplace, useSolarTime, pillars } = await c.req.json();

    if (!name || !name.trim()) {
      return c.json({ success: false, error: '档案名称不能为空' }, 400);
    }
    if (!inputMode || !['birthdate', 'pillars'].includes(inputMode)) {
      return c.json({ success: false, error: 'inputMode 无效' }, 400);
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const existing = await c.env.DB.prepare(
      'SELECT id FROM profiles WHERE user_id = ? AND name = ?'
    ).bind(userId, name.trim()).first();
    const overwritten = !!existing;

    // 非覆盖(新增)时检查档案数量上限
    if (!overwritten) {
      const user = await c.env.DB.prepare('SELECT plan, member_expires_at FROM users WHERE id = ?').bind(userId).first();
      const plan = effectivePlan(user as any);
      const cnt = await c.env.DB.prepare('SELECT COUNT(*) as n FROM profiles WHERE user_id = ?').bind(userId).first();
      const count = (cnt?.n as number) || 0;
      if (count >= QUOTA[plan].profiles) {
        return c.json({
          success: false,
          error: `档案数量已达上限(${QUOTA[plan].profiles}个)，升级会员可保存更多`,
          code: 'PROFILE_LIMIT',
          quota: { used: count, limit: QUOTA[plan].profiles, plan },
        }, 403);
      }
    }

    await c.env.DB.prepare(
      `INSERT OR REPLACE INTO profiles
        (id, user_id, name, input_mode, gender, year, month, day, hour, minute, birthplace, use_solar_time, pillars, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, userId, name.trim(), inputMode,
      gender ?? null, year ?? null, month ?? null, day ?? null, hour ?? null, minute ?? null,
      birthplace ?? null, useSolarTime ? 1 : 0,
      pillars ? JSON.stringify(pillars) : null,
      Date.now()
    ).run();

    return c.json({
      success: true,
      data: {
        id, userId, name: name.trim(), inputMode,
        gender: gender ?? null, year: year ?? null, month: month ?? null, day: day ?? null,
        hour: hour ?? null, minute: minute ?? null,
        birthplace: birthplace ?? null, useSolarTime: !!useSolarTime,
        pillars: pillars ?? null,
        createdAt: Date.now(),
      },
      overwritten,
    });
  } catch (error) {
    console.error('保存档案失败:', error);
    return c.json({ success: false, error: '保存失败' }, 500);
  }
});

app.delete('/api/profiles/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();

    await c.env.DB.prepare(
      'DELETE FROM profiles WHERE id = ? AND user_id = ?'
    ).bind(id, userId).run();

    return c.json({ success: true, message: '已删除' });
  } catch (error) {
    console.error('删除档案失败:', error);
    return c.json({ success: false, error: '删除失败' }, 500);
  }
});

// ==================== 人生发展报告 API（双盘合参）====================

app.post('/api/life-report/overview', authMiddleware, quotaMiddleware('report'), async (c) => {
  try {
    const input = await c.req.json();
    if (!input || !input.baziChart || !input.ziweiChart) {
      return c.json({ success: false, error: '生辰排盘数据不完整' }, 400);
    }
    if (!c.env.OPENAI_API_KEY || c.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return c.json({ success: false, error: 'AI 服务未配置' }, 503);
    }
    const result = await getLifeReportOverview(input, c.env);
    await incrUsage(c.env.DB, c.get('userId'), 'report');
    return c.json({ success: true, data: { interpretation: result, model: c.env.OPENAI_MODEL || 'gpt-4o-mini', timestamp: Date.now() } });
  } catch (error: unknown) {
    console.error('人生报告总览失败:', error);
    return c.json({ success: false, error: (error as Error).message || '生成失败' }, 500);
  }
});

app.post('/api/life-report/section', authMiddleware, quotaMiddleware('chat'), async (c) => {
  try {
    const req = await c.req.json();
    if (!req || !req.sectionType || !req.overview || !req.baziChart || !req.ziweiChart) {
      return c.json({ success: false, error: '章节请求参数不完整' }, 400);
    }
    const validSections: SectionType[] = ['career', 'wealth', 'marriage', 'health', 'trend'];
    if (!validSections.includes(req.sectionType)) {
      return c.json({ success: false, error: '章节类型无效' }, 400);
    }
    if (!c.env.OPENAI_API_KEY || c.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return c.json({ success: false, error: 'AI 服务未配置' }, 503);
    }
    const result = await getLifeReportSection(req, c.env);
    await incrUsage(c.env.DB, c.get('userId'), 'chat');
    return c.json({ success: true, data: { interpretation: result, sectionType: req.sectionType, model: c.env.OPENAI_MODEL || 'gpt-4o-mini', timestamp: Date.now() } });
  } catch (error: unknown) {
    console.error('人生报告章节失败:', error);
    return c.json({ success: false, error: (error as Error).message || '生成失败' }, 500);
  }
});

app.post('/api/life-report/chat', authMiddleware, quotaMiddleware('chat'), async (c) => {
  try {
    const { message, input, history, reportSummary } = await c.req.json();
    if (!message || !message.trim()) {
      return c.json({ success: false, error: '消息内容不能为空' }, 400);
    }
    if (!input || !input.baziChart || !input.ziweiChart) {
      return c.json({ success: false, error: '排盘数据不完整' }, 400);
    }
    if (!c.env.OPENAI_API_KEY || c.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return c.json({ success: false, error: 'AI 服务未配置' }, 503);
    }
    const result = await chatWithLifeReport(
      { message: message.trim(), input, history: history || [], reportSummary },
      c.env,
    );
    await incrUsage(c.env.DB, c.get('userId'), 'chat');
    return c.json({ success: true, data: { message: result, model: c.env.OPENAI_MODEL || 'gpt-4o-mini', timestamp: Date.now() } });
  } catch (error: unknown) {
    console.error('人生报告对话失败:', error);
    return c.json({ success: false, error: (error as Error).message || '对话失败' }, 500);
  }
});

// ==================== 今日运势卡（围绕人生报告双盘）====================

app.post('/api/life-report/daily', authMiddleware, quotaMiddleware('chat'), async (c) => {
  try {
    const { input, ctx } = await c.req.json();
    if (!input || !input.baziChart || !input.ziweiChart) {
      return c.json({ success: false, error: '排盘数据不完整' }, 400);
    }
    if (!ctx || !ctx.date || !ctx.dayGan) {
      return c.json({ success: false, error: '流日数据不完整' }, 400);
    }
    if (!c.env.OPENAI_API_KEY || c.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return c.json({ success: false, error: 'AI 服务未配置' }, 503);
    }
    const result = await getDailyFortune(input, ctx, c.env);
    await incrUsage(c.env.DB, c.get('userId'), 'chat');
    return c.json({ success: true, data: { ...result, model: c.env.OPENAI_MODEL || 'gpt-4o-mini', timestamp: Date.now() } });
  } catch (error: unknown) {
    console.error('今日运势失败:', error);
    return c.json({ success: false, error: (error as Error).message || '生成失败' }, 500);
  }
});

// ==================== 人生报告历史 API（登录用户跨设备同步）====================

app.get('/api/life-history', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM life_history WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all();
    const list = (results || []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      createdAt: r.created_at as number,
      name: (r.name ?? null) as string | null,
      birth: JSON.parse(r.birth as string),
      overview: (r.overview ?? null) as string | null,
      sections: JSON.parse(r.sections as string),
      chats: JSON.parse(r.chats as string),
      activeChatIndex: r.active_chat_index as number,
    }));
    return c.json({ success: true, data: list });
  } catch (error) {
    console.error('获取历史失败:', error);
    return c.json({ success: false, error: '获取失败' }, 500);
  }
});

app.post('/api/life-history', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { id, name, birth, overview, sections, chats, activeChatIndex } = await c.req.json();
    if (!birth) {
      return c.json({ success: false, error: '生辰不能为空' }, 400);
    }

    const now = Date.now();
    const birthStr = JSON.stringify(birth);
    const sectionsStr = JSON.stringify(sections ?? { career: null, wealth: null, marriage: null, health: null, trend: null });
    const chatsStr = JSON.stringify(chats ?? [[]]);
    const activeIdx = typeof activeChatIndex === 'number' ? activeChatIndex : 0;

    if (id) {
      // 更新已有
      await c.env.DB.prepare(
        `UPDATE life_history SET name = ?, birth = ?, overview = ?, sections = ?, chats = ?, active_chat_index = ?
         WHERE id = ? AND user_id = ?`
      ).bind(name ?? null, birthStr, overview ?? null, sectionsStr, chatsStr, activeIdx, id, userId).run();
      return c.json({ success: true, data: { id } });
    }

    // 新建
    const newId = `${now}-${Math.random().toString(36).substr(2, 9)}`;
    await c.env.DB.prepare(
      `INSERT INTO life_history (id, user_id, created_at, name, birth, overview, sections, chats, active_chat_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(newId, userId, now, name ?? null, birthStr, overview ?? null, sectionsStr, chatsStr, activeIdx).run();

    // 淘汰：保留最近2条，删除最旧
    const { results: all } = await c.env.DB.prepare(
      'SELECT id FROM life_history WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all();
    const ids = (all || []).map((r: Record<string, unknown>) => r.id as string);
    if (ids.length > 2) {
      const toDelete = ids.slice(2); // 超出2条的最旧部分
      for (const oldId of toDelete) {
        await c.env.DB.prepare('DELETE FROM life_history WHERE id = ? AND user_id = ?').bind(oldId, userId).run();
      }
    }

    return c.json({ success: true, data: { id: newId } });
  } catch (error) {
    console.error('保存历史失败:', error);
    return c.json({ success: false, error: '保存失败' }, 500);
  }
});

app.delete('/api/life-history/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { id } = c.req.param();
    await c.env.DB.prepare(
      'DELETE FROM life_history WHERE id = ? AND user_id = ?'
    ).bind(id, userId).run();
    return c.json({ success: true, message: '已删除' });
  } catch (error) {
    console.error('删除历史失败:', error);
    return c.json({ success: false, error: '删除失败' }, 500);
  }
});

// ==================== 会员订单 API（支付渠道预留，本次不接具体第三方）====================

/** 开通会员：monthly +30天，yearly +365天；若当前未过期则从过期时间续期 */
async function activateMembership(db: D1Database, userId: string, plan: 'monthly' | 'yearly', orderId: string): Promise<number> {
  const user = await db.prepare('SELECT member_expires_at FROM users WHERE id = ?').bind(userId).first();
  const now = Date.now();
  const cur = (user?.member_expires_at as number | undefined) ?? 0;
  const base = cur > now ? cur : now; // 未过期则从到期时间续期，否则从现在起算
  const days = plan === 'yearly' ? 365 : 30;
  const expiresAt = base + days * 24 * 3600 * 1000;
  await db.prepare(
    'UPDATE users SET plan = ?, member_expires_at = ?, member_order_id = ? WHERE id = ?'
  ).bind('member', expiresAt, orderId, userId).run();
  return expiresAt;
}

/** 创建订单：写 pending 订单，返回订单号 + 占位支付信息（渠道未接） */
app.post('/api/orders', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { plan } = await c.req.json();
    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return c.json({ success: false, error: '套餐无效，需为 monthly 或 yearly' }, 400);
    }
    const amount = PLAN_PRICE[plan];
    const id = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await c.env.DB.prepare(
      'INSERT INTO orders (id, user_id, plan, amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, userId, plan, amount, 'pending', Date.now()).run();

    // TODO: 支付渠道接入后，此处调用第三方下单接口，返回真实支付链接/二维码
    // 现阶段返回占位信息，前端提示"支付渠道即将开通"
    return c.json({
      success: true,
      data: {
        orderId: id,
        plan,
        amount,            // 分
        amountYuan: (amount / 100).toFixed(2),
        status: 'pending',
        payUrl: null,      // 渠道未接，无支付链接
        notice: '支付渠道正在接入中，暂无法自助开通。如需开通会员请联系站长手动开通。',
      },
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    return c.json({ success: false, error: '创建订单失败' }, 500);
  }
});

/** 支付回调：渠道接入后由第三方回调。当前预留，需验签（TODO） */
app.post('/api/orders/callback', async (c) => {
  // TODO: 接入支付渠道后，验证第三方签名 → 取订单号 → 更新订单为 paid → activateMembership
  return c.json({ success: false, error: '支付回调未配置，渠道接入后启用' }, 503);
});

/** 查询我的订单 */
app.get('/api/orders/mine', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const { results } = await c.env.DB.prepare(
      'SELECT id, plan, amount, status, created_at, paid_at FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
    ).bind(userId).all();
    return c.json({ success: true, data: results || [] });
  } catch (error) {
    console.error('查询订单失败:', error);
    return c.json({ success: false, error: '查询失败' }, 500);
  }
});

/** 站长手动开通会员（管理接口）：body { email, plan } —— 支付未接前的开通方式
 *  TODO: 接入支付后可移除或加管理员鉴权 */
app.post('/api/orders/manual-activate', async (c) => {
  try {
    const { email, plan } = await c.req.json();
    if (!email || !plan || !['monthly', 'yearly'].includes(plan)) {
      return c.json({ success: false, error: '参数无效' }, 400);
    }
    // 简单管理口令校验（密钥在 wrangler secret 配 ADMIN_KEY，未配则禁止）
    const adminKey = (c.env as any).ADMIN_KEY;
    const provided = c.req.header('X-Admin-Key');
    if (!adminKey || provided !== adminKey) {
      return c.json({ success: false, error: '无权限' }, 403);
    }
    const user = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (!user) return c.json({ success: false, error: '用户不存在' }, 404);
    const expiresAt = await activateMembership(c.env.DB, user.id as string, plan as 'monthly' | 'yearly', `manual_${Date.now()}`);
    return c.json({ success: true, data: { email, plan, memberExpiresAt: expiresAt } });
  } catch (error) {
    console.error('手动开通失败:', error);
    return c.json({ success: false, error: '开通失败' }, 500);
  }
});

// ==================== 导出 ====================

// Cloudflare Pages Functions 使用 EventContext，需要适配为 Hono 的 fetch 签名
export const onRequest: PagesFunction<Bindings> = async (context) => {
  return app.fetch(context.request, context.env, context as unknown as ExecutionContext);
};
