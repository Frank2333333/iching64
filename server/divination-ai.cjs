/**
 * OpenAI 解卦服务 - 优化版（去除冗余）
 * 主要优化点：
 * 1. 合并"起卦数据"和"解卦流程"中的重复信息
 * 2. 简化8步流程为推理框架，不再重复列出已提供的数据
 * 3. 删除重复的角色定义（保留system message中的即可）
 * 4. 简化输出结构要求，避免与解卦流程重复
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
 * 八卦基础信息表
 */
const baGuaInfo = {
  '乾': { wuxing: '金', nature: '天', direction: '西北', number: 1, symbol: '☰' },
  '兑': { wuxing: '金', nature: '泽', direction: '西', number: 2, symbol: '☱' },
  '离': { wuxing: '火', nature: '火', direction: '南', number: 3, symbol: '☲' },
  '震': { wuxing: '木', nature: '雷', direction: '东', number: 4, symbol: '☳' },
  '巽': { wuxing: '木', nature: '风', direction: '东南', number: 5, symbol: '☴' },
  '坎': { wuxing: '水', nature: '水', direction: '北', number: 6, symbol: '☵' },
  '艮': { wuxing: '土', nature: '山', direction: '东北', number: 7, symbol: '☶' },
  '坤': { wuxing: '土', nature: '地', direction: '西南', number: 8, symbol: '☷' }
};

/**
 * 获取卦的五行
 */
function getGuaWuxing(guaName) {
  return baGuaInfo[guaName]?.wuxing || '未知';
}

/**
 * 判断五行生克关系
 */
function getWuxingRelation(tiWuxing, yongWuxing) {
  if (tiWuxing === yongWuxing) return '比和（同类相助）';
  
  // 生体：用生体
  if (
    (yongWuxing === '金' && tiWuxing === '水') ||
    (yongWuxing === '水' && tiWuxing === '木') ||
    (yongWuxing === '木' && tiWuxing === '火') ||
    (yongWuxing === '火' && tiWuxing === '土') ||
    (yongWuxing === '土' && tiWuxing === '金')
  ) return '用生体（外部助我，吉）';
  
  // 克体：用克体
  if (
    (yongWuxing === '金' && tiWuxing === '木') ||
    (yongWuxing === '木' && tiWuxing === '土') ||
    (yongWuxing === '土' && tiWuxing === '水') ||
    (yongWuxing === '水' && tiWuxing === '火') ||
    (yongWuxing === '火' && tiWuxing === '金')
  ) return '用克体（外部制我，凶）';
  
  // 体生用：我生外
  if (
    (tiWuxing === '金' && yongWuxing === '水') ||
    (tiWuxing === '水' && yongWuxing === '木') ||
    (tiWuxing === '木' && yongWuxing === '火') ||
    (tiWuxing === '火' && yongWuxing === '土') ||
    (tiWuxing === '土' && yongWuxing === '金')
  ) return '体生用（我泄气于外，耗）';
  
  // 体克用：我克外
  return '体克用（我能掌控，费力可成）';
}

