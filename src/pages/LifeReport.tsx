import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Compass, Save, Loader2, History, Trash2, Clock, Pencil } from 'lucide-react';
import MainHeaderTabs from '../components/MainHeaderTabs';
import LifeReportForm from '../components/life-report/LifeReportForm';
import LifeReportView from '../components/life-report/LifeReportView';
import { calculateBaziChart, type BaziChart } from '../lib/bazi-calculator';
import { calculateZiweiChart, type ZiweiChart } from '../lib/ziwei-calculator';
import {
  getLifeReportOverview,
  getLifeReportSection,
  lifeReportChat,
  type LifeReportInput,
  type SectionType,
  type ChatMessage,
} from '../lib/life-report-api';
import { useProfile } from '../context/ProfileContext';
import type { ProfileInput } from '../lib/profile-api';
import {
  getLifeHistory,
  saveLifeHistory,
  deleteLifeHistory,
  buildBirthSummary,
  type LifeHistoryEntry,
  type LifeHistoryBirth,
} from '../lib/life-history';
import { useAuth } from '../context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

type Step = 'input' | 'result';

interface SectionState {
  loading: boolean;
  error: string | null;
  content: string | null;
}

const SECTION_TYPES: SectionType[] = ['career', 'wealth', 'marriage', 'health', 'trend'];

const emptySection: SectionState = { loading: false, error: null, content: null };

