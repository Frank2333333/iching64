/**
 * 人生报告历史 API 服务（云端 D1，登录用户跨设备同步）
 */

import type { SectionType, ChatMessage } from './life-report-api';

const API_BASE_URL = import.meta.env.VITE_FEEDBACK_API_URL || '/api';

/** 历史条目中的生辰（不含双盘） */
export interface LifeHistoryBirth {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  gender: 'male' | 'female';
  birthplace?: string;
  useSolarTime?: boolean;
  focus?: string;
}

export interface LifeHistoryEntry {
  id: string;
  createdAt: number;
  name?: string | null;
  birth: LifeHistoryBirth;
  overview: string | null;
  sections: Record<SectionType, string | null>;
  chats: ChatMessage[][];
  activeChatIndex: number;
}

interface ListResponse {
  success: boolean;
  data?: LifeHistoryEntry[];
  error?: string;
}

interface SaveResponse {
  success: boolean;
  data?: { id: string };
  error?: string;
}

async function postJSON(url: string, token: string, body: unknown) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!text) return { success: false, error: '服务器返回空响应' };
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, error: '服务器返回无效数据' };
  }
}

/** 拉取当前用户全部历史 */
export async function getLifeHistory(token: string): Promise<ListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/life-history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await response.text();
    if (!text) return { success: false, error: '服务器返回空响应' };
    return JSON.parse(text);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '网络请求失败' };
  }
}

/** 新建或更新一条历史（有 id 则更新，无 id 则新建） */
export async function saveLifeHistory(
  token: string,
  entry: Partial<LifeHistoryEntry> & { birth: LifeHistoryBirth },
): Promise<SaveResponse> {
  return postJSON(`${API_BASE_URL}/life-history`, token, entry);
}

/** 删除一条历史 */
export async function deleteLifeHistory(token: string, id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/life-history/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await response.text();
    if (!text) return { success: false, error: '服务器返回空响应' };
    return JSON.parse(text);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '网络请求失败' };
  }
}
