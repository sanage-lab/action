-- ActionOS Database Schema (source of truth for D1 migration)
-- Mirrors src/lib/db/types.ts

-- 1. Entities: Projects, Goals, Habits (taxonomy), Assets
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('project', 'goal', 'habit', 'asset')),
  title TEXT NOT NULL,
  description TEXT,
  today_focus TEXT,
  why_focus TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'archived')),
  last_action_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tasks: verb-first atomic actions (< 30 mins)
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  entity_id TEXT,
  title TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 15 CHECK(estimated_minutes BETWEEN 1 AND 120),
  priority TEXT NOT NULL CHECK(priority IN ('P1', 'P2', 'P3')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'started', 'completed', 'backlog')),
  done_criteria TEXT,
  sort_order INTEGER,
  backlog_reason TEXT CHECK(backlog_reason IN ('deferred', 'overflow')),
  suggested_start_time TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
);

-- 3. Routines: executable fixed habits (event-anchored)
CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'workday', 'mon_wed_fri', 'custom')),
  anchor_time TEXT NOT NULL DEFAULT '起床后',
  estimated_minutes INTEGER NOT NULL DEFAULT 10,
  allowed_miss_days INTEGER NOT NULL DEFAULT 0,
  completion_phrase TEXT,
  workflow_steps TEXT,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_completed_at DATETIME,
  entity_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE SET NULL
);

-- 4. History: capture audit log
CREATE TABLE IF NOT EXISTS history_logs (
  id TEXT PRIMARY KEY,
  input_text TEXT NOT NULL,
  ai_response TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Drafts: capture box inbox
CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

