import React, { useState } from 'react';
import { Award, ArrowRight, X } from 'lucide-react';
import { Task, TimerMode } from '../types.ts';

interface CompletionModalProps {
  isOpen: boolean;
  mode: TimerMode;
  durationMinutes: number;
  activeTask?: Task;
  onSaveLog: (notes?: string) => void;
  onClose: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  mode,
  durationMinutes,
  activeTask,
  onSaveLog,
  onClose,
}) => {
  const [reflectionNotes, setReflectionNotes] = useState('');

  if (!isOpen) return null;

  const isPomodoro = mode === 'pomodoro';

  const handleConfirm = () => {
    onSaveLog(reflectionNotes.trim() || undefined);
    setReflectionNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isPomodoro ? '🎉 집중 세션을 완주했습니다!' : '휴식 시간이 종료되었습니다!'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {durationMinutes}분 동안 목표에 깊이 몰입하셨습니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {activeTask && (
          <div className="p-3 mb-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs">
            <div className="text-slate-400 mb-0.5">연결된 작업</div>
            <div className="font-semibold text-slate-900 dark:text-white truncate">
              {activeTask.title}
            </div>
            <div className="text-slate-500 dark:text-slate-400 mt-1">
              카테고리: {activeTask.category} · 진행도: 🍅 {activeTask.completedPoms + 1} / {activeTask.estimatedPoms} 세션
            </div>
          </div>
        )}

        <div className="mb-5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            방금 세션에서 완료한 내용을 간단히 기록해보세요 (선택)
          </label>
          <textarea
            rows={2}
            autoFocus
            placeholder="예: API 인증 모듈 구현 완료, 핵심 버그 수정 등"
            value={reflectionNotes}
            onChange={(e) => setReflectionNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            기록 없이 닫기
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-sm"
          >
            <span>기록 저장 및 휴식 시작</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
