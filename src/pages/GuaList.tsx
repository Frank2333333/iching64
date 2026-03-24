import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, BookOpen } from 'lucide-react';
import { liuShiSiGua, type Gua } from '../data/guaxiang';
import GuaCard from '../components/GuaCard';
import GuaDetail from '../components/GuaDetail';
import FeedbackButton from '../components/FeedbackButton';
import { useScrollPosition } from '../hooks/useScrollPosition';
import MainHeaderTabs from '../components/MainHeaderTabs';

export default function GuaList() {
  const [selectedGua, setSelectedGua] = useState<Gua | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  useScrollPosition(selectedGua ? 'gua-detail' : 'home');

  useEffect(() => {
    const guaId = searchParams.get('gua');
    if (!guaId) return;

    const gua = liuShiSiGua.find((item) => item.id === parseInt(guaId, 10));
    if (gua) {
      setSelectedGua(gua);
    }
  }, [searchParams]);

  const filteredGua = liuShiSiGua.filter(
    (gua) =>
      gua.name.includes(searchTerm) ||
      gua.chineseName.includes(searchTerm) ||
      gua.pronunciation.includes(searchTerm.toLowerCase())
  );

  const desktopSearch = (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C6AA94] dark:text-yellow-500/60" />
      <input
        type="text"
        placeholder="搜索卦名..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-11 w-64 rounded-[22px] border border-[#E7D6C8] bg-white/88 py-2.5 pl-11 pr-4 text-sm text-[#5A463E]
                 shadow-[0_20px_42px_-34px_rgba(107,74,58,0.42)] backdrop-blur-sm transition-all duration-300
                 placeholder:text-[#B79A86] focus:outline-none focus:ring-2 focus:ring-[#D7B7A4]
                 dark:border-white/10 dark:bg-neutral-950/62 dark:text-yellow-50/90
                 dark:placeholder:text-yellow-600/55 dark:focus:ring-yellow-500/40"
      />
    </div>
  );

  const mobileSearch = (
    <div className="relative mb-4">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C6AA94] dark:text-yellow-500/60" />
      <input
        type="text"
        placeholder="搜索卦名..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-11 w-full rounded-[22px] border border-[#E7D6C8] bg-white/88 py-2.5 pl-11 pr-4 text-sm text-[#5A463E]
                 shadow-[0_20px_42px_-34px_rgba(107,74,58,0.42)] backdrop-blur-sm
                 placeholder:text-[#B79A86] focus:outline-none focus:ring-2 focus:ring-[#D7B7A4]
                 dark:border-white/10 dark:bg-neutral-950/62 dark:text-yellow-50/90
                 dark:placeholder:text-yellow-600/55 dark:focus:ring-yellow-500/40"
      />
    </div>
  );

  const handleCardClick = (gua: Gua) => {
    setIsTransitioning(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      setSelectedGua(gua);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedGua(null);
      setIsTransitioning(false);
    }, 200);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#FFF8F3] via-[#FFFDFC] to-[#F7EFE7]
                 transition-colors duration-500 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
                 iching-pattern-bg iching-cloud-bg"
    >
      <header
        className="sticky top-0 z-50 border-b border-[#E8D7CA]/70 bg-[#FFF8F3]/82 text-[#4B3A33]
                   shadow-[0_14px_45px_-34px_rgba(107,74,58,0.45)] backdrop-blur-xl transition-colors duration-500
                   dark:border-white/10 dark:bg-neutral-950/80 dark:text-yellow-50
                   dark:shadow-[0_18px_48px_-36px_rgba(250,204,21,0.12)]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/76
                           text-[#C97C6D] shadow-[0_14px_28px_-22px_rgba(146,64,14,0.35)]
                           dark:border-white/10 dark:bg-neutral-950/65 dark:text-yellow-300 dark:shadow-none"
              >
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold tracking-[0.14em] sm:text-xl">六十四卦</h1>
              </div>
            </div>

            <MainHeaderTabs desktopPrefix={desktopSearch} mobilePrefix={mobileSearch} />
          </div>
        </div>
      </header>

      <main ref={mainRef} className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {selectedGua ? (
          <div
            className={`${
              isTransitioning ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
            } transition-all duration-500`}
          >
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
          <div
            className={`${
              isTransitioning ? '-translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
            } transition-all duration-300`}
          >
            <div className="animate-slideInUp mb-12 text-center">
              <h2
                className="title-gradient mb-4 bg-gradient-to-r from-[#4B3A33] via-[#C97C6D] to-[#4B3A33] bg-clip-text
                           text-4xl font-bold text-transparent dark:from-yellow-400 dark:via-yellow-500 dark:to-yellow-400 md:text-5xl"
              >
                六十四卦一览
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-[#6B5549] dark:text-yellow-200/70">
                《易经》六十四卦是中华文化的重要智慧结晶，点击任意卦象即可查看卦画、卦辞、爻辞等完整内容。
              </p>
            </div>

            <div className="animate-slideInUp mb-10 flex justify-center gap-5 sm:gap-8" style={{ animationDelay: '0.1s' }}>
              <div className="rounded-[26px] border border-[#E9D8C8] bg-white/74 px-5 py-4 text-center shadow-[0_24px_52px_-40px_rgba(107,74,58,0.48)] backdrop-blur-sm dark:bg-neutral-800/50 dark:border-white/10">
                <div className="text-3xl font-bold text-[#4B3A33] dark:text-yellow-400">64</div>
                <div className="text-sm text-[#8A6658] dark:text-yellow-600">卦象</div>
              </div>
              <div className="rounded-[26px] border border-[#E9D8C8] bg-white/74 px-5 py-4 text-center shadow-[0_24px_52px_-40px_rgba(107,74,58,0.48)] backdrop-blur-sm dark:bg-neutral-800/50 dark:border-white/10">
                <div className="text-3xl font-bold text-[#4B3A33] dark:text-yellow-400">384</div>
                <div className="text-sm text-[#8A6658] dark:text-yellow-600">爻辞</div>
              </div>
              <div className="rounded-[26px] border border-[#E9D8C8] bg-white/74 px-5 py-4 text-center shadow-[0_24px_52px_-40px_rgba(107,74,58,0.48)] backdrop-blur-sm dark:bg-neutral-800/50 dark:border-white/10">
                <div className="text-3xl font-bold text-[#4B3A33] dark:text-yellow-400">8</div>
                <div className="text-sm text-[#8A6658] dark:text-yellow-600">经卦</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {filteredGua.map((gua, index) => (
                <GuaCard key={gua.id} gua={gua} onClick={() => handleCardClick(gua)} index={index} />
              ))}
            </div>

            {filteredGua.length === 0 && (
              <div className="animate-fadeIn py-12 text-center">
                <p className="text-[#8A6658] dark:text-yellow-600">未找到匹配的卦象</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer
        className="relative z-10 mt-12 border-t border-[#7E6253] bg-[#6C5246] py-8 text-[#EADCCE] transition-colors duration-500
                   dark:border-yellow-900/30 dark:bg-neutral-900 dark:text-yellow-200/70"
      >
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-2">易经六十四卦学习网站</p>
          <p className="text-sm text-[#D8B8A1]">传承中华传统文化，探索易经智慧</p>
        </div>
      </footer>

      <FeedbackButton />
    </div>
  );
}
