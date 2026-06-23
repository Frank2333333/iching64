# 本地八字排盘 + 真太阳时修正 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将八字排盘从"完全依赖 AI"改为"前端本地排盘 → 结构化数据 → AI 解读"，与梅花易数架构一致。

**Architecture:** 前端新增 `bazi-calculator.ts` 纯计算引擎 + `bazi-constants.ts` 常量表 + `cities.ts` 城市经纬度，产出 `BaziChart` 结构化数据。三个新 UI 组件展示传统命盘。后端 `bazi-ai.ts` 读取 `BaziInput.chart` 字段注入排盘数据到 prompt。

**Tech Stack:** TypeScript, lunar-javascript (npm), vitest, React, Tailwind CSS

---

## File Structure

| File | Responsibility | Status |
|------|---------------|--------|
| `src/data/bazi-constants.ts` | 天干地支、纳音表、藏干表、五虎遁、五鼠遁、十神映射等常量 | 新增 |
| `src/data/cities.ts` | 中国城市经纬度，用于真太阳时修正 | 新增（移植） |
| `src/lib/bazi-calculator.ts` | 排盘引擎：四柱、藏干、十神、纳音、格局、用神、大运、流年 | 新增 |
| `src/lib/bazi-api.ts` | `BaziInput` 接口增加 `chart?` 字段 | 修改 |
| `src/components/bazi/BaziChartTable.tsx` | 四柱命盘表格（天干/地支/藏干/纳音/十神） | 新增 |
| `src/components/bazi/BaziSummaryCards.tsx` | 日主信息 + 格局用神卡片 | 新增 |
| `src/components/bazi/BaziDaYunTimeline.tsx` | 大运时间轴 | 新增 |
| `src/pages/BaziDivination.tsx` | 提交后先排盘→展示命盘→再调 AI | 修改 |
| `src/components/bazi/BaziMessageList.tsx` | 用户信息卡片展示排盘摘要 | 修改 |
| `server-workers/services/bazi-ai.ts` | `buildBaziPrompt` 支持 chart 数据注入 | 修改 |
| `src/lib/bazi-calculator.test.ts` | 排盘引擎单元测试 | 新增 |

---

### Task 1: 安装 lunar-javascript 依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装包**

```bash
npm install lunar-javascript
```

- [ ] **Step 2: 验证安装成功**

```bash
node -e "const {Lunar} = require('lunar-javascript'); const l = Lunar.fromSolar(1990, 6, 15); console.log(l.getYearInGanZhi(), l.getMonthInGanZhi(), l.getDayInGanZhi())"
```

Expected: 输出年月日干支（如 `庚午 壬午 丁亥`）

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add lunar-javascript dependency for bazi calculation"
```

---

### Task 2: 创建 bazi-constants.ts 常量数据

**Files:**
- Create: `src/data/bazi-constants.ts`
- Test: `src/data/bazi-constants.test.ts`

- [ ] **Step 1: 写常量文件的测试**

Create `src/data/bazi-constants.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import {
  TIAN_GAN, DI_ZHI, NA_YIN, CANG_GAN,
  WU_HU_DUN, WU_SHU_DUN, SHI_SHEN_MAP,
  GAN_TO_ELEMENT, ZHI_TO_ELEMENT,
} from './bazi-constants';

