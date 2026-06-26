/**
 * 人生发展报告 AI 服务 — 双盘合参（八字 + 紫微）
 * 角色：人生规划师（非命盘分析师），输出叙事性人生发展报告
 */
import OpenAI from 'openai';
import { SKILL_CONTENT, REFERENCES_CONTENT } from './skill-content';

// ==================== 类型定义（与前端排盘结构对齐）====================

interface BaziPillar {
  gan: string;
  zhi: string;
  cangGan: string[];
  shiShen: string[];
  nayin: string;
}

interface BaziChart {
  yearPillar: BaziPillar;
  monthPillar: BaziPillar;
  dayPillar: BaziPillar;
  hourPillar: BaziPillar;
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
}

interface ZiweiStar {
  name: string;
  type: string;
  brightness?: string;
  mutagen?: string;
}

interface ZiweiPalace {
  index: number;
  name: string;
  isBodyPalace: boolean;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: ZiweiStar[];
  minorStars: ZiweiStar[];
  adjectiveStars: ZiweiStar[];
  changsheng12: string;
  decadal?: { range: [number, number]; heavenlyStem: string; earthlyBranch: string };
}

interface ZiweiChart {
  solarDate: string;
  gender: string;
  time: string;
  fiveElementsClass: string;
  soulPalace: string;
  bodyPalace: string;
  soul: string;
  body: string;
  palaces: ZiweiPalace[];
  birthSiHua: { lu: string; quan: string; ke: string; ji: string };
}

export interface LifeReportInput {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  gender?: string;
  birthplace?: string;
  useSolarTime?: boolean;
  focus?: string; // 用户关注点（选填）
  baziChart?: BaziChart;
  ziweiChart?: ZiweiChart;
}

interface SectionRequest extends LifeReportInput {
  sectionType: SectionType;
  overview: string; // 已生成的总览结论，保证一致性
}

export type SectionType = 'career' | 'wealth' | 'marriage' | 'health' | 'trend';

export const SECTION_META: Record<SectionType, { title: string; theme: string }> = {
  career: { title: '事业', theme: '事业方向与发展节奏' },
  wealth: { title: '财富', theme: '财富格局与来源' },
  marriage: { title: '感情', theme: '感情模式与伴侣特质' },
  health: { title: '健康', theme: '体质倾向与养护' },
  trend: { title: '运势走向', theme: '人生关键阶段的节奏' },
};

interface ChatData {
  message: string;
  input: LifeReportInput;
  history: Array<{ role: string; content: string }>;
  reportSummary?: string; // 总览+各章节摘要
}

// ==================== 系统提示词（人生规划师）====================

