import { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Divination from './pages/Divination';
import GuaList from './pages/GuaList';
import FeedbackAdmin from './pages/FeedbackAdmin';
import GuaTransformer from './pages/GuaTransformer';
import QuestionDivination from './pages/QuestionDivination';
import './App.css';

// 包装组件，用于页面切换动画
function AppContent() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const [pageTransition, setPageTransition] = useState<'none' | 'entering' | 'exiting'>('none');

  // 监听路由变化，添加页面切换动画
  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      setPageTransition('exiting');
      setTimeout(() => {
        setPageTransition('entering');
        prevPath.current = location.pathname;
        setTimeout(() => {
          setPageTransition('none');
        }, 300);
      }, 200);
    }
  }, [location]);

  return (
    <div className={`transition-all duration-300 ${
      pageTransition === 'exiting' ? 'opacity-0 translate-x-4' : 
      pageTransition === 'entering' ? 'opacity-100 translate-x-0' : ''
    }`}>
      <Routes>
        <Route path="/" element={<QuestionDivination />} />
        <Route path="/hexagrams" element={<GuaList />} />
        <Route path="/divination" element={<Divination />} />
        <Route path="/question" element={<QuestionDivination />} />
        <Route path="/transformer" element={<GuaTransformer />} />
        <Route path="/admin/feedback" element={<FeedbackAdmin />} />
      </Routes>
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
