/**
 * FocusFlow - 同步状态指示器
 *
 * 功能：
 * - 显示同步状态（同步中、已同步、失败）
 * - 显示网络状态
 * - 显示最后同步时间
 *
 * @author FocusFlow Team
 * @created 2025-12-04
 */

import useSyncStore from '../store/useSyncStore'
import { SyncStatus as SyncStatusEnum } from '../utils/sync'
import { formatDate } from '../utils/format'
import styles from './SyncStatus.module.css'

function SyncStatus() {
  const { status, lastSyncTime, isOnline, error } = useSyncStore()

  // 状态图标和文本
  const getStatusDisplay = () => {
    if (!isOnline) {
      return { icon: '📡', text: '离线', className: styles.offline }
    }

    switch (status) {
      case SyncStatusEnum.SYNCING:
        return { icon: '🔄', text: '同步中...', className: styles.syncing }
      case SyncStatusEnum.SUCCESS:
        return { icon: '✅', text: '已同步', className: styles.success }
      case SyncStatusEnum.ERROR:
        return { icon: '❌', text: '同步失败', className: styles.error }
      default:
        return { icon: '⏸️', text: '未同步', className: styles.idle }
    }
  }

  const display = getStatusDisplay()

  // 格式化最后同步时间
  const formatLastSyncTime = () => {
    if (!lastSyncTime) {
      return '从未同步'
    }

    const now = Date.now() / 1000
    const diff = now - lastSyncTime

    if (diff < 60) {
      return '刚刚'
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)} 分钟前`
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)} 小时前`
    } else {
      return formatDate(lastSyncTime * 1000)
    }
  }

  return (
    <div className={`${styles.container} ${display.className}`} title={error || display.text}>
      <span className={styles.icon}>{display.icon}</span>
      <div className={styles.info}>
        <span className={styles.statusText}>{display.text}</span>
        {lastSyncTime && (
          <span className={styles.timeText}>
            {formatLastSyncTime()}
          </span>
        )}
      </div>
    </div>
  )
}

export default SyncStatus
