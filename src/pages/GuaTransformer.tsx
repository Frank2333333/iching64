import { useEffect, useState } from 'react';
import { liuShiSiGua, getGuaByYaos, getTrigramFromYaos, getWuxingColor, type Gua } from '../data/guaxiang';
import { RotateCcw, Info, ChevronRight } from 'lucide-react';
import MainHeaderTabs from '../components/MainHeaderTabs';

// 爻组件
interface YaoLineProps {
  yinYang: 'yin' | 'yang';
  position: number; // 1-6, 1为初爻，6为上爻
  onClick: () => void;
  isChanging?: boolean;
}

function YaoLine({ yinYang, position, onClick, isChanging }: YaoLineProps) {
  return (
    <button
      onClick={onClick}
      className={`relative group w-full rounded-[24px] py-3.5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]
                  ${isChanging ? 'animate-pulse' : ''}`}
    >
      {/* 背景高亮效果 */}
      <div className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 
                    bg-gradient-to-r from-transparent via-[#EBCFC2]/55 to-transparent 
                    dark:via-yellow-500/10 transition-opacity duration-300" />
      
      <div className="relative flex items-center justify-center">
        {/* 左侧：爻位标签 */}
        <div className="absolute left-2 sm:left-4 flex items-center">
          <span className="text-xs font-medium text-[#8A6658] dark:text-yellow-500/70
                         px-2 py-1 rounded-full bg-[#F6E9E0]/80 dark:bg-yellow-500/10
                         group-hover:bg-[#EFD8CC] dark:group-hover:bg-yellow-500/20
                         transition-colors duration-300">
            {position === 1 ? '初爻' : position === 2 ? '二爻' : position === 3 ? '三爻' : 
             position === 4 ? '四爻' : position === 5 ? '五爻' : '上爻'}
          </span>
        </div>
        
        {/* 中间：爻线 - 统一居中对齐 */}
        <div className="flex justify-center items-center">
          {yinYang === 'yang' ? (
            // 阳爻 - 一条长横线
            <div className="w-28 sm:w-32 h-3.5 bg-gradient-to-r from-[#B97A6B] via-[#D8B38A] to-[#C97C6D] 
                           dark:from-yellow-500 dark:via-yellow-400 dark:to-yellow-500
                           rounded-full shadow-lg shadow-[#C97C6D]/25 dark:shadow-yellow-500/30
                           group-hover:shadow-xl group-hover:shadow-[#C97C6D]/35
                           group-hover:from-[#C97C6D] group-hover:via-[#D8B38A] group-hover:to-[#B97A6B]
                           transition-all duration-300" />
          ) : (
            // 阴爻 - 两条短横线，左右对称分布
            <div className="flex justify-center items-center gap-4 sm:gap-5 w-28 sm:w-32">
              <div className="w-11 sm:w-12 h-3.5 bg-gradient-to-r from-[#8E675A] to-[#B97A6B]
                             dark:from-yellow-600 dark:to-yellow-500
                             rounded-full shadow-md shadow-[#C97C6D]/15 dark:shadow-yellow-500/20
                             group-hover:shadow-lg group-hover:shadow-[#C97C6D]/25
                             transition-all duration-300" />
              <div className="w-11 sm:w-12 h-3.5 bg-gradient-to-r from-[#B97A6B] to-[#8E675A]
                             dark:from-yellow-500 dark:to-yellow-600
                             rounded-full shadow-md shadow-[#C97C6D]/15 dark:shadow-yellow-500/20
                             group-hover:shadow-lg group-hover:shadow-[#C97C6D]/25
                             transition-all duration-300" />
            </div>
          )}
        </div>
        
        {/* 右侧：悬停提示 */}
        <div className="absolute right-2 sm:right-4 flex items-center">
          <span className="text-xs text-[#8A6658]/0 dark:text-yellow-500/0
                         group-hover:text-[#8A6658] dark:group-hover:text-yellow-500/80
                         transition-colors duration-300
                         flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C97C6D] dark:bg-yellow-500 animate-pulse" />
            点击变{yinYang === 'yang' ? '阴' : '阳'}
          </span>
        </div>
      </div>
    </button>
  );
}

// 八卦符号组件
function TrigramSymbol({ name }: { name: string }) {
  const symbols: Record<string, string> = {
    '乾': '☰', '兑': '☱', '离': '☲', '震': '☳',
    '巽': '☴', '坎': '☵', '艮': '☶', '坤': '☷'
  };
  return <span className="text-2xl">{symbols[name] || ''}</span>;
}

export default function GuaTransformer() {
  // 初始为乾卦（六爻皆阳）
  const [yaos, setYaos] = useState<('yin' | 'yang')[]>(['yang', 'yang', 'yang', 'yang', 'yang', 'yang']);
  const [currentGua, setCurrentGua] = useState<Gua | undefined>(liuShiSiGua[0]); // 乾卦
  const [isAnimating, setIsAnimating] = useState(false);
  
  // 当爻变化时，查找对应的卦
  useEffect(() => {
    const gua = getGuaByYaos(yaos);
    setCurrentGua(gua);
  }, [yaos]);
  
  // 切换爻的阴阳
  const toggleYao = (index: number) => {
    setIsAnimating(true);
    setYaos(prev => {
      const newYaos = [...prev];
      newYaos[index] = newYaos[index] === 'yang' ? 'yin' : 'yang';
      return newYaos;
    });
    setTimeout(() => setIsAnimating(false), 300);
  };
  
  // 重置为乾卦
  const resetToQian = () => {
    setYaos(['yang', 'yang', 'yang', 'yang', 'yang', 'yang']);
  };
  
  // 随机生成一卦
  const randomGua = () => {
    const randomYaos = Array.from({ length: 6 }, () => Math.random() > 0.5 ? 'yang' : 'yin') as ('yin' | 'yang')[];
    setYaos(randomYaos);
  };
  
  // 获取上卦和下卦
  const xiaGua = getTrigramFromYaos(yaos.slice(0, 3)); // 下三爻
  const shangGua = getTrigramFromYaos(yaos.slice(3, 6)); // 上三爻
  
  // 进入详情页
  const goToDetail = () => {
    if (currentGua) {
      // 跳转到六十四卦页面并打开详情
      window.location.href = `/#/hexagrams?gua=${currentGua.id}`;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] via-[#FFFDFC] to-[#F7EFE7] 
                    dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
                    transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#E8D7CA]/70 bg-[#FFF8F3]/82 text-[#4B3A33]
                         shadow-[0_14px_45px_-34px_rgba(107,74,58,0.45)] backdrop-blur-xl transition-colors duration-500
                         dark:border-white/10 dark:bg-neutral-950/80 dark:text-yellow-50 dark:shadow-[0_18px_48px_-36px_rgba(250,204,21,0.12)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/76
                            text-[#C97C6D] shadow-[0_14px_28px_-22px_rgba(146,64,14,0.35)]
                            dark:border-white/10 dark:bg-neutral-950/65 dark:text-yellow-300 dark:shadow-none">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold tracking-[0.14em] text-[#4B3A33] dark:text-yellow-50 sm:text-xl">变卦推演</h1>
              </div>
            </div>
            <MainHeaderTabs />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标题说明 */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[#4B3A33] dark:text-yellow-100 mb-3">
            交互式变卦
          </h2>
          <p className="text-[#6B5549] dark:text-yellow-200/70 max-w-2xl mx-auto">
            点击卦象中的任意爻，阳爻变阴爻，阴爻变阳爻，探索六十四卦的变化奥秘
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* 左侧：卦象展示 */}
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm
                        rounded-[30px] border border-[#E9D8C8] p-9 shadow-[0_28px_58px_-42px_rgba(107,74,58,0.42)] dark:border-yellow-900/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#4B3A33] dark:text-yellow-100">
                卦象
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={randomGua}
                  className="rounded-full px-4 py-2 text-sm bg-[#F3E7DC] hover:bg-[#EED9CC] 
                           dark:bg-yellow-600/20 dark:hover:bg-yellow-500/30
                           text-[#6B5549] dark:text-yellow-200
                           shadow-[0_16px_32px_-28px_rgba(107,74,58,0.4)] transition-all duration-300
                           hover:-translate-y-0.5 flex items-center space-x-1"
                >
                  <span>随机</span>
                </button>
                <button
                  onClick={resetToQian}
                  className="rounded-full px-4 py-2 text-sm bg-[#F3E7DC] hover:bg-[#EED9CC] 
                           dark:bg-yellow-600/20 dark:hover:bg-yellow-500/30
                           text-[#6B5549] dark:text-yellow-200
                           shadow-[0_16px_32px_-28px_rgba(107,74,58,0.4)] transition-all duration-300
                           hover:-translate-y-0.5 flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重置</span>
                </button>
              </div>
            </div>
            
            {/* 卦象图示 */}
            <div className="flex flex-col items-center py-7 sm:py-9 space-y-2.5 sm:space-y-3.5 
                          bg-gradient-to-b from-[#FBF2EC] to-transparent 
                          dark:from-yellow-900/10 rounded-[26px]
                          border border-[#EEDFD2] dark:border-yellow-900/20">
              {/* 上爻在最上面，所以要反向显示 */}
              {[...yaos].reverse().map((yao, idx) => {
                const actualPosition = 6 - idx; // 实际爻位（6到1）
                return (
                  <YaoLine
                    key={actualPosition}
                    yinYang={yao}
                    position={actualPosition}
                    onClick={() => toggleYao(actualPosition - 1)}
                    isChanging={isAnimating}
                  />
                );
              })}
            </div>
            
            {/* 上下卦信息 */}
            <div className="mt-6 flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-sm text-[#8A6658] dark:text-yellow-400/70 mb-1">上卦（外卦）</div>
                <div className="flex items-center justify-center space-x-2 text-[#4B3A33] dark:text-yellow-100">
                  <TrigramSymbol name={shangGua} />
                  <span className="font-bold">{shangGua}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-[#8A6658] dark:text-yellow-400/70 mb-1">下卦（内卦）</div>
                <div className="flex items-center justify-center space-x-2 text-[#4B3A33] dark:text-yellow-100">
                  <TrigramSymbol name={xiaGua} />
                  <span className="font-bold">{xiaGua}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：卦象详情 */}
          <div className="space-y-6">
            {currentGua ? (
              <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm
                            rounded-[30px] border border-[#E9D8C8] p-9 shadow-[0_28px_58px_-42px_rgba(107,74,58,0.42)] dark:border-yellow-900/30
                            animate-fadeIn">
                {/* 卦名头部 */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-5xl font-bold text-[#4B3A33] dark:text-yellow-100">
                        {currentGua.chineseName}
                      </span>
                      <span 
                        className="px-3 py-1 rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: getWuxingColor(currentGua.wuxing) }}
                      >
                        五行：{currentGua.wuxing}
                      </span>
                    </div>
                    <div className="text-[#6B5549] dark:text-yellow-200/80">
                      <span className="text-xl">{currentGua.name}</span>
                      <span className="ml-2 text-lg text-[#C97C6D] dark:text-yellow-500/70">
                        [{currentGua.pronunciation}]
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#D8B38A] dark:text-yellow-500">
                      第 {currentGua.id} 卦
                    </div>
                  </div>
                </div>

                {/* 卦辞 */}
                <div className="mb-7 rounded-[24px] bg-[#F6EDE6] p-5 dark:bg-yellow-900/20">
                  <div className="flex items-center space-x-2 text-[#6B5549] dark:text-yellow-300 mb-2">
                    <Info className="w-4 h-4" />
                    <span className="font-bold">卦辞</span>
                  </div>
                  <p className="text-lg text-[#4B3A33] dark:text-yellow-100 leading-relaxed">
                    {currentGua.guaci}
                  </p>
                </div>

                {/* 卦意 */}
                <div className="mb-6">
                  <p className="text-[#6B5549] dark:text-yellow-200/90 leading-relaxed">
                    {currentGua.meaning}
                  </p>
                </div>

                {/* 大象传 */}
                <div className="mb-7 rounded-[24px] bg-gradient-to-r from-[#F3E7DC] to-transparent p-5
                              dark:from-yellow-900/30 dark:to-transparent">
                  <div className="text-sm text-[#8A6658] dark:text-yellow-400/70 mb-1">大象传</div>
                  <p className="text-[#4B3A33] dark:text-yellow-100 italic">
                    {currentGua.daXiangZhuan}
                  </p>
                </div>

                {/* 时位分析 */}
                <div className="mb-6">
                  <div className="text-sm text-[#8A6658] dark:text-yellow-400/70 mb-2">时位分析</div>
                  <p className="text-[#6B5549] dark:text-yellow-200/80 text-sm leading-relaxed">
                    {currentGua.shiWei.description}
                  </p>
                </div>

                {/* 操作按钮 */}
                <button
                  onClick={goToDetail}
                  className="w-full rounded-[26px] bg-gradient-to-r from-[#C97C6D] to-[#B97A6B] px-6 py-3.5
                           hover:from-[#D58B7D] hover:to-[#C97C6D]
                           dark:from-yellow-600 dark:to-amber-600
                           dark:hover:from-yellow-500 dark:hover:to-amber-500
                           text-white font-bold shadow-[0_24px_46px_-30px_rgba(201,124,109,0.45)]
                           dark:shadow-yellow-600/30
                           hover:shadow-[0_28px_52px_-30px_rgba(201,124,109,0.5)]
                           transform hover:-translate-y-0.5 transition-all duration-300
                           flex items-center justify-center space-x-2"
                >
                  <span>查看完整详情</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm
                            rounded-[30px] border border-[#E9D8C8] p-9 shadow-[0_28px_58px_-42px_rgba(107,74,58,0.42)] dark:border-yellow-900/30
                            text-center">
                <div className="text-6xl mb-4">❓</div>
                <h3 className="text-xl font-bold text-[#4B3A33] dark:text-yellow-100 mb-2">
                  未知卦象
                </h3>
                <p className="text-[#8A6658] dark:text-yellow-400/70">
                  当前爻组合不在六十四卦中，请尝试其他组合
                </p>
              </div>
            )}

            {/* 提示信息 */}
            <div className="rounded-[26px] border border-[#E9D8C8] bg-[#FFF8F3] p-5 shadow-[0_22px_48px_-42px_rgba(107,74,58,0.4)] dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-[#C97C6D] dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-[#6B5549] dark:text-blue-200">
                  <p className="font-semibold mb-1">使用说明：</p>
                  <ul className="space-y-1 text-[#8A6658] dark:text-blue-300">
                    <li>• 点击左侧卦象中的任意爻可切换阴阳</li>
                    <li>• 阳爻（—）变阴爻（- -），阴爻变阳爻</li>
                    <li>• 变卦后右侧会自动显示新卦象的详细信息</li>
                    <li>• 点击下方按钮可查看完整卦象详情</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