export default function LifeReport() {
  const { token, isLoggedIn } = useAuth();
  const [step, setStep] = useState<Step>('input');

  // 排盘结果
  const [reportInput, setReportInput] = useState<LifeReportInput | null>(null);
  const [baziChart, setBaziChart] = useState<BaziChart | null>(null);
  const [ziweiChart, setZiweiChart] = useState<ZiweiChart | null>(null);

  // 报告内容
  const [overview, setOverview] = useState<SectionState>(emptySection);
  const [sections, setSections] = useState<Record<SectionType, SectionState>>({
    career: { ...emptySection },
    wealth: { ...emptySection },
    marriage: { ...emptySection },
    health: { ...emptySection },
    trend: { ...emptySection },
  });
  const overviewRef = useRef<string>(''); // 供章节请求读取最新总览

  // 追问
  // 追问：支持多个聊天，保留最近5个
  const [chats, setChats] = useState<ChatMessage[][]>([[]]);
  const [activeChatIndex, setActiveChatIndex] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const activeChatMessages = chats[activeChatIndex] || [];

  // 档案
  const { currentProfile, saveProfile: saveProfileCtx } = useProfile();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<LifeReportInput | null>(null);

  // 历史会话（云端 D1，登录用户跨设备同步）
  const [history, setHistory] = useState<LifeHistoryEntry[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // 登录后拉取云端历史
  useEffect(() => {
    if (!token) { setHistory([]); return; }
    getLifeHistory(token).then((res) => {
      if (res.success && res.data) setHistory(res.data);
    });
  }, [token]);

  // 当前档案预填
  const initialFormData = useMemo<LifeReportInput | undefined>(() => {
    if (!currentProfile || currentProfile.inputMode !== 'birthdate') return undefined;
    return {
      year: currentProfile.year ?? undefined,
      month: currentProfile.month ?? undefined,
      day: currentProfile.day ?? undefined,
      hour: currentProfile.hour ?? undefined,
      minute: currentProfile.minute ?? undefined,
      gender: (currentProfile.gender ?? 'male') as 'male' | 'female',
      birthplace: currentProfile.birthplace ?? undefined,
      useSolarTime: currentProfile.useSolarTime ?? false,
    };
  }, [currentProfile]);

  const resetReport = () => {
    setReportInput(null);
    setBaziChart(null);
    setZiweiChart(null);
    setOverview(emptySection);
    setSections({
      career: { ...emptySection },
      wealth: { ...emptySection },
      marriage: { ...emptySection },
      health: { ...emptySection },
      trend: { ...emptySection },
    });
    overviewRef.current = '';
    setChats([[]]);
    setActiveChatIndex(0);
    setChatInput('');
    setChatError(null);
  };

  // 点击左上角标题回首页（人生报告即首页，重置回输入页）
  const handleGoHome = () => {
    setStep('input');
    resetReport();
    setCurrentHistoryId(null);
  };

  // 提交：前端排双盘 → 调 overview → overview 回来后并行调 5 sections
  const handleSubmit = async (data: LifeReportInput) => {
    resetReport();

    // 排双盘
    const bazi = calculateBaziChart({
      year: data.year!, month: data.month!, day: data.day!,
      hour: data.hour!, minute: data.minute || 0,
      gender: data.gender, birthplace: data.birthplace, useSolarTime: data.useSolarTime,
    });
    const ziwei = calculateZiweiChart({
      year: data.year!, month: data.month!, day: data.day!,
      hour: data.hour!, minute: data.minute || 0,
      gender: data.gender, birthplace: data.birthplace, useSolarTime: data.useSolarTime,
    });
    setBaziChart(bazi);
    setZiweiChart(ziwei);

    const input: LifeReportInput = { ...data, baziChart: bazi, ziweiChart: ziwei };
    setReportInput(input);
    setStep('result');

    // 1. 先调总览
    setOverview({ loading: true, error: null, content: null });
    const ovRes = await getLifeReportOverview(input);
    if (ovRes.success && ovRes.data) {
      const content = ovRes.data.interpretation;
      overviewRef.current = content;
      setOverview({ loading: false, error: null, content });
      // 创建历史条目（登录用户才存云端）
      const birth: LifeHistoryBirth = {
        year: data.year, month: data.month, day: data.day,
        hour: data.hour, minute: data.minute, gender: data.gender,
        birthplace: data.birthplace, useSolarTime: data.useSolarTime, focus: data.focus,
      };
      if (token) {
        const res = await saveLifeHistory(token, {
          birth, overview: content,
          sections: { career: null, wealth: null, marriage: null, health: null, trend: null },
          chats: [[]], activeChatIndex: 0,
        });
        if (res.success && res.data) {
          setCurrentHistoryId(res.data.id);
          // 刷新历史列表
          const listRes = await getLifeHistory(token);
          if (listRes.success && listRes.data) setHistory(listRes.data);
        }
      }
    } else {
      setOverview({ loading: false, error: ovRes.error || '生成失败', content: null });
    }
  };

  // 按需生成单个章节（用户点击触发）
  // 写回云端历史（章节/聊天/重命名变化时）
  const persistHistory = useCallback(async (patch: Partial<LifeHistoryEntry>) => {
    if (!token || !currentHistoryId || !reportInput) return;
    const birth: LifeHistoryBirth = {
      year: reportInput.year, month: reportInput.month, day: reportInput.day,
      hour: reportInput.hour, minute: reportInput.minute, gender: reportInput.gender,
      birthplace: reportInput.birthplace, useSolarTime: reportInput.useSolarTime, focus: reportInput.focus,
    };
    const fullEntry: Partial<LifeHistoryEntry> & { birth: LifeHistoryBirth; id: string } = {
      id: currentHistoryId,
      birth,
      overview: overviewRef.current,
      sections: {
        career: sections.career.content,
        wealth: sections.wealth.content,
        marriage: sections.marriage.content,
        health: sections.health.content,
        trend: sections.trend.content,
      },
      chats,
      activeChatIndex,
      ...patch,
    };
    await saveLifeHistory(token, fullEntry);
  }, [token, currentHistoryId, reportInput, sections, chats, activeChatIndex]);

  const handleGenerateSection = useCallback(async (st: SectionType) => {
    if (!reportInput || !overviewRef.current) return;
    const sectionState = sections[st];
    if (sectionState.loading) return; // 防重复点击
    setSections((prev) => ({ ...prev, [st]: { loading: true, error: null, content: null } }));
    try {
      const res = await getLifeReportSection(reportInput, st, overviewRef.current);
      if (res.success && res.data) {
        const sectionContent = res.data!.interpretation;
        setSections((prev) => ({ ...prev, [st]: { loading: false, error: null, content: sectionContent } }));
        // 写回历史（存各章节内容字符串）
        if (currentHistoryId) {
          const historySections: Record<SectionType, string | null> = {
            career: st === 'career' ? sectionContent : sections.career.content,
            wealth: st === 'wealth' ? sectionContent : sections.wealth.content,
            marriage: st === 'marriage' ? sectionContent : sections.marriage.content,
            health: st === 'health' ? sectionContent : sections.health.content,
            trend: st === 'trend' ? sectionContent : sections.trend.content,
          };
          persistHistory({ sections: historySections });
        }
      } else {
        setSections((prev) => ({ ...prev, [st]: { loading: false, error: res.error || '生成失败', content: null } }));
      }
    } catch {
      setSections((prev) => ({ ...prev, [st]: { loading: false, error: '网络错误', content: null } }));
    }
  }, [reportInput, sections, currentHistoryId, persistHistory]);

  const handleBackToInput = () => {
    setStep('input');
    resetReport();
    setCurrentHistoryId(null);
  };

  // 加载历史会话：重排双盘 + 恢复内容
  const handleLoadHistory = (entry: LifeHistoryEntry) => {
    const b = entry.birth;
    const bazi = calculateBaziChart({
      year: b.year!, month: b.month!, day: b.day!,
      hour: b.hour!, minute: b.minute || 0,
      gender: b.gender, birthplace: b.birthplace, useSolarTime: b.useSolarTime,
    });
    const ziwei = calculateZiweiChart({
      year: b.year!, month: b.month!, day: b.day!,
      hour: b.hour!, minute: b.minute || 0,
      gender: b.gender, birthplace: b.birthplace, useSolarTime: b.useSolarTime,
    });
    setBaziChart(bazi);
    setZiweiChart(ziwei);
    const input: LifeReportInput = { ...b, baziChart: bazi, ziweiChart: ziwei };
    setReportInput(input);
    overviewRef.current = entry.overview || '';
    setOverview(entry.overview ? { loading: false, error: null, content: entry.overview } : emptySection);
    setSections({
      career: { loading: false, error: null, content: entry.sections.career },
      wealth: { loading: false, error: null, content: entry.sections.wealth },
      marriage: { loading: false, error: null, content: entry.sections.marriage },
      health: { loading: false, error: null, content: entry.sections.health },
      trend: { loading: false, error: null, content: entry.sections.trend },
    });
    setChats(entry.chats?.length ? entry.chats : [[]]);
    setActiveChatIndex(Math.min(entry.activeChatIndex ?? 0, Math.max((entry.chats?.length ?? 1) - 1, 0)));
    setChatInput('');
    setChatError(null);
    setCurrentHistoryId(entry.id);
    setStep('result');
  };

  const handleDeleteHistory = async (id: string) => {
    if (!token) return;
    const res = await deleteLifeHistory(token, id);
    if (res.success) {
      setHistory((prev) => prev.filter((e) => e.id !== id));
      if (currentHistoryId === id) setCurrentHistoryId(null);
    }
  };

  // 重命名历史
  const handleStartRename = (entry: LifeHistoryEntry) => {
    setEditingId(entry.id);
    setRenameValue(entry.name || '');
  };

  const handleConfirmRename = async (id: string) => {
    if (!token) return;
    const trimmed = renameValue.trim();
    // 空名称则清除自定义名（回退到生辰摘要）
    const entry = history.find((e) => e.id === id);
    if (!entry) return;
    await saveLifeHistory(token, { ...entry, name: trimmed || null });
    setHistory((prev) => prev.map((e) => (e.id === id ? { ...e, name: trimmed || null } : e)));
    setEditingId(null);
    setRenameValue('');
  };

  // 保存档案
  const handleSaveProfile = async () => {
    if (!pendingSaveData || !profileName.trim()) return;
    setSaveLoading(true);
    const payload: ProfileInput = {
      name: profileName.trim(),
      inputMode: 'birthdate',
      gender: pendingSaveData.gender,
      year: pendingSaveData.year,
      month: pendingSaveData.month,
      day: pendingSaveData.day,
      hour: pendingSaveData.hour,
      minute: pendingSaveData.minute,
      birthplace: pendingSaveData.birthplace,
      useSolarTime: pendingSaveData.useSolarTime,
    };
    const ok = await saveProfileCtx(payload);
    setSaveLoading(false);
    if (ok) {
      setSaveDialogOpen(false);
      setProfileName('');
      setPendingSaveData(null);
    } else {
      alert('保存失败，请重试');
    }
  };

  // 写回当前 chats 到历史
  // 写回云端历史（章节/聊天/重命名变化时）
  // 追问
  const handleSendChat = useCallback(async () => {
    if (!reportInput || !chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim(), timestamp: Date.now() };
    const current = chats[activeChatIndex] || [];
    const newMessages = [...current, userMsg];
    const nextChats = chats.map((c, i) => (i === activeChatIndex ? newMessages : c));
    setChats(nextChats);
    setChatInput('');
    setChatLoading(true);
    setChatError(null);

    // 报告摘要 = 总览 + 各章节内容（供 AI 保持一致）
    const summaryParts: string[] = [];
    if (overviewRef.current) summaryParts.push(`【本命总览】\n${overviewRef.current}`);
    for (const st of SECTION_TYPES) {
      const s = sections[st];
      if (s.content) summaryParts.push(`【${st}】\n${s.content}`);
    }

    try {
      const res = await lifeReportChat(userMsg.content, reportInput, current.slice(-8), summaryParts.join('\n\n'));
      if (res.success && res.data) {
        const updated: ChatMessage[] = [...newMessages, { role: 'assistant', content: res.data.message, timestamp: res.data.timestamp }];
        const persisted = nextChats.map((c, i) => (i === activeChatIndex ? updated : c));
        setChats(persisted);
        persistHistory({ chats: persisted, activeChatIndex });
      } else {
        setChatError(res.error || '发送失败');
        setChatInput(userMsg.content);
        setChats(chats);
      }
    } catch {
      setChatError('网络错误');
      setChatInput(userMsg.content);
      setChats(chats);
    } finally {
      setChatLoading(false);
    }
  }, [reportInput, chatInput, chatLoading, chats, activeChatIndex, sections, persistHistory]);

  // 新建聊天（保留最近5个，超出淘汰最旧）
  const handleNewChat = useCallback(() => {
    const next = [...chats, []];
    while (next.length > 5) next.shift(); // 淘汰最旧
    const newActive = next.length - 1;
    setChats(next);
    setActiveChatIndex(newActive);
    setChatError(null);
    persistHistory({ chats: next, activeChatIndex: newActive });
  }, [chats, persistHistory]);

  const handleSwitchChat = useCallback((idx: number) => {
    setActiveChatIndex(idx);
    setChatError(null);
  }, []);

  // 删除单个聊天
  const handleDeleteChat = useCallback((idx: number) => {
    if (chats.length <= 1) return; // 至少保留一个
    const next = chats.filter((_, i) => i !== idx);
    const nextActive = Math.min(activeChatIndex, next.length - 1);
    setChats(next);
    setActiveChatIndex(nextActive);
    persistHistory({ chats: next, activeChatIndex: nextActive });
  }, [chats, activeChatIndex, persistHistory]);

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-gradient-to-br from-[#FFF8F3] via-[#FFFDFC] to-[#F7EFE7]
                  dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
                  iching-pattern-bg iching-cloud-bg transition-colors duration-500">
      {/* Header */}
      <header className="relative z-50 flex-none border-b border-amber-200/80 bg-white/82
                       text-amber-900 shadow-[0_14px_45px_-34px_rgba(180,83,9,0.35)]
                       backdrop-blur-xl transition-colors duration-500
                       dark:border-amber-900/30 dark:bg-neutral-950/80 dark:text-amber-50
                       dark:shadow-[0_18px_48px_-36px_rgba(251,191,36,0.12)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <button type="button" onClick={handleGoHome}
              className="flex items-center gap-3 rounded-full transition-opacity duration-300 hover:opacity-85">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/70 bg-white/76
                text-amber-600 shadow-[0_14px_28px_-22px_rgba(180,83,9,0.35)]
                dark:border-white/10 dark:bg-neutral-950/65 dark:text-amber-300 dark:shadow-none">
                <Compass className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-display font-semibold tracking-[0.14em] text-amber-900 dark:text-amber-50 sm:text-xl">
                  人生报告
                </h1>
              </div>
            </button>
            <MainHeaderTabs />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-hidden flex flex-col relative z-10">
        {step === 'input' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-6 animate-fadeIn">
                <p className="text-xl md:text-2xl font-display text-amber-800 dark:text-amber-300/90 tracking-wider italic">
                  "认识你自己，是所有智慧的开端"
                </p>
                <p className="text-sm text-amber-600/70 dark:text-amber-400/70 mt-2">
                  八字与紫微双盘合参，AI 为你写一份专属的人生发展报告
                </p>
              </div>
              <LifeReportForm
                onSubmit={handleSubmit}
                loading={false}
                initialData={initialFormData}
                onSave={(data) => { setPendingSaveData(data); setSaveDialogOpen(true); }}
              />

              {/* 历史会话 */}
              {isLoggedIn && history.length > 0 && (
                <div className="mt-6">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-300 mb-3">
                    <History className="w-4 h-4" />最近报告
                    <span className="text-xs font-normal text-amber-500/70 dark:text-amber-400/70">（保留最近10份）</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {history.map((entry) => {
                      const doneCount = Object.values(entry.sections).filter(Boolean).length;
                      const isEditing = editingId === entry.id;
                      return (
                        <div key={entry.id} className="group relative bg-white dark:bg-neutral-800 rounded-2xl p-4 border border-amber-200 dark:border-amber-900/30 shadow-card hover:border-amber-400 dark:hover:border-amber-600 transition-colors">
                          {isEditing ? (
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={() => handleConfirmRename(entry.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleConfirmRename(entry.id);
                                if (e.key === 'Escape') { setEditingId(null); setRenameValue(''); }
                              }}
                              placeholder="输入名称（留空恢复默认）"
                              className="w-full text-sm font-medium px-2 py-1 border border-amber-300 dark:border-amber-700/50 rounded bg-white dark:bg-neutral-900 text-amber-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          ) : (
                            <button
                              onClick={() => handleLoadHistory(entry)}
                              className="block w-full text-left pr-16"
                            >
                              <div className="text-sm font-medium text-amber-900 dark:text-amber-100 truncate">
                                {entry.name || buildBirthSummary(entry.birth)}
                              </div>
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-amber-600/70 dark:text-amber-400/70">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(entry.createdAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                                </span>
                                <span>已生成 {doneCount}/5 章</span>
                              </div>
                            </button>
                          )}
                          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleStartRename(entry)}
                              className="p-1 text-amber-400/60 hover:text-amber-700 dark:hover:text-amber-300"
                              aria-label="重命名"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteHistory(entry.id)}
                              className="p-1 text-amber-400/60 hover:text-red-500"
                              aria-label="删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'result' && reportInput && (
          <LifeReportView
            input={reportInput}
            baziChart={baziChart}
            ziweiChart={ziweiChart}
            overview={overview}
            sections={sections}
            chatMessages={activeChatMessages}
            chats={chats}
            activeChatIndex={activeChatIndex}
            chatLoading={chatLoading}
            chatError={chatError}
            chatInput={chatInput}
            onChatInputChange={setChatInput}
            onSendChat={handleSendChat}
            onChatKeyDown={handleChatKeyDown}
            onNewChat={handleNewChat}
            onSwitchChat={handleSwitchChat}
            onDeleteChat={handleDeleteChat}
            onBackToInput={handleBackToInput}
            onGenerateSection={handleGenerateSection}
          />
        )}
      </main>

      {/* 保存档案对话框 */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-amber-200 dark:border-amber-900/30">
          <DialogHeader>
            <DialogTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
              <Save className="w-5 h-5" />
              保存档案
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="report-profile-name" className="text-amber-800 dark:text-amber-400">档案名称</Label>
              <Input
                id="report-profile-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="例如：自己的生辰"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
                className="mt-2 border-amber-200 dark:border-amber-700/50 focus-visible:ring-amber-500"
              />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={saveLoading || !profileName.trim()}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold"
            >
              {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
