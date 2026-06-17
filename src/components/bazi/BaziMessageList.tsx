import { useRef, useEffect } from 'react';
import { Bot, Loader2, ArrowLeft, User, Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';
import type { BaziInput, ChatMessage } from '../../lib/bazi-api';

interface BaziAIInterpretation {
  content: string;
  model: string;
  timestamp: number;
}

interface BaziMessageListProps {
  resultInput: BaziInput | null;
  aiInterpretation: BaziAIInterpretation | null;
  aiLoading: boolean;
  aiError: string | null;
  aiAvailable: boolean | null;
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  chatError: string | null;
  onBackToInput: () => void;
}

export default function BaziMessageList({
  resultInput,
  aiInterpretation,
  aiLoading,
  aiError,
  aiAvailable,
  chatMessages,
  chatLoading,
  chatError,
  onBackToInput,
}: BaziMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 新消息到达时自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiInterpretation, chatMessages, aiLoading, chatLoading]);

  if (!resultInput) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      <div className="mx-auto max-w-5xl space-y-4">
        {/* 用户信息摘要卡片 */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50
                     dark:from-amber-950/30 dark:to-orange-950/30
                     rounded-2xl p-4 sm:p-5 shadow-md
                     border border-amber-200 dark:border-amber-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                命主信息
              </span>
            </div>
            <button
              onClick={onBackToInput}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg
                       text-amber-700 dark:text-amber-300
                       hover:text-amber-900 dark:hover:text-amber-100
                       hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all"
            >
              <ArrowLeft className="w-3 h-3" />
              重新输入
            </button>
          </div>

          <div className="space-y-2 text-sm">
            {resultInput.pillars ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-amber-500 dark:text-amber-500">性别：</span>
                <span className="text-amber-900 dark:text-amber-100">
                  {resultInput.gender === 'male' ? '男' : '女'}
                </span>
                {resultInput.birthplace && (
                  <>
                    <span className="text-amber-500 dark:text-amber-500">地点：</span>
                    <span className="text-amber-900 dark:text-amber-100">{resultInput.birthplace}</span>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Calendar className="w-3 h-3 text-amber-500" />
                <span className="text-amber-900 dark:text-amber-100">
                  {resultInput.year}年{resultInput.month}月{resultInput.day}日
                </span>
                <Clock className="w-3 h-3 text-amber-500" />
                <span className="text-amber-900 dark:text-amber-100">
                  {resultInput.hour?.toString().padStart(2, '0')}:
                  {resultInput.minute?.toString().padStart(2, '0')}
                </span>
                <span className="text-amber-500 dark:text-amber-500">
                  {resultInput.gender === 'male' ? '男' : '女'}
                </span>
                {resultInput.birthplace && (
                  <>
                    <MapPin className="w-3 h-3 text-amber-500" />
                    <span className="text-amber-900 dark:text-amber-100">{resultInput.birthplace}</span>
                  </>
                )}
              </div>
            )}
            {resultInput.pillars && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-amber-500 dark:text-amber-500">八字：</span>
                {Object.values(resultInput.pillars).map((p) => (
                  <span key={p} className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded-md text-amber-900 dark:text-amber-100 font-semibold">
                    {p}
                  </span>
                ))}
              </div>
            )}
            {resultInput.question && (
              <div className="pt-1 border-t border-amber-100 dark:border-amber-900/20">
                <span className="text-amber-500 dark:text-amber-500">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  咨询：
                </span>
                <span className="text-amber-900 dark:text-amber-100">{resultInput.question}</span>
              </div>
            )}
          </div>
        </div>

        {/* AI 服务不可用提示 */}
        {aiAvailable === false && (
          <div className="flex justify-center">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-center">
              <p className="text-sm text-red-700 dark:text-red-300">
                🔮 AI 排盘服务未配置，请检查服务器 OpenAI API 配置
              </p>
            </div>
          </div>
        )}

        {/* AI 排盘中加载气泡 */}
        {aiLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] bg-white dark:bg-neutral-800 border border-amber-200 dark:border-amber-800/30 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  观天之道...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* AI 解读错误 */}
        {aiError && !aiLoading && (
          <div className="flex justify-center">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
              <p className="text-sm text-red-600 dark:text-red-400">
                ✗ {aiError}
              </p>
            </div>
          </div>
        )}

        {/* AI 首次解读消息 */}
        {aiInterpretation && (
          <div className="flex justify-start">
            <div className="max-w-[90%] sm:max-w-[85%] bg-white dark:bg-neutral-800 border border-amber-200 dark:border-amber-800/30 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  AI 命理大师
                </span>
              </div>
              <div className="text-amber-900 dark:text-amber-100">
                <MarkdownRenderer content={aiInterpretation.content} className="text-sm md:text-base" />
              </div>
              <div className="text-xs mt-2 text-amber-400 dark:text-amber-500 text-right">
                {new Date(aiInterpretation.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* 追问对话历史 */}
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-amber-600 text-white dark:bg-amber-700'
                  : 'bg-white dark:bg-neutral-800 border border-amber-200 dark:border-amber-800/30'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    AI 命理大师
                  </span>
                </div>
              )}
              <div
                className={`text-sm ${
                  msg.role === 'user'
                    ? 'text-white'
                    : 'text-amber-900 dark:text-amber-100'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <MarkdownRenderer content={msg.content} className="text-sm" />
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
              <div
                className={`text-xs mt-2 ${
                  msg.role === 'user'
                    ? 'text-amber-200'
                    : 'text-amber-400 dark:text-amber-500'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* 对话加载气泡 */}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-neutral-800 border border-amber-200 dark:border-amber-800/30 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  AI 思考中...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 对话错误 */}
        {chatError && !chatLoading && (
          <div className="flex justify-center">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
              <p className="text-sm text-red-600 dark:text-red-400">
                ✗ {chatError}
              </p>
            </div>
          </div>
        )}

        {/* 空状态引导（有解读但无追问时） */}
        {aiInterpretation && chatMessages.length === 0 && !chatLoading && (
          <div className="flex justify-center">
            <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-5 text-center dark:border-amber-800/30 dark:bg-amber-950/10 max-w-[85%]">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                命盘解读已完成，可在下方输入框继续追问
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
