import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { liuShiSiGua, getGuaByYaos, getTrigramFromYaos, getWuxingColor, type Gua } from '../data/guaxiang';
import { ArrowRight, RotateCcw, Info, ChevronRight } from 'lucide-react';

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
      className={`relative group w-full py-2 transition-all duration-300 hover:scale-105 active:scale-95
                  ${isChanging ? 'animate-pulse' : ''}`}
    >
      {/* 爻位标签 */}
      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-amber-600/60 dark:text-yellow-500/60 
                       opacity-0 group-hover:opacity-100 transition-opacity">
        {position === 1 ? '初' : position === 2 ? '二' : position === 3 ? '三' : 
         position === 4 ? '四' : position === 5 ? '五' : '上'}
      </span>
      
      {yinYang === 'yang' ? (
        // 阳爻 - 一条长横线
        <div className="w-24 h-3 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 
                       dark:from-yellow-500 dark:via-yellow-400 dark:to-yellow-500
                       rounded-full shadow-lg shadow-amber-500/30 dark:shadow-yellow-500/30
                       group-hover:shadow-xl group-hover:shadow-amber-500/50
                       transition-all duration-300" />
      ) : (
        // 阴爻 - 两条短横线
        <div className="flex justify-between w-24">
          <div className="w-10 h-3 bg-gradient-to-r from-amber-700 to-amber-600
                         dark:from-yellow-600 dark:to-yellow-500
                         rounded-full shadow-md shadow-amber-500/20 dark:shadow-yellow-500/20
                         group-hover:shadow-lg transition-all duration-300" />
          <div className="w-10 h-3 bg-gradient-to-r from-amber-600 to-amber-700
                         dark:from-yellow-500 dark:to-yellow-600
                         rounded-full shadow-md shadow-amber-500/20 dark:shadow-yellow-500/20
                         group-hover:shadow-lg transition-all duration-300" />
        </div>
      )}
      
      {/* 悬停提示 */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8
                     opacity-0 group-hover:opacity-100 transition-opacity
                     text-xs text-amber-600 dark:text-yellow-500 whitespace-nowrap">
        点击变{yinYang === 'yang' ? '阴' : '阳'}
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
  const navigate = useNavigate();
  
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
      // 使用 window.location 跳转到主页并打开详情
      window.location.href = `/#/?gua=${currentGua.id}`;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 
                    dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
                    transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-900 via-red-900 to-amber-900 
                         dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 
                         text-amber-50 dark:text-yellow-100 shadow-lg transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold tracking-wider">变卦推演</h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg
                       bg-amber-800/50 hover:bg-amber-700/50 
                       dark:bg-yellow-600/20 dark:hover:bg-yellow-500/30
                       transition-all duration-300"
            >
              <span>返回首页</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标题说明 */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900 dark:text-yellow-100 mb-3">
            交互式变卦
          </h2>
          <p className="text-amber-700 dark:text-yellow-200/70 max-w-2xl mx-auto">
            点击卦象中的任意爻，阳爻变阴爻，阴爻变阳爻，探索六十四卦的变化奥秘
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* 左侧：卦象展示 */}
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm
                        rounded-2xl shadow-xl p-8 border border-amber-200 dark:border-yellow-900/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-amber-900 dark:text-yellow-100">
                卦象
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={randomGua}
                  className="px-3 py-1.5 text-sm bg-amber-100 hover:bg-amber-200 
                           dark:bg-yellow-600/20 dark:hover:bg-yellow-500/30
                           text-amber-800 dark:text-yellow-200 rounded-lg
                           transition-colors flex items-center space-x-1"
                >
                  <span>随机</span>
                </button>
                <button
                  onClick={resetToQian}
                  className="px-3 py-1.5 text-sm bg-amber-100 hover:bg-amber-200 
                           dark:bg-yellow-600/20 dark:hover:bg-yellow-500/30
                           text-amber-800 dark:text-yellow-200 rounded-lg
                           transition-colors flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重置</span>
                </button>
              </div>
            </div>
            
            {/* 卦象图示 */}
            <div className="flex flex-col items-center py-8 space-y-3 bg-gradient-to-b 
                          from-amber-50/50 to-transparent dark:from-yellow-900/10 rounded-xl">
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
                <div className="text-sm text-amber-600 dark:text-yellow-400/70 mb-1">上卦（外卦）</div>
                <div className="flex items-center justify-center space-x-2 text-amber-900 dark:text-yellow-100">
                  <TrigramSymbol name={shangGua} />
                  <span className="font-bold">{shangGua}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-amber-600 dark:text-yellow-400/70 mb-1">下卦（内卦）</div>
                <div className="flex items-center justify-center space-x-2 text-amber-900 dark:text-yellow-100">
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
                            rounded-2xl shadow-xl p-8 border border-amber-200 dark:border-yellow-900/30
                            animate-fadeIn">
                {/* 卦名头部 */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-5xl font-bold text-amber-900 dark:text-yellow-100">
                        {currentGua.chineseName}
                      </span>
                      <span 
                        className="px-3 py-1 rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: getWuxingColor(currentGua.wuxing) }}
                      >
                        五行：{currentGua.wuxing}
                      </span>
                    </div>
                    <div className="text-amber-700 dark:text-yellow-200/80">
                      <span className="text-xl">{currentGua.name}</span>
                      <span className="ml-2 text-lg text-amber-500 dark:text-yellow-500/70">
                        [{currentGua.pronunciation}]
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-amber-400 dark:text-yellow-500">
                      第 {currentGua.id} 卦
                    </div>
                  </div>
                </div>

                {/* 卦辞 */}
                <div className="mb-6 p-4 bg-amber-50 dark:bg-yellow-900/20 rounded-xl">
                  <div className="flex items-center space-x-2 text-amber-800 dark:text-yellow-300 mb-2">
                    <Info className="w-4 h-4" />
                    <span className="font-bold">卦辞</span>
                  </div>
                  <p className="text-lg text-amber-900 dark:text-yellow-100 leading-relaxed">
                    {currentGua.guaci}
                  </p>
                </div>

                {/* 卦意 */}
                <div className="mb-6">
                  <p className="text-amber-700 dark:text-yellow-200/90 leading-relaxed">
                    {currentGua.meaning}
                  </p>
                </div>

                {/* 大象传 */}
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-100/50 to-transparent
                              dark:from-yellow-900/30 dark:to-transparent rounded-xl">
                  <div className="text-sm text-amber-600 dark:text-yellow-400/70 mb-1">大象传</div>
                  <p className="text-amber-900 dark:text-yellow-100 italic">
                    {currentGua.daXiangZhuan}
                  </p>
                </div>

                {/* 时位分析 */}
                <div className="mb-6">
                  <div className="text-sm text-amber-600 dark:text-yellow-400/70 mb-2">时位分析</div>
                  <p className="text-amber-800 dark:text-yellow-200/80 text-sm leading-relaxed">
                    {currentGua.shiWei.description}
                  </p>
                </div>

                {/* 操作按钮 */}
                <button
                  onClick={goToDetail}
                  className="w-full py-3 px-6 bg-gradient-to-r from-amber-600 to-red-600
                           hover:from-amber-500 hover:to-red-500
                           dark:from-yellow-600 dark:to-amber-600
                           dark:hover:from-yellow-500 dark:hover:to-amber-500
                           text-white rounded-xl font-bold shadow-lg
                           shadow-amber-600/30 dark:shadow-yellow-600/30
                           hover:shadow-xl hover:shadow-amber-600/40
                           transform hover:-translate-y-0.5 transition-all duration-300
                           flex items-center justify-center space-x-2"
                >
                  <span>查看完整详情</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm
                            rounded-2xl shadow-xl p-8 border border-amber-200 dark:border-yellow-900/30
                            text-center">
                <div className="text-6xl mb-4">❓</div>
                <h3 className="text-xl font-bold text-amber-900 dark:text-yellow-100 mb-2">
                  未知卦象
                </h3>
                <p className="text-amber-600 dark:text-yellow-400/70">
                  当前爻组合不在六十四卦中，请尝试其他组合
                </p>
              </div>
            )}

            {/* 提示信息 */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">使用说明：</p>
                  <ul className="space-y-1 text-blue-700 dark:text-blue-300">
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
