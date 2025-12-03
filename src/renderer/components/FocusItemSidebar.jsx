/**
 * FocusFlow - 专注事项侧边栏
 *
 * 功能:
 * - 侧边栏显示所有专注事项
 * - 支持展开/收起
 * - 点击事项卡片快速切换
 * - 高亮当前选中的事项
 * - 收起时显示图标,展开时显示完整信息
 *
 * @author FocusFlow Team
 * @created 2025-12-03
 */

import { useState } from 'react'
import styles from './FocusItemSidebar.module.css'

function FocusItemSidebar({ items, currentItem, onSelectItem, isTimerRunning }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // 处理事项点击
  const handleItemClick = (item) => {
    // 如果点击的是当前事项,不做处理
    if (currentItem && currentItem.id === item.id) {
      return
    }

    // 调用父组件的选择回调
    onSelectItem(item)
  }

  // 切换展开/收起
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className={`${styles.sidebar} ${isExpanded ? styles.expanded : styles.collapsed}`}>
      {/* 切换按钮 */}
      <button
        className={styles.toggleButton}
        onClick={toggleSidebar}
        title={isExpanded ? '收起侧边栏' : '展开侧边栏'}
      >
        {isExpanded ? '◀' : '▶'}
      </button>

      {/* 侧边栏内容 */}
      <div className={styles.content}>
        {/* 标题 */}
        {isExpanded && (
          <div className={styles.header}>
            <h3 className={styles.title}>专注事项</h3>
            <span className={styles.count}>{items.length}</span>
          </div>
        )}

        {/* 事项列表 */}
        <div className={styles.itemList}>
          {items.length === 0 ? (
            isExpanded && (
              <div className={styles.emptyText}>
                <p>还没有专注事项</p>
                <p className={styles.emptyHint}>前往"专注事项"页面创建</p>
              </div>
            )
          ) : (
            items.map(item => {
              const isActive = currentItem && currentItem.id === item.id

              return (
                <div
                  key={item.id}
                  className={`${styles.itemCard} ${isActive ? styles.active : ''}`}
                  onClick={() => handleItemClick(item)}
                  title={isExpanded ? '' : item.name}
                >
                  {/* 图标 */}
                  <div
                    className={styles.itemIcon}
                    style={{ backgroundColor: item.color }}
                  >
                    {item.icon}
                  </div>

                  {/* 展开时显示详细信息 */}
                  {isExpanded && (
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName} style={{ color: item.color }}>
                        {item.name}
                      </div>
                      <div className={styles.itemConfig}>
                        {item.work_duration}min / {item.short_break}min
                      </div>
                    </div>
                  )}

                  {/* 当前活动指示器 */}
                  {isActive && (
                    <div className={styles.activeIndicator} title="当前事项">
                      ●
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* 底部提示 */}
        {isExpanded && items.length > 0 && (
          <div className={styles.footer}>
            <p className={styles.hint}>
              {isTimerRunning
                ? '⚠️ 切换将结束当前会话'
                : '💡 点击事项选择,再点开始'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FocusItemSidebar
