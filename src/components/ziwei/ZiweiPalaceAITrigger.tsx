/**
 * 宫位 AI 分析触发器
 *
 * 监听 selectedPalaceIndex 变化，自动注入宫位专用 AI 分析 prompt。
 * 根据 timeView 自动追加运限（大限/流年）上下文。
 * 使用 useRef 防止重复触发。
 */

import { useEffect, useRef } from 'react';
import { useZiweiPalace } from './ZiweiPalaceContext';
import { PALACE_ROLES, TIAN_GAN_NAMES } from '../../data/ziwei-constants';
import type { ZiweiChart } from '../../lib/ziwei-calculator';

interface ZiweiPalaceAITriggerProps {
  chart: ZiweiChart;
  onPalaceAnalyze: (prompt: string) => void;
  disabled?: boolean;
}

export default function ZiweiPalaceAITrigger({ chart, onPalaceAnalyze, disabled }: ZiweiPalaceAITriggerProps) {
  const { selectedPalaceIndex, timeView, selectedDaXianIndex, liunianYear, overlaySiHua, scopePalaceNames } = useZiweiPalace();
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

    // 基础 prompt（本命视角）
    let prompt = `请重点分析【${palace.name}】（主管：${role}），该宫主星为${majorStarNames}${minorStarNames ? '，辅星有' + minorStarNames : ''}，三方四正宫位为${sanFangNames}。请按以下结构输出：

【宫位定性】${palace.name}在命盘中的核心意义与影响
【主星解读】主星在此宫的倪海厦体系解读，结合庙旺利陷分析
【三方四正联动】三方四正宫位对此宫的影响与配合
【实际建议】基于此宫位配置的具体建议`;

    // 运限上下文追加
    if (timeView === 'daxian') {
      const daXian = selectedDaXianIndex >= 0 && selectedDaXianIndex < chart.daXians.length
        ? chart.daXians[selectedDaXianIndex]
        : null;
      if (daXian) {
        const sihuaStr = overlaySiHua
          ? Object.entries(overlaySiHua).map(([star, type]) => `${star}化${type}`).join('、')
          : '未知';
        const scopeMingGong = scopePalaceNames?.[daXian.palaceIndex] || '';
        prompt += `

【重要：当前为大限视角】
第${selectedDaXianIndex + 1}步大限（${daXian.startAge}-${daXian.endAge}岁），大限天干${daXian.heavenlyStem}，大限四化：${sihuaStr}。${scopeMingGong ? `大限命宫位于${scopeMingGong}。` : ''}
请结合大限运势，分析此宫位在当前大限中的影响，特别关注大限四化对该宫位的作用。`;
      }
    } else if (timeView === 'liunian') {
      const sihuaStr = overlaySiHua
        ? Object.entries(overlaySiHua).map(([star, type]) => `${star}化${type}`).join('、')
        : '未知';
      const stemIdx = ((liunianYear - 4) % 10 + 10) % 10;
      const stemName = TIAN_GAN_NAMES[stemIdx] || '?';
      prompt += `

【重要：当前为流年视角】
${liunianYear}年（${stemName}年），流年四化：${sihuaStr}。
请结合流年运势，分析此宫位在${liunianYear}年的影响，特别关注流年四化对该宫位的作用。`;
    }

    onPalaceAnalyze(prompt);
  }, [selectedPalaceIndex, chart, onPalaceAnalyze, disabled, timeView, selectedDaXianIndex, liunianYear, overlaySiHua, scopePalaceNames]);

  return null; // 无 UI 渲染
}
