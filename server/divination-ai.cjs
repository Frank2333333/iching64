/**
 * OpenAI 解卦服务
 * 将解卦数据发送给 OpenAI 获取 AI 解卦说明
 */

// 加载环境变量（确保环境变量可用）
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const OpenAI = require('openai');

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * 构建解卦 prompt
 * @param {Object} data 解卦数据
 * @returns {string} prompt 文本
 */
function buildPrompt(data) {
  const {
    gua,
    dongYao,
    tiGuaName,
    yongGuaName,
    wuxingDetail,
    huGua,
    bianGua,
    yingQi,
    selectedScene,
    questionContent
  } = data;

  // 场景映射，用于生成场景化建议
  const sceneMap = {
    'career': { name: '事业前程', tips: '关注升迁机会、职场人际关系、跳槽时机、创业风险' },
    'relationship': { name: '感情姻缘', tips: '关注感情发展、婚姻时机、桃花运势、相处之道' },
    'health': { name: '健康疾病', tips: '关注身体调养、疾病康复、养生方向、医疗决策' },
    'wealth': { name: '财运投资', tips: '关注理财方向、投资风险、收支平衡、求财时机' },
    'study': { name: '学业考试', tips: '关注学习方法、考试运势、升学方向、竞争策略' },
    'travel': { name: '出行迁移', tips: '关注出行安全、搬家时机、远行利弊、方位选择' },
    'legal': { name: '官司诉讼', tips: '关注诉讼策略、调解时机、法律风险、权益维护' },
    'lost': { name: '寻物失物', tips: '关注失物方位、找回时机、寻找策略、预防措施' }
  };

  const scene = selectedScene ? sceneMap[selectedScene.id] : null;

  return `你是一位精通《梅花易数》和《易经》的东方智慧顾问。你最大的特点是：擅长把晦涩的卦辞爻辞，转化成普通人一听就懂、且能抚慰人心的生活建议。

## 📊 起卦数据

### 本卦（现状）
- 卦名：第 ${gua?.id || '?'} 卦 ${gua?.chineseName || '?'}（${gua?.name || '?'}）
- 卦意：${gua?.meaning || '无'}
- 卦辞：${gua?.guaci || '无'}
- 大象：${gua?.daXiangZhuan || '无'}

### 体用关系（核心判断依据）
- 体卦（代表自己）：${tiGuaName || '?'}
- 用卦（代表所问之事）：${yongGuaName || '?'}
- 关系：${wuxingDetail?.judgment || '?'}
- 解释：${wuxingDetail?.description || '?'}

### 动爻（变化点）
- 位置：第 ${dongYao?.position || '?'} 爻 ${dongYao?.name || '?'}
- 爻辞：${dongYao?.text || '无'}
- 小象：${dongYao?.xiangZhuan || '无'}

### 互卦与变卦
- 互卦（发展过程）：${huGua?.shangGuaName || '?'}${huGua?.xiaGuaName || '?'}（第 ${huGua?.guaId || '?'} 卦）
- 变卦（最终结果）：${bianGua?.shangGuaName || '?'}${bianGua?.xiaGuaName || '?'}（第 ${bianGua?.guaId || '?'} 卦）

### 问事场景
${scene ? `用户询问：「${scene.name}」\n关注重点：${scene.tips}` : '用户未指定具体场景，请给出通用建议'}

### 用户具体描述的问题
${questionContent ? `用户详细描述：「${questionContent}」\n\n**重要提示**：请结合用户的具体描述来解读卦象，让建议更有针对性。不要只是泛泛而谈。` : '用户未提供详细描述，请基于卦象给出通用建议。'}

---

## 🎯 输出要求（请严格遵循）

### 核心原则
1. **先给结论，再讲原理** —— 用户最关心的是"结果如何"和"该怎么办"
2. **少用术语，多打比方** —— 用现代生活场景解释古老智慧
3. **分层阅读，标注重点** —— 用 emoji 和分隔线让结构清晰
4. **场景化建议** —— 结合具体问事场景给出可操作建议
5. **结合用户描述** —— 如果用户提供了具体问题，务必结合其描述给出针对性建议，不要泛泛而谈

---

### 📋 输出结构

## 一、一句话结论（30字内）
用大白话给出最核心的判断，让用户一眼看懂：
- ✅ 吉利的例子："时机不错，主动争取能成，但别太急"
- ⚠️ 一般的例子："有戏，但得费点劲，月底前后见分晓"
- ❌ 不利的例子："眼下时机不对，宜守不宜攻，暂缓为好"

---

## 二、卦象白话解读（200-250字）

**2.1 现状怎么样？**
- 用1-2句话概括当前处境（比如：像"蓄势待发""进退两难""水到渠成"等状态）
- 解释卦名含义：${gua?.chineseName} 代表什么意思？用比喻说明
- 结合问事场景：这事目前处于什么阶段？

**2.2 核心矛盾在哪？（体用关系白话版）**
- 把"体卦${tiGuaName}克用卦${yongGuaName}"翻译成："你（${tiGuaName}）和这件事（${yongGuaName}）的关系是..."
- 打个比方：比如"像逆水行船""像顺水推舟""像借力打力"等
- 给出一个生活化的场景描述

**2.3 变化点提示（动爻解读）**
- 第${dongYao?.position || '?'}爻动代表什么？
- 爻辞"${dongYao?.text || ''}"白话翻译：...
- 关键转折点：什么时候/什么事会让情况变化？

**2.4 事情会如何发展？**
- 近期（互卦）：中间会遇到什么？是助力还是阻力？
- 远期（变卦）：最后结果大概什么样？和最初想法一致吗？

---

## 三、给你的具体建议（分条列出，共200-250字）

根据「${scene ? scene.name : '所问之事'}」给出针对性建议：

**✅ 宜做（2-3条，具体可操作）**
- 策略层面：主动争取/耐心等待/借力他人/以退为进（选其一，说明为什么）
- 时机层面：什么时候行动最好？本周/本月/本季度？
- 方位层面：往哪个方向有利？（根据五行给出，比如利南方/西方）
- 人际层面：找什么样的人帮忙？什么样的人要远离？

**❌ 忌做（2-3条，具体风险提示）**
- 时机风险：什么时候容易出问题？
- 人际风险：要提防什么类型的人或事？
- 决策风险：做什么决定可能会后悔？

**⏰ 时间参考**
- 快的话：大概什么时候有消息/结果？
- 慢的话：最长要等到什么时候？
- 关键时间点：有没有什么特别要注意的日期/时段？

---

## 四、一句锦囊（20字内）
用一句好记的话收尾，可以是：
- 化用卦理（如：水满则溢，月盈则亏，留三分余地）
- 现代格言（如：顺势而为，比逆流而上更聪明）
- 行动口诀（如：先观察，再出手，稳中求胜）

---

## ⚠️ 写作规范（请务必遵守）

### 语言风格
1. **禁用**这些词："必然""一定""注定""绝对""肯定"
2. **改用**这些词："十有八九""恐有""宜防""大势所趋""可能""或许"
3. **少用术语**：提到"体用""生克""当令"时，后面跟一句白话解释
4. **多打比方**：用天气、水流、树木、战场等自然场景比喻

### 场景化示例
| 术语 | 错误示范 | 正确示范 |
|------|---------|---------|
| 体克用 | "体克用，金克木，费力可成" | "你现在占上风，但就像爬山，能登顶却累得够呛" |
| 用生体 | "用生体，大吉，外部助我" | "眼下有贵人运，像顺风划船，事半功倍" |
| 动爻 | "上六动，阴变阳，变卦睽" | "事情到最后会有个转折，结果可能和最初想的不太一样" |
| 应期 | "应期在午火当令之时" | "快的话3-7天，慢的话到夏天/中午前后有消息" |

### 格式要求
- 用 emoji 标注重点（✅❌⚠️⏰💡）
- 用 "---" 分隔不同部分
- 每段不要太长，3-4行为宜
- 关键句加粗
- 标题中不要出现（xx字）这类字样

---

请开始解卦，记住：**用户不是来学易经的，是来求建议的。** 越接地气越好！`;
}

