/**
 * FocusFlow - IPC 处理器
 *
 * 功能:
 * - 注册所有 IPC 处理器
 * - 连接主进程和渲染进程
 * - 处理数据库操作请求
 * - 会话管理 (Phase 2)
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 * @updated 2025-11-30 (Phase 2: 添加会话管理)
 */

import { ipcMain } from 'electron'
import {
  getFocusItems,
  getFocusItemById,
  createFocusItem,
  updateFocusItem,
  deleteFocusItem,
  updateFocusItemStats,
  getSettings,
  updateSettings,
  getDatabasePath,
  // Phase 2: 会话管理
  createSession,
  getSessionById,
  getActiveSession,
  endSession,
  updateSessionPomodoroCount,
  createPomodoroRecord,
  updatePomodoroRecord,
  getSessionPomodoroRecords,
  getTodayStats,
  // Phase 3: 统计查询
  getSessionsByDateRange,
  getPomodoroRecordsByDateRange,
  getSessionsByItem,
  getStatsByItem,
  getDailyStats,
  // 事务性复合操作
  completePomodoroWithStats,
  endSessionWithPomodoro
} from './database.js'

/**
 * 注册所有 IPC 处理器
 */
export function registerIpcHandlers() {
  // ==================== 专注事项管理 ====================

  // 获取所有专注事项
  ipcMain.handle('get-focus-items', () => {
    try {
      return { success: true, data: getFocusItems() }
    } catch (error) {
      console.error('Error getting focus items:', error)
      return { success: false, error: error.message }
    }
  })

  // 根据 ID 获取专注事项
  ipcMain.handle('get-focus-item', (event, id) => {
    try {
      const item = getFocusItemById(id)
      if (!item) {
        return { success: false, error: 'Focus item not found' }
      }
      return { success: true, data: item }
    } catch (error) {
      console.error('Error getting focus item:', error)
      return { success: false, error: error.message }
    }
  })

  // 创建专注事项
  ipcMain.handle('create-focus-item', (event, item) => {
    try {
      // 验证必填字段
      if (!item || !item.name) {
        return { success: false, error: 'Item name is required' }
      }

      const newItem = createFocusItem(item)
      return { success: true, data: newItem }
    } catch (error) {
      console.error('Error creating focus item:', error)
      return { success: false, error: error.message }
    }
  })

  // 更新专注事项
  ipcMain.handle('update-focus-item', (event, id, updates) => {
    try {
      const updatedItem = updateFocusItem(id, updates)
      if (!updatedItem) {
        return { success: false, error: 'Focus item not found' }
      }
      return { success: true, data: updatedItem }
    } catch (error) {
      console.error('Error updating focus item:', error)
      return { success: false, error: error.message }
    }
  })

  // 删除专注事项
  ipcMain.handle('delete-focus-item', (event, id) => {
    try {
      const success = deleteFocusItem(id)
      if (!success) {
        return { success: false, error: 'Focus item not found' }
      }
      return { success: true }
    } catch (error) {
      console.error('Error deleting focus item:', error)
      return { success: false, error: error.message }
    }
  })

  // 更新专注事项统计数据
  ipcMain.handle('update-focus-item-stats', (event, id, focusTime, sessionCount) => {
    try {
      const success = updateFocusItemStats(id, focusTime, sessionCount)
      if (!success) {
        return { success: false, error: 'Failed to update stats' }
      }
      return { success: true }
    } catch (error) {
      console.error('Error updating focus item stats:', error)
      return { success: false, error: error.message }
    }
  })

  // ==================== 设置管理 ====================

  // 获取设置
  ipcMain.handle('get-settings', () => {
    try {
      return { success: true, data: getSettings() }
    } catch (error) {
      console.error('Error getting settings:', error)
      return { success: false, error: error.message }
    }
  })

  // 更新设置
  ipcMain.handle('update-settings', (event, settings) => {
    try {
      const updatedSettings = updateSettings(settings)
      return { success: true, data: updatedSettings }
    } catch (error) {
      console.error('Error updating settings:', error)
      return { success: false, error: error.message }
    }
  })

  // ==================== 系统通知 ====================

  // 显示系统通知
  ipcMain.handle('show-notification', (event, options) => {
    try {
      const { Notification } = require('electron')

      if (!Notification.isSupported()) {
        return { success: false, error: 'Notifications not supported' }
      }

      const notification = new Notification({
        title: options.title || 'FocusFlow',
        body: options.body || '',
        icon: options.icon,
        silent: options.silent || false
      })

      notification.show()

      return { success: true }
    } catch (error) {
      console.error('Error showing notification:', error)
      return { success: false, error: error.message }
    }
  })

  // ==================== 调试工具 ====================

  // 获取数据库文件路径
  ipcMain.handle('get-database-path', () => {
    try {
      return { success: true, data: getDatabasePath() }
    } catch (error) {
      console.error('Error getting database path:', error)
      return { success: false, error: error.message }
    }
  })

  // ==================== 会话管理 (Phase 2) ====================

  // 创建专注会话
  ipcMain.handle('create-session', (event, sessionData) => {
    try {
      if (!sessionData || !sessionData.focusItemId || !sessionData.config) {
        return { success: false, error: 'Invalid session data' }
      }

      const session = createSession(sessionData)
      if (!session) {
        return { success: false, error: 'Failed to create session' }
      }

      return { success: true, data: session }
    } catch (error) {
      console.error('Error creating session:', error)
      return { success: false, error: error.message }
    }
  })

  // 根据 ID 获取会话
  ipcMain.handle('get-session', (event, id) => {
    try {
      const session = getSessionById(id)
      if (!session) {
        return { success: false, error: 'Session not found' }
      }
      return { success: true, data: session }
    } catch (error) {
      console.error('Error getting session:', error)
      return { success: false, error: error.message }
    }
  })

  // 获取活动会话
  ipcMain.handle('get-active-session', () => {
    try {
      const session = getActiveSession()
      return { success: true, data: session }
    } catch (error) {
      console.error('Error getting active session:', error)
      return { success: false, error: error.message }
    }
  })

  // 结束会话
  ipcMain.handle('end-session', (event, sessionId) => {
    try {
      const success = endSession(sessionId)
      if (!success) {
        return { success: false, error: 'Failed to end session' }
      }
      return { success: true }
    } catch (error) {
      console.error('Error ending session:', error)
      return { success: false, error: error.message }
    }
  })

  // 更新会话番茄钟计数
  ipcMain.handle('update-session-pomodoro-count', (event, sessionId, isCompleted) => {
    try {
      const success = updateSessionPomodoroCount(sessionId, isCompleted)
      if (!success) {
        return { success: false, error: 'Failed to update pomodoro count' }
      }
      return { success: true }
    } catch (error) {
      console.error('Error updating session pomodoro count:', error)
      return { success: false, error: error.message }
    }
  })

  // 创建番茄钟记录
  ipcMain.handle('create-pomodoro-record', (event, recordData) => {
    try {
      if (!recordData || !recordData.sessionId || !recordData.focusItemId) {
        return { success: false, error: 'Invalid pomodoro record data' }
      }

      const recordId = createPomodoroRecord(recordData)
      if (!recordId) {
        return { success: false, error: 'Failed to create pomodoro record' }
      }

      return { success: true, data: recordId }
    } catch (error) {
      console.error('Error creating pomodoro record:', error)
      return { success: false, error: error.message }
    }
  })

  // 更新番茄钟记录
  ipcMain.handle('update-pomodoro-record', (event, recordId, updates) => {
    try {
      const success = updatePomodoroRecord(recordId, updates)
      if (!success) {
        return { success: false, error: 'Failed to update pomodoro record' }
      }
      return { success: true }
    } catch (error) {
      console.error('Error updating pomodoro record:', error)
      return { success: false, error: error.message }
    }
  })

  // 获取会话的番茄钟记录
  ipcMain.handle('get-session-pomodoro-records', (event, sessionId) => {
    try {
      const records = getSessionPomodoroRecords(sessionId)
      return { success: true, data: records }
    } catch (error) {
      console.error('Error getting session pomodoro records:', error)
      return { success: false, error: error.message }
    }
  })

  // 获取今日统计
  ipcMain.handle('get-today-stats', () => {
    try {
      const stats = getTodayStats()
      return { success: true, data: stats }
    } catch (error) {
      console.error('Error getting today stats:', error)
      return { success: false, error: error.message }
    }
  })

  // ==================== 统计查询 (Phase 3) ====================

  // 获取指定时间范围内的会话列表
  ipcMain.handle('get-sessions-by-date-range', (event, startTime, endTime) => {
    try {
      if (!startTime || !endTime) {
        return { success: false, error: 'Invalid time range' }
      }

      const sessions = getSessionsByDateRange(startTime, endTime)
      return { success: true, data: sessions }
    } catch (error) {
      console.error('Error getting sessions by date range:', error)
      return { success: false, error: error.message }
    }
  })

  // 获取指定时间范围内的番茄钟记录
  ipcMain.handle('get-pomodoro-records-by-date-range', (event, startTime, endTime) => {
    try {
      if (!startTime || !endTime) {
        return { success: false, error: 'Invalid time range' }
      }

      const records = getPomodoroRecordsByDateRange(startTime, endTime)
      return { success: true, data: records }
    } catch (error) {
      console.error('Error getting pomodoro records by date range:', error)
      return { success: false, error: error.message }
    }
  })

  // 获取指定专注事项的会话列表
  ipcMain.handle('get-sessions-by-item', (event, itemId, limit = null) => {
    try {
      if (!itemId) {
        return { success: false, error: 'Invalid item ID' }
      }

      const sessions = getSessionsByItem(itemId, limit)
      return { success: true, data: sessions }
    } catch (error) {
      console.error('Error getting sessions by item:', error)
      return { success: false, error: error.message }
    }
  })

  // 获取按事项分组的统计
  ipcMain.handle('get-stats-by-item', (event, startTime, endTime) => {
    try {
      if (!startTime || !endTime) {
        return { success: false, error: 'Invalid time range' }
      }

      const stats = getStatsByItem(startTime, endTime)
      return { success: true, data: stats }
    } catch (error) {
      console.error('Error getting stats by item:', error)
      return { success: false, error: error.message }
    }
  })

  // 获取每日统计数据
  ipcMain.handle('get-daily-stats', (event, startTime, endTime) => {
    try {
      if (!startTime || !endTime) {
        return { success: false, error: 'Invalid time range' }
      }

      const stats = getDailyStats(startTime, endTime)
      return { success: true, data: stats }
    } catch (error) {
      console.error('Error getting daily stats:', error)
      return { success: false, error: error.message }
    }
  })

  // ==================== 事务性复合操作 ====================

  // 在事务中完成番茄钟并更新统计
  ipcMain.handle('complete-pomodoro-with-stats', (event, params) => {
    try {
      if (!params || !params.recordId || !params.focusItemId || !params.sessionId) {
        return { success: false, error: 'Invalid parameters' }
      }

      const success = completePomodoroWithStats(params)
      return { success }
    } catch (error) {
      console.error('Error completing pomodoro with stats:', error)
      return { success: false, error: error.message }
    }
  })

  // 在事务中结束会话并完成当前番茄钟
  ipcMain.handle('end-session-with-pomodoro', (event, params) => {
    try {
      if (!params || !params.sessionId || !params.endTime) {
        return { success: false, error: 'Invalid parameters' }
      }

      const success = endSessionWithPomodoro(params)
      return { success }
    } catch (error) {
      console.error('Error ending session with pomodoro:', error)
      return { success: false, error: error.message }
    }
  })

  console.log('IPC handlers registered successfully (with Phase 2 session management & Phase 3 statistics)')
}
