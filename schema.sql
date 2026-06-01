-- ActionOS Database Schema

-- 1. Entities table: Projects, Goals, Habits, Assets
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('project', 'goal', 'habit', 'asset')),
  title TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tasks table: atomic, immediate, verb-first actions (<30 mins)
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  entity_id TEXT,
  title TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 15,
  priority TEXT NOT NULL CHECK(priority IN ('P1', 'P2', 'P3')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'started', 'completed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME,
  FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- 3. Routines table: daily/weekly habits
CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. History table: Audit log of natural language inputs and executed tasks
CREATE TABLE IF NOT EXISTS history_logs (
  id TEXT PRIMARY KEY,
  input_text TEXT NOT NULL,
  ai_response TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Seed initial data for demonstration purposes
INSERT OR IGNORE INTO entities (id, type, title, description, created_at) VALUES 
('p1', 'project', 'Brain Sanage', 'Ecosystem for measuring and understanding productivity metrics.', datetime('now', '-7 days')),
('g1', 'goal', '恢复运动状态', '每天保持一定的运动和体能锻炼，恢复精神状态。', datetime('now', '-5 days')),
('h1', 'habit', '冥想', '每日清晨进行 10 分钟冥想以维持专注与平静。', datetime('now', '-3 days')),
('a1', 'asset', '投资与SEO笔记', '记录所有流量优化、产品增长的经验与反思。', datetime('now', '-2 days'));

INSERT OR IGNORE INTO tasks (id, entity_id, title, estimated_minutes, priority, status, created_at) VALUES
('t1', 'p1', '检查首页 Meta 标签与 SEO 配置', 15, 'P1', 'pending', datetime('now', '-1 hours')),
('t2', 'p1', '配置站点 Sitemap.xml 生成器', 20, 'P2', 'pending', datetime('now', '-1 hours')),
('t3', 'p1', '创建多语言多国语系资源文件', 30, 'P2', 'pending', datetime('now', '-1 hours')),
('t4', 'g1', '进行 15 分钟日常拉伸与舒展', 15, 'P1', 'pending', datetime('now', '-2 hours')),
('t5', 'h1', '清晨进行 10 分钟静坐与呼吸练习', 10, 'P1', 'pending', datetime('now', '-3 hours'));
