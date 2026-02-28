import { useState } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { liuShiSiGua, type Gua } from './data/guaxiang';
import GuaCard from './components/GuaCard';
import GuaDetail from './components/GuaDetail';
import Divination from './pages/Divination';
import { Search, BookOpen, Menu, X, Calculator } from 'lucide-react';
import './App.css';

// 主页组件
function HomePage() {
  const [selectedGua, setSelectedGua] = useState<Gua | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const filteredGua = liuShiSiGua.filter(gua => 
    gua.name.includes(searchTerm) || 
    gua.chineseName.includes(searchTerm) ||
    gua.pronunciation.includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-900 via-red-900 to-amber-900 text-amber-50 shadow-lg">
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
                  className="pl-10 pr-4 py-2 bg-amber-800/50 border border-amber-600 rounded-lg text-amber-100 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 w-64"
                />
              </div>
              <Link
                to="/divination"
                className="flex items-center space-x-2 px-4 py-2 bg-amber-700 hover:bg-amber-600 rounded-lg transition-colors"
              >
                <Calculator className="w-5 h-5" />
                <span>数字起卦</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-amber-800/50"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-amber-900/95 border-t border-amber-700 px-4 py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-300" />
              <input
                type="text"
                placeholder="搜索卦名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-amber-800/50 border border-amber-600 rounded-lg text-amber-100 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <Link
              to="/divination"
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-amber-700 hover:bg-amber-600 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Calculator className="w-5 h-5" />
              <span>数字起卦</span>
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedGua ? (
          <GuaDetail 
            gua={selectedGua} 
            onBack={() => setSelectedGua(null)}
            onSelectGua={(gua) => setSelectedGua(gua)}
          />
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
                探索易经智慧
              </h2>
              <p className="text-lg text-amber-700 max-w-2xl mx-auto">
                《易经》是中华文化的源头活水，六十四卦蕴含着天地万物的变化规律。
                点击任意卦象，深入了解其卦画、卦辞、爻辞、彖传、象传等完整内容。
              </p>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-900">64</div>
                <div className="text-sm text-amber-600">卦象</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-900">384</div>
                <div className="text-sm text-amber-600">爻辞</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-900">8</div>
                <div className="text-sm text-amber-600">经卦</div>
              </div>
            </div>

            {/* Gua Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {filteredGua.map((gua) => (
                <GuaCard
                  key={gua.id}
                  gua={gua}
                  onClick={() => setSelectedGua(gua)}
                />
              ))}
            </div>

            {filteredGua.length === 0 && (
              <div className="text-center py-12">
                <p className="text-amber-600">未找到匹配的卦象</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2">易经六十四卦学习网站</p>
          <p className="text-sm text-amber-400">传承中华传统文化，探索易经智慧</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/divination" element={<Divination />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
