/**
 * FocusFlow - 网络状态检测工具
 *
 * 功能：
 * - 检测在线/离线状态
 * - 监听网络状态变化
 *
 * @author FocusFlow Team
 * @created 2025-12-04
 */

/**
 * 检查是否在线
 *
 * @returns {boolean}
 */
export function isOnline() {
  return navigator.onLine
}

/**
 * 监听网络状态变化
 *
 * @param {Function} onOnline - 在线回调
 * @param {Function} onOffline - 离线回调
 * @returns {Function} 取消监听函数
 */
export function watchNetworkStatus(onOnline, onOffline) {
  const handleOnline = () => {
    console.log('网络已连接')
    onOnline && onOnline()
  }

  const handleOffline = () => {
    console.log('网络已断开')
    onOffline && onOffline()
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // 返回清理函数
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}
