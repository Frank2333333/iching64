import React, { useRef, useState } from 'react';
import type { Gua } from '../data/guaxiang';
import { getWuxingColor } from '../data/guaxiang';

interface GuaCardProps {
  gua: Gua;
  onClick: () => void;
  index?: number;
}

export default React.memo(function GuaCard({ gua, onClick, index = 0 }: GuaCardProps) {
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
      className={`group relative bg-white/90 dark:bg-neutral-800 
                 rounded-[28px] shadow-[0_24px_50px_-38px_rgba(107,74,58,0.42)] hover:shadow-[0_28px_58px_-36px_rgba(107,74,58,0.48)] 
                 transition-all duration-300 p-5 
                 border border-[#E9D8C8] dark:border-yellow-900/30 
                 hover:border-[#DABAA8] dark:hover:border-yellow-600/50
                 hover:-translate-y-0.5 hover:scale-[1.01]
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
      <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-[#C97C6D]/0 via-[#C97C6D]/0 to-[#C97C6D]/0 
                     group-hover:from-[#C97C6D]/6 group-hover:via-[#D8B38A]/0 group-hover:to-[#D8B38A]/14 
                     dark:group-hover:from-yellow-500/5 dark:group-hover:to-yellow-500/10
                     transition-all duration-500" />
      
      {/* 卦序 */}
      <div className="absolute left-3 top-3 h-7 w-7 bg-[#F6E9E0] dark:bg-yellow-500/20 
                     rounded-full flex items-center justify-center text-xs font-bold 
                     text-[#8A6658] dark:text-yellow-400 transition-colors">
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
      <div className="flex flex-col-reverse items-center justify-center py-5 space-y-1.5 space-y-reverse">
        {gua.yaos.map((yao, idx) => (
          <div
            key={yao.position}
            className={`h-2 rounded-full transition-all duration-300 group-hover:scale-105
                       ${yao.yinYang === 'yang'
                         ? 'w-12 bg-[#8E675A] dark:bg-yellow-500'
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
                <div className="w-5 h-2 bg-[#8E675A] dark:bg-yellow-500 rounded-full" />
                <div className="w-5 h-2 bg-[#8E675A] dark:bg-yellow-500 rounded-full" />
              </>
            )}
          </div>
        ))}
      </div>

      {/* 卦名 */}
      <div className="mt-3 text-center">
        <h3 className="text-lg font-bold text-[#4B3A33] dark:text-yellow-100 
                     group-hover:text-[#6B5549] dark:group-hover:text-yellow-300
                     transition-colors">
          {gua.chineseName}
        </h3>
        <p className="mt-1 text-xs text-[#8A6658] dark:text-neutral-400">{gua.name}</p>
        <p className="mt-0.5 text-xs text-[#C09789] dark:text-neutral-500">{gua.pronunciation}</p>
      </div>

      {/* 上下卦 */}
      <div className="mt-3 flex justify-center gap-2 text-xs text-[#B98F80] dark:text-neutral-500">
        <span>{gua.shangGua}上</span>
        <span>{gua.xiaGua}下</span>
      </div>

      {/* 底部渐变装饰线 */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r 
                     from-transparent via-[#C97C6D]/45 to-transparent 
                     dark:via-yellow-500/50
                     scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </button>
  );
});
