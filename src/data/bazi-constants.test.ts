import { describe, expect, it } from 'vitest';
import {
  TIAN_GAN,
  DI_ZHI,
  GAN_TO_ELEMENT,
  ZHI_TO_ELEMENT,
  WUXING_SHENG,
  WUXING_KE,
  NA_YIN,
  CANG_GAN,
  WU_HU_DUN,
  WU_SHU_DUN,
  SHI_SHEN_MAP,
  getJiaZiNumber,
  getNaYin,
} from './bazi-constants';

describe('TIAN_GAN', () => {
  it('has 10 entries', () => {
    expect(TIAN_GAN).toHaveLength(10);
  });

  it('starts with 甲 and ends with 癸', () => {
    expect(TIAN_GAN[0]).toBe('甲');
    expect(TIAN_GAN[9]).toBe('癸');
  });
});

describe('DI_ZHI', () => {
  it('has 12 entries', () => {
    expect(DI_ZHI).toHaveLength(12);
  });

  it('starts with 子 and ends with 亥', () => {
    expect(DI_ZHI[0]).toBe('子');
    expect(DI_ZHI[11]).toBe('亥');
  });
});

describe('GAN_TO_ELEMENT', () => {
  it('has 10 entries', () => {
    expect(Object.keys(GAN_TO_ELEMENT)).toHaveLength(10);
  });

  it('maps 甲乙 to 木', () => {
    expect(GAN_TO_ELEMENT['甲']).toBe('木');
    expect(GAN_TO_ELEMENT['乙']).toBe('木');
  });

  it('maps 庚辛 to 金', () => {
    expect(GAN_TO_ELEMENT['庚']).toBe('金');
    expect(GAN_TO_ELEMENT['辛']).toBe('金');
  });
});

describe('ZHI_TO_ELEMENT', () => {
  it('has 12 entries', () => {
    expect(Object.keys(ZHI_TO_ELEMENT)).toHaveLength(12);
  });

  it('maps 子 to 水', () => {
    expect(ZHI_TO_ELEMENT['子']).toBe('水');
  });

  it('maps 午 to 火', () => {
    expect(ZHI_TO_ELEMENT['午']).toBe('火');
  });
});

describe('WUXING_SHENG', () => {
  it('covers all 5 elements', () => {
    expect(Object.keys(WUXING_SHENG)).toHaveLength(5);
  });

  it('木→火→土→金→水→木', () => {
    expect(WUXING_SHENG['木']).toBe('火');
    expect(WUXING_SHENG['火']).toBe('土');
    expect(WUXING_SHENG['土']).toBe('金');
    expect(WUXING_SHENG['金']).toBe('水');
    expect(WUXING_SHENG['水']).toBe('木');
  });
});

describe('WUXING_KE', () => {
  it('covers all 5 elements', () => {
    expect(Object.keys(WUXING_KE)).toHaveLength(5);
  });

  it('木→土→水→火→金→木', () => {
    expect(WUXING_KE['木']).toBe('土');
    expect(WUXING_KE['火']).toBe('金');
    expect(WUXING_KE['土']).toBe('水');
    expect(WUXING_KE['金']).toBe('木');
    expect(WUXING_KE['水']).toBe('火');
  });
});

describe('NA_YIN', () => {
  it('has 30 entries', () => {
    expect(NA_YIN).toHaveLength(30);
  });

  it('starts with 海中金', () => {
    expect(NA_YIN[0]).toBe('海中金');
  });

  it('ends with 大海水', () => {
    expect(NA_YIN[29]).toBe('大海水');
  });
});

describe('CANG_GAN', () => {
  it('has 12 keys', () => {
    expect(Object.keys(CANG_GAN)).toHaveLength(12);
  });

  it('子 contains 癸', () => {
    expect(CANG_GAN['子']).toEqual(['癸']);
  });

  it('丑 contains 己癸辛', () => {
    expect(CANG_GAN['丑']).toEqual(['己', '癸', '辛']);
  });

  it('寅 contains 甲丙戊', () => {
    expect(CANG_GAN['寅']).toEqual(['甲', '丙', '戊']);
  });

  it('every branch is a key', () => {
    for (const zhi of DI_ZHI) {
      expect(CANG_GAN[zhi], `missing CANG_GAN for ${zhi}`).toBeDefined();
      expect(CANG_GAN[zhi].length, `CANG_GAN[${zhi}] should not be empty`).toBeGreaterThan(0);
    }
  });
});

describe('WU_HU_DUN', () => {
  it('has 10 entries', () => {
    expect(WU_HU_DUN).toHaveLength(10);
  });

  it('each entry has 12 months', () => {
    for (let i = 0; i < 10; i++) {
      expect(WU_HU_DUN[i], `WU_HU_DUN[${i}] should have 12 months`).toHaveLength(12);
    }
  });

  it('index 5-9 mirror 0-4', () => {
    for (let i = 5; i < 10; i++) {
      expect(WU_HU_DUN[i]).toEqual(WU_HU_DUN[i - 5]);
    }
  });

  it('甲(0) starts 丙寅: month 0 is 丙', () => {
    expect(WU_HU_DUN[0][0]).toBe('丙');
  });

  it('乙(1) starts 戊寅: month 0 is 戊', () => {
    expect(WU_HU_DUN[1][0]).toBe('戊');
  });

  it('戊(4) starts 甲寅: month 0 is 甲', () => {
    expect(WU_HU_DUN[4][0]).toBe('甲');
  });
});

