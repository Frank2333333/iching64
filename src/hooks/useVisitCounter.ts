import { useState, useEffect } from 'react';

interface VisitCounter {
  count: number;
}

export function useVisitCounter(): VisitCounter {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // 从服务器获取访问计数
    fetch('/api/visit-count')
      .then(res => res.json())
      .then(data => setCount(data.count))
      .catch(err => console.error('获取访问计数失败:', err));
  }, []);

  return {
    count
  };
}
