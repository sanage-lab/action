import fs from 'fs';
import path from 'path';

// Define the Data Schemas matching schema.sql
export interface Entity {
  id: string;
  type: 'project' | 'goal' | 'habit' | 'asset';
  title: string;
  description?: string;
  created_at: string;
  today_focus?: string;
  why_focus?: string;
}

export interface Task {
  id: string;
  entity_id?: string;
  title: string;
  estimated_minutes: number;
  priority: 'P1' | 'P2' | 'P3';
  status: 'pending' | 'started' | 'completed';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  done_criteria?: string;
}

export interface Routine {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'workday' | 'mon_wed_fri' | 'custom';
  created_at: string;
  anchor_time: '起床后' | '早餐后' | '午餐后' | '工作结束后' | '晚餐后' | '睡前' | string;
  estimated_minutes: number;
  allowed_miss_days: number;
  completion_phrase?: string;
  workflow_steps?: string; // stringified JSON array: Array<{ step_num: number; title: string; minutes: number }>
  streak_days: number;
  last_completed_at?: string;
}

export interface HistoryLog {
  id: string;
  input_text: string;
  ai_response?: string;
  created_at: string;
}

interface DatabaseSchema {
  entities: Entity[];
  tasks: Task[];
  routines: Routine[];
  history_logs: HistoryLog[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'action-db.json');

// Default Seed Data matching schema.sql
const DEFAULT_SEED_DATA: DatabaseSchema = {
  entities: [],
  tasks: [],
  routines: [],
  history_logs: []
};

// Thread-safe Database Service for Local JSON
export class LocalDatabase {
  private static read(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_FILE_PATH)) {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(DEFAULT_SEED_DATA, null, 2), 'utf-8');
        return DEFAULT_SEED_DATA;
      }
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const db = JSON.parse(data) as DatabaseSchema;

      // Defensive check: merge seed focus details if missing in existing file
      let modified = false;
      db.entities = db.entities.map(ent => {
        const seed = DEFAULT_SEED_DATA.entities.find(s => s.id === ent.id);
        if (seed && (!ent.today_focus || !ent.why_focus)) {
          modified = true;
          return {
            ...ent,
            today_focus: ent.today_focus || seed.today_focus,
            why_focus: ent.why_focus || seed.why_focus
          };
        }
        return ent;
      });

      if (modified) {
        this.write(db);
      }

      return db;
    } catch (error) {
      console.error('Failed to read database file, returning default seed:', error);
      return DEFAULT_SEED_DATA;
    }
  }

  private static write(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to write database file:', error);
    }
  }

  // --- Entities CRUD ---
  public static getEntities(): Entity[] {
    const db = this.read();
    return db.entities;
  }

  public static addEntity(entity: Omit<Entity, 'created_at'>): Entity {
    const db = this.read();
    const newEntity: Entity = {
      ...entity,
      created_at: new Date().toISOString()
    };
    db.entities.push(newEntity);
    this.write(db);
    return newEntity;
  }

  // --- Tasks CRUD ---
  public static getTasks(): Task[] {
    const db = this.read();
    return db.tasks;
  }

  public static addTask(task: Omit<Task, 'created_at' | 'status'>): Task {
    const db = this.read();
    const newTask: Task = {
      ...task,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    db.tasks.push(newTask);
    this.write(db);
    return newTask;
  }

  public static updateTaskStatus(id: string, status: 'pending' | 'started' | 'completed'): Task | null {
    const db = this.read();
    const index = db.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    const task = db.tasks[index];
    task.status = status;
    if (status === 'started') {
      task.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      task.completed_at = new Date().toISOString();
    }

    db.tasks[index] = task;
    this.write(db);
    return task;
  }

  public static updateTasksOrder(orderedIds: string[]): void {
    const db = this.read();
    const taskMap = new Map(db.tasks.map(t => [t.id, t]));
    
    // Reorder based on orderedIds, keeping rest at the end
    const reordered: Task[] = [];
    const addedIds = new Set<string>();

    for (const id of orderedIds) {
      const task = taskMap.get(id);
      if (task) {
        reordered.push(task);
        addedIds.add(id);
      }
    }

    for (const task of db.tasks) {
      if (!addedIds.has(task.id)) {
        reordered.push(task);
      }
    }

    db.tasks = reordered;
    this.write(db);
  }

  // --- Routines CRUD ---
  public static getRoutines(): Routine[] {
    const db = this.read();
    return db.routines;
  }

  public static addRoutine(routine: Omit<Routine, 'created_at' | 'streak_days'>): Routine {
    const db = this.read();
    const newRoutine: Routine = {
      ...routine,
      streak_days: 0,
      created_at: new Date().toISOString()
    };
    db.routines.push(newRoutine);
    this.write(db);
    return newRoutine;
  }

  public static toggleRoutineCompletion(id: string): Routine | null {
    const db = this.read();
    const index = db.routines.findIndex(r => r.id === id);
    if (index === -1) return null;

    const routine = db.routines[index];
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local format
    const lastCompStr = routine.last_completed_at ? new Date(routine.last_completed_at).toLocaleDateString('en-CA') : '';

    const isCompletedToday = lastCompStr === todayStr;

    if (isCompletedToday) {
      // Uncheck: clear completion date, decrement streak safely
      routine.last_completed_at = undefined;
      routine.streak_days = Math.max(0, routine.streak_days - 1);
    } else {
      // Check: set completion date to now, increment streak
      routine.last_completed_at = new Date().toISOString();
      routine.streak_days = (routine.streak_days || 0) + 1;
    }

    db.routines[index] = routine;
    this.write(db);
    return routine;
  }

  public static deleteRoutine(id: string): boolean {
    const db = this.read();
    const beforeCount = db.routines.length;
    db.routines = db.routines.filter(r => r.id !== id);
    this.write(db);
    return db.routines.length < beforeCount;
  }

  // --- History Log ---
  public static getHistoryLogs(): HistoryLog[] {
    const db = this.read();
    return db.history_logs;
  }

  public static addHistoryLog(log: Omit<HistoryLog, 'created_at'>): HistoryLog {
    const db = this.read();
    const newLog: HistoryLog = {
      ...log,
      created_at: new Date().toISOString()
    };
    db.history_logs.unshift(newLog); // Put latest logs first
    this.write(db);
    return newLog;
  }
}
