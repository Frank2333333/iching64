/**
 * 八字档案 API 服务
 * 调用后端 /api/bazi/profiles 接口
 */

import type { BaziInput } from './bazi-api';

const API_BASE_URL = import.meta.env.VITE_FEEDBACK_API_URL || '/api';

export interface BaziProfile {
  id: string;
  userId: string;
  name: string;
  inputMode: 'birthdate' | 'pillars';
  data: BaziInput;
  createdAt: number;
}

export interface ProfilesResponse {
  success: boolean;
  data?: BaziProfile[];
  error?: string;
}

export interface SaveProfileResponse {
  success: boolean;
  data?: BaziProfile;
  overwritten?: boolean;
  error?: string;
}

export interface DeleteProfileResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function getProfiles(token: string): Promise<ProfilesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/bazi/profiles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await response.text();
    if (!text) return { success: false, error: '服务器返回空响应' };

    let result;
    try { result = JSON.parse(text); } catch {
      return { success: false, error: '服务器返回无效数据' };
    }

    return result;
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '网络请求失败' };
  }
}

export async function saveProfile(
  token: string,
  payload: { name: string; inputMode: 'birthdate' | 'pillars'; data: BaziInput }
): Promise<SaveProfileResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/bazi/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    if (!text) return { success: false, error: '服务器返回空响应' };

    let result;
    try { result = JSON.parse(text); } catch {
      return { success: false, error: '服务器返回无效数据' };
    }

    return result;
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '网络请求失败' };
  }
}

export async function deleteProfile(token: string, id: string): Promise<DeleteProfileResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/bazi/profiles/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await response.text();
    if (!text) return { success: false, error: '服务器返回空响应' };

    let result;
    try { result = JSON.parse(text); } catch {
      return { success: false, error: '服务器返回无效数据' };
    }

    return result;
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '网络请求失败' };
  }
}
