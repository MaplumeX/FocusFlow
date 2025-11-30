/**
 * FocusFlow - 数据库结构定义
 *
 * 表结构:
 * - focus_items: 专注事项表
 * - settings: 设置表
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

-- ============================================
-- 专注事项表 (Focus Items)
-- ============================================
CREATE TABLE IF NOT EXISTS focus_items (
  -- 主键
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- 基本信息
  name TEXT NOT NULL,                    -- 事项名称
  icon TEXT DEFAULT '📊',                -- 图标 (emoji)
  color TEXT DEFAULT '#1890ff',          -- 主题色

  -- 时间配置 (单位: 分钟)
  work_duration INTEGER DEFAULT 25,      -- 工作时长
  short_break INTEGER DEFAULT 5,         -- 短休息时长
  long_break INTEGER DEFAULT 15,         -- 长休息时长
  long_break_interval INTEGER DEFAULT 4, -- 长休息间隔 (多少个番茄钟后)

  -- 统计数据
  total_focus_time INTEGER DEFAULT 0,    -- 累计专注时长 (秒)
  total_sessions INTEGER DEFAULT 0,      -- 累计会话次数

  -- 元数据
  created_at INTEGER NOT NULL,           -- 创建时间 (Unix 时间戳)
  updated_at INTEGER NOT NULL,           -- 更新时间 (Unix 时间戳)
  is_deleted INTEGER DEFAULT 0           -- 软删除标记 (0: 未删除, 1: 已删除)
);

-- 创建索引 (提高查询性能)
CREATE INDEX IF NOT EXISTS idx_focus_items_created
  ON focus_items(created_at);

CREATE INDEX IF NOT EXISTS idx_focus_items_deleted
  ON focus_items(is_deleted);

-- ============================================
-- 设置表 (Settings)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  -- 主键
  key TEXT PRIMARY KEY,     -- 设置项键名
  value TEXT NOT NULL,      -- 设置项值 (JSON 字符串)
  updated_at INTEGER NOT NULL -- 更新时间 (Unix 时间戳)
);

-- ============================================
-- 默认数据
-- ============================================

-- 默认设置
INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES
  ('notification_enabled', 'true', strftime('%s', 'now')),
  ('sound_enabled', 'true', strftime('%s', 'now')),
  ('auto_start_break', 'true', strftime('%s', 'now')),
  ('theme', '"light"', strftime('%s', 'now'));

-- 默认专注事项模板 (4 个预设模板)
INSERT OR IGNORE INTO focus_items
  (name, icon, color, work_duration, short_break, long_break, long_break_interval, created_at, updated_at)
VALUES
  -- 1. 深度工作 (适合需要长时间专注的任务)
  ('深度工作', '🎯', '#1890ff', 50, 10, 30, 3, strftime('%s', 'now'), strftime('%s', 'now')),

  -- 2. 快速处理 (适合短时间批量处理的任务)
  ('快速处理', '⚡', '#52c41a', 15, 3, 15, 4, strftime('%s', 'now'), strftime('%s', 'now')),

  -- 3. 标准学习 (经典番茄钟配置)
  ('标准学习', '📚', '#fa8c16', 25, 5, 15, 4, strftime('%s', 'now'), strftime('%s', 'now')),

  -- 4. 创意工作 (适合需要灵感的创作任务)
  ('创意工作', '💡', '#722ed1', 30, 10, 20, 3, strftime('%s', 'now'), strftime('%s', 'now'));
