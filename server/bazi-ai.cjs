/**
 * 八字排盘 AI 服务
 * 基于 xuan-skill 的命理分析服�? */

// 加载环境变量
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// 初始�?OpenAI 客户�?const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// xuan skill 目录
const XUAN_DIR = path.join(__dirname, 'skills', 'xuan');
const REFS_DIR = path.join(XUAN_DIR, 'references');

// 缓存加载的内�?let skillContent = '';
let referencesContent = '';
let systemPromptCache = '';

/**
 * 加载 xuan skill 内容
 */
function loadSkillContent() {
  // 加载 SKILL.md
  try {
    const skillPath = path.join(XUAN_DIR, 'SKILL.md');
    if (fs.existsSync(skillPath)) {
      skillContent = fs.readFileSync(skillPath, 'utf-8');
      console.log('[BaziAI] 已加�?SKILL.md');
    } else {
      console.warn('[BaziAI] SKILL.md 不存在，使用默认规则');
    }
  } catch (err) {
    console.error('[BaziAI] 加载 SKILL.md 失败:', err.message);
  }

  // 加载 references
  try {
    if (fs.existsSync(REFS_DIR)) {
      const files = fs.readdirSync(REFS_DIR).filter(f => f.endsWith('.md'));
      const parts = [];
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(REFS_DIR, file), 'utf-8');
          // 限制单文件长度，避免超过 token 限制
          const truncated = content.length > 8000
            ? content.substring(0, 8000) + '\n...[已截断]'
            : content;
          parts.push(`=== ${file} ===\n${truncated}`);
        } catch (e) {
          console.warn(`[BaziAI] 加载 references/${file} 失败:`, e.message);
        }
      }
      referencesContent = parts.join('\n\n');
      console.log(`[BaziAI] 已加�?${files.length} �?reference 文件`);
    }
  } catch (err) {
    console.error('[BaziAI] 加载 references 失败:', err.message);
  }
}

/**
 * 构建系统提示�? */
function buildSystemPrompt() {
  if (systemPromptCache) return systemPromptCache;

  const base = `你是中国传统四柱八字命理传承人，深谙子平法、滴天髓、穷通宝鉴、神峰通考等典籍�?你的风格�?铁口直断"：先给明确结论，再解释为什么，不模棱两可，建议少而精�?分析必须紧扣四柱、十神、格局、调候、宫位、生克制化�?`;

  const skillRules = skillContent
    ? `\n=== 核心分析规则（xuan-skill�?==\n${skillContent.substring(0, 12000)}\n`
    : '';

  const refs = referencesContent
    ? `\n=== 参考资�?===\n${referencesContent.substring(0, 15000)}\n`
    : '';

  const outputRules = `\n=== 输出规范 ===
1. 第一行必须先下结论（铁口直断），不绕弯子
2. 然后给出：依据、名家方法、现实落点、置信度、校准问�?3. 回答用户具体问题优先，再展开命理解释
4. 健康只说体质倾向和风险提示，以医学检查为�?5. 不做道德审判,感情婚姻问题不自动劝分劝�?6. 涉及医学、法律、投资、重大决策时，末尾加一句短免责提示
7. 建议必须少而准，直接服务于用户当前问题
`;

  systemPromptCache = base + skillRules + refs + outputRules;
  return systemPromptCache;
}

/**
 * 构建八字排盘提示�? */
