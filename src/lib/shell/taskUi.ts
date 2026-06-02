import type { Task } from '@/lib/db/types';

const PRIORITY_RANK = { P1: 1, P2: 2, P3: 3 };

export function getCognitiveTag(priority: Task['priority'], minutes: number) {
  if (minutes <= 10 || priority === 'P1') {
    return {
      label: '⚡ 极易启动',
      style: 'bg-green-50 text-green-700 border-green-200 animate-pulse',
    };
  }
  if (minutes <= 20 || priority === 'P2') {
    return {
      label: '⚡ 中等启动',
      style: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }
  return {
    label: '⚡ 深度专注',
    style: 'bg-red-50 text-red-700 border-red-200',
  };
}

export function pickNextAction(tasks: Task[]): Task | undefined {
  return [...tasks]
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => (PRIORITY_RANK[a.priority] || 3) - (PRIORITY_RANK[b.priority] || 3))[0];
}

export function computeMomentum(tasks: Task[], routines: { streak_days: number }[]) {
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const maxHabitStreak =
    routines.length > 0 ? Math.max(...routines.map((r) => r.streak_days)) : 0;
  const startedTasks = tasks.filter((t) => t.created_at && t.started_at);
  const avgStartMinutes =
    startedTasks.length > 0
      ? Math.round(
          startedTasks.reduce((acc, t) => {
            const created = new Date(t.created_at).getTime();
            const started = new Date(t.started_at || '').getTime();
            return acc + Math.max(0, started - created);
          }, 0) /
            startedTasks.length /
            60000,
        )
      : 0;

  let momentumStatus = '状态：动量稳步激活';
  if (completedTasks.length === 0 && maxHabitStreak === 0) {
    momentumStatus = '状态：蓄势待发';
  } else if (maxHabitStreak >= 7 || completedTasks.length >= 10) {
    momentumStatus = '状态：极强动量持续爆发';
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeekCompleted = tasks.filter(t => {
    if (t.status !== 'completed' || !t.completed_at) return false;
    const compDate = new Date(t.completed_at);
    return compDate >= sevenDaysAgo && compDate <= now;
  });

  const lastWeekCompleted = tasks.filter(t => {
    if (t.status !== 'completed' || !t.completed_at) return false;
    const compDate = new Date(t.completed_at);
    return compDate >= fourteenDaysAgo && compDate < sevenDaysAgo;
  });

  const completedDiff = thisWeekCompleted.length - lastWeekCompleted.length;

  const thisWeekStarted = tasks.filter(t => {
    if (!t.created_at || !t.started_at) return false;
    const startDate = new Date(t.started_at);
    return startDate >= sevenDaysAgo && startDate <= now;
  });

  const lastWeekStarted = tasks.filter(t => {
    if (!t.created_at || !t.started_at) return false;
    const startDate = new Date(t.started_at);
    return startDate >= fourteenDaysAgo && startDate < sevenDaysAgo;
  });

  const thisWeekAvgStart = thisWeekStarted.length > 0
    ? Math.round(thisWeekStarted.reduce((acc, t) => acc + Math.max(0, new Date(t.started_at!).getTime() - new Date(t.created_at).getTime()), 0) / thisWeekStarted.length / 60000)
    : 0;

  const lastWeekAvgStart = lastWeekStarted.length > 0
    ? Math.round(lastWeekStarted.reduce((acc, t) => acc + Math.max(0, new Date(t.started_at!).getTime() - new Date(t.created_at).getTime()), 0) / lastWeekStarted.length / 60000)
    : 0;

  const avgStartDiff = thisWeekAvgStart - lastWeekAvgStart;

  return {
    completedTasks,
    maxHabitStreak,
    avgStartMinutes,
    momentumStatus,
    recentWins: [...completedTasks]
      .sort(
        (a, b) =>
          new Date(b.completed_at || '').getTime() - new Date(a.completed_at || '').getTime(),
      )
      .slice(0, 5),
    completedTrend: {
      diff: completedDiff,
      label: completedDiff >= 0 ? `↑ 比上周多 ${completedDiff} 个` : `↓ 比上周少 ${Math.abs(completedDiff)} 个`
    },
    avgStartTrend: {
      diff: avgStartDiff,
      label: lastWeekAvgStart === 0 ? '数据充足后对比' : (avgStartDiff < 0 ? `↓ 比上周少 ${Math.abs(avgStartDiff)} 分钟` : avgStartDiff > 0 ? `↑ 比上周多 ${avgStartDiff} 分钟` : '与上周持平')
    },
    streakTrend: {
      label: maxHabitStreak > 0 ? '稳定保护中' : '新 workspace'
    }
  };
}

