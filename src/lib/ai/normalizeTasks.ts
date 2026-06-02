import type { DecomposeResponse } from './types';

const MAX_TASKS = 5;
const MAX_MINUTES = 30;

/** Enforce atomic-task rules server-side after LLM output. */
export function normalizeDecomposeResponse(data: DecomposeResponse): DecomposeResponse {
  const tasks = [...data.tasks]
    .map((t) => ({
      ...t,
      estimated_minutes: Math.min(MAX_MINUTES, Math.max(1, Math.round(t.estimated_minutes))),
    }))
    .slice(0, MAX_TASKS);

  const backlog_tasks = data.backlog_tasks
    ? [...data.backlog_tasks].map((t) => ({
        ...t,
        estimated_minutes: Math.min(MAX_MINUTES, Math.max(1, Math.round(t.estimated_minutes))),
      }))
    : undefined;

  if (tasks.length === 0) {
    return { ...data, backlog_tasks };
  }

  const pRank = { P1: 1, P2: 2, P3: 3 };
  tasks.sort((a, b) => (pRank[a.priority] || 3) - (pRank[b.priority] || 3));

  if (tasks[0].priority !== 'P1') {
    tasks[0] = { ...tasks[0], priority: 'P1' };
  }

  return { ...data, tasks, backlog_tasks };
}

