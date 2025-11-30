/**
 * FocusFlow - Button 组件
 *
 * 功能:
 * - 通用按钮组件
 * - 支持多种类型 (primary/default/danger/success/warning)
 * - 支持禁用状态
 * - 支持不同大小
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import styles from './Button.module.css'

function Button({
  children,
  type = 'default',
  size = 'medium',
  block = false,
  disabled = false,
  onClick,
  ...rest
}) {
  // 组合 className
  const getClassName = () => {
    let className = styles.button

    // 类型样式
    if (styles[type]) {
      className += ` ${styles[type]}`
    }

    // 大小样式
    if (size !== 'medium' && styles[size]) {
      className += ` ${styles[size]}`
    }

    // 块级样式
    if (block) {
      className += ` ${styles.block}`
    }

    return className
  }

  return (
    <button
      className={getClassName()}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
