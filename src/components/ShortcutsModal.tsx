import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: '타이머 시작 / 일시정지' },
    { key: 'Alt + S', desc: '다음 모드로 건너뛰기' },
    { key: 'Alt + R', desc: '현재 타이머 시간 초기화' },
    { key: 'Alt + 1', desc: '뽀모도로 집중 모드로 전환' },
    { key: 'Alt + 2', desc: '짧은 휴식 모드로 전환' },
    { key: 'Alt + 3', desc: '긴 휴식 모드로 전환' },
    { key: 'Alt + N', desc: '새 작업 추가 창 열기' },
    { key: 'Esc', desc: '열려 있는 팝업 창 닫기' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Keyboard className="h-5 w-5 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              키보드 단축키 안내
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          마우스 조작 없이도 빠르고 편리하게 몰입 상태를 유지할 수 있습니다.
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {shortcuts.map((s) => (
            <div key={s.key} className="py-2.5 flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-300">{s.desc}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500 rounded-xl"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
