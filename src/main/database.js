/**
 * FocusFlow - 数据库操作封装 (SQLite 版本)
 *
 * 功能:
 * - 初始化 SQLite 数据库
 * - 专注事项 CRUD 操作
 * - 设置管理
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import { app } from 'electron'
import { join } from 'path'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'

let db = null

/**
 * 获取数据库路径
 */
function getDatabaseFilePath() {
  const userDataPath = app.getPath('userData')
  return join(userDataPath, 'focusflow.db')
}

/**
 * 初始化数据库
 */
export function initDatabase() {
  try {
    const dbPath = getDatabaseFilePath()
    console.log('Database path:', dbPath)

    // 打开数据库连接
    db = new Database(dbPath)

    // 启用外键约束
    db.pragma('foreign_keys = ON')

    // 读取并执行 schema.sql
    const schemaPath = join(process.cwd(), 'database', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')

    // 分割并执行多条 SQL 语句
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    statements.forEach(statement => {
      try {
        db.exec(statement)
      } catch (err) {
        // 忽略已存在的错误
        if (!err.message.includes('already exists')) {
          console.error('Error executing statement:', err.message)
        }
      }
    })

    console.log('Database initialized successfully')
    return true
  } catch (error) {
    console.error('Failed to initialize database:', error)
    return false
  }
}

/**
 * 获取所有专注事项
 */
export function getFocusItems() {
  try {
    const stmt = db.prepare('SELECT * FROM focus_items WHERE is_deleted = 0 ORDER BY created_at DESC')
    return stmt.all()
  } catch (error) {
    console.error('Error getting focus items:', error)
    return []
  }
}

/**
 * 根据 ID 获取专注事项
 */
export function getFocusItemById(id) {
  try {
    const stmt = db.prepare('SELECT * FROM focus_items WHERE id = ? AND is_deleted = 0')
    return stmt.get(id)
  } catch (error) {
    console.error('Error getting focus item:', error)
    return null
  }
}

/**
 * 创建专注事项
 */
export function createFocusItem(item) {
  try {
    const now = Math.floor(Date.now() / 1000)

    const stmt = db.prepare(`
      INSERT INTO focus_items (
        name, icon, color,
        work_duration, short_break, long_break, long_break_interval,
        total_focus_time, total_sessions,
        created_at, updated_at, is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, 0)
    `)

    const result = stmt.run(
      item.name,
      item.icon || '📊',
      item.color || '#1890ff',
      item.workDuration || 25,
      item.shortBreak || 5,
      item.longBreak || 15,
      item.longBreakInterval || 4,
      now,
      now
    )

    // 返回创建的记录
    return getFocusItemById(result.lastInsertRowid)
  } catch (error) {
    console.error('Error creating focus item:', error)
    return null
  }
}

/**
 * 更新专注事项
 */
export function updateFocusItem(id, updates) {
  try {
    const now = Math.floor(Date.now() / 1000)

    // 构建更新语句
    const fields = []
    const values = []

    if (updates.name !== undefined) {
      fields.push('name = ?')
      values.push(updates.name)
    }
    if (updates.icon !== undefined) {
      fields.push('icon = ?')
      values.push(updates.icon)
    }
    if (updates.color !== undefined) {
      fields.push('color = ?')
      values.push(updates.color)
    }
    if (updates.workDuration !== undefined) {
      fields.push('work_duration = ?')
      values.push(updates.workDuration)
    }
    if (updates.shortBreak !== undefined) {
      fields.push('short_break = ?')
      values.push(updates.shortBreak)
    }
    if (updates.longBreak !== undefined) {
      fields.push('long_break = ?')
      values.push(updates.longBreak)
    }
    if (updates.longBreakInterval !== undefined) {
      fields.push('long_break_interval = ?')
      values.push(updates.longBreakInterval)
    }

    if (fields.length === 0) {
      return getFocusItemById(id)
    }

    fields.push('updated_at = ?')
    values.push(now)
    values.push(id)

    const stmt = db.prepare(`
      UPDATE focus_items
      SET ${fields.join(', ')}
      WHERE id = ? AND is_deleted = 0
    `)

    stmt.run(...values)

    return getFocusItemById(id)
  } catch (error) {
    console.error('Error updating focus item:', error)
    return null
  }
}

/**
 * 删除专注事项 (软删除)
 */
export function deleteFocusItem(id) {
  try {
    const now = Math.floor(Date.now() / 1000)

    const stmt = db.prepare(`
      UPDATE focus_items
      SET is_deleted = 1, updated_at = ?
      WHERE id = ?
    `)

    const result = stmt.run(now, id)

    return result.changes > 0
  } catch (error) {
    console.error('Error deleting focus item:', error)
    return false
  }
}

/**
 * 更新专注事项统计数据
 */
export function updateFocusItemStats(id, focusTime, sessionCount = 1) {
  try {
    const stmt = db.prepare(`
      UPDATE focus_items
      SET
        total_focus_time = total_focus_time + ?,
        total_sessions = total_sessions + ?,
        updated_at = ?
      WHERE id = ? AND is_deleted = 0
    `)

    const now = Math.floor(Date.now() / 1000)
    const result = stmt.run(focusTime, sessionCount, now, id)

    return result.changes > 0
  } catch (error) {
    console.error('Error updating focus item stats:', error)
    return false
  }
}

/**
 * 获取设置
 */
export function getSettings() {
  try {
    const stmt = db.prepare('SELECT key, value FROM settings')
    const rows = stmt.all()

    const settings = {}
    rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value)
      } catch {
        settings[row.key] = row.value
      }
    })

    return settings
  } catch (error) {
    console.error('Error getting settings:', error)
    return {}
  }
}

/**
 * 更新设置
 */
export function updateSettings(settings) {
  try {
    const now = Math.floor(Date.now() / 1000)

    Object.entries(settings).forEach(([key, value]) => {
      const stmt = db.prepare(`
        INSERT INTO settings (key, value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
      `)

      stmt.run(key, JSON.stringify(value), now)
    })

    return getSettings()
  } catch (error) {
    console.error('Error updating settings:', error)
    return null
  }
}

/**
 * 获取数据库文件路径 (用于调试)
 */
export function getDatabasePath() {
  return getDatabaseFilePath()
}

/**
 * 关闭数据库连接
 */
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}
