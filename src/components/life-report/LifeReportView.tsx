import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2, User, Compass, ChevronRight, ChevronDown, Star, Crown, ArrowRight, Plus } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';
import LifeTimeline from './LifeTimeline';
import ZiweiPalaceGrid from '../ziwei/ZiweiPalaceGrid';
import ZiweiTimeNav from '../ziwei/ZiweiTimeNav';
import { ZiweiPalaceProvider } from '../ziwei/ZiweiPalaceContext';
import type { BaziChart } from '../../lib/bazi-calculator';
import type { ZiweiChart } from '../../lib/ziwei-calculator';
import type { LifeReportInput, SectionType, ChatMessage } from '../../lib/life-report-api';

interface SectionState {
  loading: boolean;
  error: string | null;
  content: string | null;
}

interface LifeReportViewProps {
  layoutMode: 'desktop' | 'mobile';
  input: LifeReportInput;
  baziChart: BaziChart | null;
  ziweiChart: ZiweiChart | null;
  overview: SectionState;
  sections: Record<SectionType, SectionState>;
  chatMessages: ChatMessage[];
  chats: ChatMessage[][];
  activeChatIndex: number;
  chatLoading: boolean;
  chatError: string | null;
  chatInput: string;
  onChatInputChange: (v: string) => void;
  onSendChat: () => void;
  onChatKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onNewChat: () => void;
  onSwitchChat: (idx: number) => void;
  onDeleteChat: (idx: number) => void;
  onBackToInput: () => void;
  onGenerateSection: (sectionType: SectionType) => void;
}

const SECTION_ORDER: SectionType[] = ['career', 'wealth', 'marriage', 'health', 'trend'];
const SECTION_TITLES: Record<SectionType, string> = {
  career: '事业', wealth: '财富', marriage: '感情', health: '健康', trend: '运势走向',
};
const SECTION_ICONS: Record<SectionType, string> = {
  career: '💼', wealth: '💰', marriage: '❤️', health: '🌿', trend: '🌊',
};
const SECTION_HINTS: Record<SectionType, string> = {
  career: '事业方向与发展节奏',
  wealth: '财富格局与来源',
  marriage: '感情模式与伴侣特质',
  health: '体质倾向与养护',
  trend: '人生关键阶段的节奏',
};

/** 八字四柱小卡片（放命盘上方） */
function BaziCard({ baziChart }: { baziChart: BaziChart | null }) {
  if (!baziChart) return null;
  const pillars = [baziChart.yearPillar, baziChart.monthPillar, baziChart.dayPillar, baziChart.hourPillar];
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-card border border-amber-200 dark:border-amber-900/30 p-3">
      <h3 className="flex items-center gap-1.5 text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">
        <Star className="w-3.5 h-3.5" />八字四柱
      </h3>
      <div className="grid grid-cols-4 gap-1 mb-2">
        {pillars.map((p, i) => (
          <div key={i} className="text-center tabular-nums">
            <div className="text-base font-bold text-amber-900 dark:text-amber-100">{p.gan}{p.zhi}</div>
            <div className="text-[10px] text-amber-600/70 dark:text-amber-400/70">{p.shiShen.join('/')}</div>
          </div>
        ))}
      </div>
      <div className="text-[11px] text-amber-700 dark:text-amber-300 leading-tight space-y-0.5 border-t border-amber-100 dark:border-amber-900/30 pt-1.5">
        <div>{baziChart.dayMaster}{baziChart.dayMasterElement} · {baziChart.dayMasterStrength} · {baziChart.pattern}</div>
        <div>用：{baziChart.yongShen} · 喜：{baziChart.xiShen} · 忌：{baziChart.jiShen}</div>
      </div>
    </div>
  );
}

