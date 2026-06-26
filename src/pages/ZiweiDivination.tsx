import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Save, Loader2 } from 'lucide-react';
import MainHeaderTabs from '../components/MainHeaderTabs';
import ZiweiForm from '../components/ziwei/ZiweiForm';
import ZiweiPalaceGrid from '../components/ziwei/ZiweiPalaceGrid';
import ZiweiSummaryCards from '../components/ziwei/ZiweiSummaryCards';
import ZiweiPatternsCard from '../components/ziwei/ZiweiPatternsCard';
import ZiweiMessageList from '../components/ziwei/ZiweiMessageList';
import ZiweiChatInput from '../components/ziwei/ZiweiChatInput';
import ZiweiTimeNav from '../components/ziwei/ZiweiTimeNav';
import ZiweiStarDetailPanel from '../components/ziwei/ZiweiStarDetailPanel';
import ZiweiPalaceAITrigger from '../components/ziwei/ZiweiPalaceAITrigger';
import { ZiweiPalaceProvider } from '../components/ziwei/ZiweiPalaceContext';
import { calculateZiweiChart, type ZiweiChart } from '../lib/ziwei-calculator';
import {
  ziweiAIFortune,
  checkZiweiAIStatus,
  ziweiChat,
  type ZiweiInput,
  type ChatMessage,
} from '../lib/ziwei-api';
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

interface ZiweiAIInterpretation {
  content: string;
  model: string;
  timestamp: number;
}

interface ZiweiResult {
  input: ZiweiInput;
  aiInterpretation?: ZiweiAIInterpretation;
}

export default function ZiweiDivination() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [result, setResult] = useState<ZiweiResult | null>(null);

  // AI 状态
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [_aiAvailable, setAiAvailable] = useState<boolean | null>(null);

  // 对话状态
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatContextSummary, setChatContextSummary] = useState<ChatContextSummary | null>(null);

  // 记住输入信息
  const [lastInput, setLastInput] = useState<ZiweiInput | null>(null);

  // 本地排盘结果
  const [chart, setChart] = useState<ZiweiChart | null>(null);

  // 档案（全局 ProfileContext）
  const { currentProfile, saveProfile: saveProfileCtx } = useProfile();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<ZiweiInput | null>(null);

  // 当前选中档案 → ZiweiForm 预填（仅 birthdate 档案；pillars 档案无法排紫微盘）
  const initialFormData = useMemo<ZiweiInput | undefined>(() => {
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

  // 检查 AI 服务状态
  useEffect(() => {
    checkZiweiAIStatus().then(setAiAvailable);
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

  const handleGoHome = () => navigate('/');

  // 提交排盘
  const handleSubmit = (data: ZiweiInput) => {
    setLastInput(data);
    setChart(null);
    resetChat();
    setAiError(null);

    if (data.year && data.month && data.day && data.hour !== undefined) {
      const ziweiChart = calculateZiweiChart({
        year: data.year,
        month: data.month,
        day: data.day,
        hour: data.hour,
        minute: data.minute || 0,
        gender: data.gender,
        birthplace: data.birthplace,
        useSolarTime: data.useSolarTime,
      });
      setChart(ziweiChart);
      data.chart = ziweiChart;
    }

    setResult({ input: data });
    setStep('result');
    handleAIInterpretation(data);
  };

  const handleBackToInput = () => {
    setStep('input');
    setResult(null);
    setChart(null);
    resetChat();
    setAiError(null);
    setAiLoading(false);
  };

  // 保存档案（紫微仅生辰录入，inputMode 固定 birthdate）
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

  // AI 解读
  const handleAIInterpretation = async (input: ZiweiInput) => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiError(null);

    try {
      const response = await ziweiAIFortune(input);
      if (response.success && response.data) {
        const interpretation: ZiweiAIInterpretation = {
          content: response.data.interpretation,
          model: response.data.model,
          timestamp: response.data.timestamp,
        };
        setResult((prev) => prev ? { ...prev, aiInterpretation: interpretation } : null);
        setChatContextSummary({
          initialInterpretationSummary: response.data.interpretation,
          createdAt: response.data.timestamp,
        });
      } else {
        setAiError(response.error || 'AI 紫微斗数解读失败');
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
      const response = await ziweiChat({
        message: userMessage.content,
        ziweiInput: lastInput,
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

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  // 宫位 AI 分析触发
  const handlePalaceAnalyze = useCallback(async (prompt: string) => {
    if (!lastInput || chatLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatLoading(true);
    setChatError(null);

    try {
      const response = await ziweiChat({
        message: prompt,
        ziweiInput: lastInput,
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
        setChatError(response.error || '宫位分析失败');
      }
    } catch (error) {
      setChatError(error instanceof Error ? error.message : '请求失败');
    } finally {
      setChatLoading(false);
    }
  }, [lastInput, chatLoading, chatMessages, chatContextSummary]);

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
            <button type="button" onClick={handleGoHome}
              className="flex items-center gap-3 rounded-full transition-opacity duration-300 hover:opacity-85">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/70 bg-white/76
                text-amber-600 shadow-[0_14px_28px_-22px_rgba(180,83,9,0.35)]
                dark:border-white/10 dark:bg-neutral-950/65 dark:text-amber-300 dark:shadow-none">
                <Compass className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold tracking-[0.14em] text-amber-900 dark:text-amber-50 sm:text-xl">
                  紫微斗数
                </h1>
              </div>
            </button>
            <MainHeaderTabs />
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
                  "紫微垣中窥天命，十二宫里辨吉凶"
                </p>
              </div>
              <ZiweiForm
                onSubmit={handleSubmit}
                loading={aiLoading}
                initialData={initialFormData}
                onSave={(data) => { setPendingSaveData(data); setSaveDialogOpen(true); }}
              />
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <ZiweiPalaceProvider>
            <div className="flex-1 overflow-y-auto">
              {chart && (
                <div className="space-y-4 px-4 pt-4 pb-2 max-w-3xl mx-auto">
                  <ZiweiTimeNav chart={chart} />
                  <ZiweiPalaceGrid chart={chart} />
                  <ZiweiSummaryCards chart={chart} />
                  <ZiweiPatternsCard chart={chart} />
                </div>
              )}
              <ZiweiMessageList
                resultInput={result.input}
                chart={chart}
                aiInterpretation={result.aiInterpretation || null}
                aiLoading={aiLoading}
                aiError={aiError}
                chatMessages={chatMessages}
                chatLoading={chatLoading}
                chatError={chatError}
                onBackToInput={handleBackToInput}
                onTopicClick={handlePalaceAnalyze}
              />
            </div>
            <ZiweiChatInput
              input={chatInput}
              loading={chatLoading}
              disabled={aiLoading}
              onInputChange={setChatInput}
              onSend={handleSendChatMessage}
              onKeyDown={handleChatKeyDown}
            />
            {chart && <ZiweiStarDetailPanel chart={chart} />}
            {chart && <ZiweiPalaceAITrigger chart={chart} onPalaceAnalyze={handlePalaceAnalyze} disabled={chatLoading} />}
          </ZiweiPalaceProvider>
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
              <Label htmlFor="ziwei-profile-name" className="text-amber-800 dark:text-amber-400">
                档案名称
              </Label>
              <Input
                id="ziwei-profile-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="例如：自己的命盘、配偶命盘..."
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
