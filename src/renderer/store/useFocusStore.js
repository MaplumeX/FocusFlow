/**
 * FocusFlow - 专注事项状态管理
 *
 * 功能:
 * - 管理专注事项列表
 * - 处理事项的增删改查
 * - 管理当前选中的事项
 * - 与 IPC 通信进行数据持久化
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import { create } from 'zustand'
import useSessionStore from './useSessionStore'
import useTimerStore, { TIMER_STATUS } from './useTimerStore'

const useFocusStore = create((set, get) => ({
  // 状态
  items: [],
  selectedItem: null,
  loading: false,
  error: null,

  /**
   * 加载所有专注事项
   */
  loadItems: async () => {
    set({ loading: true, error: null })

    try {
      const result = await window.api.getFocusItems()

      if (result.success) {
        set({ items: result.data, loading: false })
      } else {
        set({ error: result.error, loading: false })
      }
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  /**
   * 创建新的专注事项
   * @param {Object} itemData - 事项数据
   * @returns {Promise<boolean>} 是否成功
   */
  createItem: async (itemData) => {
    set({ loading: true, error: null })

    try {
      const result = await window.api.createFocusItem(itemData)

      if (result.success) {
        // 重新加载列表
        await get().loadItems()
        return true
      } else {
        set({ error: result.error, loading: false })
        return false
      }
    } catch (error) {
      set({ error: error.message, loading: false })
      return false
    }
  },

  /**
   * 更新专注事项
   * @param {number} id - 事项 ID
   * @param {Object} updates - 更新的数据
   * @returns {Promise<boolean>} 是否成功
   */
  updateItem: async (id, updates) => {
    set({ loading: true, error: null })

    try {
      const result = await window.api.updateFocusItem(id, updates)

      if (result.success) {
        // 重新加载列表
        await get().loadItems()

        // 如果更新的是当前选中项,也更新选中项
        if (get().selectedItem?.id === id) {
          set({ selectedItem: result.data })
        }

        // 如果更新的是当前会话使用的事项, 同步更新 sessionStore
        const sessionStore = useSessionStore.getState()
        if (sessionStore.focusItem?.id === id) {
          sessionStore.updateFocusItemInfo(result.data)
        }

        // 如果更新的是当前计时器使用的事项, 同步更新 timerStore
        const timerStore = useTimerStore.getState()
        if (timerStore.currentItem?.id === id && typeof timerStore.updateCurrentItemInfo === 'function') {
          timerStore.updateCurrentItemInfo(result.data)
        }

        return true
      } else {
        set({ error: result.error, loading: false })
        return false
      }
    } catch (error) {
      set({ error: error.message, loading: false })
      return false
    }
  },

  /**
   * 删除专注事项
   * @param {number} id - 事项 ID
   * @returns {Promise<boolean>} 是否成功
   */
  deleteItem: async (id) => {
    // 检查该事项是否正在使用中
    const sessionStore = useSessionStore.getState()
    const timerStore = useTimerStore.getState()

    // 如果有活动会话且正在使用该事项
    if (sessionStore.sessionId && sessionStore.focusItem?.id === id) {
      set({
        error: '该专注事项正在使用中，请先停止当前会话再删除',
        loading: false
      })
      return false
    }

    // 如果计时器正在运行且使用该事项
    if (timerStore.status !== TIMER_STATUS.IDLE && timerStore.currentItem?.id === id) {
      set({
        error: '该专注事项的计时器正在运行中，请先停止计时再删除',
        loading: false
      })
      return false
    }

    set({ loading: true, error: null })

    try {
      const result = await window.api.deleteFocusItem(id)

      if (result.success) {
        // 如果删除的是当前选中项,清空选中
        if (get().selectedItem?.id === id) {
          set({ selectedItem: null })
        }

        // 重新加载列表
        await get().loadItems()
        return true
      } else {
        set({ error: result.error, loading: false })
        return false
      }
    } catch (error) {
      set({ error: error.message, loading: false })
      return false
    }
  },

  /**
   * 选择专注事项
   * @param {Object|null} item - 要选择的事项,null 表示取消选择
   */
  selectItem: (item) => {
    set({ selectedItem: item })
  },

  /**
   * 根据 ID 获取事项
   * @param {number} id - 事项 ID
   * @returns {Object|null} 事项对象
   */
  getItemById: (id) => {
    return get().items.find(item => item.id === id) || null
  },

  /**
   * 清除错误信息
   */
  clearError: () => {
    set({ error: null })
  }
}))

export default useFocusStore
