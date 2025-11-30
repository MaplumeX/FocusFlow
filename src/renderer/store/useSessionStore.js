/**
 * FocusFlow - 会话状态管理
 *
 * 功能:
 * - 管理专注会话生命周期
 * - 实现会话状态机 (idle → work → break → work...)
 * - 记录番茄钟历史
 * - 自动休息管理
 *
 * 状态转换:
 * idle → work → short_break → work → short_break → work → long_break → work...
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import { create } from 'zustand'

// 会话状态枚举
const SESSION_STATE = {
  IDLE: 'idle',               // 空闲 (无活动会话)
  WORK: 'work',               // 工作中
  SHORT_BREAK: 'short_break', // 短休息
  LONG_BREAK: 'long_break',   // 长休息
  BREAK_END: 'break_end'      // 休息结束等待
}

const useSessionStore = create((set, get) => ({
  // 会话基本信息
  sessionId: null,           // 当前会话 ID
  focusItem: null,           // 当前专注事项
  sessionConfig: null,       // 会话配置快照
  state: SESSION_STATE.IDLE, // 当前状态
  lastBreakType: null,       // 上一个休息类型 ('short_break' | 'long_break')

  // 番茄钟计数
  completedPomodoros: 0,     // 本次会话已完成的番茄钟数
  currentPomodoroId: null,   // 当前番茄钟记录 ID
  currentPomodoroStart: null, // 当前番茄钟开始时间戳

  // 今日统计
  todayStats: {
    totalPomodoros: 0,
    totalFocusTime: 0,
    totalSessions: 0
  },

  /**
   * 开始新会话
   * @param {Object} item - 专注事项
   */
  startSession: async (item) => {
    try {
      // 保存配置快照
      const config = {
        workDuration: item.work_duration,
        shortBreak: item.short_break,
        longBreak: item.long_break,
        longBreakInterval: item.long_break_interval
      }

      // 创建会话记录
      const response = await window.api.createSession({
        focusItemId: item.id,
        config
      })

      if (!response.success) {
        console.error('创建会话失败:', response.error)
        return false
      }

      const session = response.data

      set({
        sessionId: session.id,
        focusItem: item,
        sessionConfig: config,
        state: SESSION_STATE.IDLE,
        completedPomodoros: 0,
        currentPomodoroId: null,
        currentPomodoroStart: null
      })

      // 刷新今日统计
      get().refreshTodayStats()

      return true
    } catch (error) {
      console.error('开始会话失败:', error)
      return false
    }
  },

  /**
   * 结束会话
   */
  endSession: async () => {
    const state = get()

    if (!state.sessionId) {
      return
    }

    try {
      // 如果有进行中的番茄钟,先结束它
      if (state.currentPomodoroId) {
        await get().finishCurrentPomodoro(false) // 未完成
      }

      // 结束会话
      await window.api.endSession(state.sessionId)

      // 更新专注事项统计
      // 这里可以基于会话数据更新,但 Phase 1 已经在 finish 时更新了

      set({
        sessionId: null,
        focusItem: null,
        sessionConfig: null,
        state: SESSION_STATE.IDLE,
        completedPomodoros: 0,
        currentPomodoroId: null,
        currentPomodoroStart: null,
        lastBreakType: null
      })

      // 刷新今日统计
      get().refreshTodayStats()
    } catch (error) {
      console.error('结束会话失败:', error)
    }
  },

  /**
   * 开始工作时段
   */
  startWork: async () => {
    const state = get()

    if (!state.sessionId) {
      console.error('没有活动会话')
      return false
    }

    try {
      // 创建工作番茄钟记录
      const startTime = Math.floor(Date.now() / 1000)

      const response = await window.api.createPomodoroRecord({
        sessionId: state.sessionId,
        focusItemId: state.focusItem.id,
        type: 'work',
        duration: 0, // 开始时为 0
        isCompleted: false,
        startTime,
        endTime: startTime // 临时值,完成时更新
      })

      if (!response.success) {
        console.error('创建番茄钟记录失败:', response.error)
        return false
      }

      set({
        state: SESSION_STATE.WORK,
        currentPomodoroId: response.data,
        currentPomodoroStart: startTime
      })

      return true
    } catch (error) {
      console.error('开始工作失败:', error)
      return false
    }
  },

  /**
   * 开始短休息
   */
  startShortBreak: async () => {
    const state = get()

    if (!state.sessionId) {
      return false
    }

    try {
      const startTime = Math.floor(Date.now() / 1000)

      const response = await window.api.createPomodoroRecord({
        sessionId: state.sessionId,
        focusItemId: state.focusItem.id,
        type: 'short_break',
        duration: 0,
        isCompleted: false,
        startTime,
        endTime: startTime
      })

      if (!response.success) {
        return false
      }

      set({
        state: SESSION_STATE.SHORT_BREAK,
        currentPomodoroId: response.data,
        currentPomodoroStart: startTime,
        lastBreakType: 'short_break'
      })

      return true
    } catch (error) {
      console.error('开始短休息失败:', error)
      return false
    }
  },

  /**
   * 开始长休息
   */
  startLongBreak: async () => {
    const state = get()

    if (!state.sessionId) {
      return false
    }

    try {
      const startTime = Math.floor(Date.now() / 1000)

      const response = await window.api.createPomodoroRecord({
        sessionId: state.sessionId,
        focusItemId: state.focusItem.id,
        type: 'long_break',
        duration: 0,
        isCompleted: false,
        startTime,
        endTime: startTime
      })

      if (!response.success) {
        return false
      }

      set({
        state: SESSION_STATE.LONG_BREAK,
        currentPomodoroId: response.data,
        currentPomodoroStart: startTime,
        lastBreakType: 'long_break'
      })

      return true
    } catch (error) {
      console.error('开始长休息失败:', error)
      return false
    }
  },

  /**
   * 完成当前番茄钟
   * @param {boolean} isCompleted - 是否完整完成
   */
  finishCurrentPomodoro: async (isCompleted = true) => {
    const state = get()

    if (!state.currentPomodoroId) {
      return
    }

    try {
      const endTime = Math.floor(Date.now() / 1000)
      const duration = endTime - state.currentPomodoroStart

      // 更新番茄钟记录
      await window.api.updatePomodoroRecord(state.currentPomodoroId, {
        endTime,
        duration,
        isCompleted
      })

      // 如果是工作时段且完成了,更新会话计数
      if (state.state === SESSION_STATE.WORK && isCompleted) {
        await window.api.updateSessionPomodoroCount(state.sessionId, true)

        set({
          completedPomodoros: state.completedPomodoros + 1,
          currentPomodoroId: null,
          currentPomodoroStart: null
        })
      } else {
        set({
          currentPomodoroId: null,
          currentPomodoroStart: null
        })
      }

      // 刷新今日统计
      get().refreshTodayStats()
    } catch (error) {
      console.error('完成番茄钟失败:', error)
    }
  },

  /**
   * 工作完成后的处理
   * 决定进入短休息还是长休息
   */
  onWorkComplete: async () => {
    const state = get()

    // 在完成番茄钟之前，先保存当前计数用于判断休息类型
    // 因为 finishCurrentPomodoro 会增加 completedPomodoros
    const currentCompletedCount = state.completedPomodoros

    // 完成当前工作番茄钟
    await get().finishCurrentPomodoro(true)

    // 判断休息类型（使用完成前的计数+1，即刚完成的这个番茄钟）
    const interval = state.sessionConfig.longBreakInterval || 4
    const shouldLongBreak = (currentCompletedCount + 1) % interval === 0

    if (shouldLongBreak) {
      // 进入长休息
      await get().startLongBreak()
    } else {
      // 进入短休息
      await get().startShortBreak()
    }

    return shouldLongBreak ? 'long_break' : 'short_break'
  },

  /**
   * 休息完成后的处理
   */
  onBreakComplete: async () => {
    const state = get()

    // 完成当前休息番茄钟
    await get().finishCurrentPomodoro(true)

    // 进入休息结束等待状态
    set({
      state: SESSION_STATE.BREAK_END
    })
  },

  /**
   * 跳过休息,直接开始工作
   */
  skipBreak: async () => {
    const state = get()

    if (state.state !== SESSION_STATE.SHORT_BREAK &&
        state.state !== SESSION_STATE.LONG_BREAK &&
        state.state !== SESSION_STATE.BREAK_END) {
      return
    }

    // 如果正在休息,标记为未完成
    if (state.currentPomodoroId) {
      await get().finishCurrentPomodoro(false)
    }

    // 直接开始新的工作时段
    await get().startWork()
  },

  /**
   * 继续工作 (休息结束后)
   */
  continueWork: async () => {
    await get().startWork()
  },

  /**
   * 刷新今日统计
   */
  refreshTodayStats: async () => {
    try {
      const response = await window.api.getTodayStats()

      if (response.success) {
        set({
          todayStats: {
            totalPomodoros: response.data.totalPomodoros || 0,
            totalFocusTime: response.data.totalFocusTime || 0,
            totalSessions: response.data.totalSessions || 0
          }
        })
      }
    } catch (error) {
      console.error('刷新今日统计失败:', error)
    }
  },

  /**
   * 获取下一个休息类型
   * @returns {string} 'short_break' | 'long_break'
   */
  getNextBreakType: () => {
    const state = get()
    const interval = state.sessionConfig?.longBreakInterval || 4
    const nextCount = state.completedPomodoros + 1
    return nextCount % interval === 0 ? 'long_break' : 'short_break'
  },

  /**
   * 重置会话 (用于测试或清理)
   */
  reset: () => {
    set({
      sessionId: null,
      focusItem: null,
      sessionConfig: null,
      state: SESSION_STATE.IDLE,
      completedPomodoros: 0,
      currentPomodoroId: null,
      currentPomodoroStart: null
    })
  }
}))

export default useSessionStore
export { SESSION_STATE }
