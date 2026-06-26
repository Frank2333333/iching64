import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Grid3X3, Sparkles, Calculator, HelpCircle, Star, Menu, X, Crown, BookOpen, Flame, Compass } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import GlobalUserMenu from './GlobalUserMenu';

interface MainHeaderTabsProps {
  desktopPrefix?: ReactNode;
  mobilePrefix?: ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  match: (pathname: string) => boolean;
}

const navItems: NavItem[] = [
  {
    to: '/life-report',
    label: '人生报告',
    icon: <Compass className="h-4 w-4" />,
    match: (pathname) => pathname === '/life-report',
  },
  {
    to: '/ziwei',
    label: '紫微斗数',
    icon: <Crown className="h-4 w-4" />,
    match: (pathname) => pathname === '/ziwei',
  },
  {
    to: '/bazi',
    label: '八字排盘',
    icon: <Star className="h-4 w-4" />,
    match: (pathname) => pathname === '/bazi',
  },
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
  {
    to: '/divination',
    label: '数字起卦',
    icon: <Calculator className="h-4 w-4" />,
    match: (pathname) => pathname === '/divination',
  },
  {
    to: '/',
    label: '问事解卦',
    icon: <HelpCircle className="h-4 w-4" />,
    match: (pathname) => pathname === '/' || pathname === '/question',
  },
];

const inactiveTabClass =
  'inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/82 px-4 py-2.5 text-sm font-medium text-[#6B5549] shadow-[0_12px_26px_-24px_rgba(146,64,14,0.35)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D7B7A4] hover:text-[#B56F62] dark:border-white/10 dark:bg-neutral-950/60 dark:text-yellow-50/82 dark:shadow-none dark:hover:border-yellow-500/30 dark:hover:text-yellow-100';

const activeTabClass =
  'inline-flex items-center gap-2 rounded-full border border-[#E1C8B2] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,244,237,0.95))] px-4 py-2.5 text-sm font-medium text-[#B56F62] shadow-[0_16px_30px_-24px_rgba(201,124,109,0.45)] backdrop-blur-sm transition-all duration-300 dark:border-yellow-500/20 dark:bg-[linear-gradient(135deg,rgba(234,179,8,0.12),rgba(23,23,23,0.76))] dark:text-yellow-100 dark:shadow-none';

export default function MainHeaderTabs({ desktopPrefix, mobilePrefix }: MainHeaderTabsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const getTabClassName = (item: NavItem) => (item.match(pathname) ? activeTabClass : inactiveTabClass);

  return (
    <>
      <div className="hidden items-center gap-3 md:flex">
        {desktopPrefix}
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={getTabClassName(item)}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
        <GlobalUserMenu />
        <ThemeToggle />
      </div>

      <div className="flex items-center gap-2 md:hidden">
        <GlobalUserMenu />
        <ThemeToggle />
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
                className={getTabClassName(item)}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
