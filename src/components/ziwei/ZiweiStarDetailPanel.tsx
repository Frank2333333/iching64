/**
 * 星曜详情面板 — 点击星曜后从右侧滑入展示
 *
 * 桌面端：右侧固定面板
 * 移动端：底部抽屉
 * 纯 CSS 过渡动画，不依赖 Framer Motion
 */

import { useZiweiPalace } from './ZiweiPalaceContext';
import { STAR_TYPE_STYLES, SIHUA_STYLES } from '../../data/ziwei-constants';
import { STAR_DESCRIPTIONS, MINOR_STAR_DESCRIPTIONS } from '../../data/ziwei-star-descriptions';
import type { Star } from '../../lib/ziwei-calculator';

interface ZiweiStarDetailPanelProps {
  chart: {
    palaces: { name: string; majorStars: Star[]; minorStars: Star[]; adjectiveStars: Star[] }[];
  };
}

export default function ZiweiStarDetailPanel({ chart }: ZiweiStarDetailPanelProps) {
  const { selectedStar, setSelectedStar } = useZiweiPalace();

  if (!selectedStar) return null;

  // 找到该星曜所在的宫位和星曜对象
  let starData: Star | null = null;
  let palaceName = '';
  for (const p of chart.palaces) {
    const all = [...p.majorStars, ...p.minorStars];
    const found = all.find(s => s.name === selectedStar.name);
    if (found) {
      starData = found;
      palaceName = p.name;
      break;
    }
  }

  if (!starData) return null;

  const typeStyle = STAR_TYPE_STYLES[starData.type];
  const desc = STAR_DESCRIPTIONS[starData.name];
  const minorDesc = MINOR_STAR_DESCRIPTIONS[starData.name];

  const handleClose = () => setSelectedStar(null);

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* 面板 */}
      <div className="fixed z-50
        right-0 top-0 bottom-0 w-96 max-w-[85vw]
        md:right-0 md:top-0 md:bottom-0 md:w-96
        max-md:bottom-0 max-md:top-auto max-md:left-0 max-md:right-0 max-md:w-full max-md:max-h-[70vh] max-md:rounded-t-2xl
        bg-white dark:bg-neutral-800 border-l border-amber-200 dark:border-amber-900/30
        max-md:border-l-0 max-md:border-t
        shadow-xl overflow-y-auto
        transform transition-transform duration-300 ease-out"
      >
        {/* 头部 */}
        <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-amber-100 dark:border-amber-900/20 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-amber-800 dark:text-amber-200">
              {starData.name}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeStyle.light} dark:${typeStyle.dark} bg-gray-50 dark:bg-neutral-700`}>
              {typeStyle.label}
            </span>
            {starData.mutagen && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold
                ${SIHUA_STYLES[starData.mutagen]?.light ?? ''} dark:${SIHUA_STYLES[starData.mutagen]?.dark ?? ''}
                bg-gray-50 dark:bg-neutral-700`}>
                化{starData.mutagen}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full flex items-center justify-center
              text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
              hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 基本信息 */}
          <div className="flex flex-wrap gap-2">
            {(desc?.element || minorDesc?.element) && (
              <span className="text-[11px] px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                五行：{desc?.element || minorDesc?.element}
              </span>
            )}
            {desc?.nature && (
              <span className="text-[11px] px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                {desc.nature}
              </span>
            )}
            <span className="text-[11px] px-2 py-1 rounded-lg bg-gray-50 dark:bg-neutral-700 text-gray-500 dark:text-gray-400">
              {palaceName}
            </span>
            {starData.brightness && (
              <span className="text-[11px] px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                {starData.brightness}
              </span>
            )}
          </div>

          {/* 关键词 */}
          {desc?.keywords && desc.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {desc.keywords.map(kw => (
                <span key={kw} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100/60 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* 简述（辅星） */}
          {minorDesc && !desc && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {minorDesc.description}
            </p>
          )}

          {/* 倪海厦解读 */}
          {desc?.niHaixua && (
            <div className="bg-amber-50/60 dark:bg-amber-900/10 rounded-lg p-3 border border-amber-200/40 dark:border-amber-800/20">
              <div className="text-[11px] text-amber-600 dark:text-amber-400 mb-1 font-medium">倪海厦解读</div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {desc.niHaixua}
              </p>
            </div>
          )}

          {/* 最佳/最差宫位 */}
          {desc?.bestPalace && (
            <div className="flex items-center gap-4 text-xs">
              <span className="text-green-600 dark:text-green-400">
                最佳宫位：{desc.bestPalace}
              </span>
              {desc.worstPalace !== '无' && (
                <span className="text-orange-600 dark:text-orange-400">
                  最差宫位：{desc.worstPalace}
                </span>
              )}
            </div>
          )}

          {/* 四领域分析 */}
          {desc && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '事业', text: desc.career, color: 'text-blue-600 dark:text-blue-400' },
                { label: '感情', text: desc.relationship, color: 'text-pink-600 dark:text-pink-400' },
                { label: '财运', text: desc.wealth, color: 'text-amber-600 dark:text-amber-400' },
                { label: '健康', text: desc.health, color: 'text-green-600 dark:text-green-400' },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 dark:bg-neutral-700/50 rounded-lg p-2.5">
                  <div className={`text-[11px] font-medium ${item.color} mb-1`}>{item.label}</div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
