/**
 * 宫位 AI 分析触发器
 *
 * 监听 selectedPalaceIndex 变化，自动注入宫位专用 AI 分析 prompt。
 * 使用 useRef 防止重复触发。
 */

import { useEffect, useRef } from 'react';
import { useZiweiPalace } from './ZiweiPalaceContext';
import { PALACE_ROLES } from '../../data/ziwei-constants';
import type { ZiweiChart } from '../../lib/ziwei-calculator';

interface ZiweiPalaceAITriggerProps {
  chart: ZiweiChart;
  onPalaceAnalyze: (prompt: string) => void;
  disabled?: boolean;
}

export default function ZiweiPalaceAITrigger({ chart, onPalaceAnalyze, disabled }: ZiweiPalaceAITriggerProps) {
  const { selectedPalaceIndex } = useZiweiPalace();
  const lastAnalyzedRef = useRef<number | null>(null);

  useEffect(() => {
    if (disabled) return;
    if (selectedPalaceIndex === null) return;
    if (selectedPalaceIndex === lastAnalyzedRef.current) return;

    lastAnalyzedRef.current = selectedPalaceIndex;

    const palace = chart.palaces.find(p => p.index === selectedPalaceIndex);
    if (!palace) return;

    const role = PALACE_ROLES[palace.name] || '综合';
    const majorStarNames = palace.majorStars.map(s => s.name).join('、') || '无主星（空宫）';
    const minorStarNames = palace.minorStars.map(s => {
      let name = s.name;
      if (s.mutagen) name += `（化${s.mutagen}）`;
      return name;
    }).join('、');

    const sanFangNames = palace.sanFangIndices
      .map(i => chart.palaces[i]?.name)
      .filter(Boolean)
      .join('、');

    const prompt = `请重点分析【${palace.name}】（主管：${role}），该宫主星为${majorStarNames}${minorStarNames ? '，辅星有' + minorStarNames : ''}，三方四正宫位为${sanFangNames}。请按以下结构输出：

【宫位定性】${palace.name}在命盘中的核心意义与影响
【主星解读】主星在此宫的倪海厦体系解读，结合庙旺利陷分析
【三方四正联动】三方四正宫位对此宫的影响与配合
【实际建议】基于此宫位配置的具体建议`;

    onPalaceAnalyze(prompt);
  }, [selectedPalaceIndex, chart, onPalaceAnalyze, disabled]);

  return null; // 无 UI 渲染
}
