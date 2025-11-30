/**
 * FocusFlow - 主页
 *
 * 功能:
 * - 集成 Timer 组件
 * - 控制按钮(开始/暂停/停止)
 * - 专注事项选择
 * - 今日统计显示
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import { useState, useEffect, useMemo } from 'react'
import Timer from '../components/Timer'
import Button from '../components/Button'
import Modal from '../components/Modal'
import useTimerStore, { TIMER_STATUS, TIMER_MODE } from '../store/useTimerStore'
import useFocusStore from '../store/useFocusStore'
import styles from './Home.module.css'

function Home() {
  const [showItemSelect, setShowItemSelect] = useState(false)

  // Timer Store
  const { status, currentItem, sessionCount, start, pause, resume, stop } = useTimerStore()

  // Focus Store
  const { items, loadItems } = useFocusStore()

  useEffect(() => {
    loadItems()
  }, [loadItems])

  // 计算今日统计
  const todayStats = useMemo(() => {
    // 获取今天的开始时间戳(00:00:00)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStart = Math.floor(today.getTime() / 1000)

    // 统计今日的专注时长和会话数
    // 注意:这里简化处理,实际应该从数据库查询今日数据
    // 由于当前没有按日期统计的表,这里用所有累计数据代替
    let totalTime = 0
    let totalSessions = 0

    items.forEach(item => {
      totalTime += item.total_focus_time || 0
      totalSessions += item.total_sessions || 0
    })

    return {
      totalTime: Math.floor(totalTime / 60), // 转换为分钟
      totalSessions,
      currentSession: sessionCount
    }
  }, [items, sessionCount])

  // 格式化时长显示
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} 分钟`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`
  }

  // 处理开始按钮
  const handleStart = () => {
    if (!currentItem) {
      setShowItemSelect(true)
      return
    }
    start(currentItem, TIMER_MODE.WORK)
  }

  // 处理暂停按钮
  const handlePause = () => {
    pause()
  }

  // 处理继续按钮
  const handleResume = () => {
    resume()
  }

  // 处理停止按钮
  const handleStop = () => {
    stop()
  }

  // 选择专注事项
  const handleSelectItem = (item) => {
    start(item, TIMER_MODE.WORK)
    setShowItemSelect(false)
  }

  // 渲染控制按钮
  const renderControls = () => {
    if (status === TIMER_STATUS.IDLE) {
      return (
        <Button type="primary" size="large" onClick={handleStart}>
          开始专注
        </Button>
      )
    }

    if (status === TIMER_STATUS.RUNNING) {
      return (
        <div className={styles.controls}>
          <Button type="warning" size="large" onClick={handlePause}>
            暂停
          </Button>
          <Button type="default" size="large" onClick={handleStop}>
            停止
          </Button>
        </div>
      )
    }

    if (status === TIMER_STATUS.PAUSED) {
      return (
        <div className={styles.controls}>
          <Button type="success" size="large" onClick={handleResume}>
            继续
          </Button>
          <Button type="default" size="large" onClick={handleStop}>
            停止
          </Button>
        </div>
      )
    }
  }

  return (
    <div className={styles.container}>
      {/* 主内容区 */}
      <div className={styles.mainContent}>
        <Timer />

        <div className={styles.controlsWrapper}>
          {renderControls()}
        </div>

        {/* 今日统计 */}
        <div className={styles.statsCard}>
          <h3 className={styles.statsTitle}>今日统计</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{formatTime(todayStats.totalTime)}</span>
              <span className={styles.statLabel}>累计时长</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{todayStats.totalSessions} 次</span>
              <span className={styles.statLabel}>完成番茄钟</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{todayStats.currentSession} 次</span>
              <span className={styles.statLabel}>当前会话</span>
            </div>
          </div>
        </div>
      </div>

      {/* 专注事项选择 Modal */}
      <Modal
        visible={showItemSelect}
        title="选择专注事项"
        onClose={() => setShowItemSelect(false)}
        size="small"
      >
        <div className={styles.itemList}>
          {items.length === 0 ? (
            <p className={styles.emptyText}>
              还没有专注事项,请先创建一个
            </p>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className={styles.itemCard}
              >
                <span className={styles.itemIcon}>{item.icon}</span>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName} style={{ color: item.color }}>
                    {item.name}
                  </div>
                  <div className={styles.itemConfig}>
                    {item.work_duration} 分钟工作 / {item.short_break} 分钟休息
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Home
