import type { Entity, Task } from '@/lib/db/types';

export interface DecomposeContext {
  entities: Entity[];
  pendingTasks: Task[];
  todayPendingCount?: number;
}

export function buildDecomposeContextPrompt(ctx: DecomposeContext): string {
  const activeEntities = ctx.entities
    .filter((e) => e.status !== 'archived')
    .slice(0, 20);

  const entityLines =
    activeEntities.length === 0
      ? '（尚无已有分类，可新建）'
      : activeEntities
          .map(
            (e) =>
              `- [${e.type}] ${e.title}${e.today_focus ? ` | 今日焦点: ${e.today_focus}` : ''}`,
          )
          .join('\n');

  const pending = ctx.pendingTasks
    .filter((t) => t.status !== 'completed' && t.status !== 'backlog')
    .slice(0, 15);

  const taskLines =
    pending.length === 0
      ? '（暂无未完成待办）'
      : pending
          .map((t) => {
            const ent = activeEntities.find((e) => e.id === t.entity_id);
            const label = ent ? ent.title : '未归类';
            return `- [${label}] ${t.title} (${t.priority}, ${t.estimated_minutes}min, ${t.status})`;
          })
          .join('\n');

  return `
== EXISTING USER CONTEXT (match titles when possible; do not duplicate projects) ==
今日活跃待办数 (today_pending_count): ${ctx.todayPendingCount ?? 0}
已有实体 (Projects / Goals / Habits / Assets):
${entityLines}

未完成待办摘要:
${taskLines}
`.trim();
}