/** 左栏：八字卡片 + 紫微命盘（完整三方四正 + 大限流年，复用紫微模块） */
function ChartPanel({ baziChart, ziweiChart }: { baziChart: BaziChart | null; ziweiChart: ZiweiChart | null }) {
  if (!ziweiChart) return null;
  return (
    <ZiweiPalaceProvider>
      <div className="space-y-3">
        <BaziCard baziChart={baziChart} />
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-card border border-amber-200 dark:border-amber-900/30 p-3">
          <ZiweiTimeNav chart={ziweiChart} />
          <div className="mt-2 overflow-x-auto">
            <ZiweiPalaceGrid chart={ziweiChart} compact />
          </div>
        </div>
      </div>
    </ZiweiPalaceProvider>
  );
}

/** 中栏章节块（懒加载：点击才生成；手机模式可手风琴折叠） */
function SectionBlock({
  title, icon, hint, state, onGenerate, overviewReady,
  collapsible, open, onToggle,
}: {
  title: string; icon: string; hint: string; state: SectionState;
  onGenerate: () => void; overviewReady: boolean;
  collapsible?: boolean; open?: boolean; onToggle?: () => void;
}) {
  const idle = !state.loading && !state.content && !state.error;
  const hasContent = !!state.content;
  const expanded = !collapsible || open; // 非手风琴始终展开
  const canToggle = collapsible && hasContent && !!onToggle;
  return (
    <section className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-card border border-amber-200 dark:border-amber-900/30">
      {canToggle ? (
        <button onClick={onToggle} className="flex items-center w-full text-left mb-1">
          <h2 className="flex items-center gap-2 text-lg font-display font-bold text-amber-900 dark:text-amber-100 flex-1">
            <span>{icon}</span>{title}
          </h2>
          <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${open ? '' : '-rotate-90'}`} />
        </button>
      ) : (
        <h2 className="flex items-center gap-2 text-lg font-display font-bold text-amber-900 dark:text-amber-100 mb-1">
          <span>{icon}</span>{title}
        </h2>
      )}
      <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mb-3">{hint}</p>
      {idle && (
        <button onClick={onGenerate} disabled={!overviewReady}
          className="w-full py-3 border border-dashed border-amber-300 dark:border-amber-700/50 rounded-lg text-amber-700 dark:text-amber-300 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
          {overviewReady ? (<><ChevronRight className="w-4 h-4" />点击生成本章</>) : '等待总览生成完成...'}
        </button>
      )}
      {state.loading && (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm py-3">
          <Loader2 className="w-4 h-4 animate-spin" />正在为你撰写这一章...
        </div>
      )}
      {state.error && (
        <div className="text-sm text-red-600 py-2">{state.error}
          <button onClick={onGenerate} className="ml-2 underline">重试</button>
        </div>
      )}
      {expanded && state.content && <MarkdownRenderer content={state.content} className="text-sm md:text-base" />}
    </section>
  );
}

/** 右栏：追问对话 */
function ChatPanel({
  chatMessages, chats, activeChatIndex, chatLoading, chatError, chatInput,
  onChatInputChange, onSendChat, onChatKeyDown,
  onNewChat, onSwitchChat, onDeleteChat, overviewLoading, isActive = true,
}: {
  chatMessages: ChatMessage[]; chats: ChatMessage[][]; activeChatIndex: number;
  chatLoading: boolean; chatError: string | null;
  chatInput: string; onChatInputChange: (v: string) => void; onSendChat: () => void;
  onChatKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onNewChat: () => void; onSwitchChat: (idx: number) => void; onDeleteChat: (idx: number) => void;
  overviewLoading: boolean;
  /** 该面板是否处于激活可见状态（手机模式切到对话视图时 true）；激活/有新消息时滚到底部展示最新 */
  isActive?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // 激活切换、新消息、切换聊天时，滚动到底部展示最新消息
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [isActive, chatMessages.length, activeChatIndex, chatLoading]);
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-card border border-amber-200 dark:border-amber-900/30 flex flex-col overflow-hidden h-full">
      <div className="px-4 py-3 border-b border-amber-100 dark:border-amber-900/30 flex-none">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-display font-bold text-amber-900 dark:text-amber-100">
            <Sparkles className="w-4 h-4" />继续聊聊
          </h2>
          <button
            onClick={onNewChat}
            disabled={overviewLoading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-40"
            title="新建聊天"
          >
            <Plus className="w-3.5 h-3.5" />新聊天
          </button>
        </div>
        {/* 聊天切换栏 */}
        {chats.length > 1 && (
          <div className="flex items-center gap-1 mt-2 overflow-x-auto">
            {chats.map((c, i) => (
              <div key={i} className="group relative flex-none">
                <button
                  onClick={() => onSwitchChat(i)}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    i === activeChatIndex
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                  }`}
                >
                  聊天{i + 1}{c.length > 0 && <span className="opacity-70">({c.length})</span>}
                </button>
                {chats.length > 1 && (
                  <button
                    onClick={() => onDeleteChat(i)}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="删除该聊天"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] text-amber-600/70 dark:text-amber-400/70 mt-1.5">对报告有疑问，随时问（保留最近5个聊天）</p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {chatMessages.length === 0 && !chatLoading && (
          <div className="text-center text-xs text-amber-500/60 dark:text-amber-400/60 py-8">报告生成后，可以在这里追问细节</div>
        )}
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] rounded-2xl px-3 py-2 ${
              msg.role === 'user' ? 'bg-amber-500 text-white' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100'
            }`}>
              {msg.role === 'user'
                ? <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                : <MarkdownRenderer content={msg.content} className="text-sm" />}
            </div>
          </div>
        ))}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl px-3 py-2 text-amber-600 dark:text-amber-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        {chatError && <p className="text-sm text-red-600 text-center">{chatError}</p>}
      </div>
      <div className="flex-none border-t border-amber-100 dark:border-amber-900/30 p-3">
        <div className="flex gap-2 items-end">
          <textarea
            value={chatInput} onChange={(e) => onChatInputChange(e.target.value)} onKeyDown={onChatKeyDown}
            placeholder={overviewLoading ? '报告生成中...' : '输入你的问题...'} rows={2} disabled={overviewLoading}
            className="flex-1 px-3 py-2 border border-amber-300 dark:border-amber-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 text-sm text-amber-900 dark:text-amber-100 bg-white dark:bg-neutral-900 resize-none disabled:opacity-50"
          />
          <button onClick={onSendChat} disabled={!chatInput.trim() || chatLoading || overviewLoading}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all h-[42px] w-[42px] flex items-center justify-center"
            aria-label="发送">
            {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-lg">➤</span>}
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-amber-500 text-center">Enter 发送 · Shift+Enter 换行</p>
      </div>
    </div>
  );
}

/** 报告正文（标题+总览+章节+引导+返回）。accordion=true 时章节手风琴折叠（手机模式） */
function ReportBody({
  input, genderText, overview, sections, overviewReady, onGenerateSection, onBackToInput,
  accordion, openSection, onToggleSection,
}: {
  input: LifeReportInput; genderText: string; overview: SectionState;
  sections: Record<SectionType, SectionState>; overviewReady: boolean;
  onGenerateSection: (st: SectionType) => void; onBackToInput: () => void;
  accordion: boolean; openSection: SectionType | null; onToggleSection: (st: SectionType) => void;
}) {
  return (
    <div className="space-y-4 pb-6">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-display font-bold text-amber-900 dark:text-amber-100 flex items-center justify-center gap-2">
          <Compass className="w-6 h-6" />你的人生发展报告
        </h1>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          {input.year}年{input.month}月{input.day}日 · {genderText} · {input.birthplace || '出生地未填'}
        </p>
      </div>

      <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-2xl p-6 shadow-card border border-amber-200 dark:border-amber-900/30">
        <h2 className="flex items-center gap-2 text-xl font-display font-bold text-amber-900 dark:text-amber-100 mb-3">
          <User className="w-5 h-5" />本命总览
        </h2>
        {overview.loading && (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm py-4">
            <Loader2 className="w-5 h-5 animate-spin" />正在读懂你，请稍候...
          </div>
        )}
        {overview.error && <div className="text-sm text-red-600 py-2">{overview.error}</div>}
        {overview.content && <MarkdownRenderer content={overview.content} className="text-sm md:text-base" />}
      </section>

      {SECTION_ORDER.map((key) => (
        <SectionBlock key={key} title={SECTION_TITLES[key]} icon={SECTION_ICONS[key]} hint={SECTION_HINTS[key]}
          state={sections[key]} onGenerate={() => onGenerateSection(key)} overviewReady={overviewReady}
          collapsible={accordion} open={openSection === key} onToggle={() => onToggleSection(key)} />
      ))}

      {/* 引导：深入单盘分析 */}
      <div className="bg-amber-50/60 dark:bg-amber-900/10 rounded-2xl p-4 border border-amber-200/60 dark:border-amber-900/30">
        <p className="text-sm text-amber-800 dark:text-amber-200 mb-3 text-center">
          想看完整命盘的深度分析？前往单盘工具
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Link to="/bazi"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-300 text-sm font-medium hover:border-amber-400 dark:hover:border-amber-600 transition-colors">
            <Star className="w-4 h-4" />八字排盘<ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link to="/ziwei"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-300 text-sm font-medium hover:border-amber-400 dark:hover:border-amber-600 transition-colors">
            <Crown className="w-4 h-4" />紫微斗数<ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="text-center pb-2">
        <button onClick={onBackToInput}
          className="px-6 py-2.5 rounded-full border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-300 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
          重新生成 / 换个生辰
        </button>
      </div>
    </div>
  );
}

export default function LifeReportView({
  layoutMode, input, baziChart, ziweiChart, overview, sections,
  chatMessages, chats, activeChatIndex, chatLoading, chatError, chatInput,
  onChatInputChange, onSendChat, onChatKeyDown,
  onNewChat, onSwitchChat, onDeleteChat,
  onBackToInput, onGenerateSection,
}: LifeReportViewProps) {
  const genderText = input.gender === 'male' ? '男' : '女';
  const overviewReady = !!overview.content;

  // 手机模式：手风琴展开的章节（单开）
  const [openSection, setOpenSection] = useState<SectionType | null>(null);
  const toggleSection = useCallback((st: SectionType) => {
    setOpenSection((prev) => (prev === st ? null : st));
  }, []);

  // 手机模式：swipe 视图索引（0命盘 1报告 2对话）+ 滚动联动
  const [activeView, setActiveView] = useState(1); // 默认停在报告
  const swipeRef = useRef<HTMLDivElement>(null);
  const onSwipeScroll = useCallback(() => {
    const el = swipeRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveView(idx);
  }, []);
  const goToView = useCallback((idx: number) => {
    const el = swipeRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' });
    setActiveView(idx);
  }, []);

  // 手机模式挂载时：把 swipe 容器滚动定位到初始 activeView（报告），避免「tab显示报告但停在命盘」不同步
  useEffect(() => {
    if (layoutMode !== 'mobile') return;
    const el = swipeRef.current;
    if (!el) return;
    // 用 rAF 等布局完成后再定位（容器宽度此时已稳定）
    const raf = requestAnimationFrame(() => {
      el.scrollTo({ left: activeView * el.clientWidth });
    });
    return () => cancelAnimationFrame(raf);
    // 仅在切入手机模式时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutMode]);

  // 中右栏可拖动分隔：右栏宽度
  const [rightWidth, setRightWidth] = useState(340);
  const draggingRef = useRef(false);
  const onDividerDown = useCallback(() => { draggingRef.current = true; document.body.style.cursor = 'col-resize'; }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingRef.current) return;
    const w = Math.min(Math.max(window.innerWidth - e.clientX, 260), 560);
    setRightWidth(w);
  }, []);
  const onMouseUp = useCallback(() => {
    if (draggingRef.current) { draggingRef.current = false; document.body.style.cursor = ''; }
  }, []);
  useEffect(() => {
    const up = () => { draggingRef.current = false; document.body.style.cursor = ''; };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  // ==================== 手机模式：swipe 3 视图（命盘/报告/对话）====================
  if (layoutMode === 'mobile') {
    const tabs = ['命盘', '报告', '继续聊聊'];
    return (
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* 顶部 tab 指示器 */}
        <div className="flex-none flex items-center justify-center gap-1 p-2 border-b border-amber-200/70 dark:border-amber-900/30 bg-white/85 dark:bg-neutral-900/85 backdrop-blur sticky top-0 z-10">
          {tabs.map((t, i) => (
            <button key={t} onClick={() => goToView(i)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeView === i
                  ? 'bg-amber-500 text-white dark:bg-amber-600'
                  : 'text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/20'
              }`}>
              {t}
            </button>
          ))}
        </div>
        {/* swipe 容器 */}
        <div ref={swipeRef} onScroll={onSwipeScroll}
          className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth">
          {/* 视图1：命盘 */}
          <div className="snap-center shrink-0 w-full h-full overflow-y-auto p-3 space-y-3">
            <ChartPanel baziChart={baziChart} ziweiChart={ziweiChart} />
            <LifeTimeline baziChart={baziChart} ziweiChart={ziweiChart} />
          </div>
          {/* 视图2：报告（章节手风琴） */}
          <div className="snap-center shrink-0 w-full h-full overflow-y-auto p-3">
            <ReportBody
              input={input} genderText={genderText} overview={overview} sections={sections}
              overviewReady={overviewReady} onGenerateSection={onGenerateSection} onBackToInput={onBackToInput}
              accordion openSection={openSection} onToggleSection={toggleSection} />
          </div>
          {/* 视图3：对话 */}
          <div className="snap-center shrink-0 w-full h-full p-3">
            <ChatPanel chatMessages={chatMessages} chats={chats} activeChatIndex={activeChatIndex}
              chatLoading={chatLoading} chatError={chatError} chatInput={chatInput}
              onChatInputChange={onChatInputChange} onSendChat={onSendChat} onChatKeyDown={onChatKeyDown}
              onNewChat={onNewChat} onSwitchChat={onSwitchChat} onDeleteChat={onDeleteChat}
              overviewLoading={overview.loading} isActive={activeView === 2} />
          </div>
        </div>
      </div>
    );
  }

  // ==================== 电脑模式：三栏（命盘+时间轴 / 报告 / 对话）====================
  return (
    <div className="flex-1 overflow-hidden p-3 sm:p-4" onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      <div className="h-full max-w-[1600px] mx-auto flex gap-0">
        {/* 左栏：八字卡片 + 紫微命盘 + 运势时间轴 */}
        <aside className="flex flex-col min-h-0 overflow-y-auto pr-2" style={{ flex: '0 0 512px' }}>
          <ChartPanel baziChart={baziChart} ziweiChart={ziweiChart} />
          <div className="mt-3">
            <LifeTimeline baziChart={baziChart} ziweiChart={ziweiChart} />
          </div>
        </aside>

        {/* 中栏：报告 */}
        <main className="overflow-y-auto min-h-0 px-3" style={{ flex: '1 1 0', minWidth: 0 }}>
          <ReportBody
            input={input} genderText={genderText} overview={overview} sections={sections}
            overviewReady={overviewReady} onGenerateSection={onGenerateSection} onBackToInput={onBackToInput}
            accordion={false} openSection={null} onToggleSection={toggleSection} />
        </main>

        {/* 中右拖动分隔条 */}
        <div className="w-1.5 cursor-col-resize hover:bg-amber-300/50 dark:hover:bg-amber-600/40 transition-colors flex-none self-stretch"
          onMouseDown={onDividerDown} title="拖动调整对话栏宽度" />

        {/* 右栏：对话 */}
        <aside className="flex flex-col min-h-0 overflow-hidden flex-none" style={{ width: rightWidth }}>
          <ChatPanel chatMessages={chatMessages} chats={chats} activeChatIndex={activeChatIndex}
            chatLoading={chatLoading} chatError={chatError} chatInput={chatInput}
            onChatInputChange={onChatInputChange} onSendChat={onSendChat} onChatKeyDown={onChatKeyDown}
            onNewChat={onNewChat} onSwitchChat={onSwitchChat} onDeleteChat={onDeleteChat}
            overviewLoading={overview.loading} />
        </aside>
      </div>
    </div>
  );
}
