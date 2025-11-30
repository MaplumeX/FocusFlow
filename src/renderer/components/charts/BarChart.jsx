/**
 * FocusFlow - 柱状图组件
 *
 * 功能:
 * - 显示每日专注时长柱状图
 * - 显示趋势数据
 * - 交互提示
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { formatDuration } from '../../utils/format'
import styles from './BarChart.module.css'

/**
 * 自定义 Tooltip
 */
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload

    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipDate}>{data.dateLabel}</div>
        <div className={styles.tooltipContent}>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>专注时长:</span>
            <span className={styles.tooltipValue}>
              {formatDuration(data.focusTime)}
            </span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>番茄钟数:</span>
            <span className={styles.tooltipValue}>{data.pomodoroCount}个</span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>会话数:</span>
            <span className={styles.tooltipValue}>{data.sessionCount}次</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

/**
 * 格式化 Y 轴时长(秒 -> 小时/分钟)
 */
function formatYAxis(value) {
  const hours = value / 3600
  if (hours >= 1) {
    return `${hours.toFixed(1)}h`
  }
  const mins = value / 60
  return `${Math.round(mins)}m`
}

/**
 * 柱状图组件
 *
 * @param {Object} props
 * @param {Array} props.data - 数据数组 [{date, dateLabel, focusTime, pomodoroCount, sessionCount}]
 * @param {number} props.height - 图表高度(默认300)
 */
function BarChart({ data = [], height = 300 }) {
  // 空数据处理
  if (!data || data.length === 0) {
    return (
      <div className={styles.empty} style={{ height: `${height}px` }}>
        <span className={styles.emptyIcon}>📊</span>
        <p className={styles.emptyText}>暂无数据</p>
        <p className={styles.emptyHint}>完成专注会话后这里会显示趋势图</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBar data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis
            dataKey="dateLabel"
            stroke="var(--text-secondary)"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          />
          <YAxis
            stroke="var(--text-secondary)"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            tickFormatter={formatYAxis}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
          <Bar dataKey="focusTime" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChart
