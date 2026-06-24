/**
 * 紫微斗数排盘引擎 — iztro 集成 + 类型定义 + 转换层
 *
 * 依赖：iztro（核心排盘）、cities（城市经度/真太阳时）
 *
 * 数据流：iztro FunctionalAstrolabe → 纯对象 ZiweiChart（可序列化，可传后端）
 */

import { astro } from 'iztro';
import { hourToTimeIndex } from '../data/ziwei-constants';
import { PROVINCES } from '../data/cities';
import type { StarType } from '../data/ziwei-constants';

// ────────────────────────────────────────────
// 类型定义
// ────────────────────────────────────────────

/** 排盘输入 */
export interface ZiweiCalcInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: 'male' | 'female';
  birthplace?: string;
  useSolarTime?: boolean;
}

/** 单颗星 */
export interface Star {
  name: string;
  type: StarType;
  brightness?: string;  // 庙/旺/得/利/平/不/陷
  mutagen?: string;     // 禄/权/科/忌
}

/** 单个宫位 */
export interface Palace {
  index: number;            // 0-11，从寅宫开始
  name: string;             // 宫名，如 "命宫", "兄弟"
  isBodyPalace: boolean;    // 是否身宫
  heavenlyStem: string;     // 天干
  earthlyBranch: string;    // 地支
  majorStars: Star[];       // 主星
  minorStars: Star[];       // 辅星（含吉星、煞星、禄存、天马）
  adjectiveStars: Star[];   // 杂耀（含桃花、解神）
  changsheng12: string;     // 长生十二神
  decadal?: {               // 大限
    range: [number, number];
    heavenlyStem: string;
    earthlyBranch: string;
  };
}

/** 生年四化 */
export interface SiHua {
  lu: string;    // 化禄星
  quan: string;  // 化权星
  ke: string;    // 化科星
  ji: string;    // 化忌星
}

/** 真太阳时修正信息 */
export interface SolarTimeCorrection {
  birthplace: string;
  longitude: number;
  correctionMinutes: number;
  originalHour: number;
  correctedHour: number;
  hourIndexChanged: boolean;
}

/** 排盘结果 */
export interface ZiweiChart {
  solarDate: string;
  lunarDate: string;
  chineseDate: string;
  gender: string;           // 男/女
  time: string;             // 时辰名
  timeRange: string;        // 时辰范围
  sign: string;             // 星座
  zodiac: string;           // 生肖
  fiveElementsClass: string; // 五行局，如 "水二局"
  soulPalace: string;       // 命宫地支
  bodyPalace: string;       // 身宫地支
  soul: string;             // 命主星
  body: string;             // 身主星
  palaces: Palace[];        // 12宫，从寅(0)开始
  birthSiHua: SiHua;        // 生年四化
  solarTimeCorrection?: SolarTimeCorrection;
}

// ────────────────────────────────────────────
// 辅助函数
// ────────────────────────────────────────────

/** 根据城市名查找经度 */
function findLongitude(birthplace: string): number | null {
  for (const province of PROVINCES) {
    for (const city of province.cities) {
      if (city.name === birthplace) {
        return city.longitude;
      }
    }
  }
  return null;
}

/** 真太阳时修正 */
function applySolarTimeCorrection(
  hour: number,
  minute: number,
  birthplace: string,
): { correctedHour: number; correctedMinute: number; correction: SolarTimeCorrection } | null {
  const longitude = findLongitude(birthplace);
  if (longitude === null) return null;

  const correctionMinutes = Math.round((longitude - 120) * 4);
  const totalMinutes = hour * 60 + minute + correctionMinutes;

  let correctedTotalMinutes = totalMinutes;
  if (correctedTotalMinutes < 0) correctedTotalMinutes += 24 * 60;
  if (correctedTotalMinutes >= 24 * 60) correctedTotalMinutes -= 24 * 60;

  const correctedHour = Math.floor(correctedTotalMinutes / 60);
  const correctedMinute = correctedTotalMinutes % 60;

  const originalTimeIndex = hourToTimeIndex(hour, minute);
  const correctedTimeIndex = hourToTimeIndex(correctedHour, correctedMinute);

  return {
    correctedHour,
    correctedMinute,
    correction: {
      birthplace,
      longitude,
      correctionMinutes,
      originalHour: hour,
      correctedHour,
      hourIndexChanged: originalTimeIndex !== correctedTimeIndex,
    },
  };
}

