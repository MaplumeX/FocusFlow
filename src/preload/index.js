/**
 * FocusFlow - Preload 脚本
 *
 * 功能:
 * - 安全地暴露主进程 API 到渲染进程
 * - 使用 contextBridge 进行隔离
 * - 会话管理 API (Phase 2)
 * - 统计查询 API (Phase 3)
 *
 * 安全规则(红线要求):
 * - 不暴露 Node.js API
 * - 不暴露 require
 * - 仅暴露必要的应用 API
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 * @updated 2025-11-30 (Phase 2: 添加会话管理 API)
 * @updated 2025-11-30 (Phase 3: 添加统计查询 API)
 */

import { contextBridge, ipcRenderer } from 'electron'

/**
 * 暴露安全的 API 到渲染进程
 */
contextBridge.exposeInMainWorld('api', {
  // 专注事项管理
  getFocusItems: () => ipcRenderer.invoke('get-focus-items'),
  createFocusItem: (item) => ipcRenderer.invoke('create-focus-item', item),
  updateFocusItem: (id, item) => ipcRenderer.invoke('update-focus-item', id, item),
  deleteFocusItem: (id) => ipcRenderer.invoke('delete-focus-item', id),
  updateFocusItemStats: (id, focusTime, sessionCount) =>
    ipcRenderer.invoke('update-focus-item-stats', id, focusTime, sessionCount),

  // 设置管理
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),

  // 系统通知
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),

  // 会话管理 (Phase 2)
  createSession: (sessionData) => ipcRenderer.invoke('create-session', sessionData),
  getSession: (id) => ipcRenderer.invoke('get-session', id),
  getActiveSession: () => ipcRenderer.invoke('get-active-session'),
  endSession: (sessionId) => ipcRenderer.invoke('end-session', sessionId),
  updateSessionPomodoroCount: (sessionId, isCompleted) =>
    ipcRenderer.invoke('update-session-pomodoro-count', sessionId, isCompleted),

  // 番茄钟记录 (Phase 2)
  createPomodoroRecord: (recordData) => ipcRenderer.invoke('create-pomodoro-record', recordData),
  updatePomodoroRecord: (recordId, updates) =>
    ipcRenderer.invoke('update-pomodoro-record', recordId, updates),
  getSessionPomodoroRecords: (sessionId) =>
    ipcRenderer.invoke('get-session-pomodoro-records', sessionId),

  // 今日统计 (Phase 2)
  getTodayStats: () => ipcRenderer.invoke('get-today-stats'),

  // 统计查询 (Phase 3)
  getSessionsByDateRange: (startTime, endTime) =>
    ipcRenderer.invoke('get-sessions-by-date-range', startTime, endTime),
  getPomodoroRecordsByDateRange: (startTime, endTime) =>
    ipcRenderer.invoke('get-pomodoro-records-by-date-range', startTime, endTime),
  getSessionsByItem: (itemId, limit) =>
    ipcRenderer.invoke('get-sessions-by-item', itemId, limit),
  getStatsByItem: (startTime, endTime) =>
    ipcRenderer.invoke('get-stats-by-item', startTime, endTime),
  getDailyStats: (startTime, endTime) =>
    ipcRenderer.invoke('get-daily-stats', startTime, endTime)
})
