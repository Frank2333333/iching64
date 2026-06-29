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
  mbti?: string; // 用户自填 MBTI（选填，注入分析）
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

=== 命理数据铁律（最高优先级，禁止违反）===
排盘引擎已为你提供确定性的命理数据，你必须严格引用，禁止自行重新推导：
1. 【十神】八字四柱的十神关系已给出（如"年柱[正印]"），提及任何天干对日主的关系时，必须与给出的十神字段完全一致。十神判定规则：同性相生/相克为偏（偏印/偏官/偏财等），异性相生/相克为正（正印/正官/正财等）。例：日主戊土，丁火生戊土为异性相生→正印（不是偏印）。禁止凭印象重算。
2. 【四化】紫微生年四化已给出（化禄/化权/化科/化忌各星），提及四化时必须与给出数据一致，不得自行更改某星化某化。
3. 【格局/用神】格局、用神、喜神、忌神已给出，全报告及追问中必须保持一致，不得自相矛盾。
4. 【五行生克】如需解释五行关系，按标准规则：金生水、水生木、木生火、火生土、土生金；金克木、木克土、土克水、水克火、火克金。同性为偏、异性为正。
5. 若用户追问的数据点在已提供命盘中未明确给出，宁可说"这需要更精确的排盘确认"，也不要自行编造十神或四化结论。

=== 输出规范 ===
1. 用 markdown：二级标题分节，段落叙事为主，关键处可加粗
2. 不要用"铁口/依据/置信度"这类命理报告格式，那是给命理师的，不是给用户的
3. 不要罗列命盘数据（四柱、十二宫清单），用户看不懂；命理依据融进叙事里
4. 涉及健康只说体质倾向与养护方向，以医学检查为准
5. 涉及重大决策（投资/婚恋/职业）末尾加一句轻免责：命理是参考，最终选择权在你
6. 给人方向感和掌控感，而不是宿命感${skillRules}${refs}