function buildSystemPrompt(): string {
  const skillRules = SKILL_CONTENT ? `\n=== 命理参考规则 ===\n${SKILL_CONTENT}\n` : '';
  const refs = REFERENCES_CONTENT ? `\n=== 参考资料 ===\n${REFERENCES_CONTENT}\n` : '';

  return `你是一位资深的人生规划师，融合中国传统命理（八字 + 紫微斗数双盘合参）与现代心理学视角。
你服务的用户是"想了解自己"的普通人，不是命理研究者。你的目标是帮他们获得：对自己人生的解释权、重要决策的信心、情绪上的安慰、清晰的身份认同，缓解对未来的不确定感。

=== 你的角色定位 ===
- 你是"人生规划师"，不是"算命先生"，也不是命盘分析师
- 你用八字和紫微两张盘作为理解一个人的两副眼镜：八字看人生底色与节奏（能量格局、用神朝向、大运气候），紫微看具体在哪些领域以何种方式呈现（宫位、星曜、四化）
- 双盘交叉印证：两者一致处可笃定，分歧处正是需要细辨的关窍，要诚实点出

=== 叙事风格 ===
- 温暖、笃定、有洞察力，像一个真正懂你的人生导师在和你长谈
- 命理术语必须翻译成大白话，让普通人能懂（例：不说"日主庚金身弱用印"，说"你的内核是金属性的果断，但底气偏弱，需要靠学习和积累来支撑"）
- 先给"这个人是谁"的判断，再解释为什么，最后落到"那又怎样"
- 不宿命、不吓人、不断言灾难、不做道德审判
- 偶尔用一句话点睛，让人记住
- 建议少而具体，服务于用户的人生方向，不是说教

=== 双盘合参原则 ===
- 八字定框架：日主强弱、格局、用神喜忌、大运气候 → 这个人的"底色"和"朝向"
- 紫微填血肉：命宫格局、十二宫星曜、四化飞星 → 这些能量"在哪个领域、以什么方式、遇到什么人"呈现
- 用神/四化/格局等核心结论一旦在本报告的总览中确定，后续各章节必须保持一致，不得自相矛盾
- 八字大运（10年一段，看气候）与紫微大限（10年一宫，看领域）可互相对照看运势节奏

=== 输出规范 ===
1. 用 markdown：二级标题分节，段落叙事为主，关键处可加粗
2. 不要用"铁口/依据/置信度"这类命理报告格式，那是给命理师的，不是给用户的
3. 不要罗列命盘数据（四柱、十二宫清单），用户看不懂；命理依据融进叙事里
4. 涉及健康只说体质倾向与养护方向，以医学检查为准
5. 涉及重大决策（投资/婚恋/职业）末尾加一句轻免责：命理是参考，最终选择权在你
6. 给人方向感和掌控感，而不是宿命感${skillRules}${refs}`;
}

// ==================== 双盘格式化（给 AI 看的完整数据）====================

function formatBaziChart(c: BaziChart): string {
  const pillars = [c.yearPillar, c.monthPillar, c.dayPillar, c.hourPillar];
  const names = ['年柱', '月柱', '日柱', '时柱'];
  const lines: string[] = [];

  lines.push('四柱：' + pillars.map((p, i) => `${names[i]} ${p.gan}${p.zhi}`).join('  '));
  lines.push('藏干：' + pillars.map((p, i) => `${names[i]}[${p.cangGan.join('')}]`).join(' '));
  lines.push('十神：' + pillars.map((p, i) => `${names[i]}[${p.shiShen.join('/')}]`).join(' '));
  lines.push(`日主：${c.dayMaster}${c.dayMasterElement}，${c.dayMasterStrength}`);
  lines.push(`格局：${c.pattern}`);
  lines.push(`用神：${c.yongShen}，喜神：${c.xiShen}，忌神：${c.jiShen}`);
  lines.push(`大运：${c.daYun.map(dy => `${dy.startAge}-${dy.endAge}岁 ${dy.gan}${dy.zhi}(十神${dy.shiShen})`).join(' → ')}`);
  lines.push(`当前流年：${c.currentLiuNian.year} ${c.currentLiuNian.gan}${c.currentLiuNian.zhi}(十神${c.currentLiuNian.shiShen})`);

  const currentAge = new Date().getFullYear() - c.birthYear;
  const currentDaYun = c.daYun.find(dy => currentAge >= dy.startAge && currentAge <= dy.endAge);
  if (currentDaYun) {
    lines.push(`当前大运：${currentDaYun.gan}${currentDaYun.zhi}（${currentDaYun.startAge}-${currentDaYun.endAge}岁，十神${currentDaYun.shiShen}），命主现约${currentAge}岁`);
  }

  return lines.join('\n');
}

function formatStar(star: ZiweiStar): string {
  let s = star.name;
  if (star.brightness) s += `(${star.brightness})`;
  if (star.mutagen) s += `[化${star.mutagen}]`;
  return s;
}

