/**
 * 八字排盘基础常量
 *
 * 所有索引均从 0 开始：
 * - 天干索引 0-9 对应 甲乙丙丁戊己庚辛壬癸
 * - 地支索引 0-11 对应 子丑寅卯辰巳午未申酉戌亥
 */

// ────────────────────────────────────────────
// 天干 / 地支
// ────────────────────────────────────────────

/** 十天干 */
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

/** 十二地支 */
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

// ────────────────────────────────────────────
// 五行映射
// ────────────────────────────────────────────

/** 天干 → 五行 */
export const GAN_TO_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

/** 地支 → 五行 */
export const ZHI_TO_ELEMENT: Record<string, string> = {
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木', '辰': '土',
  '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土',
  '亥': '水',
};

// ────────────────────────────────────────────
// 五行生克
// ────────────────────────────────────────────

/** 五行相生：木→火→土→金→水→木 */
export const WUXING_SHENG: Record<string, string> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
};

/** 五行相克：木→土→水→火→金→木 */
export const WUXING_KE: Record<string, string> = {
  '木': '土', '火': '金', '土': '水', '金': '木', '水': '火',
};

// ────────────────────────────────────────────
// 纳音
// ────────────────────────────────────────────

/**
 * 六十甲子纳音（30 条，每两条甲子共用一个纳音）
 * 索引 i 对应第 i 对甲子的纳音
 */
export const NA_YIN = [
  '海中金', '炉中火', '大林木', '路旁土', '剑锋金',
  '山头火', '涧下水', '城头土', '白蜡金', '杨柳木',
  '泉中水', '屋上土', '霹雳火', '松柏木', '长流水',
  '砂石金', '山下火', '平地木', '壁上土', '金箔金',
  '覆灯火', '天河水', '大驿土', '钗钏金', '桑柘木',
  '大溪水', '砂中土', '天上火', '石榴木', '大海水',
] as const;

// ────────────────────────────────────────────
// 藏干
// ────────────────────────────────────────────

