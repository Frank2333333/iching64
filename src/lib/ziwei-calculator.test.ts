import { describe, it, expect } from 'vitest';
import { calculateZiweiChart } from './ziwei-calculator';
import type { ZiweiChart } from './ziwei-calculator';

/** 1990-06-15 14:00 male — 已用 iztro 确认的基准数据 */
const REF_INPUT = {
  year: 1990,
  month: 6,
  day: 15,
  hour: 14,
  minute: 0,
  gender: 'male' as const,
};

describe('calculateZiweiChart', () => {
  it('returns complete chart structure', () => {
    const chart = calculateZiweiChart(REF_INPUT);

    expect(chart.solarDate).toBeTruthy();
    expect(chart.lunarDate).toBeTruthy();
    expect(chart.chineseDate).toBeTruthy();
    expect(chart.gender).toBeTruthy();
    expect(chart.time).toBeTruthy();
    expect(chart.timeRange).toBeTruthy();
    expect(chart.fiveElementsClass).toBeTruthy();
    expect(chart.soulPalace).toBeTruthy();
    expect(chart.bodyPalace).toBeTruthy();
    expect(chart.soul).toBeTruthy();
    expect(chart.body).toBeTruthy();
  });

  it('has 12 palaces starting from 寅', () => {
    const chart = calculateZiweiChart(REF_INPUT);

    expect(chart.palaces).toHaveLength(12);
    expect(chart.palaces[0].earthlyBranch).toBe('寅');
    expect(chart.palaces[0].index).toBe(0);
  });

  it('finds 命宫 with major stars', () => {
    const chart = calculateZiweiChart(REF_INPUT);
    const mingGong = chart.palaces.find(p => p.name === '命宫');

    expect(mingGong).toBeDefined();
    expect(mingGong!.majorStars.length).toBeGreaterThan(0);
    expect(mingGong!.earthlyBranch).toBe(chart.soulPalace);
  });

  it('has exactly one body palace', () => {
    const chart = calculateZiweiChart(REF_INPUT);
    const bodyPalaces = chart.palaces.filter(p => p.isBodyPalace);

    expect(bodyPalaces).toHaveLength(1);
    expect(bodyPalaces[0].earthlyBranch).toBe(chart.bodyPalace);
  });

  it('has valid birth sihua', () => {
    const chart = calculateZiweiChart(REF_INPUT);

    expect(chart.birthSiHua.lu).toBeTruthy();
    expect(chart.birthSiHua.quan).toBeTruthy();
    expect(chart.birthSiHua.ke).toBeTruthy();
    expect(chart.birthSiHua.ji).toBeTruthy();
    // 四化星名不重复
    const sihuaStars = [chart.birthSiHua.lu, chart.birthSiHua.quan, chart.birthSiHua.ke, chart.birthSiHua.ji];
    expect(new Set(sihuaStars).size).toBe(4);
  });

  it('matches known values for 1990-06-15 14:00 male', () => {
    const chart = calculateZiweiChart(REF_INPUT);

    // 庚午年壬午月辛亥日乙未时 → 命宫在亥，土五局
    expect(chart.soulPalace).toBe('亥');
    expect(chart.fiveElementsClass).toBe('土五局');
    expect(chart.gender).toBe('男');
    expect(chart.time).toBe('未时');

    // 庚年四化：太阳化禄、武曲化权、太阴化科、天同化忌
    expect(chart.birthSiHua.lu).toBe('太阳');
    expect(chart.birthSiHua.quan).toBe('武曲');
    expect(chart.birthSiHua.ke).toBe('太阴');
    expect(chart.birthSiHua.ji).toBe('天同');

    // 命主星
    expect(chart.soul).toBe('巨门');
    expect(chart.body).toBe('火星');
  });

  it('has major stars with type and optional brightness', () => {
    const chart = calculateZiweiChart(REF_INPUT);
    const mingGong = chart.palaces.find(p => p.name === '命宫')!;

    for (const star of mingGong.majorStars) {
      expect(star.type).toBe('major');
      // 主星通常有亮度
      if (star.brightness) {
        expect(['庙', '旺', '得', '利', '平', '不', '陷']).toContain(star.brightness);
      }
    }
  });

  it('has minor stars with correct types', () => {
    const chart = calculateZiweiChart(REF_INPUT);
    const minorTypes = new Set<string>();

    for (const palace of chart.palaces) {
      for (const star of palace.minorStars) {
        minorTypes.add(star.type);
      }
    }

    // minorStars 包含 soft/tough/lucun/tianma
    expect(minorTypes.has('soft') || minorTypes.has('tough')).toBe(true);
  });

  it('has decadal info on each palace', () => {
    const chart = calculateZiweiChart(REF_INPUT);

    for (const palace of chart.palaces) {
      if (palace.decadal) {
        expect(palace.decadal.range).toHaveLength(2);
        expect(palace.decadal.range[0]).toBeLessThan(palace.decadal.range[1]);
        expect(palace.decadal.heavenlyStem).toBeTruthy();
        expect(palace.decadal.earthlyBranch).toBeTruthy();
      }
    }
  });

  it('applies solar time correction when enabled', () => {
    const chart = calculateZiweiChart({
      ...REF_INPUT,
      birthplace: '北京',
      useSolarTime: true,
    });

    expect(chart.solarTimeCorrection).toBeDefined();
    expect(chart.solarTimeCorrection!.longitude).toBeCloseTo(116.4, 1);
    expect(chart.solarTimeCorrection!.correctionMinutes).toBe(-14);
    expect(chart.solarTimeCorrection!.originalHour).toBe(14);
  });

  it('has no solar time correction when disabled', () => {
    const chart = calculateZiweiChart(REF_INPUT);

    expect(chart.solarTimeCorrection).toBeUndefined();
  });

  it('works for female gender', () => {
    const chart = calculateZiweiChart({
      ...REF_INPUT,
      gender: 'female',
    });

    expect(chart).toBeDefined();
    expect(chart.gender).toBe('女');
    expect(chart.palaces).toHaveLength(12);
  });

  it('produces JSON-serializable output', () => {
    const chart = calculateZiweiChart(REF_INPUT);
    const json = JSON.stringify(chart);

    expect(json).toBeTruthy();
    const parsed = JSON.parse(json) as ZiweiChart;
    expect(parsed.solarDate).toBe(chart.solarDate);
    expect(parsed.palaces).toHaveLength(12);
  });

  it('each palace has unique earthly branch', () => {
    const chart = calculateZiweiChart(REF_INPUT);
    const branches = chart.palaces.map(p => p.earthlyBranch);

    expect(new Set(branches).size).toBe(12);
  });

  it('contains all 12 standard palace names', () => {
    const chart = calculateZiweiChart(REF_INPUT);
    const expectedNames = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '仆役', '官禄', '田宅', '福德', '父母'];
    const actualNames = chart.palaces.map(p => p.name);

    for (const name of expectedNames) {
      expect(actualNames).toContain(name);
    }
  });

  it('detects hour index change near boundary with solar time', () => {
    // 21:05 北京时间 → 真太阳时约 20:51，从亥时退回戌时
    const chart = calculateZiweiChart({
      year: 1990,
      month: 6,
      day: 15,
      hour: 21,
      minute: 5,
      gender: 'male',
      birthplace: '北京',
      useSolarTime: true,
    });

    expect(chart.solarTimeCorrection!.hourIndexChanged).toBe(true);
  });
});
