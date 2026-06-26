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
import { getLifeReportOverview, getLifeReportSection, chatWithLifeReport, type SectionType } from '../../server-workers/services/life-report-ai';

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

app.post('/api/divination/ai', async (c) => {
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

app.post('/api/divination/chat', async (c) => {
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

app.post('/api/bazi/ai', async (c) => {
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

app.post('/api/bazi/chat', async (c) => {
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

app.post('/api/ziwei/ai', async (c) => {
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

app.post('/api/ziwei/chat', async (c) => {
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

app.post('/api/classics/ai', async (c) => {
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

    return c.json({ success: true, data: { id: user.id, email: user.email } });
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

    await c.env.DB.prepare(
      `INSERT OR REPLACE INTO profiles
        (id, user_id, name, input_mode, gender, year, month, day, hour, minute, birthplace, use_solar_time, pillars, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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

app.post('/api/life-report/overview', async (c) => {
  try {
    const input = await c.req.json();
    if (!input || !input.baziChart || !input.ziweiChart) {
      return c.json({ success: false, error: '生辰排盘数据不完整' }, 400);
    }
    if (!c.env.OPENAI_API_KEY || c.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return c.json({ success: false, error: 'AI 服务未配置' }, 503);
    }
    const result = await getLifeReportOverview(input, c.env);
    return c.json({ success: true, data: { interpretation: result, model: c.env.OPENAI_MODEL || 'gpt-4o-mini', timestamp: Date.now() } });
  } catch (error: unknown) {
    console.error('人生报告总览失败:', error);
    return c.json({ success: false, error: (error as Error).message || '生成失败' }, 500);
  }
});

app.post('/api/life-report/section', async (c) => {
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
    return c.json({ success: true, data: { interpretation: result, sectionType: req.sectionType, model: c.env.OPENAI_MODEL || 'gpt-4o-mini', timestamp: Date.now() } });
  } catch (error: unknown) {
    console.error('人生报告章节失败:', error);
    return c.json({ success: false, error: (error as Error).message || '生成失败' }, 500);
  }
});

app.post('/api/life-report/chat', async (c) => {
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
    return c.json({ success: true, data: { message: result, model: c.env.OPENAI_MODEL || 'gpt-4o-mini', timestamp: Date.now() } });
  } catch (error: unknown) {
    console.error('人生报告对话失败:', error);
    return c.json({ success: false, error: (error as Error).message || '对话失败' }, 500);
  }
});

// ==================== 导出 ====================

// Cloudflare Pages Functions 使用 EventContext，需要适配为 Hono 的 fetch 签名
export const onRequest: PagesFunction<Bindings> = async (context) => {
  return app.fetch(context.request, context.env, context as unknown as ExecutionContext);
};
