import React from 'react';
import { Timer, CheckSquare, History, BarChart3, Settings, Moon, Sun, Keyboard } from 'lucide-react';

interface NavbarProps {
  currentTab: 'timer' | 'tasks' | 'logs' | 'stats';
  onSelectTab: (tab: 'timer' | 'tasks' | 'logs' | 'stats') => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  activeTaskTitle?: string;
  isTimerRunning: boolean;
  remainingTimeFormatted: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
  onOpenShortcuts,
  isDarkMode,
  onToggleTheme,
  isTimerRunning,
  remainingTimeFormatted,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('timer')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm transition-transform group-hover:scale-105">
              <Timer className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              Pomodoro Flow
            </span>
          </button>

          {isTimerRunning && (
            <div className="hidden sm:flex items-center gap-2 pl-3 ml-1 border-l border-slate-200 dark:border-slate-800 text-xs font-mono tabular-nums text-rose-600 dark:text-rose-400 font-semibold">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              {remainingTimeFormatted} 진행 중
            </div>
          )}
        </div>

        {/* Zone 2: Single-line Text Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('timer')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'timer'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            <Timer className="h-4 w-4" />
            <span>타이머</span>
          </button>

          <button
            onClick={() => onSelectTab('tasks')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'tasks'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span>작업 목록</span>
          </button>

          <button
            onClick={() => onSelectTab('logs')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'logs'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            <History className="h-4 w-4" />
            <span>기록 내역</span>
          </button>

          <button
            onClick={() => onSelectTab('stats')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'stats'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>통계 분석</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenShortcuts}
            title="키보드 단축키 가이드"
            aria-label="키보드 단축키 가이드"
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Keyboard className="h-4 w-4" />
          </button>

          <button
            onClick={onToggleTheme}
            title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 dark:text-slate-200 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>타이머 설정</span>
          </button>
        </div>
      </div>
    </header>
  );
};
