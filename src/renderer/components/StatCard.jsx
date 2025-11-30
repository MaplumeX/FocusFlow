/**
 * FocusFlow - 统计卡片组件
 *
 * 功能:
 * - 显示关键指标(番茄钟数、时长、会话数等)
 * - 支持图标和趋势显示
 * - 响应式布局
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import styles from './StatCard.module.css'

/**
 * 统计卡片组件
 *
 * @param {Object} props
 * @param {string} props.title - 标题
 * @param {string|number} props.value - 数值
 * @param {string} props.icon - 图标emoji
 * @param {string} props.unit - 单位(可选)
 * @param {string} props.trend - 趋势(可选): 'up' | 'down' | null
 * @param {string} props.trendText - 趋势文本(可选)
 * @param {string} props.color - 主题色(可选)
 */
function StatCard({
  title,
  value,
  icon,
  unit = '',
  trend = null,
  trendText = '',
  color = '#8b5cf6'
}) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon} style={{ backgroundColor: `${color}20` }}>
          {icon}
        </span>
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.valueWrapper}>
          <span className={styles.value} style={{ color }}>
            {value}
          </span>
          {unit && <span className={styles.unit}>{unit}</span>}
        </div>

        {trend && (
          <div className={`${styles.trend} ${styles[trend]}`}>
            <span className={styles.trendIcon}>
              {trend === 'up' ? '↑' : '↓'}
            </span>
            <span className={styles.trendText}>{trendText}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
