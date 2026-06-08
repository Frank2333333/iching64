/**
 * 反馈数据存储服务
 * 使用JSON文件存储反馈数据
 */

const fs = require('fs');
const path = require('path');

// 数据文件路径
const DATA_DIR = path.join(__dirname, '../data');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json');

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 读取所有反馈
function getAllFeedback() {
  ensureDataDir();
  try {
    if (!fs.existsSync(FEEDBACK_FILE)) {
      return [];
    }
    const data = fs.readFileSync(FEEDBACK_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取反馈数据失败:', error);
    return [];
  }
}

// 保存反馈到文件
function saveFeedbackToFile(feedbackList) {
  ensureDataDir();
  try {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbackList, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('保存反馈数据失败:', error);
    return false;
  }
}

// 添加新反馈
function addFeedback(feedback) {
  const allFeedback = getAllFeedback();
  
  // 添加时间戳和ID
  const newFeedback = {
    ...feedback,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    serverTimestamp: Date.now(),
  };
  
  // 添加到列表开头
  allFeedback.unshift(newFeedback);
  
  if (saveFeedbackToFile(allFeedback)) {
    return newFeedback;
  }
  return null;
}

// 清空所有反馈
function clearAllFeedback() {
  return saveFeedbackToFile([]);
}

// 删除单条反馈
function deleteFeedback(id) {
  const allFeedback = getAllFeedback();
  const filtered = allFeedback.filter(f => f.id !== id);
  return saveFeedbackToFile(filtered);
}

module.exports = {
  getAllFeedback,
  addFeedback,
  clearAllFeedback,
  deleteFeedback,
};
