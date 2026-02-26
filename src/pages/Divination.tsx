import { useState } from 'react';
import { liuShiSiGua, type Gua, baGua } from '../data/guaxiang';
import { Calculator, ArrowLeft, Sparkles, BookOpen } from 'lucide-react';

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

    // 第一个数字除8取余得上卦
    const shangRemainder = n1 % 8;
    const shangGuaNum = shangRemainder === 0 ? 8 : shangRemainder;
    const shangGuaName = baGuaMap[shangGuaNum];

    // 第二个数字除8取余得下卦
    const xiaRemainder = n2 % 8;
    const xiaGuaNum = xiaRemainder === 0 ? 8 : xiaRemainder;
    const xiaGuaName = baGuaMap[xiaGuaNum];

    // 第三个数字除6取余得动爻
    const yaoRemainder = n3 % 6;
    const dongYaoNum = yaoRemainder === 0 ? 6 : yaoRemainder;

    // 查找对应的卦
    const gua = liuShiSiGua.find(
      g => g.shangGua === shangGuaName && g.xiaGua === xiaGuaName
    ) || null;

    // 获取动爻信息
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-900 via-red-900 to-amber-900 text-amber-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Calculator className="w-8 h-8 text-amber-300" />
              <h1 className="text-2xl font-bold tracking-wider">数字起卦</h1>
            </div>
            <a
              href="/"
              className="flex items-center space-x-2 text-amber-300 hover:text-amber-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回卦象列表</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showGuaDetail ? (
          <>
            {/* 说明卡片 */}
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-md border border-amber-200">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-amber-600" />
                <h2 className="text-xl font-bold text-amber-900">数字起卦说明</h2>
              </div>
              <div className="space-y-2 text-amber-700">
                <p>1. 输入三个三位数字</p>
                <p>2. 第一个数字 ÷ 8 取余数 → 上卦（1乾、2兑、3离、4震、5巽、6坎、7艮、8坤）</p>
                <p>3. 第二个数字 ÷ 8 取余数 → 下卦（同上）</p>
                <p>4. 第三个数字 ÷ 6 取余数 → 动爻（1初爻、2二爻、3三爻、4四爻、5五爻、6上爻）</p>
              </div>
            </div>

            {/* 输入表单 */}
            <div className="bg-white rounded-2xl p-8 mb-8 shadow-md border border-amber-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-2">
                    第一个数字（上卦）
                  </label>
                  <input
                    type="number"
                    value={num1}
                    onChange={(e) => setNum1(e.target.value)}
                    placeholder="输入三位数字"
                    className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-2">
                    第二个数字（下卦）
                  </label>
                  <input
                    type="number"
                    value={num2}
                    onChange={(e) => setNum2(e.target.value)}
                    placeholder="输入三位数字"
                    className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-2">
                    第三个数字（动爻）
                  </label>
                  <input
                    type="number"
                    value={num3}
                    onChange={(e) => setNum3(e.target.value)}
                    placeholder="输入三位数字"
                    className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900"
                  />
                </div>
              </div>
              <button
                onClick={handleCalculate}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-red-600 text-white font-bold rounded-lg hover:from-amber-700 hover:to-red-700 transition-all shadow-lg"
              >
                开始起卦
              </button>
            </div>

            {/* 结果显示 */}
            {result && (
              <div className="space-y-6">
                {/* 起卦过程 */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-200">
                  <h3 className="text-lg font-bold text-amber-900 mb-4">起卦过程</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-amber-50 rounded-lg p-4">
                      <p className="text-sm text-amber-600 mb-1">上卦计算</p>
                      <p className="text-lg font-mono text-amber-900">{num1} ÷ 8 = 余{result.shangGuaNum}</p>
                      <p className="text-xl font-bold text-amber-800 mt-2">{result.shangGuaName} {baGua[result.shangGuaName]?.symbol}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4">
                      <p className="text-sm text-amber-600 mb-1">下卦计算</p>
                      <p className="text-lg font-mono text-amber-900">{num2} ÷ 8 = 余{result.xiaGuaNum}</p>
                      <p className="text-xl font-bold text-amber-800 mt-2">{result.xiaGuaName} {baGua[result.xiaGuaName]?.symbol}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4">
                      <p className="text-sm text-amber-600 mb-1">动爻计算</p>
                      <p className="text-lg font-mono text-amber-900">{num3} ÷ 6 = 余{result.dongYaoNum}</p>
                      <p className="text-xl font-bold text-amber-800 mt-2">第{result.dongYaoNum}爻</p>
                    </div>
                  </div>
                </div>

                {result.gua && (
                  <>
                    {/* 卦象信息 */}
                    <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-6 shadow-lg border border-amber-200">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* 卦画 */}
                        <div className="bg-white rounded-xl p-6 shadow-inner">
                          <div className="flex flex-col-reverse space-y-1 space-y-reverse">
                            {result.gua.yaos.map((yao) => (
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
                          {/* 动爻标记 */}
                          <div className="mt-4 text-center">
                            <span className="inline-block px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                              动爻：{result.dongYao?.name}
                            </span>
                          </div>
                        </div>

                        {/* 卦名信息 */}
                        <div className="flex-1 text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                            <span className="text-5xl font-bold text-amber-900">{result.gua.chineseName}</span>
                            <div className="text-left">
                              <p className="text-xl text-amber-700">第 {result.gua.id} 卦</p>
                              <p className="text-lg text-amber-600">{result.gua.name}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                            <span 
                              className="inline-block px-3 py-1 rounded-full text-white text-sm font-bold"
                              style={{ backgroundColor: getWuxingColor(result.gua.wuxing) }}
                            >
                              五行：{result.gua.wuxing}
                            </span>
                          </div>
                          <p className="text-amber-800">{result.gua.meaning}</p>
                        </div>
                      </div>
                    </div>

                    {/* 动爻详情 */}
                    {result.dongYao && (
                      <div className="bg-white rounded-2xl p-6 shadow-md border border-red-200">
                        <div className="flex items-center gap-3 mb-4">
                          <Sparkles className="w-6 h-6 text-red-600" />
                          <h3 className="text-xl font-bold text-red-900">动爻详解</h3>
                        </div>
                        <div className={`p-4 rounded-lg border ${
                          result.dongYao.yinYang === 'yang'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl font-bold text-amber-900">{result.dongYao.name}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              result.dongYao.yinYang === 'yang'
                                ? 'bg-amber-200 text-amber-800'
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {result.dongYao.yinYang === 'yang' ? '阳爻' : '阴爻'}
                            </span>
                          </div>
                          <p className="text-lg text-amber-800 font-medium mb-2">{result.dongYao.text}</p>
                          {result.dongYao.xiangZhuan && (
                            <p className="text-amber-600 italic">《象》曰：{result.dongYao.xiangZhuan}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 卦辞 */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-200">
                      <div className="flex items-center gap-3 mb-4">
                        <BookOpen className="w-6 h-6 text-amber-600" />
                        <h3 className="text-xl font-bold text-amber-900">卦辞</h3>
                      </div>
                      <p className="text-lg text-amber-800 leading-relaxed">{result.gua.guaci}</p>
                    </div>

                    {/* 查看完整卦象按钮 */}
                    <button
                      onClick={() => setShowGuaDetail(true)}
                      className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
                    >
                      查看完整卦象详情
                    </button>
                  </>
                )}

                {!result.gua && (
                  <div className="bg-red-50 rounded-2xl p-6 text-center border border-red-200">
                    <p className="text-red-600">未找到对应的卦象，请检查输入的数字</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* 完整卦象详情 */
          <div className="space-y-6">
            <button
              onClick={() => setShowGuaDetail(false)}
              className="flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回起卦结果</span>
            </button>

            {result?.gua && (
              <>
                {/* 卦象头部 */}
                <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-8 shadow-lg border border-amber-200">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="bg-white rounded-xl p-6 shadow-inner">
                      <div className="flex flex-col-reverse space-y-1 space-y-reverse">
                        {result.gua.yaos.map((yao) => (
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
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-4xl font-bold text-amber-900 mb-2">{result.gua.chineseName}</h2>
                      <p className="text-xl text-amber-700">{result.gua.name}</p>
                      <p className="text-amber-600">[{result.gua.pronunciation}]</p>
                    </div>
                  </div>
                </div>

                {/* 卦辞、彖传、大象传 */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-amber-200">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">卦辞</h3>
                  <p className="text-lg text-amber-800">{result.gua.guaci}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-amber-200">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">彖传</h3>
                  <p className="text-amber-800 leading-relaxed">{result.gua.tuanZhuan}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-amber-200">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">大象传</h3>
                  <p className="text-amber-800 leading-relaxed">{result.gua.daXiangZhuan}</p>
                </div>

                {/* 六爻 */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-amber-200">
                  <h3 className="text-xl font-bold text-amber-900 mb-6">六爻</h3>
                  <div className="space-y-4">
                    {result.gua.yaos.map((yao) => {
                      const positionNames = ['初', '二', '三', '四', '五', '上'];
                      const positionName = positionNames[yao.position - 1];
                      const yaoName = yao.yinYang === 'yang' ? '九' : '六';
                      const fullName = yao.position === 1 || yao.position === 6
                        ? `${positionName}${yaoName}`
                        : `${yaoName}${positionName}`;
                      const isDongYao = result.dongYao?.position === yao.position;

                      return (
                        <div
                          key={yao.position}
                          className={`p-4 rounded-lg border ${
                            isDongYao
                              ? 'bg-red-50 border-red-300 ring-2 ring-red-200'
                              : yao.yinYang === 'yang'
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-amber-900">{fullName}</span>
                            {isDongYao && (
                              <span className="text-xs px-2 py-1 bg-red-500 text-white rounded-full">
                                动爻
                              </span>
                            )}
                          </div>
                          <p className="text-amber-800 font-medium">{yao.text}</p>
                          {yao.xiangZhuan && (
                            <p className="text-amber-600 text-sm italic mt-1">《象》曰：{yao.xiangZhuan}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2">易经数字起卦</p>
          <p className="text-sm text-amber-400">传承中华传统文化，探索易经智慧</p>
        </div>
      </footer>
    </div>
  );
}
