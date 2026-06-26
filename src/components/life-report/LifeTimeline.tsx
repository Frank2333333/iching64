import { Star, TrendingUp } from 'lucide-react';
import type { BaziChart } from '../../lib/bazi-calculator';
import type { ZiweiChart } from '../../lib/ziwei-calculator';

interface LifeTimelineProps {
  baziChart: BaziChart | null;
  ziweiChart: ZiweiChart | null;
}

interface TimelineRow {
  ageLabel: string;
  startAge: number;
  bazi?: { gan: string; zhi: string; shiShen: string };
  ziwei?: { palaceName: string; heavenlyStem: string; earthlyBranch: string };
  isCurrent: boolean;
}

/** 将八字大运与紫微大限按起始年龄对齐合并 */
function buildRows(baziChart: BaziChart | null, ziweiChart: ZiweiChart | null): TimelineRow[] {
  const rows: TimelineRow[] = [];
  const byAge = new Map<number, TimelineRow>();

  const currentAge = ziweiChart?.currentAge ?? new Date().getFullYear() - (baziChart?.birthYear ?? new Date().getFullYear());

  if (baziChart) {
    for (const dy of baziChart.daYun) {
      const row: TimelineRow = {
        ageLabel: `${dy.startAge}-${dy.endAge}岁`,
        startAge: dy.startAge,
        bazi: { gan: dy.gan, zhi: dy.zhi, shiShen: dy.shiShen },
        isCurrent: currentAge >= dy.startAge && currentAge <= dy.endAge,
      };
      rows.push(row);
      byAge.set(dy.startAge, row);
    }
  }

  if (ziweiChart?.daXians) {
    for (const dx of ziweiChart.daXians) {
      let row = byAge.get(dx.startAge);
      if (!row) {
        row = {
          ageLabel: `${dx.startAge}-${dx.endAge}岁`,
          startAge: dx.startAge,
          isCurrent: currentAge >= dx.startAge && currentAge <= dx.endAge,
        };
        rows.push(row);
        byAge.set(dx.startAge, row);
      }
      row.ziwei = { palaceName: dx.palaceName, heavenlyStem: dx.heavenlyStem, earthlyBranch: dx.earthlyBranch };
    }
  }

  rows.sort((a, b) => a.startAge - b.startAge);
  return rows;
}

export default function LifeTimeline({ baziChart, ziweiChart }: LifeTimelineProps) {
  const rows = buildRows(baziChart, ziweiChart);

  if (rows.length === 0) return null;

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-md border border-amber-200 dark:border-amber-900/30">
      <h3 className="flex items-center gap-2 text-base font-bold text-amber-900 dark:text-amber-100 mb-1">
        <TrendingUp className="w-5 h-5" />
        运势时间轴
      </h3>
      <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mb-4">
        上行八字大运（10年气候），下行紫微大限（10年宫位），同年龄段对照看
      </p>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.startAge}
            className={`flex items-stretch gap-3 rounded-lg border p-3 transition-colors ${
              row.isCurrent
                ? 'border-amber-400 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-900/20'
                : 'border-amber-100 dark:border-amber-900/20 bg-white/50 dark:bg-neutral-900/40'
            }`}
          >
            {/* 年龄 */}
            <div className="flex w-20 flex-none flex-col justify-center">
              <span className={`text-sm font-semibold ${row.isCurrent ? 'text-amber-700 dark:text-amber-300' : 'text-amber-600 dark:text-amber-400'}`}>
                {row.ageLabel}
              </span>
              {row.isCurrent && (
                <span className="text-[10px] text-amber-500 dark:text-amber-400">当前</span>
              )}
            </div>

            {/* 八字大运 */}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-amber-500/70 dark:text-amber-400/70 mb-0.5">八字大运</div>
              {row.bazi ? (
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-amber-800 dark:text-amber-200">{row.bazi.gan}{row.bazi.zhi}</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400">{row.bazi.shiShen}</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )}
            </div>

            {/* 紫微大限 */}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-amber-500/70 dark:text-amber-400/70 mb-0.5">紫微大限</div>
              {row.ziwei ? (
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-amber-800 dark:text-amber-200">{row.ziwei.palaceName}</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400">{row.ziwei.heavenlyStem}{row.ziwei.earthlyBranch}</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-500/70 dark:text-amber-400/70">
        <Star className="w-3 h-3" />
        命理仅供参考，人生节奏由你自己把握
      </div>
    </div>
  );
}
