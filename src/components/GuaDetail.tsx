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

  return (
    <div className="animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回卦象列表</span>
      </button>

      {/* Header Card */}
      <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-8 mb-8 shadow-lg border border-amber-200">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* 卦画 */}
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-xl p-6 shadow-inner">
              <div className="flex flex-col-reverse space-y-2 space-y-reverse">
                {gua.yaos.map((yao) => (
                  <div
                    key={yao.position}
                    className={`h-3 rounded-full ${
                      yao.yinYang === 'yang'
                        ? 'w-20 bg-amber-800'
                        : 'w-20 flex justify-between'
                    }`}
                  >
                    {yao.yinYang === 'yin' && (
                      <>
                        <div className="w-8 h-3 bg-amber-800 rounded-full" />
                        <div className="w-8 h-3 bg-amber-800 rounded-full" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 text-center">
              <span 
                className="inline-block px-3 py-1 rounded-full text-white text-sm font-bold"
                style={{ backgroundColor: getWuxingColor(gua.wuxing) }}
              >
                五行：{gua.wuxing}
              </span>
            </div>
          </div>

          {/* 基本信息 */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <span className="text-6xl font-bold text-amber-900">{gua.chineseName}</span>
              <div className="text-left">
                <p className="text-xl text-amber-700">第 {gua.id} 卦</p>
                <p className="text-lg text-amber-600">{gua.name}</p>
                <p className="text-sm text-amber-500">[{gua.pronunciation}]</p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
              <div className="bg-white/70 rounded-lg px-4 py-2">
                <span className="text-amber-600">上卦（外卦）：</span>
                <span className="font-bold text-amber-900">{gua.shangGua} {baGua[gua.shangGua]?.symbol}</span>
              </div>
              <div className="bg-white/70 rounded-lg px-4 py-2">
                <span className="text-amber-600">下卦（内卦）：</span>
                <span className="font-bold text-amber-900">{gua.xiaGua} {baGua[gua.xiaGua]?.symbol}</span>
              </div>
            </div>

            <p className="text-amber-800 text-lg leading-relaxed">{gua.meaning}</p>
          </div>
        </div>
      </div>

      {/* 卦辞 */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-md border border-amber-200">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-6 h-6 text-amber-700" />
          <h2 className="text-2xl font-bold text-amber-900">卦辞</h2>
        </div>
        <p className="text-xl text-amber-800 leading-relaxed font-medium">{gua.guaci}</p>
      </div>

      {/* 彖传 */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-md border border-amber-200">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-6 h-6 text-amber-700" />
          <h2 className="text-2xl font-bold text-amber-900">彖传</h2>
        </div>
        <p className="text-amber-800 leading-relaxed">{gua.tuanZhuan}</p>
      </div>

      {/* 大象传 */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-md border border-amber-200">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-6 h-6 text-amber-700" />
          <h2 className="text-2xl font-bold text-amber-900">大象传</h2>
        </div>
        <p className="text-amber-800 leading-relaxed">{gua.daXiangZhuan}</p>
      </div>

      {/* 爻辞与小象传 */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-md border border-amber-200">
        <div className="flex items-center gap-2 mb-6">
          <GitBranch className="w-6 h-6 text-amber-700" />
          <h2 className="text-2xl font-bold text-amber-900">六爻</h2>
        </div>
        <div className="space-y-4">
          {gua.yaos.map((yao) => {
            const positionNames = ['初', '二', '三', '四', '五', '上'];
            const positionName = positionNames[yao.position - 1];
            const yaoName = yao.yinYang === 'yang' ? '九' : '六';
            const fullName = yao.position === 1 || yao.position === 6 
              ? `${positionName}${yaoName}` 
              : `${yaoName}${positionName}`;
            
            // 当位判断：阳爻在奇数位(1,3,5)当位，阴爻在偶数位(2,4,6)当位
            const isDangWei = yao.yinYang === 'yang' 
              ? yao.position % 2 === 1  // 阳爻在奇数位当位
              : yao.position % 2 === 0; // 阴爻在偶数位当位
            
            return (
              <div 
                key={yao.position} 
                className={`p-4 rounded-lg border ${
                  yao.yinYang === 'yang' 
                    ? 'bg-amber-50 border-amber-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-4 rounded-full ${yao.yinYang === 'yang' ? 'bg-amber-800' : 'bg-gray-600'}`}>
                    {yao.yinYang === 'yin' && (
                      <div className="w-full h-full flex justify-center items-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-amber-900">{fullName}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    isDangWei 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isDangWei ? '当位' : '不当位'}
                  </span>
                </div>
                <p className="text-amber-800 font-medium mb-1">{yao.text}</p>
                {yao.xiangZhuan && (
                  <p className="text-amber-600 text-sm italic">《象》曰：{yao.xiangZhuan}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 时位属性 */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-md border border-amber-200">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-6 h-6 text-amber-700" />
          <h2 className="text-2xl font-bold text-amber-900">时位属性</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-amber-50 rounded-lg p-4">
            <h3 className="font-bold text-amber-900 mb-2">得中情况</h3>
            <p className="text-amber-700">{gua.shiWei.zhong ? '有得中之爻' : '无得中之爻'}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <h3 className="font-bold text-amber-900 mb-2">时位描述</h3>
            <p className="text-amber-700">{gua.shiWei.description}</p>
          </div>
        </div>
      </div>

      {/* 卦变关系 */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-md border border-amber-200">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-6 h-6 text-amber-700" />
          <h2 className="text-2xl font-bold text-amber-900">卦变关系</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 对卦 */}
          {duiGua && (
            <button
              onClick={() => onSelectGua(duiGua)}
              className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-red-200 text-left"
            >
              <h3 className="font-bold text-red-900 mb-2">对卦（错卦）</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{duiGua.chineseName}</span>
                <span className="text-red-600">{duiGua.name}</span>
              </div>
              <p className="text-xs text-red-500 mt-1">六爻全变</p>
            </button>
          )}
          
          {/* 综卦 */}
          {zongGua && (
            <button
              onClick={() => onSelectGua(zongGua)}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-blue-200 text-left"
            >
              <h3 className="font-bold text-blue-900 mb-2">综卦（覆卦）</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{zongGua.chineseName}</span>
                <span className="text-blue-600">{zongGua.name}</span>
              </div>
              <p className="text-xs text-blue-500 mt-1">上下颠倒</p>
            </button>
          )}
          
          {/* 互卦 */}
          {huGua && (
            <button
              onClick={() => onSelectGua(huGua)}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-green-200 text-left"
            >
              <h3 className="font-bold text-green-900 mb-2">互卦</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{huGua.chineseName}</span>
                <span className="text-green-600">{huGua.name}</span>
              </div>
              <p className="text-xs text-green-500 mt-1">二三四五爻互成</p>
            </button>
          )}
        </div>
      </div>

      {/* 卦变 */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-md border border-amber-200">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-6 h-6 text-amber-700" />
          <h2 className="text-2xl font-bold text-amber-900">卦变</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {gua.guaBian.map((id) => {
            const bianGua = getGuaById(id);
            if (!bianGua) return null;
            return (
              <button
                key={id}
                onClick={() => onSelectGua(bianGua!)}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 rounded-lg text-amber-800 transition-colors"
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
