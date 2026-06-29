/**
 * 命格翻译卡 — 用户自填 MBTI / 星座 / 生肖 / 日主五行性格
 * 可见部分为 Tailwind 卡片（与报告风格一致，关键词可展开）；
 * 分享时序列化隐藏的 SVG 名片为 PNG。
 */
import { useRef, useState } from 'react';
import { Sparkles, Share2, ChevronDown, Loader2, Check } from 'lucide-react';
import type { PersonalityProfile } from '../../data/personality-mapping';
import { downloadSvgAsPng, copySvgAsPng } from '../../lib/svg-to-png';

const FONT = "'PingFang SC','Microsoft YaHei','Hiragino Sans GB',sans-serif";

function wrap(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const ch of text) {
    cur += ch;
    if ([...cur].length >= maxChars) { lines.push(cur); cur = ''; }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

/** 隐藏的 SVG 名片（分享图源） */
function NameCardSvg({ profile, refCb }: { profile: PersonalityProfile; refCb: (el: SVGSVGElement | null) => void }) {
  const W = 750, H = 1000;
  const kwLines = profile.mbtiKeywords;
  const dmLines = wrap(profile.dayMasterOneLiner, 20);
  const kwStartY = 620;
  return (
    <svg
      ref={refCb}
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', left: '-9999px', top: 0, width: W, height: H }}
    >
      <defs>
        <linearGradient id="pc-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a160f" />
          <stop offset="100%" stopColor="#0d0b07" />
        </linearGradient>
        <linearGradient id="pc-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b8862f" />
          <stop offset="50%" stopColor="#f5d98a" />
          <stop offset="100%" stopColor="#b8862f" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#pc-bg)" />
      <rect x="20" y="20" width={W - 40} height={H - 40} rx="18" fill="none" stroke="url(#pc-gold)" strokeWidth="2" />
      <rect x="28" y="28" width={W - 56} height={H - 56} rx="14" fill="none" stroke="#b8862f" strokeOpacity="0.4" strokeWidth="1" />

      <text x={W / 2} y="92" textAnchor="middle" fill="#d4af37" fontSize="26" letterSpacing="6" fontFamily={FONT} fontWeight="600">命格名片</text>
      <line x1="300" y1="112" x2="450" y2="112" stroke="#b8862f" strokeOpacity="0.6" strokeWidth="1" />

      {/* MBTI 大字（未填则提示） */}
      {profile.hasMbti ? (
        <>
          <text x={W / 2} y="250" textAnchor="middle" fill="#f5d98a" fontSize="120" fontFamily={FONT} fontWeight="700" letterSpacing="8">{profile.mbti}</text>
          <text x={W / 2} y="305" textAnchor="middle" fill="#cbb787" fontSize="32" fontFamily={FONT} letterSpacing="4">{profile.mbtiLabel}</text>
        </>
      ) : (
        <text x={W / 2} y="250" textAnchor="middle" fill="#7a6e55" fontSize="34" fontFamily={FONT} letterSpacing="4">MBTI 未填写</text>
      )}

      {/* 标签行 */}
      <text x={W / 2} y="370" textAnchor="middle" fill="#9e8c66" fontSize="24" fontFamily={FONT} letterSpacing="3">
        {`${profile.zodiac} · ${profile.sign} · 命宫${profile.mingStar}${profile.borrowed ? '（借星）' : ''}`}
      </text>

      <line x1="120" y1="410" x2="180" y2="410" stroke="#b8862f" strokeWidth="2" />
      <text x="195" y="417" fill="#d4af37" fontSize="24" fontFamily={FONT} fontWeight="600">日主性格</text>
      <text x="120" y="458" fill="#e8d6a8" fontSize="28" fontFamily={FONT} fontWeight="500">
        {`${profile.dayMaster}${profile.dayMasterElement} · ${profile.dayMasterArchetype}`}
      </text>
      {dmLines.map((l, i) => (
        <text key={i} x="120" y={500 + i * 40} fill="#cbb787" fontSize="24" fontFamily={FONT} letterSpacing="1">{l}</text>
      ))}

      {profile.hasMbti && (
        <>
          <line x1="120" y1={kwStartY} x2="180" y2={kwStartY} stroke="#b8862f" strokeWidth="2" />
          <text x="195" y={kwStartY + 7} fill="#d4af37" fontSize="24" fontFamily={FONT} fontWeight="600">性格关键词</text>
          {kwLines.map((k, i) => (
            <g key={i}>
              <rect x={120 + (i % 2) * 280} y={kwStartY + 30 + Math.floor(i / 2) * 56} width="260" height="44" rx="22" fill="#2a2113" stroke="#b8862f" strokeOpacity="0.5" />
              <text x={250 + (i % 2) * 280} y={kwStartY + 58 + Math.floor(i / 2) * 56} textAnchor="middle" fill="#e8d6a8" fontSize="22" fontFamily={FONT}>{k}</text>
            </g>
          ))}
        </>
      )}

      <text x={W / 2} y={H - 70} textAnchor="middle" fill="#7a6e55" fontSize="20" fontFamily={FONT} letterSpacing="2">iching64.fun</text>
      <text x={W / 2} y={H - 42} textAnchor="middle" fill="#5a4f3a" fontSize="16" fontFamily={FONT} letterSpacing="3">命格翻译仅供参考，请理性看待</text>
    </svg>
  );
}

export default function PersonalityCard({ profile }: { profile: PersonalityProfile | null }) {
  const [expanded, setExpanded] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  if (!profile) return null;

  const handleShare = async () => {
    if (!svgRef.current) return;
    setSharing(true);
    try {
      await downloadSvgAsPng(svgRef.current, `命格名片-${profile.hasMbti ? profile.mbti : '日主'}.png`, 2);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('生成图片失败，请重试');
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = async () => {
    if (!svgRef.current) return;
    const ok = await copySvgAsPng(svgRef.current, 2);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      handleShare(); // 不支持复制则下载
    }
  };

  return (
    <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-2xl p-5 shadow-card border border-amber-200 dark:border-amber-900/30">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-lg font-display font-bold text-amber-900 dark:text-amber-100">
          <Sparkles className="w-5 h-5" />命格翻译
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} disabled={sharing}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50"
            title="复制图片到剪贴板">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? '已复制' : '复制图'}
          </button>
          <button onClick={handleShare} disabled={sharing}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-50">
            {sharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
            分享名片
          </button>
        </div>
      </div>

      {/* 徽章行 */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {profile.hasMbti ? (
          <span className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-base tracking-wider">{profile.mbti}</span>
        ) : (
          <span className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 text-sm border border-dashed border-amber-300 dark:border-amber-700/50">MBTI 未填</span>
        )}
        <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 text-sm">{profile.sign}</span>
        <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 text-sm">属{profile.zodiac}</span>
        <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 text-sm">命宫{profile.mingStar}</span>
        <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 text-sm">{profile.dayMaster}{profile.dayMasterElement}</span>
      </div>

      <p className="text-sm text-amber-800 dark:text-amber-200">
        {profile.hasMbti && (
          <>
            <span className="font-semibold">{profile.mbtiLabel}</span>
            <span className="mx-1.5 text-amber-400">·</span>
          </>
        )}
        日主{profile.dayMasterArchetype}：{profile.dayMasterOneLiner}
      </p>

      {profile.hasMbti && (
        <>
          <button onClick={() => setExpanded(v => !v)}
            className="mt-2 inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline">
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? '收起关键词' : '展开性格关键词'}
          </button>
          {expanded && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.mbtiKeywords.map(k => (
                <span key={k} className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs">{k}</span>
              ))}
            </div>
          )}
        </>
      )}
      <p className="mt-2 text-[11px] text-amber-500/70 dark:text-amber-400/60">MBTI 为你自填；星座/生肖/日主由排盘得出</p>

      <NameCardSvg profile={profile} refCb={(el) => { svgRef.current = el; }} />
    </section>
  );
}
