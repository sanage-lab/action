import type {
  DatabaseSchema,
  Entity,
  HistoryLog,
  Routine,
  Task,
  Draft,
} from '@/lib/db/types';
import { getStorage } from '@/lib/storage/jsonFileStorage';

export type { DatabaseSchema, Entity, HistoryLog, Routine, Task, Draft } from '@/lib/db/types';

function readDb(): DatabaseSchema {
  const db = getStorage().read();
  if (!db.drafts) {
    db.drafts = [];
  }
  return db;
}

function writeDb(data: DatabaseSchema): void {
  getStorage().write(data);
}

function localDateStr(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-CA');
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T12:00:00');
  const db = new Date(b + 'T12:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

export class LocalDatabase {
  // --- Entities CRUD ---
  public static getEntities(): Entity[] {
    return readDb().entities;
  }

  public static addEntity(
    entity: Omit<Entity, 'created_at' | 'status'> & { status?: 'active' | 'archived' },
  ): Entity {
    const db = readDb();
    const newEntity: Entity = {
      ...entity,
      status: entity.status || 'active',
      created_at: new Date().toISOString(),
    };
    db.entities.push(newEntity);
    writeDb(db);
    return newEntity;
  }

  public static updateEntity(
    id: string,
    updates: Partial<Pick<Entity, 'title' | 'description' | 'today_focus' | 'why_focus' | 'status' | 'type' | 'last_action_at'>>,
  ): Entity | null {
    const db = readDb();
    const index = db.entities.findIndex((e) => e.id === id);
    if (index === -1) return null;

    db.entities[index] = { ...db.entities[index], ...updates };
    writeDb(db);
    return db.entities[index];
  }

  public static updateEntityStatus(id: string, status: 'active' | 'archived'): Entity | null {
    return this.updateEntity(id, { status });
  }

  public static findEntityByTitle(title: string): Entity | undefined {
    const normalized = title.toLowerCase().trim();
    return readDb().entities.find((e) => e.title.toLowerCase().trim() === normalized);
  }

  // --- Tasks CRUD ---
  public static getTasks(): Task[] {
    return readDb().tasks;
  }

  public static addTask(task: Omit<Task, 'created_at' | 'status'> & { status?: Task['status'] }): Task {
    const db = readDb();
    const maxSortOrder = db.tasks.reduce((max, t) => Math.max(max, t.sort_order ?? 0), 0);
    const newTask: Task = {
      ...task,
      status: task.status || 'pending',
      sort_order: task.sort_order !== undefined ? task.sort_order : (maxSortOrder + 1),
      created_at: new Date().toISOString(),
    };
    db.tasks.push(newTask);
    writeDb(db);
    return newTask;
  }

  public static updateTaskStatus(id: string, status: Task['status']): Task | null {
    const db = readDb();
    const index = db.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const task = db.tasks[index];
    task.status = status;
    if (status === 'started') {
      task.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      task.completed_at = new Date().toISOString();
    }

    db.tasks[index] = task;
    writeDb(db);
    return task;
  }

  public static updateTasksOrder(orderedIds: string[]): void {
    const db = readDb();
    const taskMap = new Map(db.tasks.map((t) => [t.id, t]));

    const reordered: Task[] = [];
    const addedIds = new Set<string>();
    let currentSortOrder = 1;

    for (const id of orderedIds) {
      const task = taskMap.get(id);
      if (task) {
        task.sort_order = currentSortOrder++;
        reordered.push(task);
        addedIds.add(id);
      }
    }

    for (const task of db.tasks) {
      if (!addedIds.has(task.id)) {
        task.sort_order = task.sort_order !== undefined ? task.sort_order : currentSortOrder++;
        reordered.push(task);
      }
    }

    db.tasks = reordered;
    writeDb(db);
  }

  public static updateTaskDetails(id: string, updates: Partial<Task>): Task | null {
    const db = readDb();
    const index = db.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    db.tasks[index] = { ...db.tasks[index], ...updates };
    writeDb(db);
    return db.tasks[index];
  }

  public static deleteTask(id: string): boolean {
    const db = readDb();
    const beforeCount = db.tasks.length;
    db.tasks = db.tasks.filter((t) => t.id !== id);
    writeDb(db);
    return db.tasks.length < beforeCount;
  }

  public static autoMoveOldTasksToBacklog(): void {
    const db = readDb();
    const todayStr = new Date().toLocaleDateString('en-CA');
    let changed = false;
    db.tasks = db.tasks.map((task) => {
      if (task.status !== 'completed' && task.status !== 'backlog') {
        const createdDateStr = new Date(task.created_at).toLocaleDateString('en-CA');
        if (createdDateStr !== todayStr) {
          changed = true;
          return {
            ...task,
            status: 'backlog',
            backlog_reason: 'deferred',
          };
        }
      }
      return task;
    });
    if (changed) {
      writeDb(db);
    }
  }

  // --- Routines (fixed habits) CRUD ---
  public static getRoutines(): Routine[] {
    return readDb().routines;
  }

  public static findRoutineByTitle(title: string): Routine | undefined {
    const normalized = title.toLowerCase().trim();
    return readDb().routines.find((r) => r.title.toLowerCase().trim() === normalized);
  }

  public static addRoutine(routine: Omit<Routine, 'created_at' | 'streak_days'>): Routine {
    const db = readDb();
    const newRoutine: Routine = {
      ...routine,
      streak_days: 0,
      created_at: new Date().toISOString(),
    };
    db.routines.push(newRoutine);
    writeDb(db);
    return newRoutine;
  }

  public static shouldDoToday(routine: Routine, date: Date = new Date()): boolean {
    const freq = routine.frequency;
    const today = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (freq === 'daily') return true;
    if (freq === 'workday') return today >= 1 && today <= 5;
    if (freq === 'mon_wed_fri') return [1, 3, 5].includes(today);
    if (freq === 'weekly') {
      const last = routine.last_completed_at;
      if (!last) return true;
      const lastCompStr = new Date(last).toLocaleDateString('en-CA');
      const dateStr = date.toLocaleDateString('en-CA');
      return daysBetween(lastCompStr, dateStr) >= 7;
    }
    return true;
  }

  public static toggleRoutineCompletion(id: string): Routine | null {
    const db = readDb();
    const index = db.routines.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const routine = db.routines[index];
    const todayStr = new Date().toLocaleDateString('en-CA');
    const lastCompStr = localDateStr(routine.last_completed_at);
    const isCompletedToday = lastCompStr === todayStr;

    if (isCompletedToday) {
      routine.last_completed_at = undefined;
      routine.streak_days = Math.max(0, routine.streak_days - 1);
    } else {
      if (!routine.last_completed_at) {
        routine.streak_days = 1;
      } else {
        // Calculate missed scheduled days since last completion
        let missedScheduledDays = 0;
        let current = new Date(routine.last_completed_at);
        current.setDate(current.getDate() + 1);
        const todayDate = new Date();
        current.setHours(12, 0, 0, 0);
        todayDate.setHours(12, 0, 0, 0);

        while (current.getTime() < todayDate.getTime()) {
          if (this.shouldDoToday(routine, current)) {
            missedScheduledDays++;
          }
          current.setDate(current.getDate() + 1);
        }

        if (missedScheduledDays > routine.allowed_miss_days) {
          routine.streak_days = 1;
        } else {
          routine.streak_days = (routine.streak_days || 0) + 1;
        }
      }
      routine.last_completed_at = new Date().toISOString();

      if (routine.entity_id) {
        const entIndex = db.entities.findIndex((e) => e.id === routine.entity_id);
        if (entIndex !== -1) {
          db.entities[entIndex].last_action_at = new Date().toISOString();
        }
      }
    }

    db.routines[index] = routine;
    writeDb(db);
    return routine;
  }

  public static deleteRoutine(id: string): boolean {
    const db = readDb();
    const beforeCount = db.routines.length;
    db.routines = db.routines.filter((r) => r.id !== id);
    writeDb(db);
    return db.routines.length < beforeCount;
  }

  public static updateRoutineDetails(id: string, updates: Partial<Routine>): Routine | null {
    const db = readDb();
    const index = db.routines.findIndex((r) => r.id === id);
    if (index === -1) return null;
    db.routines[index] = { ...db.routines[index], ...updates };
    writeDb(db);
    return db.routines[index];
  }


  // --- Drafts CRUD ---
  public static getDrafts(): Draft[] {
    return readDb().drafts || [];
  }

  public static addDraft(content: string): Draft {
    const db = readDb();
    const newDraft: Draft = {
      id: `draft-${Date.now()}`,
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    db.drafts = db.drafts || [];
    db.drafts.push(newDraft);
    writeDb(db);
    return newDraft;
  }

  public static deleteDraft(id: string): boolean {
    const db = readDb();
    db.drafts = db.drafts || [];
    const beforeCount = db.drafts.length;
    db.drafts = db.drafts.filter((d) => d.id !== id);
    writeDb(db);
    return db.drafts.length < beforeCount;
  }

  public static updateDraft(id: string, content: string): Draft | null {
    const db = readDb();
    db.drafts = db.drafts || [];
    const index = db.drafts.findIndex((d) => d.id === id);
    if (index === -1) return null;
    db.drafts[index].content = content.trim();
    writeDb(db);
    return db.drafts[index];
  }

  // --- History Log ---
  public static getHistoryLogs(): HistoryLog[] {
    return readDb().history_logs;
  }

  public static addHistoryLog(log: Omit<HistoryLog, 'created_at'>): HistoryLog {
    const db = readDb();
    const newLog: HistoryLog = {
      ...log,
      created_at: new Date().toISOString(),
    };
    db.history_logs.unshift(newLog);
    writeDb(db);
    return newLog;
  }
}

