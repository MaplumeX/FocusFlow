/**
 * FocusFlow - 会话工具函数
 *
 * 功能:
 * - 休息类型判断
 * - 时间格式化
 * - 会话状态辅助函数
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

/**
 * 判断是否应该进入长休息
 * @param {number} completedPomodoros - 已完成的番茄钟数
 * @param {number} longBreakInterval - 长休息间隔
 * @returns {boolean} 是否应该长休息
 */
export function shouldTakeLongBreak(completedPomodoros, longBreakInterval = 4) {
  return completedPomodoros > 0 && completedPomodoros % longBreakInterval === 0
}

/**
 * 获取下一个休息类型
 * @param {number} completedPomodoros - 已完成的番茄钟数
 * @param {number} longBreakInterval - 长休息间隔
 * @returns {string} 'short_break' | 'long_break'
 */
export function getNextBreakType(completedPomodoros, longBreakInterval = 4) {
  const nextCount = completedPomodoros + 1
  return shouldTakeLongBreak(nextCount, longBreakInterval) ? 'long_break' : 'short_break'
}

/**
 * 格式化秒数为 MM:SS
 * @param {number} seconds - 秒数
 * @returns {string} 格式化的时间
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * 格式化时长显示 (分钟 → 小时分钟)
 * @param {number} minutes - 分钟数
 * @returns {string} 格式化的时长
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} 分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`
}

/**
 * 格式化时长显示 (秒 → 小时分钟)
 * @param {number} seconds - 秒数
 * @returns {string} 格式化的时长
 */
export function formatDurationFromSeconds(seconds) {
  return formatDuration(Math.floor(seconds / 60))
}

/**
 * 获取休息类型的显示名称
 * @param {string} breakType - 休息类型 ('short_break' | 'long_break')
 * @returns {string} 显示名称
 */
export function getBreakTypeName(breakType) {
  return breakType === 'long_break' ? '长休息' : '短休息'
}

/**
 * 获取会话状态的显示名称
 * @param {string} state - 会话状态
 * @returns {string} 显示名称
 */
export function getSessionStateName(state) {
  const stateNames = {
    idle: '空闲',
    work: '工作中',
    short_break: '短休息',
    long_break: '长休息',
    break_end: '休息结束'
  }
  return stateNames[state] || state
}

/**
 * 计算距离下一个长休息还有几个番茄钟
 * @param {number} completedPomodoros - 已完成的番茄钟数
 * @param {number} longBreakInterval - 长休息间隔
 * @returns {number} 距离长休息的番茄钟数
 */
export function pomodorosUntilLongBreak(completedPomodoros, longBreakInterval = 4) {
  const remainder = completedPomodoros % longBreakInterval
  return remainder === 0 ? longBreakInterval : longBreakInterval - remainder
}
