/**
 * 紫微斗数常量 — 星曜分类展示映射
 *
 * iztro 的 Star.type 有 8 种分类，此处定义各分类的中文标签和 Tailwind 颜色类名，
 * 供宫位网格和摘要卡片使用。
 */

export type StarType = 'major' | 'soft' | 'tough' | 'adjective' | 'flower' | 'helper' | 'lucun' | 'tianma';

export interface StarTypeStyle {
  /** 中文标签 */
  label: string;
  /** 浅色模式文字颜色 */
  light: string;
  /** 深色模式文字颜色 */
  dark: string;
}

/** 星曜分类 → 展示样式映射 */
export const STAR_TYPE_STYLES: Record<StarType, StarTypeStyle> = {
  major:     { label: '主星', light: 'text-amber-900',   dark: 'text-amber-200' },
  soft:      { label: '吉星', light: 'text-blue-700',    dark: 'text-blue-300' },
  tough:     { label: '煞星', light: 'text-red-700',     dark: 'text-red-400' },
  adjective: { label: '杂耀', light: 'text-gray-500',    dark: 'text-gray-400' },
  flower:    { label: '桃花', light: 'text-pink-600',    dark: 'text-pink-300' },
  helper:    { label: '解神', light: 'text-emerald-600', dark: 'text-emerald-300' },
  lucun:     { label: '禄存', light: 'text-yellow-600',  dark: 'text-yellow-300' },
  tianma:    { label: '天马', light: 'text-purple-600',  dark: 'text-purple-300' },
};

/** 四化标记 → 颜色类名 */
export const SIHUA_STYLES: Record<string, { light: string; dark: string }> = {
  '禄': { light: 'text-green-600', dark: 'text-green-400' },
  '权': { light: 'text-amber-600', dark: 'text-amber-400' },
  '科': { light: 'text-blue-600',  dark: 'text-blue-400' },
  '忌': { light: 'text-red-600',   dark: 'text-red-400' },
};

/** 亮度等级 → 展示标签 */
export const BRIGHTNESS_LABELS: Record<string, string> = {
  '庙': '庙',
  '旺': '旺',
  '得': '得',
  '利': '利',
  '平': '平',
  '不': '不',
  '陷': '陷',
};

/** 小时 → iztro timeIndex 映射
 * 0=早子时(00:00-01:00), 1=丑时(01:00-03:00), ..., 11=亥时(21:00-23:00), 12=晚子时(23:00-00:00)
 */
export function hourToTimeIndex(hour: number, _minute: number): number {
  if (hour === 0) return 0;   // 早子时
  if (hour === 23) return 12; // 晚子时
  return Math.floor((hour + 1) / 2);
}

/** 12 地支名称（从子开始，用于宫位地支映射） */
export const DI_ZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

/** iztro palaces 索引 → 4×4 网格行列映射
 * palaces[0] = 寅宫, palaces[11] = 丑宫
 * 网格布局：
 *   (0,0)=巳(3) (0,1)=午(4) (0,2)=未(5) (0,3)=申(6)
 *   (1,0)=辰(2) [center]    [center]    (1,3)=酉(7)
 *   (2,0)=卯(1) [center]    [center]    (2,3)=戌(8)
 *   (3,0)=寅(0) (3,1)=丑(11)(3,2)=子(10)(3,3)=亥(9)
 */
export const PALACE_GRID_MAP: { row: number; col: number }[] = [
  { row: 3, col: 0 }, // 0: 寅
  { row: 2, col: 0 }, // 1: 卯
  { row: 1, col: 0 }, // 2: 辰
  { row: 0, col: 0 }, // 3: 巳
  { row: 0, col: 1 }, // 4: 午
  { row: 0, col: 2 }, // 5: 未
  { row: 0, col: 3 }, // 6: 申
  { row: 1, col: 3 }, // 7: 酉
  { row: 2, col: 3 }, // 8: 戌
  { row: 3, col: 3 }, // 9: 亥
  { row: 3, col: 2 }, // 10: 子
  { row: 3, col: 1 }, // 11: 丑
];