function formatZiweiChart(c: ZiweiChart): string {
  const lines: string[] = [];
  lines.push(`五行局：${c.fiveElementsClass}`);
  lines.push(`命宫：${c.soulPalace}，命主：${c.soul}，身主：${c.body}，身宫：${c.bodyPalace}`);
  lines.push(`生年四化：${c.birthSiHua.lu}化禄 ${c.birthSiHua.quan}化权 ${c.birthSiHua.ke}化科 ${c.birthSiHua.ji}化忌`);
  lines.push('十二宫：');
  for (const p of c.palaces) {
    const stars: string[] = [];
    if (p.majorStars.length) stars.push(...p.majorStars.map(formatStar));
    if (p.minorStars.length) stars.push(...p.minorStars.map(s => `${s.name}${s.mutagen ? '[化' + s.mutagen + ']' : ''}`));
    if (p.adjectiveStars.length) stars.push(...p.adjectiveStars.map(s => s.name));
    const bodyMark = p.isBodyPalace ? '(身)' : '';
    let line = `${p.name}${bodyMark}(${p.heavenlyStem}${p.earthlyBranch})：${stars.join(' ')}`;
    if (p.changsheng12) line += ` ${p.changsheng12}`;
    if (p.decadal) line += ` [大限${p.decadal.range[0]}-${p.decadal.range[1]}岁 ${p.decadal.heavenlyStem}${p.decadal.earthlyBranch}]`;
    lines.push(line);
  }
  return lines.join('\n');
}

function formatInputHeader(input: LifeReportInput): string {
  const genderText = input.gender === 'male' ? '男' : '女';
  const lines = [
    `命主：${genderText}，${input.year}年${input.month}月${input.day}日 ${input.hour}:${(input.minute || 0).toString().padStart(2, '0')}`,
  ];
  if (input.birthplace) lines.push(`出生地：${input.birthplace}`);
  if (input.useSolarTime) lines.push('已启用真太阳时修正');
  if (input.focus) lines.push(`用户关注点：${input.focus}`);
  return lines.join('\n');
}

// ==================== Prompt 构造 ====================

function buildOverviewPrompt(input: LifeReportInput): string {
  let prompt = `请为以下命主生成"人生发展报告"的开篇——本命总览。\n\n`;
  prompt += `${formatInputHeader(input)}\n\n`;
  prompt += `=== 八字盘 ===\n${input.baziChart ? formatBaziChart(input.baziChart) : '（未提供）'}\n\n`;
  prompt += `=== 紫微盘 ===\n${input.ziweiChart ? formatZiweiChart(input.ziweiChart) : '（未提供）'}\n\n`;

  prompt += `【本命总览要求】
这是整份报告的开篇，要让用户读完立刻感到"被看见"。用 markdown，约 500-700 字，包含：
1. 一句点睛的"你是谁"——给用户一个清晰的身份认同（基于八字日主+紫微命宫主星）
2. 人生底色：这个人的内核特质、行为模式、与世界的相处方式（八字日主强弱格局+紫微命宫三方四正）
3. 核心天赋与软肋：天生的优势在哪、容易卡在哪（八字用神喜忌+紫微吉煞四化）
4. 人生主线基调：这个人一辈子大概在追什么、在修什么课题

要求：
- 大白话叙事，命理依据融进字里行间，不要罗列术语
- 温暖笃定，给掌控感不给宿命感
- 这个总览里的核心结论（日主特质、用神朝向、命宫格局、四化落点）将在后续各章节复用，请明确稳定
`;
  return prompt;
}

