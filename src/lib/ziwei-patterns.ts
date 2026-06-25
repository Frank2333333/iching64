/**
 * 紫微斗数格局检测引擎
 *
 * 移植自参考项目 Renhuai123/ziwei-doushu 的 patterns.ts，
 * 适配本项目的 ZiweiChart/Palace/Star 类型体系。
 *
 * 关键适配：本项目的 palaces 索引从寅(0)开始，
 * 传统地支编号从子(0)开始，转换公式：branch = (index + 2) % 12
 */

import type { ZiweiChart, Palace } from './ziwei-calculator';

// ────────────────────────────────────────────
// 类型定义
// ────────────────────────────────────────────

export interface PatternCondition {
  required: string[];
  bonus?: string[];
  breaking?: string[];
}

export interface Pattern {
  name: string;
  level: 'excellent' | 'good' | 'neutral' | 'caution';
  description: string;
  palaces: string[];
  conditions?: PatternCondition;
  source?: string;
}

// ────────────────────────────────────────────
// 常量
// ────────────────────────────────────────────

const SHA_HARD = ['擎羊', '陀罗', '火星', '铃星'];
const SHA_KONG = ['地空', '地劫'];
const ZUO_YOU = ['左辅', '右弼'];
const CHANG_QU = ['文昌', '文曲'];
const KUI_YUE = ['天魁', '天钺'];

// ────────────────────────────────────────────
// 辅助函数
// ────────────────────────────────────────────

/** 宫位索引 → 地支编号（0=子, 1=丑, ..., 11=亥） */
function toBranch(palaceIndex: number): number {
  return ((palaceIndex + 2) % 12 + 12) % 12;
}

/** 地支编号 → 宫位索引 */
// function toIndex(branch: number): number {
//   return ((branch - 2) % 12 + 12) % 12;
// }

/** 获取宫位所有星曜名（主星+辅星+杂耀） */
function getAllStarNames(palace: Palace): string[] {
  return [
    ...palace.majorStars,
    ...palace.minorStars,
    ...palace.adjectiveStars,
  ].map(s => s.name);
}

/** 宫位内是否有指定星曜 */
function hasStar(palace: Palace, name: string): boolean {
  return getAllStarNames(palace).includes(name);
}

/** 查找指定星曜所在的宫位 */
function findStarPalace(chart: ZiweiChart, name: string): Palace | undefined {
  return chart.palaces.find(p => hasStar(p, name));
}

/** 根据地支编号找宫位 */
function getPalaceByBranch(chart: ZiweiChart, branch: number): Palace | undefined {
  return chart.palaces.find(p => toBranch(p.index) === ((branch % 12) + 12) % 12);
}

/** 找命宫 */
function getMingGong(chart: ZiweiChart): Palace {
  return chart.palaces.find(p => p.name === '命宫')!;
}

/** 计算煞星数量 */
function shaCountInPalace(palace: Palace, list: string[]): number {
  return getAllStarNames(palace).filter(n => list.includes(n)).length;
}

/** 是否有煞星 */
function hasShaInPalace(palace: Palace, list: string[]): boolean {
  return shaCountInPalace(palace, list) > 0;
}

/** 命宫三方四正的地支编号 */
function getSanFangBranches(chart: ZiweiChart): number[] {
  const mingBranch = toBranch(getMingGong(chart).index);
  return [
    mingBranch,
    (mingBranch + 6) % 12,  // 对宫（迁移）
    (mingBranch + 4) % 12,  // 三合1（财帛方向）
    (mingBranch + 8) % 12,  // 三合2（官禄方向）
  ];
}

/** 某地支是否在命宫三方四正 */
function isInSanFang(chart: ZiweiChart, branch: number): boolean {
  return getSanFangBranches(chart).includes(((branch % 12) + 12) % 12);
}

/** 三方四正所有宫位 */
function getSanFangPalaces(chart: ZiweiChart): Palace[] {
  return getSanFangBranches(chart).map(b => getPalaceByBranch(chart, b)).filter(Boolean) as Palace[];
}

/** 三方四正所有星名 */
function sanFangAllStars(chart: ZiweiChart): Set<string> {
  const stars = new Set<string>();
  for (const p of getSanFangPalaces(chart)) {
    for (const n of getAllStarNames(p)) stars.add(n);
  }
  return stars;
}

/** 三方四正煞星计数 */
function sanFangShaCount(chart: ZiweiChart, list: string[]): number {
  let count = 0;
  for (const p of getSanFangPalaces(chart)) {
    count += shaCountInPalace(p, list);
  }
  return count;
}

/** 夹宫（前后相邻宫位） */
function getJiaPalaces(chart: ZiweiChart, branch: number): { prev: Palace | undefined; next: Palace | undefined } {
  return {
    prev: getPalaceByBranch(chart, (branch + 11) % 12),
    next: getPalaceByBranch(chart, (branch + 1) % 12),
  };
}

