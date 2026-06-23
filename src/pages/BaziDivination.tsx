import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, LogIn, LogOut, Save, User, ChevronDown, Loader2, Archive } from 'lucide-react';
import MainHeaderTabs from '../components/MainHeaderTabs';
import BaziForm from '../components/bazi/BaziForm';
import BaziMessageList from '../components/bazi/BaziMessageList';
import BaziChatInput from '../components/bazi/BaziChatInput';
import LoginDialog from '../components/auth/LoginDialog';
import { calculateBaziChart, type BaziChart } from '../lib/bazi-calculator';
import { BaziChartTable } from '../components/bazi/BaziChartTable';
import { BaziSummaryCards } from '../components/bazi/BaziSummaryCards';
import { BaziDaYunTimeline } from '../components/bazi/BaziDaYunTimeline';
import {
  baziAIFortune,
  checkBaziAIStatus,
  baziChat,
  type BaziInput,
  type ChatMessage,
} from '../lib/bazi-api';
import { useAuth } from '../hooks/useAuth';
import { getProfiles, saveProfile, deleteProfile, type BaziProfile } from '../lib/bazi-profile-api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

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

  // 认证
  const { user, token, isLoggedIn, login, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  // 档案
  const [profiles, setProfiles] = useState<BaziProfile[]>([]);
  const [, setProfilesLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [initialFormData, setInitialFormData] = useState<BaziInput | undefined>(undefined);
  const [pendingSaveData, setPendingSaveData] = useState<BaziInput | null>(null);

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

  // 加载档案列表
  const loadProfiles = useCallback(async () => {
    if (!token) return;
    setProfilesLoading(true);
    const res = await getProfiles(token);
    setProfilesLoading(false);
    if (res.success && res.data) {
      setProfiles(res.data);
    }
  }, [token]);

  // 保存档案
  const handleSaveProfile = useCallback(async () => {
    if (!token || !pendingSaveData || !profileName.trim()) return;
    setSaveLoading(true);
    const inputMode = pendingSaveData.pillars ? 'pillars' : 'birthdate';
    const res = await saveProfile(token, {
      name: profileName.trim(),
      inputMode,
      data: pendingSaveData,
    });
    setSaveLoading(false);
    if (res.success) {
      setSaveDialogOpen(false);
      setProfileName('');
      setPendingSaveData(null);
      loadProfiles();
      if (res.overwritten) {
        alert('已覆盖同名档案');
      }
    }
  }, [token, pendingSaveData, profileName, loadProfiles]);

  // 载入档案到表单
  const handleLoadProfile = useCallback((profile: BaziProfile) => {
    setInitialFormData(profile.data);
    setStep('input');
    setResult(null);
    setChart(null);
    resetChat();
    setAiError(null);
    setAiLoading(false);
  }, []);

  // 删除档案
  const handleDeleteProfile = useCallback(async (id: string) => {
    if (!token) return;
    if (!window.confirm('确定删除此档案？')) return;
    const res = await deleteProfile(token, id);
    if (res.success) {
      loadProfiles();
    } else {
      alert(res.error || '删除失败');
    }
  }, [token, loadProfiles]);

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
      {/* Header */}
      <header className="flex-none border-b border-amber-200/80 bg-white/82
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
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-300 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                      <User className="w-4 h-4" />
                      <span className="max-w-[120px] truncate">{user?.email}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white dark:bg-neutral-900 border-amber-200 dark:border-amber-900/30">
                    <DropdownMenuItem onClick={() => { loadProfiles(); setStep('input'); }} className="text-amber-700 dark:text-amber-300 cursor-pointer">
                      <Archive className="w-4 h-4 mr-2" />
                      我的档案
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400 cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-300 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  登录
                </button>
              )}
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
              {isLoggedIn && profiles.length > 0 && (
                <div className="mb-4 animate-fadeIn">
                  <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-amber-200 dark:border-amber-900/30 shadow-sm">
                    <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                      <Archive className="w-4 h-4" />
                      我的档案
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profiles.map((p) => (
                        <div key={p.id} className="relative group">
                          <button
                            type="button"
                            onClick={() => handleLoadProfile(p)}
                            className="px-3 py-1.5 rounded-lg text-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                          >
                            {p.name}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteProfile(p.id); }}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10 leading-none"
                            title="删除"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <BaziForm
                onSubmit={handleSubmit}
                loading={aiLoading}
                initialData={initialFormData}
                onClearInitialData={() => setInitialFormData(undefined)}
                onSave={isLoggedIn ? (data) => { setPendingSaveData(data); setSaveDialogOpen(true); } : undefined}
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

      {/* Login Dialog */}
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} onLogin={login} />

      {/* Save Profile Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-amber-200 dark:border-amber-900/30">
          <DialogHeader>
            <DialogTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
              <Save className="w-5 h-5" />
              保存八字档案
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
