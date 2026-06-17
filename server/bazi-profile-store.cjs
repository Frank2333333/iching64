/**
 * 八字档案存储服务
 * 使用JSON文件存储用户的八字档案
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const PROFILES_FILE = path.join(DATA_DIR, 'bazi-profiles.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getAllProfiles() {
  ensureDataDir();
  try {
    if (!fs.existsSync(PROFILES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(PROFILES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取八字档案失败:', error);
    return [];
  }
}

function saveProfilesToFile(profiles) {
  ensureDataDir();
  try {
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('保存八字档案失败:', error);
    return false;
  }
}

function getProfilesByUserId(userId) {
  const all = getAllProfiles();
  return all
    .filter(p => p.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function addProfile(userId, profile) {
  const all = getAllProfiles();
  const originalLen = all.length;
  // 移除该用户同名旧档案（如有），实现覆盖逻辑
  const filtered = all.filter(p => !(p.userId === userId && p.name === profile.name));
  const newProfile = {
    ...profile,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    createdAt: Date.now(),
  };
  filtered.push(newProfile);
  if (saveProfilesToFile(filtered)) {
    return { profile: newProfile, overwritten: filtered.length !== originalLen };
  }
  return null;
}

function deleteProfile(userId, id) {
  const all = getAllProfiles();
  const idx = all.findIndex(p => p.id === id && p.userId === userId);
  if (idx === -1) {
    return false;
  }
  all.splice(idx, 1);
  return saveProfilesToFile(all);
}

module.exports = {
  getProfilesByUserId,
  addProfile,
  deleteProfile,
};