/** 判断星曜亮度 */
function isBright(palace: Palace, starName: string): boolean {
  const star = palace.majorStars.find(s => s.name === starName);
  if (!star?.brightness) return false;
  return ['庙', '旺'].includes(star.brightness);
}

function isDim(palace: Palace, starName: string): boolean {
  const star = palace.majorStars.find(s => s.name === starName);
  if (!star?.brightness) return false;
  return ['陷', '不'].includes(star.brightness);
}

/** 获取星曜四化 */
function getStarSiHua(palace: Palace, starName: string): string | undefined {
  const star = [...palace.majorStars, ...palace.minorStars].find(s => s.name === starName);
  return star?.mutagen;
}

// ────────────────────────────────────────────
// 格局检测器
// ────────────────────────────────────────────

/** 君臣庆会 */
function detectJunChenQingHui(chart: ZiweiChart): Pattern | null {
  const ming = getMingGong(chart);
  const sanFang = sanFangAllStars(chart);
  const required = [];
  if (!hasStar(ming, '紫微')) return null;
  if (!ZUO_YOU.every(s => sanFang.has(s))) return null;
  required.push('紫微在命', '左辅右弼在三方');

  const bonus: string[] = [];
  if (CHANG_QU.every(s => sanFang.has(s))) bonus.push('文昌文曲加会');
  if (KUI_YUE.every(s => sanFang.has(s))) bonus.push('天魁天钺加会');
  if (getStarSiHua(ming, '紫微') === '权') bonus.push('紫微化权');

  const breaking: string[] = [];
  if (sanFangShaCount(chart, SHA_KONG) >= 2) breaking.push('地空地劫同会');

  return {
    name: '君臣庆会',
    level: breaking.length > 0 ? 'good' : 'excellent',
    description: '紫微在命宫，左辅右弼同会三方四正，主大贵，可掌权柄。',
    palaces: ['命宫'],
    conditions: { required, bonus: bonus.length > 0 ? bonus : undefined, breaking: breaking.length > 0 ? breaking : undefined },
    source: '《紫微斗数全书·君臣庆会格》',
  };
}

/** 紫府同宫 */
function detectZiFu(chart: ZiweiChart): Pattern | null {
  const ziweiP = findStarPalace(chart, '紫微');
  if (!ziweiP) return null;
  if (!hasStar(ziweiP, '天府')) return null;

  const inMing = ziweiP.name === '命宫';
  const sanFang = sanFangAllStars(chart);

  const bonus: string[] = [];
  if (ZUO_YOU.every(s => sanFang.has(s))) bonus.push('左辅右弼会照');
  if (CHANG_QU.every(s => sanFang.has(s))) bonus.push('文昌文曲会照');

  const breaking: string[] = [];
  if (hasShaInPalace(ziweiP, SHA_KONG)) breaking.push('空劫同宫');
  if (shaCountInPalace(ziweiP, SHA_HARD) >= 2) breaking.push('煞星云集');

  return {
    name: '紫府同宫',
    level: inMing && breaking.length === 0 ? 'excellent' : (breaking.length > 0 ? 'good' : 'good'),
    description: '紫微天府同宫，主大富大贵，具有领导才能。',
    palaces: [ziweiP.name],
    conditions: { required: ['紫微天府同宫'], bonus: bonus.length > 0 ? bonus : undefined, breaking: breaking.length > 0 ? breaking : undefined },
    source: '《紫微斗数全书·紫府同宫格》',
  };
}

/** 府相朝垣 */
function detectFuXiangChaoYuan(chart: ZiweiChart): Pattern | null {
  const sanFang = sanFangAllStars(chart);
  if (!sanFang.has('天府') || !sanFang.has('天相')) return null;

  const tfP = findStarPalace(chart, '天府');
  const txP = findStarPalace(chart, '天相');
  if (!tfP || !txP) return null;
  if (tfP.index === txP.index) return null;  // 同宫不算朝垣

  const ming = getMingGong(chart);
  const bonus: string[] = [];
  const huaLuStar = [...ming.majorStars, ...ming.minorStars].find(s => s.mutagen === '禄');
  const lucunP = findStarPalace(chart, '禄存');
  if (huaLuStar || (lucunP && lucunP.name === '命宫')) bonus.push('禄入命宫');
  if (sanFang.has('左辅')) bonus.push('左辅会照');

  const breaking: string[] = [];
  if (hasShaInPalace(ming, [...SHA_HARD, ...SHA_KONG])) breaking.push('煞星入命');
  if (sanFangShaCount(chart, SHA_HARD) >= 3) breaking.push('三方煞重');

  return {
    name: '府相朝垣',
    level: breaking.length > 0 ? 'good' : 'excellent',
    description: '天府天相会照命宫三方，主衣禄丰厚，为人稳重。',
    palaces: [tfP.name, txP.name],
    conditions: { required: ['天府天相会照三方'], bonus: bonus.length > 0 ? bonus : undefined, breaking: breaking.length > 0 ? breaking : undefined },
    source: '《紫微斗数全书·府相朝垣格》',
  };
}

