/**
 * 八字排盘引擎 — 核心计算模块
 *
 * 依赖：lunar-javascript（农历/节气/干支）、bazi-constants（基础常量）、cities（城市经度）
 */

import { Solar } from 'lunar-javascript';
import {
  TIAN_GAN, DI_ZHI, CANG_GAN, GAN_TO_ELEMENT, ZHI_TO_ELEMENT,
  WU_SHU_DUN, SHI_SHEN_MAP, WUXING_SHENG, WUXING_KE,
  getNaYin,
} from '../data/bazi-constants';
import { PROVINCES } from '../data/cities';

// ────────────────────────────────────────────
// 类型定义
// ────────────────────────────────────────────

/** 单柱 */
export interface Pillar {
  gan: string;
  zhi: string;
  ganIndex: number;
  zhiIndex: number;
  nayin: string;
  cangGan: string[];
  shiShen: string[];
}

/** 大运 */
export interface DaYun {
  startAge: number;
  endAge: number;
  gan: string;
  zhi: string;
  cangGan: string[];
  shiShen: string;
}

/** 流年 */
export interface LiuNian {
  year: number;
  gan: string;
  zhi: string;
  shiShen: string;
}

/** 真太阳时修正信息 */
export interface SolarTimeCorrection {
  birthplace: string;
  longitude: number;
  correctionMinutes: number;
  originalHour: number;
  correctedHour: number;
  hourPillarChanged: boolean;
}

/** 排盘结果 */
export interface BaziChart {
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;
  dayMaster: string;
  dayMasterElement: string;
  dayMasterStrength: string;
  pattern: string;
  yongShen: string;
  xiShen: string;
  jiShen: string;
  daYun: DaYun[];
  currentLiuNian: LiuNian;
  birthYear: number;
  solarTimeCorrection?: SolarTimeCorrection;
}

/** 排盘输入 */
export interface BaziCalcInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: 'male' | 'female';
  birthplace?: string;
  useSolarTime?: boolean;
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

  // 处理跨天
  let correctedTotalMinutes = totalMinutes;
  if (correctedTotalMinutes < 0) correctedTotalMinutes += 24 * 60;
  if (correctedTotalMinutes >= 24 * 60) correctedTotalMinutes -= 24 * 60;

  const correctedHour = Math.floor(correctedTotalMinutes / 60);
  const correctedMinute = correctedTotalMinutes % 60;

  const originalShichen = Math.floor(((hour + 1) % 24) / 2);
  const correctedShichen = Math.floor(((correctedHour + 1) % 24) / 2);

  return {
    correctedHour,
    correctedMinute,
    correction: {
      birthplace,
      longitude,
      correctionMinutes,
      originalHour: hour,
      correctedHour,
      hourPillarChanged: originalShichen !== correctedShichen,
    },
  };
}

/** 构造单柱 */
function buildPillar(ganIndex: number, zhiIndex: number, dayGanIndex: number): Pillar {
  const gan = TIAN_GAN[ganIndex];
  const zhi = DI_ZHI[zhiIndex];
  const cangGan = CANG_GAN[zhi];
  const shiShen = cangGan.map(cg => SHI_SHEN_MAP[dayGanIndex][TIAN_GAN.indexOf(cg)]);

  return {
    gan,
    zhi,
    ganIndex,
    zhiIndex,
    nayin: getNaYin(ganIndex, zhiIndex),
    cangGan,
    shiShen,
  };
}

/** 判断日主强弱 */
function calculateDayMasterStrength(
  dayGanIndex: number,
  monthPillar: Pillar,
  allPillars: Pillar[],
): string {
  const dayMasterElement = GAN_TO_ELEMENT[TIAN_GAN[dayGanIndex]];
  let score = 0;

  // 得令：月支五行与日主的关系
  const monthZhiElement = ZHI_TO_ELEMENT[monthPillar.zhi];
  if (monthZhiElement === dayMasterElement) {
    score += 2; // 同行
  } else if (WUXING_SHENG[monthZhiElement] === dayMasterElement) {
    score += 2; // 月支生我
  } else if (WUXING_KE[monthZhiElement] === dayMasterElement) {
    score -= 1; // 月支克我
  }

  // 得地：四柱藏干中与日主同五行的个数
  for (const pillar of allPillars) {
    for (const cg of pillar.cangGan) {
      if (GAN_TO_ELEMENT[cg] === dayMasterElement) {
        score += 1;
      }
    }
  }

  // 得势：年干、月干、时干中与日主同五行的个数
  for (const pillar of allPillars) {
    if (pillar === allPillars[2]) continue; // 跳过日柱（日主自己）
    if (GAN_TO_ELEMENT[pillar.gan] === dayMasterElement) {
      score += 1;
    }
  }

  if (score >= 6) return '身强';
  if (score >= 4) return '偏强';
  if (score >= 2) return '中和';
  if (score >= 0) return '偏弱';
  return '身弱';
}

/** 确定格局 */
function determinePattern(dayGanIndex: number, monthPillar: Pillar): string {
  const benQi = monthPillar.cangGan[0]; // 本气
  const shiShen = SHI_SHEN_MAP[dayGanIndex][TIAN_GAN.indexOf(benQi)];
  const patternMap: Record<string, string> = {
    '正官': '正官格',
    '七杀': '七杀格',
    '正印': '正印格',
    '偏印': '偏印格',
    '正财': '正财格',
    '偏财': '偏财格',
    '食神': '食神格',
    '伤官': '伤官格',
  };
  return patternMap[shiShen] ?? '其他格';
}

