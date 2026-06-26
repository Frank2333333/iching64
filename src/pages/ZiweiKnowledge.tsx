import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, Sparkles } from 'lucide-react';
import MainHeaderTabs from '../components/MainHeaderTabs';
import {
  ALL_STAR_ENTRIES,
  getStarByName,
  STAR_CATEGORY_LABELS,
  type StarKnowledgeEntry,
  type StarCategory,
} from '../data/ziwei-star-descriptions';

type ViewMode = 'grid' | 'detail';

const CATEGORY_FILTERS: { key: StarCategory | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'major', label: '14主星' },
  { key: 'auspicious', label: '吉星' },
  { key: 'malefic', label: '煞星' },
];

/** 星曜卡片 */
function StarCard({ entry, onClick }: { entry: StarKnowledgeEntry; onClick: () => void }) {
  const cat = STAR_CATEGORY_LABELS[entry.category];
  return (
    <button
      onClick={onClick}
      className="text-left p-3 sm:p-4 rounded-xl border border-amber-200/60 dark:border-amber-800/30
        bg-white/60 dark:bg-neutral-800/60 hover:bg-amber-50/80 dark:hover:bg-amber-900/20
        transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-lg font-bold ${cat.color} ${cat.darkColor}`}>{entry.name}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border
          ${entry.category === 'major'
            ? 'border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
            : entry.category === 'auspicious'
              ? 'border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
              : 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'
          }`}>
          {cat.label}
        </span>
      </div>
      <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1.5">
        {entry.element} · {entry.nature}
      </div>
      <div className="flex flex-wrap gap-1">
        {entry.keywords.map(kw => (
          <span key={kw} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
            {kw}
          </span>
        ))}
      </div>
    </button>
  );
}

/** 星曜详情 */
function StarDetail({ entry, onBack }: { entry: StarKnowledgeEntry; onBack: () => void }) {
  const cat = STAR_CATEGORY_LABELS[entry.category];
  return (
    <div className="animate-fadeIn space-y-4">
      {/* 返回按钮 */}
      <button onClick={onBack}
        className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors">
        <ArrowLeft className="w-4 h-4" />返回列表
      </button>

      {/* 头部 */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 border border-amber-200 dark:border-amber-900/30">
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-2xl font-bold ${cat.color} ${cat.darkColor}`}>{entry.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full
            ${entry.category === 'major'
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
              : entry.category === 'auspicious'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
            {cat.label}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>五行：{entry.element}</span>
          <span>·</span>
          <span>性质：{entry.nature}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {entry.keywords.map(kw => (
            <span key={kw} className="text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* 简介 */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 border border-amber-200 dark:border-amber-900/30">
        <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2">概述</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{entry.description}</p>
      </div>

      {/* 倪海厦解读（仅主星） */}
      {entry.niHaixua && (
        <div className="bg-amber-50/60 dark:bg-amber-900/15 rounded-xl p-5 border border-amber-200/60 dark:border-amber-800/30">
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />倪海厦解读
          </h3>
          <p className="text-sm text-amber-900/80 dark:text-amber-200/80 leading-relaxed">{entry.niHaixua}</p>
        </div>
      )}

      {/* 四域分析（仅主星） */}
      {entry.domains && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'career',       label: '事业', icon: '💼' },
            { key: 'relationship', label: '感情', icon: '❤️' },
            { key: 'wealth',       label: '财运', icon: '💰' },
            { key: 'health',       label: '健康', icon: '🏥' },
          ].map(({ key, label, icon }) => (
            <div key={key} className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-amber-200 dark:border-amber-900/30">
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1.5">
                {icon} {label}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {entry.domains![key as keyof typeof entry.domains]}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ZiweiKnowledge() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>('grid');
  const [selectedStar, setSelectedStar] = useState<StarKnowledgeEntry | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<StarCategory | 'all'>('all');

  const filtered = categoryFilter === 'all'
    ? ALL_STAR_ENTRIES
    : ALL_STAR_ENTRIES.filter(e => e.category === categoryFilter);

  const handleStarClick = (name: string) => {
    const entry = getStarByName(name);
    if (entry) {
      setSelectedStar(entry);
      setView('detail');
    }
  };

  const handleBackToList = () => {
    setView('grid');
    setSelectedStar(null);
  };

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-gradient-to-br from-[#FFF8F3] via-[#FFFDFC] to-[#F7EFE7]
      dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
      iching-pattern-bg iching-cloud-bg transition-colors duration-500">
      {/* Header */}
      <header className="relative z-50 flex-none border-b border-amber-200/80 bg-white/82
        text-amber-900 shadow-[0_14px_45px_-34px_rgba(180,83,9,0.35)]
        backdrop-blur-xl transition-colors duration-500
        dark:border-amber-900/30 dark:bg-neutral-950/80 dark:text-amber-50
        dark:shadow-[0_18px_48px_-36px_rgba(251,191,36,0.12)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <button type="button" onClick={() => navigate('/')}
              className="flex items-center gap-3 rounded-full transition-opacity duration-300 hover:opacity-85">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/70 bg-white/76
                text-amber-600 shadow-[0_14px_28px_-22px_rgba(180,83,9,0.35)]
                dark:border-white/10 dark:bg-neutral-950/65 dark:text-amber-300 dark:shadow-none">
                <Compass className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold tracking-[0.14em] text-amber-900 dark:text-amber-50 sm:text-xl">
                  星曜图鉴
                </h1>
              </div>
            </button>
            <MainHeaderTabs />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {view === 'grid' ? (
            <div className="space-y-4">
              {/* 分类筛选 */}
              <div className="flex gap-2">
                {CATEGORY_FILTERS.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setCategoryFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${categoryFilter === f.key
                        ? 'bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300'
                        : 'text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400'
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* 星曜网格 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filtered.map(entry => (
                  <StarCard
                    key={entry.name}
                    entry={entry}
                    onClick={() => handleStarClick(entry.name)}
                  />
                ))}
              </div>

              <div className="text-center text-[11px] text-gray-400 dark:text-gray-500">
                共 {filtered.length} 颗星曜 · 点击查看详情
              </div>
            </div>
          ) : selectedStar ? (
            <StarDetail entry={selectedStar} onBack={handleBackToList} />
          ) : null}
        </div>
      </main>
    </div>
  );
}
