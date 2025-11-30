/**
 * FocusFlow - Preload 脚本
 *
 * 功能:
 * - 安全地暴露主进程 API 到渲染进程
 * - 使用 contextBridge 进行隔离
 *
 * 安全规则(红线要求):
 * - 不暴露 Node.js API
 * - 不暴露 require
 * - 仅暴露必要的应用 API
 *
 * @author FocusFlow Team
 * @created 2025-11-30
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

  // 设置管理(Phase 1 暂不实现)
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),

  // 系统通知
  showNotification: (options) => ipcRenderer.invoke('show-notification', options)
})
