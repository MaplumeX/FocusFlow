/**
 * FocusFlow - 数据库操作封装 (SQLite 版本)
 *
 * 功能:
 * - 初始化 SQLite 数据库
 * - 专注事项 CRUD 操作
 * - 会话管理操作 (Phase 2)
 * - 番茄钟记录操作 (Phase 2)
 * - 设置管理
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 * @updated 2025-11-30 (Phase 2: 添加会话管理, 精简番茄钟记录结构仅保留工作时段)
 */

import { app } from 'electron'
import { join } from 'path'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'

let db = null

/**
 * 执行事务
 * @param {Function} callback - 事务中要执行的操作
 * @returns {*} callback 的返回值
 * @throws {Error} 如果事务失败
 */
export function runInTransaction(callback) {
  if (!db) {
    throw new Error('Database not initialized')
  }

  const transaction = db.transaction(callback)
  return transaction()
}

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

    // 构建专注事项表更新语句
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

    // 如果有配置相关字段更新, 同步更新当前活动会话的配置快照
    const sessionFields = []
    const sessionValues = []

    if (updates.workDuration !== undefined) {
      sessionFields.push('config_work_duration = ?')
      sessionValues.push(updates.workDuration)
    }
    if (updates.shortBreak !== undefined) {
      sessionFields.push('config_short_break = ?')
      sessionValues.push(updates.shortBreak)
    }
    if (updates.longBreak !== undefined) {
      sessionFields.push('config_long_break = ?')
      sessionValues.push(updates.longBreak)
    }
    if (updates.longBreakInterval !== undefined) {
      sessionFields.push('config_long_break_interval = ?')
      sessionValues.push(updates.longBreakInterval)
    }

    if (sessionFields.length > 0) {
      sessionValues.push(id)

      const updateSessionStmt = db.prepare(`
        UPDATE focus_sessions
        SET ${sessionFields.join(', ')}
        WHERE focus_item_id = ? AND is_active = 1
      `)

      updateSessionStmt.run(...sessionValues)
    }

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

// ============================================
// 会话管理操作 (Phase 2)
// ============================================

/**
 * 创建专注会话
 * @param {Object} sessionData - 会话数据
 * @param {number} sessionData.focusItemId - 专注事项 ID
 * @param {Object} sessionData.config - 配置快照
 */
export function createSession(sessionData) {
  try {
    const now = Math.floor(Date.now() / 1000)

    const stmt = db.prepare(`
      INSERT INTO focus_sessions (
        focus_item_id,
        config_work_duration,
        config_short_break,
        config_long_break,
        config_long_break_interval,
        is_active,
        total_pomodoros,
        completed_pomodoros,
        started_at
      ) VALUES (?, ?, ?, ?, ?, 1, 0, 0, ?)
    `)

    const result = stmt.run(
      sessionData.focusItemId,
      sessionData.config.workDuration,
      sessionData.config.shortBreak,
      sessionData.config.longBreak,
      sessionData.config.longBreakInterval,
      now
    )

    return getSessionById(result.lastInsertRowid)
  } catch (error) {
    console.error('Error creating session:', error)
    return null
  }
}

/**
 * 根据 ID 获取会话
 */
