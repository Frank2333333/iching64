import type { ZiweiChart, Palace, Star } from '../../lib/ziwei-calculator';
import {
  PALACE_GRID_MAP,
  PALACE_SVG_POS,
  STAR_TYPE_STYLES,
  SIHUA_STYLES,
} from '../../data/ziwei-constants';
import { useZiweiPalace } from './ZiweiPalaceContext';

interface ZiweiPalaceGridProps {
  chart: ZiweiChart;
}

/** 四化徽章 */
function SihuaBadge({ mutagen }: { mutagen: string }) {
  const style = SIHUA_STYLES[mutagen];
  if (!style) return null;
  return (
    <span className={`text-[10px] font-bold ${style.light} dark:${style.dark}`}>
      化{mutagen}
    </span>
  );
}

/** 叠加四化徽章（大限/流年四化） */
function OverlaySihuaBadge({ mutagen, label }: { mutagen: string; label: string }) {
  const style = SIHUA_STYLES[mutagen];
  if (!style) return null;
  return (
    <span className={`text-[9px] font-bold border border-dashed rounded px-0.5
      ${style.light} dark:${style.dark}
      border-current opacity-80`}>
      {label}{mutagen}
    </span>
  );
}

/** 星曜显示 */
function StarDisplay({ star, size = 'normal', overlayMutagen, overlayLabel, onStarClick }: {
  star: Star;
  size?: 'normal' | 'small';
  overlayMutagen?: string;
  overlayLabel?: string;
  onStarClick?: () => void;
}) {
  const typeStyle = STAR_TYPE_STYLES[star.type];
  const isLarge = size === 'normal';

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${isLarge ? 'text-sm font-bold' : 'text-[11px]'}
        ${onStarClick ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`}
      onClick={onStarClick ? (e) => { e.stopPropagation(); onStarClick(); } : undefined}
    >
      <span className={typeStyle.light + ' dark:' + typeStyle.dark}>
        {star.name}
      </span>
      {star.brightness && isLarge && (
        <span className="text-[9px] text-gray-400 dark:text-gray-500">{star.brightness}</span>
      )}
      {star.mutagen && <SihuaBadge mutagen={star.mutagen} />}
      {overlayMutagen && overlayLabel && (
        <OverlaySihuaBadge mutagen={overlayMutagen} label={overlayLabel} />
      )}
    </span>
  );
}

/** 单个宫位格子 */
function PalaceCell({ palace, isSelected, isSanFang, overlaySiHua, overlayLabel, scopePalaceName, scopeHoroscopeStarNames, animDelay }: {
  palace: Palace;
  isSelected: boolean;
  isSanFang: boolean;
  overlaySiHua: Record<string, string> | null;
  overlayLabel: string;
  scopePalaceName?: string;             // 运限视角的宫名（如大限/流年下的命宫、财帛等）
  scopeHoroscopeStarNames?: string[];   // 运限流耀星名列表
  animDelay?: number;                   // 入场动画延迟（ms）
}) {
  const { setSelectedPalaceIndex, setSelectedStar, selectedPalaceIndex } = useZiweiPalace();
  const isMing = palace.name === '命宫';
  const isScopeMing = scopePalaceName === '命宫';
  const isBody = palace.isBodyPalace;
  // 有运限视角时，主标签用运限宫名；否则用本命宫名
  const displayName = scopePalaceName || palace.name;

  const handleClick = () => {
    setSelectedPalaceIndex(selectedPalaceIndex === palace.index ? null : palace.index);
  };

  return (
    <div
      className={`relative p-1.5 sm:p-2 border border-amber-200/60 dark:border-amber-800/30
        min-h-[100px] sm:min-h-[120px] flex flex-col cursor-pointer
        transition-all duration-200 palace-cell-animate
        ${(isMing || isScopeMing) ? 'bg-amber-50/80 dark:bg-amber-900/20' : 'bg-white/50 dark:bg-neutral-800/50'}
        ${isSelected ? 'ring-2 ring-blue-500/70 ring-inset' : ''}
        ${isSanFang && !isSelected ? 'ring-1 ring-blue-400/40 ring-inset bg-blue-50/20 dark:bg-blue-900/10' : ''}
        ${palace.isCurrentDaXian ? 'border-l-2 border-l-purple-500/70' : ''}
        hover:bg-amber-50/50 dark:hover:bg-amber-900/10`}
      style={animDelay !== undefined ? { animationDelay: `${animDelay}ms` } : undefined}
      onClick={handleClick}
    >
      {/* 宫名+天干地支 */}
      <div className="flex items-center justify-between mb-0.5">
        <span className={`text-xs font-bold ${isScopeMing ? 'text-blue-600 dark:text-blue-300' : isMing ? 'text-amber-700 dark:text-amber-300' : 'text-amber-800/80 dark:text-amber-400/80'}`}>
          {displayName}
          {isBody && <span className="text-[10px] ml-0.5 text-purple-600 dark:text-purple-400">身</span>}
        </span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400">
          {palace.heavenlyStem}{palace.earthlyBranch}
        </span>
      </div>
      {/* 运限视角下显示本命宫名 */}
      {scopePalaceName && scopePalaceName !== palace.name && (
        <div className="text-[9px] text-gray-400 dark:text-gray-500 mb-0.5">
          本命：{palace.name}
        </div>
      )}

      {/* 主星 */}
      {palace.majorStars.length > 0 ? (
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
          {palace.majorStars.map((s) => (
            <StarDisplay
              key={s.name}
              star={s}
              size="normal"
              overlayMutagen={overlaySiHua?.[s.name]}
              overlayLabel={overlayLabel}
              onStarClick={() => setSelectedStar({ name: s.name, palaceIndex: palace.index })}
            />
          ))}
        </div>
      ) : (
        /* 空宫标注 */
        <div className="flex flex-col">
          <span className="text-[11px] italic text-gray-400 dark:text-gray-500">空宫</span>
          {palace.borrowedStars && palace.borrowedStars.length > 0 && (
            <span className="text-[9px] text-gray-400 dark:text-gray-500">
              借{palace.borrowedStars.join('·')}
            </span>
          )}
        </div>
      )}

      {/* 辅星 */}
      {palace.minorStars.length > 0 && (
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 mt-0.5">
          {palace.minorStars.map((s) => (
            <StarDisplay
              key={s.name}
              star={s}
              size="small"
              overlayMutagen={overlaySiHua?.[s.name]}
              overlayLabel={overlayLabel}
              onStarClick={() => setSelectedStar({ name: s.name, palaceIndex: palace.index })}
            />
          ))}
        </div>
      )}

      {/* 杂耀 */}
      {palace.adjectiveStars.length > 0 && (
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 mt-0.5">
          {palace.adjectiveStars.map((s) => (
            <span key={s.name} className="text-[10px] text-gray-400 dark:text-gray-500">{s.name}</span>
          ))}
        </div>
      )}

      {/* 流耀星（大限/流年视图） */}
      {scopeHoroscopeStarNames && scopeHoroscopeStarNames.length > 0 && (
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 mt-0.5">
          {scopeHoroscopeStarNames.map((name) => (
            <span key={name} className="text-[10px] text-blue-500 dark:text-blue-400 font-medium">
              <span className="text-blue-400/60 dark:text-blue-500/60">流</span>{name}
            </span>
          ))}
        </div>
      )}

      {/* 长生十二神 + 大限 */}
      <div className="mt-auto pt-0.5 flex items-center justify-between">
        <span className="text-[9px] text-gray-400 dark:text-gray-600">{palace.changsheng12}</span>
        {palace.decadal && (
          <span className={`text-[9px] ${palace.isCurrentDaXian ? 'text-purple-500 dark:text-purple-400 font-bold' : 'text-blue-500/70 dark:text-blue-400/50'}`}>
            {palace.decadal.range[0]}-{palace.decadal.range[1]}
          </span>
        )}
      </div>
    </div>
  );
}

/** 三方四正 SVG 连线叠加层 */
function SanFangOverlay({ selectedPalaceIndex }: { selectedPalaceIndex: number }) {
  const pos = PALACE_SVG_POS[selectedPalaceIndex];
  if (!pos) return null;

  // 三方四正：己宫、对宫、三合1、三合2
  const oppositeIdx = (selectedPalaceIndex + 6) % 12;
  const sanHe1Idx = (selectedPalaceIndex + 4) % 12;
  const sanHe2Idx = (selectedPalaceIndex + 8) % 12;

  const oppositePos = PALACE_SVG_POS[oppositeIdx];
  const sanHe1Pos = PALACE_SVG_POS[sanHe1Idx];
  const sanHe2Pos = PALACE_SVG_POS[sanHe2Idx];

  if (!oppositePos || !sanHe1Pos || !sanHe2Pos) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300"
      style={{ zIndex: 10 }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {/* 对宫连线（穿过中心） */}
      <line
        x1={pos[0]} y1={pos[1]} x2={oppositePos[0]} y2={oppositePos[1]}
        stroke="rgba(59,130,246,0.45)" strokeWidth="0.5"
        strokeDasharray="2,1.5"
      />

      {/* 三合三角形 */}
      <line
        x1={pos[0]} y1={pos[1]} x2={sanHe1Pos[0]} y2={sanHe1Pos[1]}
        stroke="rgba(59,130,246,0.45)" strokeWidth="0.5"
        strokeDasharray="2,1.5"
      />
      <line
        x1={pos[0]} y1={pos[1]} x2={sanHe2Pos[0]} y2={sanHe2Pos[1]}
        stroke="rgba(59,130,246,0.45)" strokeWidth="0.5"
        strokeDasharray="2,1.5"
      />
      <line
        x1={sanHe1Pos[0]} y1={sanHe1Pos[1]} x2={sanHe2Pos[0]} y2={sanHe2Pos[1]}
        stroke="rgba(59,130,246,0.45)" strokeWidth="0.5"
        strokeDasharray="2,1.5"
      />

      {/* 对宫连接线 */}
      <line
        x1={oppositePos[0]} y1={oppositePos[1]} x2={sanHe1Pos[0]} y2={sanHe1Pos[1]}
        stroke="rgba(59,130,246,0.3)" strokeWidth="0.4"
        strokeDasharray="1.5,1.5"
      />
      <line
        x1={oppositePos[0]} y1={oppositePos[1]} x2={sanHe2Pos[0]} y2={sanHe2Pos[1]}
        stroke="rgba(59,130,246,0.3)" strokeWidth="0.4"
        strokeDasharray="1.5,1.5"
      />

      {/* 宫位中心圆点 */}
      {[pos, oppositePos, sanHe1Pos, sanHe2Pos].map((p, i) => (
        <circle
          key={i}
          cx={p[0]} cy={p[1]} r="1.2"
          fill={i === 0 ? 'rgba(59,130,246,0.7)' : 'rgba(59,130,246,0.5)'}
        />
      ))}
    </svg>
  );
}

/** 中心信息区 */
function CenterInfo({ chart }: { chart: ZiweiChart }) {
  const { timeView, scopePalaceNames, selectedDaXianIndex, liunianYear } = useZiweiPalace();
  const currentDaXian = chart.currentDaXianIndex >= 0 ? chart.daXians[chart.currentDaXianIndex] : null;
  const selectedDaXian = selectedDaXianIndex >= 0 && selectedDaXianIndex < chart.daXians.length
    ? chart.daXians[selectedDaXianIndex]
    : null;
  const isScopeView = timeView !== 'mingpan';

  // 运限命宫位置：scopePalaceNames 中 "命宫" 对应的宫位地支
  const scopeMingGongBranch = scopePalaceNames
    ? (() => {
        const mingIdx = scopePalaceNames.indexOf('命宫');
        if (mingIdx < 0) return null;
        const branchNames = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
        return branchNames[(mingIdx + 2) % 12];
      })()
    : null;

  const scopeLabel = timeView === 'daxian' ? '大限' : timeView === 'liunian' ? '流年' : '';
  const scopeColor = timeView === 'daxian'
    ? 'text-purple-600 dark:text-purple-400 border-purple-200/40 dark:border-purple-800/30'
    : 'text-blue-600 dark:text-blue-400 border-blue-200/40 dark:border-blue-800/30';

  return (
    <div className="p-2 sm:p-3 flex flex-col items-center justify-center text-center
      bg-amber-50/60 dark:bg-neutral-900/60 border border-amber-200/40 dark:border-amber-800/20
      col-span-2 row-span-2">
      <div className="text-lg sm:text-xl font-bold text-amber-700 dark:text-amber-300 mb-1">
        {chart.fiveElementsClass}
      </div>
      <div className="text-xs text-amber-600 dark:text-amber-400 space-y-0.5">
        <div>命主：{chart.soul}　身主：{chart.body}</div>
        <div>命宫：{chart.soulPalace}　身宫：{chart.bodyPalace}</div>
        <div className="mt-1 text-[10px]">
          {chart.birthSiHua.lu}化禄 {chart.birthSiHua.quan}化权 {chart.birthSiHua.ke}化科 {chart.birthSiHua.ji}化忌
        </div>
        <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
          {chart.gender} · {chart.chineseDate} · {chart.time}
        </div>
        {chart.solarTimeCorrection && (
          <div className="text-[10px] text-blue-500 dark:text-blue-400">
            真太阳时修正{chart.solarTimeCorrection.correctionMinutes > 0 ? '+' : ''}{chart.solarTimeCorrection.correctionMinutes}分
          </div>
        )}
        {/* 运限视角信息 — 大限 */}
        {isScopeView && timeView === 'daxian' && selectedDaXian && (
          <div className={`text-[10px] ${scopeColor} mt-1 pt-1 border-t ${scopeColor}`}>
            {scopeLabel}：{selectedDaXian.palaceName}（{selectedDaXian.startAge}-{selectedDaXian.endAge}岁）· {selectedDaXian.heavenlyStem}{selectedDaXian.earthlyBranch}
            {scopeMingGongBranch && ` · 命宫${scopeMingGongBranch}`}
          </div>
        )}
        {/* 运限视角信息 — 流年 */}
        {isScopeView && timeView === 'liunian' && (
          <div className={`text-[10px] ${scopeColor} mt-1 pt-1 border-t ${scopeColor}`}>
            {scopeLabel}：{liunianYear}年
            {scopeMingGongBranch && ` · 命宫${scopeMingGongBranch}`}
          </div>
        )}
        {/* 当前大限信息（本命视角） */}
        {!isScopeView && currentDaXian && (
          <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 pt-1 border-t border-purple-200/40 dark:border-purple-800/30">
            当前大限：{currentDaXian.palaceName}（{currentDaXian.startAge}-{currentDaXian.endAge}岁）
          </div>
        )}
      </div>
    </div>
  );
}

export default function ZiweiPalaceGrid({ chart }: ZiweiPalaceGridProps) {
  const { selectedPalaceIndex, overlaySiHua, timeView, scopePalaceNames, scopeHoroscopeStars } = useZiweiPalace();

  // 宫格入场动画延迟：巳→午→...→辰，每宫递增 40ms
  const STAGGER_ORDER = [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2]; // 巳→辰
  const animDelayMap = new Map<number, number>();
  STAGGER_ORDER.forEach((palaceIdx, step) => {
    animDelayMap.set(palaceIdx, step * 40);
  });

  // 叠加四化标签前缀
  const overlayLabel = timeView === 'daxian' ? '限' : timeView === 'liunian' ? '年' : '';

  // 计算 三方四正 高亮宫位集合
  const sanFangSet = new Set<number>();
  if (selectedPalaceIndex !== null) {
    const [self, opposite, sanHe1, sanHe2] = [
      selectedPalaceIndex,
      (selectedPalaceIndex + 6) % 12,
      (selectedPalaceIndex + 4) % 12,
      (selectedPalaceIndex + 8) % 12,
    ];
    sanFangSet.add(self);
    sanFangSet.add(opposite);
    sanFangSet.add(sanHe1);
    sanFangSet.add(sanHe2);
  }

  // 构建 4×4 网格
  const grid: (Palace | 'center' | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null));

  // 放置12宫
  for (let i = 0; i < 12; i++) {
    const pos = PALACE_GRID_MAP[i];
    grid[pos.row][pos.col] = chart.palaces[i];
  }

  // 放置中心区域
  grid[1][1] = 'center';

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[480px] sm:min-w-[560px]">
        <div className="grid grid-cols-4 gap-0 border border-amber-300/50 dark:border-amber-700/40
          rounded-lg overflow-hidden bg-amber-50/30 dark:bg-neutral-900/30 relative">
          {grid.map((row, ri) =>
            row.map((cell, ci) => {
              if (cell === 'center') {
                if (ri === 1 && ci === 1) {
                  return <CenterInfo key={`${ri}-${ci}`} chart={chart} />;
                }
                return null;
              }
              if (cell === null) return null;
              const palace = cell as Palace;
              return (
                <PalaceCell
                  key={`${ri}-${ci}`}
                  palace={palace}
                  isSelected={selectedPalaceIndex === palace.index}
                  isSanFang={sanFangSet.has(palace.index) && selectedPalaceIndex !== null}
                  overlaySiHua={overlaySiHua}
                  overlayLabel={overlayLabel}
                  scopePalaceName={scopePalaceNames?.[palace.index]}
                  scopeHoroscopeStarNames={scopeHoroscopeStars?.[palace.index]}
                  animDelay={animDelayMap.get(palace.index)}
                />
              );
            })
          )}

          {/* 三方四正 SVG 叠加层 */}
          {selectedPalaceIndex !== null && (
            <SanFangOverlay selectedPalaceIndex={selectedPalaceIndex} />
          )}
        </div>
      </div>

      {/* 操作提示 */}
      <div className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-2">
        点击宫位查看三方四正 · 点击星曜查看详情
      </div>
    </div>
  );
}