function buildSectionPrompt(req: SectionRequest): string {
  const meta = SECTION_META[req.sectionType];
  let prompt = `请为同一命主继续生成人生发展报告的「${meta.title}」章节，主题：${meta.theme}。\n\n`;
  prompt += `${formatInputHeader(req)}\n\n`;
  prompt += `=== 八字盘 ===\n${req.baziChart ? formatBaziChart(req.baziChart) : '（未提供）'}\n\n`;
  prompt += `=== 紫微盘 ===\n${req.ziweiChart ? formatZiweiChart(req.ziweiChart) : '（未提供）'}\n\n`;
  prompt += `=== 本命总览（已生成，请保持一致）===\n${req.overview}\n\n`;

  const focusMap: Record<SectionType, string> = {
    career: `双盘视角：八字看官杀（事业格局与成就方式）+ 紫微官禄宫（具体职业领域与工作模式）。落到"适合什么方向、怎么发展、节奏如何"。`,
    wealth: `双盘视角：八字看财星与日主关系（求财方式、守财能力）+ 紫微财帛宫（钱财来源与花销模式）。落到"财富格局如何、钱从哪来、要注意什么"。`,
    marriage: `双盘视角：八字看日支与财官（感情模式、配偶特质倾向）+ 紫微夫妻宫（伴侣画像、婚姻质量）。落到"感情里是什么样的人、适合什么样的伴侣、如何经营"。`,
    health: `双盘视角：八字看五行偏枯（体质倾向）+ 紫微疾厄宫（具体易感方向）。只说体质倾向与养护方向，以医学检查为准。`,
    trend: `双盘视角：八字大运（每10年气候，用神是否到位）+ 紫微大限（每10年走到什么宫、什么主题）。把人生切成几个阶段，说清每个阶段的主题、机遇与注意点，尤其点出当前阶段。`,
  };

  prompt += `【${meta.title}章节要求】
${focusMap[req.sectionType]}

用 markdown，约 500-800 字：
- 直接进入这个维度的叙事，不重复总览里的身份判断
- 给具体的方向和画面感，不要泛泛而谈
- 命理术语翻译成大白话
- 和本命总览的核心结论保持一致，不得自相矛盾
- 结尾若有重大决策含义，加一句轻免责
`;
  return prompt;
}

function buildChatPrompt(data: ChatData): string {
  let prompt = `用户正在阅读自己的人生发展报告，现在向你追问。\n\n`;
  prompt += `${formatInputHeader(data.input)}\n\n`;
  prompt += `=== 八字盘 ===\n${data.input.baziChart ? formatBaziChart(data.input.baziChart) : '（未提供）'}\n\n`;
  prompt += `=== 紫微盘 ===\n${data.input.ziweiChart ? formatZiweiChart(data.input.ziweiChart) : '（未提供）'}\n\n`;
  if (data.reportSummary) {
    prompt += `=== 已生成的报告摘要（请保持一致）===\n${data.reportSummary}\n\n`;
  }
  prompt += `请以人生规划师的身份回答用户的追问，温暖笃定，大白话，与报告已有结论一致。`;
  return prompt;
}

// ==================== OpenAI 调用 ====================

interface Env {
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  OPENAI_BASE_URL: string;
}

function createClient(env: Env): OpenAI {
  return new OpenAI({ apiKey: env.OPENAI_API_KEY, baseURL: env.OPENAI_BASE_URL || 'https://api.openai.com/v1' });
}

export async function getLifeReportOverview(input: LifeReportInput, env: Env): Promise<string> {
  const openai = createClient(env);
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';
  console.log(`[LifeReport] 调用 overview，模型: ${model}`);
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildOverviewPrompt(input) },
    ],
    temperature: 0.4,
    max_tokens: 2000,
  });
  return response.choices[0].message.content || '';
}

export async function getLifeReportSection(req: SectionRequest, env: Env): Promise<string> {
  const openai = createClient(env);
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';
  console.log(`[LifeReport] 调用 section: ${req.sectionType}，模型: ${model}`);
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildSectionPrompt(req) },
    ],
    temperature: 0.4,
    max_tokens: 1500,
  });
  return response.choices[0].message.content || '';
}

export async function chatWithLifeReport(data: ChatData, env: Env): Promise<string> {
  const openai = createClient(env);
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: buildSystemPrompt() + '\n\n当前为追问模式。基于已有报告继续回答，不重复报告全文，与报告结论保持一致。' },
    { role: 'system', content: buildChatPrompt(data) },
  ];
  for (const msg of (data.history || []).slice(-8)) {
    messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
  }
  messages.push({ role: 'user', content: data.message });
  console.log(`[LifeReport] 调用 chat，模型: ${model}`);
  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.6,
    max_tokens: 2000,
  });
  return response.choices[0].message.content || '';
}
