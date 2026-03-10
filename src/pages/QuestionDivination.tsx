import { useState } from 'react';
import { Link } from 'react-router-dom';
import { liuShiSiGua, type Gua, type Yao } from '../data/guaxiang';
import { 
  ArrowLeft, Sparkles, BookOpen, HelpCircle, Briefcase, Heart, 
  Activity, Coins, GraduationCap, Plane, Scale, Search, Dice5,
  Lightbulb, Compass, ChevronRight, RotateCcw
} from 'lucide-react';
import { useScrollPosition } from '../hooks/useScrollPosition';
import ThemeToggle from '../components/ThemeToggle';

// 问事场景类型
interface QuestionScene {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  bgColor: string;
}

// 场景化解卦建议
interface SceneInterpretation {
  general: string;
  advice: string[];
  caution: string[];
  timing?: string;
}

// 定义问事场景
const questionScenes: QuestionScene[] = [
  {
    id: 'career',
    name: '事业前程',
    icon: <Briefcase className="w-6 h-6" />,
    description: '问工作变动、升职、创业、职场关系',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30',
  },
  {
    id: 'relationship',
    name: '感情姻缘',
    icon: <Heart className="w-6 h-6" />,
    description: '问恋爱、婚姻、感情发展、桃花',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800/30',
  },
  {
    id: 'health',
    name: '健康疾病',
    icon: <Activity className="w-6 h-6" />,
    description: '问身体状况、疾病康复、养生',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30',
  },
  {
    id: 'wealth',
    name: '财运投资',
    icon: <Coins className="w-6 h-6" />,
    description: '问财运、投资、买卖、借贷',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30',
  },
  {
    id: 'study',
    name: '学业考试',
    icon: <GraduationCap className="w-6 h-6" />,
    description: '问考试、升学、学习、竞赛',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30',
  },
  {
    id: 'travel',
    name: '出行迁移',
    icon: <Plane className="w-6 h-6" />,
    description: '问出行、搬家、旅行、迁居',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800/30',
  },
  {
    id: 'legal',
    name: '官司诉讼',
    icon: <Scale className="w-6 h-6" />,
    description: '问诉讼、纠纷、是非、调解',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30',
  },
  {
    id: 'lost',
    name: '寻物失物',
    icon: <Search className="w-6 h-6" />,
    description: '问失物寻找、失而复得',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/30',
  },
];

// 八卦映射
// 伏羲先天八卦数（1-8）到卦名的映射（用于数字起卦时的余数映射）
const baGuaMap: Record<number, string> = {
  1: '乾', 2: '兑', 3: '离', 4: '震',
  5: '巽', 6: '坎', 7: '艮', 8: '坤',
};

const yaoPositionNames = ['初', '二', '三', '四', '五', '上'];

// 八卦万物类象（梅花易数取象用）
const baGuaXiang: Record<string, {
  wuxing: string;
  nature: string;
  people: string;
  body: string;
  direction: string;
  season: string;
  color: string;
  animal: string;
  object: string;
  character: string;
}> = {
  '乾': {
    wuxing: '金',
    nature: '天、冰、霰、雹',
    people: '父、君、官、老人、名人',
    body: '头、肺、骨、大肠',
    direction: '西北',
    season: '秋季，戌亥年月日时',
    color: '白色、金色、大赤色',
    animal: '马、象、狮、天鹅',
    object: '金玉、珠宝、圆物、刚物',
    character: '刚健、果决、重义'
  },
  '兑': {
    wuxing: '金',
    nature: '泽、池、沼、泉',
    people: '少女、妾、歌妓、伶人',
    body: '口、舌、齿、肺、痰涎',
    direction: '西',
    season: '秋季，酉年月日时',
    color: '白色、银色',
    animal: '羊、泽中之物',
    object: '刀剑、乐器、缺器、瓶罐',
    character: '喜悦、口舌、毁折'
  },
  '离': {
    wuxing: '火',
    nature: '日、火、光、电、虹',
    people: '中女、文人、甲胄之士',
    body: '目、心、上焦、小肠',
    direction: '南',
    season: '夏季，巳午年月日时',
    color: '红色、赤色、紫色',
    animal: '雉、龟、蚌、蟹',
    object: '文书、甲胄、干戈、火器',
    character: '文明、丽、附、急躁'
  },
  '震': {
    wuxing: '木',
    nature: '雷、动、茂树、竹林',
    people: '长男、善动之人',
    body: '足、肝、发、声音',
    direction: '东',
    season: '春季，卯年月日时',
    color: '青色、绿色',
    animal: '龙、蛇、百虫',
    object: '木器、乐器、车辆、舟船',
    character: '动、奋起、惊惧'
  },
  '巽': {
    wuxing: '木',
    nature: '风、气、长养、花果',
    people: '长女、寡妇、秀士',
    body: '股、肱、气、头发',
    direction: '东南',
    season: '春夏之交，辰巳年月日时',
    color: '青色、碧色',
    animal: '鸡、百禽、百虫',
    object: '绳索、直物、长物、细物',
    character: '入、顺、不果、优柔'
  },
  '坎': {
    wuxing: '水',
    nature: '水、雨、雪、霜、露',
    people: '中男、盗贼、舟人',
    body: '耳、肾、膀胱、血、髓',
    direction: '北',
    season: '冬季，子年月日时',
    color: '黑色、蓝色',
    animal: '猪、鱼、水中之物',
    object: '水具、酒器、曲物、弓轮',
    character: '险陷、隐伏、柔顺'
  },
  '艮': {
    wuxing: '土',
    nature: '山、土、石、径路',
    people: '少男、闲人、山中人',
    body: '手、指、鼻、背、脾',
    direction: '东北',
    season: '冬春之交，丑寅年月日时',
    color: '黄色、棕色',
    animal: '狗、鼠、虎、狐',
    object: '土石、门阙、果实、桌床',
    character: '止、静、固执、阻滞'
  },
  '坤': {
    wuxing: '土',
    nature: '地、云、阴、雾气',
    people: '母、后、农人、众人',
    body: '腹、脾、胃、肉、右肩',
    direction: '西南',
    season: '夏秋之交，未申年月日时',
    color: '黄色、黑色',
    animal: '牛、牝马、百兽',
    object: '布帛、米粟、瓦器、方物',
    character: '顺、柔、厚德、载物'
  }
};

