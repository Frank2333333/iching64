import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

const Divination = lazy(() => import('./pages/Divination'));
const GuaList = lazy(() => import('./pages/GuaList'));
const FeedbackAdmin = lazy(() => import('./pages/FeedbackAdmin'));
const GuaTransformer = lazy(() => import('./pages/GuaTransformer'));
const QuestionDivination = lazy(() => import('./pages/QuestionDivination'));
const BaziDivination = lazy(() => import('./pages/BaziDivination'));
const ZiweiDivination = lazy(() => import('./pages/ZiweiDivination'));
const ClassicsPage = lazy(() => import('./pages/ClassicsPage'));
const ZiweiKnowledge = lazy(() => import('./pages/ZiweiKnowledge'));

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#FFF8F3] via-[#FFFDFC] to-[#F7EFE7] dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E8D7CA] border-t-[#C97C6D] dark:border-yellow-900/30 dark:border-t-yellow-500" />
        <p className="text-sm text-[#8A6658] dark:text-yellow-200/70">加载中...</p>
      </div>
    </div>
  );
}

// 包装组件，用于页面切换动画
function AppContent() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const [pageTransition, setPageTransition] = useState<'none' | 'entering' | 'exiting'>('none');

  // 监听路由变化，添加页面切换动画
  useEffect(() => {
    let timerEntering: ReturnType<typeof setTimeout>;
    let timerNone: ReturnType<typeof setTimeout>;

    if (prevPath.current !== location.pathname) {
      setPageTransition('exiting');
      timerEntering = setTimeout(() => {
        setPageTransition('entering');
        prevPath.current = location.pathname;
        timerNone = setTimeout(() => {
          setPageTransition('none');
        }, 300);
      }, 200);
    }

    return () => {
      clearTimeout(timerEntering);
      clearTimeout(timerNone);
    };
  }, [location]);

  return (
    <div className={`transition-all duration-300 ${
      pageTransition === 'exiting' ? 'opacity-0 translate-x-4' :
      pageTransition === 'entering' ? 'opacity-100 translate-x-0' : ''
    }`}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<QuestionDivination />} />
          <Route path="/hexagrams" element={<GuaList />} />
          <Route path="/divination" element={<Divination />} />
          <Route path="/question" element={<QuestionDivination />} />
          <Route path="/transformer" element={<GuaTransformer />} />
          <Route path="/admin/feedback" element={<FeedbackAdmin />} />
          <Route path="/bazi" element={<BaziDivination />} />
          <Route path="/ziwei" element={<ZiweiDivination />} />
          <Route path="/classics" element={<ClassicsPage />} />
          <Route path="/ziwei-knowledge" element={<ZiweiKnowledge />} />
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
