import { describe, expect, it } from 'vitest';
import { getGuaById, getGuaByName, liuShiSiGua } from './guaxiang';

describe('liuShiSiGua data invariants', () => {
  const ids = liuShiSiGua.map(gua => gua.id);
  const idSet = new Set(ids);

  it('contains exactly 64 hexagrams', () => {
    expect(liuShiSiGua).toHaveLength(64);
  });

  it('uses unique ids covering 1 through 64', () => {
    expect(idSet.size).toBe(64);
    expect([...idSet].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 64 }, (_, index) => index + 1)
    );
  });

  it('defines exactly six ordered lines for every hexagram', () => {
    for (const gua of liuShiSiGua) {
      expect(gua.yaos, `hexagram ${gua.id} should have six lines`).toHaveLength(6);
      expect(gua.yaos.map(yao => yao.position), `hexagram ${gua.id} line positions`).toEqual([
        1,
        2,
        3,
        4,
        5,
        6,
      ]);
    }
  });

  it('uses only supported yinYang values', () => {
    for (const gua of liuShiSiGua) {
      for (const yao of gua.yaos) {
        expect(['yin', 'yang'], `hexagram ${gua.id} line ${yao.position}`).toContain(yao.yinYang);
      }
    }
  });

  it('references existing hexagram ids in relationship fields', () => {
    for (const gua of liuShiSiGua) {
      expect(idSet.has(gua.duiGua), `hexagram ${gua.id} duiGua ${gua.duiGua}`).toBe(true);
      expect(idSet.has(gua.zongGua), `hexagram ${gua.id} zongGua ${gua.zongGua}`).toBe(true);
      expect(idSet.has(gua.huGua), `hexagram ${gua.id} huGua ${gua.huGua}`).toBe(true);

      for (const relatedId of gua.guaBian) {
        expect(idSet.has(relatedId), `hexagram ${gua.id} guaBian ${relatedId}`).toBe(true);
      }
    }
  });
});

describe('hexagram lookup helpers', () => {
  it('finds an existing hexagram by id', () => {
    const firstGua = liuShiSiGua[0];

    expect(getGuaById(firstGua.id)).toBe(firstGua);
  });

  it('returns undefined for a missing id', () => {
    expect(getGuaById(0)).toBeUndefined();
    expect(getGuaById(65)).toBeUndefined();
  });

  it('finds an existing hexagram by full name or Chinese name', () => {
    const firstGua = liuShiSiGua[0];

    expect(getGuaByName(firstGua.name)).toBe(firstGua);
    expect(getGuaByName(firstGua.chineseName)).toBe(firstGua);
  });

  it('returns undefined for a missing name', () => {
    expect(getGuaByName('__missing_hexagram__')).toBeUndefined();
  });
});
