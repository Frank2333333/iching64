/**
 * 命格翻译 — 星座 / 生肖 / 日主五行性格 + 用户自填 MBTI（纯本地展示，无 AI）
 *
 * MBTI 由用户在表单自填（自动推算不准已弃用）；星座/生肖取 iztro 已算出的结果；
 * 日主天干 → 五行性格 archetype。MBTI_TYPES 仅作展示用标签/关键词，非命理推导。
 */
import type { BaziChart } from '../lib/bazi-calculator';
import type { ZiweiChart } from '../lib/ziwei-calculator';

export interface MbtiEntry {
  label: string; // archetype 标签
  keywords: string[];
}

/** 16 型 MBTI → 展示标签与关键词（纯展示，非命理推导） */
export const MBTI_TYPES: Record<string, MbtiEntry> = {
  'INTJ': { label: '建筑师', keywords: ['独立', '战略', '决断', '完美主义'] },
  'INTP': { label: '逻辑学家', keywords: ['思辨', '好奇', '抽象', '随性'] },
  'ENTJ': { label: '指挥官', keywords: ['领导', '果断', '高效', '强势'] },
  'ENTP': { label: '辩论家', keywords: ['机智', '创新', '爱折腾', '不服'] },
  'INFJ': { label: '提倡者', keywords: ['理想', '洞察', '深思', '稀少'] },
  'INFP': { label: '调停者', keywords: ['共情', '理想', '柔韧', '内省'] },
  'ENFJ': { label: '主人公', keywords: ['热忱', '感召', '操心', '利他'] },
  'ENFP': { label: '竞选者', keywords: ['热情', '好奇', '自由', '跳脱'] },
  'ISTJ': { label: '物流师', keywords: ['务实', '严谨', '守规', '可靠'] },
  'ISFJ': { label: '守卫者', keywords: ['细腻', '忠诚', '付出', '谨慎'] },
  'ESTJ': { label: '总经理', keywords: ['组织', '直率', '传统', '执行'] },
  'ESFJ': { label: '执政官', keywords: ['热心', '合群', '体贴', '重视关系'] },
  'ISTP': { label: '鉴赏家', keywords: ['冷静', '动手', '独立', '冒险'] },
  'ISFP': { label: '探险家', keywords: ['审美', '随性', '温和', '自由'] },
  'ESTP': { label: '企业家', keywords: ['果敢', '现实', '行动', '爱刺激'] },
  'ESFP': { label: '表演者', keywords: ['活泼', '享乐', '社交', '当下'] },
};

export interface DayMasterPersonality {
  element: string;
  archetype: string;
  oneLiner: string;
}

/** 10 天干 → 五行性格 */
export const DAY_MASTER_PERSONALITY: Record<string, DayMasterPersonality> = {
  '甲': { element: '木', archetype: '参天大树', oneLiner: '刚直向上、有担当，骨子里带股轴劲' },
  '乙': { element: '木', archetype: '藤蔓花草', oneLiner: '柔韧灵活、善借力，以柔克刚' },
  '丙': { element: '火', archetype: '太阳之火', oneLiner: '热情外放、光明磊落，天生想照亮别人' },
  '丁': { element: '火', archetype: '灯烛之火', oneLiner: '温柔细腻、心思灵秀，外柔内秀' },
  '戊': { element: '土', archetype: '城墙之土', oneLiner: '厚重可靠、包容稳重，慢热但稳' },
  '己': { element: '土', archetype: '田园之土', oneLiner: '谦和内敛、默默滋养，低调的付出者' },
  '庚': { element: '金', archetype: '顽矿之金', oneLiner: '刚毅果决、重义气，宁折不弯' },
  '辛': { element: '金', archetype: '珠宝之金', oneLiner: '精致敏锐、爱美重情，外冷内热' },
  '壬': { element: '水', archetype: '江海之水', oneLiner: '智变灵活、奔放不羁，适应力极强' },
  '癸': { element: '水', archetype: '雨露之水', oneLiner: '温柔聪慧、润物无声，心思细密' },
};

export interface PersonalityProfile {
  mbti: string; // 用户自填（未填为 '—'）
  mbtiLabel: string;
  mbtiKeywords: string[];
  hasMbti: boolean;
  mingStar: string; // 命宫主星名（或借星）
  borrowed: boolean; // 命宫空宫借对宫主星
  sign: string; // 星座
  zodiac: string; // 生肖
  dayMaster: string;
  dayMasterElement: string;
  dayMasterArchetype: string;
  dayMasterOneLiner: string;
}

/** 由双盘 + 用户自填 MBTI 抽取命格翻译展示数据 */
export function getPersonalityProfile(
  baziChart: BaziChart | null,
  ziweiChart: ZiweiChart | null,
  mbti?: string,
): PersonalityProfile | null {
  if (!baziChart || !ziweiChart) return null;

  // 命宫按 earthlyBranch === soulPalace 定位
  const mingGong = ziweiChart.palaces.find(p => p.earthlyBranch === ziweiChart.soulPalace);
  let mingStar = '';
  let borrowed = false;
  if (mingGong && mingGong.majorStars.length > 0) {
    mingStar = mingGong.majorStars[0].name;
  } else if (mingGong && mingGong.borrowedStars && mingGong.borrowedStars.length > 0) {
    mingStar = mingGong.borrowedStars[0];
    borrowed = true;
  }

  const mbtiNorm = (mbti || '').trim().toUpperCase();
  const hasMbti = !!mbtiNorm && !!MBTI_TYPES[mbtiNorm];
  const mbtiEntry = hasMbti ? MBTI_TYPES[mbtiNorm] : undefined;
  const dm = DAY_MASTER_PERSONALITY[baziChart.dayMaster];

  return {
    mbti: hasMbti ? mbtiNorm : '—',
    mbtiLabel: mbtiEntry?.label || '未填写',
    mbtiKeywords: mbtiEntry?.keywords || [],
    hasMbti,
    mingStar: mingStar || '空宫',
    borrowed,
    sign: ziweiChart.sign || '—',
    zodiac: ziweiChart.zodiac || '—',
    dayMaster: baziChart.dayMaster,
    dayMasterElement: dm?.element || baziChart.dayMasterElement,
    dayMasterArchetype: dm?.archetype || '—',
    dayMasterOneLiner: dm?.oneLiner || '',
  };
}