/** 转换 iztro 星曜为纯对象 */
function transformStar(s: { name: string; type: string; brightness?: string; mutagen?: string }): Star {
  return {
    name: s.name as string,
    type: s.type as StarType,
    brightness: s.brightness as string | undefined,
    mutagen: s.mutagen as string | undefined,
  };
}

/** 转换 iztro 宫位为纯对象 */
function transformPalace(p: {
  index: number;
  name: string;
  isBodyPalace: boolean;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: { name: string; type: string; brightness?: string; mutagen?: string }[];
  minorStars: { name: string; type: string; brightness?: string; mutagen?: string }[];
  adjectiveStars: { name: string; type: string; brightness?: string; mutagen?: string }[];
  changsheng12: string;
  decadal?: { range: [number, number]; heavenlyStem: string; earthlyBranch: string };
}): Palace {
  return {
    index: p.index,
    name: p.name as string,
    isBodyPalace: p.isBodyPalace,
    heavenlyStem: p.heavenlyStem as string,
    earthlyBranch: p.earthlyBranch as string,
    majorStars: p.majorStars.map(transformStar),
    minorStars: p.minorStars.map(transformStar),
    adjectiveStars: p.adjectiveStars.map(transformStar),
    changsheng12: p.changsheng12 as string,
    decadal: p.decadal ?? undefined,
  };
}

/** 从命盘提取生年四化 */
function extractBirthSiHua(palaces: Palace[]): SiHua {
  const sihua: SiHua = { lu: '', quan: '', ke: '', ji: '' };
  for (const palace of palaces) {
    for (const star of [...palace.majorStars, ...palace.minorStars]) {
      if (star.mutagen === '禄') sihua.lu = star.name;
      else if (star.mutagen === '权') sihua.quan = star.name;
      else if (star.mutagen === '科') sihua.ke = star.name;
      else if (star.mutagen === '忌') sihua.ji = star.name;
    }
  }
  return sihua;
}

// ────────────────────────────────────────────
// 主函数
// ────────────────────────────────────────────

/** 紫微斗数排盘 */
export function calculateZiweiChart(input: ZiweiCalcInput): ZiweiChart {
  let { year, month, day, hour, minute, gender, birthplace, useSolarTime } = input;

  // 1. 真太阳时修正
  let solarTimeCorrection: SolarTimeCorrection | undefined;
  if (useSolarTime && birthplace) {
    const result = applySolarTimeCorrection(hour, minute, birthplace);
    if (result) {
      hour = result.correctedHour;
      minute = result.correctedMinute;
      solarTimeCorrection = result.correction;
    }
  }

  // 2. 小时 → iztro timeIndex
  const timeIndex = hourToTimeIndex(hour, minute);

  // 3. 性别 → iztro 接受 'male'/'female'
  const genderStr = gender === 'male' ? '男' : '女';

  // 4. 调用 iztro 排盘
  const dateStr = `${year}-${month}-${day}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const astrolabe = astro.bySolar(dateStr as any, timeIndex, genderStr as any, true, 'zh-CN' as any);

  // 5. 转换为纯对象
  const palaces = (astrolabe.palaces as unknown as Palace[]).slice(0, 12).map(transformPalace);

  // 6. 提取生年四化
  const birthSiHua = extractBirthSiHua(palaces);

  return {
    solarDate: astrolabe.solarDate as string,
    lunarDate: astrolabe.lunarDate as string,
    chineseDate: astrolabe.chineseDate as string,
    gender: astrolabe.gender as string,
    time: astrolabe.time as string,
    timeRange: astrolabe.timeRange as string,
    sign: astrolabe.sign as string,
    zodiac: astrolabe.zodiac as string,
    fiveElementsClass: astrolabe.fiveElementsClass as string,
    soulPalace: astrolabe.earthlyBranchOfSoulPalace as string,
    bodyPalace: astrolabe.earthlyBranchOfBodyPalace as string,
    soul: astrolabe.soul as string,
    body: astrolabe.body as string,
    palaces,
    birthSiHua,
    solarTimeCorrection,
  };
}
