/**
 * 认证 API 服务
 * 调用后端 /api/auth/* 接口
 */

const API_BASE_URL = import.meta.env.VITE_FEEDBACK_API_URL || '/api';

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: { id: string; email: string };
  };
  error?: string;
}

export interface QuotaInfo {
  report: { used: number; limit: number };
  chat: { used: number; limit: number };
  profiles: { used: number; limit: number };
}

export interface MeResponse {
  success: boolean;
  data?: {
    id: string;
    email: string;
    plan?: 'free' | 'member';
    memberExpiresAt?: number | null;
    quota?: QuotaInfo;
  };
  error?: string;
}

export async function sendVerificationCode(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
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

export async function verifyCode(email: string, code: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
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

export async function getCurrentUser(token: string): Promise<MeResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
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
