import React, { useState } from 'react';
import { X, Volume2, Plus, Trash2 } from 'lucide-react';
import { Category, TimerSettings } from '../types.ts';
import { playPomodoroCompletedChime } from '../utils/audio.ts';

interface SettingsModalProps {
  isOpen: boolean;
  settings: TimerSettings;
  categories: Category[];
  onSaveSettings: (settings: TimerSettings) => void;
  onUpdateCategories: (categories: Category[]) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#6366F1', // Indigo
  '#0EA5E9', // Sky
  '#10B981', // Emerald
  '#F43F5E', // Rose
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  categories,
  onSaveSettings,
  onUpdateCategories,
  onClose,
}) => {
  const [formSettings, setFormSettings] = useState<TimerSettings>({ ...settings });
  const [categoryList, setCategoryList] = useState<Category[]>([...categories]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(formSettings);
    onUpdateCategories(categoryList);
    onClose();
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      color: newCatColor,
    };
    setCategoryList([...categoryList, newCat]);
    setNewCatName('');
  };

  const handleDeleteCategory = (id: string) => {
    if (categoryList.length <= 1) return;
    setCategoryList(categoryList.filter((c) => c.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            타이머 및 시스템 환경설정
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 1. Time Durations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              시간 주기 설정 (분)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  뽀모도로 집중
                </label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={formSettings.pomodoroMinutes}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, pomodoroMinutes: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  짧은 휴식
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formSettings.shortBreakMinutes}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, shortBreakMinutes: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  긴 휴식
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={formSettings.longBreakMinutes}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, longBreakMinutes: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  긴 휴식 주기 (뽀모도로 회수)
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={formSettings.longBreakInterval}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, longBreakInterval: Math.max(2, Number(e.target.value)) })
                  }
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  일일 목표 뽀모도로 (개)
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={formSettings.dailyTargetPoms}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, dailyTargetPoms: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* 2. Automation Toggles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              자동 시작 옵션
            </h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    휴식 시간 자동 시작
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    집중 세션이 완료되면 바로 휴식 타이머가 재생됩니다.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formSettings.autoStartBreaks}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, autoStartBreaks: e.target.checked })
                  }
                  className="h-4 w-4 accent-rose-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    뽀모도로 집중 자동 시작
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    휴식이 완료되면 다음 뽀모도로 타이머가 자동으로 시작됩니다.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formSettings.autoStartPomodoros}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, autoStartPomodoros: e.target.checked })
                  }
                  className="h-4 w-4 accent-rose-600 rounded"
                />
              </label>
            </div>
          </div>

          {/* 3. Sound Notifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                알림음 및 소리 설정
              </h4>
              <button
                type="button"
                onClick={() => playPomodoroCompletedChime()}
                className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>알림음 미리듣기</span>
              </button>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  타이머 완료 시 알림음 재생
                </span>
                <input
                  type="checkbox"
                  checked={formSettings.soundNotification}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, soundNotification: e.target.checked })
                  }
                  className="h-4 w-4 accent-rose-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  초침 틱 소리 활성화 (1초마다 조용한 클릭)
                </span>
                <input
                  type="checkbox"
                  checked={formSettings.tickSound}
                  onChange={(e) =>
                    setFormSettings({ ...formSettings, tickSound: e.target.checked })
                  }
                  className="h-4 w-4 accent-rose-600 rounded"
                />
              </label>
            </div>
          </div>

          {/* 4. Category Management */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              카테고리 관리
            </h4>

            <div className="space-y-2 mb-3 max-h-36 overflow-y-auto">
              {categoryList.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{cat.name}</span>
                  </div>

                  {categoryList.length > 1 && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="카테고리 삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add category form */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="새 카테고리명..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />

              <div className="flex items-center gap-1">
                {PRESET_COLORS.slice(0, 4).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCatColor(c)}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      newCatColor === c ? 'scale-125 ring-2 ring-slate-400' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-rose-600 rounded-lg hover:bg-slate-800 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>추가</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500 rounded-xl shadow-sm"
          >
            설정 저장하기
          </button>
        </div>
      </div>
    </div>
  );
};
