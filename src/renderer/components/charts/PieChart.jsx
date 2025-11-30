/**
 * FocusFlow - 饼图组件
 *
 * 功能:
 * - 显示专注事项分布饼图
 * - 使用事项颜色渲染扇区
 * - 显示交互提示和图例
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import { PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import styles from './PieChart.module.css'

/**
 * 自定义 Tooltip
 */
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload

    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipHeader}>
          <span className={styles.tooltipIcon}>{data.icon}</span>
          <span className={styles.tooltipName}>{data.name}</span>
        </div>
        <div className={styles.tooltipContent}>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>专注时长:</span>
            <span className={styles.tooltipValue}>{data.durationText}</span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>番茄钟数:</span>
            <span className={styles.tooltipValue}>{data.pomodoroCount}个</span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>占比:</span>
            <span className={styles.tooltipValue}>{data.percentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

/**
 * 自定义图例
 */
function CustomLegend({ payload }) {
  return (
    <div className={styles.legend}>
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className={styles.legendItem}>
          <span
            className={styles.legendColor}
            style={{ backgroundColor: entry.color }}
          />
          <span className={styles.legendIcon}>{entry.payload.icon}</span>
          <span className={styles.legendText}>{entry.value}</span>
          <span className={styles.legendPercent}>
            {entry.payload.percentage.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * 饼图组件
 *
 * @param {Object} props
 * @param {Array} props.data - 数据数组
 * @param {number} props.height - 图表高度(默认300)
 */
function PieChart({ data = [], height = 300 }) {
  // 空数据处理
  if (!data || data.length === 0) {
    return (
      <div className={styles.empty} style={{ height: `${height}px` }}>
        <span className={styles.emptyIcon}>📊</span>
        <p className={styles.emptyText}>暂无数据</p>
        <p className={styles.emptyHint}>完成专注会话后这里会显示事项分布</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  )
}

export default PieChart