=== MBTI 融合规则（仅在用户自填 MBTI 时生效）===
- 把用户自填的 MBTI 作为"现代心理学人格视角"的补充维度，与命理结论相互印证、互相翻译
- 找到命理（日主/命宫主星/格局）与 MBTI 人格的共振点与张力点，让用户感到"东西方两套语言说的是同一个我"
- 命理数据优先：当 MBTI 与命理明显冲突时，以命理盘为准，并温和地点出这种差异（而非强行对齐）
- 不要长篇科普 MBTI 理论，自然融进叙事，1-2 处点睛即可，别让报告变成 MBTI 测评
- 追问中若用户问及性格/人际/职业倾向，可主动调用 MBTI 视角辅助回答`;
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
  if (input.mbti) lines.push(`用户MBTI（自填）：${input.mbti}`);
  return lines.join('\n');
}

// ==================== Prompt 构造 ====================

/**
 * 结构化锚定结论：从排盘数据抽取最易被 AI 重述时说错的硬结论（日主/格局/用神喜忌/
 * 命宫主星/命主身主/五行局/生年四化），组成带"禁止改写"强约束的独立块。
 * 与 system prompt 的"命理数据铁律"互补：铁律是规则层（禁止自行推导），
 * 锚定块是数据层（把结论直接摆出来照写），防止 overview 判错后被各章节当锚点固化。
 */
function buildAnchorConclusions(input: LifeReportInput): string {
  const c = input.baziChart;
  const z = input.ziweiChart;
  if (!c && !z) return '';
  const lines: string[] = ['=== 排盘引擎已确定的核心结论（锚定块·禁止改写·全报告必须与此逐字一致）==='];
  if (c) {
    lines.push('【八字】');
    lines.push(`- 日主：${c.dayMaster}（${c.dayMasterElement}），${c.dayMasterStrength}`);
    lines.push(`- 格局：${c.pattern}`);
    lines.push(`- 用神：${c.yongShen} / 喜神：${c.xiShen} / 忌神：${c.jiShen}`);
  }
  if (z) {
    lines.push('【紫微】');
    // soulPalace 存的是命宫地支名（earthlyBranchOfSoulPalace），按地支定位命宫取主星
    const mingGong = z.palaces.find(p => p.earthlyBranch === z.soulPalace);
    const majorStarNames = mingGong && mingGong.majorStars.length
      ? mingGong.majorStars.map(s => s.name + (s.mutagen ? `[化${s.mutagen}]` : '')).join('、')
      : '（空宫）';
    lines.push(`- 命宫（地支${z.soulPalace}）主星：${majorStarNames}`);
    lines.push(`- 命主：${z.soul} / 身主：${z.body} / 五行局：${z.fiveElementsClass}`);
    lines.push(`- 生年四化：${z.birthSiHua.lu}化禄、${z.birthSiHua.quan}化权、${z.birthSiHua.ke}化科、${z.birthSiHua.ji}化忌`);
  }
  lines.push('以上为确定性结论。叙事中提及时必须逐字一致，不得改写、自创或张冠李戴；未列于此的推论须标注为"进一步推断"。');
  return lines.join('\n');
}

function buildOverviewPrompt(input: LifeReportInput): string {
  let prompt = `请为以下命主生成"人生发展报告"的开篇——本命总览。\n\n`;
  prompt += `${formatInputHeader(input)}\n\n`;
  prompt += `=== 八字盘 ===\n${input.baziChart ? formatBaziChart(input.baziChart) : '（未提供）'}\n\n`;
  prompt += `=== 紫微盘 ===\n${input.ziweiChart ? formatZiweiChart(input.ziweiChart) : '（未提供）'}\n\n`;
  const anchor = buildAnchorConclusions(input);
  if (anchor) prompt += `${anchor}\n\n`;

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
  const anchor = buildAnchorConclusions(req);
  if (anchor) prompt += `${anchor}\n\n`;
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

  // 提炼日主+四柱十神，供 AI 追问时严格对照（防止十神关系说错）
  const c = data.input.baziChart;
  if (c) {
    const pillars = [c.yearPillar, c.monthPillar, c.dayPillar, c.hourPillar];
    const shiShenLine = pillars.map((p, i) => `${['年','月','日','时'][i]}柱${p.gan}${p.zhi}(${p.shiShen.join('/')})`).join(' ');
    prompt += `=== 命理数据对照（以此为准，禁止自行推导十神/四化/格局）===\n`;
    prompt += `日主：${c.dayMaster}${c.dayMasterElement}　四柱十神：${shiShenLine}\n`;
    prompt += `格局：${c.pattern}　用神：${c.yongShen}　喜神：${c.xiShen}　忌神：${c.jiShen}\n`;
    if (data.input.ziweiChart) {
      const s = data.input.ziweiChart.birthSiHua;
      prompt += `生年四化：${s.lu}化禄 ${s.quan}化权 ${s.ke}化科 ${s.ji}化忌\n`;
    }
    prompt += `\n`;
  }

  prompt += `=== 八字盘 ===\n${c ? formatBaziChart(c) : '（未提供）'}\n\n`;
  prompt += `=== 紫微盘 ===\n${data.input.ziweiChart ? formatZiweiChart(data.input.ziweiChart) : '（未提供）'}\n\n`;
  if (data.reportSummary) {
    prompt += `=== 已生成的报告摘要（请保持一致）===\n${data.reportSummary}\n\n`;
  }
  prompt += `请以人生规划师的身份回答用户的追问，温暖笃定，大白话，与报告已有结论一致。\n`;
  prompt += `【重要】提及任何天干对日主的关系时，必须严格对照上方"命理数据对照"中的十神，禁止自行重新推导（例：日主戊土遇丁火为正印，不是偏印）。`;
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
    temperature: 0.25,
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
    temperature: 0.25,
    max_tokens: 2500,
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

// ==================== 今日运势卡（围绕人生报告双盘）====================

/** 前端本地算好的流日干支与十神主调 */
export interface DailyFortuneContext {
  date: string; // YYYY-MM-DD
  yearGan: string; yearZhi: string;
  monthGan: string; monthZhi: string;
  dayGan: string; dayZhi: string;
  dayToneLabel: string; // 如 "印绶日"
  dayToneHint: string;
}

export interface DailyFortuneData {
  level: number; // 1-5
  tip: string; // 一句话点拨
  yi: string[]; // 宜
  ji: string[]; // 忌
  comment: string; // 2-3 句简评
}

/** JSON 模式：今日运势（短、轻、低成本） */
export async function getDailyFortune(
  input: LifeReportInput,
  ctx: DailyFortuneContext,
  env: Env,
): Promise<DailyFortuneData> {
  const openai = createClient(env);
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';
  const sys = `你是一位温暖、点拨式的人生规划师。基于用户的本命盘（八字日主+紫微命宫主星）与今日流日干支、十神主调，给出一份"今日运势"。
