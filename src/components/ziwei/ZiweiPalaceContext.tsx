/**
 * 紫微斗数宫位交互状态 Context
 *
 * 管理宫位选中、星曜选中、时间视图、四化叠加、运限宫名等共享状态，
 * 供 ZiweiPalaceGrid、ZiweiTimeNav、ZiweiStarDetailPanel 等组件消费。
 */

import { createContext, useContext, useState, type ReactNode } from 'react';

export type TimeView = 'mingpan' | 'daxian' | 'liunian';

interface SelectedStar {
  name: string;
  palaceIndex: number;
}

interface ZiweiPalaceContextValue {
  /** 当前选中的宫位索引 */
  selectedPalaceIndex: number | null;
  setSelectedPalaceIndex: (index: number | null) => void;

  /** 当前悬停的宫位索引 */
  hoveredPalaceIndex: number | null;
  setHoveredPalaceIndex: (index: number | null) => void;

  /** 当前选中的星曜 */
  selectedStar: SelectedStar | null;
  setSelectedStar: (star: SelectedStar | null) => void;

  /** 时间视图模式 */
  timeView: TimeView;
  setTimeView: (view: TimeView) => void;

  /** 流年年份 */
  liunianYear: number;
  setLiunianYear: (year: number) => void;

  /** 叠加四化映射（星名 → 四化类型），大限/流年视图下使用 */
  overlaySiHua: Record<string, string> | null;
  setOverlaySiHua: (overlay: Record<string, string> | null) => void;

  /** 运限视角的12宫名称（null 表示本命视角） */
  scopePalaceNames: string[] | null;
  setScopePalaceNames: (names: string[] | null) => void;

  /** 运限的流耀星名按宫位索引（null 表示本命视角无流耀） */
  scopeHoroscopeStars: string[][] | null;
  setScopeHoroscopeStars: (stars: string[][] | null) => void;
}

const ZiweiPalaceContext = createContext<ZiweiPalaceContextValue | null>(null);

export function ZiweiPalaceProvider({ children }: { children: ReactNode }) {
  const [selectedPalaceIndex, setSelectedPalaceIndex] = useState<number | null>(null);
  const [hoveredPalaceIndex, setHoveredPalaceIndex] = useState<number | null>(null);
  const [selectedStar, setSelectedStar] = useState<SelectedStar | null>(null);
  const [timeView, setTimeView] = useState<TimeView>('mingpan');
  const [liunianYear, setLiunianYear] = useState(new Date().getFullYear());
  const [overlaySiHua, setOverlaySiHua] = useState<Record<string, string> | null>(null);
  const [scopePalaceNames, setScopePalaceNames] = useState<string[] | null>(null);
  const [scopeHoroscopeStars, setScopeHoroscopeStars] = useState<string[][] | null>(null);

  return (
    <ZiweiPalaceContext.Provider value={{
      selectedPalaceIndex,
      setSelectedPalaceIndex,
      hoveredPalaceIndex,
      setHoveredPalaceIndex,
      selectedStar,
      setSelectedStar,
      timeView,
      setTimeView,
      liunianYear,
      setLiunianYear,
      overlaySiHua,
      setOverlaySiHua,
      scopePalaceNames,
      setScopePalaceNames,
      scopeHoroscopeStars,
      setScopeHoroscopeStars,
    }}>
      {children}
    </ZiweiPalaceContext.Provider>
  );
}

export function useZiweiPalace(): ZiweiPalaceContextValue {
  const ctx = useContext(ZiweiPalaceContext);
  if (!ctx) {
    throw new Error('useZiweiPalace must be used within a ZiweiPalaceProvider');
  }
  return ctx;
}
