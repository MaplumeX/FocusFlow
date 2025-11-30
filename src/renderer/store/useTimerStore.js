/**
 * FocusFlow - 计时器状态管理
 *
 * 功能:
 * - 管理计时器状态(工作/休息/停止)
 * - 精准倒计时(时间戳校准)
 * - 支持暂停/继续/停止
 * - 自动切换工作和休息
 * - 集成会话管理 (Phase 2)
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 * @updated 2025-11-30 (Phase 2: 集成会话管理)
 */

import { create } from 'zustand'
import useSessionStore, { SESSION_STATE } from './useSessionStore'

// 计时器模式
const TIMER_MODE = {
  WORK: 'work',
  SHORT_BREAK: 'short_break',
  LONG_BREAK: 'long_break'
}

// 计时器状态
const TIMER_STATUS = {
  IDLE: 'idle',       // 空闲
  RUNNING: 'running', // 运行中
  PAUSED: 'paused'    // 暂停
}

const useTimerStore = create((set, get) => ({
  // 状态
  status: TIMER_STATUS.IDLE,
  mode: TIMER_MODE.WORK,
  remainingTime: 0,      // 剩余时间(秒)
  totalTime: 0,          // 总时间(秒)
  currentItem: null,     // 当前专注事项
  sessionCount: 0,       // 当前连续完成的番茄钟数量
  startTimestamp: null,  // 开始时间戳
  pausedTime: 0,         // 暂停时累计的时间(秒)
  intervalId: null,      // 定时器 ID

  /**
   * 开始计时
   * @param {Object} focusItem - 专注事项
   * @param {string} mode - 计时模式 (work/short_break/long_break)
   */
  start: async (focusItem, mode = TIMER_MODE.WORK) => {
    const state = get()

    // 如果已经在运行,先停止
    if (state.intervalId) {
      clearInterval(state.intervalId)
    }

    // Phase 2: 如果是开始工作且没有会话,创建会话
    const sessionStore = useSessionStore.getState()
    if (mode === TIMER_MODE.WORK && !sessionStore.sessionId) {
      const success = await sessionStore.startSession(focusItem)
      if (!success) {
        console.error('创建会话失败')
        return
      }
    }

    // Phase 2: 根据模式启动对应的会话状态
    if (mode === TIMER_MODE.WORK) {
      await sessionStore.startWork()
    } else if (mode === TIMER_MODE.SHORT_BREAK) {
      await sessionStore.startShortBreak()
    } else if (mode === TIMER_MODE.LONG_BREAK) {
      await sessionStore.startLongBreak()
    }

    // 计算总时间
    let totalSeconds
    if (mode === TIMER_MODE.WORK) {
      totalSeconds = (focusItem.work_duration || 25) * 60
    } else if (mode === TIMER_MODE.SHORT_BREAK) {
      totalSeconds = (focusItem.short_break || 5) * 60
    } else {
      totalSeconds = (focusItem.long_break || 15) * 60
    }

    // 设置开始时间戳
    const startTimestamp = Date.now()

    // 启动定时器(每100ms更新一次以保证精度)
    const intervalId = setInterval(() => {
      get().tick()
    }, 100)

    set({
      status: TIMER_STATUS.RUNNING,
      mode,
      totalTime: totalSeconds,
      remainingTime: totalSeconds,
      currentItem: focusItem,
      startTimestamp,
      pausedTime: 0,
      intervalId
    })
  },

  /**
   * 暂停计时
   */
  pause: () => {
    const state = get()

    if (state.status !== TIMER_STATUS.RUNNING) {
      return
    }

    // 清除定时器
    if (state.intervalId) {
      clearInterval(state.intervalId)
    }

    // 计算已经过去的时间
    const elapsed = Math.floor((Date.now() - state.startTimestamp) / 1000)
    const newPausedTime = state.pausedTime + elapsed

    set({
      status: TIMER_STATUS.PAUSED,
      pausedTime: newPausedTime,
      intervalId: null
    })
  },

  /**
   * 继续计时
   */
  resume: () => {
    const state = get()

    if (state.status !== TIMER_STATUS.PAUSED) {
      return
    }

    // 重新设置开始时间戳
    const startTimestamp = Date.now()

    // 重启定时器
    const intervalId = setInterval(() => {
      get().tick()
    }, 100)

    set({
      status: TIMER_STATUS.RUNNING,
      startTimestamp,
      intervalId
    })
  },

  /**
   * 停止计时
   */
  stop: async () => {
    const state = get()

    // 清除定时器
    if (state.intervalId) {
      clearInterval(state.intervalId)
    }

    // Phase 2: 结束会话
    const sessionStore = useSessionStore.getState()
    if (sessionStore.sessionId) {
      await sessionStore.endSession()
    }

    set({
      status: TIMER_STATUS.IDLE,
      mode: TIMER_MODE.WORK,
      remainingTime: 0,
      totalTime: 0,
      startTimestamp: null,
      pausedTime: 0,
      intervalId: null
    })
  },

  /**
   * 计时器 tick (每100ms调用一次)
   * 使用时间戳校准,确保精度
   */
  tick: () => {
    const state = get()

    if (state.status !== TIMER_STATUS.RUNNING) {
      return
    }

    // 计算实际经过的时间(秒)
    const elapsed = Math.floor((Date.now() - state.startTimestamp) / 1000)
    const totalElapsed = state.pausedTime + elapsed

    // 计算剩余时间
    const remaining = state.totalTime - totalElapsed

    if (remaining <= 0) {
      // 计时结束
      get().finish()
    } else {
      set({ remainingTime: remaining })
    }
  },

  /**
   * 计时完成
   */
  finish: async () => {
    const state = get()

    // 清除定时器
    if (state.intervalId) {
      clearInterval(state.intervalId)
    }

    const sessionStore = useSessionStore.getState()

    // Phase 2: 如果是工作模式,处理工作完成
    if (state.mode === TIMER_MODE.WORK && state.currentItem) {
      try {
        // 更新专注事项统计
        const focusTime = state.totalTime // 以秒为单位
        await window.api.updateFocusItemStats(
          state.currentItem.id,
          focusTime,
          1 // 完成次数 +1
        )

        // Phase 2: 通知会话管理工作完成
        const nextBreakType = await sessionStore.onWorkComplete()

        // 更新会话计数
        const newSessionCount = state.sessionCount + 1

        // 显示通知(工作完成)
        await window.api.showNotification({
          title: '工作时段结束! 🎉',
          body: nextBreakType === 'long_break'
            ? `太棒了!已完成 ${sessionStore.completedPomodoros} 个番茄钟,享受长休息吧!`
            : `干得好!完成了一个番茄钟,短暂休息一下~`
        })

        // Phase 2: 自动开始休息
        const breakDuration = nextBreakType === 'long_break'
          ? state.currentItem.long_break
          : state.currentItem.short_break

        const breakMode = nextBreakType === 'long_break'
          ? TIMER_MODE.LONG_BREAK
          : TIMER_MODE.SHORT_BREAK

        // 自动开始休息倒计时
        await get().start(state.currentItem, breakMode)

        set({
          sessionCount: newSessionCount
        })
      } catch (error) {
        console.error('更新统计数据失败:', error)
      }
    } else {
      // Phase 2: 休息结束
      await sessionStore.onBreakComplete()

      await window.api.showNotification({
        title: '休息结束! ⏰',
        body: '准备好了吗?开始下一个专注时段!'
      })

      set({
        status: TIMER_STATUS.IDLE,
        remainingTime: 0,
        intervalId: null
      })
    }
  },

  /**
   * 重置会话计数
   */
  resetSessionCount: () => {
    set({ sessionCount: 0 })
  },

  /**
   * 格式化剩余时间为 MM:SS
   * @returns {string} 格式化的时间
   */
  getFormattedTime: () => {
    const seconds = get().remainingTime
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
}))

export default useTimerStore
export { TIMER_MODE, TIMER_STATUS }
