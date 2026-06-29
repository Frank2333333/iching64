/**
 * 今日运势 — 流日干支与十神主调计算（纯本地，无 AI）
 *
 * 依赖 lunar-javascript（已为八字排盘依赖）。基于"今日天干与日主的十神关系"
 * 推出"今日主调"（印绶/食伤/财星/官杀/比劫日），给运势卡与 AI 提供命理锚点。
 */
import { Solar } from 'lunar-javascript';
import { TIAN_GAN, GAN_TO_ELEMENT, SHI_SHEN_MAP } from '../data/bazi-constants';

/** 今日干支 */
export interface TodayGanZhi {
  date: string; // YYYY-MM-DD
  yearGan: string;
  yearZhi: string;
  monthGan: string;
  monthZhi: string;
  dayGan: string;
  dayZhi: string;
}

/** 今日主调：由日主与今日天干的十神关系归类 */
export interface DayTone {
  shiShen: string; // 十神名（如 正印、七杀）
  category: '印绶' | '食伤' | '财星' | '官杀' | '比劫';
  label: string; // 展示名（如 印绶日）
  hint: string; // 一句话主调说明
}

/** 十神 → 主调归类 */
function categorize(shiShen: string): DayTone['category'] {
  if (shiShen.includes('印')) return '印绶';
  if (shiShen.includes('食') || shiShen.includes('伤')) return '食伤';
  if (shiShen.includes('财')) return '财星';
  if (shiShen.includes('官') || shiShen.includes('杀')) return '官杀';
  return '比劫'; // 比肩/劫财
}

const TONE_HINTS: Record<DayTone['category'], string> = {
  '印绶': '宜学习、积累、向长辈请教；忌冲动行事',
  '食伤': '宜表达、创造、输出想法；忌过度内耗',
  '财星': '宜谈合作、理财务、把握机会；忌贪多嚼不烂',
  '官杀': '宜担责任、推进要事；忌拖延与对抗权威',
  '比劫': '宜社交、联动同辈；忌争执与攀比',
};

/** 取今日干支（按公历日期） */
export function getTodayGanZhi(date = new Date()): TodayGanZhi {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const solar = Solar.fromYmd(y, m, d);
  const lunar = solar.getLunar();
  return {
    date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    yearGan: lunar.getYearGan(),
    yearZhi: lunar.getYearZhi(),
    monthGan: lunar.getMonthGan(),
    monthZhi: lunar.getMonthZhi(),
    dayGan: lunar.getDayGan(),
    dayZhi: lunar.getDayZhi(),
  };
}

/** 计算今日主调（日主天干 × 今日天干 → 十神 → 归类） */
export function getDayTone(dayMaster: string, today: TodayGanZhi): DayTone {
  const dayIdx = TIAN_GAN.indexOf(dayMaster as typeof TIAN_GAN[number]);
  const todayIdx = TIAN_GAN.indexOf(today.dayGan as typeof TIAN_GAN[number]);
  if (dayIdx < 0 || todayIdx < 0) {
    return { shiShen: '', category: '比劫', label: '平和日', hint: TONE_HINTS['比劫'] };
  }
  const shiShen = SHI_SHEN_MAP[dayIdx][todayIdx];
  const category = categorize(shiShen);
  return { shiShen, category, label: `${category}日`, hint: TONE_HINTS[category] };
}

/** 日主五行（卡片展示用） */
export function dayMasterElementOf(dayMaster: string): string {
  return GAN_TO_ELEMENT[dayMaster] || '';
}
