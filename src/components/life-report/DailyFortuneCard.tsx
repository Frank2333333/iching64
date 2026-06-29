/**
 * 今日运势卡 — 整张以 SVG 渲染（既是可见 UI，也是分享图序列化源）
 * 深色金色主题，竖版适合分享。文字用系统字体栈，自包含无外部资源。
 */
import { forwardRef } from 'react';
import type { TodayGanZhi, DayTone } from '../../lib/daily-fortune';
import type { DailyFortuneData } from '../../lib/life-report-api';
import type { PersonalityProfile } from '../../data/personality-mapping';

interface Props {
  profile: PersonalityProfile | null;
  today: TodayGanZhi;
  tone: DayTone;
  data: DailyFortuneData | null;
  loading?: boolean;
}

const W = 750;
const H = 1180;

/** 按字符数把中文文本折成多行 */
function wrap(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const ch of text) {
    cur += ch;
    if ([...cur].length >= maxChars) {
      lines.push(cur);
      cur = '';
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

/** 运势等级 → 颜色与文案 */
function levelMeta(level: number): { stars: string; color: string; word: string } {
  const map: Record<number, { stars: string; color: string; word: string }> = {
    5: { stars: '★★★★★', color: '#FFD66B', word: '大吉' },
    4: { stars: '★★★★☆', color: '#F2C14E', word: '小吉' },
    3: { stars: '★★★☆☆', color: '#D9B382', word: '平稳' },
    2: { stars: '★★☆☆☆', color: '#9E8C66', word: '谨慎' },
    1: { stars: '★☆☆☆☆', color: '#7A6E55', word: '宜守' },
  };
  return map[level] || map[3];
}

const FONT = "'PingFang SC','Microsoft YaHei','Hiragino Sans GB',sans-serif";

const DailyFortuneCard = forwardRef<SVGSVGElement, Props>(function DailyFortuneCard(
  { profile, today, tone, data, loading },
  ref,
) {
  const level = data?.level ?? 3;
  const meta = levelMeta(level);
  const dateLabel = `${today.date} · 农历 ${today.monthGan}${today.monthZhi}月 ${today.dayGan}${today.dayZhi}日`;
  const tip = data?.tip || (loading ? '正在为你测算今日…' : '');
  const yi = data?.yi || [];
  const ji = data?.ji || [];
  const commentLines = data?.comment ? wrap(data.comment, 22) : [];

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
        <linearGradient id="df-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a160f" />
          <stop offset="55%" stopColor="#0d0b07" />
          <stop offset="100%" stopColor="#16110a" />
        </linearGradient>
        <linearGradient id="df-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b8862f" />
          <stop offset="50%" stopColor="#f5d98a" />
          <stop offset="100%" stopColor="#b8862f" />
        </linearGradient>
        <radialGradient id="df-glow" cx="50%" cy="32%" r="60%">
          <stop offset="0%" stopColor="#3a2e15" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3a2e15" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 背景 */}
      <rect width={W} height={H} fill="url(#df-bg)" />
      <rect width={W} height={H} fill="url(#df-glow)" />
      {/* 金边 */}
      <rect x="20" y="20" width={W - 40} height={H - 40} rx="18" fill="none" stroke="url(#df-gold)" strokeWidth="2" />
      <rect x="28" y="28" width={W - 56} height={H - 56} rx="14" fill="none" stroke="#b8862f" strokeOpacity="0.4" strokeWidth="1" />

      {/* 标题 */}
      <text x={W / 2} y="80" textAnchor="middle" fill="#d4af37" fontSize="26" letterSpacing="6" fontFamily={FONT} fontWeight="600">今日运势</text>
      <line x1="300" y1="100" x2="450" y2="100" stroke="#b8862f" strokeOpacity="0.6" strokeWidth="1" />

      {/* 日期 + 生肖星座 */}
      <text x={W / 2} y="140" textAnchor="middle" fill="#cbb787" fontSize="22" fontFamily={FONT}>{dateLabel}</text>
      <text x={W / 2} y="176" textAnchor="middle" fill="#9e8c66" fontSize="20" fontFamily={FONT} letterSpacing="2">
        {profile ? `${profile.zodiac} · ${profile.sign} · 日主${profile.dayMaster}${profile.dayMasterElement}` : ''}
      </text>

      {/* 运势等级 */}
      <text x={W / 2} y="290" textAnchor="middle" fill={meta.color} fontSize="58" letterSpacing="10" fontFamily={FONT}>{meta.stars}</text>
      <text x={W / 2} y="345" textAnchor="middle" fill={meta.color} fontSize="34" fontFamily={FONT} fontWeight="600" letterSpacing="8">{meta.word}</text>

      {/* 一句话点拨 */}
      {tip && (
        <g>
          <rect x="80" y="390" width={W - 160} height="90" rx="12" fill="#2a2113" stroke="#b8862f" strokeOpacity="0.5" />
          <text x={W / 2} y="445" textAnchor="middle" fill="#f5d98a" fontSize="30" fontFamily={FONT} fontWeight="500">
            {tip.length > 14 ? tip.slice(0, 14) + '…' : tip}
          </text>
        </g>
      )}

      {/* 宜 / 忌 */}
      <g>
        {/* 宜 */}
        <rect x="80" y="520" width={W - 160} height={Math.max(110, 60 + yi.length * 38)} rx="12" fill="#1d1a12" stroke="#7a9b5e" strokeOpacity="0.55" />
        <text x="110" y="562" fill="#9ec98a" fontSize="30" fontFamily={FONT} fontWeight="600">宜</text>
        {yi.length > 0 ? yi.map((y, i) => (
          <text key={i} x="170" y={562 + i * 40} fill="#d8c9a3" fontSize="24" fontFamily={FONT}>{y}</text>
        )) : (
          <text x="170" y="562" fill="#7a6e55" fontSize="22" fontFamily={FONT}>{loading ? '…' : '随性一日'}</text>
        )}

        {/* 忌 */}
        <rect x="80" y={660} width={W - 160} height={Math.max(110, 60 + ji.length * 38)} rx="12" fill="#1d1a12" stroke="#b06055" strokeOpacity="0.55" />
        <text x="110" y="702" fill="#d68a7e" fontSize="30" fontFamily={FONT} fontWeight="600">忌</text>
        {ji.length > 0 ? ji.map((j, i) => (
          <text key={i} x="170" y={702 + i * 40} fill="#d8c9a3" fontSize="24" fontFamily={FONT}>{j}</text>
        )) : (
          <text x="170" y="702" fill="#7a6e55" fontSize="22" fontFamily={FONT}>{loading ? '…' : '无明显禁忌'}</text>
        )}
      </g>

      {/* 简评 */}
      {commentLines.length > 0 && (
        <g>
          <line x1="80" y1="850" x2="120" y2="850" stroke="#b8862f" strokeWidth="2" />
          <text x="135" y="856" fill="#d4af37" fontSize="22" fontFamily={FONT} fontWeight="600">今日点拨</text>
          {commentLines.map((line, i) => (
            <text key={i} x="80" y={895 + i * 38} fill="#cbb787" fontSize="24" fontFamily={FONT} letterSpacing="1">{line}</text>
          ))}
        </g>
      )}

      {/* 底部：流日干支 + 主调 + 水印 */}
      <line x1="80" y1={H - 150} x2={W - 80} y2={H - 150} stroke="#b8862f" strokeOpacity="0.4" strokeWidth="1" />
      <text x="80" y={H - 108} fill="#9e8c66" fontSize="20" fontFamily={FONT}>
        {`流日 ${today.dayGan}${today.dayZhi} · ${tone.label}`}
      </text>
      <text x="80" y={H - 76} fill="#7a6e55" fontSize="18" fontFamily={FONT}>{tone.hint}</text>
      <text x={W - 80} y={H - 76} textAnchor="end" fill="#7a6e55" fontSize="20" fontFamily={FONT} letterSpacing="2">iching64.fun</text>

      <text x={W / 2} y={H - 44} textAnchor="middle" fill="#5a4f3a" fontSize="16" fontFamily={FONT} letterSpacing="3">
        双盘合参 · 仅供参考，请理性看待
      </text>
    </svg>
  );
});

export default DailyFortuneCard;
