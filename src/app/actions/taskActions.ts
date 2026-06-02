'use server';

import { LocalDatabase, Task } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Server action to mark a task as started
 */
export async function startTaskAction(taskId: string) {
  try {
    const updated = LocalDatabase.updateTaskStatus(taskId, 'started');
    if (!updated) {
      return { success: false, error: 'Task not found.' };
    }
    revalidatePath('/');
    return { success: true, task: updated };
  } catch (error: any) {
    console.error('[ActionOS Task Actions] Failed to start task:', error);
    return { success: false, error: error.message || 'Failed to start task.' };
  }
}

/**
 * Server action to mark a task as completed
 */
export async function completeTaskAction(taskId: string) {
  try {
    const updated = LocalDatabase.updateTaskStatus(taskId, 'completed');
    if (!updated) {
      return { success: false, error: 'Task not found.' };
    }
    revalidatePath('/');
    return { success: true, task: updated };
  } catch (error: any) {
    console.error('[ActionOS Task Actions] Failed to complete task:', error);
    return { success: false, error: error.message || 'Failed to complete task.' };
  }
}

/**
 * Server action to save the updated tasks order
 */
export async function reorderTasksAction(orderedIds: string[]) {
  try {
    LocalDatabase.updateTasksOrder(orderedIds);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('[ActionOS Task Actions] Failed to reorder tasks:', error);
    return { success: false, error: error.message || 'Failed to reorder tasks.' };
  }
}

/**
 * Server action to update specific task details
 */
export async function updateTaskAction(taskId: string, updates: Partial<Task>) {
  try {
    const updated = LocalDatabase.updateTaskDetails(taskId, updates);
    if (!updated) {
      return { success: false, error: 'Task not found.' };
    }
    revalidatePath('/');
    return { success: true, task: updated };
  } catch (error: any) {
    console.error('[ActionOS Task Actions] Failed to update task:', error);
    return { success: false, error: error.message || 'Failed to update task.' };
  }
}

/**
 * Server action to delete a task
 */
export async function deleteTaskAction(taskId: string) {
  try {
    const deleted = LocalDatabase.deleteTask(taskId);
    if (!deleted) {
      return { success: false, error: 'Task not found.' };
    }
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('[ActionOS Task Actions] Failed to delete task:', error);
    return { success: false, error: error.message || 'Failed to delete task.' };
  }
}

/**
 * Server action to archive an entity (project, goal, etc.)
 */
export async function archiveEntityAction(entityId: string) {
  try {
    const updated = LocalDatabase.updateEntityStatus(entityId, 'archived');
    if (!updated) {
      return { success: false, error: 'Entity not found.' };
    }
    revalidatePath('/');
    return { success: true, entity: updated };
  } catch (error: any) {
    console.error('[ActionOS Task Actions] Failed to archive entity:', error);
    return { success: false, error: error.message || 'Failed to archive entity.' };
  }
}

/**
 * Server action to add a new task
 */
export async function addTaskAction(task: Omit<Task, 'created_at' | 'status'> & { status?: Task['status'] }) {
  try {
    const created = LocalDatabase.addTask(task);
    revalidatePath('/');
    return { success: true, task: created };
  } catch (error: any) {
    console.error('[ActionOS Task Actions] Failed to add task:', error);
    return { success: false, error: error.message || 'Failed to add task.' };
  }
}

/**
 * Server action to add a draft
 */
export async function addDraftAction(content: string) {
  try {
    const created = LocalDatabase.addDraft(content);
    revalidatePath('/');
    return { success: true, draft: created };
  } catch (error: any) {
    console.error('[ActionOS Task Actions] Failed to add draft:', error);
    return { success: false, error: error.message || 'Failed to add draft.' };
  }
}

/**
 * Server action to delete a draft
 */
export async function deleteDraftAction(id: string) {
  try {
    const deleted = LocalDatabase.deleteDraft(id);
    if (!deleted) {
      return { success: false, error: 'Draft not found.' };
    }
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('[ActionOS Task Actions] Failed to delete draft:', error);
    return { success: false, error: error.message || 'Failed to delete draft.' };
  }
}

/**
 * Server action to update a draft
 */
export async function updateDraftAction(id: string, content: string) {
  try {
    const updated = LocalDatabase.updateDraft(id, content);
    if (!updated) {
      return { success: false, error: 'Draft not found.' };
    }
    revalidatePath('/');
    return { success: true, draft: updated };
  } catch (error: any) {
    console.error('[ActionOS Task Actions] Failed to update draft:', error);
    return { success: false, error: error.message || 'Failed to update draft.' };
  }
}

import { decomposeAction } from './aiActions';

/**
 * Server action to decompose a draft using AI and delete it upon success
 */
export async function decomposeDraftAction(draftId: string) {
  try {
    const drafts = LocalDatabase.getDrafts();
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) {
      return { success: false, error: 'Draft not found.' };
    }
    const result = await decomposeAction(draft.content);
    if (result.success) {
      LocalDatabase.deleteDraft(draftId);
      revalidatePath('/');
    }
    return result;
  } catch (error: any) {
    console.error('[ActionOS Task Actions] Failed to decompose draft:', error);
    return { success: false, error: error.message || 'Failed to decompose draft.' };
  }
}

