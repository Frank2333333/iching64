/**
 * 紫微斗数 AI API 服务
 * 调用后端 /api/ziwei/ai 和 /api/ziwei/chat 接口
 */

import type { ZiweiChart } from './ziwei-calculator';

const API_BASE_URL = import.meta.env.VITE_FEEDBACK_API_URL || '/api';

export interface ZiweiInput {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  gender: 'male' | 'female';
  birthplace?: string;
  useSolarTime?: boolean;
  question?: string;
  chart?: ZiweiChart;
}

export interface ZiweiFortuneResponse {
  success: boolean;
  data?: {
    interpretation: string;
    model: string;
    timestamp: number;
  };
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ZiweiChatRequestData {
  message: string;
  ziweiInput: ZiweiInput;
  history: ChatMessage[];
  initialInterpretationSummary?: string;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    message: string;
    model: string;
    timestamp: number;
  };
  error?: string;
}

/**
 * 调用 AI 紫微斗数解读服务
 */
export async function ziweiAIFortune(data: ZiweiInput): Promise<ZiweiFortuneResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/ziwei/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const responseText = await response.text();

    if (!responseText || responseText.trim() === '') {
      return { success: false, error: '服务器返回空响应，请检查后端服务是否正常运行' };
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      if (responseText.trim().startsWith('<')) {
        return { success: false, error: `服务器返回 HTML 页面而非 JSON，状态码: ${response.status}` };
      }
      return { success: false, error: `服务器返回无效数据: ${responseText.substring(0, 100)}` };
    }

    if (!response.ok) {
      return { success: false, error: result.error || `请求失败: ${response.status}` };
    }

    return result;
  } catch (error) {
    console.error('紫微斗数 AI 请求失败:', error);
    return { success: false, error: error instanceof Error ? error.message : '网络请求失败' };
  }
}

/**
 * 检查紫微斗数 AI 服务状态
 */
export async function checkZiweiAIStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return false;
    const result = await response.json();
    return result.success && result.services?.ziweiAI === true;
  } catch {
    return false;
  }
}

/**
 * 发送紫微斗数对话消息
 */
export async function ziweiChat(data: ZiweiChatRequestData): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/ziwei/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const responseText = await response.text();

    if (!responseText || responseText.trim() === '') {
      return { success: false, error: '服务器返回空响应' };
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      if (responseText.trim().startsWith('<')) {
        return { success: false, error: `服务器返回 HTML 页面而非 JSON，状态码: ${response.status}` };
      }
      return { success: false, error: `服务器返回无效数据: ${responseText.substring(0, 100)}` };
    }

    if (!response.ok) {
      return { success: false, error: result.error || `请求失败: ${response.status}` };
    }

    return result;
  } catch (error) {
    console.error('紫微斗数对话请求失败:', error);
    return { success: false, error: error instanceof Error ? error.message : '网络请求失败' };
  }
}