/** 阳梁昌禄 */
function detectYangLiangChangLu(chart: ZiweiChart): Pattern | null {
  const sanFang = sanFangAllStars(chart);
  if (!['太阳', '天梁', '文昌', '禄存'].every(s => sanFang.has(s))) return null;

  const sunP = findStarPalace(chart, '太阳');
  const liangP = findStarPalace(chart, '天梁');
  const bonus: string[] = [];
  if (sunP && isBright(sunP, '太阳')) bonus.push('太阳庙旺');
  if (liangP && isBright(liangP, '天梁')) bonus.push('天梁庙旺');

  const breaking: string[] = [];
  if (sunP && isDim(sunP, '太阳')) breaking.push('太阳落陷');
  if (sanFangShaCount(chart, SHA_HARD) >= 2) breaking.push('煞重');

  return {
    name: '阳梁昌禄',
    level: breaking.length > 0 ? 'good' : 'excellent',
    description: '太阳天梁文昌禄存会照，主聪明才智，考试得意，宜文职。',
    palaces: ['命宫'],
    conditions: { required: ['太阳天梁文昌禄存会照'], bonus, breaking: breaking.length > 0 ? breaking : undefined },
    source: '《紫微斗数全书·阳梁昌禄格》',
  };
}

/** 火贪格 / 铃贪格 */
function detectHuoTanLingTan(chart: ZiweiChart): Pattern[] {
  const patterns: Pattern[] = [];
  const tanP = findStarPalace(chart, '贪狼');
  if (!tanP) return patterns;
  const tanBranch = toBranch(tanP.index);
  if (!isInSanFang(chart, tanBranch)) return patterns;

  const checkFire = (name: string, label: string) => {
    const fireP = findStarPalace(chart, name);
    if (!fireP) return;
    const fireBranch = toBranch(fireP.index);
    const isNear = tanBranch === fireBranch
      || (tanBranch + 4) % 12 === fireBranch
      || (tanBranch + 8) % 12 === fireBranch
      || (tanBranch + 6) % 12 === fireBranch;
    if (!isNear) return;

    const bonus: string[] = [];
    if (isBright(tanP, '贪狼')) bonus.push('贪狼庙旺');
    if (getStarSiHua(tanP, '贪狼') === '禄' || getStarSiHua(tanP, '贪狼') === '权') bonus.push('贪狼化禄/权');

    const breaking: string[] = [];
    if (hasStar(tanP, '擎羊') || hasStar(tanP, '陀罗')) breaking.push('羊陀同宫');
    if (hasShaInPalace(tanP, SHA_KONG)) breaking.push('空劫同宫');

    patterns.push({
      name: label,
      level: breaking.length > 0 ? 'good' : 'excellent',
      description: `${name}与贪狼交会，主爆发性财运，横发之格。`,
      palaces: [tanP.name],
      conditions: { required: [`${name}贪狼交会`], bonus: bonus.length > 0 ? bonus : undefined, breaking: breaking.length > 0 ? breaking : undefined },
      source: '《紫微斗数骨髓赋》',
    });
  };

  checkFire('火星', '火贪格');
  checkFire('铃星', '铃贪格');
  return patterns;
}

/** 武贪格 */
function detectWuTan(chart: ZiweiChart): Pattern | null {
  const wuP = findStarPalace(chart, '武曲');
  const tanP = findStarPalace(chart, '贪狼');
  if (!wuP || !tanP) return null;

  const wuBranch = toBranch(wuP.index);
  const tanBranch = toBranch(tanP.index);
  const sameOrOpp = wuBranch === tanBranch || (wuBranch + 6) % 12 === tanBranch;
  if (!sameOrOpp) return null;
  if (!isInSanFang(chart, wuBranch) && !isInSanFang(chart, tanBranch)) return null;

  const bonus: string[] = [];
  const sanFang = sanFangAllStars(chart);
  if (sanFang.has('火星') || sanFang.has('铃星')) bonus.push('火铃加会');
  if (getStarSiHua(wuP, '武曲') === '禄') bonus.push('武曲化禄');

  const breaking: string[] = [];
  if (hasStar(wuP, '擎羊') || hasStar(wuP, '陀罗')) breaking.push('羊陀同宫');
  if (hasShaInPalace(wuP, SHA_KONG) || hasShaInPalace(tanP, SHA_KONG)) breaking.push('空劫同宫');

  return {
    name: '武贪格',
    level: breaking.length > 0 ? 'good' : 'excellent',
    description: '武曲贪狼同宫或对照，主财运旺盛，但需晚发。',
    palaces: [wuP.name, tanP.name],
    conditions: { required: ['武曲贪狼同宫或对照'], bonus: bonus.length > 0 ? bonus : undefined, breaking: breaking.length > 0 ? breaking : undefined },
    source: '《紫微斗数骨髓赋》',
  };
}

