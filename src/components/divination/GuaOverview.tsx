import { getWuxingColor } from '../../data/guaxiang';
import type { Gua } from '../../data/guaxiang';
import type { DivinationResult } from '../../lib/meihua-divination';

interface GuaOverviewProps {
  gua: Gua;
  dongYao: DivinationResult['dongYao'];
}

export default function GuaOverview({ gua, dongYao }: GuaOverviewProps) {
  return (
    <div className="bg-gradient-to-br from-[#F7EFE8] to-[#EEDFD1]
                 dark:from-neutral-800 dark:to-neutral-900
                 rounded-2xl p-6 shadow-lg border border-[#E9D8C8] dark:border-yellow-900/30">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* 卦画 */}
        <div className="bg-[#FFFDFC] dark:bg-amber-950/50 rounded-xl p-6 shadow-inner">
          <div className="flex flex-col-reverse space-y-1 space-y-reverse">
            {gua.yaos.map((yao, idx) => {
              const isDongYao = dongYao?.position === yao.position;
              return (
                <div
                  key={yao.position}
                  className={`h-3 rounded-full transition-all duration-500
                            ${yao.yinYang === 'yang'
                              ? `w-20 ${isDongYao ? 'bg-red-500' : 'bg-[#8C6B57] dark:bg-amber-400'}`
                              : 'w-20 flex justify-between'
                            }`}
                  style={{
                    animation: `yaoDraw 0.5s ease-out forwards`,
                    animationDelay: `${idx * 80}ms`
                  }}
                >
                  {yao.yinYang === 'yin' && (
                    <>
                      <div className={`w-8 h-3 rounded-full ${isDongYao ? 'bg-red-500' : 'bg-[#8C6B57] dark:bg-amber-400'}`} />
                      <div className={`w-8 h-3 rounded-full ${isDongYao ? 'bg-red-500' : 'bg-[#8C6B57] dark:bg-amber-400'}`} />
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
              动爻：{dongYao?.name}
            </span>
          </div>
        </div>

        {/* 卦名信息 */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
            <span className="text-5xl font-bold text-[#4B3A33] dark:text-yellow-100
                           dark:drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              {gua.chineseName}
            </span>
            <div className="text-left">
              <p className="text-xl text-[#6B5549] dark:text-yellow-500">第 {gua.id} 卦</p>
              <p className="text-lg text-[#8A6658] dark:text-yellow-200/70">{gua.name}</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
            <span
              className="inline-block px-3 py-1 rounded-full text-white text-sm font-bold shadow-md"
              style={{ backgroundColor: getWuxingColor(gua.wuxing) }}
            >
              五行：{gua.wuxing}
            </span>
          </div>
          <p className="text-[#5A463E] dark:text-yellow-200/80">{gua.meaning}</p>
        </div>
      </div>
    </div>
  );
}
