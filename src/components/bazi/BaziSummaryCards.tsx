import type { BaziChart } from '../../lib/bazi-calculator';

interface BaziSummaryCardsProps {
  chart: BaziChart;
}

function getStrengthColor(strength: string): string {
  if (strength === '身强' || strength === '偏强') return 'text-red-600 dark:text-red-400';
  if (strength === '身弱' || strength === '偏弱') return 'text-blue-600 dark:text-blue-400';
  return 'text-amber-600 dark:text-amber-400';
}

export default function BaziSummaryCards({ chart }: BaziSummaryCardsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Day Master Card */}
      <div className="flex-1 min-w-[160px] bg-amber-50 dark:bg-gray-800 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="text-xs text-amber-600/70 dark:text-amber-500/70 mb-1">日主</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {chart.dayMaster}{chart.dayMasterElement}
        </div>
        <div className={`text-sm font-medium mt-1 ${getStrengthColor(chart.dayMasterStrength)}`}>
          {chart.dayMasterStrength}
        </div>
      </div>

      {/* Pattern & Yongshen Card */}
      <div className="flex-1 min-w-[160px] bg-amber-50 dark:bg-gray-800 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="text-xs text-amber-600/70 dark:text-amber-500/70 mb-1">格局</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {chart.pattern}
        </div>
        <div className="flex gap-2 mt-2">
          <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium">
            用{chart.yongShen}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">
            喜{chart.xiShen}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 font-medium">
            忌{chart.jiShen}
          </span>
        </div>
      </div>
    </div>
  );
}
