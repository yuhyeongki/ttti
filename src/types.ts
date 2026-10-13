export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface Task {
  id: string;
  title: string;
  category: string;
  color: string;
  estimatedPoms: number;
  completedPoms: number;
  completed: boolean;
  notes?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

export interface SessionLog {
  id: string;
  taskId?: string;
  taskTitle: string;
  category: string;
  color: string;
  durationMinutes: number;
  mode: TimerMode;
  completedAt: string; // ISO string
  notes?: string;
}

export interface TimerSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundNotification: boolean;
  tickSound: boolean;
  whiteNoise: boolean;
  dailyTargetPoms: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}
