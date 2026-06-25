/**
 * 格局识别展示卡片
 *
 * 显示 detectPatterns 检测到的所有格局，
 * 按级别分组，每项展示名称、描述、宫位标签、条件详情。
 */

import { useState } from 'react';
import type { ZiweiChart } from '../../lib/ziwei-calculator';
import { detectPatterns, type Pattern } from '../../lib/ziwei-patterns';

const LEVEL_CONFIG = {
  excellent: { label: '上格', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-700' },
  good: { label: '吉格', dot: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-700' },
  neutral: { label: '平格', dot: 'bg-gray-400', text: 'text-gray-500 dark:text-gray-400', border: 'border-gray-300 dark:border-gray-600' },
  caution: { label: '凶格', dot: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-700' },
} as const;

function PatternItem({ pattern }: { pattern: Pattern }) {
  const [expanded, setExpanded] = useState(false);
  const config = LEVEL_CONFIG[pattern.level];

  return (
    <div
      className={`rounded-lg border p-3 transition-colors cursor-pointer
        ${config.border} hover:bg-amber-50/30 dark:hover:bg-neutral-800/30`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        <span className={`font-medium text-sm ${config.text}`}>
          {pattern.name}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-gray-400">
          {config.label}
        </span>
        {pattern.palaces.map(p => (
          <span key={p} className="text-[10px] px-1 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
            {p}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
        {pattern.description}
      </p>

      {expanded && pattern.conditions && (
        <div className="mt-2 space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
          {pattern.conditions.required.length > 0 && (
            <div>必须：{pattern.conditions.required.join('、')}</div>
          )}
          {pattern.conditions.bonus && pattern.conditions.bonus.length > 0 && (
            <div className="text-blue-500 dark:text-blue-400">加分：{pattern.conditions.bonus.join('、')}</div>
          )}
          {pattern.conditions.breaking && pattern.conditions.breaking.length > 0 && (
            <div className="text-orange-500 dark:text-orange-400">破格：{pattern.conditions.breaking.join('、')}</div>
          )}
        </div>
      )}

      {expanded && pattern.source && (
        <div className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 italic">
          出处：{pattern.source}
        </div>
      )}
    </div>
  );
}

interface ZiweiPatternsCardProps {
  chart: ZiweiChart;
}

export default function ZiweiPatternsCard({ chart }: ZiweiPatternsCardProps) {
  const patterns = detectPatterns(chart);

  if (patterns.length === 0) return null;

  // 按级别排序：excellent → good → neutral → caution
  const levelOrder: Record<Pattern['level'], number> = { excellent: 0, good: 1, neutral: 2, caution: 3 };
  const sorted = [...patterns].sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

  const counts = {
    excellent: patterns.filter(p => p.level === 'excellent').length,
    good: patterns.filter(p => p.level === 'good').length,
    neutral: patterns.filter(p => p.level === 'neutral').length,
    caution: patterns.filter(p => p.level === 'caution').length,
  };

  return (
    <div className="bg-white/60 dark:bg-neutral-800/60 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2">
          格局识别
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            {patterns.length}
          </span>
        </h3>
        <div className="flex items-center gap-2 text-[10px]">
          {counts.excellent > 0 && <span className="text-amber-600 dark:text-amber-400">上格×{counts.excellent}</span>}
          {counts.good > 0 && <span className="text-blue-600 dark:text-blue-400">吉格×{counts.good}</span>}
          {counts.neutral > 0 && <span className="text-gray-500 dark:text-gray-400">平格×{counts.neutral}</span>}
          {counts.caution > 0 && <span className="text-orange-600 dark:text-orange-400">凶格×{counts.caution}</span>}
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((p, i) => (
          <PatternItem key={`${p.name}-${i}`} pattern={p} />
        ))}
      </div>

      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-center">
        点击格局查看详细条件 · 基于倪海厦天纪体系
      </p>
    </div>
  );
}
