/**
 * FocusFlow - 统计数据 Store
 *
 * 功能:
 * - 管理统计数据状态
 * - 处理时间范围切换
 * - 加载和缓存统计数据
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import { create } from 'zustand'
import { getDateRange } from '../utils/format'

const useStatsStore = create((set, get) => ({
  // 时间范围: 'today' | 'week' | 'month'
  timeRange: 'today',

  // 加载状态
  loading: false,

  // 统计数据
  stats: {
    totalPomodoros: 0,
    totalFocusTime: 0,
    totalSessions: 0,
    averageSessionTime: 0
  },

  // 按事项分组的统计
  itemStats: [],

  // 每日趋势数据
  dailyStats: [],

  // 会话列表
  sessions: [],

  /**
   * 设置时间范围
   */
  setTimeRange: (range) => {
    set({ timeRange: range })
    get().loadStats()
  },

  /**
   * 加载统计数据
   */
  loadStats: async () => {
    set({ loading: true })

    try {
      const { timeRange } = get()
      const { start, end } = getDateRange(timeRange)

      // 并行加载所有统计数据
      const [pomodoroRecords, itemStatsData, dailyStatsData, sessionsData] = await Promise.all([
        window.api.getPomodoroRecordsByDateRange(start, end),
        window.api.getStatsByItem(start, end),
        window.api.getDailyStats(start, end),
        window.api.getSessionsByDateRange(start, end)
      ])

      // 处理番茄钟记录统计
      if (pomodoroRecords.success) {
        const workRecords = pomodoroRecords.data.filter(
          r => r.type === 'work' && r.is_completed
        )

        const totalPomodoros = workRecords.length
        const totalFocusTime = workRecords.reduce((sum, r) => sum + (r.duration || 0), 0)
        const totalSessions = new Set(workRecords.map(r => r.session_id)).size
        const averageSessionTime = totalSessions > 0
          ? Math.round(totalFocusTime / totalSessions)
          : 0

        set({
          stats: {
            totalPomodoros,
            totalFocusTime,
            totalSessions,
            averageSessionTime
          }
        })
      }

      // 处理按事项统计(用于饼图)
      if (itemStatsData.success && itemStatsData.data.length > 0) {
        const items = itemStatsData.data.map(item => ({
          id: item.id,
          name: item.name,
          icon: item.icon,
          color: item.color,
          value: item.totalFocusTime || 0,
          pomodoroCount: item.pomodoroCount || 0,
          sessionCount: item.sessionCount || 0,
          percentage: 0,
          durationText: formatDuration(item.totalFocusTime || 0)
        }))

        // 计算百分比
        const total = items.reduce((sum, item) => sum + item.value, 0)
        items.forEach(item => {
          item.percentage = total > 0 ? (item.value / total) * 100 : 0
        })

        set({ itemStats: items })
      } else {
        set({ itemStats: [] })
      }

      // 处理每日统计(用于柱状图)
      if (dailyStatsData.success) {
        const daily = dailyStatsData.data.map(day => ({
          date: day.date,
          dateLabel: formatDateLabel(day.date),
          focusTime: day.focusTime || 0,
          pomodoroCount: day.pomodoroCount || 0,
          sessionCount: day.sessionCount || 0
        }))

        set({ dailyStats: daily })
      } else {
        set({ dailyStats: [] })
      }

      // 处理会话列表
      if (sessionsData.success) {
        set({ sessions: sessionsData.data })
      } else {
        set({ sessions: [] })
      }

    } catch (error) {
      console.error('加载统计数据失败:', error)
    } finally {
      set({ loading: false })
    }
  },

  /**
   * 刷新统计数据
   */
  refreshStats: () => {
    get().loadStats()
  }
}))

/**
 * 格式化时长
 */
function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0分钟'

  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}小时${mins}分钟`
  }

  return `${mins}分钟`
}

/**
 * 格式化日期标签
 */
function formatDateLabel(dateStr) {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]

  return `${month}/${day} ${weekday}`
}

export default useStatsStore
