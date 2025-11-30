/**
 * FocusFlow - 主页
 *
 * 功能:
 * - 集成 Timer 组件
 * - 控制按钮(开始/暂停/停止)
 * - 专注事项选择
 */

import { useState, useEffect } from 'react'
import Timer from '../components/Timer'
import Button from '../components/Button'
import Modal from '../components/Modal'
import useTimerStore, { TIMER_STATUS, TIMER_MODE } from '../store/useTimerStore'
import useFocusStore from '../store/useFocusStore'

function Home() {
  const [showItemSelect, setShowItemSelect] = useState(false)

  // Timer Store
  const { status, currentItem, start, pause, resume, stop } = useTimerStore()

  // Focus Store
  const { items, loadItems } = useFocusStore()

  useEffect(() => {
    loadItems()
  }, [loadItems])

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
        <div style={{ display: 'flex', gap: '12px' }}>
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
        <div style={{ display: 'flex', gap: '12px' }}>
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '40px'
    }}>
      <Timer />

      <div style={{ marginTop: '40px' }}>
        {renderControls()}
      </div>

      {/* 专注事项选择 Modal */}
      <Modal
        visible={showItemSelect}
        title="选择专注事项"
        onClose={() => setShowItemSelect(false)}
        size="small"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
              还没有专注事项,请先创建一个
            </p>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                onClick={() => handleSelectItem(item)}
                style={{
                  padding: '16px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1890ff'
                  e.currentTarget.style.background = '#f0f9ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d9d9d9'
                  e.currentTarget.style.background = 'white'
                }}
              >
                <span style={{ fontSize: '24px' }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: item.color }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
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
