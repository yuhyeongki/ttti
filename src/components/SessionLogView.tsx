import React, { useState, useMemo } from 'react';
import {
  Download,
  Plus,
  Search,
  Trash2,
  Calendar,
  Clock,
  FileText,
  X,
  Edit3,
} from 'lucide-react';
import { Category, SessionLog, Task } from '../types.ts';

interface SessionLogViewProps {
  logs: SessionLog[];
  categories: Category[];
  tasks: Task[];
  onAddManualLog: (log: Omit<SessionLog, 'id'>) => void;
  onUpdateLogNotes: (logId: string, notes: string) => void;
  onDeleteLog: (logId: string) => void;
}

export const SessionLogView: React.FC<SessionLogViewProps> = ({
  logs,
  categories,
  tasks,
  onAddManualLog,
  onUpdateLogNotes,
  onDeleteLog,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  // Manual log form
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState(categories[0]?.name || '개발 및 코딩');
  const [manualDuration, setManualDuration] = useState(25);
  const [manualNotes, setManualNotes] = useState('');

  // Filter logs by date range & category & search
  const filteredLogs = useMemo(() => {
    const now = new Date();

    return logs.filter((log) => {
      const logDate = new Date(log.completedAt);

      // Period filter
      if (periodFilter === 'today') {
        const isToday =
          logDate.getFullYear() === now.getFullYear() &&
          logDate.getMonth() === now.getMonth() &&
          logDate.getDate() === now.getDate();
        if (!isToday) return false;
      } else if (periodFilter === '7days') {
        const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7) return false;
      } else if (periodFilter === '30days') {
        const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 30) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && log.category !== categoryFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = log.taskTitle.toLowerCase().includes(q);
        const matchesNotes = log.notes && log.notes.toLowerCase().includes(q);
        if (!matchesTitle && !matchesNotes) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [logs, periodFilter, categoryFilter, searchQuery]);

  // Aggregate stats for filtered view
  const totalMinutes = filteredLogs.reduce((sum, l) => sum + l.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  const totalSessions = filteredLogs.length;

  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['일시', '작업명', '카테고리', '소요시간(분)', '모드', '회고메모'];
    const rows = filteredLogs.map((l) => [
      `"${new Date(l.completedAt).toLocaleString('ko-KR')}"`,
      `"${l.taskTitle.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      l.durationMinutes,
      l.mode,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pomodoro_work_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const catObj = categories.find((c) => c.name === manualCategory);
    const color = catObj ? catObj.color : '#6366F1';

    onAddManualLog({
      taskTitle: manualTitle.trim(),
      category: manualCategory,
      color,
      durationMinutes: manualDuration,
      mode: 'pomodoro',
      completedAt: new Date().toISOString(),
      notes: manualNotes.trim() || undefined,
    });

    setManualTitle('');
    setManualNotes('');
    setIsAddModalOpen(false);
  };

  const saveNotes = (logId: string) => {
    onUpdateLogNotes(logId, editingNotes.trim());
    setEditingLogId(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* 1. Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            세션 기록 및 업무 회고
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            타이머로 집중한 시간과 회고 메모가 타임스탬프와 함께 보관됩니다.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportToCSV}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV 내보내기</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>수동 기록 추가</span>
          </button>
        </div>
      </div>

      {/* 2. Aggregate KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">조회 기간 집중 시간</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-1">
            {totalHours > 0 ? `${totalHours}시간 ` : ''}{remainingMins}분
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">완료한 뽀모도로</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            🍅 {totalSessions} 세션
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 col-span-2 sm:col-span-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">평균 세션 길이</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400 mt-1">
            {totalSessions > 0 ? `${Math.round(totalMinutes / totalSessions)}분` : '0분'}
          </div>
        </div>
      </div>

      {/* 3. Search & Period Selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="작업명 또는 회고 내용 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        {/* Period segmented control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setPeriodFilter('today')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              periodFilter === 'today'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            오늘
          </button>
          <button
            onClick={() => setPeriodFilter('7days')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              periodFilter === '7days'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            최근 7일
          </button>
          <button
            onClick={() => setPeriodFilter('30days')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              periodFilter === '30days'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            최근 30일
          </button>
          <button
            onClick={() => setPeriodFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              periodFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            전체
          </button>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            categoryFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          모든 카테고리
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.name)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              categoryFilter === cat.name
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* 4. Logs List / Table */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <FileText className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            해당 조건의 집중 기록이 없습니다.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-rose-600 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>직접 세션 기록 추가하기</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const dateObj = new Date(log.completedAt);
            const dateStr = dateObj.toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            });
            const timeStr = dateObj.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });

            const isEditing = editingLogId === log.id;

            return (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* Date & Category meta */}
                    <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {dateStr}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono tabular-nums">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {timeStr}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: log.color }}
                        />
                        {log.category}
                      </span>
                    </div>

                    {/* Task Title */}
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {log.taskTitle}
                    </h3>

                    {/* Reflection / Note */}
                    {isEditing ? (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          placeholder="완료한 내용 또는 회고 작성..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                        />
                        <button
                          onClick={() => saveNotes(log.id)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-rose-600 rounded-lg"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingLogId(null)}
                          className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      log.notes && (
                        <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          {log.notes}
                        </div>
                      )
                    )}
                  </div>

                  {/* Duration badge & Action buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-900 tabular-nums">
                      🍅 {log.durationMinutes}분 집중
                    </span>

                    <div className="flex items-center gap-1">
                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingLogId(log.id);
                            setEditingNotes(log.notes || '');
                          }}
                          title="회고 메모 수정"
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteLog(log.id)}
                        title="기록 삭제"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                집중 세션 직접 등록
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  기존 작업에서 선택 (또는 직접 입력)
                </label>
                <select
                  onChange={(e) => {
                    const task = tasks.find((t) => t.id === e.target.value);
                    if (task) {
                      setManualTitle(task.title);
                      setManualCategory(task.category);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-2"
                >
                  <option value="">-- 기존 작업 불러오기 --</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.category})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  required
                  placeholder="작업 제목 입력..."
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    카테고리
                  </label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                    집중 시간 (분)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    step="5"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  회고 메모 / 작업 내용 요약
                </label>
                <textarea
                  rows={2}
                  placeholder="이 세션에서 어떤 성과를 냈는지 메모를 남겨보세요."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500 rounded-xl"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
