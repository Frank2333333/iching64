import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// 存储滚动位置的全局对象
const scrollPositions: Record<string, number> = {};

/**
 * 记住和恢复滚动位置的 Hook
 * @param key - 用于标识当前页面的 key，默认使用 pathname
 */
export function useScrollPosition(key?: string) {
  const location = useLocation();
  const pageKey = key || location.pathname + location.search;
  const hasRestored = useRef(false);

  // 组件挂载时恢复滚动位置
  useEffect(() => {
    if (!hasRestored.current) {
      const savedPosition = scrollPositions[pageKey];
      if (savedPosition && savedPosition > 0) {
        // 使用 requestAnimationFrame 确保在渲染完成后恢复
        requestAnimationFrame(() => {
          window.scrollTo({
            top: savedPosition,
            behavior: 'instant'
          });
        });
      }
      hasRestored.current = true;
    }

    // 组件卸载前保存滚动位置
    return () => {
      scrollPositions[pageKey] = window.scrollY;
    };
  }, [pageKey]);

  // 监听滚动并实时保存（防抖）
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        scrollPositions[pageKey] = window.scrollY;
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [pageKey]);
}

/**
 * 清除指定页面的滚动位置
 */
export function clearScrollPosition(key: string) {
  delete scrollPositions[key];
}

/**
 * 清除所有滚动位置
 */
export function clearAllScrollPositions() {
  Object.keys(scrollPositions).forEach(key => {
    delete scrollPositions[key];
  });
}
