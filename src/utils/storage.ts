import { Category, SessionLog, Task, TimerSettings } from '../types.ts';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: '개발 및 코딩', color: '#6366F1' }, // Indigo
  { id: 'cat-2', name: '기획 및 문서작성', color: '#0EA5E9' }, // Sky
  { id: 'cat-3', name: '공부 및 리서치', color: '#10B981' }, // Emerald
  { id: 'cat-4', name: '디자인 및 UI', color: '#F43F5E' }, // Rose
  { id: 'cat-5', name: '업무 회의/정리', color: '#F59E0B' }, // Amber
];

export const DEFAULT_SETTINGS: TimerSettings = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundNotification: true,
  tickSound: false,
  whiteNoise: false,
  dailyTargetPoms: 8,
};

// Generate realistic seeded session logs for the past 7 days up to today
export function generateSeedData(): { tasks: Task[]; logs: SessionLog[] } {
  const now = new Date();
  const formatOffsetDate = (daysAgo: number, hour: number, minute: number): string => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'REST API 엔드포인트 리팩토링 및 테스트 작성',
      category: '개발 및 코딩',
      color: '#6366F1',
      estimatedPoms: 4,
      completedPoms: 3,
      completed: false,
      notes: '인증 미들웨어 캐싱 로직 보완 및 Jest 유닛 테스트 작성',
      priority: 'high',
      createdAt: formatOffsetDate(2, 9, 30),
      updatedAt: formatOffsetDate(0, 11, 0),
    },
    {
      id: 'task-2',
      title: '뽀모도로 대시보드 UI 컴포넌트 설계',
      category: '디자인 및 UI',
      color: '#F43F5E',
      estimatedPoms: 3,
      completedPoms: 3,
      completed: true,
      notes: '반응형 레이아웃 및 60-30-10 컬러 규칙 반영',
      priority: 'medium',
      createdAt: formatOffsetDate(1, 14, 0),
      updatedAt: formatOffsetDate(1, 17, 30),
    },
    {
      id: 'task-3',
      title: 'Q4 분기별 성과 지표 보고서 초안 작성',
      category: '기획 및 문서작성',
      color: '#0EA5E9',
      estimatedPoms: 2,
      completedPoms: 2,
      completed: true,
      notes: '팀별 KPI 달성률 집계 및 주요 인사이트 정리',
      priority: 'high',
      createdAt: formatOffsetDate(3, 10, 0),
      updatedAt: formatOffsetDate(3, 12, 0),
    },
    {
      id: 'task-4',
      title: 'TypeScript 고급 타입 및 성능 최적화 강의 학습',
      category: '공부 및 리서치',
      color: '#10B981',
      estimatedPoms: 3,
      completedPoms: 1,
      completed: false,
      notes: 'Generics와 Conditional Types 실전 예제 실습',
      priority: 'low',
      createdAt: formatOffsetDate(0, 10, 0),
      updatedAt: formatOffsetDate(0, 10, 45),
    },
  ];

  const logs: SessionLog[] = [
    // Today
    {
      id: 'log-101',
      taskId: 'task-1',
      taskTitle: 'REST API 엔드포인트 리팩토링 및 테스트 작성',
      category: '개발 및 코딩',
      color: '#6366F1',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(0, 9, 30),
      notes: 'JWT 토큰 검증 로직 모듈 분리 완료',
    },
    {
      id: 'log-102',
      taskId: 'task-1',
      taskTitle: 'REST API 엔드포인트 리팩토링 및 테스트 작성',
      category: '개발 및 코딩',
      color: '#6366F1',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(0, 10, 5),
      notes: '데이터베이스 쿼리 인덱싱 확인 및 벤치마크',
    },
    {
      id: 'log-103',
      taskId: 'task-4',
      taskTitle: 'TypeScript 고급 타입 및 성능 최적화 강의 학습',
      category: '공부 및 리서치',
      color: '#10B981',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(0, 11, 0),
      notes: '유니온 타입과 인덱스 접근 타입 챕터 정리',
    },

    // Yesterday (1 day ago)
    {
      id: 'log-201',
      taskId: 'task-2',
      taskTitle: '뽀모도로 대시보드 UI 컴포넌트 설계',
      category: '디자인 및 UI',
      color: '#F43F5E',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(1, 14, 0),
      notes: '헤더 네비게이션 및 세션 링 와이어프레임',
    },
    {
      id: 'log-202',
      taskId: 'task-2',
      taskTitle: '뽀모도로 대시보드 UI 컴포넌트 설계',
      category: '디자인 및 UI',
      color: '#F43F5E',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(1, 14, 35),
      notes: '다크 모드 대비 및 폰트 계층 구조 확정',
    },
    {
      id: 'log-203',
      taskId: 'task-2',
      taskTitle: '뽀모도로 대시보드 UI 컴포넌트 설계',
      category: '디자인 및 UI',
      color: '#F43F5E',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(1, 15, 20),
      notes: '통계 차트 레이아웃 스타일 가이드 완료',
    },
    {
      id: 'log-204',
      taskId: 'task-1',
      taskTitle: 'REST API 엔드포인트 리팩토링 및 테스트 작성',
      category: '개발 및 코딩',
      color: '#6366F1',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(1, 16, 30),
      notes: '파라미터 유효성 검사 스키마 수정',
    },
    {
      id: 'log-205',
      taskTitle: '주간 업무 우선순위 스크럼 정리',
      category: '업무 회의/정리',
      color: '#F59E0B',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(1, 17, 10),
      notes: '금주 스프린트 목표 공유 및 일정 조율',
    },

    // 2 days ago
    {
      id: 'log-301',
      taskTitle: '사용자 피드백 분석 및 개선점 도출',
      category: '기획 및 문서작성',
      color: '#0EA5E9',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(2, 10, 0),
      notes: '앱 사용성 설문 응답 48건 분류 완료',
    },
    {
      id: 'log-302',
      taskTitle: '사용자 피드백 분석 및 개선점 도출',
      category: '기획 및 문서작성',
      color: '#0EA5E9',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(2, 10, 40),
      notes: '핵심 불만 사항 우선순위 매트릭스 도출',
    },
    {
      id: 'log-303',
      taskTitle: '웹소켓 통신 안정성 개선 실험',
      category: '개발 및 코딩',
      color: '#6366F1',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(2, 14, 0),
      notes: '재연결 지수 백오프 알고리즘 프로토타입 작성',
    },
    {
      id: 'log-304',
      taskTitle: '웹소켓 통신 안정성 개선 실험',
      category: '개발 및 코딩',
      color: '#6366F1',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(2, 14, 45),
      notes: '네트워크 단절 시 패킷 버퍼링 테스트',
    },

    // 3 days ago
    {
      id: 'log-401',
      taskId: 'task-3',
      taskTitle: 'Q4 분기별 성과 지표 보고서 초안 작성',
      category: '기획 및 문서작성',
      color: '#0EA5E9',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(3, 10, 30),
      notes: '재무 지표 및 고객 유지율 그래프 생성',
    },
    {
      id: 'log-402',
      taskId: 'task-3',
      taskTitle: 'Q4 분기별 성과 지표 보고서 초안 작성',
      category: '기획 및 문서작성',
      color: '#0EA5E9',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(3, 11, 15),
      notes: '경영진 요약본 1페이지 슬라이드 구성',
    },
    {
      id: 'log-403',
      taskTitle: '알고리즘 문제 풀이 및 코드 리뷰',
      category: '공부 및 리서치',
      color: '#10B981',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(3, 16, 0),
      notes: 'DP 및 그래프 탐색 최적화 스터디',
    },

    // 4 days ago
    {
      id: 'log-501',
      taskTitle: '서버리스 아키텍처 비용 최적화 분석',
      category: '개발 및 코딩',
      color: '#6366F1',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(4, 9, 30),
      notes: 'Cloud Function 콜드스타트 및 메모리 할당 튜닝',
    },
    {
      id: 'log-502',
      taskTitle: '서버리스 아키텍처 비용 최적화 분석',
      category: '개발 및 코딩',
      color: '#6366F1',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(4, 10, 15),
      notes: '월간 예상 지출 28% 절감 방안 수립',
    },
    {
      id: 'log-503',
      taskTitle: '디자인 시스템 컬러 토큰 표준화',
      category: '디자인 및 UI',
      color: '#F43F5E',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(4, 14, 0),
      notes: 'Figma 변수와 Tailwind 색상 매핑 동기화',
    },
    {
      id: 'log-504',
      taskTitle: '디자인 시스템 컬러 토큰 표준화',
      category: '디자인 및 UI',
      color: '#F43F5E',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(4, 14, 40),
      notes: '컴포넌트 라이브러리 프리뷰 테스트',
    },
    {
      id: 'log-505',
      taskTitle: '테크 블로그 아티클 초안 작성',
      category: '공부 및 리서치',
      color: '#10B981',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(4, 16, 30),
      notes: '웹 워커를 활용한 대용량 데이터 시각화 기법 정리',
    },

    // 5 days ago
    {
      id: 'log-601',
      taskTitle: '고객 온보딩 플로우 개선안 기획',
      category: '기획 및 문서작성',
      color: '#0EA5E9',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(5, 11, 0),
      notes: '첫 진입 이탈률 감소를 위한 3단계 안내 플로우 구성',
    },
    {
      id: 'log-602',
      taskTitle: '고객 온보딩 플로우 개선안 기획',
      category: '기획 및 문서작성',
      color: '#0EA5E9',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(5, 11, 40),
      notes: '이메일 확인 단계 생략 및 소셜 로그인 최우선 노출 검토',
    },
    {
      id: 'log-603',
      taskTitle: '데이터베이스 마이그레이션 스크립트 작성',
      category: '개발 및 코딩',
      color: '#6366F1',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(5, 15, 20),
      notes: '무중단 스키마 변경을 위한 듀얼 라이트 로직 작성',
    },

    // 6 days ago
    {
      id: 'log-701',
      taskTitle: '월간 프로덕트 로드맵 싱크 회의',
      category: '업무 회의/정리',
      color: '#F59E0B',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(6, 10, 0),
      notes: '기능 릴리즈 일정 조율 및 리소스 분배 협의',
    },
    {
      id: 'log-702',
      taskTitle: '신규 라이브러리 보안 취약점 감사',
      category: '개발 및 코딩',
      color: '#6366F1',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(6, 14, 0),
      notes: 'npm audit 결과 확인 및 취약한 패키지 3종 메이저 버전 업그레이드',
    },
    {
      id: 'log-703',
      taskTitle: '신규 라이브러리 보안 취약점 감사',
      category: '개발 및 코딩',
      color: '#6366F1',
      durationMinutes: 25,
      mode: 'pomodoro',
      completedAt: formatOffsetDate(6, 14, 45),
      notes: '회귀 테스트 진행 및 배포 승인 요청',
    },
  ];

  return { tasks, logs };
}