/** 杀破狼 */
function detectShaPoLang(chart: ZiweiChart): Pattern | null {
  const sanFang = sanFangAllStars(chart);
  if (!['七杀', '破军', '贪狼'].every(s => sanFang.has(s))) return null;

  const ming = getMingGong(chart);
  const bonus: string[] = [];
  const hasHuaLu = getSanFangPalaces(chart).some(p =>
    [...p.majorStars, ...p.minorStars].some(s => s.mutagen === '禄'));
  const hasHuaQuan = getSanFangPalaces(chart).some(p =>
    [...p.majorStars, ...p.minorStars].some(s => s.mutagen === '权'));
  if (hasHuaLu || hasHuaQuan) bonus.push('化禄/化权会照');
  if (ZUO_YOU.every(s => sanFang.has(s))) bonus.push('左辅右弼会照');

  const breaking: string[] = [];
  if (sanFangShaCount(chart, SHA_HARD) >= 3) breaking.push('三方煞重');
  if (hasShaInPalace(ming, SHA_KONG)) breaking.push('空劫入命');

  return {
    name: '杀破狼',
    level: breaking.length > 0 ? 'caution' : 'good',
    description: '七杀破军贪狼会照三方，主开创变革，一生波折较多但可成大器。',
    palaces: ['命宫'],
    conditions: { required: ['七杀破军贪狼会照'], bonus: bonus.length > 0 ? bonus : undefined, breaking: breaking.length > 0 ? breaking : undefined },
    source: '《紫微斗数全书·杀破狼》',
  };
}

/** 机月同梁 */
function detectJiYueTongLiang(chart: ZiweiChart): Pattern | null {
  const sanFang = sanFangAllStars(chart);
  if (!['天机', '太阴', '天同', '天梁'].every(s => sanFang.has(s))) return null;

  const ming = getMingGong(chart);
  const bonus: string[] = [];
  if (CHANG_QU.every(s => sanFang.has(s))) bonus.push('文昌文曲加会');
  const hasHuaKe = getSanFangPalaces(chart).some(p =>
    [...p.majorStars, ...p.minorStars].some(s => s.mutagen === '科'));
  if (hasHuaKe) bonus.push('化科会照');

  const breaking: string[] = [];
  if (sanFangShaCount(chart, SHA_HARD) >= 3) breaking.push('三方煞重');
  if (hasShaInPalace(ming, SHA_HARD)) breaking.push('煞星入命');

  return {
    name: '机月同梁',
    level: breaking.length > 0 ? 'good' : 'excellent',
    description: '天机太阴天同天梁会照三方，主文职清贵，宜公务员、企管。',
    palaces: ['命宫'],
    conditions: { required: ['天机太阴天同天梁会照'], bonus: bonus.length > 0 ? bonus : undefined, breaking: breaking.length > 0 ? breaking : undefined },
    source: '《紫微斗数全书·机月同梁格》',
  };
}

/** 日月夹命 */
function detectRiYueJiaMing(chart: ZiweiChart): Pattern | null {
  const ming = getMingGong(chart);
  const mingBranch = toBranch(ming.index);
  const { prev, next } = getJiaPalaces(chart, mingBranch);
  if (!prev || !next) return null;

  const prevStars = getAllStarNames(prev);
  const nextStars = getAllStarNames(next);
  const hasSunPrev = prevStars.includes('太阳') && nextStars.includes('太阴');
  const hasMoonPrev = prevStars.includes('太阴') && nextStars.includes('太阳');
  if (!hasSunPrev && !hasMoonPrev) return null;

  const sunP = findStarPalace(chart, '太阳');
  const moonP = findStarPalace(chart, '太阴');
  const breaking: string[] = [];
  if (sunP && isDim(sunP, '太阳')) breaking.push('太阳落陷');
  if (moonP && isDim(moonP, '太阴')) breaking.push('太阴落陷');

  return {
    name: '日月夹命',
    level: breaking.length > 0 ? 'good' : 'excellent',
    description: '太阳太阴夹命宫，主富贵双全，日月同辉。',
    palaces: ['命宫'],
    conditions: { required: ['太阳太阴夹命'], breaking: breaking.length > 0 ? breaking : undefined },
    source: '《紫微斗数全书·日月夹命》',
  };
}

