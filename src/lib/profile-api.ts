/**
 * 通用档案 API 服务
 * 调用后端 /api/profiles 接口（八字/紫微等全平台共用）
 */

const API_BASE_URL = import.meta.env.VITE_FEEDBACK_API_URL || '/api';

export interface ProfilePillars {
  year: string;
  month: string;
  day: string;
  hour: string;
}

export interface ProfileDTO {
  id: string;
  userId: string;
  name: string;
  inputMode: 'birthdate' | 'pillars';
  gender?: 'male' | 'female' | null;
  year?: number | null;
  month?: number | null;
  day?: number | null;
  hour?: number | null;
  minute?: number | null;
  birthplace?: string | null;
  useSolarTime?: boolean;
  pillars?: ProfilePillars | null;
  createdAt: number;
}

/** 保存档案时的输入（不含 id/userId/createdAt，由存储层生成） */
export type ProfileInput = Omit<ProfileDTO, 'id' | 'userId' | 'createdAt'>;

export interface ProfilesResponse {
  success: boolean;
  data?: ProfileDTO[];
  error?: string;
}

export interface SaveProfileResponse {
  success: boolean;
  data?: ProfileDTO;
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
    const response = await fetch(`${API_BASE_URL}/profiles`, {
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

export async function saveProfile(token: string, payload: ProfileInput): Promise<SaveProfileResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/profiles`, {
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
    const response = await fetch(`${API_BASE_URL}/profiles/${id}`, {
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
