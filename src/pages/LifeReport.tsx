import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Save, Loader2 } from 'lucide-react';
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
  const navigate = useNavigate();
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // 档案
  const { currentProfile, saveProfile: saveProfileCtx } = useProfile();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<LifeReportInput | null>(null);

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
    setChatMessages([]);
    setChatInput('');
    setChatError(null);
  };

  const handleGoHome = () => navigate('/');

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
      // 各章节改为用户点击后按需生成（见 handleGenerateSection）
    } else {
      setOverview({ loading: false, error: ovRes.error || '生成失败', content: null });
    }
  };

  // 按需生成单个章节（用户点击触发）
  const handleGenerateSection = useCallback(async (st: SectionType) => {
    if (!reportInput || !overviewRef.current) return;
    const sectionState = sections[st];
    if (sectionState.loading) return; // 防重复点击
    setSections((prev) => ({ ...prev, [st]: { loading: true, error: null, content: null } }));
    try {
      const res = await getLifeReportSection(reportInput, st, overviewRef.current);
      if (res.success && res.data) {
        setSections((prev) => ({ ...prev, [st]: { loading: false, error: null, content: res.data!.interpretation } }));
      } else {
        setSections((prev) => ({ ...prev, [st]: { loading: false, error: res.error || '生成失败', content: null } }));
      }
    } catch {
      setSections((prev) => ({ ...prev, [st]: { loading: false, error: '网络错误', content: null } }));
    }
  }, [reportInput, sections]);

  const handleBackToInput = () => {
    setStep('input');
    resetReport();
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

  // 追问
  const handleSendChat = useCallback(async () => {
    if (!reportInput || !chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim(), timestamp: Date.now() };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
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
      const res = await lifeReportChat(userMsg.content, reportInput, chatMessages.slice(-8), summaryParts.join('\n\n'));
      if (res.success && res.data) {
        setChatMessages([...newMessages, { role: 'assistant', content: res.data.message, timestamp: res.data.timestamp }]);
      } else {
        setChatError(res.error || '发送失败');
        setChatInput(userMsg.content);
        setChatMessages(chatMessages);
      }
    } catch {
      setChatError('网络错误');
      setChatInput(userMsg.content);
      setChatMessages(chatMessages);
    } finally {
      setChatLoading(false);
    }
  }, [reportInput, chatInput, chatLoading, chatMessages, sections]);

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
      <header className="flex-none border-b border-amber-200/80 bg-white/82
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
                <h1 className="text-lg font-semibold tracking-[0.14em] text-amber-900 dark:text-amber-50 sm:text-xl">
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
                <p className="text-xl md:text-2xl font-serif text-amber-800 dark:text-amber-300/90 tracking-wider italic">
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
            chatMessages={chatMessages}
            chatLoading={chatLoading}
            chatError={chatError}
            chatInput={chatInput}
            onChatInputChange={setChatInput}
            onSendChat={handleSendChat}
            onChatKeyDown={handleChatKeyDown}
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
