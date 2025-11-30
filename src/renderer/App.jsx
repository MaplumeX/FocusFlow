/**
 * FocusFlow - 根组件
 *
 * 功能:
 * - 页面路由(使用条件渲染,不使用 React Router)
 * - 导航栏
 * - 全局状态初始化
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Items from './pages/Items'
import Stats from './pages/Stats'
import Settings from './pages/Settings'
import useSessionStore from './store/useSessionStore'
import useFocusStore from './store/useFocusStore'
import styles from './App.module.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [isRestoringSession, setIsRestoringSession] = useState(true)

  // 应用启动时恢复会话
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await window.api.getActiveSession()

        if (response.success && response.data) {
          const session = response.data

          // 获取专注事项详细信息
          const itemResponse = await window.api.getFocusItemById(session.focus_item_id)

          if (itemResponse.success && itemResponse.data) {
            const sessionStore = useSessionStore.getState()
            const focusStore = useFocusStore.getState()

            // 恢复会话状态
            sessionStore.set({
              sessionId: session.id,
              focusItem: itemResponse.data,
              sessionConfig: {
                workDuration: session.config_work_duration,
                shortBreak: session.config_short_break,
                longBreak: session.config_long_break,
                longBreakInterval: session.config_long_break_interval
              },
              completedPomodoros: session.completed_pomodoros || 0,
              state: 'idle', // 刷新后默认空闲状态
              currentPomodoroId: null,
              currentPomodoroStart: null
            })

            console.log('成功恢复会话:', session.id)
          }
        }
      } catch (error) {
        console.error('恢复会话失败:', error)
      } finally {
        setIsRestoringSession(false)
      }
    }

    restoreSession()
  }, [])

  if (isRestoringSession) {
    return (
      <div className={styles.app}>
        <div className={styles.loading}>正在恢复会话...</div>
      </div>
    )
  }

  return (
    <div className={styles.app}>
      {/* 导航栏 */}
      <nav className={styles.nav}>
        <div className={styles.navTitle}>FocusFlow</div>
        <div className={styles.navLinks}>
          <button
            className={currentPage === 'home' ? styles.navLinkActive : styles.navLink}
            onClick={() => setCurrentPage('home')}
          >
            主页
          </button>
          <button
            className={currentPage === 'items' ? styles.navLinkActive : styles.navLink}
            onClick={() => setCurrentPage('items')}
          >
            专注事项
          </button>
          <button
            className={currentPage === 'stats' ? styles.navLinkActive : styles.navLink}
            onClick={() => setCurrentPage('stats')}
          >
            数据统计
          </button>
          <button
            className={currentPage === 'settings' ? styles.navLinkActive : styles.navLink}
            onClick={() => setCurrentPage('settings')}
          >
            设置
          </button>
        </div>
      </nav>

      {/* 页面内容 */}
      <main className={styles.main}>
        {currentPage === 'home' && <Home />}
        {currentPage === 'items' && <Items />}
        {currentPage === 'stats' && <Stats />}
        {currentPage === 'settings' && <Settings />}
      </main>
    </div>
  )
}

export default App
