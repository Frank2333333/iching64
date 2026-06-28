import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sparkles, HelpCircle, Menu, X, BookOpen, Flame, Compass, Grid3X3, Library, ChevronDown } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import GlobalUserMenu from './GlobalUserMenu';

interface MainHeaderTabsProps {
  desktopPrefix?: ReactNode;
  mobilePrefix?: ReactNode;
  /** 隐藏移动端自带的明暗切换键（当外层用独立设置键接管主题时用） */
  hideThemeToggle?: boolean;
}

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  match: (pathname: string) => boolean;
}

/** 顶部平级导航项 */
const navItems: NavItem[] = [
  {
    to: '/',
    label: '人生报告',
    icon: <Compass className="h-4 w-4" />,
    match: (pathname) => pathname === '/' || pathname === '/life-report',
  },
  {
    to: '/question',
    label: '问事解卦',
    icon: <HelpCircle className="h-4 w-4" />,
    match: (pathname) => pathname === '/question',
  },
];

/** 知识库子项（下拉菜单） */
const knowledgeItems: NavItem[] = [
  {
    to: '/hexagrams',
    label: '六十四卦',
    icon: <Grid3X3 className="h-4 w-4" />,
    match: (pathname) => pathname === '/hexagrams',
  },
  {
    to: '/classics',
    label: '经典查阅',
    icon: <BookOpen className="h-4 w-4" />,
    match: (pathname) => pathname === '/classics',
  },
  {
    to: '/ziwei-knowledge',
    label: '星曜图鉴',
    icon: <Flame className="h-4 w-4" />,
    match: (pathname) => pathname === '/ziwei-knowledge',
  },
  {
    to: '/transformer',
    label: '变卦推演',
    icon: <Sparkles className="h-4 w-4" />,
    match: (pathname) => pathname === '/transformer',
  },
];

const knowledgeMatch = (pathname: string) => knowledgeItems.some((it) => it.match(pathname));

const inactiveTabClass =
  'inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/82 px-4 py-2.5 text-sm font-medium text-[#6B5549] shadow-[0_12px_26px_-24px_rgba(146,64,14,0.35)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D7B7A4] hover:text-[#B56F62] dark:border-white/10 dark:bg-neutral-950/60 dark:text-yellow-50/82 dark:shadow-none dark:hover:border-yellow-500/30 dark:hover:text-yellow-100';

const activeTabClass =
  'inline-flex items-center gap-2 rounded-full border border-[#E1C8B2] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,244,237,0.95))] px-4 py-2.5 text-sm font-medium text-[#B56F62] shadow-[0_16px_30px_-24px_rgba(201,124,109,0.45)] backdrop-blur-sm transition-all duration-300 dark:border-yellow-500/20 dark:bg-[linear-gradient(135deg,rgba(234,179,8,0.12),rgba(23,23,23,0.76))] dark:text-yellow-100 dark:shadow-none';

export default function MainHeaderTabs({ desktopPrefix, mobilePrefix, hideThemeToggle }: MainHeaderTabsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const { pathname } = useLocation();

  const getTabClassName = (item: NavItem) => (item.match(pathname) ? activeTabClass : inactiveTabClass);
  const knowledgeActive = knowledgeMatch(pathname);

  return (
    <>
      <div className="relative z-50 hidden items-center gap-3 md:flex">
        {desktopPrefix}
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={getTabClassName(item)}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* 知识库下拉（hover 展开） */}
        <div className="group relative inline-flex" style={{ zIndex: 100 }}>
          <button
            className={knowledgeActive ? activeTabClass : inactiveTabClass}
            aria-label="知识库"
          >
            <Library className="h-4 w-4" />
            <span>知识库</span>
            <ChevronDown className="h-3 w-3 opacity-70 transition-transform duration-300 group-hover:rotate-180" />
          </button>
          <div className="pointer-events-none absolute left-0 top-full z-[100] pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
            <div className="min-w-[180px] rounded-xl border border-amber-200/80 bg-white/95 p-1.5 shadow-[0_18px_40px_-20px_rgba(146,64,14,0.4)] backdrop-blur-xl dark:border-amber-900/30 dark:bg-neutral-900/95">
              {knowledgeItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    item.match(pathname)
                      ? 'bg-amber-50 font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                      : 'text-[#6B5549] hover:bg-amber-50/70 hover:text-[#B56F62] dark:text-yellow-50/82 dark:hover:bg-amber-900/20 dark:hover:text-yellow-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        <GlobalUserMenu />
        {!hideThemeToggle && <ThemeToggle />}
      </div>

      <div className="flex items-center gap-2 md:hidden">
        <GlobalUserMenu />
        {!hideThemeToggle && <ThemeToggle />}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E7D6C8]
                   bg-white/84 text-[#7B5C50] shadow-[0_12px_28px_-24px_rgba(120,74,49,0.5)] backdrop-blur-sm
                   transition-all duration-300 hover:border-[#D7B7A4] hover:text-[#B56F62]
                   dark:border-white/10 dark:bg-neutral-950/68 dark:text-yellow-100/82 dark:shadow-none
                   dark:hover:border-yellow-500/30 dark:hover:text-yellow-50"
          aria-label={isMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-[#E8D7CA]/80 bg-[#FFF8F3]/92 px-4 py-4 backdrop-blur-xl animate-slideInRight dark:border-white/10 dark:bg-neutral-950/92 md:hidden">
          {mobilePrefix}
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={getTabClassName(item) + ' w-full'}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* 知识库折叠分组 */}
            <button
              onClick={() => setKnowledgeOpen((prev) => !prev)}
              className={(knowledgeActive ? activeTabClass : inactiveTabClass) + ' w-full justify-between'}
            >
              <span className="inline-flex items-center gap-2">
                <Library className="h-4 w-4" />
                <span>知识库</span>
              </span>
              <ChevronDown className={`h-3 w-3 opacity-70 transition-transform duration-300 ${knowledgeOpen ? 'rotate-180' : ''}`} />
            </button>
            {knowledgeOpen && (
              <div className="ml-4 flex flex-col gap-2 border-l border-amber-200/60 pl-3 dark:border-amber-900/30">
                {knowledgeItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={getTabClassName(item) + ' w-full'}
                    onClick={() => { setIsMenuOpen(false); setKnowledgeOpen(false); }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
