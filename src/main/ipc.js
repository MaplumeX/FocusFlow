/**
 * FocusFlow - IPC 处理器
 *
 * 功能:
 * - 注册所有 IPC 处理器
 * - 连接主进程和渲染进程
 * - 处理数据库操作请求
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import { ipcMain } from 'electron'
import {
  getFocusItems,
  getFocusItemById,
  createFocusItem,
  updateFocusItem,
  deleteFocusItem,
  getSettings,
  updateSettings,
  getDatabasePath
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

  console.log('IPC handlers registered successfully')
}
