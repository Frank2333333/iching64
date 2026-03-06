import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, CheckCircle, Loader2, Lightbulb } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// 反馈类型
export type FeedbackType = 'feature' | 'bug' | 'ui' | 'content' | 'other';

export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  content: string;
  contact?: string;
  timestamp: number;
  userAgent: string;
  url: string;
}

const feedbackTypeLabels: Record<FeedbackType, string> = {
  feature: '✨ 功能建议',
  bug: '🐛 Bug 反馈',
  ui: '🎨 界面优化',
  content: '📚 内容建议',
  other: '💬 其他',
};

// localStorage keys
const FEEDBACK_STORAGE_KEY = 'iching64-feedback';
const FEEDBACK_LABEL_SHOWN_KEY = 'iching64-feedback-label-shown';

// 获取所有反馈
export function getAllFeedback(): FeedbackItem[] {
  try {
    const data = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 保存反馈
export function saveFeedback(feedback: FeedbackItem): void {
  try {
    const all = getAllFeedback();
    all.unshift(feedback);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(all));
  } catch (error) {
    console.error('保存反馈失败:', error);
  }
}

// 清空所有反馈（管理员用）
export function clearAllFeedback(): void {
  localStorage.removeItem(FEEDBACK_STORAGE_KEY);
}

interface FeedbackButtonProps {
  className?: string;
}

export default function FeedbackButton({ className }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLabelExpanded, setIsLabelExpanded] = useState(false);
  const [type, setType] = useState<FeedbackType>('feature');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const labelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 滚动超过一定距离后显示按钮
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    // 初始检查
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 控制标签展开/收缩
  useEffect(() => {
    if (!isVisible) {
      setIsLabelExpanded(false);
      return;
    }

    // 检查用户是否已经看过标签
    const hasShown = localStorage.getItem(FEEDBACK_LABEL_SHOWN_KEY);
    
    if (!hasShown) {
      // 延迟一点展开，让过渡更自然
      labelTimerRef.current = setTimeout(() => {
        setIsLabelExpanded(true);
      }, 500);

      // 5秒后自动收缩
      labelTimerRef.current = setTimeout(() => {
        setIsLabelExpanded(false);
        localStorage.setItem(FEEDBACK_LABEL_SHOWN_KEY, 'true');
      }, 5500);
    }

    return () => {
      if (labelTimerRef.current) {
        clearTimeout(labelTimerRef.current);
      }
    };
  }, [isVisible]);

  // 重置表单
  const resetForm = () => {
    setType('feature');
    setContent('');
    setContact('');
    setIsSuccess(false);
  };

  // 处理打开
  const handleOpen = () => {
    setIsOpen(true);
    resetForm();
    // 点击后收缩标签并标记为已读
    setIsLabelExpanded(false);
    localStorage.setItem(FEEDBACK_LABEL_SHOWN_KEY, 'true');
  };

  // 处理提交
  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);

    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    const feedback: FeedbackItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: content.trim(),
      contact: contact.trim() || undefined,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    saveFeedback(feedback);

    setIsSubmitting(false);
    setIsSuccess(true);

    // 3秒后自动关闭
    setTimeout(() => {
      setIsOpen(false);
      resetForm();
    }, 2000);
  };

  return (
    <>
      {/* 浮动按钮容器 */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-40 flex items-center gap-2',
          'transition-all duration-500',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0',
          className
        )}
      >
        {/* 提示标签 */}
        <button
          onClick={handleOpen}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full',
            'bg-white dark:bg-neutral-800',
            'text-amber-800 dark:text-yellow-200',
            'text-sm font-medium',
            'shadow-lg border border-amber-200 dark:border-yellow-900/50',
            'transition-all duration-500 ease-out',
            'hover:bg-amber-50 dark:hover:bg-neutral-700',
            'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
            'dark:focus:ring-yellow-500 dark:focus:ring-offset-neutral-900',
            isLabelExpanded
              ? 'translate-x-0 opacity-100 max-w-[200px]'
              : 'translate-x-4 opacity-0 max-w-0 px-0 overflow-hidden pointer-events-none'
          )}
        >
          <Lightbulb className="w-4 h-4 text-amber-500 dark:text-yellow-500 flex-shrink-0" />
          <span className="whitespace-nowrap">提交优化建议</span>
        </button>

        {/* 主按钮 */}
        <button
          onClick={handleOpen}
          className={cn(
            'w-14 h-14 rounded-full flex-shrink-0',
            'bg-gradient-to-r from-amber-600 to-amber-700',
            'dark:from-yellow-600 dark:to-yellow-700',
            'text-white shadow-lg',
            'flex items-center justify-center',
            'transition-all duration-300',
            'hover:scale-110 hover:shadow-xl',
            'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
            'dark:focus:ring-yellow-500 dark:focus:ring-offset-neutral-900'
          )}
          aria-label="提交反馈"
          title="优化建议"
        >
          {/* 脉冲动画背景 */}
          <span className="absolute inset-0 rounded-full bg-amber-500/30 dark:bg-yellow-500/30 animate-ping" />
          {/* 图标 */}
          <MessageCircle className="w-6 h-6 relative z-10" />
        </button>
      </div>

      {/* 反馈弹窗 */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-amber-200 dark:border-yellow-900/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-900 dark:text-yellow-100">
              <MessageCircle className="w-5 h-5 text-amber-600 dark:text-yellow-500" />
              优化建议
            </DialogTitle>
            <DialogDescription className="text-amber-700/70 dark:text-yellow-200/60">
              您的建议将帮助我们做得更好
            </DialogDescription>
          </DialogHeader>

          {isSuccess ? (
            // 成功状态
            <div className="py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900 dark:text-yellow-100 mb-2">
                感谢您的反馈！
              </h3>
              <p className="text-sm text-amber-700 dark:text-yellow-200/70">
                您的建议已成功记录，我们会认真考虑。
              </p>
            </div>
          ) : (
            // 表单
            <div className="space-y-4 py-2">
              {/* 反馈类型 */}
              <div className="space-y-2">
                <Label htmlFor="type" className="text-amber-900 dark:text-yellow-100">
                  反馈类型
                </Label>
                <Select value={type} onValueChange={(v) => setType(v as FeedbackType)}>
                  <SelectTrigger
                    id="type"
                    className="bg-amber-50/50 dark:bg-neutral-800 border-amber-200 dark:border-yellow-900/50
                             text-amber-900 dark:text-yellow-100"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-neutral-900 border-amber-200 dark:border-yellow-900/50">
                    {(Object.keys(feedbackTypeLabels) as FeedbackType[]).map((key) => (
                      <SelectItem
                        key={key}
                        value={key}
                        className="text-amber-900 dark:text-yellow-100 focus:bg-amber-100 dark:focus:bg-yellow-900/30"
                      >
                        {feedbackTypeLabels[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 详细描述 */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-amber-900 dark:text-yellow-100">
                  详细描述 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="请详细描述您的建议或问题..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="bg-amber-50/50 dark:bg-neutral-800 border-amber-200 dark:border-yellow-900/50
                           text-amber-900 dark:text-yellow-100 placeholder:text-amber-400/50 dark:placeholder:text-yellow-600/50
                           resize-none focus:ring-amber-500 dark:focus:ring-yellow-500"
                />
              </div>

              {/* 联系方式 */}
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-amber-900 dark:text-yellow-100">
                  联系方式 <span className="text-amber-600/60 dark:text-yellow-600/60">（可选）</span>
                </Label>
                <Input
                  id="contact"
                  type="text"
                  placeholder="邮箱或电话，方便我们回复您"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="bg-amber-50/50 dark:bg-neutral-800 border-amber-200 dark:border-yellow-900/50
                           text-amber-900 dark:text-yellow-100 placeholder:text-amber-400/50 dark:placeholder:text-yellow-600/50
                           focus:ring-amber-500 dark:focus:ring-yellow-500"
                />
              </div>

              {/* 提交按钮 */}
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800
                         dark:from-yellow-600 dark:to-yellow-700 dark:hover:from-yellow-700 dark:hover:to-yellow-800
                         text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    提交建议
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-amber-600/60 dark:text-yellow-600/60">
                您的反馈将保存在本地，开发者可在管理后台查看
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
