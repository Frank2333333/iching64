import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Save, Loader2 } from 'lucide-react';
import MainHeaderTabs from '../components/MainHeaderTabs';
import BaziForm from '../components/bazi/BaziForm';
import BaziMessageList from '../components/bazi/BaziMessageList';
import BaziChatInput from '../components/bazi/BaziChatInput';
import { calculateBaziChart, type BaziChart } from '../lib/bazi-calculator';
import BaziChartTable from '../components/bazi/BaziChartTable';
import BaziSummaryCards from '../components/bazi/BaziSummaryCards';
import BaziDaYunTimeline from '../components/bazi/BaziDaYunTimeline';
import {
  baziAIFortune,
  checkBaziAIStatus,
  baziChat,
  type BaziInput,
  type ChatMessage,
} from '../lib/bazi-api';
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

interface ChatContextSummary {
  initialInterpretationSummary: string;
  createdAt: number;
}

interface BaziAIInterpretation {
  content: string;
  model: string;
  timestamp: number;
}

interface BaziResult {
  input: BaziInput;
  aiInterpretation?: BaziAIInterpretation;
}

export default function BaziDivination() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [result, setResult] = useState<BaziResult | null>(null);

  // AI 状态
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);

  // 对话状态
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatContextSummary, setChatContextSummary] = useState<ChatContextSummary | null>(null);

  // 记住输入信息，用于对话
  const [lastInput, setLastInput] = useState<BaziInput | null>(null);

  // 本地排盘结果
  const [chart, setChart] = useState<BaziChart | null>(null);

  // 档案（全局 ProfileContext；登录/档案入口由 MainHeaderTabs 内的 GlobalUserMenu 提供）
  const { currentProfile, saveProfile: saveProfileCtx } = useProfile();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<BaziInput | null>(null);

  // 当前选中档案 → BaziForm 预填数据
  const initialFormData = useMemo<BaziInput | undefined>(() => {
    if (!currentProfile) return undefined;
    const gender = (currentProfile.gender ?? 'male') as 'male' | 'female';
    if (currentProfile.inputMode === 'pillars' && currentProfile.pillars) {
      return {
        gender,
        birthplace: currentProfile.birthplace ?? undefined,
        useSolarTime: currentProfile.useSolarTime ?? false,
        pillars: currentProfile.pillars,
      };
    }
    return {
      year: currentProfile.year ?? undefined,
      month: currentProfile.month ?? undefined,
      day: currentProfile.day ?? undefined,
      hour: currentProfile.hour ?? undefined,
      minute: currentProfile.minute ?? undefined,
      gender,
      birthplace: currentProfile.birthplace ?? undefined,
      useSolarTime: currentProfile.useSolarTime ?? false,
    };
  }, [currentProfile]);

  // 检查 AI 服务状态
  useEffect(() => {
    checkBaziAIStatus().then(setAiAvailable);
  }, []);

  const resetChat = () => {
    setChatMessages([]);
    setChatInput('');
    setChatLoading(false);
    setChatError(null);
    setChatContextSummary(null);
  };

  // 切换档案时若在结果页，回到输入页载入新档案
  useEffect(() => {
    if (currentProfile && step === 'result') {
      setStep('input');
      setResult(null);
      setChart(null);
      resetChat();
      setAiError(null);
      setAiLoading(false);
    }
  }, [currentProfile, step]);

  const handleGoHome = () => {
    navigate('/');
  };

  // 提交排盘 -> 本地排盘 + 自动触发 AI 解读
  const handleSubmit = (data: BaziInput) => {
    setLastInput(data);
    setChart(null);
    resetChat();
    setAiError(null);

    // 如果是出生日期模式，先本地排盘
    if (data.year && data.month && data.day && data.hour !== undefined) {
      const baziChart = calculateBaziChart({
        year: data.year,
        month: data.month,
        day: data.day,
        hour: data.hour,
        minute: data.minute || 0,
        gender: data.gender,
        birthplace: data.birthplace,
        useSolarTime: data.useSolarTime,
      });
      setChart(baziChart);
      // 将排盘结果注入 BaziInput，让 AI 无需自行排盘
      data.chart = baziChart;
    }

    setResult({ input: data });
    setStep('result');

    // 然后调 AI（如有 chart 则 AI prompt 中已有排盘数据）
    handleAIInterpretation(data);
  };

  // 返回输入页
  const handleBackToInput = () => {
    setStep('input');
    setResult(null);
    setChart(null);
    resetChat();
    setAiError(null);
    setAiLoading(false);
  };

  // 保存档案（登录走云端，未登录走本地，由 ProfileContext 决定）
  const handleSaveProfile = async () => {
    if (!pendingSaveData || !profileName.trim()) return;
    setSaveLoading(true);
    const inputMode: 'birthdate' | 'pillars' = pendingSaveData.pillars ? 'pillars' : 'birthdate';
    const payload: ProfileInput = {
      name: profileName.trim(),
      inputMode,
      gender: pendingSaveData.gender,
      year: pendingSaveData.year,
      month: pendingSaveData.month,
      day: pendingSaveData.day,
      hour: pendingSaveData.hour,
      minute: pendingSaveData.minute,
      birthplace: pendingSaveData.birthplace,
      useSolarTime: pendingSaveData.useSolarTime,
      pillars: pendingSaveData.pillars,
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

  // AI 解读（接受参数，避免竞态）
  const handleAIInterpretation = async (input: BaziInput) => {
    if (aiLoading) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await baziAIFortune(input);

      if (response.success && response.data) {
        const interpretation: BaziAIInterpretation = {
          content: response.data.interpretation,
          model: response.data.model,
          timestamp: response.data.timestamp,
        };

        const content = response.data.interpretation;

        setResult((prev) =>
          prev ? { ...prev, aiInterpretation: interpretation } : null
        );
        setChatContextSummary({
          initialInterpretationSummary: content,
          createdAt: response.data.timestamp,
        });
      } else {
        setAiError(response.error || 'AI 排盘解读失败');
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : '请求失败');
    } finally {
      setAiLoading(false);
    }
  };

  // 发送对话消息
  const handleSendChatMessage = async () => {
    if (!lastInput || !chatInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);
    setChatError(null);

    try {
      const response = await baziChat({
        message: userMessage.content,
        baziInput: lastInput,
        history: chatMessages.slice(-8),
        initialInterpretationSummary: chatContextSummary?.initialInterpretationSummary,
      });

      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.message,
          timestamp: response.data.timestamp,
        };
        setChatMessages([...newMessages, assistantMessage]);
      } else {
        setChatError(response.error || '发送失败');
        setChatInput(userMessage.content);
        setChatMessages(chatMessages);
      }
    } catch (error) {
      setChatError(error instanceof Error ? error.message : '请求失败');
      setChatInput(userMessage.content);
      setChatMessages(chatMessages);
    } finally {
      setChatLoading(false);
    }
  };

  // 处理回车发送
  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-gradient-to-br from-[#FFF8F3] via-[#FFFDFC] to-[#F7EFE7]
                  dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
                  iching-pattern-bg iching-cloud-bg transition-colors duration-500">
      {/* Header — 登录与档案入口已由 MainHeaderTabs 内的 GlobalUserMenu 全局提供 */}
      <header className="relative z-50 flex-none border-b border-amber-200/80 bg-white/82
                       text-amber-900 shadow-[0_14px_45px_-34px_rgba(180,83,9,0.35)]
                       backdrop-blur-xl transition-colors duration-500
                       dark:border-amber-900/30 dark:bg-neutral-950/80 dark:text-amber-50
                       dark:shadow-[0_18px_48px_-36px_rgba(251,191,36,0.12)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <button
              type="button"
              onClick={handleGoHome}
              className="flex items-center gap-3 rounded-full transition-opacity duration-300 hover:opacity-85"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/70 bg-white/76
                            text-amber-600 shadow-[0_14px_28px_-22px_rgba(180,83,9,0.35)]
                            dark:border-white/10 dark:bg-neutral-950/65 dark:text-amber-300 dark:shadow-none">
                <Compass className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold tracking-[0.14em] text-amber-900 dark:text-amber-50 sm:text-xl">
                  八字排盘
                </h1>
              </div>
            </button>
            <div className="flex items-center gap-3">
              <MainHeaderTabs />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative z-10">
        {step === 'input' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-6 animate-fadeIn">
                <p className="text-xl md:text-2xl font-serif text-amber-800 dark:text-amber-300/90 tracking-wider italic">
                  "知命者，不立于岩墙之下"
                </p>
              </div>
              <BaziForm
                onSubmit={handleSubmit}
                loading={aiLoading}
                initialData={initialFormData}
                onSave={(data) => { setPendingSaveData(data); setSaveDialogOpen(true); }}
              />
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <>
            <div className="flex-1 overflow-y-auto">
              {/* 传统命盘展示 */}
              {chart && (
                <div className="space-y-4 px-4 pt-4 pb-2 max-w-3xl mx-auto">
                  <BaziChartTable chart={chart} />
                  <BaziSummaryCards chart={chart} />
                  <BaziDaYunTimeline chart={chart} />
                </div>
              )}
              {/* AI 解读 */}
              <BaziMessageList
                resultInput={result.input}
                aiInterpretation={result.aiInterpretation || null}
                aiLoading={aiLoading}
                aiError={aiError}
                aiAvailable={aiAvailable}
                chatMessages={chatMessages}
                chatLoading={chatLoading}
                chatError={chatError}
                onBackToInput={handleBackToInput}
              />
            </div>
            <BaziChatInput
              input={chatInput}
              loading={chatLoading}
              disabled={aiLoading}
              onInputChange={setChatInput}
              onSend={handleSendChatMessage}
              onKeyDown={handleChatKeyDown}
            />
          </>
        )}
      </main>

      {/* Save Profile Dialog */}
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
              <Label htmlFor="profile-name" className="text-amber-800 dark:text-amber-400">
                档案名称
              </Label>
              <Input
                id="profile-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="例如：自己的八字、父亲八字..."
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
