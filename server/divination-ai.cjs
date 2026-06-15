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

function getSceneFollowUpGuidance(selectedScene, questionContent) {
  const fallback = {
    sceneName: '通用问事',
    target: '当前所问之事',
    keywords: ['当前事情', '进展', '结果', '建议'],
    focus: '后续追问默认围绕当前所问之事本身作答，而不是泛泛谈整体运势。',
    dimensions: '走势、阻力、时机、建议',
    answerChecklist: '先回答这件事本身偏吉还是偏凶，再补充走势、建议和注意点。',
    avoid: '不要把回答扩展到不相关的其他人生领域。',
    genericQuestionRule: '如果用户只问“好不好”“是好还是坏”“能不能成”之类模糊问题，默认回答“当前所问之事”的好坏。',
    switchRule: '只有当用户明确提出新的领域时，才允许切换解释对象。',
    opener: '对这件事来说'
  };

  if (!selectedScene?.id) {
    return fallback;
  }

  const sceneRules = {
    career: {
      sceneName: '事业前程',
      target: '工作、项目、升迁或职业发展',
      keywords: ['工作', '项目', '职场', '机会'],
      focus: '所有追问都默认解释为工作发展、升迁机会、跳槽选择、合作推进和职场阻力。',
      dimensions: '机会大小、阻力来源、推进时机、行动建议',
      answerChecklist: '先判断事业层面的利弊，再回答机会大小、行动时机、是否主动推进。',
      avoid: '不要把回答滑向感情、健康或财运寓意，除非用户明确追问那些方面。',
      genericQuestionRule: '如果用户只问“好不好”“能不能成”，默认回答工作结果、项目推进或职业发展层面的好坏。',
      switchRule: '只有当用户明确改问感情、健康、财运等新领域时，才允许切换。',
      opener: '对事业来说'
    },
    relationship: {
      sceneName: '感情姻缘',
      target: '这段感情、这段关系或双方互动',
      keywords: ['感情', '关系', '相处', '对方'],
      focus: '所有追问都默认解释为感情关系本身的吉凶、靠近或疏远、是否继续推进、是否值得等待、沟通状态和双方态度。',
      dimensions: '关系走势、双方态度、推进节奏、相处建议',
      answerChecklist: '先判断这段感情整体偏好还是偏坏，再回答关系是在升温还是受阻，最后给出主动、等待、放缓或止损建议。',
      avoid: '禁止把回答引到事业、职场、人际泛论或财运上；禁止使用“职场关系”“合作关系”这类偏题类比，除非用户明确要求跨场景解释。',
      genericQuestionRule: '如果用户只问“好不好”“是好还是坏”“能不能成”之类模糊问题，默认回答“这段感情/这段关系”的好坏，不要回答成整体运势。',
      switchRule: '只有当用户明确改问事业、财运、健康等新领域时，才允许切换。',
      opener: '对感情来说'
    },
    health: {
      sceneName: '健康疾病',
      target: '身体状态、恢复进展或调养效果',
      keywords: ['身体', '恢复', '调养', '状态'],
      focus: '所有追问都默认解释为身体状态、恢复节奏、调养方向和风险轻重。',
      dimensions: '恢复趋势、风险轻重、调养重点、需要避免的行为',
      answerChecklist: '先判断健康趋势，再回答恢复快慢、重点调养点和应避免的行为。',
      avoid: '不要转去感情或事业类比，也不要做超出常识边界的医疗断言。',
      genericQuestionRule: '如果用户只问“好不好”，默认回答恢复趋势和风险程度。',
      switchRule: '只有当用户明确改问其他领域时，才允许切换。',
      opener: '对健康来说'
    },
    wealth: {
      sceneName: '财运投资',
      target: '求财结果、投资收益或资金安排',
      keywords: ['财运', '收益', '投资', '资金'],
      focus: '所有追问都默认解释为收益空间、风险大小、资金回笼、投资节奏和求财难度。',
      dimensions: '收益空间、风险大小、进退时机、风控建议',
      answerChecklist: '先判断财运是偏进还是偏守，再回答能否进场、收益级别和风控建议。',
      avoid: '不要把回答偏到感情或职场寓意上。',
      genericQuestionRule: '如果用户只问“好不好”，默认回答求财或投资层面的好坏。',
      switchRule: '只有当用户明确改问其他领域时，才允许切换。',
      opener: '对财运来说'
    },
    study: {
      sceneName: '学业考试',
      target: '学习状态、考试发挥或升学结果',
      keywords: ['学习', '考试', '复习', '发挥'],
      focus: '所有追问都默认解释为学习状态、考试发挥、准备节奏和竞争结果。',
      dimensions: '发挥趋势、补强重点、冲刺节奏、竞争结果',
      answerChecklist: '先判断学业走势，再回答能否稳住、哪些环节要补、该主动冲刺还是稳扎稳打。',
      avoid: '不要滑向事业或感情领域。',
      genericQuestionRule: '如果用户只问“好不好”，默认回答学业或考试结果层面的好坏。',
      switchRule: '只有当用户明确改问其他领域时，才允许切换。',
      opener: '对学业来说'
    },
    travel: {
      sceneName: '出行迁移',
      target: '出行计划、迁移安排或途中变化',
      keywords: ['出行', '出差', '行程', '途中'],
      focus: '所有追问都默认解释为出行顺利度、迁移变化、途中风险和是否适合动身。',
      dimensions: '顺利程度、时机选择、途中风险、方位建议',
      answerChecklist: '先判断出行是否顺，再回答时机、方向和风险点。',
      avoid: '不要转成事业或感情吉凶。',
      genericQuestionRule: '如果用户只问“好不好”，默认回答出行或迁移层面的好坏。',
      switchRule: '只有当用户明确改问其他领域时，才允许切换。',
      opener: '对出行来说'
    },
    legal: {
      sceneName: '官司诉讼',
      target: '诉讼、纠纷或调解结果',
      keywords: ['诉讼', '纠纷', '调解', '证据'],
      focus: '所有追问都默认解释为纠纷走向、胜算大小、调解可能和证据重要性。',
      dimensions: '胜算高低、局势走向、调解可能、应对重点',
      answerChecklist: '先判断诉讼或纠纷形势，再回答该强硬还是和解、需要注意什么。',
      avoid: '不要扯到财运或感情类比。',
      genericQuestionRule: '如果用户只问“好不好”，默认回答官司或纠纷层面的好坏。',
      switchRule: '只有当用户明确改问其他领域时，才允许切换。',
      opener: '对官司这件事来说'
    },
    lost: {
      sceneName: '寻物失物',
      target: '失物找回结果、寻找方向或时间线索',
      keywords: ['失物', '寻找', '找回', '线索'],
      focus: '所有追问都默认解释为失物是否能找回、寻找方向、时间线和阻碍。',
      dimensions: '找回概率、寻找方向、时间线索、阻碍因素',
      answerChecklist: '先判断找回概率，再回答方向、位置线索和时间。',
      avoid: '不要转去感情或事业。',
      genericQuestionRule: '如果用户只问“好不好”，默认回答失物找回层面的好坏。',
      switchRule: '只有当用户明确改问其他领域时，才允许切换。',
      opener: '对寻物这件事来说'
    }
  };

  const sceneRule = sceneRules[selectedScene.id] || fallback;
  const originalQuestion = questionContent ? `用户原始问题是「${questionContent}」` : '用户未补充更具体的问题';

  return {
    ...sceneRule,
    originalQuestion,
  };
}

