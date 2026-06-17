/**
 * 用户与验证码存储服务
 * - 用户数据持久化到 data/users.json
 * - 验证码仅内存存储（10分钟过期）
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// 内存验证码存储: Map<email, { code, expiresAt, attempts }>
const verificationCodes = new Map();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getAllUsers() {
  ensureDataDir();
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取用户数据失败:', error);
    return [];
  }
}

function saveUsersToFile(users) {
  ensureDataDir();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('保存用户数据失败:', error);
    return false;
  }
}

function findUserByEmail(email) {
  const users = getAllUsers();
  return users.find(u => u.email === email) || null;
}

function getOrCreateUser(email) {
  const existing = findUserByEmail(email);
  if (existing) {
    // 更新最后登录时间
    const users = getAllUsers();
    const idx = users.findIndex(u => u.email === email);
    if (idx >= 0) {
      users[idx].lastLoginAt = Date.now();
      saveUsersToFile(users);
    }
    return existing;
  }

  const newUser = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  };

  const users = getAllUsers();
  users.push(newUser);
  saveUsersToFile(users);
  return newUser;
}

function generateCode(email) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes.set(email, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10分钟
    attempts: 0,
  });
  return code;
}

function verifyCode(email, code) {
  const record = verificationCodes.get(email);
  if (!record) {
    return { success: false, error: '验证码不存在或已过期' };
  }

  if (Date.now() > record.expiresAt) {
    verificationCodes.delete(email);
    return { success: false, error: '验证码已过期' };
  }

  if (record.attempts >= 5) {
    verificationCodes.delete(email);
    return { success: false, error: '尝试次数过多，请重新获取验证码' };
  }

  record.attempts += 1;

  if (record.code !== code) {
    return { success: false, error: '验证码错误' };
  }

  // 验证成功，删除记录
  verificationCodes.delete(email);
  return { success: true };
}

function getUserById(userId) {
  const users = getAllUsers();
  return users.find(u => u.id === userId) || null;
}

module.exports = {
  getAllUsers,
  findUserByEmail,
  getOrCreateUser,
  getUserById,
  generateCode,
  verifyCode,
};
