import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { liuShiSiGua, type Gua, baGua } from '../data/guaxiang';
import { Calculator, ArrowLeft, Sparkles, BookOpen } from 'lucide-react';
import BackgroundEffects from '../components/animations/BackgroundEffects';
import { FadeIn, FadeInOnScroll } from '../components/animations/FadeIn';

interface DivinationResult {
  shangGuaNum: number;
  xiaGuaNum: number;
  dongYaoNum: number;
  shangGuaName: string;
  xiaGuaName: string;
  gua: Gua | null;
  dongYao: {
    position: number;
    name: string;
    text: string;
    xiangZhuan?: string;
    yinYang: 'yin' | 'yang';
  } | null;
}

const baGuaMap: Record<number, string> = {
  1: '乾',
  2: '兑',
  3: '离',
  4: '震',
  5: '巽',
  6: '坎',
  7: '艮',
  8: '坤',
};

const yaoPositionNames = ['初', '二', '三', '四', '五', '上'];

export default function Divination() {
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [num3, setNum3] = useState('');
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [showGuaDetail, setShowGuaDetail] = useState(false);

  const handleCalculate = () => {
    const n1 = parseInt(num1);
    const n2 = parseInt(num2);
    const n3 = parseInt(num3);

    if (isNaN(n1) || isNaN(n2) || isNaN(n3)) {
      alert('请输入有效的三位数字');
      return;
    }

    const xiaRemainder = n1 % 8;
    const xiaGuaNum = xiaRemainder === 0 ? 8 : xiaRemainder;
    const xiaGuaName = baGuaMap[xiaGuaNum];

    const shangRemainder = n2 % 8;
    const shangGuaNum = shangRemainder === 0 ? 8 : shangRemainder;
    const shangGuaName = baGuaMap[shangGuaNum];

    const yaoRemainder = n3 % 6;
    const dongYaoNum = yaoRemainder === 0 ? 6 : yaoRemainder;

    const gua = liuShiSiGua.find(
      g => g.shangGua === shangGuaName && g.xiaGua === xiaGuaName
    ) || null;

    let dongYao = null;
    if (gua) {
      const yao = gua.yaos[dongYaoNum - 1];
      const yaoName = yao.yinYang === 'yang' ? '九' : '六';
      const positionName = yaoPositionNames[dongYaoNum - 1];
      const fullName = dongYaoNum === 1 || dongYaoNum === 6
        ? `${positionName}${yaoName}`
        : `${yaoName}${positionName}`;

      dongYao = {
        position: dongYaoNum,
        name: fullName,
        text: yao.text,
        xiangZhuan: yao.xiangZhuan,
        yinYang: yao.yinYang,
      };
    }

    setResult({
      shangGuaNum,
      xiaGuaNum,
      dongYaoNum,
      shangGuaName,
      xiaGuaName,
      gua,
      dongYao,
    });
  };

  const getWuxingColor = (wuxing: string) => {
    const colors: Record<string, string> = {
      '金': '#FFD700',
      '木': '#228B22',
      '水': '#1E90FF',
      '火': '#FF4500',
      '土': '#8B4513',
    };
    return colors[wuxing] || '#666';
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Calculator className="w-8 h-8 text-cyan-400" />
              <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                数字起卦
              </h1>
            </div>
            <motion.a
              href="/"
              className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回卦象列表</span>
            </motion.a>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {!showGuaDetail ? (
            <motion.div
              key="divination"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 说明卡片 */}
              <FadeIn delay={0.2}>
                <div className="rounded-2xl p-6 mb-8 backdrop-blur-md bg-white/[0.03] border border-white/[0.08]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <Sparkles className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">数字起卦说明</h2>
                  </div>
                  <div className="space-y-2 text-slate-400">
                    <p>1. 输入三个三位数字</p>
                    <p>2. 第一个数字 ÷ 8 取余数 → 下卦（1乾、2兑、3离、4震、5巽、6坎、7艮、8坤）</p>
                    <p>3. 第二个数字 ÷ 8 取余数 → 上卦（同上）</p>
                    <p>4. 第三个数字 ÷ 6 取余数 → 动爻（1初爻、2二爻、3三爻、4四爻、5五爻、6上爻）</p>
                  </div>
                </div>
              </FadeIn>

              {/* 输入表单 */}
              <FadeIn delay={0.3}>
                <div className="rounded-2xl p-8 mb-8 backdrop-blur-md bg-white/[0.03] border border-white/[0.08]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {[
                      { value: num1, setValue: setNum1, label: '第一个数字（下卦）' },
                      { value: num2, setValue: setNum2, label: '第二个数字（上卦）' },
                      { value: num3, setValue: setNum3, label: '第三个数字（动爻）' },
                    ].map((input, i) => (
                      <motion.div key={i}>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                          {input.label}
                        </label>
                        <input
                          type="number"
                          value={input.value}
                          onChange={(e) => input.setValue(e.target.value)}
                          placeholder="输入三位数字"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                                   text-white placeholder-slate-600 focus:outline-none 
                                   focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/30
                                   transition-all"
                        />
                      </motion.div>
                    ))}
                  </div>
                  <motion.button
                    onClick={handleCalculate}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 
                             text-cyan-300 font-bold rounded-xl border border-cyan-400/30
                             hover:from-cyan-500/30 hover:to-purple-500/30 transition-all"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34, 211, 238, 0.2)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    开始起卦
                  </motion.button>
                </div>
              </FadeIn>

              {/* 结果显示 */}
              <AnimatePresence>
                {result && (
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                  >
                    {/* 起卦过程 */}
                    <div className="rounded-2xl p-6 backdrop-blur-md bg-white/[0.03] border border-white/[0.08]">
                      <h3 className="text-lg font-bold text-white mb-4">起卦过程</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        {[
                          { label: '下卦计算', value: `${num1} ÷ 8 = 余${result.xiaGuaNum}`, result: `${result.xiaGuaName} ${baGua[result.xiaGuaName]?.symbol}`, color: 'cyan' },
                          { label: '上卦计算', value: `${num2} ÷ 8 = 余${result.shangGuaNum}`, result: `${result.shangGuaName} ${baGua[result.shangGuaName]?.symbol}`, color: 'purple' },
                          { label: '动爻计算', value: `${num3} ÷ 6 = 余${result.dongYaoNum}`, result: `第${result.dongYaoNum}爻`, color: 'emerald' },
                        ].map((item, i) => (
                          <motion.div 
                            key={i}
                            className="rounded-xl p-4 backdrop-blur-sm bg-white/5 border border-white/10"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.05, borderColor: `rgba(34, 211, 238, 0.3)` }}
                          >
                            <p className={`text-sm text-${item.color}-400 mb-1`}>{item.label}</p>
                            <p className="text-lg font-mono text-slate-200">{item.value}</p>
                            <p className={`text-xl font-bold text-${item.color}-300 mt-2`}>{item.result}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {result.gua && (
                      <>
                        {/* 卦象信息 */}
                        <motion.div 
                          className="rounded-2xl p-6 backdrop-blur-md bg-white/[0.03] border border-white/[0.08] relative overflow-hidden"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div 
                            className="absolute top-0 right-0 w-64 h-64 opacity-30 blur-3xl -translate-y-1/2 translate-x-1/2"
                            style={{
                              background: `radial-gradient(circle, ${getWuxingColor(result.gua.wuxing).replace(')', ', 0.3)')}, transparent 70%)`,
                            }}
                          />
                          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                            {/* 卦画 */}
                            <div className="rounded-xl p-6 backdrop-blur-sm bg-white/5 border border-white/10">
                              <div className="flex flex-col-reverse space-y-1 space-y-reverse">
                                {result.gua.yaos.map((yao) => (
                                  <div
                                    key={yao.position}
                                    className={`h-3 rounded-full ${
                                      yao.yinYang === 'yang'
                                        ? 'w-20 bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                                        : 'w-20 flex justify-between'
                                    }`}
                                  >
                                    {yao.yinYang === 'yin' && (
                                      <>
                                        <div className="w-8 h-3 bg-slate-500 rounded-full" />
                                        <div className="w-8 h-3 bg-slate-500 rounded-full" />
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {/* 动爻标记 */}
                              <div className="mt-4 text-center">
                                <motion.span 
                                  className="inline-block px-3 py-1 bg-red-500/20 text-red-300 text-sm font-bold rounded-full border border-red-500/30"
                                  animate={{ 
                                    boxShadow: [
                                      '0 0 10px rgba(239, 68, 68, 0.2)',
                                      '0 0 20px rgba(239, 68, 68, 0.4)',
                                      '0 0 10px rgba(239, 68, 68, 0.2)',
                                    ]
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  动爻：{result.dongYao?.name}
                                </motion.span>
                              </div>
                            </div>

                            {/* 卦名信息 */}
                            <div className="flex-1 text-center md:text-left">
                              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                                <span className="text-5xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                                  {result.gua.chineseName}
                                </span>
                                <div className="text-left">
                                  <p className="text-xl text-cyan-400">第 {result.gua.id} 卦</p>
                                  <p className="text-lg text-slate-300">{result.gua.name}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                                <span 
                                  className="inline-block px-3 py-1 rounded-full text-white text-sm font-bold"
                                  style={{ 
                                    backgroundColor: getWuxingColor(result.gua.wuxing),
                                    boxShadow: `0 0 15px ${getWuxingColor(result.gua.wuxing).replace(')', ', 0.4)')}`
                                  }}
                                >
                                  五行：{result.gua.wuxing}
                                </span>
                              </div>
                              <p className="text-slate-400">{result.gua.meaning}</p>
                            </div>
                          </div>
                        </motion.div>

                        {/* 动爻详情 */}
                        {result.dongYao && (
                          <motion.div 
                            className="rounded-2xl p-6 backdrop-blur-md bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 rounded-lg bg-red-500/20">
                                <Sparkles className="w-6 h-6 text-red-400" />
                              </div>
                              <h3 className="text-xl font-bold text-red-300">动爻详解</h3>
                            </div>
                            <div className={`p-4 rounded-xl border ${
                              result.dongYao.yinYang === 'yang'
                                ? 'bg-cyan-500/5 border-cyan-500/20'
                                : 'bg-slate-500/5 border-slate-500/20'
                            }`}>
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl font-bold text-white">{result.dongYao.name}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  result.dongYao.yinYang === 'yang'
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                    : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                                }`}>
                                  {result.dongYao.yinYang === 'yang' ? '阳爻' : '阴爻'}
                                </span>
                              </div>
                              <p className="text-lg text-slate-200 font-medium mb-2">{result.dongYao.text}</p>
                              {result.dongYao.xiangZhuan && (
                                <p className="text-slate-500 italic">《象》曰：{result.dongYao.xiangZhuan}</p>
                              )}
                            </div>
                          </motion.div>
                        )}

                        {/* 卦辞 */}
                        <motion.div 
                          className="rounded-2xl p-6 backdrop-blur-md bg-white/[0.03] border border-white/[0.08]"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-cyan-500/10">
                              <BookOpen className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">卦辞</h3>
                          </div>
                          <p className="text-lg text-slate-200 leading-relaxed">{result.gua.guaci}</p>
                        </motion.div>

                        {/* 查看完整卦象按钮 */}
                        <motion.button
                          onClick={() => setShowGuaDetail(true)}
                          className="w-full py-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 
                                   text-cyan-300 font-bold rounded-xl border border-cyan-400/30
                                   hover:from-cyan-500/30 hover:to-purple-500/30 transition-all"
                          whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34, 211, 238, 0.2)' }}
                          whileTap={{ scale: 0.98 }}
                        >
                          查看完整卦象详情
                        </motion.button>
                      </>
                    )}

                    {!result.gua && (
                      <motion.div 
                        className="rounded-2xl p-6 text-center backdrop-blur-md bg-red-500/10 border border-red-500/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <p className="text-red-400">未找到对应的卦象，请检查输入的数字</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* 完整卦象详情 */
            <motion.div 
              key="detail"
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <motion.button
                onClick={() => setShowGuaDetail(false)}
                className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
                whileHover={{ x: -5 }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回起卦结果</span>
              </motion.button>

              {result?.gua && (
                <>
                  {/* 卦象头部 */}
                  <div className="rounded-2xl p-8 backdrop-blur-md bg-white/[0.03] border border-white/[0.08]">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="rounded-xl p-6 backdrop-blur-sm bg-white/5 border border-white/10">
                        <div className="flex flex-col-reverse space-y-1 space-y-reverse">
                          {result.gua.yaos.map((yao) => (
                            <div
                              key={yao.position}
                              className={`h-3 rounded-full ${
                                yao.yinYang === 'yang'
                                  ? 'w-20 bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                                  : 'w-20 flex justify-between'
                              }`}
                            >
                              {yao.yinYang === 'yin' && (
                                <>
                                  <div className="w-8 h-3 bg-slate-500 rounded-full" />
                                  <div className="w-8 h-3 bg-slate-500 rounded-full" />
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent mb-2">
                          {result.gua.chineseName}
                        </h2>
                        <p className="text-xl text-slate-300">{result.gua.name}</p>
                        <p className="text-slate-500">[{result.gua.pronunciation}]</p>
                      </div>
                    </div>
                  </div>

                  {/* 卦辞、彖传、大象传 */}
                  {[
                    { title: '卦辞', content: result.gua.guaci },
                    { title: '彖传', content: result.gua.tuanZhuan },
                    { title: '大象传', content: result.gua.daXiangZhuan },
                  ].map((section, i) => (
                    <motion.div 
                      key={i}
                      className="rounded-xl p-6 backdrop-blur-md bg-white/[0.03] border border-white/[0.08]"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <h3 className="text-xl font-bold text-cyan-300 mb-4">{section.title}</h3>
                      <p className="text-slate-300 leading-relaxed">{section.content}</p>
                    </motion.div>
                  ))}

                  {/* 六爻 */}
                  <div className="rounded-xl p-6 backdrop-blur-md bg-white/[0.03] border border-white/[0.08]">
                    <h3 className="text-xl font-bold text-white mb-6">六爻</h3>
                    <div className="space-y-4">
                      {result.gua.yaos.map((yao, i) => {
                        const positionNames = ['初', '二', '三', '四', '五', '上'];
                        const positionName = positionNames[yao.position - 1];
                        const yaoName = yao.yinYang === 'yang' ? '九' : '六';
                        const fullName = yao.position === 1 || yao.position === 6
                          ? `${positionName}${yaoName}`
                          : `${yaoName}${positionName}`;
                        const isDongYao = result.dongYao?.position === yao.position;

                        return (
                          <motion.div
                            key={yao.position}
                            className={`p-4 rounded-xl border ${
                              isDongYao
                                ? 'bg-red-500/10 border-red-500/30 ring-2 ring-red-500/20'
                                : yao.yinYang === 'yang'
                                  ? 'bg-cyan-500/5 border-cyan-500/20'
                                  : 'bg-slate-500/5 border-slate-500/20'
                            }`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-white">{fullName}</span>
                              {isDongYao && (
                                <span className="text-xs px-2 py-1 bg-red-500/30 text-red-300 rounded-full border border-red-500/40">
                                  动爻
                                </span>
                              )}
                            </div>
                            <p className="text-slate-200 font-medium">{yao.text}</p>
                            {yao.xiangZhuan && (
                              <p className="text-slate-500 text-sm italic mt-1">《象》曰：{yao.xiangZhuan}</p>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <FadeInOnScroll>
        <footer className="border-t border-white/10 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-slate-400 mb-2">易经数字起卦</p>
            <p className="text-sm text-slate-600">传承中华传统文化，探索易经智慧</p>
          </div>
        </footer>
      </FadeInOnScroll>
    </div>
  );
}