/** 十二地支藏干 */
export const CANG_GAN: Record<string, string[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

// ────────────────────────────────────────────
// 五虎遁 / 五鼠遁
// ────────────────────────────────────────────

/**
 * 五虎遁：年干 → 各月天干起始
 *
 * 口诀：甲己之年丙作首，乙庚之岁戊为头，
 *       丙辛之岁庚为先，丁壬壬寅顺水流，
 *       戊癸甲寅好追求。
 *
 * WU_HU_DUN[i] 表示天干索引 i 对应的 12 个月天干数组。
 * 索引 5-9 与 0-4 相同（甲己同、乙庚同……）。
 */
export const WU_HU_DUN: string[][] = (() => {
  const starts = [2, 4, 6, 8, 0]; // 丙、戊、庚、壬、甲 在 TIAN_GAN 中的索引
  const result: string[][] = [];
  for (let i = 0; i < 10; i++) {
    const base = starts[i % 5];
    const months: string[] = [];
    for (let m = 0; m < 12; m++) {
      months.push(TIAN_GAN[(base + m) % 10]);
    }
    result.push(months);
  }
  return result;
})();

/**
 * 五鼠遁：日干 → 各时辰天干起始
 *
 * 口诀：甲己还加甲，乙庚丙作初，
 *       丙辛从戊起，丁壬庚子居，
 *       戊癸何方发，壬子是真途。
 *
 * WU_SHU_DUN[i] 表示天干索引 i 对应的 12 个时辰天干数组。
 * 索引 5-9 与 0-4 相同。
 */
export const WU_SHU_DUN: string[][] = (() => {
  const starts = [0, 2, 4, 6, 8]; // 甲、丙、戊、庚、壬 在 TIAN_GAN 中的索引
  const result: string[][] = [];
  for (let i = 0; i < 10; i++) {
    const base = starts[i % 5];
    const shichen: string[] = [];
    for (let s = 0; s < 12; s++) {
      shichen.push(TIAN_GAN[(base + s) % 10]);
    }
    result.push(shichen);
  }
  return result;
})();

// ────────────────────────────────────────────
// 十神
// ────────────────────────────────────────────

/** 五行序：木0 火1 土2 金3 水4 */
const ELEMENT_ORDER = ['木', '火', '土', '金', '水'] as const;

/**
 * 十神映射：SHI_SHEN_MAP[日干索引][他干索引] → 十神名称
 *
 * 阳干（偶数索引）：甲0 丙2 戊4 庚6 壬8
 * 阴干（奇数索引）：乙1 丁3 己5 辛7 癸9
 *
 * 五行序：木0 火1 土2 金3 水4
 * 相生方向：(el+1)%5，如 木→火→土→金→水→木
 * 相克方向：(el+2)%5，如 木→土→水→火→金→木
 *
 * 十神规则：
 * - 同五行同阴阳 → 比肩，异阴阳 → 劫财
 * - 我生(+1)同阴阳 → 食神，异阴阳 → 伤官
 * - 我克(+2)同阴阳 → 偏财，异阴阳 → 正财
 * - 克我(+3)同阴阳 → 七杀，异阴阳 → 正官
 * - 生我(+4)同阴阳 → 偏印，异阴阳 → 正印
 */
export const SHI_SHEN_MAP: string[][] = (() => {
  const ganElement: number[] = [];
  for (let i = 0; i < 10; i++) {
    ganElement.push(ELEMENT_ORDER.indexOf(GAN_TO_ELEMENT[TIAN_GAN[i]] as typeof ELEMENT_ORDER[number]));
  }

  const sameYinYang = (a: number, b: number) => (a % 2) === (b % 2);

  const map: string[][] = [];
  for (let dayGan = 0; dayGan < 10; dayGan++) {
    const row: string[] = [];
    const dayEl = ganElement[dayGan];

    for (let otherGan = 0; otherGan < 10; otherGan++) {
      const otherEl = ganElement[otherGan];
      const same = sameYinYang(dayGan, otherGan);

      if (dayEl === otherEl) {
        row.push(same ? '比肩' : '劫财');
      } else if ((dayEl + 1) % 5 === otherEl) {
        row.push(same ? '食神' : '伤官');
      } else if ((dayEl + 2) % 5 === otherEl) {
        row.push(same ? '偏财' : '正财');
      } else if ((dayEl + 3) % 5 === otherEl) {
        row.push(same ? '七杀' : '正官');
      } else {
        // (dayEl + 4) % 5 === otherEl → 生我
        row.push(same ? '偏印' : '正印');
      }
    }
    map.push(row);
  }
  return map;
})();

// ────────────────────────────────────────────
// 辅助函数
// ────────────────────────────────────────────

/**
 * 计算六十甲子序号（1-60）
 * @param ganIndex 天干索引 0-9
 * @param zhiIndex 地支索引 0-11
 */
export function getJiaZiNumber(ganIndex: number, zhiIndex: number): number {
  // 从 ganIndex 开始，每次加 10（天干周期），检查是否满足地支条件
  for (let k = 0; k < 6; k++) {
    const n1 = ganIndex + k * 10;
    if (n1 % 12 === zhiIndex) {
      return n1 + 1;
    }
  }
  return -1; // 无效干支组合
}

/**
 * 根据天干/地支索引获取纳音
 * @param ganIndex 天干索引 0-9
 * @param zhiIndex 地支索引 0-11
 */
export function getNaYin(ganIndex: number, zhiIndex: number): string {
  const jiaZiNum = getJiaZiNumber(ganIndex, zhiIndex);
  // 每两个甲子共用一个纳音：甲子1/乙丑2→索引0, 丙寅3/丁卯4→索引1, …
  return NA_YIN[Math.floor((jiaZiNum - 1) / 2)];
}
