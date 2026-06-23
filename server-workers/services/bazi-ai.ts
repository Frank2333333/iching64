/**
 * 八字排盘 AI 服务 — Workers 版
 * 从 server/bazi-ai.cjs 移植，用 skill-content.ts 常量替代 fs.readFileSync
 */
import OpenAI from 'openai';
import { SKILL_CONTENT, REFERENCES_CONTENT } from './skill-content';

// ==================== 系统提示词构建 ====================

function buildSystemPrompt(): string {
  const base = `你是中国传统四柱八字命理传承人，深谙子平法、滴天髓、穷通宝鉴、神峰通考等典籍。
你的风格是"铁口直断"：先给明确结论，再解释为什么，不模棱两可，建议少而精。
分析必须紧扣四柱、十神、格局、调候、宫位、生克制化。
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
8. 【用神一致性铁律】同一个八字的用神是唯一的、确定的。判断时必须遵循优先级：
   - 第一优先：格局用神（如正官格取印星，七杀格取食神/伤官）
   - 第二优先：调候用神（如冬木需火、夏土需水）
   - 第三优先：扶抑用神（身强宜泄耗，身弱宜生扶）
   - 若三者冲突，以格局用神为准。分析完毕后必须在输出中明确写出"用神：X（理由）"，且一旦确定，本次分析中不得更改。如果用户再次追问用神相关问题，必须与当前结论严格一致，禁止自相矛盾。
`;

  return base + skillRules + refs + outputRules;
}

// ==================== 八字排盘 Prompt ====================

interface BaziInput {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  gender?: string;
  birthplace?: string;
  question?: string;
  pillars?: { year: string; month: string; day: string; hour: string };
}

function buildBaziPrompt(input: BaziInput): string {
  const { year, month, day, hour, minute, gender, birthplace, question, pillars } = input;
  const genderText = gender === 'male' ? '男' : '女';

  let prompt: string;

  if (pillars) {
    prompt = `请基于以下已排好的四柱八字进行命理分析：

【命主信息】
- 性别：${genderText}
- 四柱八字：${pillars.year}  ${pillars.month}  ${pillars.day}  ${pillars.hour}
  （年柱  月柱  日柱  时柱）
- 出生地点：${birthplace || '未提供'}
`;

    if (question && question.trim()) {
      prompt += `\n【用户问题】${question.trim()}\n`;
    }

    prompt += `
【分析要求】
1. 确认并列出四柱的天干、地支、藏干、纳音
2. 标出十神（以日干为中心）
3. 分析日主强弱、格局、用神、喜忌
4. 给出核心画像：性格底色、行为模式、关系模式、压力来源、优劣势、人生主线
5. 若用户有具体问题，先直接回答，再展开命理解释
6. 给出至少一个校准问题，请用户验证过去某个具体事实
7. 按以下格式输出：

铁口：...
依据：...
名家方法：...
现实落点：...
置信度：...
校准：...
`;
  } else {
    const timeStr = `${(hour || 0).toString().padStart(2, '0')}:${(minute || 0).toString().padStart(2, '0')}`;

    prompt = `请为以下命主进行八字排盘和命理分析：

【出生信息】
- 性别：${genderText}
- 公历出生时间：${year}年${month}月${day}日 ${timeStr}
- 出生地点：${birthplace || '未提供'}
`;

    if (question && question.trim()) {
      prompt += `\n【用户问题】${question.trim()}\n`;
    }

    prompt += `
【分析要求】
1. 先排出四柱八字（年柱、月柱、日柱、时柱），列出天干、地支、藏干、纳音
2. 标出十神（以日干为中心）
3. 分析日主强弱、格局、用神、喜忌
4. 给出核心画像：性格底色、行为模式、关系模式、压力来源、优劣势、人生主线
5. 若用户有具体问题，先直接回答，再展开命理解释
6. 给出至少一个校准问题，请用户验证过去某个具体事实
7. 按以下格式输出：

铁口：...
依据：...
名家方法：...
现实落点：...
置信度：...
校准：...
`;
  }

  return prompt;
}

// ==================== OpenAI 调用 ====================

interface Env {
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  OPENAI_BASE_URL: string;
}

export async function getBaziFortune(input: BaziInput, env: Env): Promise<string> {
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY, baseURL: env.OPENAI_BASE_URL || 'https://api.openai.com/v1' });
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildBaziPrompt(input);

  console.log(`[BaziAI] 调用 OpenAI 八字解读，模型: ${model}`);

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

interface BaziChatData {
  message: string;
  baziInput: BaziInput;
  history: Array<{ role: string; content: string }>;
  initialInterpretationSummary?: string;
}

export async function chatWithBazi(data: BaziChatData, env: Env): Promise<string> {
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY, baseURL: env.OPENAI_BASE_URL || 'https://api.openai.com/v1' });
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';

  const { message, baziInput, history, initialInterpretationSummary } = data;

  const systemPrompt = buildSystemPrompt() +
    '\n\n当前为对话追问模式。请基于已有的命盘分析，继续回答用户的追问。保持铁口直断风格，不重复已说过的完整排盘信息。\n\n【重要约束】\n1. 你已有的命盘分析摘要中已包含用神、格局、日主强弱、喜忌等核心结论。回答时必须与这些结论保持一致。\n2. 如果用户问的是已有分析中未提及的内容，不要自行重新推导或猜测，而是明确说明"之前的分析中未涉及此点，建议重新进行一次完整的八字解读来确认"。\n3. 禁止在追问中给出与初始解读相矛盾的用神、格局或喜忌结论。';

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  // 注入命盘上下文
  const contextParts: string[] = [];
  if (baziInput) {
    const { year, month, day, hour, minute, gender, birthplace, pillars } = baziInput;
    if (pillars) {
      contextParts.push(`命主信息：${gender === 'male' ? '男' : '女'}，八字四柱：${pillars.year} ${pillars.month} ${pillars.day} ${pillars.hour}，${birthplace || '地点未提供'}`);
    } else {
      contextParts.push(`命主信息：${gender === 'male' ? '男' : '女'}，${year}年${month}月${day}日 ${hour}:${(minute || 0).toString().padStart(2, '0')}，${birthplace || '地点未提供'}`);
    }
  }
  if (initialInterpretationSummary) {
    contextParts.push(`\n【已完成的命盘分析摘要】\n${initialInterpretationSummary}`);
  }

  if (contextParts.length > 0) {
    messages.push({ role: 'system', content: contextParts.join('\n') });
  }

  // 添加历史对话（最近 8 轮）
  for (const msg of (history || []).slice(-8)) {
    messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
  }

  messages.push({ role: 'user', content: message });

  console.log(`[BaziAI] 调用 OpenAI 八字对话，模型: ${model}`);

  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.6,
    max_tokens: 4000,
  });

  return response.choices[0].message.content || '';
}
