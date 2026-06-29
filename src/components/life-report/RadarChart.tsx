/**
 * 潜能雷达图 — 纯 SVG（六维），既是可见 UI 也是分享图源
 * 自包含：含标题/轴标签/分数/品牌水印，零依赖。
 */
import { forwardRef } from 'react';
import type { RadarScores, RadarAxis } from '../../lib/life-report-api';

const AXES: { key: RadarAxis; label: string }[] = [
  { key: 'drive', label: '事业魄力' },
  { key: 'wealth', label: '财富积累' },
  { key: 'charm', label: '人际魅力' },
  { key: 'creative', label: '创造思维' },
  { key: 'resilience', label: '抗压稳定' },
  { key: 'execution', label: '行动执行' },
];

const W = 460, H = 520;
const CX = W / 2, CY = 250;
const MAX_R = 150;
const RINGS = [0.25, 0.5, 0.75, 1];

const FONT = "'PingFang SC','Microsoft YaHei','Hiragino Sans GB',sans-serif";

function point(angleDeg: number, r: number): { x: number; y: number } {
  const a = (angleDeg - 90) * Math.PI / 180; // 0° 朝上
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

const RadarChart = forwardRef<SVGSVGElement, { scores: RadarScores }>(function RadarChart(
  { scores },
  ref,
) {
  const vertices = AXES.map((ax, i) => {
    const angle = (360 / AXES.length) * i;
    const r = (Math.max(0, Math.min(100, scores[ax.key] ?? 0)) / 100) * MAX_R;
    return { ...point(angle, r), angle, ...ax, raw: point(angle, MAX_R) };
  });
  const polyPoints = vertices.map(v => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' ');
  const labelR = MAX_R + 26;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="radar-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5d98a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="radar-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a160f" />
          <stop offset="100%" stopColor="#0d0b07" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#radar-bg)" />
      <rect x="14" y="14" width={W - 28} height={H - 28} rx="14" fill="none" stroke="#b8862f" strokeOpacity="0.4" strokeWidth="1" />

      {/* 标题 */}
      <text x={W / 2} y="42" textAnchor="middle" fill="#d4af37" fontSize="24" letterSpacing="6" fontFamily={FONT} fontWeight="600">潜能雷达</text>
      <line x1="170" y1="58" x2="290" y2="58" stroke="#b8862f" strokeOpacity="0.6" strokeWidth="1" />

      {/* 网格环 */}
      {RINGS.map((rr, i) => {
        const pts = AXES.map((_, ai) => {
          const p = point((360 / AXES.length) * ai, MAX_R * rr);
          return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        }).join(' ');
        return <polygon key={i} points={pts} fill="none" stroke="#b8862f" strokeOpacity={0.25 + i * 0.05} strokeWidth="1" />;
      })}

      {/* 轴线 + 标签 */}
      {AXES.map((ax, i) => {
        const angle = (360 / AXES.length) * i;
        const end = point(angle, MAX_R);
        const lp = point(angle, labelR);
        const anchor = Math.abs(lp.x - CX) < 6 ? 'middle' : lp.x > CX ? 'start' : 'end';
        const score = Math.round(scores[ax.key] ?? 0);
        return (
          <g key={ax.key}>
            <line x1={CX} y1={CY} x2={end.x} y2={end.y} stroke="#b8862f" strokeOpacity="0.3" strokeWidth="1" />
            <text x={lp.x} y={lp.y - 4} textAnchor={anchor} fill="#e8d6a8" fontSize="15" fontFamily={FONT} fontWeight="600">{ax.label}</text>
            <text x={lp.x} y={lp.y + 14} textAnchor={anchor} fill="#f5d98a" fontSize="16" fontFamily={FONT} fontWeight="700">{score}</text>
          </g>
        );
      })}

      {/* 数据多边形 */}
      <polygon points={polyPoints} fill="url(#radar-fill)" stroke="#f5d98a" strokeWidth="2" strokeLinejoin="round" />
      {vertices.map((v, i) => (
        <circle key={i} cx={v.x} cy={v.y} r="3.5" fill="#f5d98a" stroke="#1a160f" strokeWidth="1" />
      ))}

      {/* 底部 */}
      <text x={W / 2} y={H - 42} textAnchor="middle" fill="#7a6e55" fontSize="16" fontFamily={FONT} letterSpacing="2">iching64.fun</text>
      <text x={W / 2} y={H - 22} textAnchor="middle" fill="#5a4f3a" fontSize="13" fontFamily={FONT} letterSpacing="2">AI 综合紫微评估 · 仅供参考</text>
    </svg>
  );
});

export default RadarChart;
