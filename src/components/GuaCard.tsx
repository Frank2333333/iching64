import { motion } from 'framer-motion';
import type { Gua } from '../data/guaxiang';
import { getWuxingColor } from '../data/guaxiang';

interface GuaCardProps {
  gua: Gua;
  onClick: () => void;
  index?: number;
}

export default function GuaCard({ gua, onClick, index = 0 }: GuaCardProps) {
  // 根据五行获取发光颜色
  const getWuxingGlow = (wuxing: string) => {
    const colors: Record<string, string> = {
      '金': 'rgba(251, 191, 36, 0.5)',  // 金色
      '木': 'rgba(34, 197, 94, 0.5)',    // 绿色
      '水': 'rgba(34, 211, 238, 0.5)',   // 青色 (冰蓝)
      '火': 'rgba(239, 68, 68, 0.5)',    // 红色
      '土': 'rgba(168, 162, 158, 0.5)',  // 灰色
    };
    return colors[wuxing] || 'rgba(34, 211, 238, 0.5)';
  };

  const glowColor = getWuxingGlow(gua.wuxing);

  return (
    <motion.button
      onClick={onClick}
      className="group relative p-5 rounded-2xl backdrop-blur-md 
                 bg-white/[0.03] border border-white/[0.08]
                 transition-all duration-500 overflow-hidden
                 hover:border-cyan-400/30"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.03,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        scale: 1.03,
        y: -5,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* 悬停时的发光背景 */}
      <motion.div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${glowColor.replace('0.5', '0.15')}, transparent 70%)`,
        }}
      />
      
      {/* 顶部渐变线 */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        whileHover={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      />

      {/* 卦序 */}
      <div className="absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                      bg-white/5 text-slate-400 border border-white/10 group-hover:text-cyan-300 group-hover:border-cyan-400/30 transition-colors">
        {gua.id}
      </div>
      
      {/* 五行标识 */}
      <motion.div 
        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
        style={{ backgroundColor: getWuxingColor(gua.wuxing) }}
        whileHover={{ scale: 1.2, rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        {gua.wuxing}
      </motion.div>

      {/* 卦画 - 初爻在下，上爻在上 */}
      <div className="flex flex-col-reverse items-center justify-center py-5 space-y-1.5 space-y-reverse">
        {gua.yaos.map((yao, i) => (
          <motion.div
            key={yao.position}
            className={`rounded-full transition-all duration-300 ${
              yao.yinYang === 'yang'
                ? 'w-14 h-2 bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.6)]'
                : 'w-14 flex justify-between'
            }`}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.03 + i * 0.05,
              ease: 'easeOut'
            }}
            whileHover={yao.yinYang === 'yang' ? {
              boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor.replace('0.5', '0.3')}`,
            } : {}}
          >
            {yao.yinYang === 'yin' && (
              <>
                <motion.div 
                  className="w-5 h-2 rounded-full bg-slate-500 group-hover:bg-slate-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                />
                <motion.div 
                  className="w-5 h-2 rounded-full bg-slate-500 group-hover:bg-slate-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                />
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* 卦名 */}
      <div className="text-center mt-3">
        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors drop-shadow-lg">
          {gua.chineseName}
        </h3>
        <p className="text-xs text-slate-400 mt-1 group-hover:text-slate-300 transition-colors">
          {gua.name}
        </p>
        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
          {gua.pronunciation}
        </p>
      </div>

      {/* 上下卦 */}
      <div className="flex justify-center gap-2 mt-3 text-[10px] text-slate-500">
        <span className="px-2 py-0.5 rounded-full bg-white/5 group-hover:bg-cyan-400/10 group-hover:text-cyan-300 transition-colors">
          {gua.shangGua}上
        </span>
        <span className="px-2 py-0.5 rounded-full bg-white/5 group-hover:bg-cyan-400/10 group-hover:text-cyan-300 transition-colors">
          {gua.xiaGua}下
        </span>
      </div>
    </motion.button>
  );
}
