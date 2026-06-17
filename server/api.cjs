/**
 * 反馈API服务器
 * 提供反馈的CRUD接口和AI解卦接口
 */

// 加载环境变量
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initServerLogger } = require('./logger.cjs');
const feedbackStore = require('./feedback-store.cjs');
const divinationAI = require('./divination-ai.cjs');
const baziAI = require('./bazi-ai.cjs');
const jwt = require('jsonwebtoken');
const authStore = require('./auth-store.cjs');
const baziProfileStore = require('./bazi-profile-store.cjs');

const logger = initServerLogger('server');

const app = express();
const PORT = process.env.FEEDBACK_PORT || 3001;
const HOST = process.env.FEEDBACK_HOST || '0.0.0.0';  // 默认监听所有接口

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 增大请求体限制以容纳完整的解卦数据

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ==================== 反馈 API ====================

// 获取所有反馈
app.get('/api/feedback', (req, res) => {
  try {
    const feedback = feedbackStore.getAllFeedback();
    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error('获取反馈失败:', error);
    res.status(500).json({ success: false, error: '获取反馈失败' });
  }
});

// 提交新反馈
app.post('/api/feedback', (req, res) => {
  try {
    const { type, content, contact, userAgent, url, timestamp } = req.body;

    // 验证必填字段
    if (!type || !content) {
      return res.status(400).json({
        success: false,
        error: '反馈类型和内容不能为空'
      });
    }

    // 添加客户端IP
    const clientIP = req.headers['x-forwarded-for'] ||
                     req.socket.remoteAddress ||
                     'unknown';

    const feedback = feedbackStore.addFeedback({
      type,
      content: content.trim(),
      contact: contact?.trim() || undefined,
      userAgent: userAgent || req.headers['user-agent'],
      url: url || req.headers.referer,
      timestamp: timestamp || Date.now(),
      clientIP,
    });

    if (feedback) {
      res.json({ success: true, data: feedback });
    } else {
      res.status(500).json({ success: false, error: '保存反馈失败' });
    }
  } catch (error) {
    console.error('提交反馈失败:', error);
    res.status(500).json({ success: false, error: '提交反馈失败' });
  }
});

// 清空所有反馈
app.delete('/api/feedback', (req, res) => {
  try {
    const success = feedbackStore.clearAllFeedback();
    if (success) {
      res.json({ success: true, message: '所有反馈已清空' });
    } else {
      res.status(500).json({ success: false, error: '清空反馈失败' });
    }
  } catch (error) {
    console.error('清空反馈失败:', error);
    res.status(500).json({ success: false, error: '清空反馈失败' });
  }
});

// 删除单条反馈
app.delete('/api/feedback/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = feedbackStore.deleteFeedback(id);
    if (success) {
      res.json({ success: true, message: '反馈已删除' });
    } else {
      res.status(500).json({ success: false, error: '删除反馈失败' });
    }
  } catch (error) {
    console.error('删除反馈失败:', error);
    res.status(500).json({ success: false, error: '删除反馈失败' });
  }
});

// ==================== AI 解卦 API ====================

// AI 解卦接口
app.post('/api/divination/ai', async (req, res) => {
  try {
    const divinationData = req.body;

    // 验证必要字段
    if (!divinationData || !divinationData.gua) {
      return res.status(400).json({
        success: false,
        error: '解卦数据不完整，缺少本卦信息'
      });
    }

    // 检查 OpenAI 配置
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return res.status(503).json({
        success: false,
        error: 'AI 解卦服务未配置，请在服务器配置 OpenAI API Key'
      });
    }

    console.log(`[${new Date().toISOString()}] 收到 AI 解卦请求: ${divinationData.gua?.name || 'unknown'}`);

    // 调用 OpenAI 解卦
    const aiResult = await divinationAI.getAIDivination(divinationData);

    res.json({
      success: true,
      data: {
        interpretation: aiResult,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('AI 解卦失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI 解卦服务暂时不可用'
    });
  }
});

// AI 对话接口
app.post('/api/divination/chat', async (req, res) => {
  try {
    const { message, divinationData, history } = req.body;

    // 验证必要字段
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空'
      });
    }

    if (!divinationData || !divinationData.gua) {
      return res.status(400).json({
        success: false,
        error: '解卦数据不完整'
      });
    }

    // 检查 OpenAI 配置
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return res.status(503).json({
        success: false,
        error: 'AI 对话服务未配置，请在服务器配置 OpenAI API Key'
      });
    }

    console.log(`[${new Date().toISOString()}] 收到 AI 对话请求: ${divinationData.gua?.name || 'unknown'}`);
    console.log(`[${new Date().toISOString()}] 用户消息: ${message.substring(0, 100)}...`);

    // 调用 OpenAI 对话
    const aiResult = await divinationAI.chatWithAI({
      message: message.trim(),
      divinationData,
      history: history || []
    });

    res.json({
      success: true,
      data: {
        message: aiResult,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('AI 对话失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI 对话服务暂时不可用'
    });
  }
});

