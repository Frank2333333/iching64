import { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useSearchParams } from 'react-router-dom';
import { liuShiSiGua, type Gua } from './data/guaxiang';
import GuaCard from './components/GuaCard';
import GuaDetail from './components/GuaDetail';
import Divination from './pages/Divination';
import FeedbackAdmin from './pages/FeedbackAdmin';
import GuaTransformer from './pages/GuaTransformer';
import ThemeToggle from './components/ThemeToggle';
import { useScrollPosition } from './hooks/useScrollPosition';
import { Search, BookOpen, Menu, X, Calculator, Sparkles } from 'lucide-react';
import FeedbackButton from './components/FeedbackButton';
import './App.css';

// 主页组件
function HomePage() {
  const [selectedGua, setSelectedGua] = useState<Gua | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  // 记住滚动位置
  useScrollPosition(selectedGua ? 'gua-detail' : 'home');
  
  // 从 URL 参数加载卦象
  useEffect(() => {
    const guaId = searchParams.get('gua');
    if (guaId) {
      const gua = liuShiSiGua.find(g => g.id === parseInt(guaId));
      if (gua) {
        setSelectedGua(gua);
      }
    }
  }, [searchParams]);

  const filteredGua = liuShiSiGua.filter(gua => 
    gua.name.includes(searchTerm) || 
    gua.chineseName.includes(searchTerm) ||
    gua.pronunciation.includes(searchTerm.toLowerCase())
  );

  // 处理卡片点击，添加过渡动画
  const handleCardClick = (gua: Gua) => {
    setIsTransitioning(true);
    // 先滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // 延迟设置选中的卦，让过渡动画更自然
    setTimeout(() => {
      setSelectedGua(gua);
      setIsTransitioning(false);
    }, 300);
  };

  // 处理返回
  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedGua(null);
      setIsTransitioning(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 
                    dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
                    iching-pattern-bg iching-cloud-bg transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-900 via-red-900 to-amber-900 
                         dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 
                         text-amber-50 dark:text-yellow-100 shadow-lg transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-amber-300" />
              <h1 className="text-2xl font-bold tracking-wider">易经六十四卦</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-300" />
                <input
                  type="text"
                  placeholder="搜索卦名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-amber-800/50 border border-amber-600 rounded-lg 
                           text-amber-100 placeholder-amber-400 focus:outline-none focus:ring-2 
                           focus:ring-amber-400 w-64 transition-all duration-300
                           dark:bg-neutral-800 dark:border-yellow-600/50 dark:text-yellow-100 
                           dark:placeholder-yellow-600/70 dark:focus:ring-yellow-500"
                />
              </div>
              <Link
                to="/transformer"
                className="flex items-center space-x-2 px-4 py-2 bg-amber-700 hover:bg-amber-600 
                         rounded-lg transition-all duration-300 hover:scale-105
                         dark:bg-yellow-600/80 dark:hover:bg-yellow-500 dark:text-neutral-900"
              >
                <Sparkles className="w-5 h-5" />
                <span>变卦推演</span>
              </Link>
              <Link
                to="/divination"
                className="flex items-center space-x-2 px-4 py-2 bg-amber-700 hover:bg-amber-600 
                         rounded-lg transition-all duration-300 hover:scale-105
                         dark:bg-yellow-600/80 dark:hover:bg-yellow-500 dark:text-neutral-900"
              >
                <Calculator className="w-5 h-5" />
                <span>数字起卦</span>
              </Link>
              {/* 主题切换按钮 */}
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2 md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-amber-800/50 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-amber-900/95 dark:bg-neutral-900/95 border-t border-amber-700 dark:border-yellow-900/50 px-4 py-4 
                         animate-slideInRight">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-300" />
              <input
                type="text"
                placeholder="搜索卦名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-amber-800/50 border border-amber-600 rounded-lg 
                         text-amber-100 placeholder-amber-400 focus:outline-none focus:ring-2 
                         focus:ring-amber-400"
              />
            </div>
            <Link
              to="/transformer"
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-amber-700 
                       hover:bg-amber-600 dark:bg-yellow-600 dark:hover:bg-yellow-500 dark:text-neutral-900
                       rounded-lg transition-colors mb-3"
              onClick={() => setIsMenuOpen(false)}
            >
              <Sparkles className="w-5 h-5" />
              <span>变卦推演</span>
            </Link>
            <Link
              to="/divination"
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-amber-700 
                       hover:bg-amber-600 dark:bg-yellow-600 dark:hover:bg-yellow-500 dark:text-neutral-900
                       rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Calculator className="w-5 h-5" />
              <span>数字起卦</span>
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main ref={mainRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedGua ? (
          <div className={`${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'} 
                          transition-all duration-500`}>
            <GuaDetail 
              gua={selectedGua} 
              onBack={handleBack}
              onSelectGua={(gua) => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setSelectedGua(gua);
              }}
            />
          </div>
        ) : (
          <div className={`${isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'} 
                          transition-all duration-300`}>
            {/* Hero Section */}
            <div className="text-center mb-12 animate-slideInUp">
              <h2 className="text-4xl md:text-5xl font-bold text-amber-900 dark:text-yellow-100 mb-4 
                           title-gradient bg-gradient-to-r from-amber-800 via-red-700 to-amber-800 
                           dark:from-yellow-400 dark:via-yellow-500 dark:to-yellow-400 
                           bg-clip-text text-transparent">
                探索易经智慧
              </h2>
              <p className="text-lg text-amber-700 dark:text-yellow-200/70 max-w-2xl mx-auto">
                《易经》是中华文化的源头活水，六十四卦蕴含着天地万物的变化规律。
                点击任意卦象，深入了解其卦画、卦辞、爻辞、彖传、象传等完整内容。
              </p>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 mb-8 animate-slideInUp" style={{ animationDelay: '0.1s' }}>
              <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm">
                <div className="text-3xl font-bold text-amber-900 dark:text-yellow-400">64</div>
                <div className="text-sm text-amber-600 dark:text-yellow-600">卦象</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm">
                <div className="text-3xl font-bold text-amber-900 dark:text-yellow-400">384</div>
                <div className="text-sm text-amber-600 dark:text-yellow-600">爻辞</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm">
                <div className="text-3xl font-bold text-amber-900 dark:text-yellow-400">8</div>
                <div className="text-sm text-amber-600 dark:text-yellow-600">经卦</div>
              </div>
            </div>

            {/* Gua Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {filteredGua.map((gua, index) => (
                <GuaCard
                  key={gua.id}
                  gua={gua}
                  onClick={() => handleCardClick(gua)}
                  index={index}
                />
              ))}
            </div>

            {filteredGua.length === 0 && (
              <div className="text-center py-12 animate-fadeIn">
                <p className="text-amber-600 dark:text-yellow-600">未找到匹配的卦象</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-amber-900 dark:bg-neutral-900 text-amber-200 dark:text-yellow-200/70 py-8 mt-12 
                       transition-colors duration-500 border-t dark:border-yellow-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2">易经六十四卦学习网站</p>
          <p className="text-sm text-amber-400">传承中华传统文化，探索易经智慧</p>
        </div>
      </footer>

      {/* 反馈按钮 */}
      <FeedbackButton />
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
        <Route path="/" element={<HomePage />} />
        <Route path="/divination" element={<Divination />} />
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
