/**
 * 经典文献 AI 解读服务 — Workers 版
 * 提供古文段落的现代语言解读
 */
import OpenAI from 'openai';

interface ClassicsAIInput {
  bookTitle: string;
  chapterTitle: string;
  text: string;
  question?: string;
}

function buildSystemPrompt(): string {
  return `你是一位精通紫微斗数古籍的学者，深谙《骨髓赋》《紫微斗数全集》《紫微斗数全书》等经典文献。
你的任务是将古文段落翻译为现代白话，并解释其中的命理含义。

解读规则：
1. 先给出古文的白话译文
2. 然后解释其中的命理概念和关键词
3. 说明这段古文在实际命盘分析中如何应用
4. 如有用户提问，先回答问题再展开解释
5. 语言简洁明了，避免过度学术化
`;
}

function buildPrompt(input: ClassicsAIInput): string {
  let prompt = `请解读以下紫微斗数古文段落：

【出处】${input.bookTitle} · ${input.chapterTitle}

【原文】
${input.text}

请按以下格式输出：

【白话译文】
...

【命理解读】
...

【实际应用】
...
`;

  if (input.question) {
    prompt += `\n【用户问题】${input.question}\n`;
  }

  return prompt;
}

interface Env {
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  OPENAI_BASE_URL: string;
}

export async function interpretParagraph(input: ClassicsAIInput, env: Env): Promise<string> {
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY, baseURL: env.OPENAI_BASE_URL || 'https://api.openai.com/v1' });
  const model = env.OPENAI_MODEL || 'gpt-4o-mini';

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildPrompt(input);

  console.log(`[ClassicsAI] 调用 OpenAI 经典解读，模型: ${model}`);

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  return response.choices[0].message.content || '';
}
