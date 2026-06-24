import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, BookOpen, ChevronRight, ArrowLeft, Search, Loader2, Sparkles } from 'lucide-react';
import MainHeaderTabs from '../components/MainHeaderTabs';
import MarkdownRenderer from '../components/MarkdownRenderer';
import {
  ALL_BOOKS,
  TOTAL_PARAGRAPHS,
  getBookBySlug,
  searchClassics,
  type Book,
  type Chapter,
  type SearchHit,
} from '../data/classics';

type Step = 'shelf' | 'toc' | 'reading' | 'search';

const API_BASE_URL = import.meta.env.VITE_FEEDBACK_API_URL || '/api';

export default function ClassicsPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('shelf');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchHit[]>([]);

  // AI 解读状态
  const [interpretingId, setInterpretingId] = useState<string | null>(null);
  const [interpretations, setInterpretations] = useState<Record<string, string>>({});
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGoHome = () => navigate('/');

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setStep('toc');
  };

  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setStep('reading');
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setSearchResults(searchClassics(query));
      setStep('search');
    } else {
      setSearchResults([]);
      setStep('shelf');
    }
  }, []);

  const handleInterpret = async (paragraphId: string, text: string) => {
    if (!selectedBook || !selectedChapter || interpretingId) return;

    setInterpretingId(paragraphId);
    setAiError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/classics/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: selectedBook.title,
          chapterTitle: selectedChapter.title,
          text,
        }),
      });

      const result = await response.json();
      if (result.success && result.data) {
        setInterpretations((prev) => ({ ...prev, [paragraphId]: result.data.interpretation }));
      } else {
        setAiError(result.error || '解读失败');
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : '请求失败');
    } finally {
      setInterpretingId(null);
    }
  };

  const handleSearchHitClick = (hit: SearchHit) => {
    const book = getBookBySlug(hit.bookSlug);
    if (!book) return;
    const chapterIdx = book.chapters.findIndex((ch) => ch.title === hit.chapterTitle);
    if (chapterIdx === -1) return;
    setSelectedBook(book);
    setSelectedChapter(book.chapters[chapterIdx]);
    setStep('reading');
  };

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-gradient-to-br from-[#FFF8F3] via-[#FFFDFC] to-[#F7EFE7]
      dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
      iching-pattern-bg iching-cloud-bg transition-colors duration-500">
      {/* Header */}
      <header className="flex-none border-b border-amber-200/80 bg-white/82
        text-amber-900 shadow-[0_14px_45px_-34px_rgba(180,83,9,0.35)]
        backdrop-blur-xl transition-colors duration-500
        dark:border-amber-900/30 dark:bg-neutral-950/80 dark:text-amber-50
        dark:shadow-[0_18px_48px_-36px_rgba(251,191,36,0.12)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <button type="button" onClick={handleGoHome}
              className="flex items-center gap-3 rounded-full transition-opacity duration-300 hover:opacity-85">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/70 bg-white/76
                text-amber-600 shadow-[0_14px_28px_-22px_rgba(180,83,9,0.35)]
                dark:border-white/10 dark:bg-neutral-950/65 dark:text-amber-300 dark:shadow-none">
                <Compass className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold tracking-[0.14em] text-amber-900 dark:text-amber-50 sm:text-xl">
                  经典查阅
                </h1>
              </div>
            </button>
            <MainHeaderTabs />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* 搜索栏 */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400 dark:text-amber-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜索经典文献..."
                className="w-full pl-12 pr-4 py-3 border border-amber-200 dark:border-amber-700/50
                  rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600
                  text-amber-900 dark:text-amber-100 bg-white dark:bg-neutral-800
                  transition-colors placeholder:text-amber-400 dark:placeholder:text-amber-700/50"
              />
            </div>
          </div>

          {/* 书架 */}
          {step === 'shelf' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <p className="text-lg text-amber-700 dark:text-amber-300">
                  收录 {ALL_BOOKS.length} 部经典 · {TOTAL_PARAGRAPHS} 段原文
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ALL_BOOKS.map((book) => (
                  <button
                    key={book.slug}
                    onClick={() => handleSelectBook(book)}
                    className="text-left bg-white dark:bg-neutral-800 rounded-xl p-5 border border-amber-200 dark:border-amber-900/30
                      hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-8 h-8 text-amber-500 dark:text-amber-400 shrink-0 mt-1" />
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 group-hover:text-amber-600 dark:group-hover:text-amber-300">
                          {book.title}
                        </h3>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          {book.dynasty} · {book.author}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          约{book.wordCount.toLocaleString()}字 · {book.chapters.length}章
                        </p>
                        <p className="text-sm text-amber-700/80 dark:text-amber-300/70 mt-2 line-clamp-2">
                          {book.intro}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 目录 */}
          {step === 'toc' && selectedBook && (
            <div className="animate-fadeIn">
              <button onClick={() => setStep('shelf')}
                className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 mb-4">
                <ArrowLeft className="w-4 h-4" />返回书架
              </button>
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-amber-200 dark:border-amber-900/30">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-7 h-7 text-amber-500 dark:text-amber-400" />
                  <div>
                    <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200">{selectedBook.title}</h2>
                    <p className="text-xs text-amber-600 dark:text-amber-400">{selectedBook.dynasty} · {selectedBook.author}</p>
                  </div>
                </div>
                <p className="text-sm text-amber-700/80 dark:text-amber-300/70 mb-6">{selectedBook.intro}</p>
                <div className="space-y-2">
                  {selectedBook.chapters.map((chapter, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectChapter(chapter)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg
                        hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left group"
                    >
                      <div>
                        <span className="font-medium text-amber-800 dark:text-amber-200">{chapter.title}</span>
                        {chapter.subtitle && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{chapter.subtitle}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{chapter.paragraphs.length}段</span>
                        <ChevronRight className="w-4 h-4 text-amber-400 dark:text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 阅读 */}
          {step === 'reading' && selectedBook && selectedChapter && (
            <div className="animate-fadeIn">
              <button onClick={() => setStep('toc')}
                className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 mb-4">
                <ArrowLeft className="w-4 h-4" />返回目录
              </button>
              <div className="bg-white dark:bg-neutral-800 rounded-xl border border-amber-200 dark:border-amber-900/30">
                <div className="px-6 py-4 border-b border-amber-100 dark:border-amber-900/20">
                  <p className="text-xs text-amber-500 dark:text-amber-400">{selectedBook.title}</p>
                  <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200">{selectedChapter.title}</h2>
                  {selectedChapter.subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedChapter.subtitle}</p>
                  )}
                </div>
                <div className="p-6 space-y-6">
                  {selectedChapter.paragraphs.map((para) => (
                    <div key={para.id} className="group">
                      {/* 古文原文 */}
                      <div className="flex items-start gap-3">
                        <span className="text-xs text-amber-400 dark:text-amber-600 mt-1.5 shrink-0 font-mono">
                          {para.idx}
                        </span>
                        <div className="flex-1">
                          <p className="text-amber-900 dark:text-amber-100 leading-relaxed font-serif text-base">
                            {para.text}
                          </p>
                          {/* AI 解读按钮 */}
                          {!interpretations[para.id] && (
                            <button
                              onClick={() => handleInterpret(para.id, para.text)}
                              disabled={interpretingId === para.id}
                              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400
                                border border-amber-200 dark:border-amber-800/30
                                hover:bg-amber-100 dark:hover:bg-amber-900/30
                                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {interpretingId === para.id ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" />解读中...</>
                              ) : (
                                <><Sparkles className="w-3.5 h-3.5" />AI 解读</>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      {/* AI 解读结果 */}
                      {interpretations[para.id] && (
                        <div className="mt-3 ml-7 p-4 bg-amber-50/60 dark:bg-amber-900/15 rounded-lg border border-amber-100 dark:border-amber-800/20">
                          <div className="prose prose-amber dark:prose-invert prose-sm max-w-none">
                            <MarkdownRenderer content={interpretations[para.id]} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {aiError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {aiError}
                </div>
              )}
            </div>
          )}

          {/* 搜索结果 */}
          {step === 'search' && (
            <div className="animate-fadeIn">
              <button onClick={() => { setSearchQuery(''); setStep('shelf'); }}
                className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 mb-4">
                <ArrowLeft className="w-4 h-4" />返回书架
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                搜索 "{searchQuery}" — 找到 {searchResults.length} 条结果
              </p>
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-amber-600 dark:text-amber-400">未找到相关内容</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((hit) => (
                    <button
                      key={hit.paragraphId}
                      onClick={() => handleSearchHitClick(hit)}
                      className="w-full text-left bg-white dark:bg-neutral-800 rounded-xl p-4 border border-amber-200 dark:border-amber-900/30
                        hover:border-amber-400 dark:hover:border-amber-600 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{hit.bookTitle}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{hit.chapterTitle}</span>
                      </div>
                      <p className="text-sm text-amber-800 dark:text-amber-200" dangerouslySetInnerHTML={{ __html: hit.snippet }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