/**
 * 调用 OpenAI 进行解卦
 * @param {Object} divinationData 解卦数据
 * @returns {Promise<string>} AI 解卦结果
 */
async function getAIDivination(divinationData) {
  // 检查 API Key
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
    throw new Error('OpenAI API Key 未配置，请在 .env 文件中设置 OPENAI_API_KEY');
  }

  try {
    const prompt = buildPrompt(divinationData);
    
    console.log(`[${new Date().toISOString()}] 调用 OpenAI 解卦，模型: ${MODEL}`);
    console.log(`[${new Date().toISOString()}] ====== AI 解卦输入 Prompt ======`);
    console.log(prompt);
    console.log(`[${new Date().toISOString()}] ====== Prompt 结束 (长度: ${prompt.length} 字符) ======`);
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一位精通《梅花易数》和《易经》的易学大师，擅长将古老的易学智慧与现代生活相结合，为用户提供既有传统深度又有现实指导意义的解卦服务。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const result = response.choices[0]?.message?.content;
    
    if (!result) {
      throw new Error('OpenAI 返回结果为空');
    }

    console.log(`[${new Date().toISOString()}] OpenAI 解卦成功，消耗 tokens: ${response.usage?.total_tokens || 'unknown'}`);
    
    return result;
  } catch (error) {
    console.error('OpenAI 解卦失败:', error);
    
    // 返回友好的错误信息
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API 额度不足，请联系管理员');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('OpenAI API Key 无效，请检查配置');
    } else if (error.code === 'rate_limit_exceeded') {
      throw new Error('请求过于频繁，请稍后再试');
    } else if (error.message?.includes('timeout')) {
      throw new Error('请求超时，请稍后重试');
    }
    
    throw new Error(`解卦服务暂时不可用: ${error.message}`);
  }
}