要求：轻松笃定、不宿命、给具体可执行的小建议。严格输出 JSON，字段：level(1-5整数,5最佳), tip(一句话点拨,20字内), yi(宜,2-3条短词), ji(忌,1-2条短词), comment(2-3句简评,结合日主与今日主调)。
不得输出 JSON 以外的任何文字。`;
  const user = `${formatInputHeader(input)}
${input.baziChart ? `\n=== 八字要点 ===\n日主：${input.baziChart.dayMaster}（${input.baziChart.dayMasterElement}），${input.baziChart.dayMasterStrength}，格局${input.baziChart.pattern}` : ''}
${input.ziweiChart ? `\n=== 紫微要点 ===\n${formatZiweiChart(input.ziweiChart)}` : ''}

=== 今日流日 ===
日期：${ctx.date}
流日干支：${ctx.dayGan}${ctx.dayZhi}（年 ${ctx.yearGan}${ctx.yearZhi} 月 ${ctx.monthGan}${ctx.monthZhi}）
今日主调：${ctx.dayToneLabel}（${ctx.dayToneHint}）

请输出 JSON。`;
  console.log(`[LifeReport] 调用 daily，模型: ${model}`);
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: user },
    ],
    temperature: 0.4,
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });
  const raw = response.choices[0].message.content || '{}';
  try {
    const obj = JSON.parse(raw) as Partial<DailyFortuneData>;
    return {
      level: Math.min(5, Math.max(1, Math.round(Number(obj.level) || 3))),
      tip: String(obj.tip || '').slice(0, 60),
      yi: Array.isArray(obj.yi) ? obj.yi.map(String).slice(0, 4) : [],
      ji: Array.isArray(obj.ji) ? obj.ji.map(String).slice(0, 3) : [],
      comment: String(obj.comment || ''),
    };
  } catch {
    return { level: 3, tip: '稳住节奏，顺势而为', yi: [], ji: [], comment: raw.slice(0, 200) };
  }
}

// ==================== 潜能雷达图（bazi+MBTI 本地基础分，紫微 AI 微调）====================

export type RadarAxis = 'drive' | 'wealth' | 'charm' | 'creative' | 'resilience' | 'execution';
export const RADAR_AXES: RadarAxis[] = ['drive', 'wealth', 'charm', 'creative', 'resilience', 'execution'];
export const RADAR_AXIS_LABELS: Record<RadarAxis, string> = {
  drive: '事业魄力', wealth: '财富积累', charm: '人际魅力',
  creative: '创造思维', resilience: '抗压稳定', execution: '行动执行',
};
export type RadarScores = Record<RadarAxis, number>;
export interface RadarResult {
  scores: RadarScores;
  comments: Partial<Record<RadarAxis, string>>;
  baseScores: RadarScores;
}

/** 十神归类 */
function shiShenCategory(s: string): '官杀' | '财星' | '食伤' | '印绶' | '比劫' | null {
  if (s.includes('官') || s.includes('杀')) return '官杀';
  if (s.includes('财')) return '财星';
  if (s.includes('食') || s.includes('伤')) return '食伤';
  if (s.includes('印')) return '印绶';
  if (s.includes('比') || s.includes('劫')) return '比劫';
  return null;
}

// 五行生克（用于把"十神类别"换算成五行，再对照用神喜忌）
const WUXING_SHENG: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
const WUXING_KE: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };
const shengMe = (el: string) => Object.keys(WUXING_SHENG).find(k => WUXING_SHENG[k] === el) || el; // 生我之五行
const keMe = (el: string) => Object.keys(WUXING_KE).find(k => WUXING_KE[k] === el) || el;         // 克我之五行

/** 格局 → 主导轴 */
function patternAxis(pattern: string): RadarAxis | null {
  if (pattern.includes('官') || pattern.includes('杀')) return 'drive';
  if (pattern.includes('财')) return 'wealth';
  if (pattern.includes('食') || pattern.includes('伤')) return 'creative';
  if (pattern.includes('印')) return 'resilience';
  return null; // 其他格（建禄/月刃等比劫类）→ execution
}

/** 各轴对应的十神类别 */
/**
 * 八字 + MBTI 本地确定性基础分
 * 设计：以格局为主导(+12)、用神/喜神得力加分、忌神减分、藏干十神微调(中性)、日主强弱、MBTI。
 * 基线 55，避免"全盘低分"的压抑感；格局所在轴自然走高，形成合理分化。
 */
export function computeRadarBaseScores(c: BaziChart, mbti?: string): RadarScores {
  // 藏干十神计数（辅助信号，非主导）
  const counts: Record<'官杀' | '财星' | '食伤' | '印绶' | '比劫', number> = {
    官杀: 0, 财星: 0, 食伤: 0, 印绶: 0, 比劫: 0,
  };
  for (const p of [c.yearPillar, c.monthPillar, c.dayPillar, c.hourPillar]) {
    for (const s of p.shiShen) {
      const cat = shiShenCategory(s);
      if (cat) counts[cat]++;
    }
  }
  // 藏干计数：中性基线（不因缺失而惩罚），有则小幅加分
  const countAdj = (n: number): number => (n <= 0 ? 0 : n === 1 ? 3 : n === 2 ? 6 : 9);

  // 各十神类别对应的五行（用于对照用神/喜神/忌神）
  const dayEl = c.dayMasterElement;
  const catElement: Record<'官杀' | '财星' | '食伤' | '印绶' | '比劫', string> = {
    官杀: keMe(dayEl),   // 克我
    财星: WUXING_KE[dayEl] || dayEl, // 我克
    食伤: WUXING_SHENG[dayEl] || dayEl, // 我生
    印绶: shengMe(dayEl), // 生我
    比劫: dayEl,          // 同我
  };
  // 用神得力 +8 / 喜神 +4 / 忌神 -8
  const yongAdj = (cat: '官杀' | '财星' | '食伤' | '印绶' | '比劫'): number => {
    const el = catElement[cat];
    if (c.yongShen && el === c.yongShen) return 8;
    if (c.xiShen && el === c.xiShen) return 4;
    if (c.jiShen && el === c.jiShen) return -8;
    return 0;
  };

  const strong = c.dayMasterStrength.includes('强');
  const weak = c.dayMasterStrength.includes('弱');
  const m = (mbti || '').toUpperCase();
  const has = (l: string) => m.includes(l);
  const clamp = (v: number) => Math.min(92, Math.max(12, Math.round(v)));

  const patternAx = patternAxis(c.pattern);
  // 格局主导轴 +12；其他格(比劫类)落到 execution
  const patternBoost = (ax: RadarAxis): number => {
    if (patternAx && ax === patternAx) return 12;
    if (!patternAx && ax === 'execution') return 12;
    return 0;
  };

  const base: RadarScores = {
    drive: clamp(55 + patternBoost('drive') + yongAdj('官杀') + countAdj(counts.官杀) + (has('T') ? 5 : 0) + (has('J') ? 5 : 0) + (strong ? 6 : weak ? -3 : 0)),
    wealth: clamp(55 + patternBoost('wealth') + yongAdj('财星') + countAdj(counts.财星) + (has('S') ? 5 : 0) + (has('J') ? 5 : 0) + (strong ? 6 : weak ? -3 : 0)),
    charm: clamp(55 + patternBoost('charm') + yongAdj('食伤') + countAdj(counts.食伤) + (has('F') ? 5 : 0) + (has('E') ? 5 : 0)),
    creative: clamp(55 + patternBoost('creative') + yongAdj('食伤') + countAdj(counts.食伤) + (has('N') ? 5 : 0) + (has('P') ? 5 : 0)),
    resilience: clamp(55 + patternBoost('resilience') + yongAdj('印绶') + countAdj(counts.印绶) + (has('J') ? 5 : 0) + (has('S') ? 5 : 0) + (strong ? 2 : weak ? 5 : 3)),
    execution: clamp(55 + patternBoost('execution') + yongAdj('比劫') + countAdj(counts.比劫) + (has('T') ? 5 : 0) + (has('J') ? 5 : 0) + (strong ? 6 : weak ? -3 : 0)),
  };
  return base;
}

/** 紫微 AI 在基础分 ±15 内微调 */
export async function getRadarScores(input: LifeReportInput, env: Env): Promise<RadarResult> {
  const base = computeRadarBaseScores(input.baziChart!, input.mbti);
  const openai = createClient(env);
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';

  const sys = `你是紫微斗数分析师。给你六维潜能的"基础分"（已由八字+MBTI算出），请结合紫微盘对应宫位的主星/吉煞/四化，在基础分 ±15 范围内微调出最终分（0-100整数），并给每轴一句紫微视角点评（20字内，说明紫微增减理由）。
