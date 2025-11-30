/**
 * FocusFlow - 休息结束提示组件
 *
 * 功能:
 * - 显示休息结束的提示
 * - 提供"继续工作"按钮
 * - 显示本次会话统计
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import Modal from './Modal'
import Button from './Button'
import styles from './BreakEndModal.module.css'

function BreakEndModal({ isOpen, onContinue, onSkip, sessionStats }) {
  if (!isOpen) {
    return null
  }

  const {
    completedPomodoros = 0,
    focusItemName = '',
    breakType = 'short_break'
  } = sessionStats || {}

  const isLongBreak = breakType === 'long_break'

  return (
    <Modal isOpen={isOpen} onClose={onContinue}>
      <div className={styles.container}>
        {/* 休息结束图标 */}
        <div className={styles.icon}>
          {isLongBreak ? '🌟' : '⏰'}
        </div>

        {/* 标题 */}
        <h2 className={styles.title}>
          {isLongBreak ? '长休息结束!' : '休息结束!'}
        </h2>

        {/* 提示信息 */}
        <p className={styles.message}>
          {isLongBreak
            ? '感觉如何?准备好迎接新的挑战了吗?'
            : '短暂的休息结束了,让我们继续专注吧!'}
        </p>

        {/* 会话统计 */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>专注事项</span>
            <span className={styles.statValue}>{focusItemName}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>已完成</span>
            <span className={styles.statValue}>{completedPomodoros} 个番茄钟</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className={styles.actions}>
          <Button
            type="primary"
            size="large"
            onClick={onContinue}
          >
            继续工作 🚀
          </Button>
        </div>

        {/* 跳过提示 */}
        {onSkip && (
          <div className={styles.skipHint}>
            <button className={styles.skipButton} onClick={onSkip}>
              暂时停止
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default BreakEndModal
