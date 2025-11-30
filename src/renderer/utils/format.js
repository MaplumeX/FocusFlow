/**
 * FocusFlow - 时间格式化工具函数
 *
 * 功能:
 * - 格式化秒数为 MM:SS 或 HH:MM:SS
 * - 格式化时长(秒 -> 小时/分钟/秒)
 * - 格式化时间戳为日期/时间
 * - 获取时间范围
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

/**
 * 格式化秒数为 MM:SS 格式
 * @param {number} seconds - 总秒数
 * @returns {string} 格式化的时间字符串
 *
 * @example
 * formatTime(125) // => "02:05"
 * formatTime(70)  // => "01:10"
 */
export function formatTime(seconds) {
  if (!seconds || seconds < 0) return '00:00'

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 格式化秒数为 HH:MM:SS 格式
 * @param {number} seconds - 总秒数
 * @returns {string} 格式化的时间字符串
 *
 * @example
 * formatTimeWithHours(3725) // => "01:02:05"
 * formatTimeWithHours(125)  // => "00:02:05"
 */
export function formatTimeWithHours(seconds) {
  if (!seconds || seconds < 0) return '00:00:00'

  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 格式化时长为人类可读的字符串
 * @param {number} seconds - 秒数
 * @returns {string} 格式化的时长
 *
 * @example
 * formatDuration(3725) // => "1小时2分钟"
 * formatDuration(125)  // => "2分钟5秒"
 * formatDuration(45)   // => "45秒"
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0秒'

  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts = []

  if (hours > 0) {
    parts.push(`${hours}小时`)
  }

  if (mins > 0) {
    parts.push(`${mins}分钟`)
  }

  if (secs > 0 && hours === 0) {
    parts.push(`${secs}秒`)
  }

  return parts.join('') || '0秒'
}

/**
 * 格式化时长为紧凑格式(仅显示最大单位和次级单位)
 * @param {number} seconds - 秒数
 * @returns {string} 格式化的时长
 *
 * @example
 * formatDurationCompact(3725) // => "1.0h"
 * formatDurationCompact(125)  // => "2m"
 */
export function formatDurationCompact(seconds) {
  if (!seconds || seconds < 0) return '0s'

  const hours = seconds / 3600
  const mins = seconds / 60

  if (hours >= 1) {
    return `${hours.toFixed(1)}h`
  }

  if (mins >= 1) {
    return `${Math.floor(mins)}m`
  }

  return `${seconds}s`
}

/**
 * 格式化时间戳为日期字符串 YYYY-MM-DD
 * @param {number} timestamp - 时间戳(秒)
 * @returns {string} 格式化的日期
 *
 * @example
 * formatDate(1701331200) // => "2023-11-30"
 */
export function formatDate(timestamp) {
  if (!timestamp) return '-'

  const date = new Date(timestamp * 1000)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * 格式化时间戳为时间字符串 HH:MM
 * @param {number} timestamp - 时间戳(秒)
 * @returns {string} 格式化的时间
 *
 * @example
 * formatTimeOfDay(1701331200) // => "10:00"
 */
export function formatTimeOfDay(timestamp) {
  if (!timestamp) return '-'

  const date = new Date(timestamp * 1000)
  const hours = date.getHours().toString().padStart(2, '0')
  const mins = date.getMinutes().toString().padStart(2, '0')

  return `${hours}:${mins}`
}

/**
 * 格式化时间戳为日期时间字符串
 * @param {number} timestamp - 时间戳(秒)
 * @returns {string} 格式化的日期时间
 *
 * @example
 * formatDateTime(1701331200) // => "2023-11-30 10:00"
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return '-'

  return `${formatDate(timestamp)} ${formatTimeOfDay(timestamp)}`
}

/**
 * 格式化为相对时间(多久之前)
 * @param {number} timestamp - 时间戳(秒)
 * @returns {string} 相对时间描述
 *
 * @example
 * formatRelativeTime(Date.now()/1000 - 30) // => "刚刚"
 * formatRelativeTime(Date.now()/1000 - 120) // => "2分钟前"
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return '-'

  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp

  if (diff < 60) {
    return '刚刚'
  }

  const mins = Math.floor(diff / 60)
  if (mins < 60) {
    return `${mins}分钟前`
  }

  const hours = Math.floor(mins / 60)
  if (hours < 24) {
    return `${hours}小时前`
  }

  const days = Math.floor(hours / 24)
  if (days < 7) {
    return `${days}天前`
  }

  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return `${weeks}周前`
  }

  return formatDate(timestamp)
}

/**
 * 获取今天的开始和结束时间戳(秒)
 * @returns {{start: number, end: number}} 开始和结束时间戳
 */
export function getTodayRange() {
  const now = new Date()
  const start = new Date(now).setHours(0, 0, 0, 0)
  const end = new Date(now).setHours(23, 59, 59, 999)

  return {
    start: Math.floor(start / 1000),
    end: Math.floor(end / 1000)
  }
}

/**
 * 获取本周的开始和结束时间戳(秒)
 * @returns {{start: number, end: number}} 开始和结束时间戳
 */
export function getWeekRange() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  const start = new Date(now).setHours(0, 0, 0, 0) - daysToMonday * 24 * 60 * 60 * 1000
  const end = start + 7 * 24 * 60 * 60 * 1000 - 1

  return {
    start: Math.floor(start / 1000),
    end: Math.floor(end / 1000)
  }
}

/**
 * 获取本月的开始和结束时间戳(秒)
 * @returns {{start: number, end: number}} 开始和结束时间戳
 */
export function getMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime()

  return {
    start: Math.floor(start / 1000),
    end: Math.floor(end / 1000)
  }
}

/**
 * 根据范围类型获取时间范围
 * @param {string} range - 范围类型: 'today' | 'week' | 'month'
 * @returns {{start: number, end: number}} 开始和结束时间戳
 */
export function getDateRange(range) {
  switch (range) {
    case 'today':
      return getTodayRange()
    case 'week':
      return getWeekRange()
    case 'month':
      return getMonthRange()
    default:
      return getTodayRange()
  }
}

/**
 * 格式化星期几
 * @param {number} timestamp - 时间戳(秒)
 * @returns {string} 星期几
 */
export function formatWeekday(timestamp) {
  if (!timestamp) return '-'

  const date = new Date(timestamp * 1000)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[date.getDay()]
}

/**
 * 获取月份名称
 * @param {number} month - 月份(0-11)
 * @returns {string} 月份名称
 */
export function getMonthName(month) {
  const months = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]
  return months[month] || '-'
}
