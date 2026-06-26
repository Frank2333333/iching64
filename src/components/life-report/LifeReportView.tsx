import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Loader2, BookOpen, User, Compass } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';
import BaziChatInput from '../bazi/BaziChatInput';
import LifeTimeline from './LifeTimeline';
import type { BaziChart } from '../../lib/bazi-calculator';
import type { ZiweiChart } from '../../lib/ziwei-calculator';
import type { LifeReportInput, SectionType, ChatMessage } from '../../lib/life-report-api';

interface SectionState {
  loading: boolean;
  error: string | null;
  content: string | null;
}

interface LifeReportViewProps {
  input: LifeReportInput;
  baziChart: BaziChart | null;
  ziweiChart: ZiweiChart | null;
  overview: SectionState;
  sections: Record<SectionType, SectionState>;
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  chatError: string | null;
  chatInput: string;
  onChatInputChange: (v: string) => void;
  onSendChat: () => void;
  onChatKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onBackToInput: () => void;
}

const SECTION_ORDER: SectionType[] = ['career', 'wealth', 'marriage', 'health', 'trend'];
const SECTION_TITLES: Record<SectionType, string> = {
  career: '事业',
  wealth: '财富',
  marriage: '感情',
  health: '健康',
  trend: '运势走向',
};
const SECTION_ICONS: Record<SectionType, string> = {
  career: '💼',
  wealth: '💰',
  marriage: '❤️',
  health: '🌿',
  trend: '🌊',
};

function SectionBlock({ title, icon, state }: { title: string; icon: string; state: SectionState }) {
  return (
    <section className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-md border border-amber-200 dark:border-amber-900/30">
      <h2 className="flex items-center gap-2 text-lg font-bold text-amber-900 dark:text-amber-100 mb-3">
        <span>{icon}</span>
        {title}
      </h2>
      {state.loading && (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          正在为你撰写这一章...
        </div>
      )}
      {state.error && (
        <div className="text-sm text-red-600 py-2">
          {state.error}
          <button onClick={() => window.location.reload()} className="ml-2 underline">重试</button>
        </div>
      )}
      {state.content && <MarkdownRenderer content={state.content} className="text-sm md:text-base" />}
    </section>
  );
}

