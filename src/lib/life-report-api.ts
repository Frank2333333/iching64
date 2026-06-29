/**
 * 人生发展报告 API 服务
 * 调用后端 /api/life-report/* 接口（双盘合参）
 */

import type { BaziChart } from './bazi-calculator';
import type { ZiweiChart } from './ziwei-calculator';
import { authHeaders } from './api-auth';

const API_BASE_URL = import.meta.env.VITE_FEEDBACK_API_URL || '/api';

export interface LifeReportInput {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  gender: 'male' | 'female';
  birthplace?: string;
  useSolarTime?: boolean;
  focus?: string;
  mbti?: string;
  baziChart?: BaziChart;
  ziweiChart?: ZiweiChart;
}

export type SectionType = 'career' | 'wealth' | 'marriage' | 'health' | 'trend';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface BaseResponse {
  success: boolean;
  error?: string;
}

interface OverviewResponse extends BaseResponse {
  data?: { interpretation: string; model: string; timestamp: number };
}

interface SectionResponse extends BaseResponse {
  data?: { interpretation: string; sectionType: SectionType; model: string; timestamp: number };
}

interface ChatResponse extends BaseResponse {
  data?: { message: string; model: string; timestamp: number };
}

export interface DailyFortuneContext {
  date: string;
  yearGan: string; yearZhi: string;
  monthGan: string; monthZhi: string;
  dayGan: string; dayZhi: string;
  dayToneLabel: string;
  dayToneHint: string;
}

export interface DailyFortuneData {
  level: number;
  tip: string;
  yi: string[];
  ji: string[];
  comment: string;
}

interface DailyResponse extends BaseResponse {
  data?: DailyFortuneData & { model: string; timestamp: number };
}

export type RadarAxis = 'drive' | 'wealth' | 'charm' | 'creative' | 'resilience' | 'execution';
export type RadarScores = Record<RadarAxis, number>;
export interface RadarResult {
  scores: RadarScores;
  comments: Partial<Record<RadarAxis, string>>;
  baseScores: RadarScores;
}
interface RadarResponse extends BaseResponse {
  data?: RadarResult & { model: string; timestamp: number };
}

async function postJSON(url: string, body: unknown): Promise<{ ok: boolean; json: any | null; text: string }> {
  const headers = authHeaders();
  if (!headers) {
    return { ok: false, json: { success: false, error: '请先登录后使用', code: 'UNAUTHORIZED' }, text: '{"success":false}' };
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const text = await response.text();
    if (!text) return { ok: false, json: null, text: '' };
    try {
      return { ok: response.ok, json: JSON.parse(text), text };
    } catch {
      if (text.trim().startsWith('<')) {
        return { ok: false, json: null, text: `服务器返回 HTML 而非 JSON（状态码 ${response.status}）` };
      }
      return { ok: false, json: null, text: `服务器返回无效数据: ${text.substring(0, 100)}` };
    }
  } catch (error) {
    return { ok: false, json: null, text: error instanceof Error ? error.message : '网络请求失败' };
  }
}

/** 生成本命总览 */
export async function getLifeReportOverview(input: LifeReportInput): Promise<OverviewResponse> {
  const { ok, json } = await postJSON(`${API_BASE_URL}/life-report/overview`, input);
  if (!json) return { success: false, error: '服务器返回空响应' };
  if (!ok) return { success: false, error: json.error || '生成失败' };
  return json;
}

/** 生成单个章节（需带 overview 保证一致性） */
export async function getLifeReportSection(
  input: LifeReportInput,
  sectionType: SectionType,
  overview: string,
): Promise<SectionResponse> {
  const { ok, json } = await postJSON(`${API_BASE_URL}/life-report/section`, {
    ...input,
    sectionType,
    overview,
  });
  if (!json) return { success: false, error: '服务器返回空响应' };
  if (!ok) return { success: false, error: json.error || '生成失败' };
  return json;
}

/** 追问对话 */
export async function lifeReportChat(
  message: string,
  input: LifeReportInput,
  history: ChatMessage[],
  reportSummary?: string,
): Promise<ChatResponse> {
  const { ok, json } = await postJSON(`${API_BASE_URL}/life-report/chat`, {
    message,
    input,
    history,
    reportSummary,
  });
  if (!json) return { success: false, error: '服务器返回空响应' };
  if (!ok) return { success: false, error: json.error || '对话失败' };
  return json;
}

/** 今日运势卡（围绕人生报告双盘 + 流日） */
export async function getDailyFortune(
  input: LifeReportInput,
  ctx: DailyFortuneContext,
): Promise<DailyResponse> {
  const { ok, json } = await postJSON(`${API_BASE_URL}/life-report/daily`, { input, ctx });
  if (!json) return { success: false, error: '服务器返回空响应' };
  if (!ok) return { success: false, error: json.error || '生成失败' };
  return json;
}

/** 潜能雷达图（bazi+MBTI 本地基础分，紫微 AI 微调） */
export async function getRadar(input: LifeReportInput): Promise<RadarResponse> {
  const { ok, json } = await postJSON(`${API_BASE_URL}/life-report/radar`, input);
  if (!json) return { success: false, error: '服务器返回空响应' };
  if (!ok) return { success: false, error: json.error || '生成失败' };
  return json;
}