/** 巨日同宫 */
function detectJuRiTongGong(chart: ZiweiChart): Pattern | null {
  const juP = findStarPalace(chart, '巨门');
  if (!juP) return null;
  if (!hasStar(juP, '太阳')) return null;

  const juBranch = toBranch(juP.index);
  if (juBranch !== 2 && juBranch !== 8) return null;  // 寅(2)或申(8)

  const inMing = juP.name === '命宫';
  const bonus: string[] = [];
  if (juBranch === 2) bonus.push('寅宫太阳庙旺');
  if (getStarSiHua(juP, '巨门') === '禄' || getStarSiHua(juP, '巨门') === '权') bonus.push('巨门化禄/权');

  const breaking: string[] = [];
  if (getStarSiHua(juP, '巨门') === '忌') breaking.push('巨门化忌');
  if (juBranch === 8) breaking.push('申宫太阳偏西');

  let level: Pattern['level'] = 'good';
  if (inMing && juBranch === 2 && breaking.length === 0) level = 'excellent';
  else if (breaking.length > 0) level = 'caution';

  return {
    name: '巨日同宫',
    level,
    description: '巨门太阳同宫于寅申，主口才出众，可凭言辞得利。',
    palaces: [juP.name],
    conditions: { required: ['巨门太阳同宫于寅申'], bonus, breaking: breaking.length > 0 ? breaking : undefined },
    source: '《紫微斗数全书·巨日同宫》',
  };
}

/** 辅弼夹命 */
function detectFuBiJiaMing(chart: ZiweiChart): Pattern | null {
  const ming = getMingGong(chart);
  const mingBranch = toBranch(ming.index);
  const { prev, next } = getJiaPalaces(chart, mingBranch);
  if (!prev || !next) return null;

  const prevS = getAllStarNames(prev);
  const nextS = getAllStarNames(next);
  const ok = (prevS.includes('左辅') && nextS.includes('右弼'))
    || (prevS.includes('右弼') && nextS.includes('左辅'));
  if (!ok) return null;

  return {
    name: '辅弼夹命',
    level: 'excellent',
    description: '左辅右弼夹命宫，主贵人多助，一生物资不缺。',
    palaces: ['命宫'],
    conditions: { required: ['左辅右弼夹命'] },
    source: '《紫微斗数全书·辅弼夹命》',
  };
}

/** 昌曲夹命 */
function detectChangQuJiaMing(chart: ZiweiChart): Pattern | null {
  const ming = getMingGong(chart);
  const mingBranch = toBranch(ming.index);
  const { prev, next } = getJiaPalaces(chart, mingBranch);
  if (!prev || !next) return null;

  const prevS = getAllStarNames(prev);
  const nextS = getAllStarNames(next);
  const ok = (prevS.includes('文昌') && nextS.includes('文曲'))
    || (prevS.includes('文曲') && nextS.includes('文昌'));
  if (!ok) return null;

  return {
    name: '昌曲夹命',
    level: 'excellent',
    description: '文昌文曲夹命宫，主聪明好学，文采斐然。',
    palaces: ['命宫'],
    conditions: { required: ['文昌文曲夹命'] },
    source: '《紫微斗数全书》',
  };
}

/** 双禄朝垣 */
function detectShuangLuChaoYuan(chart: ZiweiChart): Pattern | null {
  const sanFang = getSanFangPalaces(chart);
  const hasHuaLu = sanFang.some(p => [...p.majorStars, ...p.minorStars].some(s => s.mutagen === '禄'));
  const hasLucun = sanFang.some(p => getAllStarNames(p).includes('禄存'));
  if (!hasHuaLu || !hasLucun) return null;

  return {
    name: '双禄朝垣',
    level: 'excellent',
    description: '化禄与禄存同会三方四正，主财运亨通，一生富足。',
    palaces: ['命宫'],
    conditions: { required: ['化禄与禄存同会三方'] },
    source: '《紫微斗数全书·双禄朝垣》',
  };
}

/** 三奇加会 */
function detectSanQiJiaHui(chart: ZiweiChart): Pattern | null {
  const sanFang = getSanFangPalaces(chart);
  const allMutagens = sanFang.flatMap(p => [...p.majorStars, ...p.minorStars].map(s => s.mutagen)).filter(Boolean);
  if (!allMutagens.includes('禄') || !allMutagens.includes('权') || !allMutagens.includes('科')) return null;

  return {
    name: '三奇加会',
    level: 'excellent',
    description: '化禄化权化科三方齐聚，主大富大贵，一生顺遂。',
    palaces: ['命宫'],
    conditions: { required: ['化禄化权化科三方齐聚'] },
    source: '《紫微斗数全书·三奇加会》',
  };
}

/** 化禄入命 */
function detectHuaLuRuMing(chart: ZiweiChart): Pattern | null {
  const ming = getMingGong(chart);
  if (!ming.majorStars.some(s => s.mutagen === '禄') && !ming.minorStars.some(s => s.mutagen === '禄')) return null;

  return {
    name: '化禄入命',
    level: 'good',
    description: '化禄星入命宫，主财运亨通，一生多顺遂。',
    palaces: ['命宫'],
    conditions: { required: ['化禄入命'] },
    source: '《紫微斗数全书》',
  };
}

