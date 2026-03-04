import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'iching64-theme';

/**
 * 主题管理 Hook
 * 支持 light/dark 模式切换，并持久化到 localStorage
 */
export function useTheme() {
  // 从 localStorage 读取主题，默认为 light
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (saved && (saved === 'light' || saved === 'dark')) {
      return saved;
    }
    
    // 如果没有保存的主题，检测系统偏好
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  // 应用主题到 document
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // 保存到 localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // 切换主题
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // 设置为浅色模式
  const setLightTheme = useCallback(() => {
    setTheme('light');
  }, []);

  // 设置为深色模式
  const setDarkTheme = useCallback(() => {
    setTheme('dark');
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    setLightTheme,
    setDarkTheme,
  };
}
