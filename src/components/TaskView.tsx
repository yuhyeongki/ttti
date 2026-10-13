import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Play,
  Edit2,
  Trash2,
  Sparkles,
  X,
} from 'lucide-react';
import { Category, Task } from '../types.ts';

interface TaskViewProps {
  tasks: Task[];
  categories: Category[];
  activeTaskId: string | null;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedPoms'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onSetActiveTask: (taskId: string) => void;
  onNavigateToTimer: () => void;
}

export const TaskView: React.FC<TaskViewProps> = ({
  tasks,
  categories,
  activeTaskId,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  onSetActiveTask,
  onNavigateToTimer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.name || '개발 및 코딩');
  const [formEstimatedPoms, setFormEstimatedPoms] = useState(2);
  const [formPriority, setFormPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [formNotes, setFormNotes] = useState('');

  // Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const totalEstimatedPoms = tasks.reduce((sum, t) => sum + t.estimatedPoms, 0);
  const totalCompletedPoms = tasks.reduce((sum, t) => sum + t.completedPoms, 0);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' || task.category === selectedCategory;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && !task.completed) ||
        (statusFilter === 'completed' && task.completed);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [tasks, searchQuery, selectedCategory, statusFilter]);

  const openCreateModal = () => {
    setFormTitle('');
    setFormCategory(categories[0]?.name || '개발 및 코딩');
    setFormEstimatedPoms(2);
    setFormPriority('medium');
    setFormNotes('');
    setEditingTask(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormCategory(task.category);
    setFormEstimatedPoms(task.estimatedPoms);
    setFormPriority(task.priority);
    setFormNotes(task.notes || '');
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const catObj = categories.find((c) => c.name === formCategory);
    const color = catObj ? catObj.color : '#6366F1';

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title: formTitle.trim(),
        category: formCategory,
        color,
        estimatedPoms: formEstimatedPoms,
        priority: formPriority,
        notes: formNotes.trim(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddTask({
        title: formTitle.trim(),
        category: formCategory,
        color,
        estimatedPoms: formEstimatedPoms,
        completed: false,
        priority: formPriority,
        notes: formNotes.trim(),
      });
    }

    setIsCreateModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* 1. Header & Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            작업 목록 및 세션 관리
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            작업을 생성하고 뽀모도로 타이머와 연결하여 집중 세션을 기록하세요.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500 rounded-xl transition-all shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>새 작업 추가</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">총 작업</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {totalTasks}개
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">진행 대기</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            {pendingTasks}개
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">완료된 작업</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {completedTasks}개
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">누적 뽀모도로</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1">
            🍅 {totalCompletedPoms} / {totalEstimatedPoms}
          </div>
        </div>
      </div>

      {/* 2. Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="작업 제목 또는 메모 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        {/* Status segmented tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'pending'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            진행 중 ({pendingTasks})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === 'completed'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            완료 ({completedTasks})
          </button>
        </div>
      </div>

      {/* Category filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          모든 카테고리
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === cat.name
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* 3. Task Cards List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            조건에 맞는 작업이 없습니다.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-rose-600 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>새 작업 등록하기</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isActive = activeTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                } ${task.completed ? 'opacity-65' : ''}`}
              >
                {/* Left: Checkbox + Title & Metadata */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                    title={task.completed ? '미완료로 변경' : '완료로 표시'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 hover:text-emerald-500" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="inline-block w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: task.color }}
                      />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {task.category}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span
                        className={`text-xs font-medium ${
                          task.priority === 'high'
                            ? 'text-rose-500'
                            : task.priority === 'medium'
                            ? 'text-amber-500'
                            : 'text-slate-400'
                        }`}
                      >
                        {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '보통' : '낮음'}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-semibold text-slate-900 dark:text-white truncate ${
                        task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.notes && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {task.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Pomodoro Progress Counter & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Pomodoro count adjustment */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newCompleted = Math.max(0, task.completedPoms - 1);
                        onUpdateTask({ ...task, completedPoms: newCompleted });
                      }}
                      className="w-6 h-6 flex items-center justify-center text-xs font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      title="완료 뽀모도로 1 감소"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                      🍅 {task.completedPoms} / {task.estimatedPoms}
                    </span>
                    <button
                      onClick={() => {
                        const newCompleted = task.completedPoms + 1;
                        onUpdateTask({ ...task, completedPoms: newCompleted });
                      }}
                      className="w-6 h-6 flex items-center justify-center text-xs font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      title="완료 뽀모도로 1 증가"
                    >
                      +
                    </button>
                  </div>

                  {/* Active / Connect button */}
                  {isActive ? (
                    <button
                      onClick={onNavigateToTimer}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-100/70 dark:bg-rose-900/40 rounded-lg hover:bg-rose-200/70 transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>타이머 연결됨</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onSetActiveTask(task.id);
                        onNavigateToTimer();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="이 작업으로 타이머 시작"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>집중 시작</span>
                    </button>
                  )}

                  {/* Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="작업 수정"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="작업 삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Task Create/Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTask ? '작업 수정하기' : '새 작업 등록'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  작업 제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 클라이언트 보고서 작성 및 리뷰"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    카테고리
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    우선순위
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    <option value="high">높음</option>
                    <option value="medium">보통</option>
                    <option value="low">낮음</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  예상 뽀모도로 수 (1회 = 25분)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={formEstimatedPoms}
                    onChange={(e) => setFormEstimatedPoms(Number(e.target.value))}
                    className="flex-1 accent-rose-500"
                  />
                  <span className="text-xs font-bold font-mono tabular-nums text-slate-800 dark:text-slate-200 w-16 text-right">
                    🍅 {formEstimatedPoms} 세션
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  메모 / 세부 사항 (선택)
                </label>
                <textarea
                  rows={2}
                  placeholder="작업 관련 링크, 주의사항 또는 세부 목표를 입력하세요."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500 rounded-xl transition-colors"
                >
                  {editingTask ? '변경사항 저장' : '작업 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
