import { Bot, Loader2 } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';
import type { ChatMessage } from '../../lib/bazi-api';

interface ChatContextSummary {
  initialInterpretationSummary: string;
  createdAt: number;
}

interface BaziChatPanelProps {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  error: string | null;
  contextSummary: ChatContextSummary | null;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export default function BaziChatPanel({
  messages,
  input,
  loading,
  error,
  contextSummary,
  onInputChange,
  onSend,
  onKeyDown,
}: BaziChatPanelProps) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50
                 dark:from-amber-950/20 dark:to-orange-950/20
                 rounded-2xl p-6 shadow-md
                 border-2 border-amber-300 dark:border-amber-700/50">
      <div className="flex items-center gap-3 mb-4">
        <Bot className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">
          💬 继续追问
        </h3>
        <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/50
                       text-amber-700 dark:text-amber-300 rounded-full">
          多轮对话
        </span>
      </div>

      {contextSummary && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-white/80 p-4 shadow-sm dark:border-amber-800/30 dark:bg-neutral-900/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                已载入初始命盘分析摘要
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                后续追问会优先参考这份摘要和当前命盘，并默认围绕当前问题作答。
              </p>
            </div>
            <span className="text-xs text-amber-500 dark:text-amber-500">
              {new Date(contextSummary.createdAt).toLocaleTimeString()}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm text-amber-800 dark:text-amber-200">
            {contextSummary.initialInterpretationSummary}
          </p>
        </div>
      )}

      {/* 对话历史 */}
      <div className="space-y-4 max-h-96 overflow-y-auto mb-4 p-2">
        {messages.length === 0 && !loading && (
          <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-5 text-center dark:border-amber-800/30 dark:bg-amber-950/10">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              初始命盘分析正文在上方，下面可以继续追问更具体的问题，系统会默认围绕当前命盘作答。
            </p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
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
        {loading && (
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
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30">
          <p className="text-sm text-red-600 dark:text-red-400">
            ✗ {error}
          </p>
        </div>
      )}

      {/* 输入框 */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="根据命盘分析内容继续提问，例如：'能再说详细点吗？' 或 '今年的事业运具体怎么样？'"
          rows={2}
          disabled={loading}
          className="flex-1 px-4 py-3 border border-amber-300 dark:border-amber-700/50
                   rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500
                   dark:focus:ring-amber-600
                   text-amber-900 dark:text-amber-100
                   bg-white dark:bg-neutral-900
                   transition-colors placeholder:text-amber-400 dark:placeholder:text-amber-700/50
                   resize-none disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || loading}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700
                   disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                   text-white font-medium rounded-lg
                   transition-all shadow-lg
                   hover:shadow-xl
                   flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="text-lg">➤</span>
          )}
        </button>
      </div>
      <p className="mt-2 text-xs text-amber-500 dark:text-amber-500">
        提示：按 Enter 发送，Shift + Enter 换行。对话基于当前命盘进行。
      </p>
    </div>
  );
}
