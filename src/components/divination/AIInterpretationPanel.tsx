import { Bot, Loader2, Sparkles } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';
import type { DivinationResult } from '../../lib/meihua-divination';

interface AIInterpretationPanelProps {
  aiInterpretation: DivinationResult['aiInterpretation'];
  aiAvailable: boolean | null;
  aiLoading: boolean;
  aiError: string | null;
  onRequestInterpretation: () => void;
}

export default function AIInterpretationPanel({
  aiInterpretation,
  aiAvailable,
  aiLoading,
  aiError,
  onRequestInterpretation,
}: AIInterpretationPanelProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50
                 dark:from-indigo-950/30 dark:to-purple-950/30
                 rounded-2xl p-6 shadow-md
                 border-2 border-indigo-300 dark:border-indigo-700/50">
      <div className="flex items-center gap-3 mb-4">
        <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
          🤖 AI 大师解卦
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
            <div className="text-[#6B5549] dark:text-amber-300">
              <p className="mb-2">⚠️ AI 解卦服务未配置</p>
              <p className="text-sm">请检查服务器 OpenAI API 配置</p>
            </div>
          ) : (
            <>
              <p className="text-indigo-700 dark:text-indigo-300 mb-4">
                点击按钮，让 AI 易学大师为您深度解读此卦
              </p>
              <button
                onClick={onRequestInterpretation}
                disabled={aiLoading || !aiAvailable}
                className="inline-flex items-center gap-2 px-6 py-3
                         bg-gradient-to-r from-indigo-600 to-purple-600
                         hover:from-indigo-700 hover:to-purple-700
                         disabled:from-gray-400 disabled:to-gray-500
                         text-white font-bold rounded-lg
                         transition-all shadow-lg
                         hover:shadow-xl hover:-translate-y-0.5
                         disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI 解卦中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    获取 AI 解卦
                  </>
                )}
              </button>
              {aiError && (
                <p className="mt-3 text-red-600 dark:text-red-400 text-sm">
                  ❌ {aiError}
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
          <div className="pt-4 border-t border-indigo-200 dark:border-indigo-800/50
                        flex items-center justify-between text-sm">
            <span className="text-indigo-600 dark:text-indigo-400">
              模型: {aiInterpretation.model}
            </span>
            <span className="text-indigo-500 dark:text-indigo-500">
              {new Date(aiInterpretation.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
