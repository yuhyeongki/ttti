/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { TimerView } from './components/TimerView.tsx';
import { TaskView } from './components/TaskView.tsx';
import { SessionLogView } from './components/SessionLogView.tsx';
import { StatsView } from './components/StatsView.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { CompletionModal } from './components/CompletionModal.tsx';
import { ShortcutsModal } from './components/ShortcutsModal.tsx';
import { Task, SessionLog, TimerSettings, Category, TimerMode, TimerStatus } from './types.ts';
import {
  loadStoredData,
  saveTasks,
  saveLogs,
  saveSettings,
  saveCategories,
  saveActiveTaskId,
  saveTheme,
  generateSeedData,
} from './utils/storage.ts';
import {
  playPomodoroCompletedChime,
  playBreakCompletedChime,
  playTick,
  playClick,
  setAmbientNoise,
} from './utils/audio.ts';

export default function App() {
  // Load initial data
  const initialData = useRef(loadStoredData()).current;

  const [currentTab, setCurrentTab] = useState<'timer' | 'tasks' | 'logs' | 'stats'>('timer');
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks);
  const [logs, setLogs] = useState<SessionLog[]>(initialData.logs);
  const [categories, setCategories] = useState<Category[]>(initialData.categories);
  const [settings, setSettings] = useState<TimerSettings>(initialData.settings);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(initialData.activeTaskId);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(initialData.isDarkMode);

  // Timer states
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(initialData.settings.pomodoroMinutes * 60);
  const [pomodoroCycleCount, setPomodoroCycleCount] = useState<number>(0);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [completionModalData, setCompletionModalData] = useState<{
    isOpen: boolean;
    mode: TimerMode;
    durationMinutes: number;
    activeTask?: Task;
  }>({
    isOpen: false,
    mode: 'pomodoro',
    durationMinutes: initialData.settings.pomodoroMinutes,
  });

  // Calculate current mode duration in seconds
  const getModeDurationSeconds = useCallback(
    (targetMode: TimerMode, currentSettings: TimerSettings = settings) => {
      switch (targetMode) {
        case 'pomodoro':
          return currentSettings.pomodoroMinutes * 60;
        case 'shortBreak':
          return currentSettings.shortBreakMinutes * 60;
        case 'longBreak':
          return currentSettings.longBreakMinutes * 60;
      }
    },
    [settings]
  );

  // Sync dark class on root document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(isDarkMode);
  }, [isDarkMode]);

  // Sync White Noise audio
  useEffect(() => {
    if (status === 'running' && settings.whiteNoise) {
      setAmbientNoise(true);
    } else {
      setAmbientNoise(false);
    }
    return () => {
      setAmbientNoise(false);
    };
  }, [status, settings.whiteNoise]);

  // Sync Tab Title with Timer
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (status === 'running' || status === 'paused') {
      const modeLabel = mode === 'pomodoro' ? '집중' : '휴식';
      document.title = `(${formatted}) ${modeLabel} - Pomodoro Flow`;
    } else {
      document.title = 'Pomodoro Flow & Work Logger';
    }
  }, [timeLeft, status, mode]);

  // Persist State to LocalStorage
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveActiveTaskId(activeTaskId);
  }, [activeTaskId]);

  // Active Task reference
  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // Handle Mode Selection
  const handleSelectMode = useCallback(
    (newMode: TimerMode) => {
      playClick();
      setMode(newMode);
      setStatus('idle');
      setTimeLeft(getModeDurationSeconds(newMode));
    },
    [getModeDurationSeconds]
  );

  // Toggle Timer Play/Pause
  const handleToggleTimer = useCallback(() => {
    playClick();
    if (status === 'running') {
      setStatus('paused');
    } else {
      setStatus('running');
    }
  }, [status]);

  // Reset Timer
  const handleResetTimer = useCallback(() => {
    playClick();
    setStatus('idle');
    setTimeLeft(getModeDurationSeconds(mode));
  }, [getModeDurationSeconds, mode]);

  // Complete current session helper
  const handleSessionFinished = useCallback(
    (finishedMode: TimerMode) => {
      if (finishedMode === 'pomodoro') {
        if (settings.soundNotification) {
          playPomodoroCompletedChime();
        }

        const durationMinutes = settings.pomodoroMinutes;
        const currentActiveTask = tasks.find((t) => t.id === activeTaskId);

        // Update active task count
        if (currentActiveTask) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === currentActiveTask.id
                ? {
                    ...t,
                    completedPoms: t.completedPoms + 1,
                    updatedAt: new Date().toISOString(),
                  }
                : t
            )
          );
        }

        // Open completion modal for quick reflection
        setCompletionModalData({
          isOpen: true,
          mode: 'pomodoro',
          durationMinutes,
          activeTask: currentActiveTask,
        });

        // Advance cycle count
        const nextCycle = pomodoroCycleCount + 1;
        setPomodoroCycleCount(nextCycle);

        // Determine next mode: Long Break if modulo reached, otherwise Short Break
        const nextMode: TimerMode =
          nextCycle % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
        setMode(nextMode);
        setTimeLeft(getModeDurationSeconds(nextMode));

        if (settings.autoStartBreaks) {
          setStatus('running');
        } else {
          setStatus('idle');
        }
      } else {
        // Break finished
        if (settings.soundNotification) {
          playBreakCompletedChime();
        }

        setMode('pomodoro');
        setTimeLeft(getModeDurationSeconds('pomodoro'));

        if (settings.autoStartPomodoros) {
          setStatus('running');
        } else {
          setStatus('idle');
        }
      }
    },
    [settings, tasks, activeTaskId, pomodoroCycleCount, getModeDurationSeconds]
  );

  // Skip Timer to Next Step
  const handleSkipTimer = useCallback(() => {
    playClick();
    if (mode === 'pomodoro') {
      const nextCycle = pomodoroCycleCount + 1;
      setPomodoroCycleCount(nextCycle);
      const nextMode: TimerMode =
        nextCycle % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(getModeDurationSeconds(nextMode));
    } else {
      setMode('pomodoro');
      setTimeLeft(getModeDurationSeconds('pomodoro'));
    }
    setStatus('idle');
  }, [mode, pomodoroCycleCount, settings.longBreakInterval, getModeDurationSeconds]);

  // Add 5 Minutes
  const handleAddFiveMinutes = () => {
    playClick();
    setTimeLeft((prev) => prev + 300);
  };

  // Timer Tick Interval
  useEffect(() => {
    if (status !== 'running') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSessionFinished(mode);
          return 0;
        }

        if (settings.tickSound && prev % 2 === 0) {
          playTick();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, mode, settings.tickSound, handleSessionFinished]);

  // Save session log from completion modal
  const handleSaveCompletedLog = (notes?: string) => {
    const active = tasks.find((t) => t.id === activeTaskId);
    const cat = active ? active.category : categories[0]?.name || '집중 작업';
    const color = active ? active.color : '#6366F1';
    const title = active ? active.title : '집중 뽀모도로 세션';

    const newLog: SessionLog = {
      id: `log-${Date.now()}`,
      taskId: active?.id,
      taskTitle: title,
      category: cat,
      color,
      durationMinutes: completionModalData.durationMinutes,
      mode: 'pomodoro',
      completedAt: new Date().toISOString(),
      notes,
    };

    setLogs((prev) => [newLog, ...prev]);
  };

  // Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleTimer();
      } else if (e.altKey && e.code === 'KeyS') {
        e.preventDefault();
        handleSkipTimer();
      } else if (e.altKey && e.code === 'KeyR') {
        e.preventDefault();
        handleResetTimer();
      } else if (e.altKey && e.code === 'Digit1') {
        e.preventDefault();
        handleSelectMode('pomodoro');
      } else if (e.altKey && e.code === 'Digit2') {
        e.preventDefault();
        handleSelectMode('shortBreak');
      } else if (e.altKey && e.code === 'Digit3') {
        e.preventDefault();
        handleSelectMode('longBreak');
      } else if (e.altKey && e.code === 'KeyN') {
        e.preventDefault();
        setCurrentTab('tasks');
      } else if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsShortcutsOpen(false);
        setCompletionModalData((prev) => ({ ...prev, isOpen: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleTimer, handleSkipTimer, handleResetTimer, handleSelectMode]);

  // Task Operations
  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedPoms'>) => {
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
      completedPoms: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
    if (!activeTaskId) {
      setActiveTaskId(task.id);
    }
  };

  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskId === id) {
      const remaining = tasks.filter((t) => t.id !== id && !t.completed);
      setActiveTaskId(remaining[0]?.id || null);
    }
  };

  const handleToggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
      )
    );
  };

  // Log Operations
  const handleAddManualLog = (newLog: Omit<SessionLog, 'id'>) => {
    const log: SessionLog = {
      ...newLog,
      id: `log-${Date.now()}`,
    };
    setLogs((prev) => [log, ...prev]);
  };

  const handleUpdateLogNotes = (logId: string, notes: string) => {
    setLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, notes } : l))
    );
  };

  const handleDeleteLog = (logId: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  // Reset to default sample data
  const handleResetSeedData = () => {
    if (window.confirm('샘플 데이터를 복원하시겠습니까? 현재 기록이 기본 시드 데이터로 재설정됩니다.')) {
      const seed = generateSeedData();
      setTasks(seed.tasks);
      setLogs(seed.logs);
      setActiveTaskId(seed.tasks[0]?.id || null);
    }
  };

  // Clear all data
  const handleClearAllData = () => {
    if (window.confirm('정말 모든 작업과 기록을 지우시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setTasks([]);
      setLogs([]);
      setActiveTaskId(null);
    }
  };

  const remainingMinutes = Math.floor(timeLeft / 60);
  const remainingSeconds = timeLeft % 60;
  const remainingFormatted = `${String(remainingMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* 1. Header Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        activeTaskTitle={activeTask?.title}
        isTimerRunning={status === 'running'}
        remainingTimeFormatted={remainingFormatted}
      />

      {/* 2. Main Content View Router */}
      <main className="flex-1 w-full pb-16">
        {currentTab === 'timer' && (
          <TimerView
            mode={mode}
            status={status}
            timeLeft={timeLeft}
            totalDuration={getModeDurationSeconds(mode)}
            pomodoroCycleCount={pomodoroCycleCount}
            settings={settings}
            activeTask={activeTask}
            tasks={tasks}
            onSelectMode={handleSelectMode}
            onToggleTimer={handleToggleTimer}
            onResetTimer={handleResetTimer}
            onSkipTimer={handleSkipTimer}
            onAddFiveMinutes={handleAddFiveMinutes}
            onSelectActiveTask={(taskId) => {
              playClick();
              setActiveTaskId(taskId);
            }}
            onToggleTaskComplete={handleToggleTaskComplete}
            onToggleWhiteNoise={() => {
              playClick();
              setSettings((prev) => ({ ...prev, whiteNoise: !prev.whiteNoise }));
            }}
            onToggleSound={() => {
              playClick();
              setSettings((prev) => ({ ...prev, soundNotification: !prev.soundNotification }));
            }}
            onNavigateToTasks={() => setCurrentTab('tasks')}
          />
        )}

        {currentTab === 'tasks' && (
          <TaskView
            tasks={tasks}
            categories={categories}
            activeTaskId={activeTaskId}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleComplete={handleToggleTaskComplete}
            onSetActiveTask={(id) => {
              setActiveTaskId(id);
            }}
            onNavigateToTimer={() => setCurrentTab('timer')}
          />
        )}

        {currentTab === 'logs' && (
          <SessionLogView
            logs={logs}
            categories={categories}
            tasks={tasks}
            onAddManualLog={handleAddManualLog}
            onUpdateLogNotes={handleUpdateLogNotes}
            onDeleteLog={handleDeleteLog}
          />
        )}

        {currentTab === 'stats' && (
          <StatsView
            logs={logs}
            settings={settings}
            onResetSeedData={handleResetSeedData}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Pomodoro Flow</span>
            <span>·</span>
            <span>몰입과 성장을 위한 뽀모도로 타이머 &amp; 작업 분석</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              단축키 (Space / Alt+S)
            </button>
            <span>·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              설정
            </button>
          </div>
        </div>
      </footer>

      {/* 4. Global Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        categories={categories}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          if (status === 'idle') {
            setTimeLeft(getModeDurationSeconds(mode, newSettings));
          }
        }}
        onUpdateCategories={setCategories}
        onClose={() => setIsSettingsOpen(false)}
      />

      <CompletionModal
        isOpen={completionModalData.isOpen}
        mode={completionModalData.mode}
        durationMinutes={completionModalData.durationMinutes}
        activeTask={completionModalData.activeTask}
        onSaveLog={handleSaveCompletedLog}
        onClose={() => setCompletionModalData((prev) => ({ ...prev, isOpen: false }))}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
