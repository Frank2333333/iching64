import type { ZiweiChart, Palace, Star } from '../../lib/ziwei-calculator';
import { PALACE_GRID_MAP, STAR_TYPE_STYLES, SIHUA_STYLES } from '../../data/ziwei-constants';

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

/** 星曜显示 */
function StarDisplay({ star, size = 'normal' }: { star: Star; size?: 'normal' | 'small' }) {
  const typeStyle = STAR_TYPE_STYLES[star.type];
  const isLarge = size === 'normal';

  return (
    <span className={`inline-flex items-center gap-0.5 ${isLarge ? 'text-sm font-bold' : 'text-[11px]'}`}>
      <span className={typeStyle.light + ' dark:' + typeStyle.dark}>
        {star.name}
      </span>
      {star.brightness && isLarge && (
        <span className="text-[9px] text-gray-400 dark:text-gray-500">{star.brightness}</span>
      )}
      {star.mutagen && <SihuaBadge mutagen={star.mutagen} />}
    </span>
  );
}

/** 单个宫位格子 */
function PalaceCell({ palace }: { palace: Palace }) {
  const isMing = palace.name === '命宫';
  const isBody = palace.isBodyPalace;

  return (
    <div className={`relative p-1.5 sm:p-2 border border-amber-200/60 dark:border-amber-800/30
      ${isMing ? 'bg-amber-50/80 dark:bg-amber-900/20' : 'bg-white/50 dark:bg-neutral-800/50'}
      min-h-[100px] sm:min-h-[120px] flex flex-col`}>
      {/* 宫名+天干地支 */}
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-bold ${isMing ? 'text-amber-700 dark:text-amber-300' : 'text-amber-800/80 dark:text-amber-400/80'}`}>
          {palace.name}
          {isBody && <span className="text-[10px] ml-0.5 text-purple-600 dark:text-purple-400">身</span>}
        </span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400">
          {palace.heavenlyStem}{palace.earthlyBranch}
        </span>
      </div>

      {/* 主星 */}
      {palace.majorStars.length > 0 && (
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
          {palace.majorStars.map((s) => <StarDisplay key={s.name} star={s} size="normal" />)}
        </div>
      )}

      {/* 辅星 */}
      {palace.minorStars.length > 0 && (
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 mt-0.5">
          {palace.minorStars.map((s) => <StarDisplay key={s.name} star={s} size="small" />)}
        </div>
      )}

      {/* 杂耀 */}
      {palace.adjectiveStars.length > 0 && (
        <div className="flex flex-wrap gap-x-1 gap-y-0.5 mt-0.5">
          {palace.adjectiveStars.map((s) => (
            <span key={s.name} className="text-[10px] text-gray-400 dark:text-gray-500">{s.name}</span>
          ))}
        </div>
      )}

      {/* 长生十二神 + 大限 */}
      <div className="mt-auto pt-0.5 flex items-center justify-between">
        <span className="text-[9px] text-gray-400 dark:text-gray-600">{palace.changsheng12}</span>
        {palace.decadal && (
          <span className="text-[9px] text-blue-500/70 dark:text-blue-400/50">
            {palace.decadal.range[0]}-{palace.decadal.range[1]}
          </span>
        )}
      </div>
    </div>
  );
}

/** 中心信息区 */
function CenterInfo({ chart }: { chart: ZiweiChart }) {
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
      </div>
    </div>
  );
}

export default function ZiweiPalaceGrid({ chart }: ZiweiPalaceGridProps) {
  // 构建 4×4 网格
  // grid[row][col] = palace | 'center' | null
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
          rounded-lg overflow-hidden bg-amber-50/30 dark:bg-neutral-900/30">
          {grid.map((row, ri) =>
            row.map((cell, ci) => {
              if (cell === 'center') {
                // 中心信息区只在 (1,1) 渲染，占 2×2
                if (ri === 1 && ci === 1) {
                  return <CenterInfo key={`${ri}-${ci}`} chart={chart} />;
                }
                return null; // (1,2), (2,1), (2,2) 被 col-span-2 row-span-2 覆盖
              }
              if (cell === null) return null;
              return <PalaceCell key={`${ri}-${ci}`} palace={cell} />;
            })
          )}
        </div>
      </div>
    </div>
  );
}