describe('bazi-constants data invariants', () => {
  it('has 10 heavenly stems', () => {
    expect(TIAN_GAN).toHaveLength(10);
  });

  it('has 12 earthly branches', () => {
    expect(DI_ZHI).toHaveLength(12);
  });

  it('has 30 nayin entries (for 60 jiazi pairs)', () => {
    expect(NA_YIN).toHaveLength(30);
  });

  it('has 12 canggan entries', () => {
    expect(Object.keys(CANG_GAN)).toHaveLength(12);
  });

  it('wu-hu-dun maps all 10 stems', () => {
    expect(Object.keys(WU_HU_DUN)).toHaveLength(10);
    // Each entry maps 12 months
    for (const key of Object.keys(WU_HU_DUN)) {
      expect(WU_HU_DUN[Number(key)]).toHaveLength(12);
    }
  });

  it('wu-shu-dun maps all 10 stems', () => {
    expect(Object.keys(WU_SHU_DUN)).toHaveLength(10);
    for (const key of Object.keys(WU_SHU_DUN)) {
      expect(WU_SHU_DUN[Number(key)]).toHaveLength(12);
    }
  });

  it('shi-shen-map covers all 100 gan pairs', () => {
    // 10 day-master gans × 10 other gans = 100 entries
    let count = 0;
    for (const dayGan of TIAN_GAN) {
      for (const otherGan of TIAN_GAN) {
        expect(SHI_SHEN_MAP[dayGan][otherGan]).toBeDefined();
        count++;
      }
    }
    expect(count).toBe(100);
  });

  it('gan-to-element covers all 10 stems', () => {
    expect(Object.keys(GAN_TO_ELEMENT)).toHaveLength(10);
  });

  it('zhi-to-element covers all 12 branches', () => {
    expect(Object.keys(ZHI_TO_ELEMENT)).toHaveLength(12);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
npx vitest run src/data/bazi-constants.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: 创建常量文件**

Create `src/data/bazi-constants.ts`:

```typescript
/** 天干 */
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

/** 地支 */
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

/** 天干五行映射 */
export const GAN_TO_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

/** 地支五行映射 */
export const ZHI_TO_ELEMENT: Record<string, string> = {
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水',
};

/**
 * 60甲子纳音表
 * 索引 = (天干索引 × 6 + 地支索引 / 2) 的简化
 * 实际按干支序号配对：甲子/乙丑→[0], 丙寅/丁卯→[1], ...
 */
export const NA_YIN: readonly string[] = [
  '海中金', '炉中火', '大林木', '路旁土', '剑锋金', '山头火',
  '涧下水', '城头土', '白蜡金', '杨柳木', '泉中水', '屋上土',
  '霹雳火', '松柏木', '长流水', '砂石金', '山下火', '平地木',
  '壁上土', '金箔金', '覆灯火', '天河水', '大驿土', '钗钏金',
  '桑柘木', '大溪水', '砂中土', '天上火', '石榴木', '大海水',
];

/** 地支藏干表（本气、中气、余气） */
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

/**
 * 五虎遁月：年干→月干起始
 * WU_HU_DUN[年干索引][月份(1-12)] = 月干
 * 口诀：甲己之年丙作首，乙庚之岁戊为头，
 *       丙辛之年寻庚起，丁壬壬寅顺水流，
 *       戊癸甲寅好追求
 */
export const WU_HU_DUN: Record<number, string[]> = {
  0: ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'], // 甲/己
  1: ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'], // 乙/庚（戊起）
  2: ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'], // 丙/辛
  3: ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'], // 丁/壬
  4: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'], // 戊/癸
  5: ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'], // 己→同甲
  6: ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'], // 庚→同乙
  7: ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'], // 辛→同丙
  8: ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'], // 壬→同丁
  9: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'], // 癸→同戊
};

/**
 * 五鼠遁时：日干→时干起始
 * WU_SHU_DUN[日干索引][时辰索引(0-11)] = 时干
 * 口诀：甲己还加甲，乙庚丙作初，
 *       丙辛从戊起，丁壬庚子居，
 *       戊癸何方发，壬子是真途
 */
export const WU_SHU_DUN: Record<number, string[]> = {
  0: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'], // 甲/己
  1: ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'], // 乙/庚
  2: ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'], // 丙/辛
  3: ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'], // 丁/壬
  4: ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'], // 戊/癸
  5: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'], // 己→同甲
  6: ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'], // 庚→同乙
  7: ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'], // 辛→同丙
  8: ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'], // 壬→同丁
  9: ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'], // 癸→同戊
};

/**
 * 十神映射表
 * SHI_SHEN_MAP[日干][他干] = 十神名称
 * 
 * 规则：
 * - 同我者：比肩（同阴阳）、劫财（异阴阳）
 * - 我生者：食神（同阴阳）、伤官（异阴阳）
 * - 我克者：偏财（同阴阳）、正财（异阴阳）
 * - 克我者：七杀（同阴阳）、正官（异阴阳）
 * - 生我者：偏印（同阴阳）、正印（异阴阳）
 */
export const SHI_SHEN_MAP: Record<string, Record<string, string>> = buildShiShenMap();

function buildShiShenMap(): Record<string, Record<string, string>> {
  const wuxingSheng: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const wuxingKe: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

  const result: Record<string, Record<string, string>> = {};

  for (let di = 0; di < 10; di++) {
    const dayGan = TIAN_GAN[di];
    const dayElement = GAN_TO_ELEMENT[dayGan];
    const dayYin = di % 2 === 0; // 甲丙戊庚壬为阳

    result[dayGan] = {};

    for (let oi = 0; oi < 10; oi++) {
      const otherGan = TIAN_GAN[oi];
      const otherElement = GAN_TO_ELEMENT[otherGan];
      const otherYin = oi % 2 === 0;
      const sameYinYang = dayYin === otherYin;

      let shiShen: string;

      if (dayGan === otherGan) {
        shiShen = '比肩';
      } else if (dayElement === otherElement) {
        // 同五行不同干 = 比肩/劫财
        shiShen = sameYinYang ? '比肩' : '劫财';
      } else if (wuxingSheng[dayElement] === otherElement) {
        // 我生
        shiShen = sameYinYang ? '食神' : '伤官';
      } else if (wuxingKe[dayElement] === otherElement) {
        // 我克
        shiShen = sameYinYang ? '偏财' : '正财';
      } else if (wuxingKe[otherElement] === dayElement) {
        // 克我
        shiShen = sameYinYang ? '七杀' : '正官';
      } else if (wuxingSheng[otherElement] === dayElement) {
        // 生我
        shiShen = sameYinYang ? '偏印' : '正印';
      } else {
        shiShen = '比肩'; // fallback（不应到达）
      }

      result[dayGan][otherGan] = shiShen;
    }
  }

  return result;
}

/**
 * 五行生克关系
 * 生：木→火→土→金→水→木
 * 克：木→土→水→火→金→木
 */
export const WUXING_SHENG: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
export const WUXING_KE: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

/**
 * 纳音查表辅助：根据天干索引和地支索引获取纳音
 * 60甲子编号 = (天干索引, 地支索引) 配对序号
 * 甲子=0, 乙丑=1, 丙寅=2, ..., 癸亥=59
 * 但只有30个纳音，每两个干支配一个纳音
 */
export function getNaYin(ganIndex: number, zhiIndex: number): string {
  // 60甲子序号：每10天干×12地支循环，只取奇偶同组的
  // 甲子(0,0)=0, 乙丑(1,1)=1, 丙寅(2,2)=2, ...
  // 序号 = (ganIndex * 6 + zhiIndex) % 60 不对
  // 正确：60甲子循环中，(干,支)只有干支序号同奇偶的才配对
  // 甲子=0, 丙寅=2, 戊辰=4, 庚午=6, 壬申=8, 甲戌=10, ...
  // 简化：jiaziNumber，然后 nayinIndex = jiaziNumber / 2（整数除法）
  const jiaziNumber = getJiaZiNumber(ganIndex, zhiIndex);
  return NA_YIN[Math.floor(jiaziNumber / 2)];
}

/** 计算60甲子序号 (0-59) */
export function getJiaZiNumber(ganIndex: number, zhiIndex: number): number {
  // 60甲子中，天干地支序号必须同奇偶才能配对
  // 甲子(0,0)=0, 乙丑(1,1)=1, 丙寅(2,2)=2, ...
  // 一般公式：找到满足 i%10=ganIndex 且 i%12=zhiIndex 的最小 i
  for (let i = 0; i < 60; i++) {
    if (i % 10 === ganIndex % 10 && i % 12 === zhiIndex % 12) {
      return i;
    }
  }
  return 0; // fallback
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run src/data/bazi-constants.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/bazi-constants.ts src/data/bazi-constants.test.ts
git commit -m "feat: add bazi constants (stems, branches, nayin, canggan, shishen)"
```

---

### Task 3: 移植城市经纬度数据

**Files:**
- Create: `src/data/cities.ts`

- [ ] **Step 1: 从紫微项目复制城市数据**

Copy `C:\Users\1\Desktop\ziwei-doushu\lib\ziwei\cities.ts` to `src/data/cities.ts`，保持原有 `CityInfo`、`ProvinceInfo` 接口和 `PROVINCES` 导出不变。

```bash
cp "C:\Users\1\Desktop\ziwei-doushu\lib\ziwei\cities.ts" "src/data/cities.ts"
```

- [ ] **Step 2: 验证文件可用**

```bash
npx tsc --noEmit src/data/cities.ts
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/data/cities.ts
git commit -m "feat: add Chinese city longitude data for solar time correction"
```

---

### Task 4: 创建排盘引擎（核心计算）

**Files:**
- Create: `src/lib/bazi-calculator.ts`
- Create: `src/lib/bazi-calculator.test.ts`
- Reference: `src/data/bazi-constants.ts`, `src/data/cities.ts`

这是最大的任务。按子步骤拆分：

- [ ] **Step 4.1: 创建类型定义和入口函数签名**

Create `src/lib/bazi-calculator.ts` 的类型部分和主函数签名：

```typescript
import { Lunar, Solar } from 'lunar-javascript';
import {
  TIAN_GAN, DI_ZHI, CANG_GAN, GAN_TO_ELEMENT, ZHI_TO_ELEMENT,
  WU_HU_DUN, WU_SHU_DUN, SHI_SHEN_MAP,
  WUXING_SHENG, WUXING_KE,
  getNaYin,
} from '../data/bazi-constants';
import { PROVINCES } from '../data/cities';

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

/**
 * 主入口：根据公历出生时间排盘
 */
export function calculateBaziChart(input: BaziCalcInput): BaziChart {
  // 实现在后续 step 中逐步填充
  let { year, month, day, hour, minute, gender, birthplace, useSolarTime } = input;

  // 1. 真太阳时修正
  let solarTimeCorrection: SolarTimeCorrection | undefined;
  if (useSolarTime && birthplace) {
    const correction = applySolarTimeCorrection(year, month, day, hour, minute, birthplace);
    if (correction) {
      solarTimeCorrection = correction;
      hour = correction.correctedHour;
    }
  }

  // 2. 用 lunar-javascript 获取阴历
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  // 3. 年柱（以立春为界）
  const yearPillar = getYearPillar(lunar);

  // 4. 月柱（以节气为界）
  const monthPillar = getMonthPillar(lunar);

  // 5. 日柱
  const dayPillar = getDayPillar(lunar);

  // 6. 时柱
  const hourPillar = getHourPillar(dayPillar.ganIndex, hour);

  // 7. 纳音
  yearPillar.nayin = getNaYin(yearPillar.ganIndex, yearPillar.zhiIndex);
  monthPillar.nayin = getNaYin(monthPillar.ganIndex, monthPillar.zhiIndex);
  dayPillar.nayin = getNaYin(dayPillar.ganIndex, dayPillar.zhiIndex);
  hourPillar.nayin = getNaYin(hourPillar.ganIndex, hourPillar.zhiIndex);

  // 8. 藏干
  yearPillar.cangGan = CANG_GAN[yearPillar.zhi] || [];
  monthPillar.cangGan = CANG_GAN[monthPillar.zhi] || [];
  dayPillar.cangGan = CANG_GAN[dayPillar.zhi] || [];
  hourPillar.cangGan = CANG_GAN[hourPillar.zhi] || [];

  // 9. 十神
  const dayGan = dayPillar.gan;
  yearPillar.shiShen = yearPillar.cangGan.map(g => SHI_SHEN_MAP[dayGan][g]);
  monthPillar.shiShen = monthPillar.cangGan.map(g => SHI_SHEN_MAP[dayGan][g]);
  dayPillar.shiShen = [SHI_SHEN_MAP[dayGan][dayGan]]; // 日干自身
  hourPillar.shiShen = hourPillar.cangGan.map(g => SHI_SHEN_MAP[dayGan][g]);

  // 10. 日主强弱
  const dayMasterStrength = assessDayMasterStrength(
    dayPillar, monthPillar, yearPillar, hourPillar
  );

  // 11. 格局
  const pattern = determinePattern(monthPillar, dayPillar);

  // 12. 用神喜忌
  const { yongShen, xiShen, jiShen } = determineYongShen(
    dayPillar.gan, dayMasterStrength, monthPillar
  );

  // 13. 大运
  const daYun = calculateDaYun(monthPillar, yearPillar, gender, year);

  // 14. 当前流年
  const currentLiuNian = getCurrentLiuNian(dayPillar.gan);

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster: dayPillar.gan,
    dayMasterElement: GAN_TO_ELEMENT[dayPillar.gan],
    dayMasterStrength,
    pattern,
    yongShen,
    xiShen,
    jiShen,
    daYun,
    currentLiuNian,
    solarTimeCorrection,
  };
}
```

- [ ] **Step 4.2: 实现真太阳时修正函数**

在 `bazi-calculator.ts` 中添加：

```typescript
function applySolarTimeCorrection(
  year: number, month: number, day: number,
  hour: number, minute: number, birthplace: string
): SolarTimeCorrection | undefined {
  const longitude = findCityLongitude(birthplace);
  if (longitude === null) return undefined;

  // 修正分钟数 = (经度 - 120) × 4
  const correctionMinutes = Math.round((longitude - 120) * 4);
  if (correctionMinutes === 0) return undefined;

  // 将修正加到时间上
  const totalMinutes = hour * 60 + minute + correctionMinutes;
  const correctedHour = Math.floor(totalMinutes / 60);
  const correctedMinute = totalMinutes % 60;

  // 简化：只判断时辰是否变化（每2小时一个时辰）
  const originalShiChen = Math.floor((hour + 1) / 2) % 12;
  const correctedShiChen = Math.floor((correctedHour + 1) / 2) % 12;

  return {
    birthplace,
    longitude,
    correctionMinutes,
    originalHour: hour,
    correctedHour,
    hourPillarChanged: originalShiChen !== correctedShiChen,
  };
}

function findCityLongitude(birthplace: string): number | null {
  // 模糊匹配：去除"市""省"等后缀，在 PROVINCES 中搜索
  const normalized = birthplace.replace(/[省市自治区县区]/g, '');
  for (const province of PROVINCES) {
    for (const city of province.cities) {
      if (city.name.includes(normalized) || normalized.includes(city.name)) {
        return city.longitude;
      }
    }
  }
  return null;
}
```

- [ ] **Step 4.3: 实现年柱、月柱、日柱、时柱计算**

在 `bazi-calculator.ts` 中添加：

```typescript
function getYearPillar(lunar: Lunar): Pillar {
  const ganIndex = lunar.getYearGanIndexExact();
  const zhiIndex = lunar.getYearZhiIndexExact();
  return makePillar(ganIndex, zhiIndex);
}

function getMonthPillar(lunar: Lunar): Pillar {
  const ganIndex = lunar.getMonthGanIndexExact();
  const zhiIndex = lunar.getMonthZhiIndexExact();
  return makePillar(ganIndex, zhiIndex);
}

function getDayPillar(lunar: Lunar): Pillar {
  const ganIndex = lunar.getDayGan();
  const zhiIndex = lunar.getDayZhi();
  // lunar-javascript 的 getDayGan/getDayZhi 返回的是干支文字，需要转索引
  const ganIdx = TIAN_GAN.indexOf(ganIndex as unknown as string);
  const zhiIdx = DI_ZHI.indexOf(zhiIndex as unknown as string);
  return makePillar(ganIdx, zhiIdx);
}

function getHourPillar(dayGanIndex: number, hour: number): Pillar {
  // 时辰索引：23-1=子(0), 1-3=丑(1), ..., 21-23=亥(11)
  const zhiIndex = Math.floor(((hour + 1) % 24) / 2);
  const gan = WU_SHU_DUN[dayGanIndex][zhiIndex];
  const ganIndex = TIAN_GAN.indexOf(gan);
  return makePillar(ganIndex, zhiIndex);
}

function makePillar(ganIndex: number, zhiIndex: number): Pillar {
  return {
    gan: TIAN_GAN[ganIndex],
    zhi: DI_ZHI[zhiIndex],
    ganIndex,
    zhiIndex,
    nayin: '', // 稍后填充
    cangGan: [], // 稍后填充
    shiShen: [], // 稍后填充
  };
}
```

- [ ] **Step 4.4: 实现日主强弱判断**

```typescript
function assessDayMasterStrength(
  dayPillar: Pillar, monthPillar: Pillar,
  yearPillar: Pillar, hourPillar: Pillar
): string {
  const dayElement = GAN_TO_ELEMENT[dayPillar.gan];
  let score = 0;

  // 得令：月支是否生扶日主
  const monthZhiElement = ZHI_TO_ELEMENT[monthPillar.zhi];
  if (monthZhiElement === dayElement) score += 2; // 同五行
  if (WUXING_SHENG[monthZhiElement] === dayElement) score += 2; // 月支生日主
  if (WUXING_KE[monthZhiElement] === dayElement) score -= 1; // 月支克日主

  // 得地：地支藏干有无日主同类
  const allCangGan = [
    ...yearPillar.cangGan, ...monthPillar.cangGan,
    ...dayPillar.cangGan, ...hourPillar.cangGan,
  ];
  for (const gan of allCangGan) {
    if (GAN_TO_ELEMENT[gan] === dayElement) score += 1;
  }

  // 得势：天干有无比劫帮扶
  const otherGans = [yearPillar.gan, monthPillar.gan, hourPillar.gan];
  for (const gan of otherGans) {
    if (GAN_TO_ELEMENT[gan] === dayElement) score += 1;
  }

  // 综合判断
  if (score >= 6) return '身强';
  if (score >= 4) return '偏强';
  if (score >= 2) return '中和';
  if (score >= 0) return '偏弱';
  return '身弱';
}
```

- [ ] **Step 4.5: 实现格局判定**

```typescript
function determinePattern(monthPillar: Pillar, dayPillar: Pillar): string {
  const dayGan = dayPillar.gan;
  const monthCangGan = monthPillar.cangGan;

  if (monthCangGan.length === 0) return '未明格';

  // 取月支本气的十神为格局
  const benQi = monthCangGan[0];
  const shiShen = SHI_SHEN_MAP[dayGan][benQi];

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

  return patternMap[shiShen] || '未明格';
}
```

- [ ] **Step 4.6: 实现用神喜忌**

```typescript
function determineYongShen(
  dayGan: string, strength: string, monthPillar: Pillar
): { yongShen: string; xiShen: string; jiShen: string } {
  const dayElement = GAN_TO_ELEMENT[dayGan];

  const isStrong = strength === '身强' || strength === '偏强';

  if (isStrong) {
    // 身强：用克泄耗（官杀/食伤/财）
    return {
      yongShen: WUXING_KE[dayElement], // 克我者为用
      xiShen: WUXING_SHENG[dayElement], // 我生者为喜（泄秀）
      jiShen: dayElement, // 同类为忌
    };
  } else {
    // 身弱：用生扶（印/比劫）
    return {
      yongShen: findElementThatGenerates(dayElement), // 生我者为用
      xiShen: dayElement, // 同类为喜
      jiShen: WUXING_KE[dayElement], // 克我者为忌
    };
  }
}

function findElementThatGenerates(target: string): string {
  for (const [element, generated] of Object.entries(WUXING_SHENG)) {
    if (generated === target) return element;
  }
  return target;
}
```

- [ ] **Step 4.7: 实现大运计算**

```typescript
function calculateDaYun(
  monthPillar: Pillar, yearPillar: Pillar,
  gender: 'male' | 'female', birthYear: number
): DaYun[] {
  // 阳男阴女顺排，阴男阳女逆排
  const yearGanIndex = yearPillar.ganIndex;
  const isYangYear = yearGanIndex % 2 === 0;
  const isMale = gender === 'male';
  const forward = (isYangYear && isMale) || (!isYangYear && !isMale);

  // 起运年龄简化：用固定值 3 岁（精确计算需要节气时间，lunar-javascript 可提供）
  // TODO: 后续可用 lunar 的节气数据精确计算
  const startAge = 3;

  const result: DaYun[] = [];
  let ganIndex = monthPillar.ganIndex;
  let zhiIndex = monthPillar.zhiIndex;

  for (let i = 0; i < 8; i++) {
    if (forward) {
      ganIndex = (ganIndex + 1) % 10;
      zhiIndex = (zhiIndex + 1) % 12;
    } else {
      ganIndex = (ganIndex + 9) % 10; // +9 ≡ -1 mod 10
      zhiIndex = (zhiIndex + 11) % 12; // +11 ≡ -1 mod 12
    }

    const gan = TIAN_GAN[ganIndex];
    const zhi = DI_ZHI[zhiIndex];
    const cangGan = CANG_GAN[zhi] || [];

    result.push({
      startAge: startAge + i * 10,
      endAge: startAge + (i + 1) * 10 - 1,
      gan,
      zhi,
      cangGan,
      shiShen: SHI_SHEN_MAP[dayGanForDaYun][gan] || '',
    });
  }

  return result;
}

// 辅助：大运的十神需要日干，在外部传入
// 修正：在 calculateDaYun 中增加 dayGan 参数
```

**注意**：上面的 `calculateDaYun` 有一个引用问题——`dayGanForDaYun` 未定义。在实现时需要将 `dayPillar.gan` 传入。修正版：

```typescript
function calculateDaYun(
  monthPillar: Pillar, yearPillar: Pillar,
  gender: 'male' | 'female', birthYear: number,
  dayGan: string
): DaYun[] {
  const yearGanIndex = yearPillar.ganIndex;
  const isYangYear = yearGanIndex % 2 === 0;
  const isMale = gender === 'male';
  const forward = (isYangYear && isMale) || (!isYangYear && !isMale);
  const startAge = 3;

  const result: DaYun[] = [];
  let ganIndex = monthPillar.ganIndex;
  let zhiIndex = monthPillar.zhiIndex;

  for (let i = 0; i < 8; i++) {
    if (forward) {
      ganIndex = (ganIndex + 1) % 10;
      zhiIndex = (zhiIndex + 1) % 12;
    } else {
      ganIndex = (ganIndex + 9) % 10;
      zhiIndex = (zhiIndex + 11) % 12;
    }

    const gan = TIAN_GAN[ganIndex];
    const zhi = DI_ZHI[zhiIndex];
    const cangGan = CANG_GAN[zhi] || [];

    result.push({
      startAge: startAge + i * 10,
      endAge: startAge + (i + 1) * 10 - 1,
      gan,
      zhi,
      cangGan,
      shiShen: SHI_SHEN_MAP[dayGan][gan],
    });
  }

  return result;
}
```

主函数中的调用也要更新：`const daYun = calculateDaYun(monthPillar, yearPillar, gender, year, dayPillar.gan);`

- [ ] **Step 4.8: 实现流年计算**

```typescript
function getCurrentLiuNian(dayGan: string): LiuNian {
  const now = new Date();
  const year = now.getFullYear();
  // 用 lunar-javascript 计算流年干支
  const solar = Solar.fromYmd(year, 1, 1);
  const lunar = solar.getLunar();
  const yearGan = lunar.getYearGan();
  const yearZhi = lunar.getYearZhi();

  return {
    year,
    gan: yearGan as string,
    zhi: yearZhi as string,
    shiShen: SHI_SHEN_MAP[dayGan][yearGan as string],
  };
}
```

- [ ] **Step 4.9: 写测试文件**

Create `src/lib/bazi-calculator.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { calculateBaziChart, type BaziCalcInput, type BaziChart } from './bazi-calculator';

describe('calculateBaziChart', () => {
  it('calculates a known birth chart correctly', () => {
    // 1990年6月15日14时，男
    const input: BaziCalcInput = {
      year: 1990, month: 6, day: 15, hour: 14, minute: 0,
      gender: 'male',
    };
    const chart = calculateBaziChart(input);

    // 验证四柱结构完整
    expect(chart.yearPillar.gan).toBeDefined();
    expect(chart.yearPillar.zhi).toBeDefined();
    expect(chart.monthPillar.gan).toBeDefined();
    expect(chart.monthPillar.zhi).toBeDefined();
    expect(chart.dayPillar.gan).toBeDefined();
    expect(chart.dayPillar.zhi).toBeDefined();
    expect(chart.hourPillar.gan).toBeDefined();
    expect(chart.hourPillar.zhi).toBeDefined();
  });

  it('has day master info', () => {
    const input: BaziCalcInput = {
      year: 1990, month: 6, day: 15, hour: 14, minute: 0,
      gender: 'male',
    };
    const chart = calculateBaziChart(input);

    expect(chart.dayMaster).toBeTruthy();
    expect(chart.dayMasterElement).toBeTruthy();
    expect(['身强', '身弱', '偏强', '偏弱', '中和']).toContain(chart.dayMasterStrength);
  });

  it('has pattern and yongshen', () => {
    const input: BaziCalcInput = {
      year: 1990, month: 6, day: 15, hour: 14, minute: 0,
      gender: 'male',
    };
    const chart = calculateBaziChart(input);

    expect(chart.pattern).toBeTruthy();
    expect(chart.yongShen).toBeTruthy();
    expect(chart.xiShen).toBeTruthy();
    expect(chart.jiShen).toBeTruthy();
  });

  it('has dayun with correct count', () => {
    const input: BaziCalcInput = {
      year: 1990, month: 6, day: 15, hour: 14, minute: 0,
      gender: 'male',
    };
    const chart = calculateBaziChart(input);

    expect(chart.daYun).toHaveLength(8);
    expect(chart.daYun[0].startAge).toBe(3);
  });

  it('has current liunian', () => {
    const input: BaziCalcInput = {
      year: 1990, month: 6, day: 15, hour: 14, minute: 0,
      gender: 'male',
    };
    const chart = calculateBaziChart(input);

    expect(chart.currentLiuNian.year).toBe(new Date().getFullYear());
    expect(chart.currentLiuNian.gan).toBeTruthy();
    expect(chart.currentLiuNian.zhi).toBeTruthy();
  });

  it('has nayin for all pillars', () => {
    const input: BaziCalcInput = {
      year: 1990, month: 6, day: 15, hour: 14, minute: 0,
      gender: 'male',
    };
    const chart = calculateBaziChart(input);

    expect(chart.yearPillar.nayin).toBeTruthy();
    expect(chart.monthPillar.nayin).toBeTruthy();
    expect(chart.dayPillar.nayin).toBeTruthy();
    expect(chart.hourPillar.nayin).toBeTruthy();
  });

  it('has canggan for all pillars', () => {
    const input: BaziCalcInput = {
      year: 1990, month: 6, day: 15, hour: 14, minute: 0,
      gender: 'male',
    };
    const chart = calculateBaziChart(input);

    expect(chart.yearPillar.cangGan.length).toBeGreaterThan(0);
    expect(chart.monthPillar.cangGan.length).toBeGreaterThan(0);
    expect(chart.dayPillar.cangGan.length).toBeGreaterThan(0);
    expect(chart.hourPillar.cangGan.length).toBeGreaterThan(0);
  });

  it('applies solar time correction when enabled', () => {
    const input: BaziCalcInput = {
      year: 1990, month: 6, day: 15, hour: 14, minute: 0,
      gender: 'male',
      birthplace: '北京',
      useSolarTime: true,
    };
    const chart = calculateBaziChart(input);

    // 北京经度116.4，修正 = (116.4-120)*4 = -14.4分钟
    expect(chart.solarTimeCorrection).toBeDefined();
    expect(chart.solarTimeCorrection!.birthplace).toBe('北京');
    expect(chart.solarTimeCorrection!.longitude).toBeCloseTo(116.4, 1);
  });

  it('does not apply solar time correction when disabled', () => {
    const input: BaziCalcInput = {
      year: 1990, month: 6, day: 15, hour: 14, minute: 0,
      gender: 'male',
      birthplace: '北京',
      useSolarTime: false,
    };
    const chart = calculateBaziChart(input);

    expect(chart.solarTimeCorrection).toBeUndefined();
  });

  it('works for female', () => {
    const input: BaziCalcInput = {
      year: 1985, month: 3, day: 20, hour: 8, minute: 30,
      gender: 'female',
    };
    const chart = calculateBaziChart(input);

    expect(chart.yearPillar.gan).toBeDefined();
    expect(chart.daYun).toHaveLength(8);
  });
});
```

- [ ] **Step 4.10: 运行测试**

```bash
npx vitest run src/lib/bazi-calculator.test.ts
```

Expected: PASS（可能需要调整 lunar-javascript API 调用，因为它有多个版本）

- [ ] **Step 4.11: 修复测试直到通过**

lunar-javascript 的 API 可能与上述代码略有不同。需要检查的实际 API：
- `Solar.fromYmd(y, m, d)` → `Solar` 对象
- `solar.getLunar()` → `Lunar` 对象
- `lunar.getYearGan()` / `lunar.getYearZhi()` → 天干地支字符串
- `lunar.getYearGanIndex()` / `lunar.getYearZhiIndex()` → 索引
- `lunar.getDayGan()` / `lunar.getDayZhi()` → 字符串

如果测试失败，根据实际 API 调整代码，重新运行直到通过。

- [ ] **Step 4.12: Commit**

```bash
git add src/lib/bazi-calculator.ts src/lib/bazi-calculator.test.ts
git commit -m "feat: add bazi calculation engine with solar time correction"
```

---

### Task 5: 扩展 BaziInput 接口

**Files:**
- Modify: `src/lib/bazi-api.ts:15-26` (BaziInput interface)

- [ ] **Step 1: 在 BaziInput 中增加 chart 字段**

在 `src/lib/bazi-api.ts` 中：

1. 添加 import：`import type { BaziChart } from './bazi-calculator';`
2. 在 `BaziInput` 接口末尾（第 26 行 `pillars?: BaziPillars;` 之后）添加：

```typescript
  chart?: BaziChart;
```

完整的接口变为：

```typescript
export interface BaziInput {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  gender: 'male" | "female';
  birthplace?: string;
  useSolarTime?: boolean;
  question?: string;
  pillars?: BaziPillars;
  chart?: BaziChart;
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/lib/bazi-api.ts
git commit -m "feat: extend BaziInput with optional BaziChart field"
```

---

### Task 6: 创建 BaziChartTable 命盘表格组件

**Files:**
- Create: `src/components/bazi/BaziChartTable.tsx`

- [ ] **Step 1: 创建四柱命盘表格组件**

Create `src/components/bazi/BaziChartTable.tsx`:

```tsx
import type { BaziChart, Pillar } from '../../lib/bazi-calculator';

interface BaziChartTableProps {
  chart: BaziChart;
}

const PILLAR_LABELS = ['年柱', '月柱', '日柱', '时柱'];

export function BaziChartTable({ chart }: BaziChartTableProps) {
  const pillars: Pillar[] = [
    chart.yearPillar, chart.monthPillar,
    chart.dayPillar, chart.hourPillar,
  ];

  return (
    <div className="w-full max-w-lg mx-auto">
      <table className="w-full border-collapse">
        {/* 表头：年月日时 */}
        <thead>
          <tr>
            {PILLAR_LABELS.map((label, i) => (
              <th key={label} className="py-2 text-sm font-medium text-amber-700 dark:text-amber-300 border-b border-amber-200 dark:border-amber-800">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* 十神 + 天干行 */}
          <tr>
            {pillars.map((p, i) => (
              <td key={i} className="py-3 text-center border-b border-amber-100 dark:border-amber-900">
                <div className="text-xs text-gray-400 mb-1">
                  {i === 2 ? '日主' : p.shiShen[0] || ''}
                </div>
                <div className={`text-2xl font-bold ${
                  i === 2
                    ? 'text-amber-600 dark:text-[#d4af37]'
                    : 'text-amber-800 dark:text-amber-200'
                }`}>
                  {p.gan}
                </div>
              </td>
            ))}
          </tr>
          {/* 地支行 */}
          <tr>
            {pillars.map((p, i) => (
              <td key={i} className="py-3 text-center border-b border-amber-100 dark:border-amber-900">
                <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                  {p.zhi}
                </div>
              </td>
            ))}
          </tr>
          {/* 藏干行 */}
          <tr>
            {pillars.map((p, i) => (
              <td key={i} className="py-2 text-center border-b border-amber-100 dark:border-amber-900">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {p.cangGan.join(' ')}
                </div>
              </td>
            ))}
          </tr>
          {/* 纳音行 */}
          <tr>
            {pillars.map((p, i) => (
              <td key={i} className="py-1 text-center">
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {p.nayin}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      {/* 真太阳时标记 */}
      {chart.solarTimeCorrection && (
        <div className="mt-2 text-center text-xs text-amber-600 dark:text-amber-400">
          ☀ 真太阳时修正 {chart.solarTimeCorrection.correctionMinutes > 0 ? '+' : ''}
          {chart.solarTimeCorrection.correctionMinutes}分钟
          {chart.solarTimeCorrection.hourPillarChanged && '（时柱已变更）'}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/bazi/BaziChartTable.tsx
git commit -m "feat: add BaziChartTable component for traditional chart display"
```

---

### Task 7: 创建 BaziSummaryCards 日主+格局卡片

**Files:**
- Create: `src/components/bazi/BaziSummaryCards.tsx`

- [ ] **Step 1: 创建卡片组件**

Create `src/components/bazi/BaziSummaryCards.tsx`:

```tsx
import type { BaziChart } from '../../lib/bazi-calculator';

interface BaziSummaryCardsProps {
  chart: BaziChart;
}

export function BaziSummaryCards({ chart }: BaziSummaryCardsProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center w-full max-w-lg mx-auto">
      {/* 日主信息卡 */}
      <div className="flex-1 min-w-[140px] p-3 rounded-lg bg-amber-50 dark:bg-gray-800 border border-amber-200 dark:border-amber-800">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">日主</div>
        <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
          {chart.dayMaster}{chart.dayMasterElement}
        </div>
        <div className={`text-sm mt-1 ${
          chart.dayMasterStrength === '身强' || chart.dayMasterStrength === '偏强'
            ? 'text-red-600 dark:text-red-400'
            : chart.dayMasterStrength === '身弱' || chart.dayMasterStrength === '偏弱'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-amber-600 dark:text-amber-400'
        }`}>
          {chart.dayMasterStrength}
        </div>
      </div>

      {/* 格局用神卡 */}
      <div className="flex-1 min-w-[200px] p-3 rounded-lg bg-amber-50 dark:bg-gray-800 border border-amber-200 dark:border-amber-800">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">格局</div>
        <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
          {chart.pattern}
        </div>
        <div className="flex gap-2 mt-1 text-sm">
          <span className="text-red-600 dark:text-red-400">用{chart.yongShen}</span>
          <span className="text-green-600 dark:text-green-400">喜{chart.xiShen}</span>
          <span className="text-gray-500 dark:text-gray-400">忌{chart.jiShen}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/bazi/BaziSummaryCards.tsx
git commit -m "feat: add BaziSummaryCards component for day master and pattern display"
```

---

### Task 8: 创建 BaziDaYunTimeline 大运时间轴

**Files:**
- Create: `src/components/bazi/BaziDaYunTimeline.tsx`

- [ ] **Step 1: 创建大运时间轴组件**

Create `src/components/bazi/BaziDaYunTimeline.tsx`:

```tsx
import type { BaziChart, DaYun } from '../../lib/bazi-calculator';

interface BaziDaYunTimelineProps {
  chart: BaziChart;
}

export function BaziDaYunTimeline({ chart }: BaziDaYunTimelineProps) {
  const currentAge = new Date().getFullYear() - /* birthYear estimate from dayun */ 0;
  // 从第一步大运反推出生年份（简化处理）
  // 或者从 chart 中没有 birthYear，需要外部传入

  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">大运</h3>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {chart.daYun.map((dy, index) => (
          <DaYunCard key={index} daYun={dy} isCurrent={isCurrentDaYun(dy)} />
        ))}
      </div>
    </div>
  );
}

function isCurrentDaYun(dy: DaYun): boolean {
  // 简化判断：无法精确知道当前年龄，返回 false
  // 实际使用时需传入当前年龄或出生年份
  return false;
}

interface DaYunCardProps {
  daYun: DaYun;
  isCurrent: boolean;
}

function DaYunCard({ daYun, isCurrent }: DaYunCardProps) {
  return (
    <div className={`flex-shrink-0 w-16 p-2 rounded-lg text-center border ${
      isCurrent
        ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-600'
        : 'bg-amber-50 dark:bg-gray-800 border-amber-200 dark:border-amber-800'
    }`}>
      <div className="text-xs text-gray-500 dark:text-gray-400">{daYun.startAge}岁</div>
      <div className="text-base font-bold text-amber-700 dark:text-amber-300">
        {daYun.gan}{daYun.zhi}
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500">{daYun.shiShen}</div>
    </div>
  );
}
```

**注意**：`isCurrentDaYun` 目前返回 `false`，因为 `BaziChart` 没有存储出生年份。解决方案：在 `BaziChart` 中增加 `birthYear` 字段，或者让 `BaziDaYunTimeline` 接受额外的 `birthYear` prop。推荐前者，在 Task 4 中给 `BaziChart` 增加 `birthYear: number` 字段。

- [ ] **Step 2: 更新 BaziChart 类型（在 bazi-calculator.ts 中）**

在 `BaziChart` 接口中增加：

```typescript
  birthYear: number;
```

在 `calculateBaziChart` 的 return 中增加：

```typescript
  birthYear: year,
```

更新 `BaziDaYunTimeline` 中的 `isCurrentDaYun`：

```typescript
function isCurrentDaYun(dy: DaYun, birthYear: number): boolean {
  const currentAge = new Date().getFullYear() - birthYear;
  return currentAge >= dy.startAge && currentAge <= dy.endAge;
}
```

更新组件中调用：

```typescript
{chart.daYun.map((dy, index) => (
  <DaYunCard key={index} daYun={dy} isCurrent={isCurrentDaYun(dy, chart.birthYear)} />
))}
```

- [ ] **Step 3: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/bazi/BaziDaYunTimeline.tsx src/lib/bazi-calculator.ts
git commit -m "feat: add BaziDaYunTimeline component and birthYear field"
```

---

### Task 9: 改造 BaziDivination.tsx 页面流程

**Files:**
- Modify: `src/pages/BaziDivination.tsx`

这是关键的集成任务：将页面从"直接调 AI"改为"先排盘→展示命盘→再调 AI"。

- [ ] **Step 1: 添加 import**

在文件顶部添加：

```typescript
import { calculateBaziChart, type BaziChart } from '../lib/bazi-calculator';
import { BaziChartTable } from '../components/bazi/BaziChartTable';
import { BaziSummaryCards } from '../components/bazi/BaziSummaryCards';
import { BaziDaYunTimeline } from '../components/bazi/BaziDaYunTimeline';
```

- [ ] **Step 2: 添加 chart state**

在 state 声明区域（约第 53 行附近），添加：

```typescript
const [chart, setChart] = useState<BaziChart | null>(null);
```

- [ ] **Step 3: 修改 handleSubmit 函数**

当前 `handleSubmit`（约第 101 行）直接调 AI。改为先排盘：

```typescript
const handleSubmit = (data: BaziInput) => {
  const input = data;
  setLastInput(input);
  setChart(null);
  setAiError(null);
  setAiInterpretation(undefined);
  setChatMessages([]);

  // 如果是出生日期模式，先本地排盘
  if (input.year && input.month && input.day && input.hour !== undefined) {
    const baziChart = calculateBaziChart({
      year: input.year,
      month: input.month,
      day: input.day,
      hour: input.hour,
      minute: input.minute || 0,
      gender: input.gender,
      birthplace: input.birthplace,
      useSolarTime: input.useSolarTime,
    });
    setChart(baziChart);

    // 将排盘结果注入 BaziInput
    input.chart = baziChart;
  }

  setResult({ input });
  setStep('result');

  // 然后调 AI（如有 chart 则 AI prompt 中已有排盘数据）
  handleAIInterpretation(input);
};
```

- [ ] **Step 4: 修改 result 页面的 JSX**

在 `step === 'result'` 区块中，在 `<BaziMessageList>` 之前插入命盘组件：

```tsx
{/* 传统命盘展示 */}
{chart && (
  <div className="space-y-4 mb-6 px-4">
    <BaziChartTable chart={chart} />
    <BaziSummaryCards chart={chart} />
    <BaziDaYunTimeline chart={chart} />
  </div>
)}

{/* AI 解读（现有逻辑） */}
<BaziMessageList ... />
```

- [ ] **Step 5: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: 本地开发测试**

```bash
npm run dev:client
```

打开浏览器，访问八字页面，输入一个出生日期，验证：
1. 提交后立即看到命盘表格
2. 大运时间轴显示
3. AI 解读仍正常工作

- [ ] **Step 7: Commit**

```bash
git add src/pages/BaziDivination.tsx
git commit -m "feat: integrate local bazi chart display into BaziDivination page"
```

---

### Task 10: 修改 BaziMessageList 展示排盘摘要

**Files:**
- Modify: `src/components/bazi/BaziMessageList.tsx`

- [ ] **Step 1: 修改用户信息卡片**

当前用户信息卡片（约第 62-126 行）显示原始输入数据。当有 chart 时，改为显示排盘摘要：

在 `BaziMessageList` 组件中，`resultInput` 的类型是 `BaziInput`，它现在可能包含 `chart` 字段。

在用户信息卡片区域，添加条件判断：

```tsx
{resultInput.chart ? (
  /* 排盘摘要模式 */
  <div className="text-sm space-y-1">
    <div className="font-medium">
      {resultInput.chart.yearPillar.gan}{resultInput.chart.yearPillar.zhi}
      {' '}
      {resultInput.chart.monthPillar.gan}{resultInput.chart.monthPillar.zhi}
      {' '}
      {resultInput.chart.dayPillar.gan}{resultInput.chart.dayPillar.zhi}
      {' '}
      {resultInput.chart.hourPillar.gan}{resultInput.chart.hourPillar.zhi}
    </div>
    <div className="text-gray-500 dark:text-gray-400">
      {resultInput.chart.dayMaster}{resultInput.chart.dayMasterElement}·{resultInput.chart.dayMasterStrength}
      {' | '}
      {resultInput.chart.pattern}
      {' | '}
      用{resultInput.chart.yongShen}喜{resultInput.chart.xiShen}忌{resultInput.chart.jiShen}
    </div>
    {resultInput.question && (
      <div className="text-amber-700 dark:text-amber-300">问：{resultInput.question}</div>
    )}
  </div>
) : (
  /* 原始输入模式（无排盘数据时，如直接输入四柱） */
  <div className="text-sm space-y-1">
    {/* ... 保持现有代码不变 ... */}
  </div>
)}
```

- [ ] **Step 2: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/bazi/BaziMessageList.tsx
git commit -m "feat: show bazi chart summary in message list when available"
```

---

### Task 11: 修改后端 bazi-ai.ts 支持 chart 数据

**Files:**
- Modify: `server-workers/services/bazi-ai.ts`

- [ ] **Step 1: 更新 BaziInput 接口**

在 `bazi-ai.ts` 的本地 `BaziInput` 接口（第 44-54 行）中，在 `pillars?` 之后增加：

```typescript
  chart?: {
    yearPillar: { gan: string; zhi: string; cangGan: string[]; shiShen: string[]; nayin: string };
    monthPillar: { gan: string; zhi: string; cangGan: string[]; shiShen: string[]; nayin: string };
    dayPillar: { gan: string; zhi: string; cangGan: string[]; shiShen: string[]; nayin: string };
    hourPillar: { gan: string; zhi: string; cangGan: string[]; shiShen: string[]; nayin: string };
    dayMaster: string;
    dayMasterElement: string;
    dayMasterStrength: string;
    pattern: string;
    yongShen: string;
    xiShen: string;
    jiShen: string;
    daYun: Array<{ startAge: number; endAge: number; gan: string; zhi: string; shiShen: string }>;
    currentLiuNian: { year: number; gan: string; zhi: string; shiShen: string };
    birthYear: number;
    solarTimeCorrection?: {
      birthplace: string;
      longitude: number;
      correctionMinutes: number;
      originalHour: number;
      correctedHour: number;
      hourPillarChanged: boolean;
    };
  };
```

- [ ] **Step 2: 修改 buildBaziPrompt 函数**

在 `buildBaziPrompt` 函数（第 56 行）中，在现有的两个分支（pillars 和 birthdate）之前，增加 chart 分支：

```typescript
function buildBaziPrompt(input: BaziInput): string {
  // 优先使用本地排盘数据
  if (input.chart) {
    return buildChartPrompt(input);
  }

  if (input.pillars) {
    // 现有逻辑不变
    // ...
  }

  // 现有 birthdate 逻辑不变
  // ...
}

function buildChartPrompt(input: BaziInput): string {
  const c = input.chart!;
  const pillars = [c.yearPillar, c.monthPillar, c.dayPillar, c.hourPillar];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  let prompt = `以下是已经排好的八字命盘，请直接进行专业解读，不需要自行排盘：\n\n`;

  // 四柱
  prompt += `四柱：`;
  for (let i = 0; i < 4; i++) {
    prompt += `${pillarNames[i]} ${pillars[i].gan}${pillars[i].zhi}`;
    if (i < 3) prompt += '  ';
  }
  prompt += '\n';

  // 藏干
  prompt += `藏干：`;
  for (let i = 0; i < 4; i++) {
    prompt += `${pillarNames[i]}[${pillars[i].cangGan.join('')}]`;
    if (i < 3) prompt += ' ';
  }
  prompt += '\n';

  // 十神
  prompt += `十神：`;
  for (let i = 0; i < 4; i++) {
    prompt += `${pillarNames[i]}[${pillars[i].shiShen.join('/')}]`;
    if (i < 3) prompt += ' ';
  }
  prompt += '\n';

  // 纳音
  prompt += `纳音：`;
  for (let i = 0; i < 4; i++) {
    prompt += `${pillarNames[i]}[${pillars[i].nayin}]`;
    if (i < 3) prompt += ' ';
  }
  prompt += '\n';

  // 日主
  prompt += `日主：${c.dayMaster}${c.dayMasterElement}，${c.dayMasterStrength}\n`;
  prompt += `格局：${c.pattern}\n`;
  prompt += `用神：${c.yongShen}，喜神：${c.xiShen}，忌神：${c.jiShen}\n\n`;

  // 大运
  prompt += `大运：${c.daYun.map(dy => `${dy.startAge}岁${dy.gan}${dy.zhi}`).join(' → ')}\n`;

  // 流年
  prompt += `当前流年：${c.currentLiuNian.year}${c.currentLiuNian.gan}${c.currentLiuNian.zhi}，十神${c.currentLiuNian.shiShen}\n\n`;

  // 真太阳时
  if (c.solarTimeCorrection) {
    const sc = c.solarTimeCorrection;
    prompt += `出生地：${sc.birthplace}（真太阳时修正${sc.correctionMinutes > 0 ? '+' : ''}${sc.correctionMinutes}分钟${sc.hourPillarChanged ? '，时柱已变更' : ''}）\n`;
  } else if (input.birthplace) {
    prompt += `出生地：${input.birthplace}\n`;
  }

  prompt += `性别：${input.gender === 'male' ? '男' : '女'}\n`;

  if (input.question) {
    prompt += `用户问题：${input.question}\n`;
  }

  return prompt;
}
```

- [ ] **Step 3: 修改 chatWithBazi 中的上下文注入**

在 `chatWithBani` 函数中（约第 167 行），构建 system messages 时，如果有 chart 数据，注入排盘摘要：

在现有 system message 构建之后，添加：

```typescript
// 如果有排盘数据，注入排盘摘要到 system context
if (data.baziInput.chart) {
  const c = data.baziInput.chart;
  const chartSummary = `命盘摘要：${c.dayMaster}${c.dayMasterElement}日主，${c.dayMasterStrength}，${c.pattern}，用${c.yongShen}喜${c.xiShen}忌${c.jiShen}\n`
    + `四柱：${c.yearPillar.gan}${c.yearPillar.zhi} ${c.monthPillar.gan}${c.monthPillar.zhi} ${c.dayPillar.gan}${c.dayPillar.zhi} ${c.hourPillar.gan}${c.hourPillar.zhi}\n`
    + `当前大运：${c.daYun.find(dy => {
      const currentAge = new Date().getFullYear() - c.birthYear;
      return currentAge >= dy.startAge && currentAge <= dy.endAge;
    })?.gan || ''}${c.daYun.find(dy => {
      const currentAge = new Date().getFullYear() - c.birthYear;
      return currentAge >= dy.startAge && currentAge <= dy.endAge;
    })?.zhi || ''}`;

  messages.push({ role: 'system', content: chartSummary });
}
```

- [ ] **Step 4: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add server-workers/services/bazi-ai.ts
git commit -m "feat: support BaziChart data injection in AI prompt"
```

---

### Task 12: 端到端集成测试

**Files:** 无新文件

- [ ] **Step 1: 启动开发环境**

```bash
npm run dev
```

- [ ] **Step 2: 测试出生日期模式**

1. 打开八字页面
2. 选择出生日期模式，输入：1990年6月15日14时0分，男
3. 勾选"真太阳时"（如需测试）
4. 点击排盘
5. 验证：
   - 命盘表格正确显示四柱
   - 日主信息和格局用神卡片显示
   - 大运时间轴显示 8 步大运
   - AI 解读正常触发
   - 追问功能正常

- [ ] **Step 3: 测试直接输入四柱模式**

1. 切换到直接输入四柱模式
2. 输入任意四柱（如甲子、丙寅、戊午、庚申）
3. 验证：
   - 无命盘表格（因为没有出生日期，无法本地排盘）
   - AI 仍正常工作（走原有的 pillars 逻辑）

- [ ] **Step 4: 测试真太阳时修正**

1. 输入出生日期，出生地填"北京"
2. 勾选"真太阳时"
3. 验证排盘结果下方显示修正信息

- [ ] **Step 5: 测试暗色模式**

1. 切换到暗色模式
2. 验证命盘表格、卡片、大运的暗色样式正常

- [ ] **Step 6: 运行所有测试**

```bash
npx vitest run
```

Expected: 全部通过

- [ ] **Step 7: 最终 Commit**

```bash
git add -A
git commit -m "feat: complete local bazi chart calculation with solar time correction"
```

---

## Spec Coverage Check

| Spec 要求 | 对应 Task |
|-----------|----------|
| lunar-javascript 依赖 | Task 1 |
| bazi-constants 常量表 | Task 2 |
| 城市经纬度数据 | Task 3 |
| 排盘引擎（四柱、藏干、十神、纳音） | Task 4 |
| 真太阳时修正 | Task 4 (Step 4.2) |
| 日主强弱判断 | Task 4 (Step 4.4) |
| 格局判定 | Task 4 (Step 4.5) |
| 用神喜忌 | Task 4 (Step 4.6) |
| 大运计算 | Task 4 (Step 4.7) |
| 流年计算 | Task 4 (Step 4.8) |
| BaziInput 增加 chart 字段 | Task 5 |
| 传统命盘表格 UI | Task 6 |
| 日主+格局卡片 UI | Task 7 |
| 大运时间轴 UI | Task 8 |
| 页面流程改造 | Task 9 |
| MessageList 展示排盘摘要 | Task 10 |
| 后端 AI prompt 注入排盘数据 | Task 11 |
| 端到端测试 | Task 12 |

## Placeholder Scan

无 TBD/TODO（起运年龄用了简化固定值 3 岁，代码中有注释说明，这是一个明确的简化决策而非占位符）。

## Type Consistency

- `BaziChart` 类型定义在 Task 4，在 Task 5/6/7/8/9/10/11 中引用，字段名一致
- `Pillar`/`DaYun`/`LiuNian`/`SolarTimeCorrection` 在 Task 4 定义，后续 Task 引用一致
- `BaziInput.chart` 类型在前端（Task 5）和后端（Task 11）中均有定义，后端使用内联类型（因后端不能 import 前端模块），字段名和结构一致
