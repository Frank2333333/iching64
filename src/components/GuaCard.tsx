import type { Gua } from '../data/guaxiang';
import { getWuxingColor } from '../data/guaxiang';

interface GuaCardProps {
  gua: Gua;
  onClick: () => void;
}

export default function GuaCard({ gua, onClick }: GuaCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 border border-amber-200 hover:border-amber-400 hover:scale-105"
    >
      {/* 卦序 */}
      <div className="absolute top-2 left-2 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-amber-700">
        {gua.id}
      </div>
      
      {/* 五行标识 */}
      <div 
        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ backgroundColor: getWuxingColor(gua.wuxing) }}
      >
        {gua.wuxing}
      </div>

      {/* 卦画 */}
      <div className="flex flex-col items-center justify-center py-4 space-y-1">
        {gua.yaos.slice().reverse().map((yao, index) => (
          <div
            key={index}
            className={`h-2 rounded-full ${
              yao.yinYang === 'yang'
                ? 'w-12 bg-amber-800'
                : 'w-12 flex justify-between'
            }`}
          >
            {yao.yinYang === 'yin' && (
              <>
                <div className="w-5 h-2 bg-amber-800 rounded-full" />
                <div className="w-5 h-2 bg-amber-800 rounded-full" />
              </>
            )}
          </div>
        ))}
      </div>

      {/* 卦名 */}
      <div className="text-center mt-2">
        <h3 className="text-lg font-bold text-amber-900">{gua.chineseName}</h3>
        <p className="text-xs text-amber-600">{gua.name}</p>
        <p className="text-xs text-amber-500">{gua.pronunciation}</p>
      </div>

      {/* 上下卦 */}
      <div className="flex justify-center gap-2 mt-2 text-xs text-amber-500">
        <span>{gua.shangGua}上</span>
        <span>{gua.xiaGua}下</span>
      </div>
    </button>
  );
}
