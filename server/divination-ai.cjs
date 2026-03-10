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
    gua,                    // 本卦信息
    dongYao,               // 动爻信息
    tiGuaName,             // 体卦
    yongGuaName,           // 用卦
    wuxingDetail,          // 五行关系
    huGua,                 // 互卦
    bianGua,               // 变卦
    yingQi,                // 应期
    selectedScene          // 问事场景
  } = data;

  return `你是一位精通《梅花易数》和《易经》的易学大师。请根据以下起卦数据，为用户提供专业、详细且易于理解的解卦说明。

## 起卦信息

### 本卦（事情现状）
- 卦名：第 ${gua?.id || '?'} 卦 ${gua?.chineseName || '?'}（${gua?.name || '?'}）
- 卦辞：${gua?.guaci || '无'}
- 彖传：${gua?.tuanZhuan || '无'}
- 大象传：${gua?.daXiangZhuan || '无'}
- 卦意：${gua?.meaning || '无'}

### 体用关系
- 体卦（代表自身）：${tiGuaName || '?'}
- 用卦（代表所测之事）：${yongGuaName || '?'}
- 五行关系：${wuxingDetail?.relation || '?'}
- 吉凶判断：${wuxingDetail?.judgment || '?'}
- 详细说明：${wuxingDetail?.description || '?'}

### 动爻信息
- 动爻位置：第 ${dongYao?.position || '?'} 爻（${dongYao?.name || '?'}}）
- 阴阳：${dongYao?.yinYang === 'yang' ? '阳爻' : '阴爻'}
- 爻辞：${dongYao?.text || '无'}
- 小象传：${dongYao?.xiangZhuan || '无'}

### 互卦（发展过程）
- 互卦：${huGua?.shangGuaName || '?'}${huGua?.xiaGuaName || '?'}（第 ${huGua?.guaId || '?'} 卦）
- 说明：代表事物发展的中间过程

### 变卦（最终结果）
- 变卦：${bianGua?.shangGuaName || '?'}${bianGua?.xiaGuaName || '?'}（第 ${bianGua?.guaId || '?'} 卦）
- 说明：代表事物发展的最终结果

### 应期推断
- 总体判断：${yingQi?.description || '?'}
- 时间参考：${yingQi?.timeFrames?.join('；') || '?'}

### 问事场景
${selectedScene ? `用户询问的是「${selectedScene.name}」，具体为：${selectedScene.description}` : '未指定具体问事场景'}

## 解卦要求

请按照以下结构提供解卦说明：

1. **总体断语**（100字左右）
   - 综合本卦、体用关系、动爻，给出整体吉凶判断

2. **详细分析**（300-400字）
   - **本卦解析**：结合卦辞、彖传、大象传解释当前状况
   - **体用关系**：详细说明五行生克对事情的影响
   - **动爻解读**：分析动爻位置、爻辞含义及变化趋势
   - **互卦与变卦**：说明事情发展过程和最终结果

3. **具体建议**（200-300字）
   - 根据问事场景给出针对性的行动建议
   - 注意事项和需要防范的风险
   - 最佳时机和方位提示

4. **总结**（50字左右）
   - 用一句话概括核心结论

## 解卦风格

- 语气要专业但不失亲切，像一位有经验的老师在指导学生
- 避免过于玄虚的表述，要有实际指导意义
- 结合《易经》原文但不拘泥于字面，注重义理阐发
- 如果问事场景明确，建议要具体、可操作
- 吉凶判断要客观，既不过分乐观也不过分悲观

请开始解卦：`;
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

module.exports = {
  getAIDivination,
  buildPrompt,
};