// 获取场景化解卦建议
function getSceneInterpretation(sceneId: string, gua: Gua, dongYaoPosition: number, wuxingRelation: string): SceneInterpretation {
  const interpretations: Record<string, SceneInterpretation> = {
    career: {
      general: `占问事业，得「${gua.name}」卦，${gua.meaning}。${wuxingRelation.includes('得益') ? '外部环境对事业发展有利' : wuxingRelation.includes('耗损') ? '事业发展需要更多付出' : wuxingRelation.includes('得财') ? '事业发展主动权在您' : wuxingRelation.includes('有灾') ? '事业发展需防范风险' : '请结合体用关系判断'}。`,
      advice: [
        gua.wuxing === '金' ? '金性坚毅，宜坚守原则，稳中求进' : 
        gua.wuxing === '木' ? '木性生发，宜开拓创新，把握时机' :
        gua.wuxing === '水' ? '水性流动，宜灵活应变，顺势而为' :
        gua.wuxing === '火' ? '火性光明，宜积极进取，展现才华' :
        '土性厚重，宜踏实积累，厚积薄发',
        dongYaoPosition <= 2 ? '动爻在下，宜从基础做起，稳步发展' :
        dongYaoPosition >= 5 ? '动爻在上，宜把握高位，注意收尾' :
        '动爻在中，宜积极进取，谋求发展',
      ],
      caution: [
        '不可急功近利，急于求成',
        '注意人际关系，避免小人掣肘',
      ],
      timing: gua.wuxing === '木' ? '春季最利，寅卯月为宜' :
              gua.wuxing === '火' ? '夏季最利，巳午月为宜' :
              gua.wuxing === '土' ? '四季末最利，辰戌丑未月为宜' :
              gua.wuxing === '金' ? '秋季最利，申酉月为宜' :
              '冬季最利，亥子月为宜',
    },
    relationship: {
      general: `占问感情，得「${gua.name}」卦，${gua.meaning}。${wuxingRelation.includes('得益') ? '感情关系对您有利' : wuxingRelation.includes('耗损') ? '感情需要您付出较多' : wuxingRelation.includes('得财') ? '您在感情中占主导' : wuxingRelation.includes('有灾') ? '感情关系需谨慎对待' : '请结合体用关系判断'}。`,
      advice: [
        gua.wuxing === '金' ? '金性刚烈，宜以柔克刚，互相包容' :
        gua.wuxing === '木' ? '木性温和，宜慢慢培养，循序渐进' :
        gua.wuxing === '水' ? '水性柔情，宜沟通交流，心灵相通' :
        gua.wuxing === '火' ? '火性热烈，宜热情主动，但防过旺' :
        '土性稳重，宜踏实经营，长久发展',
        dongYaoPosition === 1 ? '初爻发动，感情初萌，宜慎重开始' :
        dongYaoPosition === 6 ? '上爻发动，感情将变，宜做好准备' :
        '中爻发动，感情发展，宜把握节奏',
      ],
      caution: [
        '避免情绪化，保持理性沟通',
        '不可强求，缘分天定',
      ],
      timing: '农历十五前后，月圆之时最利感情',
    },
    health: {
      general: `占问健康，得「${gua.name}」卦，${gua.meaning}。${wuxingRelation}，宜注意调养方式。`,
      advice: [
        gua.wuxing === '金' ? '金主肺与大肠，宜注意呼吸系统保养' :
        gua.wuxing === '木' ? '木主肝胆，宜调畅情志，少生气' :
        gua.wuxing === '水' ? '水主肾与膀胱，宜注意休息，勿过劳' :
        gua.wuxing === '火' ? '火主心与小肠，宜保持心情舒畅' :
        '土主脾胃，宜饮食规律，忌生冷',
        dongYaoPosition <= 3 ? '下卦动，宜注意身体下半部或内部调理' :
        '上卦动，宜注意身体上半部或外部防护',
      ],
      caution: [
        '及时就医，不可讳疾忌医',
        '调整作息，保持良好生活习惯',
      ],
      timing: '子午卯酉时，气血运行时最利调养',
    },
    wealth: {
      general: `占问财运，得「${gua.name}」卦，${gua.meaning}。${wuxingRelation.includes('得益') ? '财运较佳，多有进益' : wuxingRelation.includes('耗损') ? '需注意财务支出' : wuxingRelation.includes('得财') ? '求财多有收获' : wuxingRelation.includes('有灾') ? '求财需防损失' : '请结合体用关系判断'}。`,
      advice: [
        gua.wuxing === '金' ? '金主财，财运较旺，宜把握时机' :
        gua.wuxing === '水' ? '水主流动，财来财去，宜守成' :
        gua.wuxing === '木' ? '木主生发，宜投资成长型项目' :
        gua.wuxing === '火' ? '火主虚耗，宜谨慎理财，防破财' :
        '土主稳固，宜储蓄保值，稳中求财',
        dongYaoPosition === 1 ? '初爻发动，财运初起，小利可图' :
        dongYaoPosition === 6 ? '上爻发动，财运将尽，宜收手' :
        dongYaoPosition === 3 || dongYaoPosition === 4 ? '人位发动，宜与人合作求财' :
        '尊位发动，大利可图，把握时机',
      ],
      caution: [
        '不可贪心，见好就收',
        '防范风险，分散投资',
      ],
      timing: '财神方位：' + (gua.wuxing === '金' ? '西方' : 
              gua.wuxing === '木' ? '东方' :
              gua.wuxing === '水' ? '北方' :
              gua.wuxing === '火' ? '南方' : '中央'),
    },
    study: {
      general: `占问学业，得「${gua.name}」卦，${gua.meaning}。${wuxingRelation.includes('得益') ? '学习环境对您有利' : wuxingRelation.includes('耗损') ? '学习需要更多付出' : wuxingRelation.includes('得财') ? '学习中多有收获' : wuxingRelation.includes('有灾') ? '学习中需克服困难' : '请结合体用关系判断'}。`,
      advice: [
        gua.wuxing === '水' ? '水主智，利于思考学习，宜多用脑力' :
        gua.wuxing === '木' ? '木主仁，宜多读书，增长见识' :
        gua.wuxing === '火' ? '火主礼，宜注重理解，灵活运用' :
        gua.wuxing === '金' ? '金主义，宜逻辑分析，精准记忆' :
        '土主信，宜踏实积累，温故知新',
        dongYaoPosition <= 2 ? '基础需加强，宜回归课本' :
        dongYaoPosition >= 5 ? '已达较高水平，宜挑战难题' :
        '中等水平，宜查漏补缺',
      ],
      caution: [
        '不可临时抱佛脚，需平时积累',
        '保持专注，避免分心',
      ],
      timing: '考试前七日最利复习备考',
    },
    travel: {
      general: `占问出行，得「${gua.name}」卦，${gua.meaning}。${wuxingRelation.includes('得益') ? '出行多有助力' : wuxingRelation.includes('耗损') ? '出行需多做准备' : wuxingRelation.includes('得财') ? '出行多有收获' : wuxingRelation.includes('有灾') ? '出行需注意安全' : '请结合体用关系判断'}。`,
      advice: [
        gua.wuxing === '水' ? '水主流动的，利于远行，顺风顺水' :
        gua.wuxing === '木' ? '木性生发，利于向东出行' :
        gua.wuxing === '火' ? '火性向上，利于向南出行' :
        gua.wuxing === '金' ? '金性收敛，宜近行，注意交通安全' :
        '土性稳固，利于向中心地带出行',
        dongYaoPosition === 6 ? '上爻发动，出行有变，宜提前准备' :
        dongYaoPosition === 1 ? '初爻发动，出行顺利，吉' :
        '中爻发动，途中可能有小事耽搁',
      ],
      caution: [
        '检查行程，预留充足时间',
        '注意天气变化，做好防护',
      ],
      timing: gua.wuxing === '水' ? '雨天或冬季出行需谨慎' :
              gua.wuxing === '火' ? '晴天或夏季出行顺利' :
              '四季皆宜，择吉日即可',
    },
    legal: {
      general: `占问官司，得「${gua.name}」卦，${gua.meaning}。${wuxingRelation.includes('得益') ? '官司对您有利' : wuxingRelation.includes('耗损') ? '官司需多费周折' : wuxingRelation.includes('得财') ? '官司中您占主动' : wuxingRelation.includes('有灾') ? '官司对您不利' : '请结合体用关系判断'}。`,
      advice: [
        gua.wuxing === '金' ? '金主刑杀，官司较复杂，宜请专业人士' :
        gua.wuxing === '水' ? '水主智，宜以智取胜，寻求和解' :
        gua.wuxing === '土' ? '土主稳定，官司可能持久，需有耐心' :
        gua.wuxing === '木' ? '木主仁，宜和解为上，化干戈为玉帛' :
        '火主明，证据清晰，宜据理力争',
        dongYaoPosition === 6 ? '上爻发动，官司将结，结果将出' :
        dongYaoPosition === 1 ? '初爻发动，官司初起，宜早做准备' :
        '中爻发动，官司胶着，宜寻求调解',
      ],
      caution: [
        '保持冷静，不可冲动行事',
        '证据为王，保存好相关材料',
      ],
      timing: '官非之事，速战速决为上',
    },
    lost: {
      general: `占问失物，得「${gua.name}」卦，${gua.meaning}。${wuxingRelation.includes('得益') ? '寻物多有线索' : wuxingRelation.includes('耗损') ? '寻物需多费力气' : wuxingRelation.includes('得财') ? '失物有望找回' : wuxingRelation.includes('有灾') ? '寻物恐难找回' : '请结合体用关系判断'}。`,
      advice: [
        gua.wuxing === '金' ? '金在西方或金属附近，宜向西寻找' :
        gua.wuxing === '木' ? '木在东方或草木旁，宜向东寻找' :
        gua.wuxing === '水' ? '水在北方或近水处，宜向北寻找' :
        gua.wuxing === '火' ? '火在南方或明亮处，宜向南寻找' :
        '土在中央或高处，宜在中心位置寻找',
        dongYaoPosition <= 3 ? '失物在下方或室内，宜低头寻找' :
        '失物在上方或室外，宜抬头寻找',
      ],
      caution: [
        '回想最后一次见到物品的地方',
        '询问身边人，可能有人捡到',
      ],
      timing: dongYaoPosition % 2 === 1 ? '阳爻发动，失物有望找回' :
              '阴爻发动，失物可能难寻',
    },
  };

  return interpretations[sceneId] || {
    general: `占问此事，得「${gua.name}」卦，${gua.meaning}。${wuxingRelation}，宜顺势而为，把握时机。`,
    advice: ['宜顺势而为，把握时机', '保持谨慎，量力而行'],
    caution: ['不可急躁，静待时机', '注意细节，防微杜渐'],
  };
}

