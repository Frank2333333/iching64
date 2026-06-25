/**
 * 紫微斗数时间导航 — 本命/大限/流年 视图切换
 *
 * 切换视图时自动计算对应四化叠加层和运限宫名，
 * 通过 Context 传递给宫位网格。支持大限步进和流年步进。
 */

import { useEffect } from 'react';
import { useZiweiPalace, type TimeView } from './ZiweiPalaceContext';
import {
  buildSiHuaOverlay,
  getYearStemIndex,
  TIAN_GAN_NAMES,
  SIHUA_STYLES,
} from '../../data/ziwei-constants';
import type { ZiweiChart, HoroscopePalaceData } from '../../lib/ziwei-calculator';

interface ZiweiTimeNavProps {
  chart: ZiweiChart;
}

/** 从运限数据构建四化叠加映射 */
function buildOverlayFromMutagen(mutagen: string[]): Record<string, string> {
  const types = ['禄', '权', '科', '忌'];
  const overlay: Record<string, string> = {};
  for (let i = 0; i < mutagen.length && i < 4; i++) {
    if (mutagen[i]) {
      overlay[mutagen[i]] = types[i];
    }
  }
  return overlay;
}

/** 四化信息行 */
function SihuaInfoLine({ scopeData, label }: { scopeData: HoroscopePalaceData; label: string }) {
  const overlay = buildOverlayFromMutagen(scopeData.mutagen);
  const entries = Object.entries(overlay);

  return (
    <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-[11px]">
      <span className="text-gray-500 dark:text-gray-400">
        {label}·{scopeData.heavenlyStem}{scopeData.earthlyBranch}四化：
      </span>
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

/** 备用四化信息行（无 horoscopeData 时用本地表） */
function SihuaInfoLineFallback({ stemIndex, label, stemLabel }: { stemIndex: number; label: string; stemLabel?: string }) {
  const overlay = buildSiHuaOverlay(stemIndex);
  const entries = Object.entries(overlay);
  const stemName = TIAN_GAN_NAMES[stemIndex] || '?';

  return (
    <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-[11px]">
      <span className="text-gray-500 dark:text-gray-400">{label}·{stemLabel || stemName}四化：</span>
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
  const {
    timeView, setTimeView,
    liunianYear, setLiunianYear,
    selectedDaXianIndex, setSelectedDaXianIndex,
    setOverlaySiHua,
    setScopePalaceNames, setScopeHoroscopeStars,
  } = useZiweiPalace();

  const horoscopeData = chart.horoscopeData;

  // 同步 selectedDaXianIndex 到 chart.currentDaXianIndex（首次加载或 chart 变化时）
  useEffect(() => {
    if (chart.currentDaXianIndex >= 0) {
      setSelectedDaXianIndex(chart.currentDaXianIndex);
    }
  }, [chart.currentDaXianIndex, setSelectedDaXianIndex]);

  // 当前选中的大限
  const selectedDaXian = selectedDaXianIndex >= 0 && selectedDaXianIndex < chart.daXians.length
    ? chart.daXians[selectedDaXianIndex]
    : null;

  const handleViewChange = (view: TimeView) => {
    setTimeView(view);

    if (view === 'mingpan') {
      setOverlaySiHua(null);
      setScopePalaceNames(null);
      setScopeHoroscopeStars(null);
    } else if (view === 'daxian') {
      applyDaXianOverlay(selectedDaXianIndex);
    } else if (view === 'liunian') {
      applyLiuNianOverlay(liunianYear);
    }
  };

  /** 应用大限叠加层 */
  const applyDaXianOverlay = (daXianIdx: number) => {
    const daXian = daXianIdx >= 0 && daXianIdx < chart.daXians.length
      ? chart.daXians[daXianIdx]
      : null;

    // 只有当前大限（currentDaXianIndex）才有 horoscopeData
    const isCurrentDaXian = daXianIdx === chart.currentDaXianIndex;

    if (isCurrentDaXian && horoscopeData) {
      const dec = horoscopeData.decadal;
      setOverlaySiHua(buildOverlayFromMutagen(dec.mutagen));
      setScopePalaceNames(dec.palaceNames);
      setScopeHoroscopeStars(dec.horoscopeStars);
    } else if (daXian) {
      // 非当前大限：用本地四化表
      const stemIdx = TIAN_GAN_NAMES.indexOf(daXian.heavenlyStem as typeof TIAN_GAN_NAMES[number]);
      setOverlaySiHua(stemIdx >= 0 ? buildSiHuaOverlay(stemIdx) : null);
      setScopePalaceNames(null);
      setScopeHoroscopeStars(null);
    } else {
      setOverlaySiHua(null);
      setScopePalaceNames(null);
      setScopeHoroscopeStars(null);
    }
  };

  /** 应用流年叠加层 */
  const applyLiuNianOverlay = (year: number) => {
    if (horoscopeData) {
      const yearData = horoscopeData.yearly;
      setOverlaySiHua(buildOverlayFromMutagen(yearData.mutagen));
      setScopePalaceNames(yearData.palaceNames);
      setScopeHoroscopeStars(yearData.horoscopeStars);
    } else {
      const stemIdx = getYearStemIndex(year);
      setOverlaySiHua(buildSiHuaOverlay(stemIdx));
      setScopePalaceNames(null);
      setScopeHoroscopeStars(null);
    }
  };

  /** 大限步进 */
  const handleDaXianChange = (delta: number) => {
    const newIdx = selectedDaXianIndex + delta;
    if (newIdx < 0 || newIdx >= chart.daXians.length) return;
    setSelectedDaXianIndex(newIdx);
    applyDaXianOverlay(newIdx);
  };

  /** 流年步进 */
  const handleYearChange = (delta: number) => {
    const newYear = liunianYear + delta;
    setLiunianYear(newYear);
    applyLiuNianOverlay(newYear);
  };

  // 当前大限信息（用于标签旁显示）
  const currentDaXian = chart.currentDaXianIndex >= 0
    ? chart.daXians[chart.currentDaXianIndex]
    : null;

  return (
    <div className="space-y-2">
      {/* 标签栏 */}
      <div className="flex items-center gap-1.5 flex-wrap">
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

        {/* 大限步进器 */}
        {timeView === 'daxian' && chart.daXians.length > 0 && (
          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={() => handleDaXianChange(-1)}
              disabled={selectedDaXianIndex <= 0}
              className="w-6 h-6 rounded text-gray-500 dark:text-gray-400
                hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-sm
                disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300 whitespace-nowrap">
              {selectedDaXian
                ? `${selectedDaXian.startAge}-${selectedDaXian.endAge}岁`
                : '--'}
            </span>
            <button
              onClick={() => handleDaXianChange(1)}
              disabled={selectedDaXianIndex >= chart.daXians.length - 1}
              className="w-6 h-6 rounded text-gray-500 dark:text-gray-400
                hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-sm
                disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ›
            </button>
            {selectedDaXian && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {selectedDaXian.heavenlyStem}{selectedDaXian.earthlyBranch}·{selectedDaXian.palaceName}
              </span>
            )}
          </div>
        )}

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
          <div className="flex items-center gap-1 ml-1">
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
      {timeView === 'daxian' && selectedDaXianIndex === chart.currentDaXianIndex && horoscopeData && (
        <SihuaInfoLine scopeData={horoscopeData.decadal} label="大限" />
      )}
      {timeView === 'daxian' && !(selectedDaXianIndex === chart.currentDaXianIndex && horoscopeData) && selectedDaXian && (
        <SihuaInfoLineFallback
          stemIndex={TIAN_GAN_NAMES.indexOf(selectedDaXian.heavenlyStem as typeof TIAN_GAN_NAMES[number])}
          label="大限"
          stemLabel={`${selectedDaXian.heavenlyStem}${selectedDaXian.earthlyBranch}`}
        />
      )}
      {timeView === 'liunian' && horoscopeData && (
        <SihuaInfoLine scopeData={horoscopeData.yearly} label="流年" />
      )}
      {timeView === 'liunian' && !horoscopeData && (
        <SihuaInfoLineFallback
          stemIndex={getYearStemIndex(liunianYear)}
          label="流年"
        />
      )}
    </div>
  );
}