function ChartDetailToggle({ baziChart, ziweiChart }: { baziChart: BaziChart | null; ziweiChart: ZiweiChart | null }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'bazi' | 'ziwei'>('bazi');

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-md border border-amber-200 dark:border-amber-900/30 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-amber-900 dark:text-amber-100 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
      >
        <span className="flex items-center gap-2 font-semibold">
          <BookOpen className="w-5 h-5" />
          命盘详情（给想深入的你）
        </span>
        {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab('bazi')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'bazi' ? 'bg-amber-500 text-white' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'}`}
            >
              八字四柱
            </button>
            <button
              onClick={() => setTab('ziwei')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'ziwei' ? 'bg-amber-500 text-white' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'}`}
            >
              紫微十二宫
            </button>
          </div>

          {tab === 'bazi' && baziChart && (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-5 gap-2 text-center font-semibold text-amber-800 dark:text-amber-200">
                <div></div><div>年柱</div><div>月柱</div><div>日柱</div><div>时柱</div>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="text-amber-600 dark:text-amber-400 text-xs self-center">干支</div>
                {[baziChart.yearPillar, baziChart.monthPillar, baziChart.dayPillar, baziChart.hourPillar].map((p, i) => (
                  <div key={i} className="text-base font-bold text-amber-900 dark:text-amber-100">{p.gan}{p.zhi}</div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="text-amber-600 dark:text-amber-400 text-xs self-center">十神</div>
                {[baziChart.yearPillar, baziChart.monthPillar, baziChart.dayPillar, baziChart.hourPillar].map((p, i) => (
                  <div key={i} className="text-xs text-amber-700 dark:text-amber-300">{p.shiShen.join('/')}</div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="text-amber-600 dark:text-amber-400 text-xs self-center">藏干</div>
                {[baziChart.yearPillar, baziChart.monthPillar, baziChart.dayPillar, baziChart.hourPillar].map((p, i) => (
                  <div key={i} className="text-xs text-amber-700 dark:text-amber-300">{p.cangGan.join('')}</div>
                ))}
              </div>
              <div className="pt-2 mt-2 border-t border-amber-100 dark:border-amber-900/30 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                <div>日主：{baziChart.dayMaster}{baziChart.dayMasterElement} · {baziChart.dayMasterStrength}</div>
                <div>格局：{baziChart.pattern}</div>
                <div>用神：{baziChart.yongShen} · 喜神：{baziChart.xiShen} · 忌神：{baziChart.jiShen}</div>
              </div>
            </div>
          )}

          {tab === 'ziwei' && ziweiChart && (
            <div className="space-y-1.5 text-xs">
              <div className="text-amber-700 dark:text-amber-300 mb-2">
                命宫：{ziweiChart.soulPalace} · 命主：{ziweiChart.soul} · 身主：{ziweiChart.body} · {ziweiChart.fiveElementsClass}
              </div>
              <div className="text-amber-700 dark:text-amber-300 mb-2">
                四化：{ziweiChart.birthSiHua.lu}化禄 {ziweiChart.birthSiHua.quan}化权 {ziweiChart.birthSiHua.ke}化科 {ziweiChart.birthSiHua.ji}化忌
              </div>
              {ziweiChart.palaces.map((p) => {
                const stars = [
                  ...p.majorStars.map((s) => s.name + (s.brightness ? `(${s.brightness})` : '') + (s.mutagen ? `[化${s.mutagen}]` : '')),
                  ...p.minorStars.map((s) => s.name + (s.mutagen ? `[化${s.mutagen}]` : '')),
                ];
                return (
                  <div key={p.index} className="flex gap-2 py-1 border-b border-amber-50 dark:border-amber-900/20">
                    <span className="w-20 flex-none text-amber-800 dark:text-amber-200 font-medium">
                      {p.name}{p.isBodyPalace ? '(身)' : ''}
                    </span>
                    <span className="text-amber-700 dark:text-amber-300">{stars.join(' ') || '空宫'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LifeReportView({
  input,
  baziChart,
  ziweiChart,
  overview,
  sections,
  chatMessages,
  chatLoading,
  chatError,
  chatInput,
  onChatInputChange,
  onSendChat,
  onChatKeyDown,
  onBackToInput,
}: LifeReportViewProps) {
  const genderText = input.gender === 'male' ? '男' : '女';

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* 报告头 */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-serif font-bold text-amber-900 dark:text-amber-100 flex items-center justify-center gap-2">
            <Compass className="w-6 h-6" />
            你的人生发展报告
          </h1>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            {input.year}年{input.month}月{input.day}日 · {genderText} · {input.birthplace || '出生地未填'}
          </p>
        </div>

        {/* 本命总览 */}
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-2xl p-6 shadow-md border border-amber-200 dark:border-amber-900/30">
          <h2 className="flex items-center gap-2 text-xl font-bold text-amber-900 dark:text-amber-100 mb-3">
            <User className="w-5 h-5" />
            本命总览
          </h2>
          {overview.loading && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              正在读懂你，请稍候...
            </div>
          )}
          {overview.error && (
            <div className="text-sm text-red-600 py-2">{overview.error}</div>
          )}
          {overview.content && <MarkdownRenderer content={overview.content} className="text-sm md:text-base" />}
        </section>

        {/* 时间轴 */}
        <LifeTimeline baziChart={baziChart} ziweiChart={ziweiChart} />

        {/* 各维度章节 */}
        {SECTION_ORDER.map((key) => (
          <SectionBlock
            key={key}
            title={SECTION_TITLES[key]}
            icon={SECTION_ICONS[key]}
            state={sections[key]}
          />
        ))}

        {/* 命盘详情 */}
        <ChartDetailToggle baziChart={baziChart} ziweiChart={ziweiChart} />

        {/* 追问对话 */}
        <section className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-md border border-amber-200 dark:border-amber-900/30">
          <h2 className="flex items-center gap-2 text-lg font-bold text-amber-900 dark:text-amber-100 mb-3">
            <Sparkles className="w-5 h-5" />
            继续聊聊
          </h2>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mb-3">
            对报告里的某点想了解更多，或想问点别的，随时问
          </p>
          <div className="space-y-3 mb-3 max-h-96 overflow-y-auto">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content} className="text-sm" />
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl px-4 py-2.5 text-amber-600 dark:text-amber-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            {chatError && <p className="text-sm text-red-600 text-center">{chatError}</p>}
          </div>
        </section>

        {/* 返回 */}
        <div className="text-center pb-6">
          <button
            onClick={onBackToInput}
            className="px-6 py-2.5 rounded-full border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-300 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
          >
            重新生成 / 换个生辰
          </button>
        </div>
      </div>

      <BaziChatInput
        input={chatInput}
        loading={chatLoading}
        disabled={overview.loading}
        onInputChange={onChatInputChange}
        onSend={onSendChat}
        onKeyDown={onChatKeyDown}
      />
    </div>
  );
}
