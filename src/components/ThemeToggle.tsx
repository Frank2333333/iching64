import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle group relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full
                 border border-[#E7D6C8] bg-white/78 text-[#7B5C50] shadow-[0_12px_30px_-24px_rgba(120,74,49,0.5)]
                 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D7B7A4]
                 hover:bg-white/92 hover:text-[#B56F62]
                 focus:outline-none focus:ring-2 focus:ring-[#D7B7A4] focus:ring-offset-2 focus:ring-offset-[#FFF8F3]
                 dark:border-white/10 dark:bg-neutral-950/68 dark:text-yellow-100/82 dark:shadow-[0_14px_32px_-24px_rgba(250,204,21,0.2)]
                 dark:hover:border-yellow-500/30 dark:hover:bg-neutral-900/82 dark:hover:text-yellow-50
                 dark:focus:ring-yellow-500/40 dark:focus:ring-offset-neutral-950"
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      <span
        className="absolute inset-[3px] rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(255,255,255,0.45)_65%,transparent)]
                   opacity-90 transition-opacity duration-300 group-hover:opacity-100
                   dark:bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.18),rgba(255,255,255,0.02)_65%,transparent)]"
      />
      <div className="relative h-5 w-5">
        <Sun
          className={`theme-toggle-icon absolute inset-0 h-5 w-5 transition-all duration-500
                     ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
        />
        <Moon
          className={`theme-toggle-icon absolute inset-0 h-5 w-5 transition-all duration-500
                     ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
        />
      </div>

      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span className="absolute inset-0 rounded-full bg-[#E8B8A4]/18 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-yellow-500/10" />
      </span>
    </button>
  );
}
