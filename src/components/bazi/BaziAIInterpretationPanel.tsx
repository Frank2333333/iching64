import { Bot, Loader2, Sparkles } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';

interface BaziAIInterpretation {
  content: string;
  model: string;
  timestamp: number;
}

interface BaziAIInterpretationPanelProps {
  aiInterpretation: BaziAIInterpretation | null;
  aiAvailable: boolean | null;
  aiLoading: boolean;
  aiError: string | null;
  onRequestInterpretation: () => void;
}

export default function BaziAIInterpretationPanel({
  aiInterpretation,
  aiAvailable,
  aiLoading,
  aiError,
  onRequestInterpretation,
}: BaziAIInterpretationPanelProps) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50
                 dark:from-amber-950/30 dark:to-orange-950/30
                 rounded-2xl p-6 shadow-md
                 border-2 border-amber-300 dark:border-amber-700/50">
      <div className="flex items-center gap-3 mb-4">
        <Bot className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">
          🤖 AI 命理大师解读
        </h3>
        {aiInterpretation && (
          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/50
                         text-green-700 dark:text-green-300 rounded-full">
            已完成
          </span>
        )}
      </div>

      {!aiInterpretation ? (
        <div className="text-center py-6">
          {aiAvailable === false ? (
            <div className="text-amber-800 dark:text-amber-300">
              <p className="mb-2">🔮 AI 排盘服务未配置</p>
              <p className="text-sm">请检查服务器 OpenAI API 配置</p>
            </div>
          ) : (
            <>
              <p className="text-amber-700 dark:text-amber-300 mb-4">
                点击按钮，让 AI 命理大师为您深度解读八字命盘
              </p>
              <button
                onClick={onRequestInterpretation}
                disabled={aiLoading || !aiAvailable}
                className="inline-flex items-center gap-2 px-6 py-3
                         bg-gradient-to-r from-amber-600 to-orange-600
                         hover:from-amber-700 hover:to-orange-700
                         disabled:from-gray-400 disabled:to-gray-500
                         text-white font-bold rounded-lg
                         transition-all shadow-lg
                         hover:shadow-xl hover:-translate-y-0.5
                         disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI 排盘中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    获取 AI 命盘解读
                  </>
                )}
              </button>
              {aiError && (
                <p className="mt-3 text-red-600 dark:text-red-400 text-sm">
                  ✗ {aiError}
                </p>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <MarkdownRenderer
            content={aiInterpretation.content}
            className="text-sm md:text-base"
          />
          <div className="pt-4 border-t border-amber-200 dark:border-amber-800/50
                        flex items-center justify-end text-sm">
            <span className="text-amber-500 dark:text-amber-500">
              {new Date(aiInterpretation.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
