import { useRef, useState } from 'react';
import type { Gua } from '../data/guaxiang';
import { getWuxingColor } from '../data/guaxiang';

interface GuaCardProps {
  gua: Gua;
  onClick: () => void;
  index?: number;
}

export default function GuaCard({ gua, onClick, index = 0 }: GuaCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // 创建波纹效果
  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = cardRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);

    // 动画结束后移除波纹
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    // 延迟执行点击事件，让波纹动画先显示
    setTimeout(onClick, 150);
  };

  return (
    <button
      ref={cardRef}
      onClick={handleClick}
      className={`group relative bg-white dark:bg-neutral-800 
                 rounded-xl shadow-md hover:shadow-xl 
                 transition-all duration-300 p-4 
                 border border-amber-200 dark:border-yellow-900/30 
                 hover:border-amber-400 dark:hover:border-yellow-600/50
                 hover:-translate-y-1 hover:scale-[1.02]
                 active:scale-[0.98] active:duration-100
                 card-stagger overflow-hidden
                 dark:text-neutral-100`}
      style={{ animationDelay: `${index * 20}ms` }}
    >
      {/* 波纹效果 */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 100,
            height: 100,
            marginLeft: -50,
            marginTop: -50,
          }}
        />
      ))}

      {/* 悬停光效 */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 via-amber-400/0 to-amber-400/0 
                     group-hover:from-amber-400/5 group-hover:via-amber-400/0 group-hover:to-amber-400/10 
                     dark:group-hover:from-yellow-500/5 dark:group-hover:to-yellow-500/10
                     transition-all duration-500 rounded-xl" />
      
      {/* 卦序 */}
      <div className="absolute top-2 left-2 w-6 h-6 bg-amber-100 dark:bg-yellow-500/20 
                     rounded-full flex items-center justify-center text-xs font-bold 
                     text-amber-700 dark:text-yellow-400 transition-colors">
        {gua.id}
      </div>
      
      {/* 五行标识 */}
      <div 
        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center 
                 text-xs font-bold text-white shadow-sm"
        style={{ backgroundColor: getWuxingColor(gua.wuxing) }}
      >
        {gua.wuxing}
      </div>

      {/* 卦画 - 初爻在下，上爻在上 */}
      <div className="flex flex-col-reverse items-center justify-center py-4 space-y-1 space-y-reverse">
        {gua.yaos.map((yao, idx) => (
          <div
            key={yao.position}
            className={`h-2 rounded-full transition-all duration-300 group-hover:scale-105
                       ${yao.yinYang === 'yang'
                         ? 'w-12 bg-amber-800 dark:bg-yellow-500'
                         : 'w-12 flex justify-between'
                       }`}
            style={{ 
              transitionDelay: `${idx * 30}ms`,
              opacity: 0,
              animation: `yaoDraw 0.4s ease-out forwards`,
              animationDelay: `${index * 20 + idx * 50}ms`
            }}
          >
            {yao.yinYang === 'yin' && (
              <>
                <div className="w-5 h-2 bg-amber-800 dark:bg-yellow-500 rounded-full" />
                <div className="w-5 h-2 bg-amber-800 dark:bg-yellow-500 rounded-full" />
              </>
            )}
          </div>
        ))}
      </div>

      {/* 卦名 */}
      <div className="text-center mt-2">
        <h3 className="text-lg font-bold text-amber-900 dark:text-yellow-100 
                     group-hover:text-amber-700 dark:group-hover:text-yellow-300
                     transition-colors">
          {gua.chineseName}
        </h3>
        <p className="text-xs text-amber-600 dark:text-neutral-400">{gua.name}</p>
        <p className="text-xs text-amber-500 dark:text-neutral-500">{gua.pronunciation}</p>
      </div>

      {/* 上下卦 */}
      <div className="flex justify-center gap-2 mt-2 text-xs text-amber-500 dark:text-neutral-500">
        <span>{gua.shangGua}上</span>
        <span>{gua.xiaGua}下</span>
      </div>

      {/* 底部渐变装饰线 */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r 
                     from-transparent via-amber-400/50 to-transparent 
                     dark:via-yellow-500/50
                     scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </button>
  );
}
