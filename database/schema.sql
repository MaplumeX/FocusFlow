/**
 * FocusFlow - 数据库结构定义
 *
 * 表结构:
 * - focus_items: 专注事项表
 * - focus_sessions: 专注会话表 (Phase 2)
 * - pomodoro_records: 番茄钟记录表 (仅记录工作时段, 不再区分 type)
 * - settings: 设置表
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 * @updated 2025-11-30 (Phase 2: 添加会话管理表)
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
  is_deleted INTEGER DEFAULT 0           -- 归档标记 (0: 活跃, 1: 已归档)
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


-- ============================================
-- 专注会话表 (Focus Sessions) - Phase 2
-- ============================================
CREATE TABLE IF NOT EXISTS focus_sessions (
  -- 主键
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- 关联的专注事项
  focus_item_id INTEGER NOT NULL,

  -- 配置快照 (记录当时的配置,修改事项配置不影响已有会话)
  config_work_duration INTEGER NOT NULL,      -- 工作时长快照 (分钟)
  config_short_break INTEGER NOT NULL,        -- 短休息时长快照 (分钟)
  config_long_break INTEGER NOT NULL,         -- 长休息时长快照 (分钟)
  config_long_break_interval INTEGER NOT NULL, -- 长休息间隔快照

  -- 会话状态
  is_active INTEGER DEFAULT 1,                -- 是否为活动会话 (0: 已结束, 1: 进行中)
  total_pomodoros INTEGER DEFAULT 0,          -- 本次会话已完成番茄钟数
  completed_pomodoros INTEGER DEFAULT 0,      -- 完整完成的番茄钟数

  -- 时间戳
  started_at INTEGER NOT NULL,                -- 会话开始时间 (Unix 时间戳)
  ended_at INTEGER,                           -- 会话结束时间 (可为空)

  -- 外键约束
  FOREIGN KEY (focus_item_id) REFERENCES focus_items(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_sessions_focus_item
  ON focus_sessions(focus_item_id);

CREATE INDEX IF NOT EXISTS idx_sessions_started
  ON focus_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_sessions_active
  ON focus_sessions(is_active);

-- ============================================
  -- 番茄钟记录表 (Pomodoro Records) - Phase 2
  -- ============================================
  CREATE TABLE IF NOT EXISTS pomodoro_records (
  -- 主键
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- 关联
  session_id INTEGER NOT NULL,               -- 所属会话 ID
  focus_item_id INTEGER NOT NULL,            -- 所属事项 ID

  -- 番茄钟信息 (仅记录工作番茄钟)
  duration INTEGER NOT NULL,                 -- 实际时长 (秒)
  is_completed INTEGER DEFAULT 1,            -- 是否完整完成 (0: 未完成, 1: 完成)

  -- 时间戳
  start_time INTEGER NOT NULL,               -- 开始时间 (Unix 时间戳)
  end_time INTEGER NOT NULL,                 -- 结束时间 (Unix 时间戳)

  -- 外键约束
  FOREIGN KEY (session_id) REFERENCES focus_sessions(id),
  FOREIGN KEY (focus_item_id) REFERENCES focus_items(id)
);

  -- 创建索引
  CREATE INDEX IF NOT EXISTS idx_pomodoro_session
  ON pomodoro_records(session_id);

  CREATE INDEX IF NOT EXISTS idx_pomodoro_item
  ON pomodoro_records(focus_item_id);

CREATE INDEX IF NOT EXISTS idx_pomodoro_start_time
  ON pomodoro_records(start_time);
