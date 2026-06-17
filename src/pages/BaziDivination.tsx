import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import MainHeaderTabs from '../components/MainHeaderTabs';
import BaziForm from '../components/bazi/BaziForm';
import BaziMessageList from '../components/bazi/BaziMessageList';
import BaziChatInput from '../components/bazi/BaziChatInput';
import {
  baziAIFortune,
  checkBaziAIStatus,
  baziChat,
  type BaziInput,
  type ChatMessage,
} from '../lib/bazi-api';

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

  // 提交排盘 -> 自动触发 AI 解读
  const handleSubmit = (data: BaziInput) => {
    setLastInput(data);
    setResult({ input: data });
    setStep('result');
    resetChat();
    setAiError(null);
    // 自动触发 AI 解读
    handleAIInterpretation(data);
  };

  // 返回输入页
  const handleBackToInput = () => {
    setStep('input');
    setResult(null);
    resetChat();
    setAiError(null);
    setAiLoading(false);
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
                  "知命者，不立于岩墙之下"
                </p>
              </div>
              <BaziForm onSubmit={handleSubmit} loading={aiLoading} />
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <>
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
    </div>
  );
}
