import React, { useState, useMemo } from 'react';
import {
  Flame,
  Award,
  Calendar,
  Clock,
  TrendingUp,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { SessionLog, TimerSettings } from '../types.ts';

interface StatsViewProps {
  logs: SessionLog[];
  settings: TimerSettings;
  onResetSeedData: () => void;
  onClearAllData: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  logs,
  settings,
  onResetSeedData,
  onClearAllData,
}) => {
  const [periodDays, setPeriodDays] = useState<7 | 14 | 30>(7);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Today's metrics
  const todayMetrics = useMemo(() => {
    const todayStr = new Date().toDateString();
    const todayLogs = logs.filter(
      (l) => new Date(l.completedAt).toDateString() === todayStr
    );
    const totalMinutes = todayLogs.reduce((sum, l) => sum + l.durationMinutes, 0);
    const sessionCount = todayLogs.length;
    const targetMinutes = settings.dailyTargetPoms * settings.pomodoroMinutes;
    const percentage = targetMinutes > 0 ? Math.min(100, Math.round((totalMinutes / targetMinutes) * 100)) : 0;

    return {
      totalMinutes,
      sessionCount,
      percentage,
      targetMinutes,
    };
  }, [logs, settings]);

  // Daily logs distribution for chosen period (last N days)
  const dailyStats = useMemo(() => {
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = periodDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateString = d.toDateString();

      const dayLogs = logs.filter(
        (l) => new Date(l.completedAt).toDateString() === dateString
      );

      const minutes = dayLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
      const sessionCount = dayLogs.length;

      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      const fullLabel = d.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
      });

      result.push({
        date: d,
        dateString,
        label,
        fullLabel,
        minutes,
        sessionCount,
        isToday: i === 0,
      });
    }

    return result;
  }, [logs, periodDays]);

  // Max minutes for bar chart scaling
  const maxDailyMinutes = useMemo(() => {
    const maxVal = Math.max(...dailyStats.map((d) => d.minutes), 1);
    return Math.max(maxVal, settings.dailyTargetPoms * settings.pomodoroMinutes);
  }, [dailyStats, settings]);

  // Category distribution
  const categoryStats = useMemo(() => {
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - periodDays);

    const periodLogs = logs.filter(
      (l) => new Date(l.completedAt).getTime() >= periodStart.getTime()
    );

    const map = new Map<string, { minutes: number; count: number; color: string }>();

    periodLogs.forEach((l) => {
      const curr = map.get(l.category) || { minutes: 0, count: 0, color: l.color };
      curr.minutes += l.durationMinutes;
      curr.count += 1;
      curr.color = l.color;
      map.set(l.category, curr);
    });

    const totalPeriodMinutes = periodLogs.reduce((sum, l) => sum + l.durationMinutes, 0);

    const items = Array.from(map.entries()).map(([name, data]) => ({
      name,
      minutes: data.minutes,
      count: data.count,
      color: data.color,
      percent: totalPeriodMinutes > 0 ? Math.round((data.minutes / totalPeriodMinutes) * 100) : 0,
    }));

    items.sort((a, b) => b.minutes - a.minutes);

    return {
      items,
      totalPeriodMinutes,
    };
  }, [logs, periodDays]);

  // Hourly distribution (09 to 23 hours)
  const hourlyStats = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));

    logs.forEach((l) => {
      const h = new Date(l.completedAt).getHours();
      if (h >= 0 && h < 24) {
        hours[h].count += 1;
      }
    });

    // filter to active daytime 07:00 ~ 23:00
    const visibleHours = hours.filter((h) => h.hour >= 7 && h.hour <= 23);
    const maxCount = Math.max(...visibleHours.map((h) => h.count), 1);

    // find peak window
    let maxHour = 10;
    let maxHourCount = 0;
    visibleHours.forEach((h) => {
      if (h.count > maxHourCount) {
        maxHourCount = h.count;
        maxHour = h.hour;
      }
    });

    return {
      hours: visibleHours,
      maxCount,
      peakHourText: maxHourCount > 0 ? `${maxHour}:00 ~ ${maxHour + 1}:00` : '기록 집계 중',
    };
  }, [logs]);

  // Overall totals
  const totalAllTimeMinutes = logs.reduce((sum, l) => sum + l.durationMinutes, 0);
  const totalAllTimeHours = (totalAllTimeMinutes / 60).toFixed(1);
  const totalSessionsCount = logs.length;

  // Streak calculation
  const streakDays = useMemo(() => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 60; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const str = checkDate.toDateString();

      const hasActivity = logs.some(
        (l) => new Date(l.completedAt).toDateString() === str
      );

      if (hasActivity) {
        streak++;
      } else {
        // If checking today and no activity yet, don't break streak if yesterday had activity
        if (i === 0) continue;
        break;
      }
    }
    return streak;
  }, [logs]);

  // Top tasks by focus time
  const topTasks = useMemo(() => {
    const map = new Map<string, { minutes: number; count: number; color: string }>();

    logs.forEach((l) => {
      const curr = map.get(l.taskTitle) || { minutes: 0, count: 0, color: l.color };
      curr.minutes += l.durationMinutes;
      curr.count += 1;
      map.set(l.taskTitle, curr);
    });

    return Array.from(map.entries())
      .map(([title, val]) => ({ title, ...val }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);
  }, [logs]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* 1. Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            집중 통계 및 생산성 분석
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            뽀모도로 달성률과 카테고리별 몰입도, 주간 추세를 직관적으로 확인하세요.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setPeriodDays(7)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              periodDays === 7
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            최근 7일
          </button>
          <button
            onClick={() => setPeriodDays(14)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              periodDays === 14
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            최근 14일
          </button>
          <button
            onClick={() => setPeriodDays(30)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              periodDays === 30
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            최근 30일
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Today's Focus */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>오늘 집중 시간</span>
            <Clock className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {Math.floor(todayMetrics.totalMinutes / 60)}시간 {todayMetrics.totalMinutes % 60}분
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>일일 목표 달성</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
              {todayMetrics.percentage}%
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${todayMetrics.percentage}%` }}
            />
          </div>
        </div>

        {/* Today's Pomodoros */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>오늘 뽀모도로</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            🍅 {todayMetrics.sessionCount} / {settings.dailyTargetPoms}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            목표까지 {Math.max(0, settings.dailyTargetPoms - todayMetrics.sessionCount)}세션 남음
          </div>
        </div>

        {/* Streak */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>연속 집중 기록 (Streak)</span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-orange-600 dark:text-orange-400">
            {streakDays}일 연속
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            매일 꾸준한 몰입 달성 중
          </div>
        </div>

        {/* Total All-Time Focus */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>누적 집중 시간</span>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
            {totalAllTimeHours}시간
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            총 {totalSessionsCount}개 세션 완료
          </div>
        </div>
      </div>

      {/* 3. Main Chart: Daily Focus Bar Chart */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              일별 집중 시간 추이 (최근 {periodDays}일)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              막대에 마우스를 올리면 상세 집중 시간과 완료 세션을 확인할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-3 rounded bg-rose-500" />
              <span>집중 시간</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-4 border-b-2 border-dashed border-amber-500" />
              <span>일일 목표선 ({settings.dailyTargetPoms * settings.pomodoroMinutes}분)</span>
            </div>
          </div>
        </div>

        {/* SVG Bar Chart */}
        <div className="relative h-64 w-full">
          {/* Target line */}
          {settings.dailyTargetPoms > 0 && (
            <div
              className="absolute left-0 right-0 border-b border-dashed border-amber-400/80 z-0 pointer-events-none"
              style={{
                bottom: `${Math.min(95, Math.max(5, ((settings.dailyTargetPoms * settings.pomodoroMinutes) / maxDailyMinutes) * 80 + 10))}%`,
              }}
            >
              <span className="absolute right-0 -top-4 text-[10px] font-mono text-amber-500 bg-white dark:bg-slate-900 px-1 rounded">
                목표 {settings.dailyTargetPoms * settings.pomodoroMinutes}분
              </span>
            </div>
          )}

          {/* Bars grid */}
          <div className="flex h-full items-end gap-1.5 sm:gap-3 pt-6 pb-6">
            {dailyStats.map((item, idx) => {
              const heightPercent = maxDailyMinutes > 0 ? (item.minutes / maxDailyMinutes) * 80 : 0;
              const isHovered = hoveredBarIndex === idx;

              return (
                <div
                  key={item.dateString}
                  className="flex-1 h-full flex flex-col justify-end items-center relative group"
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] whitespace-nowrap shadow-lg pointer-events-none border border-slate-700">
                      <div className="font-semibold">{item.fullLabel}</div>
                      <div className="font-mono tabular-nums text-rose-300">
                        {Math.floor(item.minutes / 60)}시간 {item.minutes % 60}분 (🍅 {item.sessionCount}세션)
                      </div>
                    </div>
                  )}

                  {/* The Bar */}
                  <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800/80 rounded-t-lg relative flex flex-col justify-end overflow-hidden h-full">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        item.isToday
                          ? 'bg-rose-500'
                          : isHovered
                          ? 'bg-rose-400'
                          : 'bg-rose-500/70 hover:bg-rose-500'
                      }`}
                      style={{ height: `${Math.max(heightPercent, item.minutes > 0 ? 6 : 0)}%` }}
                    />
                  </div>

                  {/* Date label */}
                  <span
                    className={`mt-2 text-[11px] font-mono tabular-nums truncate ${
                      item.isToday
                        ? 'font-bold text-rose-600 dark:text-rose-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Two-Column Split: Category Donut + Hourly Pattern */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Category Breakdown */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            카테고리별 집중 비중
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            선택 기간 동안 어떤 작업 분야에 시간을 많이 투자했는지 분석합니다.
          </p>

          {categoryStats.items.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              기록된 세션 데이터가 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {categoryStats.items.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {Math.floor(cat.minutes / 60)}h {cat.minutes % 60}m ({cat.percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percent}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hourly Distribution Pattern */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              시간대별 생산성 분포
            </h3>
            <span className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
              피크: {hourlyStats.peakHourText}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            하루 중 집중이 가장 잘 일어나는 시간대 패턴입니다.
          </p>

          {/* Mini hourly spark bar */}
          <div className="h-40 flex items-end gap-1 pt-4 pb-4">
            {hourlyStats.hours.map((h) => {
              const heightPercent = (h.count / hourlyStats.maxCount) * 100;
              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 bg-slate-900 text-white text-[10px] rounded pointer-events-none z-10 whitespace-nowrap">
                    {h.hour}시: 🍅 {h.count}세션
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-sm h-full flex items-end">
                    <div
                      className="w-full bg-indigo-500/70 group-hover:bg-indigo-500 rounded-t-sm transition-all"
                      style={{ height: `${Math.max(heightPercent, h.count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 mt-1">
                    {h.hour % 3 === 0 ? `${h.hour}h` : ''}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-center text-xs text-slate-400 mt-2">
            오전 07시부터 자정 23시까지의 시간대별 집중 세션 빈도
          </div>
        </div>
      </div>

      {/* 5. Top Tasks Focus Ranking */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs mb-8">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          가장 많은 시간을 투자한 상위 작업 TOP 5
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          누적 집중 시간이 가장 높은 핵심 프로젝트입니다.
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {topTasks.map((t, index) => (
            <div key={t.title} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold font-mono text-slate-700 dark:text-slate-300 shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {t.title}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
                <span>🍅 {t.count}세션</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {Math.floor(t.minutes / 60)}시간 {t.minutes % 60}분
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Data Reset & Maintenance utilities */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            데이터 관리
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            통계 그래프 탐색을 위한 샘플 데이터를 다시 불러오거나 모든 기록을 초기화할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetSeedData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>샘플 데이터 복원</span>
          </button>
          <button
            onClick={onClearAllData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>기록 모두 지우기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