// ==================== 八字排盘 API ====================

// AI 八字排盘解读
app.post('/api/bazi/ai', async (req, res) => {
  try {
    const input = req.body;
    console.log(`[${new Date().toISOString()}] /api/bazi/ai 收到原始请求体:`, JSON.stringify(input));

    // 验证必要字段（出生日期模式或八字模式）
    const hasPillars = input?.pillars && input.pillars.year && input.pillars.month && input.pillars.day && input.pillars.hour;
    const hasBirthdate = input?.year && input?.month && input?.day && input?.hour != null;
    console.log(`[${new Date().toISOString()}] hasPillars=${hasPillars}, hasBirthdate=${hasBirthdate}`);

    if (!input || (!hasPillars && !hasBirthdate)) {
      console.warn(`[${new Date().toISOString()}] 八字排盘请求验证失败:`, JSON.stringify(input));
      return res.status(400).json({
        success: false,
        error: '出生信息不完整，缺少年月日时；或直接输入八字需提供四柱信息'
      });
    }

    // 检查 OpenAI 配置
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return res.status(503).json({
        success: false,
        error: 'AI 八字排盘服务未配置，请在服务器配置 OpenAI API Key'
      });
    }

    if (hasPillars) {
      console.log(`[${new Date().toISOString()}] 收到八字排盘请求(直接八字模式): ${input.pillars.year} ${input.pillars.month} ${input.pillars.day} ${input.pillars.hour}`);
    } else {
      console.log(`[${new Date().toISOString()}] 收到八字排盘请求(出生日期模式): ${input.year}-${input.month}-${input.day} ${input.hour}:${input.minute || '00'}`);
    }

    const aiResult = await baziAI.getBaziFortune(input);

    res.json({
      success: true,
      data: {
        interpretation: aiResult,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('AI 八字排盘失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI 八字排盘服务暂时不可用'
    });
  }
});

// AI 八字对话
app.post('/api/bazi/chat', async (req, res) => {
  try {
    const { message, baziInput, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空'
      });
    }

    if (!baziInput || (!baziInput.year && !baziInput.pillars)) {
      return res.status(400).json({
        success: false,
        error: '命盘信息不完整'
      });
    }

    // 检查 OpenAI 配置
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return res.status(503).json({
        success: false,
        error: 'AI 对话服务未配置'
      });
    }

    console.log(`[${new Date().toISOString()}] 收到八字对话请求`);

    const aiResult = await baziAI.chatWithBazi({
      message: message.trim(),
      baziInput,
      history: history || [],
      initialInterpretationSummary: req.body.initialInterpretationSummary || ''
    });

    res.json({
      success: true,
      data: {
        message: aiResult,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('AI 八字对话失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI 对话服务暂时不可用'
    });
  }
});

// ==================== 健康检查 ====================

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: Date.now(),
    services: {
      feedback: true,
      aiDivination: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here'),
      baziAI: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here')
    }
  });
});

// 启动服务器
function startServer() {
  app.listen(PORT, HOST, () => {
    console.log(`\n✅ 反馈API服务器已启动 [版本标记: bazi-v2-20260616]`);
    console.log(`📡 本地访问: http://localhost:${PORT}/api/feedback`);
    console.log(`🌐 网络访问: http://${HOST}:${PORT}/api/feedback`);
    console.log(`💾 数据文件: ${path.join(__dirname, '../data/feedback.json')}`);
    console.log(`📝 日志文件: ${logger.dailyPath}`);
    console.log(`📝 最新日志: ${logger.latestPath}`);

    // 显示 AI 解卦服务状态
    const aiEnabled = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here');
    console.log(`\n服务状态:`);
    console.log(`  ${aiEnabled ? '✅' : '⚠️'} AI 解卦服务: ${aiEnabled ? '已启用' : '未配置 (需设置 OPENAI_API_KEY)'}`);

    console.log(`\n可用接口:`);
    console.log(`  POST   /api/auth/send-code     - 发送验证码`);
    console.log(`  POST   /api/auth/verify-code   - 验证登录`);
    console.log(`  GET    /api/auth/me             - 当前用户`);
    console.log(`  GET    /api/bazi/profiles       - 获取八字档案`);
    console.log(`  POST   /api/bazi/profiles       - 保存八字档案`);
    console.log(`  DELETE /api/bazi/profiles/:id   - 删除八字档案`);
    console.log(`  GET    /api/feedback           - 获取所有反馈`);
    console.log(`  POST   /api/feedback           - 提交新反馈`);
    console.log(`  POST   /api/divination/ai      - AI 解卦`);
    console.log(`  POST   /api/divination/chat    - AI 对话`);
    console.log(`  POST   /api/bazi/ai            - 八字排盘 AI 解读`);
    console.log(`  POST   /api/bazi/chat          - 八字对话`);
    console.log(`  DELETE /api/feedback           - 清空所有反馈`);
    console.log(`  DELETE /api/feedback/:id       - 删除单条反馈`);
    console.log(`  GET    /api/health             - 健康检查\n`);
  });
}