interface DivinationResult {
  shangGuaNum: number;
  xiaGuaNum: number;
  dongYaoNum: number;
  shangGuaName: string;
  xiaGuaName: string;
  gua: Gua | null;
  dongYao: {
    position: number;
    name: string;
    text: string;
    xiangZhuan?: string;
    yinYang: 'yin' | 'yang';
  } | null;
  // 体用关系
  tiGua: number; // 体卦（代表自己、主体）
  yongGua: number; // 用卦（代表所测之事、外部环境）
  tiGuaName: string; // 体卦名称
  yongGuaName: string; // 用卦名称
  wuxingRelation: string; // 五行生克关系（兼容旧代码）
  wuxingDetail: {
    relation: string;
    judgment: string;
    level: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
    description: string;
  };
  // 互卦
  huGua: {
    shangGuaNum: number;
    xiaGuaNum: number;
    shangGuaName: string;
    xiaGuaName: string;
    guaId: number;
  } | null;
  // 变卦
  bianGua: {
    shangGuaNum: number;
    xiaGuaNum: number;
    shangGuaName: string;
    xiaGuaName: string;
    guaId: number;
  } | null;
  // 应期推断
  yingQi: {
    description: string;
    timeFrames: string[];
  };
}

export default function QuestionDivination() {
  // 步骤管理: 'select' | 'divinate' | 'result' | 'detail'
  const [step, setStep] = useState<'select' | 'divinate' | 'result' | 'detail'>('select');
  const [selectedScene, setSelectedScene] = useState<QuestionScene | null>(null);
  
  // 起卦状态
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [num3, setNum3] = useState('');
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // 记住滚动位置
  useScrollPosition(`question-divination-${step}`);

  // 生成随机数
  const generateRandomNumbers = () => {
    setNum1(Math.floor(Math.random() * 900 + 100).toString());
    setNum2(Math.floor(Math.random() * 900 + 100).toString());
    setNum3(Math.floor(Math.random() * 900 + 100).toString());
  };

  // 选择场景
  const handleSelectScene = (scene: QuestionScene) => {
    setSelectedScene(scene);
    setStep('divinate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 返回选择场景
  const handleBackToScene = () => {
    setStep('select');
    setSelectedScene(null);
    setResult(null);
    setNum1('');
    setNum2('');
    setNum3('');
  };

  // 返回起卦页面
  const handleBackToDivinate = () => {
    setStep('divinate');
    setResult(null);
  };

  // 开始起卦计算
  const handleCalculate = () => {
    const n1 = parseInt(num1);
    const n2 = parseInt(num2);
    const n3 = parseInt(num3);

    // 验证输入是否为有效的三位数字
    if (isNaN(n1) || n1 < 100 || n1 > 999) {
      alert('请输入有效的三位数字（100-999）作为第一个数字');
      return;
    }
    if (isNaN(n2) || n2 < 100 || n2 > 999) {
      alert('请输入有效的三位数字（100-999）作为第二个数字');
      return;
    }
    if (isNaN(n3) || n3 < 100 || n3 > 999) {
      alert('请输入有效的三位数字（100-999）作为第三个数字');
      return;
    }

    setIsCalculating(true);

    setTimeout(() => {
      // 第一个数字除8取余得下卦
      const xiaRemainder = n1 % 8;
      const xiaGuaNum = xiaRemainder === 0 ? 8 : xiaRemainder;
      const xiaGuaName = baGuaMap[xiaGuaNum];

      // 第二个数字除8取余得上卦
      const shangRemainder = n2 % 8;
      const shangGuaNum = shangRemainder === 0 ? 8 : shangRemainder;
      const shangGuaName = baGuaMap[shangGuaNum];

      // 第三个数字除6取余得动爻
      const yaoRemainder = n3 % 6;
      const dongYaoNum = yaoRemainder === 0 ? 6 : yaoRemainder;

      // 查找对应的卦
      const gua = liuShiSiGua.find(
        g => g.shangGua === shangGuaName && g.xiaGua === xiaGuaName
      ) || null;

      // 获取动爻信息
      let dongYao = null;
      if (gua) {
        const yao = gua.yaos[dongYaoNum - 1];
        const yaoName = yao.yinYang === 'yang' ? '九' : '六';
        const positionName = yaoPositionNames[dongYaoNum - 1];
        const fullName = dongYaoNum === 1 || dongYaoNum === 6
          ? `${positionName}${yaoName}`
          : `${yaoName}${positionName}`;

        dongYao = {
          position: dongYaoNum,
          name: fullName,
          text: yao.text,
          xiangZhuan: yao.xiangZhuan,
          yinYang: yao.yinYang,
        };
      }

      // 体用关系：根据动爻位置确定
      // 梅花易数规则：有动爻的卦为用卦，无动爻的卦为体卦
      // 体卦代表自己、主体、根本；用卦代表所测之事、他人、外部环境
      let tiGua: number;
      let yongGua: number;
      let tiGuaName: string;
      let yongGuaName: string;
      
      if (dongYaoNum <= 3) {
        // 动爻在下卦（1-3爻），则下卦为用，上卦为体
        tiGua = shangGuaNum;
        yongGua = xiaGuaNum;
        tiGuaName = shangGuaName;
        yongGuaName = xiaGuaName;
      } else {
        // 动爻在上卦（4-6爻），则上卦为用，下卦为体
        tiGua = xiaGuaNum;
        yongGua = shangGuaNum;
        tiGuaName = xiaGuaName;
        yongGuaName = shangGuaName;
      }
      
      // 八卦的五行属性
      const baGuaWuXing: Record<string, string> = {
        '乾': '金', '兑': '金',
        '艮': '土', '坤': '土',
        '震': '木', '巽': '木',
        '坎': '水',
        '离': '火'
      };
      
      // 五行生克关系详细断语
      const getWuxingRelationDetail = (tiName: string, yongName: string) => {
        const tiWuxing = baGuaWuXing[tiName] || '';
        const yongWuxing = baGuaWuXing[yongName] || '';
        
        if (!tiWuxing || !yongWuxing) {
          return {
            relation: '关系不明',
            judgment: '无法判断',
            level: 'neutral' as const,
            description: '卦象五行属性不明，需重新起卦'
          };
        }
        
        // 比和：同类相助
        if (tiWuxing === yongWuxing) {
          return {
            relation: `${tiWuxing}金比和`,
            judgment: '体用比和，大吉',
            level: 'great' as const,
            description: '同类相助，合作顺畅，势均力敌。内外一致，事情顺利，多得助力。'
          };
        }
        
        // 体生用：我泄气于外
        if (
          (tiWuxing === '金' && yongWuxing === '水') ||
          (tiWuxing === '水' && yongWuxing === '木') ||
          (tiWuxing === '木' && yongWuxing === '火') ||
          (tiWuxing === '火' && yongWuxing === '土') ||
          (tiWuxing === '土' && yongWuxing === '金')
        ) {
          return {
            relation: `体生用（${tiWuxing}生${yongWuxing}）`,
            judgment: '体生用，小凶',
            level: 'bad' as const,
            description: '我泄气于外，损耗、付出多回报少。虽有成就，但费力耗神，需防精力透支。'
          };
        }
        
        // 用生体：外部助我
        if (
          (yongWuxing === '金' && tiWuxing === '水') ||
          (yongWuxing === '水' && tiWuxing === '木') ||
          (yongWuxing === '木' && tiWuxing === '火') ||
          (yongWuxing === '火' && tiWuxing === '土') ||
          (yongWuxing === '土' && tiWuxing === '金')
        ) {
          return {
            relation: `用生体（${yongWuxing}生${tiWuxing}）`,
            judgment: '用生体，大吉',
            level: 'great' as const,
            description: '外部助我，事半功倍，贵人扶持。所求易成，多得助力，顺势而行。'
          };
        }
        
        // 体克用：我能掌控
        if (
          (tiWuxing === '金' && yongWuxing === '木') ||
          (tiWuxing === '木' && yongWuxing === '土') ||
          (tiWuxing === '土' && yongWuxing === '水') ||
          (tiWuxing === '水' && yongWuxing === '火') ||
          (tiWuxing === '火' && yongWuxing === '金')
        ) {
          return {
            relation: `体克用（${tiWuxing}克${yongWuxing}）`,
            judgment: '体克用，吉',
            level: 'good' as const,
            description: '我能掌控，可得但需费力。事情可成，但需要主动争取，小吉之象。'
          };
        }
        
        // 用克体：外部制我
        if (
          (yongWuxing === '金' && tiWuxing === '木') ||
          (yongWuxing === '木' && tiWuxing === '土') ||
          (yongWuxing === '土' && tiWuxing === '水') ||
          (yongWuxing === '水' && tiWuxing === '火') ||
          (yongWuxing === '火' && tiWuxing === '金')
        ) {
          return {
            relation: `用克体（${yongWuxing}克${tiWuxing}）`,
            judgment: '用克体，大凶',
            level: 'terrible' as const,
            description: '外部制我，受阻、受损、受欺压。事情难成，宜退守，防小人，谨慎为上。'
          };
        }
        
        return {
          relation: '关系复杂',
          judgment: '需细辨',
          level: 'neutral' as const,
          description: '五行关系复杂，需结合卦辞、爻辞综合判断'
        };
      };
      
      const wuxingDetail = getWuxingRelationDetail(tiGuaName, yongGuaName);

      // 计算互卦：本卦2、3、4爻为下互卦，3、4、5爻为上互卦
      // 关键：从下往上画卦，二进制权重是下爻=4、中爻=2、上爻=1
      let huGua = null;
      if (gua) {
        // 二进制值（0-7）到卦名的映射
        // 计算方式：下爻×4 + 中爻×2 + 上爻×1（阳=1，阴=0）
        const calcToGua: Record<number, string> = {
          0: '坤', 1: '艮', 2: '坎', 3: '巽',
          4: '震', 5: '离', 6: '兑', 7: '乾'
        };
        
        // 获取六爻的阴阳情况（数组索引0-5对应初爻到上爻）
        const yy = gua.yaos.map(yao => yao.yinYang);
        // yy[0]=初爻, [1]=二爻, [2]=三爻, [3]=四爻, [4]=五爻, [5]=上爻
        
        // 下互卦：本卦第2、3、4爻（数组索引1,2,3）
        // 从下往上：二爻(下)=yy[1], 三爻(中)=yy[2], 四爻(上)=yy[3]
        const xiaHuVal = 
          (yy[1] === 'yang' ? 4 : 0) +  // 下爻权重4
          (yy[2] === 'yang' ? 2 : 0) +  // 中爻权重2
          (yy[3] === 'yang' ? 1 : 0);   // 上爻权重1
        
        // 上互卦：本卦第3、4、5爻（数组索引2,3,4）
        // 从下往上：三爻(下)=yy[2], 四爻(中)=yy[3], 五爻(上)=yy[4]
        const shangHuVal = 
          (yy[2] === 'yang' ? 4 : 0) +  // 下爻权重4
          (yy[3] === 'yang' ? 2 : 0) +  // 中爻权重2
          (yy[4] === 'yang' ? 1 : 0);   // 上爻权重1
        
        const xiaHuGuaName = calcToGua[xiaHuVal];
        const shangHuGuaName = calcToGua[shangHuVal];
        
        // 查找对应的互卦
        const foundHuGua = liuShiSiGua.find(g => 
          g.shangGua === shangHuGuaName && g.xiaGua === xiaHuGuaName
        );
        
        if (foundHuGua) {
          huGua = {
            shangGuaNum: shangHuVal + 1, // 转换回1-8范围
            xiaGuaNum: xiaHuVal + 1,
            shangGuaName: shangHuGuaName,
            xiaGuaName: xiaHuGuaName,
            guaId: foundHuGua.id
          };
        }
      }

      // 计算变卦：动爻阴阳互换
      let bianGua = null;
      if (gua && dongYao) {
        // 创建新的六爻数组，将动爻的阴阳互换
        const newYaoArray = [...gua.yaos];
        const changedYaoIndex = dongYao.position - 1;
        const originalYao = gua.yaos[changedYaoIndex];
        
        // 创建新的爻对象，改变阴阳属性
        const newYao: Yao = {
          ...originalYao,
          yinYang: originalYao.yinYang === 'yang' ? 'yin' : 'yang'
        };
        
        newYaoArray[changedYaoIndex] = newYao;
        
        // 根据变化后的六爻计算上下卦
        // 二进制值到卦名的映射
        const calcToGua: Record<number, string> = {
          0: '坤', 1: '艮', 2: '坎', 3: '巽',
          4: '震', 5: '离', 6: '兑', 7: '乾'
        };
        
        // 计算下变卦（初、二、三爻）
        // 从下往上：初爻(下)=yy[0], 二爻(中)=yy[1], 三爻(上)=yy[2]
        const xiaBianVal = 
          (newYaoArray[0].yinYang === 'yang' ? 4 : 0) +  // 下爻权重4
          (newYaoArray[1].yinYang === 'yang' ? 2 : 0) +  // 中爻权重2
          (newYaoArray[2].yinYang === 'yang' ? 1 : 0);   // 上爻权重1
        
        // 计算上变卦（四、五、上爻）
        // 从下往上：四爻(下)=yy[3], 五爻(中)=yy[4], 上爻(上)=yy[5]
        const shangBianVal = 
          (newYaoArray[3].yinYang === 'yang' ? 4 : 0) +  // 下爻权重4
          (newYaoArray[4].yinYang === 'yang' ? 2 : 0) +  // 中爻权重2
          (newYaoArray[5].yinYang === 'yang' ? 1 : 0);   // 上爻权重1
        
        const xiaBianGuaName = calcToGua[xiaBianVal];
        const shangBianGuaName = calcToGua[shangBianVal];
        
        // 查找对应的变卦
        const foundBianGua = liuShiSiGua.find(g => 
          g.shangGua === shangBianGuaName && g.xiaGua === xiaBianGuaName
        );
        
        if (foundBianGua) {
          bianGua = {
            shangGuaNum: shangBianVal + 1,
            xiaGuaNum: xiaBianVal + 1,
            shangGuaName: shangBianGuaName,
            xiaGuaName: xiaBianGuaName,
            guaId: foundBianGua.id
          };
        }
      }

      // 应期推断：根据生克关系和卦数推断
      const calculateYingQi = (
        wuxingDetail: { level: 'great' | 'good' | 'neutral' | 'bad' | 'terrible' },
        dongYaoPos: number,
        tiNum: number,
        yongNum: number
      ) => {
        const timeFrames: string[] = [];
        let description = '';
        
        // 根据五行生克关系推断应期
        if (wuxingDetail.level === 'great') {
          // 用生体或比和 - 应期较快
          description = '应期较快，好事将近。';
          timeFrames.push(`${dongYaoPos}日或${dongYaoPos}月内`);
          timeFrames.push(`逢${baGuaMap[yongNum]}卦旺相之时`);
        } else if (wuxingDetail.level === 'good') {
          // 体克用 - 需要努力，应期中等
          description = '需要主动争取，应期中等。';
          timeFrames.push(`${tiNum + dongYaoPos}日或${dongYaoPos * 2}月内`);
          timeFrames.push(`逢${baGuaMap[tiNum]}卦当令之时`);
        } else if (wuxingDetail.level === 'bad') {
          // 体生用 - 耗损，应期较慢
          description = '付出较多，应期较慢。';
          timeFrames.push(`${dongYaoPos * 2}日或${dongYaoPos + 3}月内`);
          timeFrames.push(`待${baGuaMap[yongNum]}气消退之时`);
        } else if (wuxingDetail.level === 'terrible') {
          // 用克体 - 阻碍重重，应期难定或不利
          description = '阻碍较大，应期难定，宜守不宜攻。';
          timeFrames.push(`需待${baGuaMap[tiNum]}卦当令制${baGuaMap[yongNum]}之时`);
          timeFrames.push(`或${12 - dongYaoPos}月后转机`);
        } else {
          description = '应期需结合实际情况判断。';
          timeFrames.push(`${dongYaoPos}日、${dongYaoPos * 2}日或${dongYaoPos * 3}日`);
        }
        
        // 根据动爻位置补充信息
        if (dongYaoPos === 1) {
          timeFrames.push('事情刚开始，需要耐心等待');
        } else if (dongYaoPos === 6) {
          timeFrames.push('事情将到尽头，结果即将显现');
        }
        
        return { description, timeFrames };
      };
      
      const yingQi = calculateYingQi(wuxingDetail, dongYaoNum, tiGua, yongGua);

      setResult({
        shangGuaNum,
        xiaGuaNum,
        dongYaoNum,
        shangGuaName,
        xiaGuaName,
        gua,
        dongYao,
        tiGua,
        yongGua,
        tiGuaName,
        yongGuaName,
        wuxingRelation: wuxingDetail.judgment,
        wuxingDetail,
        huGua,
        bianGua,
        yingQi
      });
      setIsCalculating(false);
      setStep('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  };

  // 查看卦象详情
  const handleShowDetail = () => {
    setStep('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 重新开始
  const handleRestart = () => {
    setStep('select');
    setSelectedScene(null);
    setResult(null);
    setNum1('');
    setNum2('');
    setNum3('');
  };

  const getWuxingColor = (wuxing: string) => {
    const colors: Record<string, string> = {
      '金': '#FFD700',
      '木': '#228B22',
      '水': '#1E90FF',
      '火': '#FF4500',
      '土': '#8B4513',
    };
    return colors[wuxing] || '#666';
  };

  // 获取场景化解卦建议
  const sceneInterpretation = result?.gua && selectedScene && result.wuxingRelation
    ? getSceneInterpretation(selectedScene.id, result.gua, result.dongYaoNum, result.wuxingRelation)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 
                  dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
                  iching-pattern-bg iching-cloud-bg transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-900 via-red-900 to-amber-900 
                       dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 
                       text-amber-50 dark:text-yellow-100 shadow-lg transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-8 h-8 text-amber-300" />
              <h1 className="text-2xl font-bold tracking-wider">问事解卦</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 bg-amber-700 hover:bg-amber-600 
                         rounded-lg transition-all duration-300 hover:scale-105
                         dark:bg-amber-800 dark:hover:bg-amber-700"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">返回</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 步骤指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${
              step === 'select' 
                ? 'bg-amber-600 text-white dark:bg-yellow-600 dark:text-neutral-900' 
                : 'bg-amber-200 text-amber-700 dark:bg-yellow-900/30 dark:text-yellow-500'
            }`}>
              1
            </div>
            <span className={`text-sm ${step === 'select' ? 'text-amber-900 dark:text-yellow-100' : 'text-amber-600 dark:text-yellow-600'}`}>
              选场景
            </span>
            <ChevronRight className="w-4 h-4 text-amber-400 dark:text-yellow-700" />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${
              step === 'divinate' 
                ? 'bg-amber-600 text-white dark:bg-yellow-600 dark:text-neutral-900' 
                : step === 'result' || step === 'detail'
                ? 'bg-amber-200 text-amber-700 dark:bg-yellow-900/30 dark:text-yellow-500'
                : 'bg-amber-100 text-amber-400 dark:bg-neutral-800 dark:text-neutral-600'
            }`}>
              2
            </div>
            <span className={`text-sm ${step === 'divinate' ? 'text-amber-900 dark:text-yellow-100' : 'text-amber-600 dark:text-yellow-600'}`}>
              起卦
            </span>
            <ChevronRight className="w-4 h-4 text-amber-400 dark:text-yellow-700" />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${
              step === 'result' || step === 'detail'
                ? 'bg-amber-600 text-white dark:bg-yellow-600 dark:text-neutral-900' 
                : 'bg-amber-100 text-amber-400 dark:bg-neutral-800 dark:text-neutral-600'
            }`}>
              3
            </div>
            <span className={`text-sm ${step === 'result' || step === 'detail' ? 'text-amber-900 dark:text-yellow-100' : 'text-amber-600 dark:text-yellow-600'}`}>
              解卦
            </span>
          </div>
        </div>

        {/* 步骤 1: 选择问事场景 */}
        {step === 'select' && (
          <div className="animate-slideInUp">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-amber-900 dark:text-yellow-100 mb-2">
                您想询问什么事？
              </h2>
              <p className="text-amber-600 dark:text-yellow-400">
                请选择您的问事场景，以便获得更精准的解卦指引
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {questionScenes.map((scene, index) => (
                <button
                  key={scene.id}
                  onClick={() => handleSelectScene(scene)}
                  className={`flex items-start p-5 rounded-xl border-2 transition-all duration-300 text-left
                    ${scene.bgColor}
                    hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`p-3 rounded-lg bg-white/80 dark:bg-neutral-800/80 ${scene.color} mr-4`}>
                    {scene.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg mb-1 ${scene.color}`}>
                      {scene.name}
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-yellow-200/60">
                      {scene.description}
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 mt-1 ${scene.color} opacity-50`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 步骤 2: 数字起卦 */}
        {step === 'divinate' && selectedScene && (
          <div className="animate-slideInUp">
            {/* 已选场景卡片 */}
            <div className={`p-4 rounded-xl border-2 mb-6 ${selectedScene.bgColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-white/80 dark:bg-neutral-800/80 ${selectedScene.color} mr-3`}>
                    {selectedScene.icon}
                  </div>
                  <div>
                    <p className="text-sm text-amber-600 dark:text-yellow-500">当前问事</p>
                    <h3 className={`font-bold text-lg ${selectedScene.color}`}>{selectedScene.name}</h3>
                  </div>
                </div>
                <button
                  onClick={handleBackToScene}
                  className="text-sm text-amber-600 dark:text-yellow-500 hover:text-amber-800 
                           dark:hover:text-yellow-300 underline"
                >
                  更换场景
                </button>
              </div>
            </div>

            {/* 说明卡片 */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 mb-6 shadow-md 
                         border border-amber-200 dark:border-yellow-900/30
                         dark:hover:border-yellow-800/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-amber-600 dark:text-yellow-500" />
                <h2 className="text-xl font-bold text-amber-900 dark:text-yellow-100">数字起卦说明</h2>
              </div>
              <div className="space-y-2 text-amber-700 dark:text-yellow-200/70">
                <p>1. 心中默念您的问题，保持专注和诚心</p>
                <p>2. 输入三个三位数字（或点击 🎲 随机生成）</p>
                <p>3. 第一个数字 ÷ 8 取余数 → 下卦（1乾、2兑、3离、4震、5巽、6坎、7艮、8坤）</p>
                <p>4. 第二个数字 ÷ 8 取余数 → 上卦（同上）</p>
                <p>5. 第三个数字 ÷ 6 取余数 → 动爻（1初爻、2二爻、3三爻、4四爻、5五爻、6上爻）</p>
              </div>
            </div>

            {/* 输入表单 */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-md 
                         border border-amber-200 dark:border-yellow-900/30
                         animate-slideInUp dark:hover:border-yellow-800/50 transition-colors" 
                 style={{ animationDelay: '0.1s' }}>
              <div className="flex justify-end mb-4">
                <button
                  onClick={generateRandomNumbers}
                  className="flex items-center gap-2 px-4 py-2 text-amber-600 dark:text-yellow-500
                           hover:bg-amber-100 dark:hover:bg-yellow-500/10 rounded-lg transition-colors"
                >
                  <Dice5 className="w-5 h-5" />
                  <span>随机生成</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-amber-700 dark:text-yellow-400 mb-2">
                    第一个数字（下卦） <span className="text-xs text-amber-500 dark:text-yellow-600">(100-999)</span>
                  </label>
                  <input
                    type="number"
                    value={num1}
                    onChange={(e) => setNum1(e.target.value)}
                    placeholder="输入三位数字"
                    min="100"
                    max="999"
                    className="w-full px-4 py-3 border border-amber-300 dark:border-yellow-700/50 
                             rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 
                             dark:focus:ring-yellow-600
                             text-amber-900 dark:text-yellow-100
                             bg-white dark:bg-neutral-900
                             transition-colors placeholder:text-amber-400 dark:placeholder:text-yellow-700/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-700 dark:text-yellow-400 mb-2">
                    第二个数字（上卦） <span className="text-xs text-amber-500 dark:text-yellow-600">(100-999)</span>
                  </label>
                  <input
                    type="number"
                    value={num2}
                    onChange={(e) => setNum2(e.target.value)}
                    placeholder="输入三位数字"
                    min="100"
                    max="999"
                    className="w-full px-4 py-3 border border-amber-300 dark:border-yellow-700/50 
                             rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 
                             dark:focus:ring-yellow-600
                             text-amber-900 dark:text-yellow-100
                             bg-white dark:bg-neutral-900
                             transition-colors placeholder:text-amber-400 dark:placeholder:text-yellow-700/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-700 dark:text-yellow-400 mb-2">
                    第三个数字（动爻） <span className="text-xs text-amber-500 dark:text-yellow-600">(100-999)</span>
                  </label>
                  <input
                    type="number"
                    value={num3}
                    onChange={(e) => setNum3(e.target.value)}
                    placeholder="输入三位数字"
                    min="100"
                    max="999"
                    className="w-full px-4 py-3 border border-amber-300 dark:border-yellow-700/50 
                             rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 
                             dark:focus:ring-yellow-600
                             text-amber-900 dark:text-yellow-100
                             bg-white dark:bg-neutral-900
                             transition-colors placeholder:text-amber-400 dark:placeholder:text-yellow-700/50"
                  />
                </div>
              </div>
              <button
                onClick={handleCalculate}
                disabled={isCalculating}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-red-600 
                         hover:from-amber-700 hover:to-red-700
                         dark:from-yellow-600 dark:to-yellow-700 dark:hover:from-yellow-500 dark:hover:to-yellow-600
                         text-white dark:text-neutral-900 font-bold rounded-lg transition-all shadow-lg
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0
                         flex items-center justify-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    起卦中...
                  </>
                ) : (
                  <>
                    <Compass className="w-5 h-5" />
                    开始起卦
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 步骤 3: 解卦结果 */}
        {(step === 'result' || step === 'detail') && result && selectedScene && (
          <div className="space-y-6">
            {/* 返回按钮 */}
            <button
              onClick={step === 'result' ? handleBackToDivinate : () => setStep('result')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg
                       text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100
                       hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{step === 'detail' ? '返回解卦结果' : '重新起卦'}</span>
            </button>

            {/* 问事场景标签 */}
            <div className={`p-4 rounded-xl border-2 ${selectedScene.bgColor}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg bg-white/80 dark:bg-neutral-800/80 ${selectedScene.color} mr-3`}>
                  {selectedScene.icon}
                </div>
                <div>
                  <p className="text-sm text-amber-600 dark:text-yellow-500">问事场景</p>
                  <h3 className={`font-bold text-lg ${selectedScene.color}`}>{selectedScene.name}</h3>
                </div>
              </div>
            </div>

            {step === 'result' ? (
              /* 解卦结果页面 */
              <>
                {/* 卦象概览 */}
                {result.gua && (
                  <div className="bg-gradient-to-br from-amber-100 to-orange-100 
                               dark:from-neutral-800 dark:to-neutral-900
                               rounded-2xl p-6 shadow-lg border border-amber-200 dark:border-yellow-900/30">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      {/* 卦画 */}
                      <div className="bg-white dark:bg-amber-950/50 rounded-xl p-6 shadow-inner">
                        <div className="flex flex-col-reverse space-y-1 space-y-reverse">
                          {result.gua.yaos.map((yao, idx) => {
                            const isDongYao = result.dongYao?.position === yao.position;
                            return (
                              <div
                                key={yao.position}
                                className={`h-3 rounded-full transition-all duration-500
                                          ${yao.yinYang === 'yang'
                                            ? `w-20 ${isDongYao ? 'bg-red-500' : 'bg-amber-800 dark:bg-amber-400'}`
                                            : 'w-20 flex justify-between'
                                          }`}
                                style={{ 
                                  animation: `yaoDraw 0.5s ease-out forwards`,
                                  animationDelay: `${idx * 80}ms`
                                }}
                              >
                                {yao.yinYang === 'yin' && (
                                  <>
                                    <div className={`w-8 h-3 rounded-full ${isDongYao ? 'bg-red-500' : 'bg-amber-800 dark:bg-amber-400'}`} />
                                    <div className={`w-8 h-3 rounded-full ${isDongYao ? 'bg-red-500' : 'bg-amber-800 dark:bg-amber-400'}`} />
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {/* 动爻标记 */}
                        <div className="mt-4 text-center">
                          <span className="inline-block px-3 py-1 bg-red-500 text-white dark:bg-red-600
                                         text-sm font-bold rounded-full shadow-md">
                            动爻：{result.dongYao?.name}
                          </span>
                        </div>
                      </div>

                      {/* 卦名信息 */}
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                          <span className="text-5xl font-bold text-amber-900 dark:text-yellow-100
                                         dark:drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                            {result.gua.chineseName}
                          </span>
                          <div className="text-left">
                            <p className="text-xl text-amber-700 dark:text-yellow-500">第 {result.gua.id} 卦</p>
                            <p className="text-lg text-amber-600 dark:text-yellow-200/70">{result.gua.name}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                          <span 
                            className="inline-block px-3 py-1 rounded-full text-white text-sm font-bold shadow-md"
                            style={{ backgroundColor: getWuxingColor(result.gua.wuxing) }}
                          >
                            五行：{result.gua.wuxing}
                          </span>
                        </div>
                        <p className="text-amber-800 dark:text-yellow-200/80">{result.gua.meaning}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 体用关系展示 - 梅花易数 */}
                {result && (
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-md 
                               border-2 border-amber-300 dark:border-yellow-600/50">
                    <div className="flex items-center gap-3 mb-4">
                      <Compass className="w-6 h-6 text-amber-600 dark:text-yellow-500" />
                      <h3 className="text-xl font-bold text-amber-900 dark:text-yellow-100">梅花易数 · 体用分析</h3>
                    </div>
                    
                    {/* 定体用说明 */}
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <span className="font-bold">定体用：</span>
                        动爻在{result.dongYaoNum <= 3 ? '下卦' : '上卦'}，
                        故{result.dongYaoNum <= 3 ? result.xiaGuaName : result.shangGuaName}为<span className="font-bold text-blue-800">用卦</span>（所测之事），
                        {result.dongYaoNum <= 3 ? result.shangGuaName : result.xiaGuaName}为<span className="font-bold text-amber-800">体卦</span>（代表自身）
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 体卦 */}
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800/30">
                        <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                          体卦（自身、主体）
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl font-bold">{result.tiGuaName}</span>
                          <span className="text-sm text-amber-600 dark:text-amber-400">
                            五行：{baGuaXiang[result.tiGuaName]?.wuxing}
                          </span>
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          {baGuaXiang[result.tiGuaName]?.character}
                        </p>
                      </div>
                      
                      {/* 用卦 */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800/30">
                        <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          用卦（所测之事、外部）
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl font-bold">{result.yongGuaName}</span>
                          <span className="text-sm text-blue-600 dark:text-blue-400">
                            五行：{baGuaXiang[result.yongGuaName]?.wuxing}
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {baGuaXiang[result.yongGuaName]?.character}
                        </p>
                      </div>
                    </div>
                    
                    {/* 五行生克断吉凶 */}
                    <div className={`mt-4 p-4 rounded-lg border ${
                      result.wuxingDetail.level === 'great' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30' :
                      result.wuxingDetail.level === 'good' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30' :
                      result.wuxingDetail.level === 'bad' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/30' :
                      result.wuxingDetail.level === 'terrible' ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700' :
                      'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30'
                    }`}>
                      <h4 className={`font-bold mb-2 ${
                        result.wuxingDetail.level === 'great' ? 'text-red-800 dark:text-red-200' :
                        result.wuxingDetail.level === 'good' ? 'text-green-800 dark:text-green-200' :
                        result.wuxingDetail.level === 'bad' ? 'text-orange-800 dark:text-orange-200' :
                        result.wuxingDetail.level === 'terrible' ? 'text-gray-800 dark:text-gray-200' :
                        'text-purple-800 dark:text-purple-200'
                      }`}>
                        五行生克：{result.wuxingDetail.relation}
                      </h4>
                      <p className={`text-lg font-bold mb-1 ${
                        result.wuxingDetail.level === 'great' ? 'text-red-700 dark:text-red-300' :
                        result.wuxingDetail.level === 'good' ? 'text-green-700 dark:text-green-300' :
                        result.wuxingDetail.level === 'bad' ? 'text-orange-700 dark:text-orange-300' :
                        result.wuxingDetail.level === 'terrible' ? 'text-gray-700 dark:text-gray-300' :
                        'text-purple-700 dark:text-purple-300'
                      }`}>
                        {result.wuxingDetail.judgment}
                      </p>
                      <p className={`text-sm ${
                        result.wuxingDetail.level === 'great' ? 'text-red-600 dark:text-red-400' :
                        result.wuxingDetail.level === 'good' ? 'text-green-600 dark:text-green-400' :
                        result.wuxingDetail.level === 'bad' ? 'text-orange-600 dark:text-orange-400' :
                        result.wuxingDetail.level === 'terrible' ? 'text-gray-600 dark:text-gray-400' :
                        'text-purple-600 dark:text-purple-400'
                      }`}>
                        {result.wuxingDetail.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* 场景化解读 */}
                {sceneInterpretation && (
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-md 
                               border-2 border-amber-300 dark:border-yellow-600/50">
                    <div className="flex items-center gap-3 mb-4">
                      <Lightbulb className="w-6 h-6 text-amber-600 dark:text-yellow-500" />
                      <h3 className="text-xl font-bold text-amber-900 dark:text-yellow-100">
                        {selectedScene.name}解卦
                      </h3>
                    </div>
                    
                    {/* 总体断语 */}
                    <div className="bg-amber-50 dark:bg-yellow-500/10 rounded-lg p-4 mb-4 
                                  border border-amber-200 dark:border-yellow-800/30">
                      <p className="text-lg text-amber-800 dark:text-yellow-200 font-medium">
                        {sceneInterpretation.general}
                      </p>
                    </div>

                    {/* 建议 */}
                    <div className="mb-4">
                      <h4 className="font-bold text-amber-900 dark:text-yellow-300 mb-2 flex items-center gap-2">
                        <Compass className="w-4 h-4" />
                        行动建议
                      </h4>
                      <ul className="space-y-2">
                        {sceneInterpretation.advice.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-amber-700 dark:text-yellow-200/80">
                            <span className="text-amber-500 dark:text-yellow-500 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 注意事项 */}
                    <div className="mb-4">
                      <h4 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        注意事项
                      </h4>
                      <ul className="space-y-2">
                        {sceneInterpretation.caution.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-red-600 dark:text-red-300/80">
                            <span className="text-red-400 mt-1">!</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 时机提示 */}
                    {sceneInterpretation.timing && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 
                                    border border-blue-200 dark:border-blue-800/30">
                        <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          时机方位
                        </h4>
                        <p className="text-blue-700 dark:text-blue-300">{sceneInterpretation.timing}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 互卦和变卦展示 - 进阶分析 */}
                {result.huGua && result.bianGua && (
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-md 
                               border border-purple-300 dark:border-purple-700/50">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">三方关系 · 进阶分析</h3>
                    </div>
                    
                    {/* 本卦 */}
                    <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30">
                      <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-2">本卦（事情现状）</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{result.gua?.chineseName}</span>
                        <span className="text-sm text-amber-600 dark:text-amber-400">{result.gua?.meaning}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 互卦 */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-xl border border-purple-200 dark:border-purple-800/30">
                        <h4 className="font-bold text-purple-800 dark:text-purple-200 mb-3 text-center">互卦（发展过程）</h4>
                        <div className="text-center mb-3">
                          <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                            {result.huGua.shangGuaName}{result.huGua.xiaGuaName}
                          </span>
                          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                            第 {result.huGua.guaId} 卦
                          </p>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300 text-center mb-2">
                          代表事物发展的中间过程
                        </p>
                        <div className="text-xs text-purple-600 dark:text-purple-400 text-center">
                          二三四爻为下互，三四五爻为上互
                        </div>
                      </div>
                      
                      {/* 变卦 */}
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-xl border border-indigo-200 dark:border-indigo-800/30">
                        <h4 className="font-bold text-indigo-800 dark:text-indigo-200 mb-3 text-center">变卦（最终结果）</h4>
                        <div className="text-center mb-3">
                          <span className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                            {result.bianGua.shangGuaName}{result.bianGua.xiaGuaName}
                          </span>
                          <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                            第 {result.bianGua.guaId} 卦
                          </p>
                        </div>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 text-center mb-2">
                          代表事物发展的最终结果
                        </p>
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 text-center">
                          动爻变化后所得之卦
                        </div>
                      </div>
                    </div>
                    
                    {/* 三卦关系解读 */}
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/30">
                      <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">三卦连贯看</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        本卦看现状：{result.gua?.meaning}；
                        互卦看过程：事情发展将有变化；
                        变卦看结果：最终趋向{result.wuxingDetail.level === 'great' || result.wuxingDetail.level === 'good' ? '吉利' : '需谨慎应对'}。
                        不仅看体用关系，还要看变卦与体卦的关系（结果好坏），以及互卦与体卦的关系（过程顺逆）。
                      </p>
                    </div>
                  </div>
                )}

                {/* 卦象直读 - 万物类象 */}
                {result && (
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-md 
                               border border-teal-300 dark:border-teal-700/50">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      <h3 className="text-xl font-bold text-teal-900 dark:text-teal-100">卦象直读 · 万物类象</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 体卦类象 */}
                      <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800/30">
                        <h4 className="font-bold text-teal-800 dark:text-teal-200 mb-3">
                          体卦 {result.tiGuaName} 之象
                        </h4>
                        <ul className="space-y-1 text-sm text-teal-700 dark:text-teal-300">
                          <li><span className="font-medium">五行：</span>{baGuaXiang[result.tiGuaName]?.wuxing}</li>
                          <li><span className="font-medium">自然：</span>{baGuaXiang[result.tiGuaName]?.nature}</li>
                          <li><span className="font-medium">人物：</span>{baGuaXiang[result.tiGuaName]?.people}</li>
                          <li><span className="font-medium">身体：</span>{baGuaXiang[result.tiGuaName]?.body}</li>
                          <li><span className="font-medium">方位：</span>{baGuaXiang[result.tiGuaName]?.direction}</li>
                          <li><span className="font-medium">时令：</span>{baGuaXiang[result.tiGuaName]?.season}</li>
                        </ul>
                      </div>
                      
                      {/* 用卦类象 */}
                      <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg border border-cyan-200 dark:border-cyan-800/30">
                        <h4 className="font-bold text-cyan-800 dark:text-cyan-200 mb-3">
                          用卦 {result.yongGuaName} 之象
                        </h4>
                        <ul className="space-y-1 text-sm text-cyan-700 dark:text-cyan-300">
                          <li><span className="font-medium">五行：</span>{baGuaXiang[result.yongGuaName]?.wuxing}</li>
                          <li><span className="font-medium">自然：</span>{baGuaXiang[result.yongGuaName]?.nature}</li>
                          <li><span className="font-medium">人物：</span>{baGuaXiang[result.yongGuaName]?.people}</li>
                          <li><span className="font-medium">身体：</span>{baGuaXiang[result.yongGuaName]?.body}</li>
                          <li><span className="font-medium">方位：</span>{baGuaXiang[result.yongGuaName]?.direction}</li>
                          <li><span className="font-medium">时令：</span>{baGuaXiang[result.yongGuaName]?.season}</li>
                        </ul>
                      </div>
                    </div>
                    
                    {/* 综合取象 */}
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30">
                      <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-2">综合取象</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {result.tiGuaName}为体，{baGuaXiang[result.tiGuaName]?.character}；
                        {result.yongGuaName}为用，{baGuaXiang[result.yongGuaName]?.character}。
                        {result.wuxingDetail.relation}，
                        {result.wuxingDetail.level === 'great' ? '得助之象，贵人可能在' + baGuaXiang[result.yongGuaName]?.direction + '方' :
                         result.wuxingDetail.level === 'good' ? '可控之象，需主动争取，宜向' + baGuaXiang[result.tiGuaName]?.direction + '方' :
                         result.wuxingDetail.level === 'bad' ? '耗损之象，需注意' + baGuaXiang[result.tiGuaName]?.body + '方面' :
                         result.wuxingDetail.level === 'terrible' ? '受制之象，宜避开' + baGuaXiang[result.yongGuaName]?.direction + '方' :
                         '宜结合具体情况判断'}。
                      </p>
                    </div>
                  </div>
                )}

                {/* 应期推断 */}
                {result.yingQi && (
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-md 
                               border border-rose-300 dark:border-rose-700/50">
                    <div className="flex items-center gap-3 mb-4">
                      <Activity className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                      <h3 className="text-xl font-bold text-rose-900 dark:text-rose-100">应期推断 · 时间预测</h3>
                    </div>
                    
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800/30 mb-4">
                      <h4 className="font-bold text-rose-800 dark:text-rose-200 mb-2">总体判断</h4>
                      <p className="text-rose-700 dark:text-rose-300">{result.yingQi.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.yingQi.timeFrames.map((time, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 
                                                  rounded-lg border border-amber-200 dark:border-amber-800/30">
                          <span className="text-amber-500 dark:text-amber-400">⏱</span>
                          <span className="text-amber-800 dark:text-amber-200">{time}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 text-xs text-amber-600 dark:text-amber-400 italic">
                      注：应期推断需结合具体事情和实际情况，以上为参考时间框架
                    </div>
                  </div>
                )}

                {/* 动爻详解 */}
                {result.dongYao && (
                  <div className="bg-white dark:bg-red-900/10 rounded-2xl p-6 shadow-md 
                               border border-red-200 dark:border-red-800/30">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-6 h-6 text-red-600 dark:text-red-400" />
                      <h3 className="text-xl font-bold text-red-900 dark:text-red-300">动爻详解</h3>
                    </div>
                    <div className={`p-4 rounded-lg border 
                                 ${result.dongYao.yinYang === 'yang'
                                   ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/30'
                                   : 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700/30'
                                 }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                          {result.dongYao.name}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded 
                                      ${result.dongYao.yinYang === 'yang'
                                        ? 'bg-amber-200 dark:bg-amber-700 text-amber-800 dark:text-amber-200'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                      }`}>
                          {result.dongYao.yinYang === 'yang' ? '阳爻' : '阴爻'}
                        </span>
                      </div>
                      
                      {/* 爻位时机解读 */}
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800/30">
                        <h4 className="font-bold text-blue-800 dark:text-blue-200 text-sm mb-1">爻位时机</h4>
                        <p className="text-blue-700 dark:text-blue-300 text-sm">
                          {result.dongYao.position === 1 ? '初爻：事物初始阶段，基础建设时期' :
                           result.dongYao.position === 2 ? '二爻：事物发展阶段，渐入佳境时期' :
                           result.dongYao.position === 3 ? '三爻：事物转折阶段，面临选择时期' :
                           result.dongYao.position === 4 ? '四爻：事物进阶阶段，接近成功时期' :
                           result.dongYao.position === 5 ? '五爻：事物成功阶段，关键决策时期' :
                           '上爻：事物终结阶段，收尾总结时期'}
                        </p>
                      </div>
                      
                      <p className="text-lg text-amber-800 dark:text-amber-200 font-medium mb-2">
                        {result.dongYao.text}
                      </p>
                      {result.dongYao.xiangZhuan && (
                        <p className="text-amber-600 dark:text-amber-400 italic">
                          《象》曰：{result.dongYao.xiangZhuan}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 决策建议 - 合情理，做决策 */}
                {result && selectedScene && (
                  <div className="bg-white dark:bg-green-900/20 rounded-2xl p-6 shadow-md 
                               border border-green-300 dark:border-green-700/50">
                    <div className="flex items-center gap-3 mb-4">
                      <Lightbulb className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <h3 className="text-xl font-bold text-green-900 dark:text-green-100">决策建议</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* 体用关系决策 */}
                      <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800/30">
                        <h4 className="font-bold text-green-800 dark:text-green-200 mb-2">体用关系指导</h4>
                        <p className="text-green-700 dark:text-green-300">
                          {result.wuxingRelation.includes('得益') ? 
                            '卦象显示外部因素对您有利，宜积极行动，把握机会。' :
                           result.wuxingRelation.includes('耗损') ? 
                            '卦象显示需要付出较多努力，宜保持谨慎，注意资源消耗。' :
                           result.wuxingRelation.includes('得财') ? 
                            '卦象显示您有掌控局面的能力，宜主动出击，抓住机遇。' :
                           result.wuxingRelation.includes('有灾') ? 
                            '卦象显示外部环境对您不利，宜保持低调，防范风险。' :
                           '根据体用关系，建议您结合实际情况灵活应对。'}
                        </p>
                      </div>
                      
                      {/* 时机建议 */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/30">
                        <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">时机建议</h4>
                        <p className="text-blue-700 dark:text-blue-300">
                          {result.dongYao && (
                            result.dongYao.position === 1 ? 
                              '初爻发动，事情尚在萌芽阶段，建议先做好充分准备，不宜操之过急。' :
                            result.dongYao.position === 2 ? 
                              '二爻发动，事情正在发展，建议稳步推进，多听取他人意见。' :
                            result.dongYao.position === 3 ? 
                              '三爻发动，面临转折点，建议审慎决策，权衡利弊。' :
                            result.dongYao.position === 4 ? 
                              '四爻发动，接近成功，建议保持专注，避免功亏一篑。' :
                            result.dongYao.position === 5 ? 
                              '五爻发动，处于关键时期，建议果断行动，把握成功机会。' :
                              '上爻发动，事情将有结局，建议总结经验，为下一阶段做准备。'
                          )}
                        </p>
                      </div>
                      
                      {/* 实际应用建议 */}
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/30">
                        <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-2">结合现实</h4>
                        <p className="text-amber-700 dark:text-amber-300">
                          在{selectedScene.name}方面，卦象提示您要{result.gua?.meaning || '顺应时势'}。
                          建议您结合自身实际情况，理性分析卦象启示，做出最适合自己的决策。
                          卦象是指导，最终决策权在您自己手中。
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 卦辞 */}
                {result.gua && (
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-md 
                               border border-amber-200 dark:border-yellow-900/30">
                    <div className="flex items-center gap-3 mb-4">
                      <BookOpen className="w-6 h-6 text-amber-600 dark:text-yellow-500" />
                      <h3 className="text-xl font-bold text-amber-900 dark:text-yellow-100">卦辞</h3>
                    </div>
                    <p className="text-lg text-amber-800 dark:text-yellow-200/90 leading-relaxed">
                      {result.gua.guaci}
                    </p>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleShowDetail}
                    className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 
                             hover:from-amber-600 hover:to-orange-600
                             dark:from-yellow-600 dark:to-yellow-500 dark:hover:from-yellow-500 dark:hover:to-yellow-400
                             text-white dark:text-neutral-900 font-bold rounded-lg transition-all shadow-lg
                             hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                  >
                    查看完整卦象详情
                  </button>
                  <button
                    onClick={handleRestart}
                    className="flex-1 py-4 bg-gradient-to-r from-neutral-500 to-neutral-600 
                             hover:from-neutral-600 hover:to-neutral-700
                             dark:from-neutral-700 dark:to-neutral-600 dark:hover:from-neutral-600 dark:hover:to-neutral-500
                             text-white font-bold rounded-lg transition-all shadow-lg
                             hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0
                             flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    重新问事
                  </button>
                </div>
              </>
            ) : (
              /* 完整卦象详情 */
              <>
                {result.gua && (
                  <>
                    {/* 卦象头部 */}
                    <div className="bg-gradient-to-br from-amber-100 to-orange-100 
                                 dark:from-neutral-800 dark:to-neutral-900
                                 rounded-2xl p-8 shadow-lg border border-amber-200 dark:border-yellow-900/30">
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="bg-white dark:bg-amber-950/50 rounded-xl p-6 shadow-inner">
                          <div className="flex flex-col-reverse space-y-1 space-y-reverse">
                            {result.gua.yaos.map((yao, idx) => {
                              const isDongYao = result.dongYao?.position === yao.position;
                              return (
                                <div
                                  key={yao.position}
                                  className={`h-3 rounded-full transition-all duration-500
                                            ${yao.yinYang === 'yang'
                                              ? `w-20 ${isDongYao ? 'bg-red-500' : 'bg-amber-800 dark:bg-amber-400'}`
                                              : 'w-20 flex justify-between'
                                            }`}
                                  style={{ 
                                    animation: `yaoDraw 0.5s ease-out forwards`,
                                    animationDelay: `${idx * 80}ms`
                                  }}
                                >
                                  {yao.yinYang === 'yin' && (
                                    <>
                                      <div className={`w-8 h-3 rounded-full ${isDongYao ? 'bg-red-500' : 'bg-amber-800 dark:bg-amber-400'}`} />
                                      <div className={`w-8 h-3 rounded-full ${isDongYao ? 'bg-red-500' : 'bg-amber-800 dark:bg-amber-400'}`} />
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <h2 className="text-4xl font-bold text-amber-900 dark:text-amber-100 mb-2">
                            {result.gua.chineseName}
                          </h2>
                          <p className="text-xl text-amber-700 dark:text-amber-300">{result.gua.name}</p>
                          <p className="text-amber-600 dark:text-amber-400">[{result.gua.pronunciation}]</p>
                        </div>
                      </div>
                    </div>

                    {/* 卦辞、彖传、大象传 */}
                    <div className="bg-white dark:bg-amber-900/20 rounded-xl p-6 shadow-md 
                                 border border-amber-200 dark:border-amber-800/30">
                      <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4">卦辞</h3>
                      <p className="text-lg text-amber-800 dark:text-amber-200">{result.gua.guaci}</p>
                    </div>

                    <div className="bg-white dark:bg-amber-900/20 rounded-xl p-6 shadow-md 
                                 border border-amber-200 dark:border-amber-800/30">
                      <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4">彖传</h3>
                      <p className="text-amber-800 dark:text-amber-200 leading-relaxed">{result.gua.tuanZhuan}</p>
                    </div>

                    <div className="bg-white dark:bg-amber-900/20 rounded-xl p-6 shadow-md 
                                 border border-amber-200 dark:border-amber-800/30">
                      <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4">大象传</h3>
                      <p className="text-amber-800 dark:text-amber-200 leading-relaxed">{result.gua.daXiangZhuan}</p>
                    </div>

                    {/* 六爻 */}
                    <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-md 
                                 border border-amber-200 dark:border-yellow-900/30">
                      <h3 className="text-xl font-bold text-amber-900 dark:text-yellow-100 mb-6">六爻</h3>
                      <div className="space-y-4">
                        {result.gua.yaos.map((yao) => {
                          const positionNames = ['初', '二', '三', '四', '五', '上'];
                          const positionName = positionNames[yao.position - 1];
                          const yaoName = yao.yinYang === 'yang' ? '九' : '六';
                          const fullName = yao.position === 1 || yao.position === 6
                            ? `${positionName}${yaoName}`
                            : `${yaoName}${positionName}`;
                          const isDongYao = result.dongYao?.position === yao.position;

                          return (
                            <div
                              key={yao.position}
                              className={`p-4 rounded-lg border transition-all duration-200
                                       ${isDongYao
                                         ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800/30 ring-2 ring-red-200 dark:ring-red-900/20'
                                         : yao.yinYang === 'yang'
                                           ? 'bg-amber-50 dark:bg-yellow-500/5 border-amber-200 dark:border-yellow-800/30'
                                           : 'bg-gray-50 dark:bg-neutral-700/30 border-gray-200 dark:border-neutral-600/30'
                                       }`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-amber-900 dark:text-yellow-100">{fullName}</span>
                                {isDongYao && (
                                  <span className="text-xs px-2 py-1 bg-red-500 dark:bg-red-600 text-white rounded-full font-medium">
                                    动爻
                                  </span>
                                )}
                              </div>
                              <p className="text-amber-800 dark:text-yellow-200/90 font-medium">{yao.text}</p>
                              {yao.xiangZhuan && (
                                <p className="text-amber-600 dark:text-yellow-500/70 text-sm italic mt-1">
                                  《象》曰：{yao.xiangZhuan}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-amber-900 dark:bg-neutral-900 text-amber-200 dark:text-yellow-200/70 py-8 mt-12 
                       transition-colors duration-500 border-t dark:border-yellow-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2">易经问事解卦</p>
          <p className="text-sm text-amber-400">传承中华传统文化，探索易经智慧</p>
        </div>
      </footer>
    </div>
  );
}
