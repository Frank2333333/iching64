import type { ZiweiChart } from '../../lib/ziwei-calculator';
import { SIHUA_STYLES } from '../../data/ziwei-constants';

interface ZiweiSummaryCardsProps {
  chart: ZiweiChart;
}

export default function ZiweiSummaryCards({ chart }: ZiweiSummaryCardsProps) {
  const mingGong = chart.palaces.find(p => p.name === '命宫');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* 命宫信息 */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-amber-200 dark:border-amber-900/30">
        <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">命宫</div>
        <div className="text-lg font-bold text-amber-800 dark:text-amber-200">
          {chart.soulPalace}
          {mingGong ? ` · ${mingGong.majorStars.map(s => s.name).join(' ')}` : ''}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          命主{chart.soul} · 身主{chart.body}
        </div>
      </div>

      {/* 五行局 */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-amber-200 dark:border-amber-900/30">
        <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">五行局</div>
        <div className="text-lg font-bold text-amber-800 dark:text-amber-200">
          {chart.fiveElementsClass}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {chart.gender} · {chart.chineseDate}
        </div>
      </div>

      {/* 生年四化 */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-amber-200 dark:border-amber-900/30">
        <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">生年四化</div>
        <div className="flex flex-wrap gap-2 mt-1">
          {(['lu', 'quan', 'ke', 'ji'] as const).map((key) => {
            const label = { lu: '禄', quan: '权', ke: '科', ji: '忌' }[key];
            const star = chart.birthSiHua[key];
            const style = SIHUA_STYLES[label];
            return (
              <span key={key} className="inline-flex items-center gap-1 text-sm">
                <span className={`font-bold ${style?.light ?? ''} dark:${style?.dark ?? ''}`}>化{label}</span>
                <span className="text-amber-700 dark:text-amber-300">{star}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
