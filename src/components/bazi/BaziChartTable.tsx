import type { BaziChart, Pillar } from '../../lib/bazi-calculator';

interface BaziChartTableProps {
  chart: BaziChart;
}

const PILLAR_LABELS = ['年柱', '月柱', '日柱', '时柱'] as const;

function splitNayin(nayin: string): [string, string] {
  // Nayin like "海中金" → ["海中", "金"], "天上火" → ["天上", "火"]
  const elements = ['金', '木', '水', '火', '土'];
  for (const el of elements) {
    if (nayin.endsWith(el)) {
      return [nayin.slice(0, -1), el];
    }
  }
  return [nayin, ''];
}

export default function BaziChartTable({ chart }: BaziChartTableProps) {
  const pillars: Pillar[] = [
    chart.yearPillar,
    chart.monthPillar,
    chart.dayPillar,
    chart.hourPillar,
  ];

  return (
    <div>
      <table className="w-full border-collapse">
        {/* Header: 柱名 */}
        <thead>
          <tr>
            {PILLAR_LABELS.map((label, i) => (
              <th
                key={label}
                className={`py-2 text-sm font-semibold border border-amber-200 dark:border-amber-800/50
                  ${i === 2
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-[#d4af37]'
                    : 'bg-amber-50 dark:bg-neutral-800 text-amber-700 dark:text-amber-400'
                  }`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* 十神 + 天干 row */}
          <tr>
            {pillars.map((p, i) => (
              <td
                key={`gan-${i}`}
                className={`py-2 px-1 text-center border border-amber-200 dark:border-amber-800/50
                  ${i === 2
                    ? 'bg-amber-50 dark:bg-amber-900/20'
                    : 'bg-white dark:bg-neutral-900'
                  }`}
              >
                {/* 十神 (only for non-day-master pillars) */}
                <div className={`text-xs mb-1 ${
                  i === 2
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-amber-500 dark:text-amber-500'
                }`}>
                  {i === 2 ? '日主' : (p.shiShen[0] || '')}
                </div>
                {/* 天干 */}
                <div className={`text-xl font-bold ${
                  i === 2
                    ? 'text-amber-700 dark:text-[#d4af37]'
                    : 'text-amber-900 dark:text-amber-100'
                }`}>
                  {p.gan}
                </div>
              </td>
            ))}
          </tr>

          {/* 地支 row */}
          <tr>
            {pillars.map((p, i) => (
              <td
                key={`zhi-${i}`}
                className={`py-2 px-1 text-center border border-amber-200 dark:border-amber-800/50
                  ${i === 2
                    ? 'bg-amber-50 dark:bg-amber-900/20'
                    : 'bg-white dark:bg-neutral-900'
                  }`}
              >
                <div className="text-xl font-bold text-amber-900 dark:text-amber-100">
                  {p.zhi}
                </div>
              </td>
            ))}
          </tr>

          {/* 藏干 row */}
          <tr>
            {pillars.map((p, i) => (
              <td
                key={`canggan-${i}`}
                className={`py-1.5 px-1 text-center border border-amber-200 dark:border-amber-800/50
                  ${i === 2
                    ? 'bg-amber-50 dark:bg-amber-900/20'
                    : 'bg-white dark:bg-neutral-900'
                  }`}
              >
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  {p.cangGan.map((cg, j) => (
                    <span key={j}>
                      {j > 0 && <span className="text-amber-300 dark:text-amber-700">{' '}</span>}
                      {cg}
                    </span>
                  ))}
                </div>
              </td>
            ))}
          </tr>

          {/* 纳音 row */}
          <tr>
            {pillars.map((p, i) => {
              const [prefix, element] = splitNayin(p.nayin);
              return (
                <td
                  key={`nayin-${i}`}
                  className={`py-1.5 px-1 text-center border border-amber-200 dark:border-amber-800/50
                    ${i === 2
                      ? 'bg-amber-50 dark:bg-amber-900/20'
                      : 'bg-white dark:bg-neutral-900'
                    }`}
                >
                  <div className="text-xs text-amber-400 dark:text-amber-600">
                    {prefix}
                  </div>
                  <div className="text-xs text-amber-500 dark:text-amber-500">
                    {element}
                  </div>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      {/* 真太阳时修正提示 */}
      {chart.solarTimeCorrection && (
        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <span>☀</span>
          <span>
            真太阳时修正 {chart.solarTimeCorrection.correctionMinutes > 0 ? '+' : ''}
            {chart.solarTimeCorrection.correctionMinutes}分钟
          </span>
          {chart.solarTimeCorrection.hourPillarChanged && (
            <span className="text-amber-500 dark:text-amber-500">（时柱已变更）</span>
          )}
        </div>
      )}
    </div>
  );
}