/**
 * 构建解卦 prompt - 优化版（去除冗余）
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
    selectedScene,
    questionContent,
    divinationTime
  } = data;

  const sceneMap = {
    'career': { name: '事业前程', tips: '升迁、职场、跳槽、创业' },
    'relationship': { name: '感情姻缘', tips: '恋爱、婚姻、桃花、相处' },
    'health': { name: '健康疾病', tips: '身体、康复、养生' },
    'wealth': { name: '财运投资', tips: '理财、投资、求财' },
    'study': { name: '学业考试', tips: '学习、考试、升学' },
    'travel': { name: '出行迁移', tips: '出行、搬家、迁居' },
    'legal': { name: '官司诉讼', tips: '诉讼、纠纷、调解' },
    'lost': { name: '寻物失物', tips: '失物、找回' }
  };

  const scene = selectedScene ? sceneMap[selectedScene.id] : null;
  
  const now = new Date();
  const currentMonth = divinationTime ? new Date(divinationTime).getMonth() + 1 : now.getMonth() + 1;
  const monthNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const currentMonthZhi = monthNames[currentMonth - 1];
  
  const tiWuxing = getGuaWuxing(tiGuaName);
  const yongWuxing = getGuaWuxing(yongGuaName);
  const huShangWuxing = huGua ? getGuaWuxing(huGua.shangGuaName) : '?';
  const huXiaWuxing = huGua ? getGuaWuxing(huGua.xiaGuaName) : '?';
  const bianShangWuxing = bianGua ? getGuaWuxing(bianGua.shangGuaName) : '?';
  const bianXiaWuxing = bianGua ? getGuaWuxing(bianGua.xiaGuaName) : '?';
  
  const huRelation = huGua ? getWuxingRelation(tiWuxing, huShangWuxing === tiWuxing ? huXiaWuxing : huShangWuxing) : '?';
  const bianRelation = bianGua ? getWuxingRelation(tiWuxing, bianShangWuxing === tiWuxing ? bianXiaWuxing : bianShangWuxing) : '?';
  
  const seasonMap = { '木': '春', '火': '夏', '金': '秋', '水': '冬', '土': '四季' };
  const tiSeason = seasonMap[tiWuxing] || '?';
  const yongSeason = seasonMap[yongWuxing] || '?';

  return `## 📊 起卦数据

### 本卦
- 第 ${gua?.id || '?'} 卦 ${gua?.chineseName || '?'}（${gua?.name || '?'}）
- 卦象：${gua?.shangGua || '?'}上${gua?.xiaGua || '?'}下（${baGuaInfo[gua?.shangGua]?.symbol || ''}${baGuaInfo[gua?.xiaGua]?.symbol || ''}）
- 卦意：${gua?.meaning || '无'} | 卦辞：${gua?.guaci || '无'}

### 体用关系
- 体卦（自己）：${tiGuaName}（${tiWuxing}，无动爻）
- 用卦（所问之事）：${yongGuaName}（${yongWuxing}，动爻在${dongYao?.position <= 3 ? '下卦' : '上卦'}）
- 关系：${wuxingDetail?.judgment || '?'} | ${wuxingDetail?.description || '?'}

### 动爻
- 第 ${dongYao?.position || '?'} 爻 ${dongYao?.name || '?'}（${dongYao?.yinYang === 'yang' ? '阳' : '阴'}爻）
- 爻辞：${dongYao?.text || '无'} | 小象：${dongYao?.xiangZhuan || '无'}

### 互卦与变卦
- 互卦（过程）：${huGua?.shangGuaName || '?'}${huGua?.xiaGuaName || '?'}（上${huShangWuxing}下${huXiaWuxing}）→ ${huRelation}
- 变卦（结果）：${bianGua?.shangGuaName || '?'}${bianGua?.xiaGuaName || '?'}（上${bianShangWuxing}下${bianXiaWuxing}）→ ${bianRelation}

### 时间信息
- 起卦时间：${currentMonth}月（${currentMonthZhi}月）
- 体卦当令：${tiSeason} | 用卦当令：${yongSeason}
- 应期参考：后天法${(baGuaInfo[tiGuaName]?.number || 0) + (baGuaInfo[yongGuaName]?.number || 0)}天，先天法${tiSeason}季，动爻${dongYao?.position}日

### 问事场景
${scene ? `场景：${scene.name}（${scene.tips}）` : '未指定场景，给出通用建议'}
${questionContent ? `具体问题：${questionContent}` : ''}

---

## 🧭 解卦思路（供参考，不必在输出中体现）

解卦遵循"体用为先，生克为主；互变参看，旺衰为辅"原则：
1. 体用已定（见上），无需重复推导
2. 五行关系已明，重点分析月令旺衰对吉凶的影响
3. 互卦看过程转折，变卦看最终结果
4. 结合动爻爻辞给出行动指南

---

## 🎯 输出要求

### 核心原则
1. **先给结论，再讲原理** —— 用户最关心"结果如何"和"该怎么办"
2. **少用术语，多打比方** —— 用现代生活场景解释
3. **结合具体问题** —— ${questionContent ? '用户问的是「' + questionContent + '」，务必针对性回答' : '给出通用但可执行的建议'}
4. **用 emoji 标注重点**（✅❌⚠️⏰💡）

### 输出结构

## 一、一句话结论（30字内）
- ✅ 吉利："时机不错，主动争取能成"
- ⚠️ 一般："有戏，但得费点劲"  
- ❌ 不利："眼下不宜，宜守不宜攻"

## 二、卦象白话解读（200-250字）
- 现状：${gua?.chineseName}卦代表什么？
- 核心矛盾：体${tiGuaName} vs 用${yongGuaName}的关系白话解释
- 变化点：第${dongYao?.position}爻动的含义
- 发展：互卦${huGua?.shangGuaName || '?'}${huGua?.xiaGuaName || '?'}（过程${huRelation}）→ 变卦${bianGua?.shangGuaName || '?'}${bianGua?.xiaGuaName || '?'}（结果${bianRelation}）

## 三、具体建议（200-250字）
- ✅ 宜做：策略、时机、方位、人际
- ❌ 忌做：时机风险、人际风险、决策风险
- ⏰ 时间参考：快/慢/关键时间点（可用${dongYao?.position}日/${(baGuaInfo[tiGuaName]?.number || 0) + (baGuaInfo[yongGuaName]?.number || 0)}天/${tiSeason}季等参考）

## 四、一句锦囊（20字内）

---

### 语言规范
- **禁用**：必然、一定、注定、绝对、肯定
- **改用**：十有八九、可能、或许、大势所趋
- **术语后跟白话**：如"体克用（你能掌控，但费力）"
- **多打比方**：用爬山、划船、天气等比喻

记住：**用户不是来学易经的，是来求建议的。** 越接地气越好！`;
}

// ... 保留其他函数（getAIDivination, buildChatPrompt, chatWithAI）不变

/**
 * 调用 OpenAI 进行解卦
 */
