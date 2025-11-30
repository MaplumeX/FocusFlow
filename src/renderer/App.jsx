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
import styles from './App.module.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

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
