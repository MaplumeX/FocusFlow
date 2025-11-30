/**
 * FocusFlow - Electron 主进程入口
 *
 * 功能:
 * - 创建应用窗口
 * - 管理应用生命周期
 * - 初始化数据库
 * - 注册 IPC 处理器
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { initDatabase } from './database.js'
import { registerIpcHandlers } from './ipc.js'

let mainWindow = null

/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      // 安全配置 - 遵循红线要求
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js')
    },
    // 窗口配置
    title: 'FocusFlow',
    backgroundColor: '#ffffff',
    show: false
  })

  // 窗口准备好后再显示(避免闪烁)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 加载应用
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 应用准备就绪
app.whenReady().then(() => {
  // 初始化数据库
  initDatabase()

  // 注册 IPC 处理器
  registerIpcHandlers()

  // 创建窗口
  createWindow()

  // macOS 特殊处理
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 所有窗口关闭
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
