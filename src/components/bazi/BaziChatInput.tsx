import { Loader2 } from 'lucide-react';

interface BaziChatInputProps {
  input: string;
  loading: boolean;
  disabled: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export default function BaziChatInput({
  input,
  loading,
  disabled,
  onInputChange,
  onSend,
  onKeyDown,
}: BaziChatInputProps) {
  return (
    <div className="flex-none border-t border-amber-200/80 dark:border-amber-900/30 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl px-4 py-3 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={disabled ? 'AI 排盘中，请稍候...' : '继续追问，例如：能再说详细点吗？'}
            rows={2}
            disabled={disabled}
            className="flex-1 px-4 py-3 border border-amber-300 dark:border-amber-700/50
                     rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500
                     dark:focus:ring-amber-600
                     text-amber-900 dark:text-amber-100
                     bg-white dark:bg-neutral-900
                     transition-colors placeholder:text-amber-400 dark:placeholder:text-amber-700/50
                     resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || disabled}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700
                     disabled:bg-gray-400 disabled:cursor-not-allowed
                     text-white font-medium rounded-xl
                     transition-all shadow-lg hover:shadow-xl
                     flex items-center justify-center self-end h-[46px] w-[46px]"
            aria-label="发送"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="text-lg">➤</span>
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-amber-500 dark:text-amber-500 text-center">
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  );
}