async function getAIDivination(divinationData) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
    throw new Error('OpenAI API Key 未配置');
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
 */
function buildChatPrompt(data) {
  const { message, history, divinationData } = data;
  
  const recentHistory = history.slice(-6);
  const historyText = recentHistory.map(msg => {
    const content = msg.content.length > 300 
      ? msg.content.substring(0, 300) + '...'
      : msg.content;
    return msg.role === 'assistant' ? `AI：${content}` : `用户：${content}`;
  }).join('\n\n');

  const chatTiWuxing = getGuaWuxing(divinationData.tiGuaName);
  const chatYongWuxing = getGuaWuxing(divinationData.yongGuaName);
  
  return `你是一位精通《梅花易数》的易学顾问。用户正在就之前的解卦内容进行追问。

## 背景卦象
- 本卦：${divinationData.gua?.chineseName}（第${divinationData.gua?.id}卦）
- 体卦：${divinationData.tiGuaName}（${chatTiWuxing}）- 代表求测者
- 用卦：${divinationData.yongGuaName}（${chatYongWuxing}）- 代表所测之事
- 体用关系：${divinationData.wuxingDetail?.judgment}
- 动爻：第${divinationData.dongYao?.position}爻

## 对话记录
${historyText || '（首轮对话）'}

## 用户追问
「${message}」

---

## ⚠️ 回答规则
1. **禁止重复**卦象介绍、时间框架、吉凶判断
2. **直接回答**新问题，不要铺垫
3. **简洁补充**，只提供与问题相关的新信息
4. **控制字数**，100-150字，最多不超过200字

请直接回答用户的追问。`;
}

/**
 * 调用 OpenAI 进行对话
 */
async function chatWithAI(data) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
    throw new Error('OpenAI API Key 未配置');
  }

  try {
    const prompt = buildChatPrompt(data);
    
    console.log(`[${new Date().toISOString()}] 调用 OpenAI 对话，模型: ${MODEL}`);
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一位精通《梅花易数》和《易经》的易学大师，擅长将古老的易学智慧与现代生活相结合。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const result = response.choices[0]?.message?.content;
    
    if (!result) {
      throw new Error('OpenAI 返回结果为空');
    }

    console.log(`[${new Date().toISOString()}] OpenAI 对话成功，消耗 tokens: ${response.usage?.total_tokens || 'unknown'}`);
    
    return result;
  } catch (error) {
    console.error('OpenAI 对话失败:', error);
    
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
