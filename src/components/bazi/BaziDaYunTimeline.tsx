import type { BaziChart } from '../../lib/bazi-calculator';

interface BaziDaYunTimelineProps {
  chart: BaziChart;
}

export default function BaziDaYunTimeline({ chart }: BaziDaYunTimelineProps) {
  const currentAge = new Date().getFullYear() - chart.birthYear;

  const isCurrentDaYun = (startAge: number, endAge: number) =>
    currentAge >= startAge && currentAge <= endAge;

  return (
    <div className="mt-4">
      <h3 className="text-base font-serif font-semibold text-amber-800 dark:text-amber-200 mb-2">
        大运
      </h3>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1.5 min-w-max">
          {chart.daYun.map((dy) => {
            const current = isCurrentDaYun(dy.startAge, dy.endAge);
            return (
              <div
                key={dy.startAge}
                className={`flex-shrink-0 w-16 rounded-md border px-1.5 py-1.5 text-center transition-colors ${
                  current
                    ? 'bg-amber-100 border-amber-400 dark:bg-amber-900/40 dark:border-amber-500'
                    : 'bg-amber-50 border-amber-200 dark:bg-gray-800 dark:border-gray-600'
                }`}
              >
                <div
                  className={`text-xs font-medium ${
                    current
                      ? 'text-amber-900 dark:text-amber-100'
                      : 'text-amber-700 dark:text-gray-400'
                  }`}
                >
                  {dy.startAge}岁
                </div>
                <div
                  className={`text-sm font-serif font-bold mt-0.5 ${
                    current
                      ? 'text-amber-900 dark:text-amber-100'
                      : 'text-amber-800 dark:text-gray-200'
                  }`}
                >
                  {dy.gan}{dy.zhi}
                </div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    current
                      ? 'text-amber-700 dark:text-amber-300'
                      : 'text-amber-600 dark:text-gray-500'
                  }`}
                >
                  {dy.shiShen}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
