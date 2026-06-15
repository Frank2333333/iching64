import type { Gua } from '../../data/guaxiang';
import { getYaoFullName } from '../../lib/meihua-divination';

interface QuestionScene {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface GuaDetailViewProps {
  gua: Gua;
  dongYao: { position: number; yinYang: 'yin' | 'yang' } | null;
  selectedScene?: QuestionScene | null;
}

export default function GuaDetailView({ gua, dongYao, selectedScene }: GuaDetailViewProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {selectedScene && (
        <div className={`p-4 rounded-xl border-2 ${selectedScene.bgColor}`}>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg bg-white/80 dark:bg-neutral-800/80 ${selectedScene.color} mr-3`}>
              {selectedScene.icon}
            </div>
            <div>
              <p className="text-sm text-[#8A6658] dark:text-yellow-500">问事场景</p>
              <h3 className={`font-bold text-lg ${selectedScene.color}`}>{selectedScene.name}</h3>
            </div>
          </div>
        </div>
      )}

      {/* 卦象头部 */}
      <div className="bg-gradient-to-br from-[#F7EFE8] to-[#EEDFD1]
                   dark:from-neutral-800 dark:to-neutral-900
                   rounded-2xl p-8 shadow-lg border border-[#E9D8C8] dark:border-yellow-900/30">
        <div className="flex flex-col md:flex-row items-center gap-8">
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
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-bold text-[#4B3A33] dark:text-amber-100 mb-2">
              {gua.chineseName}
            </h2>
            <p className="text-xl text-[#6B5549] dark:text-amber-300">{gua.name}</p>
            <p className="text-[#8A6658] dark:text-amber-400">[{gua.pronunciation}]</p>
          </div>
        </div>
      </div>

      {/* 卦辞、彖传、大象传 */}
      <div className="bg-[#FFFDFC] dark:bg-amber-900/20 rounded-xl p-6 shadow-md
                   border border-[#E9D8C8] dark:border-amber-800/30">
        <h3 className="text-xl font-bold text-[#4B3A33] dark:text-amber-100 mb-4">卦辞</h3>
        <p className="text-lg text-[#5A463E] dark:text-amber-200">{gua.guaci}</p>
      </div>

      <div className="bg-[#FFFDFC] dark:bg-amber-900/20 rounded-xl p-6 shadow-md
                   border border-[#E9D8C8] dark:border-amber-800/30">
        <h3 className="text-xl font-bold text-[#4B3A33] dark:text-amber-100 mb-4">彖传</h3>
        <p className="text-[#5A463E] dark:text-amber-200 leading-relaxed">{gua.tuanZhuan}</p>
      </div>

      <div className="bg-[#FFFDFC] dark:bg-amber-900/20 rounded-xl p-6 shadow-md
                   border border-[#E9D8C8] dark:border-amber-800/30">
        <h3 className="text-xl font-bold text-[#4B3A33] dark:text-amber-100 mb-4">大象传</h3>
        <p className="text-[#5A463E] dark:text-amber-200 leading-relaxed">{gua.daXiangZhuan}</p>
      </div>

      {/* 六爻 */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-md
                   border border-[#E9D8C8] dark:border-yellow-900/30">
        <h3 className="text-xl font-bold text-[#4B3A33] dark:text-yellow-100 mb-6">六爻</h3>
        <div className="space-y-4">
          {gua.yaos.map((yao) => {
            const fullName = getYaoFullName(yao, yao.position);
            const isDongYao = dongYao?.position === yao.position;

            return (
              <div
                key={yao.position}
                className={`p-4 rounded-lg border transition-all duration-200
                         ${isDongYao
                           ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800/30 ring-2 ring-red-200 dark:ring-red-900/20'
                           : yao.yinYang === 'yang'
                             ? 'bg-[#FFF8F3] dark:bg-yellow-500/5 border-[#E9D8C8] dark:border-yellow-800/30'
                             : 'bg-gray-50 dark:bg-neutral-700/30 border-gray-200 dark:border-neutral-600/30'
                         }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-[#4B3A33] dark:text-yellow-100">{fullName}</span>
                  {isDongYao && (
                    <span className="text-xs px-2 py-1 bg-red-500 dark:bg-red-600 text-white rounded-full font-medium">
                      动爻
                    </span>
                  )}
                </div>
                <p className="text-[#5A463E] dark:text-yellow-200/90 font-medium">{yao.text}</p>
                {yao.xiangZhuan && (
                  <p className="text-[#8A6658] dark:text-yellow-500/70 text-sm italic mt-1">
                    《象》曰：{yao.xiangZhuan}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
