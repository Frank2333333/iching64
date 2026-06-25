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

/** 大限信息（从宫位大限数据中提取） */
export interface DaXianInfo {
  startAge: number;
  endAge: number;
  palaceIndex: number;      // 对应 palaces[] 中的索引
  palaceName: string;
  heavenlyStem: string;
  earthlyBranch: string;
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
  oppositeIndex: number;          // 对宫 (index + 6) % 12
  sanFangIndices: number[];       // 三方四正 [self, opposite, (self+4)%12, (self+8)%12]
  isEmpty: boolean;               // 空宫（无主星）
  borrowedFromIndex?: number;     // 借宫来源（对宫 index，当空宫时）
  borrowedStars?: string[];       // 借到的对宫主星名
  isCurrentDaXian: boolean;       // 是否为当前大限宫位
}

/** 生年四化 */
export interface SiHua {
  lu: string;    // 化禄星
  quan: string;  // 化权星
  ke: string;    // 化科星
  ji: string;    // 化忌星
}

/** 运限宫位数据（大限/流年切换时使用） */
export interface HoroscopePalaceData {
  palaceNames: string[];         // 旋转后的12宫名称（[0]=该运限的命宫）
  heavenlyStem: string;          // 运限天干
  earthlyBranch: string;         // 运限地支
  mutagen: string[];             // 四化星名 [禄,权,科,忌]
  horoscopeStars: string[][];    // 流耀星名按宫位索引
}

/** 运限数据（大限+流年） */
export interface HoroscopeData {
  decadal: HoroscopePalaceData;  // 大限
  yearly: HoroscopePalaceData;   // 流年
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
  currentAge: number;                // 当前年龄
  currentDaXianIndex: number;        // 当前大限在 daXians 中的索引（-1 表示无）
  daXians: DaXianInfo[];             // 大限列表
  natalYearStemIndex: number;        // 出生年天干索引（0=甲, 1=乙, ..., 9=癸）
  horoscopeData?: HoroscopeData;     // 运限数据（大限/流年，计算时同步生成）
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

/** 转换 iztro 宫位为纯对象（不含三方四正等后处理字段） */
function transformPalaceRaw(p: {
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
}): Omit<Palace, 'oppositeIndex' | 'sanFangIndices' | 'isEmpty' | 'borrowedFromIndex' | 'borrowedStars' | 'isCurrentDaXian'> {
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

/** 后处理：为宫位添加三方四正、空宫/借宫、当前大限等字段 */
function enrichPalaces(palaces: Palace[], currentAge: number): void {
  // 找出当前大限对应的宫位索引
  let currentDaXianPalaceIndex = -1;
  for (const p of palaces) {
    if (p.decadal && currentAge >= p.decadal.range[0] && currentAge <= p.decadal.range[1]) {
      currentDaXianPalaceIndex = p.index;
      break;
    }
  }

  for (const p of palaces) {
    const oppositeIndex = (p.index + 6) % 12;
    const sanHe1 = (p.index + 4) % 12;
    const sanHe2 = (p.index + 8) % 12;

    p.oppositeIndex = oppositeIndex;
    p.sanFangIndices = [p.index, oppositeIndex, sanHe1, sanHe2];
    p.isEmpty = p.majorStars.length === 0;
    p.isCurrentDaXian = p.index === currentDaXianPalaceIndex;

    // 空宫借对宫主星
    if (p.isEmpty) {
      const oppositePalace = palaces[oppositeIndex];
      if (oppositePalace && oppositePalace.majorStars.length > 0) {
        p.borrowedFromIndex = oppositeIndex;
        p.borrowedStars = oppositePalace.majorStars.map(s => s.name);
      }
    }
  }
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

/** 从 iztro HoroscopeItem 提取纯对象 */
function extractHoroscopeItem(item: {
  index: number;
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  palaceNames: string[];
  mutagen: string[];
  stars?: { name: string; type: string; mutagen?: string }[][];
}): HoroscopePalaceData {
  return {
    palaceNames: item.palaceNames as string[],
    heavenlyStem: item.heavenlyStem as string,
    earthlyBranch: item.earthlyBranch as string,
    mutagen: item.mutagen as string[],
    horoscopeStars: item.stars
      ? item.stars.map(palaceStars => palaceStars.map(s => s.name as string))
      : [],
  };
}

/** 计算 horoscope 运限数据 */
function calculateHoroscopeFromAstrolabe(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  astrolabe: any,
): HoroscopeData | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const h = astrolabe.horoscope() as any;
    if (!h) return undefined;

    return {
      decadal: extractHoroscopeItem(h.decadal),
      yearly: extractHoroscopeItem(h.yearly),
    };
  } catch {
    return undefined;
  }
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
  const palaces = (astrolabe.palaces as unknown as Palace[]).slice(0, 12).map(transformPalaceRaw) as Palace[];

  // 6. 提取生年四化
  const birthSiHua = extractBirthSiHua(palaces);

  // 7. 计算当前年龄、大限、天干索引
  const currentAge = new Date().getFullYear() - year;
  const natalYearStemIndex = ((year - 4) % 10 + 10) % 10;

  const daXians: DaXianInfo[] = palaces
    .filter(p => p.decadal)
    .map(p => ({
      startAge: p.decadal!.range[0],
      endAge: p.decadal!.range[1],
      palaceIndex: p.index,
      palaceName: p.name,
      heavenlyStem: p.decadal!.heavenlyStem,
      earthlyBranch: p.decadal!.earthlyBranch,
    }))
    .sort((a, b) => a.startAge - b.startAge);

  const currentDaXianIndex = daXians.findIndex(d => currentAge >= d.startAge && currentAge <= d.endAge);

  // 8. 后处理：三方四正、空宫/借宫、当前大限标记
  enrichPalaces(palaces, currentAge);

  // 9. 计算运限数据（大限/流年）
  const horoscopeData = calculateHoroscopeFromAstrolabe(astrolabe);

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
    currentAge,
    currentDaXianIndex,
    daXians,
    natalYearStemIndex,
    horoscopeData,
  };
}
