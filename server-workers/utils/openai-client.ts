/**
 * OpenAI SDK 客户端工厂
 * Workers 环境下每次请求创建新实例（无全局状态）
 */
import OpenAI from 'openai';

interface OpenAIEnv {
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL?: string;
}

export function createOpenAIClient(env: OpenAIEnv): OpenAI {
  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  });
}
