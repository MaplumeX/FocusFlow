/**
 * FocusFlow - 统计页面
 *
 * 功能:
 * - 显示专注统计数据
 * - 时间维度切换(今日/本周/本月)
 * - 数据可视化(饼图、柱状图)
 * - 统计卡片展示
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 * @updated 2025-11-30 (Phase 3: 实现统计功能)
 */

import { useEffect } from 'react'
import useStatsStore from '../store/useStatsStore'
import StatCard from '../components/StatCard'
import PieChart from '../components/charts/PieChart'
import BarChart from '../components/charts/BarChart'
import { formatDuration } from '../utils/format'
import styles from './Stats.module.css'

function Stats() {
  const {
    timeRange,
    loading,
    stats,
    itemStats,
    dailyStats,
    setTimeRange,
    loadStats
  } = useStatsStore()

  // 组件挂载时加载数据
  useEffect(() => {
    loadStats()
  }, [loadStats])

  // 时间范围选项
  const timeRangeOptions = [
    { value: 'today', label: '今日' },
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' }
  ]

  return (
    <div className={styles.container}>
      {/* 头部 */}
      <div className={styles.header}>
        <h1 className={styles.title}>📊 数据统计</h1>

        {/* 时间范围切换器 */}
        <div className={styles.rangeSelector}>
          {timeRangeOptions.map(option => (
            <button
              key={option.value}
              className={`${styles.rangeBtn} ${timeRange === option.value ? styles.active : ''}`}
              onClick={() => setTimeRange(option.value)}
              disabled={loading}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>加载中...</p>
        </div>
      )}

      {/* 统计卡片 */}
      {!loading && (
        <>
          <div className={styles.cardsGrid}>
            <StatCard
              title="完成番茄钟"
              value={stats.totalPomodoros}
              icon="🍅"
              unit="个"
              color="#ef4444"
            />
            <StatCard
              title="专注时长"
              value={formatDuration(stats.totalFocusTime)}
              icon="⏱️"
              color="#8b5cf6"
            />
            <StatCard
              title="完成会话"
              value={stats.totalSessions}
              icon="📝"
              unit="次"
              color="#3b82f6"
            />
            <StatCard
              title="平均时长"
              value={formatDuration(stats.averageSessionTime)}
              icon="📊"
              color="#10b981"
            />
          </div>

          {/* 图表区域 */}
          <div className={styles.chartsGrid}>
            {/* 事项分布饼图 */}
            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>专注事项分布</h2>
              <PieChart data={itemStats} height={300} />
            </div>

            {/* 每日趋势柱状图 */}
            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>专注时长趋势</h2>
              <BarChart data={dailyStats} height={300} />
            </div>
          </div>

          {/* 空状态 */}
          {stats.totalPomodoros === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📊</span>
              <h3 className={styles.emptyTitle}>暂无统计数据</h3>
              <p className={styles.emptyText}>
                完成专注会话后,这里将显示详细的统计数据和趋势图
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Stats
