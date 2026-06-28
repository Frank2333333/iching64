/**
 * API 鉴权辅助：AI 接口需登录态，从 localStorage 读 token 注入 Authorization 头
 */

const TOKEN_KEY = 'iching_token';

/** 读取当前登录 token（未登录返回 null） */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** 构造带鉴权的请求头（AI 接口必需）。未登录时返回 null 供调用方提示 */
export function authHeaders(): Record<string, string> | null {
  const token = getAuthToken();
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/** 后端配额/鉴权错误结构 */
export interface ApiError {
  success: false;
  error: string;
  code?: string;            // 'QUOTA_EXCEEDED' | 'PROFILE_LIMIT' | 未登录等
  quota?: { type?: string; used: number; limit: number; plan?: string };
}

/** 判断响应是否为额度超限 */
export function isQuotaError(resp: any): boolean {
  return resp?.code === 'QUOTA_EXCEEDED' || resp?.error?.includes('额度已用完');
}

/** 判断响应是否为未登录 */
export function isAuthError(resp: any): boolean {
  return resp?.code === 'UNAUTHORIZED' || resp?.error?.includes('未登录') || resp?.error?.includes('登录已过期');
}
