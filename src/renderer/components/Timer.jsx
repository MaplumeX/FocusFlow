/**
 * FocusFlow - Timer 组件
 *
 * 功能:
 * - 显示倒计时 (MM:SS 格式)
 * - 精准计时 (时间戳校准)
 * - 进度条显示
 * - 集成 useTimerStore
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import useTimerStore, { TIMER_STATUS, TIMER_MODE } from '../store/useTimerStore'
import useSessionStore from '../store/useSessionStore'
import styles from './Timer.module.css'

function Timer() {
  const {
    status,
    mode,
    remainingTime,
    totalTime,
    currentItem,
    getFormattedTime
  } = useTimerStore()

  // 从 sessionStore 获取专注事项和已完成的番茄钟数（单一数据源）
  const { focusItem: sessionFocusItem, completedPomodoros } = useSessionStore()

  // 优先使用 sessionFocusItem(会话中), 其次使用 currentItem(仅选择未开始)
  const displayItem = sessionFocusItem || currentItem

  // 计算进度百分比
  const getProgress = () => {
    if (totalTime === 0) return 0
    return ((totalTime - remainingTime) / totalTime) * 100
  }

  // 获取模式显示文本
  const getModeText = () => {
    if (!displayItem) return '未选择专注事项'

    // 如果是空闲状态且有选中的事项,显示"准备专注"
    if (status === TIMER_STATUS.IDLE && displayItem) {
      return '准备专注'
    }

    switch (mode) {
      case TIMER_MODE.WORK:
        return '专注工作'
      case TIMER_MODE.SHORT_BREAK:
        return '短休息'
      case TIMER_MODE.LONG_BREAK:
        return '长休息'
      default:
        return ''
    }
  }

  // 获取显示样式类名
  const getDisplayClassName = () => {
    let className = styles.display
    if (status === TIMER_STATUS.RUNNING) {
      className += ` ${styles.running}`
    } else if (status === TIMER_STATUS.PAUSED) {
      className += ` ${styles.paused}`
    }
    return className
  }

  return (
    <div className={styles.timer}>
      {displayItem && (
        <>
          <div className={styles.mode}>{getModeText()}</div>
          <div className={styles.itemName}>{displayItem.name} {displayItem.icon}</div>
        </>
      )}

      <div className={getDisplayClassName()}>
        {getFormattedTime()}
      </div>

      {totalTime > 0 && (
        <div className={styles.progress}>
          <div
            className={styles.progressBar}
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      )}

      {completedPomodoros > 0 && (
        <div className={styles.sessionInfo}>
          已完成 {completedPomodoros} 个番茄钟
        </div>
      )}
    </div>
  )
}

export default Timer
