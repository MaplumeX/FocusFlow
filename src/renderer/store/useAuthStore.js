/**
 * FocusFlow - 用户认证状态管理
 *
 * 功能：
 * - 管理用户登录状态
 * - 管理用户会话
 * - 提供认证相关方法
 *
 * @author FocusFlow Team
 * @created 2025-12-04
 */

import { create } from 'zustand'
import { supabase, getCurrentUser } from '../utils/supabase'

const useAuthStore = create((set, get) => ({
  // 状态
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  /**
   * 初始化认证状态
   * 检查是否已登录
   */
  initAuth: async () => {
    try {
      set({ isLoading: true, error: null })

      // 获取当前会话
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      if (session) {
        set({
          user: session.user,
          session,
          isAuthenticated: true,
          isLoading: false
        })
      } else {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false
        })
      }
    } catch (error) {
      console.error('初始化认证失败:', error)
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message
      })
    }
  },

  /**
   * 用户注册
   *
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  signUp: async (email, password) => {
    try {
      set({ isLoading: true, error: null })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      })

      if (error) {
        throw error
      }

      set({ isLoading: false })

      return {
        success: true,
        needsEmailConfirmation: !data.session
      }
    } catch (error) {
      console.error('注册失败:', error)
      set({ isLoading: false, error: error.message })
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * 用户登录
   *
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  signIn: async (email, password) => {
    try {
      set({ isLoading: true, error: null })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: true,
        isLoading: false
      })

      return { success: true }
    } catch (error) {
      console.error('登录失败:', error)
      set({ isLoading: false, error: error.message })
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * 用户登出
   *
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  signOut: async () => {
    try {
      set({ isLoading: true, error: null })

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false
      })

      return { success: true }
    } catch (error) {
      console.error('登出失败:', error)
      set({ isLoading: false, error: error.message })
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * 清除错误信息
   */
  clearError: () => {
    set({ error: null })
  },

  /**
   * 监听认证状态变化
   */
  setupAuthListener: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session)

        if (session) {
          set({
            user: session.user,
            session,
            isAuthenticated: true
          })
        } else {
          set({
            user: null,
            session: null,
            isAuthenticated: false
          })
        }
      }
    )

    // 返回取消订阅函数
    return () => {
      subscription.unsubscribe()
    }
  }
}))

export default useAuthStore
