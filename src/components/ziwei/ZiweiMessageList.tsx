import { useRef, useEffect } from 'react';
import { Bot, Loader2, ArrowLeft, User } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';
import type { ZiweiInput, ChatMessage } from '../../lib/ziwei-api';
import type { ZiweiChart } from '../../lib/ziwei-calculator';

interface ZiweiAIInterpretation {
  content: string;
  model: string;
  timestamp: number;
}

interface ZiweiMessageListProps {
  resultInput: ZiweiInput | null;
  chart: ZiweiChart | null;
  aiInterpretation: ZiweiAIInterpretation | null;
  aiLoading: boolean;
  aiError: string | null;
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  chatError: string | null;
  onBackToInput: () => void;
}

export default function ZiweiMessageList({
  resultInput,
  chart,
  aiInterpretation,
  aiLoading,
  aiError,
  chatMessages,
  chatLoading,
  chatError,
  onBackToInput,
}: ZiweiMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiInterpretation, chatMessages, aiLoading, chatLoading]);

  if (!resultInput) return null;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="mx-auto max-w-5xl space-y-4">
        {/* 返回按钮 + 紧凑命盘摘要 */}
        <div className="flex items-start gap-3">
          <button onClick={onBackToInput}
            className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors shrink-0 mt-1">
            <ArrowLeft className="w-4 h-4" />返回
          </button>
          {chart && (
            <div className="flex-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2.5 text-xs text-amber-700 dark:text-amber-300">
              <span className="font-bold">{chart.fiveElementsClass}</span>
              {' · '}命宫{chart.soulPalace}
              {chart.palaces.find(p => p.name === '命宫')?.majorStars.map(s => s.name).join('、')}
              {' · '}{chart.birthSiHua.lu}化禄 {chart.birthSiHua.quan}化权 {chart.birthSiHua.ke}化科 {chart.birthSiHua.ji}化忌
            </div>
          )}
        </div>

        {/* AI 解读 */}
        {aiLoading && !aiInterpretation && (
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 rounded-xl border border-amber-200 dark:border-amber-900/30">
            <Bot className="w-6 h-6 text-amber-500 animate-pulse" />
            <div className="flex-1">
              <div className="text-sm text-amber-700 dark:text-amber-300">正在解读命盘...</div>
              <div className="mt-1.5 h-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full animate-pulse w-2/3" />
              </div>
            </div>
          </div>
        )}

        {aiError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400">
            {aiError}
          </div>
        )}

        {aiInterpretation && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <Bot className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="prose prose-amber dark:prose-invert prose-sm max-w-none
                bg-white dark:bg-neutral-800 rounded-xl p-4 border border-amber-200 dark:border-amber-900/30">
                <MarkdownRenderer content={aiInterpretation.content} />
              </div>
            </div>
          </div>
        )}

        {/* 追问对话 */}
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            )}
            <div className={`max-w-[80%] min-w-0 ${msg.role === 'user'
              ? 'bg-amber-500 text-white dark:bg-amber-600 dark:text-white rounded-2xl rounded-br-md px-4 py-2.5'
              : 'bg-white dark:bg-neutral-800 rounded-xl p-4 border border-amber-200 dark:border-amber-900/30'}`}>
              {msg.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="prose prose-amber dark:prose-invert prose-sm max-w-none">
                  <MarkdownRenderer content={msg.content} />
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="shrink-0 w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800/50 flex items-center justify-center">
                <User className="w-4 h-4 text-amber-700 dark:text-amber-300" />
              </div>
            )}
          </div>
        ))}

        {chatLoading && (
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-neutral-800 rounded-xl border border-amber-200 dark:border-amber-900/30">
            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
            <span className="text-sm text-amber-600 dark:text-amber-400">思考中...</span>
          </div>
        )}

        {chatError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
            {chatError}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
