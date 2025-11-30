/**
 * FocusFlow - 统计计算工具函数
 *
 * 功能:
 * - 计算今日/本周/本月统计数据
 * - 按事项分组统计
 * - 计算趋势数据
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

/**
 * 获取时间范围
 * @param {string} range - 时间范围: 'today' | 'week' | 'month'
 * @returns {{startTime: number, endTime: number}} 开始和结束时间戳(秒)
 */
export function getTimeRange(range) {
  const now = new Date()
  let startTime, endTime

  switch (range) {
    case 'today':
      // 今日 00:00:00 到 23:59:59
      startTime = new Date(now).setHours(0, 0, 0, 0)
      endTime = new Date(now).setHours(23, 59, 59, 999)
      break

    case 'week':
      // 本周一 00:00:00 到周日 23:59:59
      const dayOfWeek = now.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // 周日是0,调整到周一
      startTime = new Date(now).setHours(0, 0, 0, 0) - daysToMonday * 24 * 60 * 60 * 1000
      endTime = startTime + 7 * 24 * 60 * 60 * 1000 - 1
      break

    case 'month':
      // 本月 1 号 00:00:00 到月末 23:59:59
      startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
      endTime = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime()
      break

    default:
      throw new Error(`Invalid time range: ${range}`)
  }

  // 转换为秒
  return {
    startTime: Math.floor(startTime / 1000),
    endTime: Math.floor(endTime / 1000)
  }
}

/**
 * 计算统计数据摘要
 * @param {Array} pomodoroRecords - 番茄钟记录列表
 * @returns {Object} 统计摘要
 */
function calculateStatsSummary(pomodoroRecords) {
  const workRecords = pomodoroRecords.filter(r => r.type === 'work')
  const completedWork = workRecords.filter(r => r.is_completed)

  return {
    totalPomodoros: workRecords.length,
    completedPomodoros: completedWork.length,
    totalFocusTime: completedWork.reduce((sum, r) => sum + (r.duration || 0), 0),
    totalBreakTime: pomodoroRecords
      .filter(r => r.type !== 'work' && r.is_completed)
      .reduce((sum, r) => sum + (r.duration || 0), 0)
  }
}

/**
 * 按事项分组统计
 * @param {Array} pomodoroRecords - 番茄钟记录列表
 * @returns {Array} 按事项分组的统计数据
 */
export function groupByItem(pomodoroRecords) {
  const itemMap = new Map()

  pomodoroRecords.forEach(record => {
    if (record.type !== 'work' || !record.is_completed) return

    const itemId = record.focus_item_id
    if (!itemId) return

    if (!itemMap.has(itemId)) {
      itemMap.set(itemId, {
        id: itemId,
        name: record.item_name || '未知事项',
        icon: record.item_icon || '📝',
        color: record.item_color || '#8b5cf6',
        totalTime: 0,
        pomodoroCount: 0,
        sessionCount: new Set()
      })
    }

    const item = itemMap.get(itemId)
    item.totalTime += record.duration || 0
    item.pomodoroCount += 1
    item.sessionCount.add(record.session_id)
  })

  // 转换为数组并计算百分比
  const items = Array.from(itemMap.values()).map(item => ({
    ...item,
    sessionCount: item.sessionCount.size
  }))

  const totalTime = items.reduce((sum, item) => sum + item.totalTime, 0)

  return items.map(item => ({
    ...item,
    percentage: totalTime > 0 ? (item.totalTime / totalTime) * 100 : 0
  })).sort((a, b) => b.totalTime - a.totalTime)
}

/**
 * 计算每日统计(用于趋势图)
 * @param {Array} pomodoroRecords - 番茄钟记录列表
 * @param {number} days - 天数
 * @returns {Array} 每日统计数据
 */
export function getDailyTrend(pomodoroRecords, days = 7) {
  const dailyMap = new Map()

  // 初始化最近 N 天的数据
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    dailyMap.set(dateStr, {
      date: dateStr,
      pomodoroCount: 0,
      focusTime: 0,
      sessionCount: new Set()
    })
  }

  // 填充实际数据
  pomodoroRecords.forEach(record => {
    if (record.type !== 'work' || !record.is_completed) return

    const date = new Date(record.start_time * 1000).toISOString().split('T')[0]

    if (dailyMap.has(date)) {
      const day = dailyMap.get(date)
      day.pomodoroCount += 1
      day.focusTime += record.duration || 0
      day.sessionCount.add(record.session_id)
    }
  })

  return Array.from(dailyMap.values()).map(day => ({
    date: day.date,
    pomodoroCount: day.pomodoroCount,
    focusTime: day.focusTime,
    sessionCount: day.sessionCount.size
  }))
}

/**
 * 格式化秒数为时长字符串
 * @param {number} seconds - 秒数
 * @param {boolean} showSeconds - 是否显示秒
 * @returns {string} 格式化的时长
 */
export function formatDuration(seconds, showSeconds = false) {
  if (!seconds || seconds < 0) return showSeconds ? '00:00:00' : '00:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return showSeconds
      ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${hours}小时${minutes}分钟`
  }

  if (minutes > 0) {
    return showSeconds
      ? `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}分钟`
  }

  return showSeconds
    ? `00:${secs.toString().padStart(2, '0')}`
    : `${secs}秒`
}

/**
 * 格式化时间戳为日期字符串
 * @param {number} timestamp - 时间戳(秒)
 * @param {string} format - 格式: 'date' | 'time' | 'datetime'
 * @returns {string} 格式化的日期时间
 */
export function formatTimestamp(timestamp, format = 'datetime') {
  if (!timestamp) return '-'

  const date = new Date(timestamp * 1000)

  switch (format) {
    case 'date':
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })

    case 'time':
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })

    case 'datetime':
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })

    default:
      return date.toLocaleString('zh-CN')
  }
}

/**
 * 计算平均值
 * @param {Array<number>} values - 数值数组
 * @returns {number} 平均值
 */
export function average(values) {
  if (!values || values.length === 0) return 0
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
}

/**
 * 计算增长率
 * @param {number} current - 当前值
 * @param {number} previous - 之前的值
 * @returns {number} 增长率(百分比)
 */
export function growthRate(current, previous) {
  if (!previous || previous === 0) {
    return current > 0 ? 100 : 0
  }
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * 获取时间范围标签
 * @param {string} range - 时间范围
 * @returns {string} 标签文本
 */
export function getRangeLabel(range) {
  const labels = {
    today: '今日',
    week: '本周',
    month: '本月'
  }
  return labels[range] || '未知'
}
