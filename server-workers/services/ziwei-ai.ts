/**
 * 紫微斗数 AI 服务 — Workers 版
 * 参照 bazi-ai.ts 模式：系统 prompt + chart prompt + OpenAI 调用
 */
import OpenAI from 'openai';
import { SKILL_CONTENT, REFERENCES_CONTENT } from './skill-content';

// ==================== 类型定义 ====================

interface Star {
  name: string;
  type: string;
  brightness?: string;
  mutagen?: string;
}

interface Palace {
  index: number;
  name: string;
  isBodyPalace: boolean;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: Star[];
  minorStars: Star[];
  adjectiveStars: Star[];
  changsheng12: string;
  decadal?: { range: [number, number]; heavenlyStem: string; earthlyBranch: string };
}

interface ZiweiChart {
  solarDate: string;
  lunarDate: string;
  chineseDate: string;
  gender: string;
  time: string;
  timeRange: string;
  sign: string;
  zodiac: string;
  fiveElementsClass: string;
  soulPalace: string;
  bodyPalace: string;
  soul: string;
  body: string;
  palaces: Palace[];
  birthSiHua: { lu: string; quan: string; ke: string; ji: string };
  solarTimeCorrection?: {
    birthplace: string;
    longitude: number;
    correctionMinutes: number;
    originalHour: number;
    correctedHour: number;
    hourIndexChanged: boolean;
  };
}

interface ZiweiInput {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  gender?: string;
  birthplace?: string;
  useSolarTime?: boolean;
  question?: string;
  chart?: ZiweiChart;
}

// ==================== 系统提示词构建 ====================

function buildSystemPrompt(): string {
  const base = `你是中国传统紫微斗数命理传承人，深谙紫微斗数全书、紫微斗数全集、骨髓赋、太微赋等典籍。
你遵循倪海夏天纪体系：四化星永远固定不动，不使用飞星派技法。
你的风格是"铁口直断"：先给明确结论，再解释为什么，不模棱两可，建议少而精。
分析必须紧扣命宫、三方四正、四化飞星、星曜亮度、大限流年。
`;

  const skillRules = SKILL_CONTENT
    ? `\n=== 核心分析规则（xuan-skill）===\n${SKILL_CONTENT}\n`
    : '';

  const refs = REFERENCES_CONTENT
    ? `\n=== 参考资料 ===\n${REFERENCES_CONTENT}\n`
    : '';

  const outputRules = `\n=== 输出规范 ===
1. 第一行必须先下结论（铁口直断），不绕弯子
2. 然后给出：依据、名家方法、现实落点、置信度、校准问题
3. 回答用户具体问题优先，再展开命理解释
4. 健康只说体质倾向和风险提示，以医学检查为准
5. 不做道德审判,感情婚姻问题不自动劝分劝离
6. 涉及医学、法律、投资、重大决策时，末尾加一句短免责提示
7. 建议必须少而准，直接服务于用户当前问题
8. 【四化一致性铁律】同一命盘的生年四化是唯一的、确定的。分析完毕后必须明确写出"化禄：X，化权：Y，化科：Z，化忌：W"，且一旦确定，本次分析中不得更改。
`;

  return base + skillRules + refs + outputRules;
}

// ==================== 紫微斗数 Prompt ====================

function formatStar(star: Star): string {
  let s = star.name;
  if (star.brightness) s += `(${star.brightness})`;
  if (star.mutagen) s += `[化${star.mutagen}]`;
  return s;
}

function buildChartPrompt(input: ZiweiInput): string {
  const c = input.chart!;

  let prompt = `以下是已经排好的紫微斗数命盘，请直接进行专业解读，不需要自行排盘：\n\n`;

  // 命主信息
  prompt += `命主信息：${c.gender}，${c.solarDate}，${c.chineseDate}，${c.time}\n`;
  prompt += `五行局：${c.fiveElementsClass}\n`;
  prompt += `命宫：${c.soulPalace}，命主：${c.soul}，身主：${c.body}\n`;
  prompt += `身宫：${c.bodyPalace}\n`;
  prompt += `生年四化：${c.birthSiHua.lu}化禄 ${c.birthSiHua.quan}化权 ${c.birthSiHua.ke}化科 ${c.birthSiHua.ji}化忌\n\n`;

  // 十二宫
  prompt += `十二宫：\n`;
  for (const palace of c.palaces) {
    const bodyMark = palace.isBodyPalace ? '(身)' : '';
    const stars = [];
    if (palace.majorStars.length > 0) stars.push(...palace.majorStars.map(formatStar));
    if (palace.minorStars.length > 0) stars.push(...palace.minorStars.map(s => `${s.name}${s.mutagen ? '[化' + s.mutagen + ']' : ''}`));
    if (palace.adjectiveStars.length > 0) stars.push(...palace.adjectiveStars.map(s => s.name));

    prompt += `${palace.name}${bodyMark}(${palace.heavenlyStem}${palace.earthlyBranch})：${stars.join(' ')}`;
    if (palace.changsheng12) prompt += ` ${palace.changsheng12}`;
    if (palace.decadal) {
      prompt += ` [大限${palace.decadal.range[0]}-${palace.decadal.range[1]}岁 ${palace.decadal.heavenlyStem}${palace.decadal.earthlyBranch}]`;
    }
    prompt += '\n';
  }
  prompt += '\n';

  // 真太阳时
  if (c.solarTimeCorrection) {
    const sc = c.solarTimeCorrection;
    prompt += `出生地：${sc.birthplace}（真太阳时修正${sc.correctionMinutes > 0 ? '+' : ''}${sc.correctionMinutes}分钟${sc.hourIndexChanged ? '，时辰已变更' : ''}）\n`;
  } else if (input.birthplace) {
    prompt += `出生地：${input.birthplace}\n`;
  }

  if (input.question) {
    prompt += `用户问题：${input.question}\n`;
  }

  prompt += `
【分析要求】
1. 基于以上已排好的命盘，直接进行深度解读
2. 重点分析命宫格局、三方四正（命宫、财帛、官禄、迁移）、四化飞星、星曜亮度
3. 给出核心画像：性格底色、行为模式、关系模式、压力来源、优劣势、人生主线
4. 若用户有具体问题，先直接回答，再展开命理解释
5. 给出至少一个校准问题，请用户验证过去某个具体事实
6. 按以下格式输出：

铁口：...
依据：...
名家方法：...
现实落点：...
置信度：...
校准：...
`;

  return prompt;
}

