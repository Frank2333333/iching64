# 本地八字排盘 + 真太阳时修正 设计文档

日期：2026-06-23

## 目标

将八字排盘从"完全依赖 AI"改为"前端本地排盘 → 结构化数据 → AI 解读"，与梅花易数的 `meihua-divination.ts` 架构一致。同时引入中国城市经纬度数据实现真太阳时修正。

## 方案选择

**方案 A：前端排盘**（已选定）

排盘计算全部在前端 `src/lib/bazi-calculator.ts` 完成。`lunar-javascript` 作为前端依赖用于阴历转换和日柱计算。

选择理由：与梅花易数架构一致；排盘即时展示无需网络；AI 不可用时排盘仍可用；bundle 增加约 15KB（gzip）可接受。

## 核心数据结构

### Pillar（单柱）

```typescript
interface Pillar {
  gan: string;        // 天干，如 "甲"
  zhi: string;        // 地支，如 "子"
  ganIndex: number;   // 天干索引 0-9
  zhiIndex: number;   // 地支索引 0-11
  nayin: string;      // 纳音，如 "海中金"
  cangGan: string[];  // 藏干，如 ["癸"]
  shiShen: string[];  // 十神（以日干为基准），如 ["正印"]
}
```

### DaYun（大运）

```typescript
interface DaYun {
  startAge: number;   // 起运年龄
  endAge: number;     // 止运年龄
  gan: string;        // 大运天干
  zhi: string;        // 大运地支
  cangGan: string[];  // 大运藏干
  shiShen: string;    // 大运十神（天干对日干）
}
```

### LiuNian（流年）

```typescript
interface LiuNian {
  year: number;       // 公历年份
  gan: string;        // 流年天干
  zhi: string;        // 流年地支
  shiShen: string;    // 流年十神（天干对日干）
}
```

### BaziChart（排盘结果）

```typescript
interface BaziChart {
  // 四柱
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;

  // 日主信息
  dayMaster: string;           // 日主天干
  dayMasterElement: string;    // 日主五行，如 "木"
  dayMasterStrength: string;   // 强弱判断："身强" | "身弱" | "偏强" | "偏弱" | "中和"

  // 格局与用神
  pattern: string;             // 格局，如 "正官格"
  yongShen: string;            // 用神五行，如 "火"
  xiShen: string;              // 喜神五行
  jiShen: string;              // 忌神五行

  // 大运（8-10步）
  daYun: DaYun[];

  // 当前流年
  currentLiuNian: LiuNian;

  // 真太阳时修正信息
  solarTimeCorrection?: {
    birthplace: string;
    longitude: number;
    correctionMinutes: number;
    originalHour: number;
    correctedHour: number;
    hourPillarChanged: boolean;
  };
}
```

## 排盘计算引擎

模块：`src/lib/bazi-calculator.ts`，纯函数，零副作用。

### 计算流程

1. **真太阳时修正**（如果启用）：从城市经纬度表查 longitude，计算 `correctionMinutes = (longitude - 120) × 4` 分钟，修正 hour/minute
2. **阴历转换**：`Lunar.fromSolar(year, month, day)` 获取阴历年月日
3. **年柱**：以立春为界，立春前用上一年干支
4. **月柱**：以节气为界，用五虎遁月口诀从年干推月干
5. **日柱**：lunar-javascript 直接提供
6. **时柱**：用修正后的时辰，五鼠遁时口诀从日干推时干
7. **纳音**：60 甲子纳音表查表
8. **藏干**：12 地支藏干表查表
9. **十神**：以日干为基准，天干对日干的五行生克关系+阴阳同异
10. **日主强弱**：得令（月支生扶）+ 得地（地支藏干同类）+ 得势（天干比劫帮扶）→ 综合判断
11. **格局**：取月支藏干透出者为格局，不透则取本气。正格 8 种，特殊格暂不处理
12. **用神喜忌**：身强用克泄耗，身弱用生扶，输出五行
13. **大运**：阳男阴女顺排，阴男阳女逆排。起运年龄 = 生日到下/上节气天数 ÷ 3。每步 10 年，最多 8 步
14. **当前流年**：当年干支 + 十神

### 依赖

| 数据 | 来源 |
|------|------|
| 阴历转换、日柱、节气时间 | `lunar-javascript`（npm 包） |
| 城市经纬度 | `src/data/cities.ts`（从紫微项目移植，511 行） |
| 纳音表、藏干表、十神规则、五虎遁/五鼠遁 | `src/data/bazi-constants.ts` 内部常量 |
| 格局判定、用神推导 | `src/lib/bazi-calculator.ts` 内部算法 |

### 关键设计决策

- 日柱依赖 lunar-javascript，自己实现天文历法容易出错
- 格局只取正格，从格/化格交给 AI 补充
- 大运最多 8 步，覆盖约 80 年
- 用神输出五行而非天干，降低复杂度，AI 可自行细化

## 传统命盘 UI

### 页面结构

