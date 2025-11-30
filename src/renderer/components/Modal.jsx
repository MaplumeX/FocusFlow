/**
 * FocusFlow - Modal 组件
 *
 * 功能:
 * - 模态对话框
 * - 支持标题、内容、底部按钮
 * - 点击遮罩层关闭
 * - ESC 键关闭
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import { useEffect } from 'react'
import styles from './Modal.module.css'

function Modal({
  visible = false,
  title,
  children,
  footer,
  size = 'medium',
  onClose,
  closable = true,
  maskClosable = true
}) {
  // ESC 键关闭
  useEffect(() => {
    if (!visible || !closable) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [visible, closable, onClose])

  // 阻止滚动
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [visible])

  if (!visible) return null

  // 点击遮罩层关闭
  const handleOverlayClick = (e) => {
    if (maskClosable && e.target === e.currentTarget) {
      onClose?.()
    }
  }

  // 获取 Modal 样式类
  const getModalClassName = () => {
    let className = styles.modal
    if (styles[size]) {
      className += ` ${styles[size]}`
    }
    return className
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={getModalClassName()}>
        {(title || closable) && (
          <div className={styles.header}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {closable && (
              <button
                className={styles.closeButton}
                onClick={onClose}
                aria-label="关闭"
              >
                ×
              </button>
            )}
          </div>
        )}

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  )
}

export default Modal