describe('WU_SHU_DUN', () => {
  it('has 10 entries', () => {
    expect(WU_SHU_DUN).toHaveLength(10);
  });

  it('each entry has 12 shichen', () => {
    for (let i = 0; i < 10; i++) {
      expect(WU_SHU_DUN[i], `WU_SHU_DUN[${i}] should have 12 shichen`).toHaveLength(12);
    }
  });

  it('index 5-9 mirror 0-4', () => {
    for (let i = 5; i < 10; i++) {
      expect(WU_SHU_DUN[i]).toEqual(WU_SHU_DUN[i - 5]);
    }
  });

  it('甲(0) starts 甲子: shichen 0 is 甲', () => {
    expect(WU_SHU_DUN[0][0]).toBe('甲');
  });

  it('乙(1) starts 丙子: shichen 0 is 丙', () => {
    expect(WU_SHU_DUN[1][0]).toBe('丙');
  });
});

describe('SHI_SHEN_MAP', () => {
  it('covers all 100 gan pairs', () => {
    expect(SHI_SHEN_MAP).toHaveLength(10);
    for (let i = 0; i < 10; i++) {
      expect(SHI_SHEN_MAP[i], `SHI_SHEN_MAP[${i}] should have 10 entries`).toHaveLength(10);
    }
  });

  it('甲日见甲 → 比肩 (same element, same yin-yang)', () => {
    expect(SHI_SHEN_MAP[0][0]).toBe('比肩');
  });

  it('甲日见乙 → 劫财 (same element, diff yin-yang)', () => {
    expect(SHI_SHEN_MAP[0][1]).toBe('劫财');
  });

  it('甲日见丙 → 食神 (木生火, same yang)', () => {
    expect(SHI_SHEN_MAP[0][2]).toBe('食神');
  });

  it('甲日见丁 → 伤官 (木生火, diff yin-yang)', () => {
    expect(SHI_SHEN_MAP[0][3]).toBe('伤官');
  });

  it('甲日见戊 → 偏财 (木克土, same yang)', () => {
    expect(SHI_SHEN_MAP[0][4]).toBe('偏财');
  });

  it('甲日见己 → 正财 (木克土, diff yin-yang)', () => {
    expect(SHI_SHEN_MAP[0][5]).toBe('正财');
  });

  it('甲日见庚 → 七杀 (金克木, same yang)', () => {
    expect(SHI_SHEN_MAP[0][6]).toBe('七杀');
  });

  it('甲日见辛 → 正官 (金克木, diff yin-yang)', () => {
    expect(SHI_SHEN_MAP[0][7]).toBe('正官');
  });

  it('甲日见壬 → 偏印 (水生木, same yang)', () => {
    expect(SHI_SHEN_MAP[0][8]).toBe('偏印');
  });

  it('甲日见癸 → 正印 (水生木, diff yin-yang)', () => {
    expect(SHI_SHEN_MAP[0][9]).toBe('正印');
  });

  it('all 10 shishen names appear in the map', () => {
    const allNames = new Set<string>();
    for (const row of SHI_SHEN_MAP) {
      for (const name of row) {
        allNames.add(name);
      }
    }
    expect(allNames).toEqual(new Set([
      '比肩', '劫财', '食神', '伤官',
      '偏财', '正财', '七杀', '正官',
      '偏印', '正印',
    ]));
  });
});

describe('getJiaZiNumber', () => {
  it('甲子 = 1', () => {
    expect(getJiaZiNumber(0, 0)).toBe(1);
  });

  it('乙丑 = 2', () => {
    expect(getJiaZiNumber(1, 1)).toBe(2);
  });

  it('癸亥 = 60', () => {
    expect(getJiaZiNumber(9, 11)).toBe(60);
  });

  it('丙寅 = 3', () => {
    expect(getJiaZiNumber(2, 2)).toBe(3);
  });

  it('甲戌 = 11', () => {
    expect(getJiaZiNumber(0, 10)).toBe(11);
  });

  it('甲午 = 31', () => {
    expect(getJiaZiNumber(0, 6)).toBe(31);
  });
});

describe('getNaYin', () => {
  it('甲子 → 海中金', () => {
    expect(getNaYin(0, 0)).toBe('海中金');
  });

  it('乙丑 → 海中金 (same nayin as 甲子)', () => {
    expect(getNaYin(1, 1)).toBe('海中金');
  });

  it('丙寅 → 炉中火', () => {
    expect(getNaYin(2, 2)).toBe('炉中火');
  });

  it('癸亥 → 大海水', () => {
    expect(getNaYin(9, 11)).toBe('大海水');
  });
});
