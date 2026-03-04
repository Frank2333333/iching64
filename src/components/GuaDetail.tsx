import { motion } from 'framer-motion';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  } as const;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Back Button */}
      <motion.button
        variants={itemVariants}
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors group"
        whileHover={{ x: -5 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>返回卦象列表</span>
      </motion.button>

      {/* Header Card */}
      <motion.div 
        variants={itemVariants}
        className="rounded-2xl p-8 mb-8 backdrop-blur-md bg-white/[0.03] border border-white/[0.08] relative overflow-hidden"
      >
        {/* 发光背景 */}
        <div 
          className="absolute top-0 right-0 w-96 h-96 opacity-30 blur-3xl -translate-y-1/2 translate-x-1/2"
          style={{
            background: `radial-gradient(circle, ${getWuxingColor(gua.wuxing).replace(')', ', 0.3)')}, transparent 70%)`,
          }}
        />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          {/* 卦画 */}
          <motion.div 
            className="flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="rounded-xl p-6 backdrop-blur-sm bg-white/5 border border-white/10">
              <div className="flex flex-col-reverse space-y-2 space-y-reverse">
                {gua.yaos.map((yao, i) => (
                  <motion.div
                    key={yao.position}
                    className={`h-3 rounded-full ${
                      yao.yinYang === 'yang'
                        ? 'w-24 bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                        : 'w-24 flex justify-between'
                    }`}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  >
                    {yao.yinYang === 'yin' && (
                      <>
                        <div className="w-9 h-3 rounded-full bg-slate-500" />
                        <div className="w-9 h-3 rounded-full bg-slate-500" />
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div 
              className="mt-4 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <span 
                className="inline-block px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-lg"
                style={{ 
                  backgroundColor: getWuxingColor(gua.wuxing),
                  boxShadow: `0 0 20px ${getWuxingColor(gua.wuxing).replace(')', ', 0.4)')}`
                }}
              >
                五行：{gua.wuxing}
              </span>
            </motion.div>
          </motion.div>

          {/* 基本信息 */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <motion.span 
                className="text-6xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {gua.chineseName}
              </motion.span>
              <div className="text-left">
                <p className="text-xl text-cyan-400">第 {gua.id} 卦</p>
                <p className="text-lg text-slate-300">{gua.name}</p>
                <p className="text-sm text-slate-500 font-mono">[{gua.pronunciation}]</p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
              <motion.div 
                className="rounded-lg px-4 py-2 backdrop-blur-sm bg-white/5 border border-white/10"
                whileHover={{ scale: 1.05, borderColor: 'rgba(34, 211, 238, 0.3)' }}
              >
                <span className="text-slate-400">上卦（外卦）：</span>
                <span className="font-bold text-cyan-300">{gua.shangGua} {baGua[gua.shangGua]?.symbol}</span>
              </motion.div>
              <motion.div 
                className="rounded-lg px-4 py-2 backdrop-blur-sm bg-white/5 border border-white/10"
                whileHover={{ scale: 1.05, borderColor: 'rgba(34, 211, 238, 0.3)' }}
              >
                <span className="text-slate-400">下卦（内卦）：</span>
                <span className="font-bold text-cyan-300">{gua.xiaGua} {baGua[gua.xiaGua]?.symbol}</span>
              </motion.div>
            </div>

            <p className="text-slate-300 text-lg leading-relaxed">{gua.meaning}</p>
          </div>
        </div>
      </motion.div>

      {/* 卦辞 */}
      <motion.div 
        variants={itemVariants}
        className="rounded-xl p-6 mb-6 backdrop-blur-md bg-white/[0.03] border border-white/[0.08]"
        whileHover={{ borderColor: 'rgba(34, 211, 238, 0.2)' }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <BookOpen className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">卦辞</h2>
        </div>
        <p className="text-xl text-slate-200 leading-relaxed font-medium">{gua.guaci}</p>
      </motion.div>

      {/* 彖传 */}
      <motion.div 
        variants={itemVariants}
        className="rounded-xl p-6 mb-6 backdrop-blur-md bg-white/[0.03] border border-white/[0.08]"
        whileHover={{ borderColor: 'rgba(34, 211, 238, 0.2)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Scale className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">彖传</h2>
        </div>
        <p className="text-slate-300 leading-relaxed">{gua.tuanZhuan}</p>
      </motion.div>

      {/* 大象传 */}
      <motion.div 
        variants={itemVariants}
        className="rounded-xl p-6 mb-6 backdrop-blur-md bg-white/[0.03] border border-white/[0.08]"
        whileHover={{ borderColor: 'rgba(34, 211, 238, 0.2)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Layers className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">大象传</h2>
        </div>
        <p className="text-slate-300 leading-relaxed">{gua.daXiangZhuan}</p>
      </motion.div>

      {/* 爻辞与小象传 */}
      <motion.div 
        variants={itemVariants}
        className="rounded-xl p-6 mb-6 backdrop-blur-md bg-white/[0.03] border border-white/[0.08]"
        whileHover={{ borderColor: 'rgba(34, 211, 238, 0.2)' }}
      >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <GitBranch className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">六爻</h2>
          </div>
          <div className="space-y-4">
            {gua.yaos.map((yao, index) => {
              const positionNames = ['初', '二', '三', '四', '五', '上'];
              const positionName = positionNames[yao.position - 1];
              const yaoName = yao.yinYang === 'yang' ? '九' : '六';
              const fullName = yao.position === 1 || yao.position === 6 
                ? `${positionName}${yaoName}` 
                : `${yaoName}${positionName}`;
              
              const isDangWei = yao.yinYang === 'yang' 
                ? yao.position % 2 === 1
                : yao.position % 2 === 0;
              
              return (
                <motion.div 
                  key={yao.position}
                  className={`p-4 rounded-xl border transition-colors ${
                    yao.yinYang === 'yang' 
                      ? 'bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-400/40' 
                      : 'bg-slate-500/5 border-slate-500/20 hover:border-slate-400/40'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-4 rounded-full ${yao.yinYang === 'yang' 
                      ? 'bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)]' 
                      : 'bg-slate-500'}`}>
                      {yao.yinYang === 'yin' && (
                        <div className="w-full h-full flex justify-center items-center">
                          <div className="w-2 h-2 bg-slate-800 rounded-full" />
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-white">{fullName}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isDangWei 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}>
                      {isDangWei ? '当位' : '不当位'}
                    </span>
                  </div>
                  <p className="text-slate-200 font-medium mb-1">{yao.text}</p>
                  {yao.xiangZhuan && (
                    <p className="text-slate-500 text-sm italic">《象》曰：{yao.xiangZhuan}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      {/* 时位属性 */}
      <motion.div 
        variants={itemVariants}
        className="rounded-xl p-6 mb-6 backdrop-blur-md bg-white/[0.03] border border-white/[0.08]"
        whileHover={{ borderColor: 'rgba(34, 211, 238, 0.2)' }}
      >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Target className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">时位属性</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div 
              className="rounded-lg p-4 backdrop-blur-sm bg-white/5 border border-white/10"
              whileHover={{ scale: 1.02, borderColor: 'rgba(34, 211, 238, 0.2)' }}
            >
              <h3 className="font-bold text-cyan-300 mb-2">得中情况</h3>
              <p className="text-slate-400">{gua.shiWei.zhong ? '有得中之爻' : '无得中之爻'}</p>
            </motion.div>
            <motion.div 
              className="rounded-lg p-4 backdrop-blur-sm bg-white/5 border border-white/10"
              whileHover={{ scale: 1.02, borderColor: 'rgba(34, 211, 238, 0.2)' }}
            >
              <h3 className="font-bold text-cyan-300 mb-2">时位描述</h3>
              <p className="text-slate-400">{gua.shiWei.description}</p>
            </motion.div>
          </div>
        </motion.div>

      {/* 卦变关系 */}
      <motion.div 
        variants={itemVariants}
        className="rounded-xl p-6 mb-6 backdrop-blur-md bg-white/[0.03] border border-white/[0.08]"
        whileHover={{ borderColor: 'rgba(34, 211, 238, 0.2)' }}
      >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-pink-500/10">
              <RefreshCw className="w-6 h-6 text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">卦变关系</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 对卦 */}
            {duiGua && (
              <motion.button
                onClick={() => onSelectGua(duiGua)}
                className="rounded-xl p-4 backdrop-blur-sm bg-gradient-to-br from-red-500/10 to-pink-500/10 
                         border border-red-500/20 text-left transition-colors hover:border-red-400/40"
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="font-bold text-red-300 mb-2">对卦（错卦）</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl text-white">{duiGua.chineseName}</span>
                  <span className="text-red-400">{duiGua.name}</span>
                </div>
                <p className="text-xs text-red-400/70 mt-1">六爻全变</p>
              </motion.button>
            )}
            
            {/* 综卦 */}
            {zongGua && (
              <motion.button
                onClick={() => onSelectGua(zongGua)}
                className="rounded-xl p-4 backdrop-blur-sm bg-gradient-to-br from-cyan-500/10 to-blue-500/10 
                         border border-cyan-500/20 text-left transition-colors hover:border-cyan-400/40"
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="font-bold text-cyan-300 mb-2">综卦（覆卦）</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl text-white">{zongGua.chineseName}</span>
                  <span className="text-cyan-400">{zongGua.name}</span>
                </div>
                <p className="text-xs text-cyan-400/70 mt-1">上下颠倒</p>
              </motion.button>
            )}
            
            {/* 互卦 */}
            {huGua && (
              <motion.button
                onClick={() => onSelectGua(huGua)}
                className="rounded-xl p-4 backdrop-blur-sm bg-gradient-to-br from-emerald-500/10 to-green-500/10 
                         border border-emerald-500/20 text-left transition-colors hover:border-emerald-400/40"
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="font-bold text-emerald-300 mb-2">互卦</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl text-white">{huGua.chineseName}</span>
                  <span className="text-emerald-400">{huGua.name}</span>
                </div>
                <p className="text-xs text-emerald-400/70 mt-1">二三四五爻互成</p>
              </motion.button>
            )}
          </div>
        </motion.div>

      {/* 卦变 */}
      <motion.div 
        variants={itemVariants}
        className="rounded-xl p-6 mb-6 backdrop-blur-md bg-white/[0.03] border border-white/[0.08]"
        whileHover={{ borderColor: 'rgba(34, 211, 238, 0.2)' }}
      >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <GitBranch className="w-6 h-6 text-violet-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">卦变</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {gua.guaBian.map((id, i) => {
              const bianGua = getGuaById(id);
              if (!bianGua) return null;
              return (
                <motion.button
                  key={id}
                  onClick={() => onSelectGua(bianGua!)}
                  className="px-4 py-2 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 
                           text-slate-300 transition-colors hover:bg-cyan-500/10 hover:border-cyan-400/30 hover:text-cyan-300"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {bianGua.chineseName}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
    </motion.div>
  );
}
