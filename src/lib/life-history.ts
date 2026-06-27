/**
 * 人生报告历史 — 工具函数与类型
 * 存取走云端 API（见 life-history-api.ts），登录用户跨设备同步
 */

export type { LifeHistoryBirth, LifeHistoryEntry } from './life-history-api';
export { getLifeHistory, saveLifeHistory, deleteLifeHistory } from './life-history-api';
import type { LifeHistoryBirth } from './life-history-api';

/** 生成生辰摘要文字（前端展示用） */
export function buildBirthSummary(b: LifeHistoryBirth): string {
  const genderText = b.gender === 'male' ? '男' : '女';
  const time = `${(b.hour ?? 0).toString().padStart(2, '0')}:${(b.minute ?? 0).toString().padStart(2, '0')}`;
  return `${b.year}年${b.month}月${b.day}日 ${time} ${genderText}${b.birthplace ? ' · ' + b.birthplace : ''}`;
}
