-- FocusFlow 云端数据库初始化脚本
-- 创建日期: 2025-12-04
-- 用途: 与本地 SQLite 数据库结构保持一致,支持多设备同步

-- ==============================================
-- 1. 用户表 (Supabase Auth 自带,无需创建)
-- ==============================================
-- auth.users 表由 Supabase 自动管理

-- ==============================================
-- 2. 专注事项表
-- ==============================================
CREATE TABLE IF NOT EXISTS focus_items (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📝',
  color TEXT NOT NULL DEFAULT '#8b5cf6',
  work_duration INTEGER NOT NULL DEFAULT 1500,
  short_break_duration INTEGER NOT NULL DEFAULT 300,
  long_break_duration INTEGER NOT NULL DEFAULT 900,
  pomodoros_until_long_break INTEGER NOT NULL DEFAULT 4,
  auto_start_breaks BOOLEAN NOT NULL DEFAULT TRUE,
  auto_start_pomodoros BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  deleted_at BIGINT DEFAULT NULL
);

-- 索引优化
CREATE INDEX idx_focus_items_user_id ON focus_items(user_id);
CREATE INDEX idx_focus_items_updated_at ON focus_items(updated_at);
CREATE INDEX idx_focus_items_is_archived ON focus_items(is_archived);

-- ==============================================
-- 3. 专注会话表
-- ==============================================
CREATE TABLE IF NOT EXISTS focus_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  focus_item_id TEXT NOT NULL REFERENCES focus_items(id) ON DELETE CASCADE,
  start_time BIGINT NOT NULL,
  end_time BIGINT,
  total_duration INTEGER DEFAULT 0,
  completed_pomodoros INTEGER DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  deleted_at BIGINT DEFAULT NULL
);

-- 索引优化
CREATE INDEX idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_item_id ON focus_sessions(focus_item_id);
CREATE INDEX idx_focus_sessions_start_time ON focus_sessions(start_time);
CREATE INDEX idx_focus_sessions_updated_at ON focus_sessions(updated_at);

-- ==============================================
-- 4. 番茄钟记录表
-- ==============================================
CREATE TABLE IF NOT EXISTS pomodoro_records (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL REFERENCES focus_sessions(id) ON DELETE CASCADE,
  focus_item_id TEXT NOT NULL REFERENCES focus_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('work', 'short_break', 'long_break')),
  planned_duration INTEGER NOT NULL,
  actual_duration INTEGER NOT NULL DEFAULT 0,
  start_time BIGINT NOT NULL,
  end_time BIGINT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  is_skipped BOOLEAN NOT NULL DEFAULT FALSE,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  deleted_at BIGINT DEFAULT NULL
);

-- 索引优化
CREATE INDEX idx_pomodoro_records_user_id ON pomodoro_records(user_id);
CREATE INDEX idx_pomodoro_records_session_id ON pomodoro_records(session_id);
CREATE INDEX idx_pomodoro_records_item_id ON pomodoro_records(focus_item_id);
CREATE INDEX idx_pomodoro_records_start_time ON pomodoro_records(start_time);
CREATE INDEX idx_pomodoro_records_updated_at ON pomodoro_records(updated_at);
CREATE INDEX idx_pomodoro_records_type ON pomodoro_records(type);

-- ==============================================
-- 5. 同步元数据表
-- ==============================================
CREATE TABLE IF NOT EXISTS sync_metadata (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  last_sync_time BIGINT NOT NULL,
  sync_direction TEXT NOT NULL CHECK (sync_direction IN ('up', 'down', 'both')),
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  UNIQUE(user_id, table_name)
);

-- 索引优化
CREATE INDEX idx_sync_metadata_user_id ON sync_metadata(user_id);

-- ==============================================
-- 6. 行级安全策略 (RLS)
-- ==============================================

-- 启用 RLS
ALTER TABLE focus_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_metadata ENABLE ROW LEVEL SECURITY;

-- focus_items 策略
CREATE POLICY "用户只能查看自己的专注事项"
  ON focus_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的专注事项"
  ON focus_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的专注事项"
  ON focus_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的专注事项"
  ON focus_items FOR DELETE
  USING (auth.uid() = user_id);

-- focus_sessions 策略
CREATE POLICY "用户只能查看自己的专注会话"
  ON focus_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的专注会话"
  ON focus_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的专注会话"
  ON focus_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的专注会话"
  ON focus_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- pomodoro_records 策略
CREATE POLICY "用户只能查看自己的番茄钟记录"
  ON pomodoro_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的番茄钟记录"
  ON pomodoro_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的番茄钟记录"
  ON pomodoro_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的番茄钟记录"
  ON pomodoro_records FOR DELETE
  USING (auth.uid() = user_id);

-- sync_metadata 策略
CREATE POLICY "用户只能查看自己的同步元数据"
  ON sync_metadata FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的同步元数据"
  ON sync_metadata FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的同步元数据"
  ON sync_metadata FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的同步元数据"
  ON sync_metadata FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================
-- 完成
-- ==============================================
-- 所有表创建完成，RLS 策略已配置
-- 用户数据完全隔离，安全性保障
