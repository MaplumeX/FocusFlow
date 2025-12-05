/**
 * FocusFlow - 认证表单组件
 *
 * 功能：
 * - 用户注册
 * - 用户登录
 * - 表单切换
 *
 * @author FocusFlow Team
 * @created 2025-12-04
 */

import { useState } from 'react'
import useAuthStore from '../store/useAuthStore'
import styles from './AuthForm.module.css'

function AuthForm() {
  const [mode, setMode] = useState('signin') // 'signin' 或 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const { signIn, signUp, isLoading, error, clearError } = useAuthStore()

  // 处理提交
  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    clearError()

    // 表单验证
    if (!email || !password) {
      setMessage({ type: 'error', text: '请填写完整信息' })
      return
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的密码不一致' })
      return
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: '密码长度至少为 6 位' })
      return
    }

    // 执行登录或注册
    if (mode === 'signin') {
      const result = await signIn(email, password)
      if (result.success) {
        setMessage({ type: 'success', text: '登录成功！' })
      } else {
        setMessage({ type: 'error', text: result.error || '登录失败' })
      }
    } else {
      const result = await signUp(email, password)
      if (result.success) {
        if (result.needsEmailConfirmation) {
          setMessage({
            type: 'success',
            text: '注册成功！请查看邮箱完成验证。'
          })
        } else {
          setMessage({ type: 'success', text: '注册成功！' })
        }
        // 切换到登录模式
        setMode('signin')
        setPassword('')
        setConfirmPassword('')
      } else {
        setMessage({ type: 'error', text: result.error || '注册失败' })
      }
    }
  }

  // 切换模式
  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setMessage({ type: '', text: '' })
    clearError()
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.logo}>🎯 FocusFlow</h1>
          <p className={styles.subtitle}>
            {mode === 'signin' ? '登录你的账号' : '创建新账号'}
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              邮箱地址
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              密码
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="至少 6 位字符"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {mode === 'signup' && (
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                确认密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={styles.input}
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          )}

          {(message.text || error) && (
            <div
              className={
                message.type === 'error' || error
                  ? styles.messageError
                  : styles.messageSuccess
              }
            >
              {message.text || error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading
              ? '处理中...'
              : mode === 'signin'
              ? '登录'
              : '注册'}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            {mode === 'signin' ? '还没有账号？' : '已有账号？'}
            <button
              type="button"
              className={styles.toggleButton}
              onClick={toggleMode}
              disabled={isLoading}
            >
              {mode === 'signin' ? '立即注册' : '立即登录'}
            </button>
          </p>
        </div>
      </div>

      <div className={styles.offline}>
        <p className={styles.offlineText}>
          💡 提示：即使没有账号，也可以使用本地功能
        </p>
      </div>
    </div>
  )
}

export default AuthForm
