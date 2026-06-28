import { useState, useRef, useEffect } from 'react';
import { Settings, Sun, Moon, Monitor, Smartphone } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

type LayoutMode = 'desktop' | 'mobile';

interface SettingsToggleProps {
  layoutMode: LayoutMode;
  onToggleLayout: () => void;
}

/** 设置键：齿轮按钮，弹出菜单含「明暗主题」「电脑/手机布局」两项。仅人生报告结果步使用 */
export default function SettingsToggle({ layoutMode, onToggleLayout }: SettingsToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';
  const isMobile = layoutMode === 'mobile';

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const btnBase = 'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors';

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E7D6C8]
                   bg-white/78 text-[#7B5C50] shadow-[0_12px_30px_-24px_rgba(120,74,49,0.5)]
                   backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D7B7A4]
                   hover:bg-white/92 hover:text-[#B56F62]
                   dark:border-white/10 dark:bg-neutral-950/68 dark:text-yellow-100/82 dark:shadow-none
                   dark:hover:border-yellow-500/30 dark:hover:bg-neutral-900/82 dark:hover:text-yellow-50"
        aria-label="设置"
        title="设置"
      >
        <Settings className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[100] mt-2 min-w-[180px] rounded-xl border border-amber-200/80
                        bg-white/95 p-1.5 shadow-[0_18px_40px_-20px_rgba(146,64,14,0.4)] backdrop-blur-xl
                        dark:border-amber-900/30 dark:bg-neutral-900/95">
          {/* 明暗主题 */}
          <button
            onClick={() => { toggleTheme(); }}
            className={`${btnBase} text-[#6B5549] hover:bg-amber-50/70 hover:text-[#B56F62]
                        dark:text-yellow-50/82 dark:hover:bg-amber-900/20 dark:hover:text-yellow-100`}
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="flex-1 text-left">{isDark ? '深色模式' : '浅色模式'}</span>
            <span className="text-xs text-amber-500/70 dark:text-amber-400/70">点击切换</span>
          </button>
          {/* 电脑/手机布局 */}
          <button
            onClick={() => { onToggleLayout(); }}
            className={`${btnBase} text-[#6B5549] hover:bg-amber-50/70 hover:text-[#B56F62]
                        dark:text-yellow-50/82 dark:hover:bg-amber-900/20 dark:hover:text-yellow-100`}
          >
            {isMobile ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
            <span className="flex-1 text-left">{isMobile ? '手机布局' : '电脑布局'}</span>
            <span className="text-xs text-amber-500/70 dark:text-amber-400/70">点击切换</span>
          </button>
        </div>
      )}
    </div>
  );
}