const STORAGE_KEYS = {
  TASKS: 'pomodoro_tasks_v1',
  LOGS: 'pomodoro_logs_v1',
  SETTINGS: 'pomodoro_settings_v1',
  CATEGORIES: 'pomodoro_categories_v1',
  ACTIVE_TASK_ID: 'pomodoro_active_task_id_v1',
  THEME: 'pomodoro_theme_v1',
};

export function loadStoredData() {
  let tasks: Task[] = [];
  let logs: SessionLog[] = [];
  let categories: Category[] = DEFAULT_CATEGORIES;
  let settings: TimerSettings = DEFAULT_SETTINGS;
  let activeTaskId: string | null = null;
  let isDarkMode = false;

  try {
    const rawCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (rawCategories) {
      categories = JSON.parse(rawCategories);
    } else {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }

    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (rawSettings) {
      settings = { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) };
    } else {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }

    const rawTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    const rawLogs = localStorage.getItem(STORAGE_KEYS.LOGS);

    if (rawTasks && rawLogs) {
      tasks = JSON.parse(rawTasks);
      logs = JSON.parse(rawLogs);
    } else {
      // First time initialization: seed with high-quality sample data
      const seed = generateSeedData();
      tasks = seed.tasks;
      logs = seed.logs;
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    }

    activeTaskId = localStorage.getItem(STORAGE_KEYS.ACTIVE_TASK_ID) || (tasks[0]?.id ?? null);
    isDarkMode = localStorage.getItem(STORAGE_KEYS.THEME) === 'dark';
  } catch (err) {
    console.error('Failed to load local storage data:', err);
    const seed = generateSeedData();
    tasks = seed.tasks;
    logs = seed.logs;
  }

  return { tasks, logs, categories, settings, activeTaskId, isDarkMode };
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks', err);
  }
}

export function saveLogs(logs: SessionLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save logs', err);
  }
}

export function saveSettings(settings: TimerSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories', err);
  }
}

export function saveActiveTaskId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TASK_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TASK_ID);
    }
  } catch (err) {
    console.error('Failed to save active task ID', err);
  }
}

export function saveTheme(isDark: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
  } catch (err) {
    console.error('Failed to save theme', err);
  }
}