/**
 * 构建对话 prompt
 * @param {Object} data 对话数据
 * @returns {string} prompt 文本
 */
function buildChatPrompt(data) {
  const { message, history, divinationData } = data;
  
  // 只取最近3轮对话作为上下文，避免太长
  const recentHistory = history.slice(-6);
  
  // 构建对话历史文本（简化版，只保留关键信息）
  const historyText = recentHistory.map(msg => {
    // 截取过长的消息
    const content = msg.content.length > 300 
      ? msg.content.substring(0, 300) + '...'
      : msg.content;
    if (msg.role === 'assistant') {
      return `AI：${content}`;
    }
    return `用户：${content}`;
  }).join('\n\n');

  // 判断是否是第一轮对话
  const isFirstChat = !history || history.length === 0;

  return `你是一位精通《梅花易数》的易学顾问。用户正在就之前的解卦内容进行追问。

## 背景卦象（仅供参考，无需重复解释）
- 本卦：${divinationData.gua?.chineseName}（${divinationData.wuxingDetail?.judgment}）
- 体用：${divinationData.tiGuaName} vs ${divinationData.yongGuaName}
- 动爻：第 ${divinationData.dongYao?.position} 爻

## 对话记录
${historyText || '（首轮对话）'}

## 用户追问
「${message}」

---

## ⚠️ 重要回答规则

### 禁止做的事（会导致重复）
1. **禁止重复介绍卦象** —— 不要再说"本卦是XX，体卦XX，用卦XX"
2. **禁止重复时间框架** —— 不要再次列举"3-5天、月中、月底"等时间节点
3. **禁止重复吉凶判断** —— 不要再说一遍"大凶/大吉"的整体判断
4. **禁止复制粘贴之前的回答**

### 必须做的事
1. **直接回答新问题** —— 用户问什么，直接答什么，不要铺垫
2. **简洁补充信息** —— 只提供与问题相关的新信息或细节
3. **引用之前的结论** —— 如果需要提及之前的分析，用"之前说过..."一带而过
4. **控制字数** —— 回答控制在 100-150 字，最多不超过 200 字

### 示例对比

❌ 错误示范（重复）：
用户问："能大赚还是小赚？"
AI答："基于归妹卦的象意...用卦兑克体卦震...就像泽水压制雷鸣...短期内（3-5天）...月中前后...月底..."
→ 这是重复之前的完整分析！

✅ 正确示范（直接回答）：
用户问："能大赚还是小赚？"
AI答："小赚。卦象显示用克体，外部压制明显，难有暴利。动爻在二爻，提示'耐心观察'——这暗示只能赚个零花钱（5-10%左右），别贪心。"
→ 直接回答，没有重复卦象解释和时间节点！

---

请直接回答用户的追问，不要重复之前的分析内容。`;
}

/**
 * 调用 OpenAI 进行对话
 * @param {Object} data 对话数据
 * @returns {Promise<string>} AI 回复
 */
async function chatWithAI(data) {
  // 检查 API Key
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
    throw new Error('OpenAI API Key 未配置，请在 .env 文件中设置 OPENAI_API_KEY');
  }

  try {
    const prompt = buildChatPrompt(data);
    
    console.log(`[${new Date().toISOString()}] 调用 OpenAI 对话，模型: ${MODEL}`);
    console.log(`[${new Date().toISOString()}] ====== AI 对话输入 Prompt ======`);
    console.log(prompt);
    console.log(`[${new Date().toISOString()}] ====== Prompt 结束 (长度: ${prompt.length} 字符) ======`);
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一位精通《梅花易数》和《易经》的易学大师，擅长将古老的易学智慧与现代生活相结合，为用户提供既有传统深度又有现实指导意义的解卦服务。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,  // 对话回答更简洁，不需要太多 token
    });

    const result = response.choices[0]?.message?.content;
    
    if (!result) {
      throw new Error('OpenAI 返回结果为空');
    }

    console.log(`[${new Date().toISOString()}] OpenAI 对话成功，消耗 tokens: ${response.usage?.total_tokens || 'unknown'}`);
    
    return result;
  } catch (error) {
    console.error('OpenAI 对话失败:', error);
    
    // 返回友好的错误信息
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API 额度不足，请联系管理员');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('OpenAI API Key 无效，请检查配置');
    } else if (error.code === 'rate_limit_exceeded') {
      throw new Error('请求过于频繁，请稍后再试');
    } else if (error.message?.includes('timeout')) {
      throw new Error('请求超时，请稍后重试');
    }
    
    throw new Error(`对话服务暂时不可用: ${error.message}`);
  }
}

module.exports = {
  getAIDivination,
  buildPrompt,
  chatWithAI,
  buildChatPrompt,
};