/** 化忌入命/迁 */
function detectHuaJiRuMingQian(chart: ZiweiChart): Pattern[] {
  const patterns: Pattern[] = [];
  const ming = getMingGong(chart);
  const qianP = chart.palaces.find(p => toBranch(p.index) === (toBranch(ming.index) + 6) % 12);

  if (ming.majorStars.some(s => s.mutagen === '忌') || ming.minorStars.some(s => s.mutagen === '忌')) {
    patterns.push({
      name: '化忌入命',
      level: 'caution',
      description: '化忌入命宫，主波折阻碍，需谨慎行事。',
      palaces: ['命宫'],
      conditions: { required: ['化忌入命'] },
      source: '《紫微斗数全书》',
    });
  }
  if (qianP && (qianP.majorStars.some(s => s.mutagen === '忌') || qianP.minorStars.some(s => s.mutagen === '忌'))) {
    patterns.push({
      name: '化忌入迁',
      level: 'caution',
      description: '化忌入迁移宫（对宫），主外出不利，人际关系有阻。',
      palaces: ['迁移'],
      conditions: { required: ['化忌入迁'] },
      source: '《紫微斗数全书》',
    });
  }
  return patterns;
}

/** 羊陀夹忌 */
function detectYangTuoJiaJi(chart: ZiweiChart): Pattern | null {
  const ming = getMingGong(chart);
  if (!ming.majorStars.some(s => s.mutagen === '忌') && !ming.minorStars.some(s => s.mutagen === '忌')) return null;

  const mingBranch = toBranch(ming.index);
  const { prev, next } = getJiaPalaces(chart, mingBranch);
  if (!prev || !next) return null;

  const prevS = getAllStarNames(prev);
  const nextS = getAllStarNames(next);
  const ok = (prevS.includes('擎羊') && nextS.includes('陀罗'))
    || (prevS.includes('陀罗') && nextS.includes('擎羊'));
  if (!ok) return null;

  return {
    name: '羊陀夹忌',
    level: 'caution',
    description: '化忌在命宫，擎羊陀罗夹之，主灾厄缠身，需防官非刑伤。',
    palaces: ['命宫'],
    conditions: { required: ['化忌入命，擎羊陀罗夹命'] },
    source: '《紫微斗数骨髓赋·羊陀夹忌》',
  };
}

/** 火铃夹命 */
function detectHuoLingJiaMing(chart: ZiweiChart): Pattern | null {
  const ming = getMingGong(chart);
  const mingBranch = toBranch(ming.index);
  const { prev, next } = getJiaPalaces(chart, mingBranch);
  if (!prev || !next) return null;

  const prevS = getAllStarNames(prev);
  const nextS = getAllStarNames(next);
  const ok = (prevS.includes('火星') && nextS.includes('铃星'))
    || (prevS.includes('铃星') && nextS.includes('火星'));
  if (!ok) return null;

  return {
    name: '火铃夹命',
    level: 'caution',
    description: '火星铃星夹命宫，主性急暴躁，一生多波折。',
    palaces: ['命宫'],
    conditions: { required: ['火星铃星夹命'] },
    source: '《紫微斗数全书》',
  };
}

/** 空劫夹命 */
function detectKongJieJiaMing(chart: ZiweiChart): Pattern | null {
  const ming = getMingGong(chart);
  const mingBranch = toBranch(ming.index);
  const { prev, next } = getJiaPalaces(chart, mingBranch);
  if (!prev || !next) return null;

  const prevS = getAllStarNames(prev);
  const nextS = getAllStarNames(next);
  const ok = (prevS.includes('地空') && nextS.includes('地劫'))
    || (prevS.includes('地劫') && nextS.includes('地空'));
  if (!ok) return null;

  return {
    name: '空劫夹命',
    level: 'caution',
    description: '地空地劫夹命宫，主精神空虚，财来财去。',
    palaces: ['命宫'],
    conditions: { required: ['地空地劫夹命'] },
    source: '《紫微斗数全书》',
  };
}

/** 命无正曜（空宫借星） */
function detectMingWuZhengYao(chart: ZiweiChart): Pattern | null {
  const ming = getMingGong(chart);
  if (ming.majorStars.length > 0) return null;

  return {
    name: '命无正曜',
    level: 'neutral',
    description: '命宫无主星，借对宫星曜安命，性格受对宫影响较大，需看借星吉凶。',
    palaces: ['命宫'],
    conditions: { required: ['命宫无主星'] },
    source: '《紫微斗数全书》',
  };
}

