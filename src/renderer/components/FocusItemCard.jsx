/**
 * FocusFlow - FocusItemCard 组件
 *
 * 功能:
 * - 显示专注事项卡片
 * - 显示名称、图标、颜色
 * - 显示配置信息（工作时长、休息时长）
 * - 显示统计信息（累计时长、完成次数）
 * - 支持点击选择
 * - 支持编辑和删除操作
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import styles from './FocusItemCard.module.css'

function FocusItemCard({
  item,
  selected = false,
  onClick,
  onEdit,
  onDelete
}) {
  // 格式化时长显示 (分钟 → 小时/分钟)
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}分钟`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
  }

  // 处理卡片点击
  const handleCardClick = () => {
    onClick?.(item)
  }

  // 处理编辑按钮点击
  const handleEditClick = (e) => {
    e.stopPropagation() // 阻止事件冒泡
    onEdit?.(item)
  }

  // 处理删除按钮点击
  const handleDeleteClick = (e) => {
    e.stopPropagation() // 阻止事件冒泡
    onDelete?.(item)
  }

  // 获取卡片样式类
  const getCardClassName = () => {
    let className = styles.card
    if (selected) {
      className += ` ${styles.selected}`
    }
    return className
  }

  return (
    <div className={getCardClassName()} onClick={handleCardClick}>
      {/* 头部：图标和名称 */}
      <div className={styles.header}>
        <span className={styles.icon}>{item.icon}</span>
        <h3 className={styles.name} style={{ color: item.color }}>
          {item.name}
        </h3>
      </div>

      {/* 配置信息 */}
      <div className={styles.config}>
        <div className={styles.configItem}>
          <span className={styles.configLabel}>工作时长</span>
          <span className={styles.configValue}>{item.work_duration} 分钟</span>
        </div>
        <div className={styles.configItem}>
          <span className={styles.configLabel}>短休息</span>
          <span className={styles.configValue}>{item.short_break} 分钟</span>
        </div>
        <div className={styles.configItem}>
          <span className={styles.configLabel}>长休息</span>
          <span className={styles.configValue}>{item.long_break} 分钟</span>
        </div>
        <div className={styles.configItem}>
          <span className={styles.configLabel}>长休间隔</span>
          <span className={styles.configValue}>{item.long_break_interval} 次</span>
        </div>
      </div>

      {/* 统计信息 */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{formatDuration(Math.floor((item.total_focus_time || 0) / 60))}</span>
          <span className={styles.statLabel}>累计时长</span>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{item.total_sessions || 0} 次</span>
          <span className={styles.statLabel}>完成次数</span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionButton} ${styles.editButton}`}
          onClick={handleEditClick}
          aria-label="编辑"
        >
          编辑
        </button>
        <button
          className={`${styles.actionButton} ${styles.deleteButton}`}
          onClick={handleDeleteClick}
          aria-label="删除"
        >
          删除
        </button>
      </div>
    </div>
  )
}

export default FocusItemCard
