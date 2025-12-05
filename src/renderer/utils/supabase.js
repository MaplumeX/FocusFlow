/**
 * FocusFlow - Supabase 客户端配置
 *
 * 功能：
 * - 初始化 Supabase 客户端
 * - 提供统一的客户端实例
 * - 处理环境变量配置
 *
 * @author FocusFlow Team
 * @created 2025-12-04
 */

import { createClient } from '@supabase/supabase-js'

// 从环境变量读取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 验证配置是否存在
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 配置缺失，云端同步功能将不可用')
  console.warn('请创建 .env.local 文件并配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
}

/**
 * Supabase 客户端实例
 *
 * 配置项：
 * - auth.persistSession: 持久化用户会话
 * - auth.autoRefreshToken: 自动刷新 Token
 */
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
})

/**
 * 检查 Supabase 配置是否完整
 *
 * @returns {boolean} 配置是否完整
 */
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

/**
 * 获取当前用户
 *
 * @returns {Promise<{user: object | null, error: object | null}>}
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()
    return { user: data.user, error }
  } catch (error) {
    console.error('获取用户失败:', error)
    return { user: null, error }
  }
}

/**
 * 检查用户是否已登录
 *
 * @returns {Promise<boolean>}
 */
export const isUserLoggedIn = async () => {
  const { user } = await getCurrentUser()
  return !!user
}
