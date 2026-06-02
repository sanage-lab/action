'use server';

import { LocalDatabase, Routine } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Server action to create a new habit with full behavioral triggers
 */
export async function createHabit(habitData: Omit<Routine, 'id' | 'created_at' | 'streak_days'>) {
  try {
    const title = habitData.title.trim();
    let entityId = '';
    const existingEntity = LocalDatabase.findEntityByTitle(title);
    if (existingEntity && existingEntity.type === 'habit') {
      entityId = existingEntity.id;
    } else {
      const newEntity = LocalDatabase.addEntity({
        id: `ent-habit-${Date.now()}`,
        type: 'habit',
        title,
        description: `日常习惯 ${title} 的实体绑定`,
      });
      entityId = newEntity.id;
    }

    const id = `habit-${Date.now()}`;
    const newHabit = LocalDatabase.addRoutine({
      id,
      ...habitData,
      entity_id: entityId
    });
    
    revalidatePath('/');
    return { success: true, habit: newHabit };
  } catch (error: any) {
    console.error('[ActionOS Habit Actions] Failed to create habit:', error);
    return { success: false, error: error.message || 'Failed to create habit.' };
  }
}


/**
 * Server action to toggle a habit's daily completion status (self-healing date based)
 */
export async function toggleHabitCompletion(id: string) {
  try {
    const updated = LocalDatabase.toggleRoutineCompletion(id);
    if (!updated) {
      return { success: false, error: 'Habit not found.' };
    }
    
    revalidatePath('/');
    return { success: true, habit: updated };
  } catch (error: any) {
    console.error('[ActionOS Habit Actions] Failed to toggle habit completion:', error);
    return { success: false, error: error.message || 'Failed to toggle habit.' };
  }
}

/**
 * Server action to delete a habit
 */
export async function deleteHabit(id: string) {
  try {
    const deleted = LocalDatabase.deleteRoutine(id);
    if (!deleted) {
      return { success: false, error: 'Habit not found or could not be deleted.' };
    }
    
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('[ActionOS Habit Actions] Failed to delete habit:', error);
    return { success: false, error: error.message || 'Failed to delete habit.' };
  }
}