六维与紫微宫位对应：事业魄力→官禄宫；财富积累→财帛宫；人际魅力→夫妻宫+桃花星；创造思维→命宫主星性质；抗压稳定→疾厄宫+田宅宫；行动执行→官禄宫+命宫。
严格输出JSON：{"scores":{"drive":N,"wealth":N,"charm":N,"creative":N,"resilience":N,"execution":N},"comments":{"drive":"...","wealth":"...","charm":"...","creative":"...","resilience":"...","execution":"..."}}。不得输出JSON以外文字。`;
  const user = `${formatInputHeader(input)}

=== 六维基础分（八字+MBTI 已算出，你只能在 ±15 内调整）===
${RADAR_AXES.map(a => `${RADAR_AXIS_LABELS[a]}(${a}): ${base[a]}`).join('  ')}

=== 紫微盘 ===
${input.ziweiChart ? formatZiweiChart(input.ziweiChart) : '（未提供）'}

请结合紫微盘对应宫位微调，输出JSON。`;
  console.log(`[LifeReport] 调用 radar，模型: ${model}`);
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: user },
    ],
    temperature: 0.2,
    max_tokens: 700,
    response_format: { type: 'json_object' },
  });
  const raw = response.choices[0].message.content || '{}';
  const scores: RadarScores = { ...base };
  const comments: Partial<Record<RadarAxis, string>> = {};
  try {
    const obj = JSON.parse(raw) as { scores?: Partial<RadarScores>; comments?: Record<string, string> };
    for (const a of RADAR_AXES) {
      const v = Number(obj.scores?.[a]);
      if (!isNaN(v)) {
        // 硬性约束 ±15 区间，防止 AI 漂移
        scores[a] = Math.min(100, Math.max(0, Math.round(Math.min(base[a] + 15, Math.max(base[a] - 15, v)))));
      }
    }
    if (obj.comments) {
      for (const a of RADAR_AXES) {
        const t = obj.comments[a];
        if (typeof t === 'string') comments[a] = t.slice(0, 60);
      }
    }
  } catch { /* 用基础分兜底 */ }
  return { scores, comments, baseScores: base };
}
