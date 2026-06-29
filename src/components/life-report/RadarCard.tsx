/**
 * 潜能雷达卡 — 六维潜能雷达图 + 每轴紫微点评 + 分享
 */
import { useRef, useState } from 'react';
import { Radar as RadarIcon, Share2, Loader2, Check, RefreshCw } from 'lucide-react';
import RadarChart from './RadarChart';
import type { RadarResult, RadarAxis } from '../../lib/life-report-api';
import { downloadSvgAsPng, copySvgAsPng } from '../../lib/svg-to-png';

const AXES: { key: RadarAxis; label: string }[] = [
  { key: 'drive', label: '事业魄力' },
  { key: 'wealth', label: '财富积累' },
  { key: 'charm', label: '人际魅力' },
  { key: 'creative', label: '创造思维' },
  { key: 'resilience', label: '抗压稳定' },
  { key: 'execution', label: '行动执行' },
];

interface Props {
  radar: RadarResult | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function RadarCard({ radar, loading, error, onRefresh }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!svgRef.current) return;
    setSharing(true);
    try { await downloadSvgAsPng(svgRef.current, '潜能雷达.png', 2); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { alert('生成图片失败'); }
    finally { setSharing(false); }
  };
  const handleCopy = async () => {
    if (!svgRef.current) return;
    const ok = await copySvgAsPng(svgRef.current, 2);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); } else { await handleShare(); }
  };

  return (
    <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-2xl p-5 shadow-card border border-amber-200 dark:border-amber-900/30">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-lg font-display font-bold text-amber-900 dark:text-amber-100">
          <RadarIcon className="w-5 h-5" />潜能雷达
        </h2>
        {radar && (
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} disabled={sharing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? '已复制' : '复制图'}
            </button>
            <button onClick={handleShare} disabled={sharing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-50">
              {sharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
              分享雷达
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 text-sm py-16">
          <Loader2 className="w-5 h-5 animate-spin" />正在结合紫微盘评估你的潜能...
        </div>
      )}
      {error && (
        <div className="text-sm text-red-600 py-8 text-center">
          {error}
          <button onClick={onRefresh} className="ml-2 underline">重试</button>
        </div>
      )}

      {radar && (
        <>
          <div className="rounded-xl overflow-hidden border border-amber-200 dark:border-amber-900/30 max-w-[420px] mx-auto">
            <RadarChart ref={svgRef} scores={radar.scores} />
          </div>

          {/* 各轴点评 */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AXES.map(ax => {
              const score = Math.round(radar.scores[ax.key] ?? 0);
              const comment = radar.comments[ax.key];
              return (
                <div key={ax.key} className="flex items-start gap-2 bg-white dark:bg-neutral-800 rounded-lg p-2 border border-amber-100 dark:border-amber-900/30">
                  <span className={`flex-none px-2 py-0.5 rounded text-xs font-bold text-white ${score >= 70 ? 'bg-amber-600' : score >= 50 ? 'bg-amber-500' : 'bg-amber-400'}`}>{score}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-amber-900 dark:text-amber-100">{ax.label}</div>
                    {comment && <div className="text-[11px] text-amber-700 dark:text-amber-300 leading-snug mt-0.5">{comment}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-[11px] text-amber-500/70 dark:text-amber-400/60">基础分由八字+MBTI本地计算，紫微盘 AI 在 ±15 内微调</p>
            <button onClick={onRefresh} disabled={loading}
              className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-40">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />重新评估
            </button>
          </div>
        </>
      )}
    </section>
  );
}
