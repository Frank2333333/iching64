import { useState } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { liuShiSiGua, type Gua } from './data/guaxiang';
import GuaCard from './components/GuaCard';
import GuaDetail from './components/GuaDetail';
import Divination from './pages/Divination';
import BackgroundEffects from './components/animations/BackgroundEffects';
import { FadeIn, FadeInOnScroll, StaggerContainer, StaggerItem } from './components/animations/FadeIn';
import { Search, Menu, X, Calculator, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen relative">
      {/* 背景效果 */}
      <BackgroundEffects />
      
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </motion.div>
              <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                易经六十四卦
              </h1>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <motion.input
                  type="text"
                  placeholder="搜索卦名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-200 
                           placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 
                           focus:border-cyan-400/30 w-64 transition-all"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              <Link to="/divination">
                <motion.button
                  className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 
                           border border-cyan-400/30 rounded-xl transition-colors"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Calculator className="w-5 h-5 text-cyan-400" />
                  <span className="text-cyan-300">数字起卦</span>
                </motion.button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? <X className="w-6 h-6 text-slate-300" /> : <Menu className="w-6 h-6 text-slate-300" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="md:hidden bg-slate-950/95 border-t border-white/10 px-4 py-4 backdrop-blur-xl"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索卦名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-200 
                           placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                />
              </div>
              <Link
                to="/divination"
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-cyan-500/10 
                         hover:bg-cyan-500/20 border border-cyan-400/30 rounded-xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calculator className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-300">数字起卦</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {selectedGua ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <GuaDetail 
                gua={selectedGua} 
                onBack={() => setSelectedGua(null)}
                onSelectGua={(gua) => setSelectedGua(gua)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Hero Section */}
              <div className="text-center mb-16 relative">
                <FadeIn delay={0.2}>
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] 
                             bg-gradient-to-r from-cyan-500/20 via-purple-500/10 to-cyan-500/20 blur-[100px] -z-10"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </FadeIn>
                
                <FadeIn delay={0.3}>
                  <h2 className="text-5xl md:text-6xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-transparent">
                      探索易经智慧
                    </span>
                  </h2>
                </FadeIn>
                
                <FadeIn delay={0.4}>
                  <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    《易经》是中华文化的源头活水，六十四卦蕴含着天地万物的变化规律。
                    <br className="hidden md:block" />
                    点击任意卦象，深入了解其卦画、卦辞、爻辞、彖传、象传等完整内容。
                  </p>
                </FadeIn>
              </div>

              {/* Stats */}
              <FadeInOnScroll delay={0.2}>
                <div className="flex justify-center gap-12 mb-12">
                  {[
                    { value: '64', label: '卦象', color: 'from-cyan-400 to-cyan-300' },
                    { value: '384', label: '爻辞', color: 'from-purple-400 to-purple-300' },
                    { value: '8', label: '经卦', color: 'from-pink-400 to-pink-300' },
                  ].map((stat) => (
                    <motion.div 
                      key={stat.label}
                      className="text-center"
                      whileHover={{ scale: 1.1, y: -5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </FadeInOnScroll>

              {/* Gua Grid */}
              <StaggerContainer staggerDelay={0.02} className="gua-grid">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {filteredGua.map((gua, index) => (
                    <StaggerItem key={gua.id}>
                      <GuaCard
                        gua={gua}
                        onClick={() => setSelectedGua(gua)}
                        index={index}
                      />
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>

              <AnimatePresence>
                {filteredGua.length === 0 && (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <p className="text-slate-500">未找到匹配的卦象</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <FadeInOnScroll>
        <footer className="border-t border-white/10 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.p 
              className="text-slate-400 mb-2"
              whileHover={{ scale: 1.02 }}
            >
              易经六十四卦学习网站
            </motion.p>
            <p className="text-sm text-slate-600">传承中华传统文化，探索易经智慧</p>
          </div>
        </footer>
      </FadeInOnScroll>
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