/** 马头带箭 */
function detectMaTouDaiJian(chart: ZiweiChart): Pattern | null {
  const ming = getMingGong(chart);
  const mingBranch = toBranch(ming.index);
  if (mingBranch !== 6) return null;  // 午宫
  if (!hasStar(ming, '擎羊')) return null;

  const sanFang = sanFangAllStars(chart);
  const bonus: string[] = [];
  if (sanFang.has('七杀') || sanFang.has('破军')) bonus.push('杀破会照');
  if (KUI_YUE.some(s => sanFang.has(s))) bonus.push('魁钺加会');

  return {
    name: '马头带箭',
    level: bonus.length > 0 ? 'good' : 'caution',
    description: '擎羊在午宫守命，主刚烈果断，武职显贵，但亦主刑伤。',
    palaces: ['命宫'],
    conditions: { required: ['擎羊在午宫守命'], bonus: bonus.length > 0 ? bonus : undefined },
    source: '《紫微斗数骨髓赋·马头带箭》',
  };
}

/** 禄存守命/守身 */
function detectLuCunShouShen(chart: ZiweiChart): Pattern | null {
  const ming = getMingGong(chart);
  const shenP = chart.palaces.find(p => p.isBodyPalace);
  if (!getAllStarNames(ming).includes('禄存') && !(shenP && getAllStarNames(shenP).includes('禄存'))) return null;

  return {
    name: '禄存守命',
    level: 'good',
    description: '禄存入命宫或身宫，主财运稳固，有守成之能。',
    palaces: getAllStarNames(ming).includes('禄存') ? ['命宫'] : (shenP ? [shenP.name] : []),
    conditions: { required: ['禄存入命或身宫'] },
    source: '《紫微斗数全书·禄存星》',
  };
}

/** 化禄入财 */
function detectHuaLuRuCai(chart: ZiweiChart): Pattern | null {
  const caiP = chart.palaces.find(p => p.name === '财帛');
  if (!caiP) return null;
  if (!caiP.majorStars.some(s => s.mutagen === '禄') && !caiP.minorStars.some(s => s.mutagen === '禄')) return null;

  return {
    name: '化禄入财',
    level: 'good',
    description: '化禄入财帛宫，主收入丰厚，理财有方。',
    palaces: ['财帛'],
    conditions: { required: ['化禄入财帛宫'] },
    source: '《紫微斗数全书·四化论》',
  };
}

/** 化权入官 */
function detectHuaQuanRuGuan(chart: ZiweiChart): Pattern | null {
  const guanP = chart.palaces.find(p => p.name === '官禄');
  if (!guanP) return null;
  if (!guanP.majorStars.some(s => s.mutagen === '权') && !guanP.minorStars.some(s => s.mutagen === '权')) return null;

  return {
    name: '化权入官',
    level: 'good',
    description: '化权入官禄宫，主事业掌权，升迁有望。',
    palaces: ['官禄'],
    conditions: { required: ['化权入官禄宫'] },
    source: '《紫微斗数全书·四化论》',
  };
}

/** 昌曲坐命/同会 */
function detectChangQuTongHui(chart: ZiweiChart): Pattern | null {
  const sanFang = sanFangAllStars(chart);
  if (!CHANG_QU.every(s => sanFang.has(s))) return null;

  const ming = getMingGong(chart);
  const bothInMing = hasStar(ming, '文昌') && hasStar(ming, '文曲');

  return {
    name: bothInMing ? '昌曲坐命' : '昌曲同会',
    level: 'good',
    description: bothInMing
      ? '文昌文曲同坐命宫，主才华横溢，学业出众。'
      : '文昌文曲会照三方，主聪明好学，文采出众。',
    palaces: ['命宫'],
    conditions: { required: [bothInMing ? '昌曲坐命' : '昌曲会照三方'] },
    source: '《紫微斗数全书·文星论》',
  };
}

/** 辅弼同会 */
function detectFuBiTongHui(chart: ZiweiChart): Pattern | null {
  const sanFang = sanFangAllStars(chart);
  if (!ZUO_YOU.every(s => sanFang.has(s))) return null;

  return {
    name: '辅弼同会',
    level: 'good',
    description: '左辅右弼同会三方四正，主贵人助力，人际关系佳。',
    palaces: ['命宫'],
    conditions: { required: ['左辅右弼会照三方'] },
    source: '《紫微斗数全书·辅弼论》',
  };
}

/** 魁钺同会 */
function detectKuiYueTongHui(chart: ZiweiChart): Pattern | null {
  const sanFang = sanFangAllStars(chart);
  if (!KUI_YUE.every(s => sanFang.has(s))) return null;

  return {
    name: '魁钺同会',
    level: 'good',
    description: '天魁天钺同会三方四正，主科甲有名，逢凶化吉。',
    palaces: ['命宫'],
    conditions: { required: ['天魁天钺会照三方'] },
    source: '《紫微斗数全书·魁钺论》',
  };
}

