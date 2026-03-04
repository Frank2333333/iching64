import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Scale, GitBranch, Target, RefreshCw, Layers } from 'lucide-react';
import type { Gua } from '../data/guaxiang';
import { getGuaById, getWuxingColor, baGua } from '../data/guaxiang';

interface GuaDetailProps {
  gua: Gua;
  onBack: () => void;
  onSelectGua: (gua: Gua) => void;
}

export default function GuaDetail({ gua, onBack, onSelectGua }: GuaDetailProps) {
  const duiGua = getGuaById(gua.duiGua);
  const zongGua = getGuaById(gua.zongGua);
  const huGua = getGuaById(gua.huGua);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());

  // 交错动画显示各个部分
  useEffect(() => {
    const sections = containerRef.current?.querySelectorAll('.detail-section');
    if (!sections) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleSections(prev => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [gua.id]);

  // 处理卦变关系点击
  const handleGuaClick = (selectedGua: Gua) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onSelectGua(selectedGua);
  };

  return (
    <div ref={containerRef} className="detail-animate-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="back-btn mb-6 flex items-center gap-2 px-4 py-2 rounded-lg
                 text-amber-700 dark:text-yellow-500 hover:text-amber-900 dark:hover:text-yellow-400
                 hover:bg-amber-100 dark:hover:bg-yellow-500/10 transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回卦象列表</span>
      </button>

      {/* Header Card */}
      <div className="detail-section bg-gradient-to-br from-amber-100 to-orange-100 
                    dark:from-neutral-800 dark:to-neutral-900
                    rounded-2xl p-8 mb-8 shadow-lg border border-amber-200 dark:border-yellow-900/30
                    transition-all duration-500 hover:shadow-xl dark:hover:shadow-yellow-900/20"
           data-index={0}
           style={{ 
             opacity: visibleSections.has(0) ? 1 : 0,
             transform: visibleSections.has(0) ? 'translateY(0)' : 'translateY(20px)',
             transition: 'opacity 0.5s ease, transform 0.5s ease'
           }}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* 卦画 */}
          <div className="flex flex-col items-center">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-inner dark:border dark:border-yellow-900/30">
              <div className="flex flex-col-reverse space-y-2 space-y-reverse">
                {gua.yaos.map((yao, idx) => (
                  <div
                    key={yao.position}
                    className={`h-3 rounded-full transition-all duration-500
                              ${yao.yinYang === 'yang'
                                ? 'w-20 bg-amber-800 dark:bg-amber-400'
                                : 'w-20 flex justify-between'
                              }`}
                    style={{ 
                      animation: `yaoDraw 0.5s ease-out forwards`,
                      animationDelay: `${idx * 80}ms`
                    }}
                  >
                    {yao.yinYang === 'yin' && (
                      <>
                        <div className="w-8 h-3 bg-amber-800 dark:bg-amber-400 rounded-full" />
                        <div className="w-8 h-3 bg-amber-800 dark:bg-amber-400 rounded-full" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 text-center">
              <span 
                className="inline-block px-3 py-1 rounded-full text-white text-sm font-bold shadow-md"
                style={{ backgroundColor: getWuxingColor(gua.wuxing) }}
              >
                五行：{gua.wuxing}
              </span>
            </div>
          </div>

          {/* 基本信息 */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <span className="text-6xl font-bold text-amber-900 dark:text-yellow-100 
                             drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                {gua.chineseName}
              </span>
              <div className="text-left">
                <p className="text-xl text-amber-700 dark:text-yellow-500">第 {gua.id} 卦</p>
                <p className="text-lg text-amber-600 dark:text-yellow-200/70">{gua.name}</p>
                <p className="text-sm text-amber-500 dark:text-yellow-600">[{gua.pronunciation}]</p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
              <div className="bg-white/70 dark:bg-neutral-900/50 rounded-lg px-4 py-2 backdrop-blur-sm border dark:border-yellow-900/20">
                <span className="text-amber-600 dark:text-yellow-600">上卦（外卦）：</span>
                <span className="font-bold text-amber-900 dark:text-yellow-100">
                  {gua.shangGua} {baGua[gua.shangGua]?.symbol}
                </span>
              </div>
              <div className="bg-white/70 dark:bg-neutral-900/50 rounded-lg px-4 py-2 backdrop-blur-sm border dark:border-yellow-900/20">
                <span className="text-amber-600 dark:text-yellow-600">下卦（内卦）：</span>
                <span className="font-bold text-amber-900 dark:text-yellow-100">
                  {gua.xiaGua} {baGua[gua.xiaGua]?.symbol}
                </span>
              </div>
            </div>

            <p className="text-amber-800 dark:text-yellow-200/80 text-lg leading-relaxed">
              {gua.meaning}
            </p>
          </div>
        </div>
      </div>

      {/* 卦辞 */}
      <div className="detail-section bg-white dark:bg-neutral-800 rounded-xl p-6 mb-6 
                    shadow-md border border-amber-200 dark:border-yellow-900/30
                    detail-card transition-all duration-300 dark:hover:border-yellow-800/50"
           data-index={1}
           style={{ 
             opacity: visibleSections.has(1) ? 1 : 0,
             transform: visibleSections.has(1) ? 'translateY(0)' : 'translateY(20px)',
             transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s'
           }}>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-6 h-6 text-amber-700 dark:text-yellow-500" />
          <h2 className="text-2xl font-bold text-amber-900 dark:text-yellow-100">卦辞</h2>
        </div>
        <p className="text-xl text-amber-800 dark:text-yellow-200/90 leading-relaxed font-medium">
          {gua.guaci}
        </p>
      </div>

      {/* 彖传 */}
      <div className="detail-section bg-white dark:bg-neutral-800 rounded-xl p-6 mb-6 
                    shadow-md border border-amber-200 dark:border-yellow-900/30
                    detail-card dark:hover:border-yellow-800/50"
           data-index={2}
           style={{ 
             opacity: visibleSections.has(2) ? 1 : 0,
             transform: visibleSections.has(2) ? 'translateY(0)' : 'translateY(20px)',
             transition: 'opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s'
           }}>
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-6 h-6 text-amber-700 dark:text-yellow-500" />
          <h2 className="text-2xl font-bold text-amber-900 dark:text-yellow-100">彖传</h2>
        </div>
        <p className="text-amber-800 dark:text-yellow-200/80 leading-relaxed">{gua.tuanZhuan}</p>
      </div>

      {/* 大象传 */}
      <div className="detail-section bg-white dark:bg-neutral-800 rounded-xl p-6 mb-6 
                    shadow-md border border-amber-200 dark:border-yellow-900/30
                    detail-card dark:hover:border-yellow-800/50"
           data-index={3}
           style={{ 
             opacity: visibleSections.has(3) ? 1 : 0,
             transform: visibleSections.has(3) ? 'translateY(0)' : 'translateY(20px)',
             transition: 'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s'
           }}>
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-6 h-6 text-amber-700 dark:text-yellow-500" />
          <h2 className="text-2xl font-bold text-amber-900 dark:text-yellow-100">大象传</h2>
        </div>
        <p className="text-amber-800 dark:text-yellow-200/80 leading-relaxed">{gua.daXiangZhuan}</p>
      </div>

      {/* 爻辞与小象传 */}
      <div className="detail-section bg-white dark:bg-neutral-800 rounded-xl p-6 mb-6 
                    shadow-md border border-amber-200 dark:border-yellow-900/30
                    detail-card dark:hover:border-yellow-800/50"
           data-index={4}
           style={{ 
             opacity: visibleSections.has(4) ? 1 : 0,
             transform: visibleSections.has(4) ? 'translateY(0)' : 'translateY(20px)',
             transition: 'opacity 0.5s ease 0.25s, transform 0.5s ease 0.25s'
           }}>
        <div className="flex items-center gap-2 mb-6">
          <GitBranch className="w-6 h-6 text-amber-700 dark:text-yellow-500" />
          <h2 className="text-2xl font-bold text-amber-900 dark:text-yellow-100">六爻</h2>
        </div>
        <div className="space-y-4">
          {gua.yaos.map((yao, idx) => {
            const positionNames = ['初', '二', '三', '四', '五', '上'];
            const positionName = positionNames[yao.position - 1];
            const yaoName = yao.yinYang === 'yang' ? '九' : '六';
            const fullName = yao.position === 1 || yao.position === 6 
              ? `${positionName}${yaoName}` 
              : `${yaoName}${positionName}`;
            
            // 当位判断
            const isDangWei = yao.yinYang === 'yang' 
              ? yao.position % 2 === 1
              : yao.position % 2 === 0;
            
            return (
              <div 
                key={yao.position} 
                className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md
                          ${yao.yinYang === 'yang' 
                            ? 'bg-amber-50 dark:bg-yellow-500/5 border-amber-200 dark:border-yellow-800/30' 
                            : 'bg-gray-50 dark:bg-neutral-700/30 border-gray-200 dark:border-neutral-600/30'
                          }`}
                style={{
                  animation: 'slideInUp 0.4s ease-out forwards',
                  animationDelay: `${idx * 80}ms`,
                  opacity: 0
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-4 rounded-full transition-transform hover:scale-110
                                ${yao.yinYang === 'yang' 
                                  ? 'bg-amber-800 dark:bg-yellow-500' 
                                  : 'bg-gray-600 dark:bg-neutral-400'
                                }`}>
                    {yao.yinYang === 'yin' && (
                      <div className="w-full h-full flex justify-center items-center">
                        <div className="w-2 h-2 bg-white dark:bg-amber-950 rounded-full" />
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-amber-900 dark:text-yellow-100">{fullName}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium
                                 ${isDangWei 
                                   ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                   : 'bg-gray-100 dark:bg-neutral-600 text-gray-500 dark:text-neutral-400'
                                 }`}>
                    {isDangWei ? '当位' : '不当位'}
                  </span>
                </div>
                <p className="text-amber-800 dark:text-yellow-200/90 font-medium mb-1">{yao.text}</p>
                {yao.xiangZhuan && (
                  <p className="text-amber-600 dark:text-yellow-500/70 text-sm italic">
                    《象》曰：{yao.xiangZhuan}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 时位属性 */}
      <div className="detail-section bg-white dark:bg-neutral-800 rounded-xl p-6 mb-6 
                    shadow-md border border-amber-200 dark:border-yellow-900/30
                    detail-card dark:hover:border-yellow-800/50"
           data-index={5}
           style={{ 
             opacity: visibleSections.has(5) ? 1 : 0,
             transform: visibleSections.has(5) ? 'translateY(0)' : 'translateY(20px)',
             transition: 'opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s'
           }}>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-6 h-6 text-amber-700 dark:text-yellow-500" />
          <h2 className="text-2xl font-bold text-amber-900 dark:text-yellow-100">时位属性</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-amber-50 dark:bg-yellow-500/5 rounded-lg p-4 
                        border border-amber-100 dark:border-yellow-800/30">
            <h3 className="font-bold text-amber-900 dark:text-yellow-100 mb-2">得中情况</h3>
            <p className="text-amber-700 dark:text-yellow-200/70">{gua.shiWei.zhong ? '有得中之爻' : '无得中之爻'}</p>
          </div>
          <div className="bg-amber-50 dark:bg-yellow-500/5 rounded-lg p-4
                        border border-amber-100 dark:border-yellow-800/30">
            <h3 className="font-bold text-amber-900 dark:text-yellow-100 mb-2">时位描述</h3>
            <p className="text-amber-700 dark:text-yellow-200/70">{gua.shiWei.description}</p>
          </div>
        </div>
      </div>

      {/* 卦变关系 */}
      <div className="detail-section bg-white dark:bg-neutral-800 rounded-xl p-6 mb-6 
                    shadow-md border border-amber-200 dark:border-yellow-900/30
                    detail-card dark:hover:border-yellow-800/50"
           data-index={6}
           style={{ 
             opacity: visibleSections.has(6) ? 1 : 0,
             transform: visibleSections.has(6) ? 'translateY(0)' : 'translateY(20px)',
             transition: 'opacity 0.5s ease 0.35s, transform 0.5s ease 0.35s'
           }}>
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-6 h-6 text-amber-700 dark:text-yellow-500" />
          <h2 className="text-2xl font-bold text-amber-900 dark:text-yellow-100">卦变关系</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 对卦 */}
          {duiGua && (
            <button
              onClick={() => handleGuaClick(duiGua)}
              className="guabian-card bg-gradient-to-br from-red-50 to-pink-50 
                       dark:from-red-950/30 dark:to-red-900/20
                       rounded-lg p-4 hover:shadow-lg transition-all duration-300 
                       border border-red-200 dark:border-red-800/30 text-left
                       hover:-translate-y-1 group"
            >
              <h3 className="font-bold text-red-900 dark:text-red-400 mb-2 group-hover:text-red-300">对卦（错卦）</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl text-amber-900 dark:text-yellow-100">{duiGua.chineseName}</span>
                <span className="text-red-600 dark:text-red-400">{duiGua.name}</span>
              </div>
              <p className="text-xs text-red-500 dark:text-red-500/70 mt-1">六爻全变</p>
            </button>
          )}
          
          {/* 综卦 */}
          {zongGua && (
            <button
              onClick={() => handleGuaClick(zongGua)}
              className="guabian-card bg-gradient-to-br from-blue-50 to-cyan-50 
                       dark:from-blue-950/30 dark:to-blue-900/20
                       rounded-lg p-4 hover:shadow-lg transition-all duration-300 
                       border border-blue-200 dark:border-blue-800/30 text-left
                       hover:-translate-y-1 group"
            >
              <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-2 group-hover:text-blue-300">综卦（覆卦）</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl text-amber-900 dark:text-yellow-100">{zongGua.chineseName}</span>
                <span className="text-blue-600 dark:text-blue-400">{zongGua.name}</span>
              </div>
              <p className="text-xs text-blue-500 dark:text-blue-500/70 mt-1">上下颠倒</p>
            </button>
          )}
          
          {/* 互卦 */}
          {huGua && (
            <button
              onClick={() => handleGuaClick(huGua)}
              className="guabian-card bg-gradient-to-br from-green-50 to-emerald-50 
                       dark:from-green-950/30 dark:to-green-900/20
                       rounded-lg p-4 hover:shadow-lg transition-all duration-300 
                       border border-green-200 dark:border-green-800/30 text-left
                       hover:-translate-y-1 group"
            >
              <h3 className="font-bold text-green-900 dark:text-green-400 mb-2 group-hover:text-green-300">互卦</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl text-amber-900 dark:text-yellow-100">{huGua.chineseName}</span>
                <span className="text-green-600 dark:text-green-400">{huGua.name}</span>
              </div>
              <p className="text-xs text-green-500 dark:text-green-500/70 mt-1">二三四五爻互成</p>
            </button>
          )}
        </div>
      </div>

      {/* 卦变 */}
      <div className="detail-section bg-white dark:bg-neutral-800 rounded-xl p-6 mb-6 
                    shadow-md border border-amber-200 dark:border-yellow-900/30
                    detail-card dark:hover:border-yellow-800/50"
           data-index={7}
           style={{ 
             opacity: visibleSections.has(7) ? 1 : 0,
             transform: visibleSections.has(7) ? 'translateY(0)' : 'translateY(20px)',
             transition: 'opacity 0.5s ease 0.4s, transform 0.5s ease 0.4s'
           }}>
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-6 h-6 text-amber-700 dark:text-yellow-500" />
          <h2 className="text-2xl font-bold text-amber-900 dark:text-yellow-100">卦变</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {gua.guaBian.map((id, idx) => {
            const bianGua = getGuaById(id);
            if (!bianGua) return null;
            return (
              <button
                key={id}
                onClick={() => handleGuaClick(bianGua)}
                className="px-4 py-2 bg-amber-100 dark:bg-amber-800/50 
                         hover:bg-amber-200 dark:hover:bg-amber-700/50
                         rounded-lg text-amber-800 dark:text-amber-200 
                         transition-all duration-200 hover:scale-105 hover:shadow-md"
                style={{
                  animation: 'fadeIn 0.3s ease-out forwards',
                  animationDelay: `${idx * 50}ms`,
                  opacity: 0
                }}
              >
                {bianGua.chineseName}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
