export interface Entity {
  id: string;
  type: 'project' | 'goal' | 'habit' | 'asset';
  title: string;
  description?: string;
  created_at: string;
  today_focus?: string;
  why_focus?: string;
  status?: 'active' | 'archived';
  last_action_at?: string;
}

export interface Task {
  id: string;
  entity_id?: string;
  title: string;
  estimated_minutes: number;
  priority: 'P1' | 'P2' | 'P3';
  status: 'pending' | 'started' | 'completed' | 'backlog';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  done_criteria?: string;
  sort_order?: number;
  backlog_reason?: 'deferred' | 'overflow';
  suggested_start_time?: string;
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
  workflow_steps?: string;
  streak_days: number;
  last_completed_at?: string;
  entity_id?: string;
}

export interface Draft {
  id: string;
  content: string;
  created_at: string;
}

export interface HistoryLog {
  id: string;
  input_text: string;
  ai_response?: string;
  created_at: string;
}

export interface DatabaseSchema {
  entities: Entity[];
  tasks: Task[];
  routines: Routine[];
  history_logs: HistoryLog[];
  drafts?: Draft[];
}