function classifyFollowUpIntent(message) {
  const normalized = (message || '').replace(/\s+/g, '');

  if (!normalized) {
    return {
      type: 'judgment',
      label: '判断类',
      goal: '回答当前场景对象整体偏好、偏坏还是中性。',
      answerPattern: '第一句直接下判断；第二句解释原因；第三句补一句建议。',
      examples: '如“好不好”“是好还是坏”“顺不顺”'
    };
  }

  if (/(什么时候|何时|几时|多久|多快|哪天|几天|几个月|啥时候|何时有消息|什么时候行动|什么时候出发|时间|时机)/.test(normalized)) {
    return {
      type: 'timing',
      label: '时间类',
      goal: '回答当前场景对象何时行动更合适、何时见结果、何时容易有消息。',
      answerPattern: '第一句给时间判断；第二句说明早晚快慢；第三句给行动时点建议。',
      examples: '如“什么时候”“多久有结果”“什么时候行动更好”'
    };
  }

  if (/(注意什么|需要注意|特别注意|该注意|小心什么|提防|避免|怎么办|怎么做|如何做|要怎么|怎么准备|如何准备|怎么应对|建议|注意事项|要不要|该不该)/.test(normalized)) {
    return {
      type: 'advice',
      label: '建议类',
      goal: '回答当前场景对象最该注意什么、该做什么、该避免什么。',
      answerPattern: '第一句点出最重要的注意点；第二句说明风险或关键点；第三句给具体做法。',
      examples: '如“要注意什么”“该怎么办”“要不要继续”'
    };
  }

  if (/(结果|结局|最终|后来|之后|会怎样|能成吗|成不成|能不能成|会不会成功|能否成功|能否成行|最后会怎样|有没有结果|会不会好起来)/.test(normalized)) {
    return {
      type: 'outcome',
      label: '结果类',
      goal: '回答当前场景对象最终走向、能否达成、会是什么结果。',
      answerPattern: '第一句说最终倾向；第二句解释中间变化；第三句给应对建议。',
      examples: '如“最后会怎样”“能不能成”“结果如何”'
    };
  }

  if (/(好不好|坏不坏|顺不顺|行不行|有戏吗|有没有戏|吉还是凶|是好还是坏|靠谱吗)/.test(normalized)) {
    return {
      type: 'judgment',
      label: '判断类',
      goal: '回答当前场景对象整体偏好、偏坏还是中性。',
      answerPattern: '第一句直接下判断；第二句解释原因；第三句补一句建议。',
      examples: '如“好不好”“是好还是坏”“顺不顺”'
    };
  }

  return {
    type: 'advice',
    label: '建议类',
    goal: '优先回答当前场景中最有行动价值的建议和注意点。',
    answerPattern: '第一句先回应用户最关心的问题；第二句补充关键原因；第三句给建议。',
    examples: '默认用于没有明显类型、但需要具体回应的追问'
  };
}

