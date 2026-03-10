/**
 * AI 解卦 API 服务
 * 调用后端 OpenAI 解卦接口
 */

const API_BASE_URL = import.meta.env.VITE_FEEDBACK_API_URL || '/api';

export interface DivinationData {
  gua: {
    id: number;
    name: string;
    chineseName: string;
    guaci: string;
    tuanZhuan: string;
    daXiangZhuan: string;
    meaning: string;
  } | null;
  dongYao: {
    position: number;
    name: string;
    text: string;
    xiangZhuan?: string;
    yinYang: 'yin' | 'yang';
  } | null;
  tiGuaName: string;
  yongGuaName: string;
  wuxingDetail: {
    relation: string;
    judgment: string;
    level: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
    description: string;
  };
  huGua: {
    shangGuaNum: number;
    xiaGuaNum: number;
    shangGuaName: string;
    xiaGuaName: string;
    guaId: number;
  } | null;
  bianGua: {
    shangGuaNum: number;
    xiaGuaNum: number;
    shangGuaName: string;
    xiaGuaName: string;
    guaId: number;
  } | null;
  yingQi: {
    description: string;
    timeFrames: string[];
  };
  selectedScene?: {
    id: string;
    name: string;
    description: string;
  } | null;
}

export interface AIDivinationResponse {
  success: boolean;
  data?: {
    interpretation: string;
    model: string;
    timestamp: number;
  };
  error?: string;
}

/**
 * 调用 AI 解卦服务
 * @param data 解卦数据
 * @returns AI 解卦结果
 */
export async function getAIDivination(data: DivinationData): Promise<AIDivinationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/divination/ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // 获取响应文本
    const responseText = await response.text();
    
    // 检查响应是否为空
    if (!responseText || responseText.trim() === '') {
      console.error('API 返回空响应');
      return {
        success: false,
        error: '服务器返回空响应，请检查后端服务是否正常运行',
      };
    }

    // 尝试解析 JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON 解析失败:', responseText.substring(0, 200));
      // 如果返回的是 HTML（通常是 404 或 500 错误页面）
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
    console.error('AI 解卦请求失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络请求失败',
    };
  }
}

/**
 * 检查 AI 解卦服务状态
 * @returns 服务是否可用
 */
export async function checkAIDivinationStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    // 检查响应类型
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
