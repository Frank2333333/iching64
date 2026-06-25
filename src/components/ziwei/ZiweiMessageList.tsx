import { useRef, useEffect, useMemo } from 'react';
import { Bot, Loader2, ArrowLeft, User } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';
import { useZiweiPalace } from './ZiweiPalaceContext';
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
  onTopicClick?: (prompt: string) => void;
}

interface TopicButton {
  label: string;
  prompt: string;
  scope?: 'daxian' | 'liunian';
}

const TOPIC_BUTTONS: TopicButton[] = [
  { label: '命格', prompt: '请全面分析我的命格特征，包括性格、先天格局、命宫主星组合的整体评价，以及一生的整体运势走向。' },
  { label: '感情', prompt: '请重点分析我的感情运势，包括夫妻宫和桃花星的配置，适合的婚恋对象类型，以及感情中需要注意的问题。' },
  { label: '事业', prompt: '请重点分析我的事业运势，包括官禄宫和事业相关星曜的配置，适合的职业方向，以及事业发展中的关键时期。' },
  { label: '财运', prompt: '请重点分析我的财运，包括财帛宫和财星配置，正财偏财的特点，理财建议，以及财运的关键转折期。' },
  { label: '健康', prompt: '请重点分析我的健康运势，包括疾厄宫的配置，需要特别注意的健康问题，以及养生保健建议。' },
  { label: '性格', prompt: '请深入分析我的性格特质，包括命宫主星的性格倾向，优点缺点，以及性格对人际关系和事业发展的影响。' },
];

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
  onTopicClick,
}: ZiweiMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { timeView, selectedDaXianIndex, liunianYear } = useZiweiPalace();

  // 根据运限视角动态生成话题按钮
  const topicButtons = useMemo(() => {
    const buttons = [...TOPIC_BUTTONS];

    if (timeView === 'daxian' && chart) {
      const daXian = selectedDaXianIndex >= 0 && selectedDaXianIndex < chart.daXians.length
        ? chart.daXians[selectedDaXianIndex]
        : null;
      const ageInfo = daXian ? `${daXian.startAge}-${daXian.endAge}岁` : '';
      buttons.push(
        { label: '大限总运', prompt: `请分析我当前大限（${ageInfo}）的整体运势走向，包括大限命宫、大限四化对本命各宫的影响，以及这十年的关键转折。`, scope: 'daxian' as const },
        { label: '大限事业', prompt: `请分析我当前大限（${ageInfo}）的事业运势，包括大限官禄宫的变化、大限四化对事业的影响，以及这十年事业的机遇和挑战。`, scope: 'daxian' as const },
        { label: '大限感情', prompt: `请分析我当前大限（${ageInfo}）的感情运势，包括大限夫妻宫的变化、大限桃花星的影响，以及这十年感情的关键变化。`, scope: 'daxian' as const },
      );
    } else if (timeView === 'liunian') {
      buttons.push(
        { label: '流年运势', prompt: `请分析我${liunianYear}年的整体运势，包括流年命宫、流年四化的影响，以及今年的关键月份和注意事项。`, scope: 'liunian' as const },
        { label: '流年提醒', prompt: `请提醒我${liunianYear}年需要特别注意的事项，包括可能的风险、需要把握的机遇、以及流年四化带来的具体影响。`, scope: 'liunian' as const },
      );
    }

    return buttons;
  }, [timeView, chart, selectedDaXianIndex, liunianYear]);

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

        {/* 话题快捷按钮 */}
        {onTopicClick && !aiLoading && aiInterpretation && (
          <div className="flex flex-wrap gap-1.5">
            {topicButtons.map(btn => (
              <button
                key={btn.label}
                onClick={() => onTopicClick(btn.prompt)}
                disabled={chatLoading}
                className={`text-[11px] px-2.5 py-1 rounded-lg border
                  ${'scope' in btn && btn.scope === 'daxian'
                    ? 'border-purple-200/60 dark:border-purple-800/30 text-purple-700 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-100/50 dark:hover:bg-purple-900/20'
                    : 'scope' in btn && btn.scope === 'liunian'
                      ? 'border-blue-200/60 dark:border-blue-800/30 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100/50 dark:hover:bg-blue-900/20'
                      : 'border-amber-200/60 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 bg-white/50 dark:bg-neutral-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                  }
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-colors`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

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
