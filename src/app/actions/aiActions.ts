'use server';

import { AIFactory } from '@/lib/ai/factory';
import { buildDecomposeContextPrompt, type DecomposeContext } from '@/lib/ai/decomposeContext';
import { normalizeDecomposeResponse } from '@/lib/ai/normalizeTasks';
import { LocalDatabase } from '@/lib/db';
import { revalidatePath } from 'next/cache';

function uniqueTaskId(): string {
  return `t-ai-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function ensureHabitRoutine(entityTitle: string, estimatedMinutes: number, entityId: string): void {
  const existing = LocalDatabase.findRoutineByTitle(entityTitle);
  if (existing) {
    if (!existing.entity_id) {
      LocalDatabase.updateRoutineDetails(existing.id, { entity_id: entityId });
    }
    return;
  }

  LocalDatabase.addRoutine({
    id: `habit-${Date.now()}`,
    title: entityTitle,
    frequency: 'daily',
    anchor_time: '起床后',
    estimated_minutes: Math.min(30, estimatedMinutes || 10),
    allowed_miss_days: 1,
    completion_phrase: `今日「${entityTitle}」已圆满`,
    entity_id: entityId,
  });
}

export async function decomposeAction(inputText: string) {
  try {
    const text = inputText.trim();
    if (!text) {
      return { success: false, error: 'Input text cannot be empty.' };
    }

    const entities = LocalDatabase.getEntities();
    const tasks = LocalDatabase.getTasks();
    const todayPendingTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'backlog');
    const context: DecomposeContext = {
      entities,
      pendingTasks: tasks.filter((t) => t.status !== 'completed'),
      todayPendingCount: todayPendingTasks.length,
    };

    const provider = AIFactory.getProvider();
    console.log(`[ActionOS Server] Invoking AI provider: ${provider.name}`);
    console.log(`[ActionOS Server] Context:\n${buildDecomposeContextPrompt(context)}`);

    const raw = await provider.decompose(text, context);
    const data = normalizeDecomposeResponse(raw);

    let entityId = '';
    const existing = LocalDatabase.findEntityByTitle(data.entity_title);

    if (existing) {
      entityId = existing.id;
      LocalDatabase.updateEntity(entityId, {
        today_focus: data.today_focus,
        why_focus: data.why_focus,
      });
    } else {
      entityId = `ent-${Date.now()}`;
      LocalDatabase.addEntity({
        id: entityId,
        type: data.entity_type,
        title: data.entity_title,
        description: `由 AI (${provider.name}) 智能捕获于: "${text.slice(0, 20)}..."`,
        today_focus: data.today_focus,
        why_focus: data.why_focus,
      });
    }

    if (data.entity_type === 'habit') {
      const minutes = data.tasks[0]?.estimated_minutes ?? 10;
      ensureHabitRoutine(data.entity_title, minutes, entityId);
    }

    for (const task of data.tasks) {
      LocalDatabase.addTask({
        id: uniqueTaskId(),
        entity_id: entityId,
        title: task.title,
        estimated_minutes: task.estimated_minutes,
        priority: task.priority,
        done_criteria: task.done_criteria,
        suggested_start_time: task.suggested_start_time,
      });
    }

    if (data.backlog_tasks && data.backlog_tasks.length > 0) {
      for (const task of data.backlog_tasks) {
        LocalDatabase.addTask({
          id: uniqueTaskId(),
          entity_id: entityId,
          title: task.title,
          estimated_minutes: task.estimated_minutes,
          priority: task.priority,
          done_criteria: task.done_criteria,
          suggested_start_time: task.suggested_start_time,
          status: 'backlog',
          backlog_reason: 'overflow',
        });
      }
    }

    let historyMessage = `AI已成功将其捕获并精准分发至【${data.entity_title}】，共创建 ${data.tasks.length} 个下一步行动。`;
    if (data.load_message) {
      historyMessage += ` ${data.load_message}`;
    }

    LocalDatabase.addHistoryLog({
      id: `log-ai-${Date.now()}`,
      input_text: text,
      ai_response: historyMessage,
    });

    revalidatePath('/');

    return {
      success: true,
      providerName: provider.name,
      entityTitle: data.entity_title,
      loadMessage: data.load_message,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred during task decomposition.';
    console.error('[ActionOS Server Action] Decompose failed:', error);
    return { success: false, error: message };
  }
}

