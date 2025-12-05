/**
 * FocusFlow - 同步状态管理
 *
 * 功能：
 * - 管理同步状态
 * - 触发同步操作
 * - 管理最后同步时间
 *
 * @author FocusFlow Team
 * @created 2025-12-04
 */

import { create } from 'zustand'
import { fullSync, incrementalSync, SyncStatus } from '../utils/sync'
import { isOnline, watchNetworkStatus } from '../utils/network'

const useSyncStore = create((set, get) => ({
  // 状态
  status: SyncStatus.IDLE,
  lastSyncTime: null,
  isOnline: isOnline(),
  error: null,
  stats: {
    itemsUploaded: 0,
    sessionsUploaded: 0,
    recordsUploaded: 0
  },

  // 定时器ID
  syncIntervalId: null,

  /**
   * 初始化同步
   */
  initSync: () => {
    // 监听网络状态
    const cleanup = watchNetworkStatus(
      () => {
        set({ isOnline: true })
        // 网络恢复时自动同步
        const { isAuthenticated } = get()
        if (isAuthenticated) {
          get().sync()
        }
      },
      () => {
        set({ isOnline: false })
      }
    )

    // 启动定时同步 (每5分钟)
    const intervalId = setInterval(() => {
      const { isOnline, isAuthenticated } = get()
      if (isOnline && isAuthenticated) {
        get().sync()
      }
    }, 5 * 60 * 1000) // 5分钟

    set({ syncIntervalId: intervalId })

    // 返回清理函数
    return () => {
      cleanup()
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  },

  /**
   * 执行同步
   *
   * @param {object} user - 当前用户
   * @param {boolean} force - 是否强制全量同步
   */
  sync: async (user, force = false) => {
    const { status, lastSyncTime, isOnline: online } = get()

    // 检查条件
    if (!online) {
      set({ error: '网络未连接' })
      return { success: false, error: '网络未连接' }
    }

    if (!user) {
      set({ error: '用户未登录' })
      return { success: false, error: '用户未登录' }
    }

    if (status === SyncStatus.SYNCING) {
      return { success: false, error: '正在同步中' }
    }

    try {
      set({ status: SyncStatus.SYNCING, error: null })

      let result

      // 首次同步或强制全量同步
      if (!lastSyncTime || force) {
        result = await fullSync(user)
      } else {
        // 增量同步
        result = await incrementalSync(user, lastSyncTime)
      }

      if (result.success) {
        const now = Math.floor(Date.now() / 1000)
        set({
          status: SyncStatus.SUCCESS,
          lastSyncTime: now,
          stats: result.stats,
          error: null
        })

        // 保存同步时间到本地
        localStorage.setItem('lastSyncTime', now.toString())

        return { success: true }
      } else {
        set({
          status: SyncStatus.ERROR,
          error: result.error
        })

        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('同步失败:', error)
      set({
        status: SyncStatus.ERROR,
        error: error.message
      })

      return { success: false, error: error.message }
    }
  },

  /**
   * 恢复最后同步时间
   */
  restoreLastSyncTime: () => {
    const saved = localStorage.getItem('lastSyncTime')
    if (saved) {
      set({ lastSyncTime: parseInt(saved) })
    }
  },

  /**
   * 重置同步状态
   */
  resetSync: () => {
    const { syncIntervalId } = get()
    if (syncIntervalId) {
      clearInterval(syncIntervalId)
    }

    set({
      status: SyncStatus.IDLE,
      lastSyncTime: null,
      error: null,
      stats: {
        itemsUploaded: 0,
        sessionsUploaded: 0,
        recordsUploaded: 0
      },
      syncIntervalId: null
    })

    localStorage.removeItem('lastSyncTime')
  },

  /**
   * 清除错误
   */
  clearError: () => {
    set({ error: null })
  }
}))

export default useSyncStore