function buildBaziPrompt(input) {
  const { year, month, day, hour, minute, gender, birthplace, question, pillars } = input;

  const genderText = gender === 'male' ? '�? : '�?;

  let prompt;

  if (pillars) {
    // 直接给定八字模式：不再重新排盘，直接基于给定八字分析
    prompt = `请基于以下已排好的四柱八字进行命理分析：

【命主信息�?- 性别�?{genderText}
- 四柱八字�?{pillars.year}  ${pillars.month}  ${pillars.day}  ${pillars.hour}
  （年�? 月柱  日柱  时柱�?- 出生地点�?{birthplace || '未提�?}
`;

    if (question && question.trim()) {
      prompt += `\n【用户问题�?{question.trim()}\n`;
    }

    prompt += `
【分析要求�?1. 确认并列出四柱的天干、地支、藏干、纳�?2. 标出十神（以日干为中心）
3. 分析日主强弱、格局、用神、喜�?4. 给出核心画像：性格底色、行为模式、关系模式、压力来源、优劣势、人生主�?5. 若用户有具体问题，先直接回答，再展开命理解释
6. 给出至少一个校准问题，请用户验证过去某个具体事�?7. 按以下格式输出：

铁口�?..
依据�?..
名家方法�?..
现实落点�?..
置信度：...
校准�?..
`;
  } else {
    // 出生日期模式：需�?AI 先排�?    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    prompt = `请为以下命主进行八字排盘和命理分析：

【出生信息�?- 性别�?{genderText}
- 公历出生时间�?{year}�?{month}�?{day}�?${timeStr}
- 出生地点�?{birthplace || '未提�?}
`;

    if (question && question.trim()) {
      prompt += `\n【用户问题�?{question.trim()}\n`;
    }

    prompt += `
【分析要求�?1. 先排出四柱八字（年柱、月柱、日柱、时柱），列出天干、地支、藏干、纳�?2. 标出十神（以日干为中心）
3. 分析日主强弱、格局、用神、喜�?4. 给出核心画像：性格底色、行为模式、关系模式、压力来源、优劣势、人生主�?5. 若用户有具体问题，先直接回答，再展开命理解释
6. 给出至少一个校准问题，请用户验证过去某个具体事�?7. 按以下格式输出：

铁口�?..
依据�?..
名家方法�?..
现实落点�?..
置信度：...
校准�?..
`;
  }

  return prompt;
}

/**
 * 获取 AI 八字排盘解读
 * @param {Object} input - 用户输入的出生信�? * @returns {Promise<string>} AI 解读内容
 */
async function getBaziFortune(input) {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildBaziPrompt(input);

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.5,
    max_tokens: 4000,
  });

  return response.choices[0].message.content;
}

/**
 * 八字对话
 * @param {Object} data - 对话数据
 * @returns {Promise<string>} AI 回复内容
 */
async function chatWithBazi(data) {
  const { message, baziInput, history, initialInterpretationSummary } = data;

  const systemPrompt = buildSystemPrompt() +
    '\n\n当前为对话追问模式。请基于已有的命盘分析，继续回答用户的追问。保持铁口直断风格，不重复已说过的完整排盘信息。\n\n【重要约束】\n1. 你已有的命盘分析摘要中已包含用神、格局、日主强弱、喜忌等核心结论。回答时必须与这些结论保持一致。\n2. 如果用户问的是已有分析中未提及的内容，不要自行重新推导或猜测，而是明确说明\"之前的分析中未涉及此点，建议重新进行一次完整的八字解读来确认\"。\n3. 禁止在追问中给出与初始解读相矛盾的用神、格局或喜忌结论�?;

  const messages = [
    { role: 'system', content: systemPrompt },
  ];

  // 注入命盘上下�?  const contextParts = [];
  if (baziInput) {
    const { year, month, day, hour, minute, gender, birthplace, pillars } = baziInput;
    if (pillars) {
      contextParts.push(`命主信息�?{gender === 'male' ? '�? : '�?}，八字四柱：${pillars.year} ${pillars.month} ${pillars.day} ${pillars.hour}�?{birthplace || '地点未提�?}`);
    } else {
      contextParts.push(`命主信息�?{gender === 'male' ? '�? : '�?}�?{year}�?{month}�?{day}�?${hour}:${minute.toString().padStart(2, '0')}�?{birthplace || '地点未提�?}`);
    }
  }
  if (initialInterpretationSummary) {
    contextParts.push(`\n【已完成的命盘分析摘要】\n${initialInterpretationSummary}`);
  }

  if (contextParts.length > 0) {
    messages.push({
      role: 'system',
      content: contextParts.join('\n'),
    });
  }

  // 添加历史对话（最�?8 轮）
  for (const msg of (history || []).slice(-8)) {
    messages.push({ role: msg.role, content: msg.content });
  }

  messages.push({ role: 'user', content: message });

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.6,
    max_tokens: 4000,
  });

  return response.choices[0].message.content;
}

// 模块加载时初始化
loadSkillContent();

module.exports = { getBaziFortune, chatWithBazi };
