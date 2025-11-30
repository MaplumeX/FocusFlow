/**
 * FocusFlow - 系统通知模块
 *
 * 功能:
 * - 显示系统通知
 * - 支持工作结束、休息结束等不同通知类型
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import { Notification } from 'electron'

/**
 * 显示系统通知
 * @param {Object} options - 通知选项
 * @param {string} options.title - 通知标题
 * @param {string} options.body - 通知内容
 * @param {string} [options.icon] - 通知图标路径(可选)
 */
export function showNotification({ title, body, icon }) {
  try {
    // 检查系统是否支持通知
    if (!Notification.isSupported()) {
      console.warn('System notifications are not supported')
      return
    }

    // 创建通知
    const notification = new Notification({
      title,
      body,
      icon, // 可选:自定义图标
      silent: false // 播放系统默认声音
    })

    // 显示通知
    notification.show()

    // 可选:处理通知点击事件
    notification.on('click', () => {
      console.log('Notification clicked')
      // 可以在这里添加点击通知后的行为,例如聚焦应用窗口
    })

    console.log('Notification shown:', title)
  } catch (error) {
    console.error('Failed to show notification:', error)
  }
}

/**
 * 显示工作结束通知
 * @param {string} itemName - 专注事项名称
 * @param {number} duration - 工作时长(分钟)
 */
export function showWorkCompleteNotification(itemName, duration) {
  showNotification({
    title: '🎯 专注时间结束!',
    body: `${itemName} - 已完成 ${duration} 分钟的专注工作,休息一下吧~`
  })
}

/**
 * 显示休息结束通知
 * @param {string} type - 休息类型 ('short' | 'long')
 */
export function showBreakCompleteNotification(type = 'short') {
  const typeText = type === 'long' ? '长休息' : '短休息'
  showNotification({
    title: '⏰ 休息时间结束!',
    body: `${typeText}已结束,准备开始下一个专注时段吧!`
  })
}
