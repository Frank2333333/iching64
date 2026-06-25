import type { ZiweiChart } from '../../lib/ziwei-calculator';
import { SIHUA_STYLES } from '../../data/ziwei-constants';
import { getMingGongSummary, detectPatterns } from '../../lib/ziwei-patterns';

interface ZiweiSummaryCardsProps {
  chart: ZiweiChart;
}

export default function ZiweiSummaryCards({ chart }: ZiweiSummaryCardsProps) {
  const mingGong = chart.palaces.find(p => p.name === '命宫');
  const summary = getMingGongSummary(chart);
  const currentDaXian = chart.currentDaXianIndex >= 0 ? chart.daXians[chart.currentDaXianIndex] : null;
  const patterns = detectPatterns(chart);
  const topPatterns = patterns
    .filter(p => p.level === 'excellent' || p.level === 'good')
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* 命格总览 */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-amber-200 dark:border-amber-900/30">
        <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">命格总览</div>
        <div className="text-lg font-bold text-amber-800 dark:text-amber-200">
          {chart.soulPalace}
          {mingGong ? ` · ${mingGong.majorStars.map(s => s.name).join(' ')}` : ''}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          命主{chart.soul} · 身主{chart.body} · {chart.fiveElementsClass}
        </div>
        {summary.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {summary.keywords.slice(0, 6).map(kw => (
              <span key={kw} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                {kw}
              </span>
            ))}
          </div>
        )}
        {currentDaXian && (
          <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-2 pt-2 border-t border-purple-200/40 dark:border-purple-800/30">
            当前大限：{currentDaXian.palaceName}（{currentDaXian.startAge}-{currentDaXian.endAge}岁）
          </div>
        )}
      </div>

      {/* 生年四化 */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-amber-200 dark:border-amber-900/30">
        <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">生年四化</div>
        <div className="flex flex-wrap gap-2 mt-1">
          {(['lu', 'quan', 'ke', 'ji'] as const).map((key) => {
            const label = { lu: '禄', quan: '权', ke: '科', ji: '忌' }[key];
            const star = chart.birthSiHua[key];
            const style = SIHUA_STYLES[label];
            // 查找四化星所在宫位
            const starPalace = chart.palaces.find(p =>
              p.majorStars.some(s => s.name === star) || p.minorStars.some(s => s.name === star)
            );
            return (
              <span key={key} className="inline-flex items-center gap-1 text-sm">
                <span className={`font-bold ${style?.light ?? ''} dark:${style?.dark ?? ''}`}>化{label}</span>
                <span className="text-amber-700 dark:text-amber-300">{star}</span>
                {starPalace && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">({starPalace.name})</span>
                )}
              </span>
            );
          })}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {chart.gender} · {chart.chineseDate}
        </div>
      </div>

      {/* 大限运程 */}
      {chart.daXians.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-amber-200 dark:border-amber-900/30">
          <div className="text-xs text-amber-600 dark:text-amber-400 mb-2">大限运程</div>
          <div className="flex flex-wrap gap-1.5">
            {chart.daXians.map((dx, i) => {
              const isCurrent = i === chart.currentDaXianIndex;
              return (
                <span
                  key={i}
                  className={`text-[10px] px-2 py-1 rounded-lg border transition-colors
                    ${isCurrent
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 font-bold'
                      : 'bg-gray-50 dark:bg-neutral-700 border-gray-200 dark:border-neutral-600 text-gray-500 dark:text-gray-400'
                    }`}
                >
                  {dx.startAge}-{dx.endAge}
                  <span className="ml-0.5">{dx.palaceName}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 格局概览 */}
      {topPatterns.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-amber-200 dark:border-amber-900/30">
          <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">
            格局概览
            <span className="ml-1 text-[10px] text-gray-400 dark:text-gray-500">共{patterns.length}个</span>
          </div>
          <div className="space-y-1">
            {topPatterns.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full ${p.level === 'excellent' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <span className="text-amber-700 dark:text-amber-300 font-medium">{p.name}</span>
                <span className="text-gray-400 dark:text-gray-500 truncate">{p.description.slice(0, 15)}...</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