// 如果直接运行此文件则启动服务器
if (require.main === module) {
  startServer();
}

// ==================== JWT 认证中间件 ====================

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: '未登录' });
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: '登录已过期' });
  }
}

// ==================== 认证 API ====================

// 发送验证码
app.post('/api/auth/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, error: '请输入有效的邮箱地址' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const code = authStore.generateCode(normalizedEmail);

    // 发送邮件（如果 RESEND_API_KEY 已配置）
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-resend-api-key') {
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'IChing64 <noreply@iching64.fun>',
          to: normalizedEmail,
          subject: 'IChing64 验证码',
          html: `<p>您的验证码是：<strong>${code}</strong></p><p>有效期10分钟，请勿泄露。</p>`,
        });
      } catch (emailErr) {
        console.error('发送邮件失败:', emailErr);
        // 即使邮件失败也返回成功，避免暴露系统状态（但在开发环境可打印 code）
      }
    } else {
      console.log(`[开发环境] 验证码: ${code} -> ${normalizedEmail}`);
    }

    res.json({ success: true, message: '验证码已发送' });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ success: false, error: '发送失败' });
  }
});

// 验证验证码并登录
app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !email.trim() || !code || !code.trim()) {
      return res.status(400).json({ success: false, error: '邮箱和验证码不能为空' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const verifyResult = authStore.verifyCode(normalizedEmail, code.trim());
    if (!verifyResult.success) {
      return res.status(400).json({ success: false, error: verifyResult.error });
    }

    const user = authStore.getOrCreateUser(normalizedEmail);
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email }
      }
    });
  } catch (error) {
    console.error('验证登录失败:', error);
    res.status(500).json({ success: false, error: '登录失败' });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = authStore.getUserById(req.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: '用户不存在' });
    }
    res.json({ success: true, data: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ success: false, error: '获取失败' });
  }
});

// ==================== 八字档案 API ====================

// 获取当前用户的八字档案列表
app.get('/api/bazi/profiles', authMiddleware, async (req, res) => {
  try {
    const profiles = baziProfileStore.getProfilesByUserId(req.userId);
    res.json({ success: true, data: profiles });
  } catch (error) {
    console.error('获取八字档案失败:', error);
    res.status(500).json({ success: false, error: '获取失败' });
  }
});

// 保存新八字档案
app.post('/api/bazi/profiles', authMiddleware, async (req, res) => {
  try {
    const { name, inputMode, data } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: '档案名称不能为空' });
    }
    if (!inputMode || !['birthdate', 'pillars'].includes(inputMode)) {
      return res.status(400).json({ success: false, error: 'inputMode 无效' });
    }
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ success: false, error: '数据不能为空' });
    }

    const profile = baziProfileStore.addProfile(req.userId, {
      name: name.trim(),
      inputMode,
      data,
    });

    if (profile) {
      res.json({ success: true, data: profile });
    } else {
      res.status(500).json({ success: false, error: '保存失败' });
    }
  } catch (error) {
    console.error('保存八字档案失败:', error);
    res.status(500).json({ success: false, error: '保存失败' });
  }
});

// 删除八字档案
app.delete('/api/bazi/profiles/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const success = baziProfileStore.deleteProfile(req.userId, id);
    if (success) {
      res.json({ success: true, message: '已删除' });
    } else {
      res.status(500).json({ success: false, error: '删除失败' });
    }
  } catch (error) {
    console.error('删除八字档案失败:', error);
    res.status(500).json({ success: false, error: '删除失败' });
  }
});

module.exports = { app, startServer };
