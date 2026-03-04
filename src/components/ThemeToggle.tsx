import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle relative p-2 rounded-lg transition-all duration-300 
                 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-800/50
                 text-amber-700 dark:text-amber-300
                 border border-amber-300 dark:border-amber-700
                 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-600"
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      <div className="relative w-5 h-5">
        {/* 太阳图标 */}
        <Sun 
          className={`theme-toggle-icon absolute inset-0 w-5 h-5 transition-all duration-500
                     ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
        />
        {/* 月亮图标 */}
        <Moon 
          className={`theme-toggle-icon absolute inset-0 w-5 h-5 transition-all duration-500
                     ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
        />
      </div>
      
      {/* 涟漪效果 */}
      <span className="absolute inset-0 rounded-lg overflow-hidden">
        <span className="absolute inset-0 bg-amber-400/20 dark:bg-amber-500/20 
                       scale-0 group-active:scale-100 transition-transform duration-300 rounded-lg" />
      </span>
    </button>
  );
}
