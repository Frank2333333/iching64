/**
 * 八字排盘 AI API 服务
 * 调用后端 /api/bazi/ai 和 /api/bazi/chat 接口
 */

const API_BASE_URL = import.meta.env.VITE_FEEDBACK_API_URL || '/api';

export interface BaziPillars {
  year: string;
  month: string;
  day: string;
  hour: string;
}

export interface BaziInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: 'male' | 'female';
  birthplace?: string;
  useSolarTime?: boolean; // 是否使用真太阳时
  question?: string;
  /** 直接输入的八字四柱（与出生日期互斥使用） */
  pillars?: BaziPillars;
}

export interface BaziFortuneResponse {
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

export interface ChatRequestData {
  message: string;
  baziInput: BaziInput;
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
 * 调用 AI 八字排盘解读服务
 * @param data 出生信息和问题
 * @returns AI 排盘解读结果
 */
export async function baziAIFortune(data: BaziInput): Promise<BaziFortuneResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/bazi/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseText = await response.text();

    if (!responseText || responseText.trim() === '') {
      console.error('API 返回空响应');
      return {
        success: false,
        error: '服务器返回空响应，请检查后端服务是否正常运行',
      };
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      console.error('JSON 解析失败:', responseText.substring(0, 200));
      if (responseText.trim().startsWith('<')) {
        return {
          success: false,
          error: `服务器返回 HTML 页面而非 JSON，状态码: ${response.status}。请检查 API 地址配置是否正确`,
        };
      }
      return {
        success: false,
        error: `服务器返回无效数据: ${responseText.substring(0, 100)}`,
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `请求失败: ${response.status}`,
      };
    }

    return result;
  } catch (error) {
    console.error('八字排盘 AI 请求失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络请求失败',
    };
  }
}

/**
 * 检查八字排盘 AI 服务状态
 * @returns 服务是否可用
 */
export async function checkBaziAIStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Health check 返回非 JSON 响应:', contentType);
      return false;
    }
    const result = await response.json();
    return result.success && result.services?.aiDivination === true;
  } catch (error) {
    console.error('Health check 失败:', error);
    return false;
  }
}

/**
 * 发送八字对话消息
 * @param data 对话请求数据
 * @returns AI 回复
 */
export async function baziChat(data: ChatRequestData): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/bazi/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseText = await response.text();

    if (!responseText || responseText.trim() === '') {
      console.error('API 返回空响应');
      return {
        success: false,
        error: '服务器返回空响应，请检查后端服务是否正常运行',
      };
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      console.error('JSON 解析失败:', responseText.substring(0, 200));
      if (responseText.trim().startsWith('<')) {
        return {
          success: false,
          error: `服务器返回 HTML 页面而非 JSON，状态码: ${response.status}。请检查 API 地址配置是否正确`,
        };
      }
      return {
        success: false,
        error: `服务器返回无效数据: ${responseText.substring(0, 100)}`,
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `请求失败: ${response.status}`,
      };
    }

    return result;
  } catch (error) {
    console.error('八字对话请求失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络请求失败',
    };
  }
}
