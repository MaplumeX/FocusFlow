/**
 * FocusFlow - 设置页面
 *
 * 功能：
 * - 账户管理（登录/登出）
 * - 云端同步设置
 * - 显示同步状态
 *
 * @author FocusFlow Team
 * @created 2025-12-04
 */

import { useEffect } from 'react'
import useAuthStore from '../store/useAuthStore'
import useSyncStore from '../store/useSyncStore'
import { isSupabaseConfigured } from '../utils/supabase'
import { formatDate } from '../utils/format'
import AuthForm from '../components/AuthForm'
import styles from './Settings.module.css'

function Settings() {
  const { user, isAuthenticated, isLoading, signOut, initAuth } = useAuthStore()
  const {
    status,
    lastSyncTime,
    stats,
    error: syncError,
    sync,
    restoreLastSyncTime
  } = useSyncStore()

  // 初始化
  useEffect(() => {
    initAuth()
    restoreLastSyncTime()
  }, [initAuth, restoreLastSyncTime])

  // 如果 Supabase 未配置
  if (!isSupabaseConfigured()) {
    return (
      <div className={styles.container}>
        <div className={styles.notConfigured}>
          <h2>⚠️ 云端同步未配置</h2>
          <p>请配置 Supabase 以使用云端同步功能</p>
          <div className={styles.steps}>
            <p>1. 创建 .env.local 文件</p>
            <p>2. 添加 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY</p>
            <p>3. 重启应用</p>
          </div>
        </div>
      </div>
    )
  }

  // 如果未登录，显示登录表单
  if (!isLoading && !isAuthenticated) {
    return <AuthForm />
  }

  // 处理登出
  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      console.log('登出成功')
    }
  }

  // 手动同步
  const handleManualSync = async () => {
    await sync(user, false)
  }

  // 全量同步
  const handleFullSync = async () => {
    if (window.confirm('确定要执行全量同步吗？这会覆盖云端的所有数据。')) {
      await sync(user, true)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>⚙️ 设置</h1>
      </div>

      {/* 账户信息 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>账户信息</h2>
        <div className={styles.card}>
          {isLoading ? (
            <p>加载中...</p>
          ) : (
            <>
              <div className={styles.infoRow}>
                <span className={styles.label}>邮箱</span>
                <span className={styles.value}>{user?.email || '未登录'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>用户 ID</span>
                <span className={styles.value}>{user?.id || '-'}</span>
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.dangerButton}
                  onClick={handleSignOut}
                >
                  登出
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 同步状态 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>云端同步</h2>
        <div className={styles.card}>
          <div className={styles.infoRow}>
            <span className={styles.label}>同步状态</span>
            <span className={`${styles.value} ${styles.statusBadge}`}>
              {status === 'syncing' && '🔄 同步中'}
              {status === 'success' && '✅ 已同步'}
              {status === 'error' && '❌ 同步失败'}
              {status === 'idle' && '⏸️ 未同步'}
            </span>
          </div>

          {lastSyncTime && (
            <div className={styles.infoRow}>
              <span className={styles.label}>最后同步</span>
              <span className={styles.value}>
                {formatDate(lastSyncTime * 1000)} {new Date(lastSyncTime * 1000).toLocaleTimeString('zh-CN')}
              </span>
            </div>
          )}

          {stats && stats.itemsUploaded > 0 && (
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>专注事项</span>
                <span className={styles.statValue}>{stats.itemsUploaded}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>专注会话</span>
                <span className={styles.statValue}>{stats.sessionsUploaded || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>番茄钟</span>
                <span className={styles.statValue}>{stats.recordsUploaded || 0}</span>
              </div>
            </div>
          )}

          {syncError && (
            <div className={styles.errorMessage}>
              {syncError}
            </div>
          )}

          <div className={styles.actions}>
            <button
              className={styles.primaryButton}
              onClick={handleManualSync}
              disabled={status === 'syncing'}
            >
              {status === 'syncing' ? '同步中...' : '立即同步'}
            </button>
            <button
              className={styles.secondaryButton}
              onClick={handleFullSync}
              disabled={status === 'syncing'}
            >
              全量同步
            </button>
          </div>
        </div>
      </section>

      {/* 说明 */}
      <section className={styles.section}>
        <div className={styles.infoBox}>
          <h3>💡 同步说明</h3>
          <ul>
            <li>应用每5分钟自动同步一次</li>
            <li>网络恢复后会自动同步</li>
            <li>离线时数据保存在本地</li>
            <li>全量同步会覆盖云端数据</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

export default Settings
