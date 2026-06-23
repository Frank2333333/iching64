import { describe, it, expect } from 'vitest';
import { calculateBaziChart } from './bazi-calculator';

const VALID_STRENGTHS = ['身强', '身弱', '偏强', '偏弱', '中和'];

/** 1990-06-15 14:00 male — 已用 lunar-javascript 确认的基准数据 */
const REF_INPUT = {
  year: 1990,
  month: 6,
  day: 15,
  hour: 14,
  minute: 0,
  gender: 'male' as const,
};

describe('calculateBaziChart', () => {
  it('returns complete four pillars structure', () => {
    const chart = calculateBaziChart(REF_INPUT);

    expect(chart.yearPillar).toBeDefined();
    expect(chart.monthPillar).toBeDefined();
    expect(chart.dayPillar).toBeDefined();
    expect(chart.hourPillar).toBeDefined();

    for (const pillar of [chart.yearPillar, chart.monthPillar, chart.dayPillar, chart.hourPillar]) {
      expect(pillar.gan).toBeTruthy();
      expect(pillar.zhi).toBeTruthy();
      expect(typeof pillar.ganIndex).toBe('number');
      expect(typeof pillar.zhiIndex).toBe('number');
    }
  });

  it('has day master info with valid strength', () => {
    const chart = calculateBaziChart(REF_INPUT);

    expect(chart.dayMaster).toBeTruthy();
    expect(chart.dayMasterElement).toBeTruthy();
    expect(VALID_STRENGTHS).toContain(chart.dayMasterStrength);
  });

  it('has non-empty pattern and yongshen/xishen/jishen', () => {
    const chart = calculateBaziChart(REF_INPUT);

    expect(chart.pattern).toBeTruthy();
    expect(chart.yongShen).toBeTruthy();
    expect(chart.xiShen).toBeTruthy();
    expect(chart.jiShen).toBeTruthy();

    // 用神、喜神、忌神应该是五行名称
    const wuxing = ['木', '火', '土', '金', '水'];
    expect(wuxing).toContain(chart.yongShen);
    expect(wuxing).toContain(chart.xiShen);
    expect(wuxing).toContain(chart.jiShen);
  });

  it('has 8 DaYun entries, first starts at age 3', () => {
    const chart = calculateBaziChart(REF_INPUT);

    expect(chart.daYun).toHaveLength(8);
    expect(chart.daYun[0].startAge).toBe(3);
    expect(chart.daYun[0].endAge).toBe(12);

    for (const dy of chart.daYun) {
      expect(dy.gan).toBeTruthy();
      expect(dy.zhi).toBeTruthy();
      expect(dy.shiShen).toBeTruthy();
      expect(dy.cangGan.length).toBeGreaterThan(0);
    }
  });

  it('has current LiuNian with current year', () => {
    const chart = calculateBaziChart(REF_INPUT);
    const currentYear = new Date().getFullYear();

    expect(chart.currentLiuNian.year).toBe(currentYear);
    expect(chart.currentLiuNian.gan).toBeTruthy();
    expect(chart.currentLiuNian.zhi).toBeTruthy();
    expect(chart.currentLiuNian.shiShen).toBeTruthy();
  });

  it('has non-empty nayin for all pillars', () => {
    const chart = calculateBaziChart(REF_INPUT);

    for (const pillar of [chart.yearPillar, chart.monthPillar, chart.dayPillar, chart.hourPillar]) {
      expect(pillar.nayin).toBeTruthy();
      expect(pillar.nayin.length).toBeGreaterThan(0);
    }
  });

  it('has non-empty canggan for all pillars', () => {
    const chart = calculateBaziChart(REF_INPUT);

    for (const pillar of [chart.yearPillar, chart.monthPillar, chart.dayPillar, chart.hourPillar]) {
      expect(pillar.cangGan.length).toBeGreaterThan(0);
      expect(pillar.shiShen.length).toEqual(pillar.cangGan.length);
    }
  });

  it('applies solar time correction when enabled', () => {
    const chart = calculateBaziChart({
      ...REF_INPUT,
      birthplace: '北京',
      useSolarTime: true,
    });

    expect(chart.solarTimeCorrection).toBeDefined();
    expect(chart.solarTimeCorrection!.longitude).toBeCloseTo(116.4, 1);
    // (116.4 - 120) * 4 = -14.4 → rounded to -14
    expect(chart.solarTimeCorrection!.correctionMinutes).toBe(-14);
    expect(chart.solarTimeCorrection!.originalHour).toBe(14);
  });

  it('has no solar time correction when disabled', () => {
    const chart = calculateBaziChart(REF_INPUT);

    expect(chart.solarTimeCorrection).toBeUndefined();
  });

  it('works for female gender', () => {
    const chart = calculateBaziChart({
      ...REF_INPUT,
      gender: 'female',
    });

    expect(chart).toBeDefined();
    expect(VALID_STRENGTHS).toContain(chart.dayMasterStrength);
    expect(chart.daYun).toHaveLength(8);

    // 庚(yearGanIndex=6) 是阳干，female → 逆行
    // 月柱壬午(ganIndex=8, zhiIndex=6) 逆行第一步 = 辛巳(ganIndex=7, zhiIndex=5)
    expect(chart.daYun[0].gan).toBe('辛');
    expect(chart.daYun[0].zhi).toBe('巳');
  });

  it('matches known exact pillar values for 1990-06-15 14:00', () => {
    const chart = calculateBaziChart(REF_INPUT);

    // 年柱：庚午 (lunar-javascript confirmed)
    expect(chart.yearPillar.gan).toBe('庚');
    expect(chart.yearPillar.zhi).toBe('午');

    // 月柱：壬午
    expect(chart.monthPillar.gan).toBe('壬');
    expect(chart.monthPillar.zhi).toBe('午');

    // 日柱：辛亥
    expect(chart.dayPillar.gan).toBe('辛');
    expect(chart.dayPillar.zhi).toBe('亥');

    // 时柱：14:00 = 未时，辛日五鼠遁 → 乙未
    expect(chart.hourPillar.gan).toBe('乙');
    expect(chart.hourPillar.zhi).toBe('未');

    // 日主 = 日干
    expect(chart.dayMaster).toBe('辛');
    expect(chart.dayMasterElement).toBe('金');
  });

  it('computes correct DaYun direction for yang-year male (forward)', () => {
    const chart = calculateBaziChart(REF_INPUT);

    // 庚(ganIndex=6, 阳干) + male → 顺行
    // 月柱壬午(ganIndex=8, zhiIndex=6) 顺行第一步 = 癸未(ganIndex=9, zhiIndex=7)
    expect(chart.daYun[0].gan).toBe('癸');
    expect(chart.daYun[0].zhi).toBe('未');
  });

  it('solar time correction detects hour pillar change near boundary', () => {
    // 20:50 北京时间，真太阳时修正约 -14 分钟 → 20:36，仍在戌时
    const chartNoChange = calculateBaziChart({
      year: 1990,
      month: 6,
      day: 15,
      hour: 20,
      minute: 50,
      gender: 'male',
      birthplace: '北京',
      useSolarTime: true,
    });
    expect(chartNoChange.solarTimeCorrection!.hourPillarChanged).toBe(false);

    // 21:05 北京时间，真太阳时修正约 -14 分钟 → 20:51，从亥时退回戌时
    const chartChanged = calculateBaziChart({
      year: 1990,
      month: 6,
      day: 15,
      hour: 21,
      minute: 5,
      gender: 'male',
      birthplace: '北京',
      useSolarTime: true,
    });
    expect(chartChanged.solarTimeCorrection!.hourPillarChanged).toBe(true);
  });
});
