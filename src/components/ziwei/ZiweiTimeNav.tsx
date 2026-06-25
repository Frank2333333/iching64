/**
 * 紫微斗数时间导航 — 本命/大限/流年 视图切换
 *
 * 切换视图时自动计算对应四化叠加层，通过 Context 传递给宫位网格。
 */

import { useZiweiPalace, type TimeView } from './ZiweiPalaceContext';
import {
  buildSiHuaOverlay,
  getYearStemIndex,
  TIAN_GAN_NAMES,
  SIHUA_STYLES,
} from '../../data/ziwei-constants';
import type { ZiweiChart } from '../../lib/ziwei-calculator';

interface ZiweiTimeNavProps {
  chart: ZiweiChart;
}

/** 四化信息行 */
function SihuaInfoLine({ stemIndex, label }: { stemIndex: number; label: string }) {
  const overlay = buildSiHuaOverlay(stemIndex);
  const entries = Object.entries(overlay);
  const stemName = TIAN_GAN_NAMES[stemIndex] || '?';

  return (
    <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-[11px]">
      <span className="text-gray-500 dark:text-gray-400">{label}·{stemName}年四化：</span>
      {entries.map(([star, type]) => {
        const style = SIHUA_STYLES[type];
        return (
          <span key={star} className="inline-flex items-center gap-0.5">
            <span className="text-amber-700 dark:text-amber-300">{star}</span>
            <span className={`font-bold ${style?.light || ''} dark:${style?.dark || ''}`}>
              化{type}
            </span>
          </span>
        );
      })}
    </div>
  );
}

export default function ZiweiTimeNav({ chart }: ZiweiTimeNavProps) {
  const { timeView, setTimeView, liunianYear, setLiunianYear, setOverlaySiHua } = useZiweiPalace();

  const handleViewChange = (view: TimeView) => {
    setTimeView(view);

    if (view === 'mingpan') {
      setOverlaySiHua(null);
    } else if (view === 'daxian') {
      // 当前大限宫位的天干 → 四化
      const currentDaXian = chart.currentDaXianIndex >= 0
        ? chart.daXians[chart.currentDaXianIndex]
        : null;
      if (currentDaXian) {
        // 大限天干索引：查找天干名称在 TIAN_GAN_NAMES 中的索引
        const stemIdx = TIAN_GAN_NAMES.indexOf(currentDaXian.heavenlyStem as any);
        if (stemIdx >= 0) {
          setOverlaySiHua(buildSiHuaOverlay(stemIdx));
        } else {
          setOverlaySiHua(null);
        }
      } else {
        setOverlaySiHua(null);
      }
    } else if (view === 'liunian') {
      // 流年年干 → 四化
      const stemIdx = getYearStemIndex(liunianYear);
      setOverlaySiHua(buildSiHuaOverlay(stemIdx));
    }
  };

  const handleYearChange = (delta: number) => {
    const newYear = liunianYear + delta;
    setLiunianYear(newYear);
    const stemIdx = getYearStemIndex(newYear);
    setOverlaySiHua(buildSiHuaOverlay(stemIdx));
  };

  // 当前大限信息
  const currentDaXian = chart.currentDaXianIndex >= 0
    ? chart.daXians[chart.currentDaXianIndex]
    : null;

  return (
    <div className="space-y-2">
      {/* 标签栏 */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handleViewChange('mingpan')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
            ${timeView === 'mingpan'
              ? 'bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300'
              : 'text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
        >
          本命
        </button>

        <button
          onClick={() => handleViewChange('daxian')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
            ${timeView === 'daxian'
              ? 'bg-purple-500/10 border border-purple-500/25 text-purple-700 dark:text-purple-300'
              : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
        >
          大限
          {currentDaXian && (
            <span className="ml-1 text-[10px] opacity-70">
              {currentDaXian.startAge}-{currentDaXian.endAge}
            </span>
          )}
        </button>

        <button
          onClick={() => handleViewChange('liunian')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
            ${timeView === 'liunian'
              ? 'bg-blue-500/10 border border-blue-500/25 text-blue-700 dark:text-blue-300'
              : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
        >
          流年
        </button>

        {/* 流年年份步进器 */}
        {timeView === 'liunian' && (
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => handleYearChange(-1)}
              className="w-6 h-6 rounded text-gray-500 dark:text-gray-400
                hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-sm"
            >
              ‹
            </button>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300 min-w-[3ch] text-center">
              {liunianYear}
            </span>
            <button
              onClick={() => handleYearChange(1)}
              className="w-6 h-6 rounded text-gray-500 dark:text-gray-400
                hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-sm"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* 四化叠加信息 */}
      {timeView === 'daxian' && currentDaXian && (
        <SihuaInfoLine
          stemIndex={TIAN_GAN_NAMES.indexOf(currentDaXian.heavenlyStem as any)}
          label="大限"
        />
      )}
      {timeView === 'liunian' && (
        <SihuaInfoLine
          stemIndex={getYearStemIndex(liunianYear)}
          label="流年"
        />
      )}
    </div>
  );
}