function buildUserFollowUpTrack(history) {
  const recentUserMessages = (history || [])
    .filter((message) => message.role === 'user' && message.content)
    .slice(-3);

  if (recentUserMessages.length === 0) {
    return '（暂无更早的追问记录）';
  }

  return recentUserMessages
    .map((message, index) => `${index + 1}. ${message.content}`)
    .join('\n');
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

## 🎯 输出要求（铁口直断模式）

### 核心原则
1. **先给结论，再讲依据** —— 用户不是来学易经的，是来求判断和建议的
2. **证据链完整** —— 每个判断必须包含：经典依据、现实落点、置信度
3. **结合具体问题** —— ${questionContent ? '用户问的是「' + questionContent + '」，务必针对性回答' : '给出通用但可执行的建议'}
4. **用 emoji 标注重点**（✅❌⚠️⏰💡🔴🟡🟢）

### 输出结构

## 一、铁口直断（一句话结论，30字内）
先下判断，再解释。开头直接说结果。
- 🟢 吉利："体用比和，此事十有八九能成"
- 🟡 一般："体生用泄气，有戏但得费点劲"
- 🔴 不利："用克体虚惊，眼下宜守不宜攻"

## 二、卦象依据（证据链）
每条判断必须同时包含：
1. **命局依据**：体卦${tiGuaName}（${tiWuxing}）vs 用卦${yongGuaName}（${yongWuxing}）的生克关系，结合月令旺衰
2. **经典引用**：引用《梅花易数》《易经》原文或核心思想佐证（如"体用比和，谋事可成，利有攸往"）
3. **互变佐证**：互卦${huGua?.shangGuaName || '?'}${huGua?.xiaGuaName || '?'}看过程（${huRelation}），变卦${bianGua?.shangGuaName || '?'}${bianGua?.xiaGuaName || '?'}看结果（${bianRelation}）
4. **动爻点睛**：第${dongYao?.position}爻${dongYao?.name || '?'}的爻辞含义

## 三、现实落点（200-250字）
将卦象分析转化为用户当前问题的具体解读：
- 现状：${gua?.chineseName}卦在用户这件事上的具体映射
- 核心矛盾：体${tiGuaName} vs 用${yongGuaName}的白话解释
- 走势判断：过程→结果的走向

## 四、具体建议（200-250字）
- ✅ 宜做：策略、时机、方位、人际
- ❌ 忌做：时机风险、人际风险、决策风险
- ⏰ 时间参考：快/慢/关键时间点（可用${dongYao?.position}日/${(baGuaInfo[tiGuaName]?.number || 0) + (baGuaInfo[yongGuaName]?.number || 0)}天/${tiSeason}季等参考）

## 五、置信度与校准
- **置信度**：A（高概率，体用生克+月令+互变三层同指）/ B（中高概率，两层一致）/ C（线索，仅一层支持）
- **校准点**：提出1-2个用户可验证的现实问题，如"你看近期${scene?.name || '这件事'}是否出现了XX迹象？"

## 六、一句锦囊（20字内）
凝练成一句可记住的话

---

### 语言规范
- **禁用**：必然、一定、注定、绝对、肯定
- **改用**：十有八九、大势所趋、可能、或许
- **术语后跟白话**：如"体克用（你能掌控，但费力）"
- **多打比方**：用爬山、划船、天气等比喻
- **安全边界**：健康只说体质倾向，建议医学检查；财富只分析行为倾向，不给投资指令；感情不做道德审判

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
          content: `你是一位融汇《梅花易数》《易经》与传统命理典籍的易学大师。解卦时遵循以下原则：

1. **铁口直断**：先给结论，再讲依据。用户不是来学易经的，是来求判断和建议的。
2. **证据链**：每个判断必须有经典依据（引用《梅花易数》《易经》原文或核心思想）、现实落点（转化为可观察的行为或事件）、置信度（A高概率/B中高概率/C线索）。
3. **名家方法**：可引用邵康节（梅花易数创始）、朱熹（易传阐释）等先贤的断法思路，不堆砌人名。
4. **先答问题，再展命局**：优先回答用户当前关心的问题，再补充卦象背景。
5. **建议少而准**：聚焦当前问题的核心，不为了追求全面而稀释重点。
6. **安全边界**：
   - 禁用"必然、一定、注定、绝对、肯定"，改用"十有八九、大势所趋、可能、或许"
   - 健康只说体质倾向，建议医学检查，不做医疗断言
   - 财富只分析行为倾向，不给具体投资指令
   - 感情不做道德审判，不把命理推演当事实指控
   - 不因用户问配偶、婚姻就自动劝离、劝合`
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
  const { message, history, divinationData, initialInterpretationSummary } = data;
  
  const chatTiWuxing = getGuaWuxing(divinationData.tiGuaName);
  const chatYongWuxing = getGuaWuxing(divinationData.yongGuaName);
  const sceneGuidance = getSceneFollowUpGuidance(divinationData.selectedScene, divinationData.questionContent);
  const followUpIntent = classifyFollowUpIntent(message);
  const userFollowUpTrack = buildUserFollowUpTrack(history);
  
  return `你是一位精通《梅花易数》的易学顾问。用户正在就之前的解卦内容进行追问。

## 背景卦象
- 本卦：${divinationData.gua?.chineseName}（第${divinationData.gua?.id}卦）
- 体卦：${divinationData.tiGuaName}（${chatTiWuxing}）- 代表求测者
- 用卦：${divinationData.yongGuaName}（${chatYongWuxing}）- 代表所测之事
- 体用关系：${divinationData.wuxingDetail?.judgment}
- 动爻：第${divinationData.dongYao?.position}爻

## 初始解卦摘要
${initialInterpretationSummary || '未提供初始解卦摘要，回答时以卦象数据为准。'}

## 当前问事场景
- 场景：${sceneGuidance.sceneName}
- 当前解读对象：${sceneGuidance.target}
- 场景重心：${sceneGuidance.focus}
- 重点维度：${sceneGuidance.dimensions}
- 回答检查项：${sceneGuidance.answerChecklist}
- 严禁偏题：${sceneGuidance.avoid}
- 模糊问题规则：${sceneGuidance.genericQuestionRule}
- 切换场景规则：${sceneGuidance.switchRule}
- 回答中请自然使用这些场景词中的1-2个：${sceneGuidance.keywords.join('、')}
- 原始问题：${sceneGuidance.originalQuestion}

## 本次追问分类
- 类型：${followUpIntent.label}
- 回答目标：${followUpIntent.goal}
- 作答方式：${followUpIntent.answerPattern}
- 典型问题：${followUpIntent.examples}

## 用户过往追问轨迹
${userFollowUpTrack}

## 用户追问
「${message}」

---

## ⚠️ 回答规则（铁口直断风格）
1. **优先参考初始解卦摘要**，保持与你之前的判断一致
2. **锁定当前场景**，除非用户明确提出新领域，否则所有追问都只能解释为”${sceneGuidance.target}”
3. 用户若只问”好不好””是好还是坏””能不能成””该怎么办”这类模糊问题，默认回答当前场景中的”${sceneGuidance.target}”
4. **本次必须按”${followUpIntent.label}”作答**，不要把建议类答成结果类，也不要把判断类答成泛泛分析
5. **禁止重复**完整卦象介绍、时间框架、吉凶判断，除非用户明确要求重新总结
6. **不要引用其他领域做类比**。例如出行不要类比职场，感情不要类比项目，健康不要类比财运
7. **直接回答**新问题，不要铺垫
8. **简洁补充**，只提供与问题相关的新信息
9. **控制字数**，100-150字，最多不超过200字
10. 如果用户提到”你刚才说的某个结论”，先对照初始解卦摘要再作答
11. 回答第一句请直接以”${sceneGuidance.opener}”开头，明确这是在回答当前场景
12. 回答中至少自然出现一次与当前场景直接相关的词，不要用空泛词代替
13. 回答结构固定为：一句判断 -> 一句解释 -> 一句建议，不要跳出当前场景
14. **安全边界**：
    - 禁用”必然、一定、注定、绝对、肯定”，改用”十有八九、可能、或许”
    - 健康只说体质倾向，建议医学检查
    - 财富只分析行为倾向，不给具体投资指令
    - 感情不做道德审判

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
          content: `你是一位融汇《梅花易数》《易经》与传统命理典籍的易学顾问。追问回答时遵循：
1. 铁口直断：先给判断，再解释
2. 证据链：每个判断需有卦象依据和现实落点
3. 安全边界：禁用"必然、一定、注定"，健康只说体质倾向，财富不给投资指令，感情不做道德审判
4. 严格围绕用户当前问事场景作答，不得擅自切换到其他场景`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.45,
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
