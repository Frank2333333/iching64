/**
 * 反馈API客户端
 * 与后端反馈API通信
 */

import type { FeedbackItem } from '@/components/FeedbackButton';

// API基础URL
// 优先级：1. 环境变量 2. 生产环境默认值
const API_BASE_URL = import.meta.env.VITE_FEEDBACK_API_URL || '/api';

// 从localStorage获取离线反馈（用于兼容旧数据）
const OFFLINE_STORAGE_KEY = 'iching64-feedback-offline';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 获取所有反馈
 */
export async function getAllFeedback(): Promise<FeedbackItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback`);
    const result: ApiResponse<FeedbackItem[]> = await response.json();
    
    if (result.success && result.data) {
      // 尝试获取离线反馈并合并
      const offlineFeedback = getOfflineFeedback();
      if (offlineFeedback.length > 0) {
        // 上传到服务器
        for (const feedback of offlineFeedback) {
          await submitFeedback(feedback);
        }
        // 清空离线存储
        clearOfflineFeedback();
      }
      return result.data;
    }
    
    throw new Error(result.error || '获取反馈失败');
  } catch (error) {
    console.warn('从服务器获取反馈失败，使用本地数据:', error);
    // 失败时返回离线数据
    return getOfflineFeedback();
  }
}

/**
 * 提交新反馈
 */
export async function submitFeedback(
  feedback: Omit<FeedbackItem, 'id' | 'serverTimestamp'>
): Promise<FeedbackItem | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });
    
    const result: ApiResponse<FeedbackItem> = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
    
    throw new Error(result.error || '提交反馈失败');
  } catch (error) {
    console.warn('提交到服务器失败，保存到本地:', error);
    // 保存到离线存储
    saveOfflineFeedback(feedback);
    return null;
  }
}

/**
 * 清空所有反馈
 */
export async function clearAllFeedback(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'DELETE',
    });
    
    const result: ApiResponse<void> = await response.json();
    
    if (result.success) {
      // 同时清空本地离线数据
      clearOfflineFeedback();
      return true;
    }
    
    throw new Error(result.error || '清空反馈失败');
  } catch (error) {
    console.error('清空反馈失败:', error);
    // 清空本地离线数据作为回退
    clearOfflineFeedback();
    return false;
  }
}

/**
 * 删除单条反馈
 */
export async function deleteFeedback(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
      method: 'DELETE',
    });
    
    const result: ApiResponse<void> = await response.json();
    return result.success;
  } catch (error) {
    console.error('删除反馈失败:', error);
    return false;
  }
}

// ============ 离线存储兼容 ============

function getOfflineFeedback(): FeedbackItem[] {
  try {
    const data = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveOfflineFeedback(
  feedback: Omit<FeedbackItem, 'id' | 'serverTimestamp'>
): void {
  try {
    const all = getOfflineFeedback();
    const newFeedback: FeedbackItem = {
      ...feedback,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    all.unshift(newFeedback);
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(all));
  } catch (error) {
    console.error('保存离线反馈失败:', error);
  }
}

function clearOfflineFeedback(): void {
  localStorage.removeItem(OFFLINE_STORAGE_KEY);
}
