import { Search, Sparkles, Dice5, Compass } from 'lucide-react';

interface QuestionScene {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface DivinationFormProps {
  selectedScene: QuestionScene;
  questionContent: string;
  num1: string;
  num2: string;
  num3: string;
  isCalculating: boolean;
  onBackToScene: () => void;
  onQuestionContentChange: (value: string) => void;
  onNum1Change: (value: string) => void;
  onNum2Change: (value: string) => void;
  onNum3Change: (value: string) => void;
  onGenerateRandom: () => void;
  onCalculate: () => void;
}

export default function DivinationForm({
  selectedScene,
  questionContent,
  num1,
  num2,
  num3,
  isCalculating,
  onBackToScene,
  onQuestionContentChange,
  onNum1Change,
  onNum2Change,
  onNum3Change,
  onGenerateRandom,
  onCalculate,
}: DivinationFormProps) {
  return (
    <div className="animate-slideInUp">
      {/* 已选场景卡片 */}
      <div className={`p-4 rounded-xl border-2 mb-6 ${selectedScene.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg bg-white/80 dark:bg-neutral-800/80 ${selectedScene.color} mr-3`}>
              {selectedScene.icon}
            </div>
            <div>
              <p className="text-sm text-[#8A6658] dark:text-yellow-500">当前问事</p>
              <h3 className={`font-bold text-lg ${selectedScene.color}`}>{selectedScene.name}</h3>
            </div>
          </div>
          <button
            onClick={onBackToScene}
            className="text-sm text-[#8A6658] dark:text-yellow-500 hover:text-[#5A463E]
                     dark:hover:text-yellow-300 underline"
          >
            更换场景
          </button>
        </div>
      </div>

      {/* 问事内容输入 */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 mb-6 shadow-md
                   border border-[#E9D8C8] dark:border-yellow-900/30
                   dark:hover:border-yellow-800/50 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-6 h-6 text-[#8A6658] dark:text-yellow-500" />
          <h2 className="text-xl font-bold text-[#4B3A33] dark:text-yellow-100">具体问事内容</h2>
        </div>
        <p className="text-sm text-[#8A6658] dark:text-yellow-400/70 mb-3">
          请详细描述您想问的具体事情（选填，有助于 AI 给出更精准的建议）
        </p>
        <textarea
          value={questionContent}
          onChange={(e) => onQuestionContentChange(e.target.value)}
          placeholder={`例如：\n• 我想问最近公司有个晋升机会，我能否成功升职？\n• 我和男朋友最近感情出了点问题，想知道能否和好？\n• 最近在考虑换工作，不知道时机是否合适？`}
          rows={4}
          className="w-full px-4 py-3 border border-[#E1C8B2] dark:border-yellow-700/50
                   rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C97C6D]
                   dark:focus:ring-yellow-600
                   text-[#4B3A33] dark:text-yellow-100
                   bg-white dark:bg-neutral-900
                   transition-colors placeholder:text-[#B79A86] dark:placeholder:text-yellow-700/50
                   resize-none"
        />
        <div className="mt-2 text-right text-xs text-[#C97C6D] dark:text-yellow-600">
          {questionContent.length}/200 字
        </div>
      </div>

      {/* 说明卡片 */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 mb-6 shadow-md
                   border border-[#E9D8C8] dark:border-yellow-900/30
                   dark:hover:border-yellow-800/50 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-[#8A6658] dark:text-yellow-500" />
          <h2 className="text-xl font-bold text-[#4B3A33] dark:text-yellow-100">数字起卦说明</h2>
        </div>
        <div className="space-y-2 text-[#6B5549] dark:text-yellow-200/70">
          <p>1. 心中默念您的问题，保持专注和诚心</p>
          <p>2. 输入三个三位数字（或点击 🎲 随机生成）</p>
          <p>3. 第一个数字 ÷ 8 取余数 → 下卦（1乾、2兑、3离、4震、5巽、6坎、7艮、8坤）</p>
          <p>4. 第二个数字 ÷ 8 取余数 → 上卦（同上）</p>
          <p>5. 第三个数字 ÷ 6 取余数 → 动爻（1初爻、2二爻、3三爻、4四爻、5五爻、6上爻）</p>
        </div>
      </div>

      {/* 输入表单 */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-md
                   border border-[#E9D8C8] dark:border-yellow-900/30
                   animate-slideInUp dark:hover:border-yellow-800/50 transition-colors"
           style={{ animationDelay: '0.1s' }}>
        <div className="flex justify-end mb-4">
          <button
            onClick={onGenerateRandom}
            className="flex items-center gap-2 px-4 py-2 text-[#8A6658] dark:text-yellow-500
                     hover:bg-[#F8EEE5] dark:hover:bg-yellow-500/10 rounded-lg transition-colors"
          >
            <Dice5 className="w-5 h-5" />
            <span>随机生成</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-[#6B5549] dark:text-yellow-400 mb-2">
              第一个数字（下卦） <span className="text-xs text-[#C97C6D] dark:text-yellow-600">(100-999)</span>
            </label>
            <input
              type="number"
              value={num1}
              onChange={(e) => onNum1Change(e.target.value)}
              placeholder="输入三位数字"
              min="100"
              max="999"
              className="w-full px-4 py-3 border border-[#E1C8B2] dark:border-yellow-700/50
                       rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C97C6D]
                       dark:focus:ring-yellow-600
                       text-[#4B3A33] dark:text-yellow-100
                       bg-white dark:bg-neutral-900
                       transition-colors placeholder:text-[#B79A86] dark:placeholder:text-yellow-700/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B5549] dark:text-yellow-400 mb-2">
              第二个数字（上卦） <span className="text-xs text-[#C97C6D] dark:text-yellow-600">(100-999)</span>
            </label>
            <input
              type="number"
              value={num2}
              onChange={(e) => onNum2Change(e.target.value)}
              placeholder="输入三位数字"
              min="100"
              max="999"
              className="w-full px-4 py-3 border border-[#E1C8B2] dark:border-yellow-700/50
                       rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C97C6D]
                       dark:focus:ring-yellow-600
                       text-[#4B3A33] dark:text-yellow-100
                       bg-white dark:bg-neutral-900
                       transition-colors placeholder:text-[#B79A86] dark:placeholder:text-yellow-700/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B5549] dark:text-yellow-400 mb-2">
              第三个数字（动爻） <span className="text-xs text-[#C97C6D] dark:text-yellow-600">(100-999)</span>
            </label>
            <input
              type="number"
              value={num3}
              onChange={(e) => onNum3Change(e.target.value)}
              placeholder="输入三位数字"
              min="100"
              max="999"
              className="w-full px-4 py-3 border border-[#E1C8B2] dark:border-yellow-700/50
                       rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C97C6D]
                       dark:focus:ring-yellow-600
                       text-[#4B3A33] dark:text-yellow-100
                       bg-white dark:bg-neutral-900
                       transition-colors placeholder:text-[#B79A86] dark:placeholder:text-yellow-700/50"
            />
          </div>
        </div>
        <button
          onClick={onCalculate}
          disabled={isCalculating}
          className="w-full py-4 bg-gradient-to-r from-[#C97C6D] to-[#D8B38A]
                   hover:from-[#B56F62] hover:to-[#C08B6F]
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
  );
}