// ────────────────────────────────────────────
// 主函数
// ────────────────────────────────────────────

/** 检测命盘中所有匹配的格局 */
export function detectPatterns(chart: ZiweiChart): Pattern[] {
  const patterns: Pattern[] = [];

  // 上品格局
  const p1 = detectJunChenQingHui(chart); if (p1) patterns.push(p1);
  const p2 = detectZiFu(chart); if (p2) patterns.push(p2);
  const p3 = detectFuXiangChaoYuan(chart); if (p3) patterns.push(p3);
  const p4 = detectYangLiangChangLu(chart); if (p4) patterns.push(p4);
  patterns.push(...detectHuoTanLingTan(chart));
  const p6 = detectWuTan(chart); if (p6) patterns.push(p6);
  const p7 = detectShaPoLang(chart); if (p7) patterns.push(p7);
  const p8 = detectJiYueTongLiang(chart); if (p8) patterns.push(p8);

  // 中品格局
  const p9 = detectRiYueJiaMing(chart); if (p9) patterns.push(p9);
  const p10 = detectJuRiTongGong(chart); if (p10) patterns.push(p10);

  // 辅助格局
  const p11 = detectFuBiJiaMing(chart); if (p11) patterns.push(p11);
  const p12 = detectChangQuJiaMing(chart); if (p12) patterns.push(p12);
  const p13 = detectShuangLuChaoYuan(chart); if (p13) patterns.push(p13);
  const p14 = detectSanQiJiaHui(chart); if (p14) patterns.push(p14);
  const p15 = detectHuaLuRuMing(chart); if (p15) patterns.push(p15);

  // 恶格
  patterns.push(...detectHuaJiRuMingQian(chart));
  const p17 = detectYangTuoJiaJi(chart); if (p17) patterns.push(p17);
  const p18 = detectHuoLingJiaMing(chart); if (p18) patterns.push(p18);
  const p19 = detectKongJieJiaMing(chart); if (p19) patterns.push(p19);
  const p20 = detectMaTouDaiJian(chart); if (p20) patterns.push(p20);

  // 基础格局
  const p21 = detectMingWuZhengYao(chart); if (p21) patterns.push(p21);
  const p22 = detectLuCunShouShen(chart); if (p22) patterns.push(p22);
  const p23 = detectHuaLuRuCai(chart); if (p23) patterns.push(p23);
  const p24 = detectHuaQuanRuGuan(chart); if (p24) patterns.push(p24);
  const p25 = detectChangQuTongHui(chart); if (p25) patterns.push(p25);
  const p26 = detectFuBiTongHui(chart); if (p26) patterns.push(p26);
  const p27 = detectKuiYueTongHui(chart); if (p27) patterns.push(p27);

  return patterns;
}

/** 命宫摘要（用于 AI 提示和摘要卡片） */
export function getMingGongSummary(chart: ZiweiChart): {
  stars: string[];
  keywords: string[];
  nature: string;
} {
  const ming = getMingGong(chart);
  const stars = ming.majorStars.map(s => s.name);

  const starKeywords: Record<string, string[]> = {
    '紫微': ['帝王', '尊贵', '领导'],
    '天机': ['智慧', '谋略', '变化'],
    '太阳': ['光明', '热情', '奉献'],
    '武曲': ['刚毅', '财星', '执行'],
    '天同': ['温和', '福星', '享受'],
    '廉贞': ['桃花', '政治', '是非'],
    '天府': ['财库', '保守', '稳重'],
    '太阴': ['阴柔', '浪漫', '感性'],
    '贪狼': ['多欲', '才艺', '桃花'],
    '巨门': ['口才', '猜疑', '分析'],
    '天相': ['印星', '协调', '服务'],
    '天梁': ['荫星', '正直', '化解'],
    '七杀': ['冲锋', '权威', '孤克'],
    '破军': ['破旧', '开创', '消耗'],
  };

  const natureMap: Record<string, string> = {
    '紫微': '帝座之气，天生领袖型',
    '天机': '机变灵活，谋士型',
    '太阳': '光明磊落，付出型',
    '武曲': '刚直果断，实干型',
    '天同': '随和安逸，福禄型',
    '廉贞': '能文能武，桃花型',
    '天府': '守成稳当，财库型',
    '太阴': '浪漫细腻，感性型',
    '贪狼': '多才多艺，欲望型',
    '巨门': '口才了得，分析型',
    '天相': '调和润色，辅佐型',
    '天梁': '逢凶化吉，长者型',
    '七杀': '独当一面，将帅型',
    '破军': '打破常规，变革型',
  };

  const keywords = stars.flatMap(s => starKeywords[s] || []);
  const nature = stars.map(s => natureMap[s] || '').filter(Boolean).join('；') || '综合型';

  return { stars, keywords, nature };
}