function buildZiweiPrompt(input: ZiweiInput): string {
  // 有 chart 数据时直接使用
  if (input.chart) {
    return buildChartPrompt(input);
  }

  // 无 chart 时让 AI 自行排盘
  const { year, month, day, hour, minute, gender, birthplace, question } = input;
  const timeStr = `${(hour || 0).toString().padStart(2, '0')}:${(minute || 0).toString().padStart(2, '0')}`;

  let prompt = `请为以下命主进行紫微斗数排盘和命理分析：

【出生信息】
- 性别：${gender === 'male' ? '男' : '女'}
- 公历出生时间：${year}年${month}月${day}日 ${timeStr}
- 出生地点：${birthplace || '未提供'}
`;

  if (question && question.trim()) {
    prompt += `\n【用户问题】${question.trim()}\n`;
  }

  prompt += `
【分析要求】
1. 先排出紫微斗数命盘（十二宫、主星、辅星、四化）
2. 分析命宫格局、三方四正、四化飞星、星曜亮度
3. 给出核心画像：性格底色、行为模式、关系模式、压力来源、优劣势、人生主线
4. 若用户有具体问题，先直接回答，再展开命理解释
5. 按以下格式输出：

铁口：...
依据：...
名家方法：...
现实落点：...
置信度：...
校准：...
`;

  return prompt;
}

// ==================== OpenAI 调用 ====================

interface Env {
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  OPENAI_BASE_URL: string;
}

export async function getZiweiFortune(input: ZiweiInput, env: Env): Promise<string> {
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY, baseURL: env.OPENAI_BASE_URL || 'https://api.openai.com/v1' });
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildZiweiPrompt(input);

  console.log(`[ZiweiAI] 调用 OpenAI 紫微斗数解读，模型: ${model}`);

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.15,
    max_tokens: 4000,
  });

  return response.choices[0].message.content || '';
}

interface ZiweiChatData {
  message: string;
  ziweiInput: ZiweiInput;
  history: Array<{ role: string; content: string }>;
  initialInterpretationSummary?: string;
}

export async function chatWithZiwei(data: ZiweiChatData, env: Env): Promise<string> {
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY, baseURL: env.OPENAI_BASE_URL || 'https://api.openai.com/v1' });
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';

  const { message, ziweiInput, history, initialInterpretationSummary } = data;

  const systemPrompt = buildSystemPrompt() +
    '\n\n当前为对话追问模式。请基于已有的命盘分析，继续回答用户的追问。保持铁口直断风格，不重复已说过的完整排盘信息。\n\n【重要约束】\n1. 你已有的命盘分析摘要中已包含四化、命宫格局、星曜组合等核心结论。回答时必须与这些结论保持一致。\n2. 如果用户问的是已有分析中未提及的内容，不要自行重新推导或猜测。\n3. 禁止在追问中给出与初始解读相矛盾的四化、格局或星曜结论。';

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  // 注入命盘上下文
  const contextParts: string[] = [];
  if (ziweiInput) {
    const { year, month, day, hour, minute, gender, birthplace } = ziweiInput;
    contextParts.push(`命主信息：${gender === 'male' ? '男' : '女'}，${year}年${month}月${day}日 ${hour}:${(minute || 0).toString().padStart(2, '0')}，${birthplace || '地点未提供'}`);
  }
  if (initialInterpretationSummary) {
    contextParts.push(`\n【已完成的命盘分析摘要】\n${initialInterpretationSummary}`);
  }

  if (contextParts.length > 0) {
    messages.push({ role: 'system', content: contextParts.join('\n') });
  }

  // 如果有排盘数据，注入排盘摘要
  if (ziweiInput.chart) {
    const c = ziweiInput.chart;
    const mingGong = c.palaces.find(p => p.name === '命宫');
    const chartSummary = `命盘摘要：${c.fiveElementsClass}，命宫${c.soulPalace}${mingGong ? '（主星：' + mingGong.majorStars.map(s => s.name).join('、') + '）' : ''}，命主${c.soul}，身主${c.body}\n`
      + `四化：${c.birthSiHua.lu}化禄 ${c.birthSiHua.quan}化权 ${c.birthSiHua.ke}化科 ${c.birthSiHua.ji}化忌`;

    messages.push({ role: 'system', content: chartSummary });
  }

  // 添加历史对话（最近 8 轮）
  for (const msg of (history || []).slice(-8)) {
    messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
  }

  messages.push({ role: 'user', content: message });

  console.log(`[ZiweiAI] 调用 OpenAI 紫微斗数对话，模型: ${model}`);

  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.6,
    max_tokens: 4000,
  });

  return response.choices[0].message.content || '';
}