```
输入 → 排盘结果页（命盘表格 + 大运时间轴 + 日主/格局卡片 + AI解读）
```

### 四柱命盘表格

```
┌────┬────┬────┬────┐
│ 年柱│ 月柱│ 日柱│ 时柱│
├────┼────┼────┼────┤
│十神│十神│ 日主│十神│  ← 天干行（日主加粗金色高亮）
│ 甲 │ 丙 │ 戊 │ 庚 │
├────┼────┼────┼────┤
│ 子 │ 寅 │ 午 │ 申 │  ← 地支行
│癸  │甲丙 │丁己│庚壬│  ← 藏干行（小字，本气在前）
├────┼────┼────┼────┤
│海中│炉中│天上│石榴│  ← 纳音行（小字灰色）
│ 金 │ 火 │ 水 │ 木 │
└────┴────┴────┴────┘
```

样式：浅色用琥珀色边框+米白底，深色用墨黑底+金色强调。真太阳时修正时在时柱下方显示"☀ 真太阳时已修正"小标签。

### 大运时间轴

- 水平滚动，每步大运一个卡片
- 当前大运高亮标记
- 卡片内容：起运年龄、大运干支、十神
- 初期不做点击展开流年列表

### 新增组件

| 组件 | 职责 |
|------|------|
| `BaziChartTable` | 四柱命盘表格 |
| `BaziDaYunTimeline` | 大运时间轴 |
| `BaziSummaryCards` | 日主信息 + 格局用神卡片 |

现有 `BaziForm`、`BaziMessageList`、`BaziChatInput` 基本不变。

## AI 集成变化

### BaziInput 接口扩展

```typescript
interface BaziInput {
  // 现有字段不变
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  gender: 'male' | 'female';
  birthplace?: string;
  useSolarTime?: boolean;
  question?: string;
  pillars?: BaziPillars;

  // 新增：本地排盘结果
  chart?: BaziChart;
}
```

向后兼容：`chart` 可选，未传时后端走原"AI 自行排盘"路径。

### 后端 prompt 变化

`buildBaziPrompt` 检测 `chart` 字段，有则用排盘数据构建 prompt：

```
以下是已经排好的八字命盘，请直接进行专业解读，不需要自行排盘：

四柱：年柱 甲午  月柱 庚午  日柱 戊申  时柱 庚申
藏干：年[丁己] 月[丁己] 日[庚壬戊] 时[庚壬戊]
十神：年[偏印] 月[偏印] 日[食神] 时[食神]
纳音：年[沙中金] 月[路旁土] 日[大驿土] 时[石榴木]
日主：戊土，身强
格局：正官格
用神：火，喜神：土，忌神：水

大运：3岁丁巳 → 13岁戊午 → 23岁己未 → ...
当前流年：2026丙午，十神偏印

出生地：北京（真太阳时修正+8分钟，时柱未变）
性别：男
用户问题：...
```

### chat 上下文变化

`initialInterpretationSummary` 包含排盘摘要：

```
命盘摘要：戊土日主，身强，正官格，用火喜土忌水
四柱：甲午 庚午 戊申 庚申
当前大运：己未（23-32岁）
AI初次解读概要：...
```

## 文件变更清单

### 新增文件

| 文件 | 行数估算 | 说明 |
|------|----------|------|
| `src/lib/bazi-calculator.ts` | ~400行 | 排盘引擎 |
| `src/data/bazi-constants.ts` | ~200行 | 常量表 |
| `src/data/cities.ts` | ~511行 | 城市经纬度 |
| `src/components/bazi/BaziChartTable.tsx` | ~200行 | 命盘表格组件 |
| `src/components/bazi/BaziDaYunTimeline.tsx` | ~120行 | 大运时间轴组件 |
| `src/components/bazi/BaziSummaryCards.tsx` | ~80行 | 日主+格局卡片 |

### 修改文件

| 文件 | 变化范围 | 说明 |
|------|----------|------|
| `src/lib/bazi-api.ts` | 小改 | `BaziInput` 增加 `chart?` 字段 |
| `src/pages/BaziDivination.tsx` | 中改 | 提交后先排盘→展示命盘→再调 AI |
| `src/components/bazi/BaziMessageList.tsx` | 小改 | 用户信息卡片展示排盘摘要 |
| `server-workers/services/bazi-ai.ts` | 中改 | `buildBaziPrompt` 支持 chart 数据注入 |

### 不动的文件

- `BaziForm.tsx` — 表单逻辑不变
- `BaziChatInput.tsx` — 聊天输入不变
- `skill-content.ts` — AI 规则内容不变
- `functions/api/[[route]].ts` — 路由层无需改
- `bazi-profile-api.ts` — 档案存 BaziInput，chart 自动包含

### 依赖变更

```diff
+ "lunar-javascript": "^1.7.3"
```

## 不做的事（YAGNI）

- 紫微斗数排盘
- 神煞计算
- 流月/流日排盘
- 大运点击展开流年列表
- 命盘图片分享
- 合盘分析
