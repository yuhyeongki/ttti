import React, { useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Plus,
  Volume2,
  VolumeX,
  Headphones,
  CheckCircle2,
  ListTodo,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Task, TimerMode, TimerSettings, TimerStatus } from '../types.ts';

interface TimerViewProps {
  mode: TimerMode;
  status: TimerStatus;
  timeLeft: number;
  totalDuration: number;
  pomodoroCycleCount: number;
  settings: TimerSettings;
  activeTask?: Task;
  tasks: Task[];
  onSelectMode: (mode: TimerMode) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSkipTimer: () => void;
  onAddFiveMinutes: () => void;
  onSelectActiveTask: (taskId: string) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onToggleWhiteNoise: () => void;
  onToggleSound: () => void;
  onNavigateToTasks: () => void;
}

export const TimerView: React.FC<TimerViewProps> = ({
  mode,
  status,
  timeLeft,
  totalDuration,
  pomodoroCycleCount,
  settings,
  activeTask,
  tasks,
  onSelectMode,
  onToggleTimer,
  onResetTimer,
  onSkipTimer,
  onAddFiveMinutes,
  onSelectActiveTask,
  onToggleTaskComplete,
  onToggleWhiteNoise,
  onToggleSound,
  onNavigateToTasks,
}) => {
  // Format minutes & seconds
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Calculate progress for circular dial (0 to 1)
  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  // Active theme color by mode
  const modeConfig = useMemo(() => {
    switch (mode) {
      case 'pomodoro':
        return {
          title: '집중 시간',
          colorClass: 'text-rose-500',
          strokeColor: '#f43f5e',
          bgColor: 'bg-rose-500',
          lightBg: 'bg-rose-50 dark:bg-rose-950/30',
          borderClass: 'border-rose-200 dark:border-rose-900',
        };
      case 'shortBreak':
        return {
          title: '짧은 휴식',
          colorClass: 'text-emerald-500',
          strokeColor: '#10b981',
          bgColor: 'bg-emerald-500',
          lightBg: 'bg-emerald-50 dark:bg-emerald-950/30',
          borderClass: 'border-emerald-200 dark:border-emerald-900',
        };
      case 'longBreak':
        return {
          title: '긴 휴식',
          colorClass: 'text-sky-500',
          strokeColor: '#0ea5e9',
          bgColor: 'bg-sky-500',
          lightBg: 'bg-sky-50 dark:bg-sky-950/30',
          borderClass: 'border-sky-200 dark:border-sky-900',
        };
    }
  }, [mode]);

  // Incompleted tasks for quick list
  const pendingTasks = tasks.filter((t) => !t.completed).slice(0, 4);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* 1. Mode Segmented Switcher */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-inner">
          <button
            onClick={() => onSelectMode('pomodoro')}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
              mode === 'pomodoro'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            집중 ({settings.pomodoroMinutes}분)
          </button>
          <button
            onClick={() => onSelectMode('shortBreak')}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
              mode === 'shortBreak'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            짧은 휴식 ({settings.shortBreakMinutes}분)
          </button>
          <button
            onClick={() => onSelectMode('longBreak')}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
              mode === 'longBreak'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            긴 휴식 ({settings.longBreakMinutes}분)
          </button>
        </div>
      </div>

      {/* 2. Main Dial & Countdown Centerpiece */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative flex items-center justify-center">
          <svg className="w-72 h-72 sm:w-80 sm:h-80 -rotate-90 transform" viewBox="0 0 280 280">
            {/* Background ring */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-100 dark:text-slate-800"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              stroke={modeConfig.strokeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-[stroke-dashoffset] duration-700 ease-linear"
            />
          </svg>

          {/* Central Information */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              {modeConfig.title}
            </span>

            <div className="font-mono text-6xl sm:text-7xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums select-none">
              {timeFormatted}
            </div>

            {/* Cycle indicator dots */}
            <div className="mt-3 flex items-center gap-1.5">
              {Array.from({ length: settings.longBreakInterval }).map((_, idx) => {
                const isCompletedInCycle = idx < (pomodoroCycleCount % settings.longBreakInterval);
                const isCurrent = idx === (pomodoroCycleCount % settings.longBreakInterval) && mode === 'pomodoro';

                return (
                  <div
                    key={idx}
                    title={`${idx + 1}번째 뽀모도로`}
                    className={`h-2.5 rounded-full transition-all ${
                      isCurrent
                        ? 'w-6 bg-rose-500 animate-pulse'
                        : isCompletedInCycle
                        ? 'w-2.5 bg-rose-500'
                        : 'w-2.5 bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>

            <span className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500 font-mono tabular-nums">
              {settings.longBreakInterval}회 주기 중 {(pomodoroCycleCount % settings.longBreakInterval) + 1}번째 세션
            </span>
          </div>
        </div>

        {/* 3. Primary Action Buttons */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={onResetTimer}
            title="타이머 초기화 (Alt+R)"
            aria-label="타이머 초기화"
            className="p-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            onClick={onToggleTimer}
            className={`flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white rounded-2xl shadow-lg transition-transform active:scale-95 ${
              status === 'running'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                : 'bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500 shadow-slate-900/20'
            }`}
          >
            {status === 'running' ? (
              <>
                <Pause className="h-5 w-5 fill-current" />
                <span>일시정지</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5 fill-current" />
                <span>시작하기</span>
              </>
            )}
          </button>

          <button
            onClick={onSkipTimer}
            title="다음 단계로 건너뛰기 (Alt+S)"
            aria-label="다음 단계로 건너뛰기"
            className="p-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <SkipForward className="h-5 w-5" />
          </button>

          <button
            onClick={onAddFiveMinutes}
            title="5분 추가"
            className="hidden sm:flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>5분 추가</span>
          </button>
        </div>

        {/* Ambient & Sound Toggles */}
        <div className="flex items-center gap-3 mt-4 text-xs">
          <button
            onClick={onToggleWhiteNoise}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              settings.whiteNoise
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300'
                : 'bg-transparent border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>집중 핑크 노이즈 {settings.whiteNoise ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={onToggleSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              settings.soundNotification
                ? 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                : 'bg-transparent border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-500 line-through'
            }`}
          >
            {settings.soundNotification ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>알림음</span>
          </button>
        </div>
      </div>

      {/* 4. Active Linked Task Section */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Sparkles className="h-4 w-4 text-rose-500" />
            <span>현재 집중 중인 작업</span>
          </div>

          <button
            onClick={onNavigateToTasks}
            className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <span>전체 작업 관리</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {activeTask ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: activeTask.color }}
                />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {activeTask.category}
                </span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {activeTask.priority === 'high' ? '우선순위 높음' : activeTask.priority === 'medium' ? '보통' : '낮음'}
                </span>
              </div>

              <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                {activeTask.title}
              </h3>

              {activeTask.notes && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {activeTask.notes}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400">뽀모도로 진행도</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono tabular-nums">
                  🍅 {activeTask.completedPoms} / {activeTask.estimatedPoms} 세션
                </div>
              </div>

              <button
                onClick={() => onToggleTaskComplete(activeTask.id)}
                title="작업 완료 처리"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>완료하기</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              현재 연결된 작업이 없습니다. 작업을 연결하면 집중 세션이 자동으로 기록됩니다.
            </p>
            <button
              onClick={onNavigateToTasks}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>작업 목록에서 선택 또는 추가</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. Mini Task Switcher (Fast change without tab switching) */}
      {pendingTasks.length > 0 && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ListTodo className="h-4 w-4" />
              <span>진행 대기 작업 ({pendingTasks.length})</span>
            </h4>
            <span className="text-xs text-slate-400">클릭하여 집중 작업 전환</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingTasks.map((t) => {
              const isCurrent = activeTask?.id === t.id;
              return (
                <div
                  key={t.id}
                  className={`flex items-center justify-between py-2.5 px-2 rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-rose-50/60 dark:bg-rose-950/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div
                    onClick={() => onSelectActiveTask(t.id)}
                    className="min-w-0 flex-1 cursor-pointer flex items-center gap-3 pr-2"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: t.color }}
                    />
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${isCurrent ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {t.title}
                      </p>
                      <span className="text-xs text-slate-400">
                        {t.category} · 🍅 {t.completedPoms}/{t.estimatedPoms}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isCurrent ? (
                      <span className="text-xs font-semibold text-rose-500 bg-rose-100/70 dark:bg-rose-900/40 px-2 py-0.5 rounded">
                        진행 중
                      </span>
                    ) : (
                      <button
                        onClick={() => onSelectActiveTask(t.id)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                      >
                        선택
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