export function getSessionById(id) {
  try {
    const stmt = db.prepare('SELECT * FROM focus_sessions WHERE id = ?')
    return stmt.get(id)
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

/**
 * 获取当前活动会话
 */
export function getActiveSession() {
  try {
    const stmt = db.prepare('SELECT * FROM focus_sessions WHERE is_active = 1 ORDER BY started_at DESC LIMIT 1')
    return stmt.get()
  } catch (error) {
    console.error('Error getting active session:', error)
    return null
  }
}

/**
 * 结束会话
 * @param {number} sessionId - 会话 ID
 */
export function endSession(sessionId) {
  try {
    const now = Math.floor(Date.now() / 1000)

    const stmt = db.prepare(`
      UPDATE focus_sessions
      SET is_active = 0, ended_at = ?
      WHERE id = ?
    `)

    const result = stmt.run(now, sessionId)

    return result.changes > 0
  } catch (error) {
    console.error('Error ending session:', error)
    return false
  }
}

/**
 * 更新会话番茄钟计数
 * @param {number} sessionId - 会话 ID
 * @param {boolean} isCompleted - 是否完整完成
 */
export function updateSessionPomodoroCount(sessionId, isCompleted = true) {
  try {
    const stmt = db.prepare(`
      UPDATE focus_sessions
      SET
        total_pomodoros = total_pomodoros + 1,
        completed_pomodoros = completed_pomodoros + ?
      WHERE id = ?
    `)

    const result = stmt.run(isCompleted ? 1 : 0, sessionId)

    return result.changes > 0
  } catch (error) {
    console.error('Error updating session pomodoro count:', error)
    return false
  }
}

/**
 * 创建番茄钟记录
 * @param {Object} recordData - 番茄钟数据
 */
export function createPomodoroRecord(recordData) {
  try {
    const stmt = db.prepare(`
      INSERT INTO pomodoro_records (
        session_id,
        focus_item_id,
        duration,
        is_completed,
        start_time,
        end_time
      ) VALUES (?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      recordData.sessionId,
      recordData.focusItemId,
      recordData.duration,
      recordData.isCompleted ? 1 : 0,
      recordData.startTime,
      recordData.endTime
    )

    return result.lastInsertRowid
  } catch (error) {
    console.error('Error creating pomodoro record:', error)
    return null
  }
}

/**
 * 更新番茄钟记录
 * @param {number} recordId - 记录 ID
 * @param {Object} updates - 更新数据
 */
export function updatePomodoroRecord(recordId, updates) {
  try {
    const fields = []
    const values = []

    if (updates.endTime !== undefined) {
      fields.push('end_time = ?')
      values.push(updates.endTime)
    }
    if (updates.duration !== undefined) {
      fields.push('duration = ?')
      values.push(updates.duration)
    }
    if (updates.isCompleted !== undefined) {
      fields.push('is_completed = ?')
      values.push(updates.isCompleted ? 1 : 0)
    }

    if (fields.length === 0) {
      return true
    }

    values.push(recordId)

    const stmt = db.prepare(`
      UPDATE pomodoro_records
      SET ${fields.join(', ')}
      WHERE id = ?
    `)

    const result = stmt.run(...values)

    return result.changes > 0
  } catch (error) {
    console.error('Error updating pomodoro record:', error)
    return false
  }
}

/**
 * 获取会话的所有番茄钟记录
 * @param {number} sessionId - 会话 ID
 */
export function getSessionPomodoroRecords(sessionId) {
  try {
    const stmt = db.prepare('SELECT * FROM pomodoro_records WHERE session_id = ? ORDER BY start_time ASC')
    return stmt.all(sessionId)
  } catch (error) {
    console.error('Error getting session pomodoro records:', error)
    return []
  }
}

/**
 * 获取今日专注统计
 */
export function getTodayStats() {
  try {
    // 获取今天的开始时间戳 (00:00:00)
    const todayStart = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000)

    // 统计今日番茄钟记录
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as totalPomodoros,
        SUM(duration) as totalFocusTime,
        COUNT(DISTINCT session_id) as totalSessions
      FROM pomodoro_records
      WHERE start_time >= ? AND is_completed = 1
    `)

    return stmt.get(todayStart)
  } catch (error) {
    console.error('Error getting today stats:', error)
    return {
      totalPomodoros: 0,
      totalFocusTime: 0,
      totalSessions: 0
    }
  }
}

// ============================================
// 统计查询操作 (Phase 3)
// ============================================

/**
 * 获取指定时间范围内的会话列表
 * @param {number} startTime - 开始时间戳(秒)
 * @param {number} endTime - 结束时间戳(秒)
 */
export function getSessionsByDateRange(startTime, endTime) {
  try {
    const stmt = db.prepare(`
      SELECT s.*, i.name as item_name, i.icon as item_icon, i.color as item_color
      FROM focus_sessions s
      LEFT JOIN focus_items i ON s.focus_item_id = i.id
      WHERE s.started_at >= ? AND s.started_at < ?
      ORDER BY s.started_at DESC
    `)

    return stmt.all(startTime, endTime)
  } catch (error) {
    console.error('Error getting sessions by date range:', error)
    return []
  }
}

/**
 * 获取指定时间范围内的番茄钟记录
 * @param {number} startTime - 开始时间戳(秒)
 * @param {number} endTime - 结束时间戳(秒)
 */
export function getPomodoroRecordsByDateRange(startTime, endTime) {
  try {
    const stmt = db.prepare(`
      SELECT pr.*, s.focus_item_id, i.name as item_name, i.icon as item_icon, i.color as item_color
      FROM pomodoro_records pr
      LEFT JOIN focus_sessions s ON pr.session_id = s.id
      LEFT JOIN focus_items i ON s.focus_item_id = i.id
      WHERE pr.start_time >= ? AND pr.start_time < ?
      ORDER BY pr.start_time DESC
    `)

    return stmt.all(startTime, endTime)
  } catch (error) {
    console.error('Error getting pomodoro records by date range:', error)
    return []
  }
}

/**
 * 获取指定专注事项的会话列表
 * @param {number} itemId - 专注事项 ID
 * @param {number} limit - 限制数量(可选)
 */
export function getSessionsByItem(itemId, limit = null) {
  try {
    let query = `
      SELECT s.*, i.name as item_name, i.icon as item_icon, i.color as item_color
      FROM focus_sessions s
      LEFT JOIN focus_items i ON s.focus_item_id = i.id
      WHERE s.focus_item_id = ?
      ORDER BY s.started_at DESC
    `

    if (limit) {
      query += ` LIMIT ${limit}`
    }

    const stmt = db.prepare(query)
    return stmt.all(itemId)
  } catch (error) {
    console.error('Error getting sessions by item:', error)
    return []
  }
}

/**
 * 获取指定时间范围内按事项分组的统计
 * @param {number} startTime - 开始时间戳(秒)
 * @param {number} endTime - 结束时间戳(秒)
 */
export function getStatsByItem(startTime, endTime) {
  try {
    const stmt = db.prepare(`
      SELECT
        i.id,
        i.name,
        i.icon,
        i.color,
        COUNT(DISTINCT s.id) as sessionCount,
        COUNT(DISTINCT pr.id) as pomodoroCount,
        SUM(pr.duration) as totalFocusTime
      FROM focus_items i
      LEFT JOIN focus_sessions s ON i.id = s.focus_item_id AND s.started_at >= ? AND s.started_at < ?
      LEFT JOIN pomodoro_records pr ON s.id = pr.session_id
      WHERE i.is_deleted = 0
      GROUP BY i.id
      HAVING sessionCount > 0
      ORDER BY totalFocusTime DESC
    `)

    // 仅按会话开始时间范围过滤,多余参数会导致 better-sqlite3 绑定错误
    return stmt.all(startTime, endTime)
  } catch (error) {
    console.error('Error getting stats by item:', error)
    return []
  }
}

/**
 * 获取指定时间范围内每日统计数据(用于趋势图)
 * @param {number} startTime - 开始时间戳(秒)
 * @param {number} endTime - 结束时间戳(秒)
 */
export function getDailyStats(startTime, endTime) {
  try {
    const stmt = db.prepare(`
      SELECT
        DATE(start_time, 'unixepoch', 'localtime') as date,
        COUNT(*) as pomodoroCount,
        SUM(duration) as focusTime,
        COUNT(DISTINCT session_id) as sessionCount
      FROM pomodoro_records
      WHERE start_time >= ? AND start_time < ?
      GROUP BY date
      ORDER BY date ASC
    `)

    return stmt.all(startTime, endTime)
  } catch (error) {
    console.error('Error getting daily stats:', error)
    return []
  }
}

// ============================================
// 事务性复合操作 (Transaction Compound Operations)
// ============================================

/**
 * 在事务中完成番茄钟并更新相关统计
 * 确保数据一致性：如果任何操作失败，所有更改都会回滚
 *
 * @param {Object} params - 参数
 * @param {number} params.recordId - 番茄钟记录 ID
 * @param {number} params.focusItemId - 专注事项 ID
 * @param {number} params.sessionId - 会话 ID
 * @param {number} params.endTime - 结束时间戳
 * @param {number} params.duration - 持续时间(秒)
 * @param {boolean} params.isCompleted - 是否完成
 * @param {boolean} params.isWork - 是否为工作时段
 * @returns {boolean} 是否成功
 */
export function completePomodoroWithStats(params) {
  try {
    return runInTransaction(() => {
      const {
        recordId,
        focusItemId,
        sessionId,
        endTime,
        duration,
        isCompleted,
        isWork
      } = params

      // 1. 更新番茄钟记录
      const updateRecord = db.prepare(`
        UPDATE pomodoro_records
        SET end_time = ?, duration = ?, is_completed = ?
        WHERE id = ?
      `)
      updateRecord.run(endTime, duration, isCompleted ? 1 : 0, recordId)

      // 2. 更新会话番茄钟计数
      const updateSession = db.prepare(`
        UPDATE focus_sessions
        SET
          total_pomodoros = total_pomodoros + 1,
          completed_pomodoros = completed_pomodoros + ?
        WHERE id = ?
      `)
      updateSession.run(isCompleted ? 1 : 0, sessionId)

      // 3. 如果是工作时段且完成了，更新专注事项统计
      if (isWork && isCompleted) {
        const now = Math.floor(Date.now() / 1000)
        const updateStats = db.prepare(`
          UPDATE focus_items
          SET
            total_focus_time = total_focus_time + ?,
            total_sessions = total_sessions + 1,
            updated_at = ?
          WHERE id = ? AND is_deleted = 0
        `)
        updateStats.run(duration, now, focusItemId)
      }

      return true
    })
  } catch (error) {
    console.error('Error completing pomodoro with stats:', error)
    return false
  }
}

/**
 * 在事务中结束会话并完成当前番茄钟
 *
 * @param {Object} params - 参数
 * @param {number} params.sessionId - 会话 ID
 * @param {number} params.currentPomodoroId - 当前番茄钟记录 ID (可选)
 * @param {number} params.endTime - 结束时间戳
 * @param {number} params.duration - 番茄钟持续时间(秒) (可选)
 * @param {boolean} params.isCompleted - 番茄钟是否完成 (可选)
 * @returns {boolean} 是否成功
 */
export function endSessionWithPomodoro(params) {
  try {
    return runInTransaction(() => {
      const { sessionId, currentPomodoroId, endTime, duration, isCompleted } = params

      // 1. 如果有当前番茄钟，先完成它
      if (currentPomodoroId) {
        const updatePomodoro = db.prepare(`
          UPDATE pomodoro_records
          SET end_time = ?, duration = ?, is_completed = ?
          WHERE id = ?
        `)
        updatePomodoro.run(endTime, duration || 0, isCompleted ? 1 : 0, currentPomodoroId)
      }

      // 2. 结束会话
      const updateSession = db.prepare(`
        UPDATE focus_sessions
        SET is_active = 0, ended_at = ?
        WHERE id = ?
      `)
      updateSession.run(endTime, sessionId)

      return true
    })
  } catch (error) {
    console.error('Error ending session with pomodoro:', error)
    return false
  }
}