/** 确定用神/喜神/忌神（按五行名称返回） */
function determineYongShen(dayGanIndex: number, strength: string): {
  yongShen: string;
  xiShen: string;
  jiShen: string;
} {
  const dayElement = GAN_TO_ELEMENT[TIAN_GAN[dayGanIndex]];
  const isStrong = strength === '身强' || strength === '偏强';

  if (isStrong) {
    // 身强：用神=克我，喜神=我生（泄秀），忌神=同行
    return {
      yongShen: WUXING_KE[dayElement], // 克我的五行 → 从 WUXING_KE 反查
      xiShen: WUXING_SHENG[dayElement], // 我生
      jiShen: dayElement, // 同行
    };
  }

  // 身弱/偏弱/中和：用神=生我，喜神=同行，忌神=克我
  // 生我：从 WUXING_SHENG 反查
  const shengWo = Object.entries(WUXING_SHENG).find(([, v]) => v === dayElement)?.[0] ?? dayElement;
  return {
    yongShen: shengWo,
    xiShen: dayElement,
    jiShen: WUXING_KE[dayElement],
  };
}

/** 计算大运（8 步） */
function calculateDaYun(
  dayGanIndex: number,
  yearGanIndex: number,
  monthPillar: Pillar,
  gender: 'male' | 'female',
): DaYun[] {
  // 阳年 + 男 / 阴年 + 女 → 顺行；否则逆行
  const yearGanYang = yearGanIndex % 2 === 0;
  const forward = (yearGanYang && gender === 'male') || (!yearGanYang && gender === 'female');

  const daYunList: DaYun[] = [];
  let ganIdx = monthPillar.ganIndex;
  let zhiIdx = monthPillar.zhiIndex;

  for (let i = 0; i < 8; i++) {
    if (forward) {
      ganIdx = (ganIdx + 1) % 10;
      zhiIdx = (zhiIdx + 1) % 12;
    } else {
      ganIdx = (ganIdx - 1 + 10) % 10;
      zhiIdx = (zhiIdx - 1 + 12) % 12;
    }

    const gan = TIAN_GAN[ganIdx];
    const zhi = DI_ZHI[zhiIdx];
    const startAge = 3 + i * 10;
    const endAge = startAge + 9;

    daYunList.push({
      startAge,
      endAge,
      gan,
      zhi,
      cangGan: CANG_GAN[zhi],
      shiShen: SHI_SHEN_MAP[dayGanIndex][ganIdx],
    });
  }

  return daYunList;
}

/** 计算当前流年 */
function calculateCurrentLiuNian(dayGanIndex: number): LiuNian {
  const currentYear = new Date().getFullYear();
  const solar = Solar.fromYmd(currentYear, 1, 1);
  const lunar = solar.getLunar();
  const gan = lunar.getYearGanIndexExact();
  const zhi = lunar.getYearZhiIndexExact();

  return {
    year: currentYear,
    gan: TIAN_GAN[gan],
    zhi: DI_ZHI[zhi],
    shiShen: SHI_SHEN_MAP[dayGanIndex][gan],
  };
}

// ────────────────────────────────────────────
// 主函数
// ────────────────────────────────────────────

export function calculateBaziChart(input: BaziCalcInput): BaziChart {
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

  // 2. 获取农历
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  // 3. 年柱（以立春为界）
  const yearGanIndex = lunar.getYearGanIndexExact();
  const yearZhiIndex = lunar.getYearZhiIndexExact();

  // 4. 月柱（以节气为界）
  const monthGanIndex = lunar.getMonthGanIndexExact();
  const monthZhiIndex = lunar.getMonthZhiIndexExact();

  // 5. 日柱
  const dayGan = lunar.getDayGan();
  const dayZhi = lunar.getDayZhi();
  const dayGanIndex = TIAN_GAN.indexOf(dayGan);
  const dayZhiIndex = DI_ZHI.indexOf(dayZhi);

  // 6. 时柱
  const shichenIndex = Math.floor(((hour + 1) % 24) / 2);
  const hourGanIndex = TIAN_GAN.indexOf(WU_SHU_DUN[dayGanIndex][shichenIndex]);
  const hourZhiIndex = shichenIndex;

  // 7-9. 构造四柱（含纳音、藏干、十神）
  const yearPillar = buildPillar(yearGanIndex, yearZhiIndex, dayGanIndex);
  const monthPillar = buildPillar(monthGanIndex, monthZhiIndex, dayGanIndex);
  const dayPillar = buildPillar(dayGanIndex, dayZhiIndex, dayGanIndex);
  const hourPillar = buildPillar(hourGanIndex, hourZhiIndex, dayGanIndex);

  const allPillars = [yearPillar, monthPillar, dayPillar, hourPillar];

  // 10. 日主强弱
  const dayMasterStrength = calculateDayMasterStrength(dayGanIndex, monthPillar, allPillars);

  // 11. 格局
  const pattern = determinePattern(dayGanIndex, monthPillar);

  // 12. 用神/喜神/忌神
  const { yongShen, xiShen, jiShen } = determineYongShen(dayGanIndex, dayMasterStrength);

  // 13. 大运
  const daYun = calculateDaYun(dayGanIndex, yearGanIndex, monthPillar, gender);

  // 14. 当前流年
  const currentLiuNian = calculateCurrentLiuNian(dayGanIndex);

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster: dayGan,
    dayMasterElement: GAN_TO_ELEMENT[dayGan],
    dayMasterStrength,
    pattern,
    yongShen,
    xiShen,
    jiShen,
    daYun,
    currentLiuNian,
    birthYear: year,
    solarTimeCorrection,
  };
}
