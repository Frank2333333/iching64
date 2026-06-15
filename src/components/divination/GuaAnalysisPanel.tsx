import {
  Compass, Lightbulb, HelpCircle, Activity, Sparkles, BookOpen,
  ChevronUp, ChevronDown, RotateCcw,
} from 'lucide-react';
import type { Gua } from '../../data/guaxiang';
import type { DivinationResult } from '../../lib/meihua-divination';

interface QuestionScene {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface GuaAnalysisPanelProps {
  result: DivinationResult;
  selectedScene: QuestionScene;
  detailsExpanded: boolean;
  onToggleDetails: () => void;
  onShowDetail: () => void;
  onRestart: () => void;
}

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
    color: '红色、紫色',
    animal: '雉、龟、鳖、蟹',
    object: '书、文、券、光亮之物',
    character: '文明、丽、依附'
  },
  '震': {
    wuxing: '木',
    nature: '雷、电、鸣、振动',
    people: '长男、行事果断之人',
    body: '足、肝、发、声音',
    direction: '东',
    season: '春季，卯年月日时',
    color: '青色、绿色',
    animal: '龙、蛇',
    object: '乐器、车、舟',
    character: '动、奋起、威'
  },
  '巽': {
    wuxing: '木',
    nature: '风、气、香、臭',
    people: '长女、僧道、文人',
    body: '股、肱、气、胆',
    direction: '东南',
    season: '春夏之交，辰巳年月日时',
    color: '青色、绿色',
    animal: '鸡、禽类',
    object: '绳、线、扇、布',
    character: '入、顺、不果'
  },
  '坎': {
    wuxing: '水',
    nature: '水、雨、雪、霜',
    people: '中男、盗贼、渔人',
    body: '耳、肾、血、膀胱',
    direction: '北',
    season: '冬季，子年月日时',
    color: '黑色、蓝色',
    animal: '猪、鱼、水族',
    object: '酒、油、饮料',
    character: '险、陷、隐伏'
  },
  '艮': {
    wuxing: '土',
    nature: '山、石、门、径',
    people: '少男、童子、闲人',
    body: '手、指、鼻、背',
    direction: '东北',
    season: '冬春之交，丑寅年月日时',
    color: '黄色、棕色',
    animal: '狗、虎、鼠',
    object: '石、土、碑、床',
    character: '止、静、笃实'
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

interface SceneInterpretation {
  general: string;
  advice: string[];
  caution: string[];
  timing?: string;
}

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

export default function GuaAnalysisPanel({
  result,
  selectedScene,
  detailsExpanded,
  onToggleDetails,
  onShowDetail,
  onRestart,
}: GuaAnalysisPanelProps) {
  const sceneInterpretation = result.gua
    ? getSceneInterpretation(selectedScene.id, result.gua, result.dongYaoNum, result.wuxingRelation)
    : null;

  return (
    <>
      <div className="rounded-2xl border border-violet-200 bg-white/90 p-4 shadow-sm dark:border-violet-800/40 dark:bg-neutral-900/70">
        <button
          type="button"
          onClick={onToggleDetails}
          className="flex w-full items-center justify-between gap-4 text-left"
        >
          <div>
            <p className="text-base font-bold text-violet-900 dark:text-violet-100">
              {detailsExpanded ? '收起细节' : '细节展开'}
            </p>
            <p className="mt-1 text-sm text-violet-600 dark:text-violet-300">
              {detailsExpanded
                ? '体用分析、场景解读、应期、动爻、决策建议和卦辞已展开。'
                : '体用分析及以下详细内容默认收起，点击后再查看。'}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
            {detailsExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </button>
      </div>

      {detailsExpanded && (
        <>
          {/* 体用关系展示 - 梅花易数 */}
          {result && (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-md
                         border-2 border-[#E1C8B2] dark:border-yellow-600/50">
              <div className="flex items-center gap-3 mb-4">
                <Compass className="w-6 h-6 text-[#8A6658] dark:text-yellow-500" />
                <h3 className="text-xl font-bold text-[#4B3A33] dark:text-yellow-100">梅花易数 · 体用分析</h3>
              </div>

              {/* 定体用说明 */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-bold">定体用：</span>
                  动爻在{result.dongYaoNum <= 3 ? '下卦' : '上卦'}，
                  故{result.dongYaoNum <= 3 ? result.xiaGuaName : result.shangGuaName}为<span className="font-bold text-blue-800">用卦</span>（所测之事），
                  {result.dongYaoNum <= 3 ? result.shangGuaName : result.xiaGuaName}为<span className="font-bold text-[#5A463E]">体卦</span>（代表自身）
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 体卦 */}
                <div className="bg-[#FFF8F3] dark:bg-amber-900/20 p-4 rounded-lg border border-[#E9D8C8] dark:border-amber-800/30">
                  <h4 className="font-bold text-[#5A463E] dark:text-amber-200 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#C97C6D] rounded-full"></span>
                    体卦（自身、主体）
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold">{result.tiGuaName}</span>
                    <span className="text-sm text-[#8A6658] dark:text-amber-400">
                      五行：{baGuaXiang[result.tiGuaName]?.wuxing}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B5549] dark:text-amber-300">
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
                result.wuxingDetail.level === 'bad' ? 'bg-[#FFF8F3] dark:bg-orange-900/20 border-[#E9D8C8] dark:border-orange-800/30' :
                result.wuxingDetail.level === 'terrible' ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700' :
                'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30'
              }`}>
                <h4 className={`font-bold mb-2 ${
                  result.wuxingDetail.level === 'great' ? 'text-red-800 dark:text-red-200' :
                  result.wuxingDetail.level === 'good' ? 'text-green-800 dark:text-green-200' :
                  result.wuxingDetail.level === 'bad' ? 'text-[#5A463E] dark:text-orange-200' :
                  result.wuxingDetail.level === 'terrible' ? 'text-gray-800 dark:text-gray-200' :
                  'text-purple-800 dark:text-purple-200'
                }`}>
                  五行生克：{result.wuxingDetail.relation}
                </h4>
                <p className={`text-lg font-bold mb-1 ${
                  result.wuxingDetail.level === 'great' ? 'text-red-700 dark:text-red-300' :
                  result.wuxingDetail.level === 'good' ? 'text-green-700 dark:text-green-300' :
                  result.wuxingDetail.level === 'bad' ? 'text-[#6B5549] dark:text-orange-300' :
                  result.wuxingDetail.level === 'terrible' ? 'text-gray-700 dark:text-gray-300' :
                  'text-purple-700 dark:text-purple-300'
                }`}>
                  {result.wuxingDetail.judgment}
                </p>
                <p className={`text-sm ${
                  result.wuxingDetail.level === 'great' ? 'text-red-600 dark:text-red-400' :
                  result.wuxingDetail.level === 'good' ? 'text-green-600 dark:text-green-400' :
                  result.wuxingDetail.level === 'bad' ? 'text-[#8A6658] dark:text-orange-400' :
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
                         border-2 border-[#E1C8B2] dark:border-yellow-600/50">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-[#8A6658] dark:text-yellow-500" />
                <h3 className="text-xl font-bold text-[#4B3A33] dark:text-yellow-100">
                  {selectedScene.name}解卦
                </h3>
              </div>

              {/* 总体断语 */}
              <div className="bg-[#FFF8F3] dark:bg-yellow-500/10 rounded-lg p-4 mb-4
                            border border-[#E9D8C8] dark:border-yellow-800/30">
                <p className="text-lg text-[#5A463E] dark:text-yellow-200 font-medium">
                  {sceneInterpretation.general}
                </p>
              </div>

              {/* 建议 */}
              <div className="mb-4">
                <h4 className="font-bold text-[#4B3A33] dark:text-yellow-300 mb-2 flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  行动建议
                </h4>
                <ul className="space-y-2">
                  {sceneInterpretation.advice.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[#6B5549] dark:text-yellow-200/80">
                      <span className="text-[#C97C6D] dark:text-yellow-500 mt-1">•</span>
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
              <div className="mb-4 p-4 bg-[#FFF8F3] dark:bg-amber-900/10 rounded-lg border border-[#E9D8C8] dark:border-amber-800/30">
                <h4 className="font-bold text-[#5A463E] dark:text-amber-200 mb-2">本卦（事情现状）</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{result.gua?.chineseName}</span>
                  <span className="text-sm text-[#8A6658] dark:text-amber-400">{result.gua?.meaning}</span>
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
              <div className="mt-4 p-4 bg-[#FFF8F3] dark:bg-amber-900/10 rounded-lg border border-[#E9D8C8] dark:border-amber-800/30">
                <h4 className="font-bold text-[#5A463E] dark:text-amber-200 mb-2">综合取象</h4>
                <p className="text-sm text-[#6B5549] dark:text-amber-300">
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
                  <div key={idx} className="flex items-center gap-2 p-3 bg-[#FFF8F3] dark:bg-amber-900/20
                                            rounded-lg border border-[#E9D8C8] dark:border-amber-800/30">
                    <span className="text-[#C97C6D] dark:text-amber-400">⏱</span>
                    <span className="text-[#5A463E] dark:text-amber-200">{time}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-[#8A6658] dark:text-amber-400 italic">
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
                             ? 'bg-[#FFF8F3] dark:bg-amber-900/20 border-[#E9D8C8] dark:border-amber-700/30'
                             : 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700/30'
                           }`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-bold text-[#4B3A33] dark:text-amber-100">
                    {result.dongYao.name}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded
                                ${result.dongYao.yinYang === 'yang'
                                  ? 'bg-[#F3E7DC] dark:bg-amber-700 text-[#5A463E] dark:text-amber-200'
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

                <p className="text-lg text-[#5A463E] dark:text-amber-200 font-medium mb-2">
                  {result.dongYao.text}
                </p>
                {result.dongYao.xiangZhuan && (
                  <p className="text-[#8A6658] dark:text-amber-400 italic">
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
                <div className="p-4 bg-[#FFF8F3] dark:bg-amber-950/30 rounded-lg border border-[#E9D8C8] dark:border-amber-800/30">
                  <h4 className="font-bold text-[#5A463E] dark:text-amber-200 mb-2">结合现实</h4>
                  <p className="text-[#6B5549] dark:text-amber-300">
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
                         border border-[#E9D8C8] dark:border-yellow-900/30">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-[#8A6658] dark:text-yellow-500" />
                <h3 className="text-xl font-bold text-[#4B3A33] dark:text-yellow-100">卦辞</h3>
              </div>
              <p className="text-lg text-[#5A463E] dark:text-yellow-200/90 leading-relaxed">
                {result.gua.guaci}
              </p>
            </div>
          )}
        </>
      )}

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onShowDetail}
          className="flex-1 py-4 bg-gradient-to-r from-[#C97C6D] to-[#D8B38A]
                   hover:from-[#C97C6D] hover:to-[#C08B6F]
                   dark:from-yellow-600 dark:to-yellow-500 dark:hover:from-yellow-500 dark:hover:to-yellow-400
                   text-white dark:text-neutral-900 font-bold rounded-lg transition-all shadow-lg
                   hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          查看完整卦象详情
        </button>
        <button
          onClick={onRestart}
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
  );
}
