/**
 * 反馈API服务器
 * 提供反馈的CRUD接口
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const feedbackStore = require('./feedback-store.cjs');

const app = express();
const PORT = process.env.FEEDBACK_PORT || 3001;
const HOST = process.env.FEEDBACK_HOST || '0.0.0.0';  // 默认监听所有接口

// 中间件
app.use(cors());
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API路由

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

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: Date.now() });
});

// 启动服务器
function startServer() {
  app.listen(PORT, HOST, () => {
    console.log(`\n✅ 反馈API服务器已启动`);
    console.log(`📡 本地访问: http://localhost:${PORT}/api/feedback`);
    console.log(`🌐 网络访问: http://${HOST}:${PORT}/api/feedback`);
    console.log(`💾 数据文件: ${path.join(__dirname, '../data/feedback.json')}`);
    console.log(`\n可用接口:`);
    console.log(`  GET    /api/feedback     - 获取所有反馈`);
    console.log(`  POST   /api/feedback     - 提交新反馈`);
    console.log(`  DELETE /api/feedback     - 清空所有反馈`);
    console.log(`  DELETE /api/feedback/:id - 删除单条反馈`);
    console.log(`  GET    /api/health       - 健康检查\n`);
  });
}

// 如果直接运行此文件则启动服务器
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
