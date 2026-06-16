import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import MainHeaderTabs from '../components/MainHeaderTabs';
import BaziForm from '../components/bazi/BaziForm';
import BaziAIInterpretationPanel from '../components/bazi/BaziAIInterpretationPanel';
import BaziChatPanel from '../components/bazi/BaziChatPanel';
import {
  baziAIFortune,
  checkBaziAIStatus,
  baziChat,
  type BaziInput,
  type ChatMessage,
} from '../lib/bazi-api';
import { useScrollPosition } from '../hooks/useScrollPosition';

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

  useScrollPosition(`bazi-divination-${step}`);

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

  // 提交排盘
  const handleSubmit = (data: BaziInput) => {
    setLastInput(data);
    setResult({ input: data });
    setStep('result');
    resetChat();
    setAiError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 返回输入页
  const handleBackToInput = () => {
    setStep('input');
    setResult(null);
    resetChat();
    setAiError(null);
  };

  // AI 解读
  const handleAIInterpretation = async () => {
    if (!lastInput || aiLoading) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await baziAIFortune(lastInput);

      if (response.success && response.data) {
        const interpretation: BaziAIInterpretation = {
          content: response.data.interpretation,
          model: response.data.model,
          timestamp: response.data.timestamp,
        };

        // 从 AI 解读中生成摘要
        const content = response.data.interpretation;
        let summary = content.substring(0, 400);
        if (content.length > 400) summary += '...';

        setResult((prev) =>
          prev ? { ...prev, aiInterpretation: interpretation } : null
        );
        setChatContextSummary({
          initialInterpretationSummary: summary,
          createdAt: response.data.timestamp,
        });
        resetChat();
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
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F3] via-[#FFFDFC] to-[#F7EFE7]
                  dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
                  iching-pattern-bg iching-cloud-bg transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-amber-200/80 bg-white/82
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
            <MainHeaderTabs />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Slogan */}
        <div className="text-center mb-8 animate-fadeIn">
          <p className="text-xl md:text-2xl font-serif text-amber-800 dark:text-amber-300/90 tracking-wider italic">
            "知命者，不立于岩墙之下"
          </p>
        </div>

        {step === 'input' && (
          <BaziForm onSubmit={handleSubmit} loading={aiLoading} />
        )}

        {step === 'result' && result && (
          <div className="space-y-6">
            {/* 返回按钮 */}
            <button
              onClick={handleBackToInput}
              className="flex items-center gap-2 px-4 py-2 rounded-lg
                       text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100
                       hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>重新输入</span>
            </button>

            {/* 出生信息摘要 */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-md
                         border border-amber-200 dark:border-amber-900/30">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-3">
                命主信息
              </h3>

              {result.input.pillars ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-amber-500 dark:text-amber-500">性别：</span>
                      <span className="text-amber-900 dark:text-amber-100">
                        {result.input.gender === 'male' ? '男' : '女'}
                      </span>
                    </div>
                    {result.input.birthplace && (
                      <div>
                        <span className="text-amber-500 dark:text-amber-500">地点：</span>
                        <span className="text-amber-900 dark:text-amber-100">
                          {result.input.birthplace}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-lg font-semibold
                                text-amber-900 dark:text-amber-100
                                bg-amber-50 dark:bg-amber-900/20 rounded-lg px-4 py-3">
                    <span className="text-sm text-amber-500 dark:text-amber-500 mr-1">八字：</span>
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/40 rounded-md">
                      {result.input.pillars.year}
                    </span>
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/40 rounded-md">
                      {result.input.pillars.month}
                    </span>
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/40 rounded-md">
                      {result.input.pillars.day}
                    </span>
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/40 rounded-md">
                      {result.input.pillars.hour}
                    </span>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-amber-500 dark:text-amber-500">性别：</span>
                    <span className="text-amber-900 dark:text-amber-100">
                      {result.input.gender === 'male' ? '男' : '女'}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-500 dark:text-amber-500">出生：</span>
                    <span className="text-amber-900 dark:text-amber-100">
                      {result.input.year}年{result.input.month}月{result.input.day}日
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-500 dark:text-amber-500">时辰：</span>
                    <span className="text-amber-900 dark:text-amber-100">
                      {result.input.hour.toString().padStart(2, '0')}:
                      {result.input.minute.toString().padStart(2, '0')}
                    </span>
                  </div>
                  {result.input.birthplace && (
                    <div>
                      <span className="text-amber-500 dark:text-amber-500">地点：</span>
                      <span className="text-amber-900 dark:text-amber-100">
                        {result.input.birthplace}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {result.input.question && (
                <div className="mt-3 pt-3 border-t border-amber-100 dark:border-amber-900/20">
                  <span className="text-amber-500 dark:text-amber-500">咨询：</span>
                  <span className="text-amber-900 dark:text-amber-100">{result.input.question}</span>
                </div>
              )}
            </div>

            {/* AI 解读 */}
            <BaziAIInterpretationPanel
              aiInterpretation={result.aiInterpretation || null}
              aiAvailable={aiAvailable}
              aiLoading={aiLoading}
              aiError={aiError}
              onRequestInterpretation={handleAIInterpretation}
            />

            {/* 对话面板 - 在 AI 解读结果下方 */}
            {result.aiInterpretation && (
              <BaziChatPanel
                messages={chatMessages}
                input={chatInput}
                loading={chatLoading}
                error={chatError}
                contextSummary={chatContextSummary}
                onInputChange={setChatInput}
                onSend={handleSendChatMessage}
                onKeyDown={handleChatKeyDown}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-amber-900 dark:bg-neutral-900 text-amber-200 dark:text-amber-200/70 py-8 mt-12
                       transition-colors duration-500 border-t dark:border-amber-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2">易经八字排盘</p>
          <p className="text-sm text-amber-300 dark:text-amber-300/60">传承中华传统文化，探索命理智慧</p>
        </div>
      </footer>
    </div>
  );
}
