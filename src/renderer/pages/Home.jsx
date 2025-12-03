/**
 * FocusFlow - 主页
 *
 * 功能:
 * - 集成 Timer 组件
 * - 控制按钮(开始/暂停/停止)
 * - 专注事项侧边栏快速切换
 * - 今日统计显示
 * - 休息结束提示 (Phase 2)
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 * @updated 2025-12-03 (添加侧边栏快速切换功能)
 */

import { useState, useEffect, useMemo } from 'react'
import Timer from '../components/Timer'
import Button from '../components/Button'
import Modal from '../components/Modal'
import BreakEndModal from '../components/BreakEndModal'
import FocusItemSidebar from '../components/FocusItemSidebar'
import useTimerStore, { TIMER_STATUS, TIMER_MODE } from '../store/useTimerStore'
import useSessionStore, { SESSION_STATE } from '../store/useSessionStore'
import useFocusStore from '../store/useFocusStore'
import styles from './Home.module.css'

function Home() {
  const [showItemSelect, setShowItemSelect] = useState(false)
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false)
  const [pendingItem, setPendingItem] = useState(null)

  // Timer Store
  const { status, currentItem, start, pause, resume, stop } = useTimerStore()

  // Session Store (Phase 2)
  const {
    state: sessionState,
    focusItem: sessionFocusItem,
    completedPomodoros,
    todayStats,
    lastBreakType,
    continueWork,
    skipBreak,
    endSession,
    refreshTodayStats
  } = useSessionStore()

  // Focus Store
  const { items, loadItems } = useFocusStore()

  useEffect(() => {
    loadItems()
    // Phase 2: 刷新今日统计
    refreshTodayStats()
  }, [loadItems, refreshTodayStats])

  // Phase 2: 使用 sessionStore 的今日统计
  const displayStats = useMemo(() => {
    return {
      totalTime: Math.floor((todayStats.totalFocusTime || 0) / 60), // 转换为分钟
      totalPomodoros: todayStats.totalPomodoros || 0,
      currentSession: completedPomodoros
    }
  }, [todayStats, completedPomodoros])

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

  // 从侧边栏选择事项
  const handleSidebarSelectItem = async (item) => {
    // 判断是否需要确认
    const isTimerActive = status === TIMER_STATUS.RUNNING || status === TIMER_STATUS.PAUSED

    if (isTimerActive) {
      // 计时器运行中,需要确认
      setPendingItem(item)
      setShowSwitchConfirm(true)
    } else {
      // 空闲状态,直接切换
      await start(item, TIMER_MODE.WORK)
    }
  }

  // 确认切换事项
  const handleConfirmSwitch = async (saveProgress) => {
    if (!pendingItem) return

    if (saveProgress) {
      // 保存当前进度并切换
      await stop()
      await start(pendingItem, TIMER_MODE.WORK)
    } else {
      // 直接切换(不保存进度)
      await stop()
      await start(pendingItem, TIMER_MODE.WORK)
    }

    setShowSwitchConfirm(false)
    setPendingItem(null)
  }

  // 取消切换
  const handleCancelSwitch = () => {
    setShowSwitchConfirm(false)
    setPendingItem(null)
  }

  // Phase 2: 处理休息结束后继续工作
  const handleContinueWork = async () => {
    await continueWork()
    // 重启工作倒计时
    if (sessionFocusItem) {
      await start(sessionFocusItem, TIMER_MODE.WORK)
    }
  }

  // Phase 2: 处理跳过休息/结束会话
  const handleStopSession = async () => {
    await endSession()
  }

  // Phase 2: 处理跳过休息(休息期间)
  const handleSkipBreak = async () => {
    await skipBreak()
    // 重启工作倒计时
    if (sessionFocusItem) {
      await start(sessionFocusItem, TIMER_MODE.WORK)
    }
  }

  // 渲染控制按钮
  const renderControls = () => {
    // Phase 2: 如果正在休息,显示跳过休息按钮
    const isBreaking = sessionState === SESSION_STATE.SHORT_BREAK ||
                       sessionState === SESSION_STATE.LONG_BREAK

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
          {isBreaking && (
            <Button type="primary" size="large" onClick={handleSkipBreak}>
              跳过休息
            </Button>
          )}
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
          {isBreaking && (
            <Button type="primary" size="large" onClick={handleSkipBreak}>
              跳过休息
            </Button>
          )}
          <Button type="default" size="large" onClick={handleStop}>
            停止
          </Button>
        </div>
      )
    }
  }

  return (
    <div className={styles.container}>
      {/* 专注事项侧边栏 */}
      <FocusItemSidebar
        items={items}
        currentItem={currentItem || sessionFocusItem}
        onSelectItem={handleSidebarSelectItem}
        isTimerRunning={status === TIMER_STATUS.RUNNING || status === TIMER_STATUS.PAUSED}
      />

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
              <span className={styles.statValue}>{formatTime(displayStats.totalTime)}</span>
              <span className={styles.statLabel}>累计时长</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{displayStats.totalPomodoros} 次</span>
              <span className={styles.statLabel}>完成番茄钟</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{displayStats.currentSession} 次</span>
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

      {/* Phase 2: 休息结束提示 Modal */}
      <BreakEndModal
        isOpen={sessionState === SESSION_STATE.BREAK_END}
        onContinue={handleContinueWork}
        onSkip={handleStopSession}
        sessionStats={{
          completedPomodoros,
          focusItemName: sessionFocusItem?.name || '',
          breakType: lastBreakType || 'short_break'
        }}
      />

      {/* 切换事项确认 Modal */}
      <Modal
        visible={showSwitchConfirm}
        title="切换专注事项"
        onClose={handleCancelSwitch}
        size="small"
      >
        <div className={styles.switchConfirm}>
          <p className={styles.confirmText}>
            当前计时器正在运行,切换事项将结束当前会话。
          </p>
          <div className={styles.confirmInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>当前事项:</span>
              <span className={styles.infoValue}>
                {currentItem?.icon} {currentItem?.name}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>切换至:</span>
              <span className={styles.infoValue}>
                {pendingItem?.icon} {pendingItem?.name}
              </span>
            </div>
          </div>
          <div className={styles.confirmActions}>
            <Button
              type="primary"
              size="medium"
              onClick={() => handleConfirmSwitch(true)}
            >
              保存进度并切换
            </Button>
            <Button
              type="default"
              size="medium"
              onClick={handleCancelSwitch}
            >
              取消
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Home
