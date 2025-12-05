/**
 * FocusFlow - 数据同步引擎
 *
 * 功能：
 * - 本地数据上传到云端
 * - 云端数据下载到本地
 * - 增量同步优化
 * - 冲突检测和解决
 *
 * @author FocusFlow Team
 * @created 2025-12-04
 */

import { supabase } from './supabase'

/**
 * 同步状态枚举
 */
export const SyncStatus = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  SUCCESS: 'success',
  ERROR: 'error'
}

/**
 * 生成UUID (用于云端ID)
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 上传专注事项到云端
 *
 * @param {object} user - 当前用户
 * @param {array} localItems - 本地专注事项
 * @returns {Promise<{success: boolean, uploaded: number, error?: string}>}
 */
export async function uploadFocusItems(user, localItems) {
  try {
    if (!user || !localItems || localItems.length === 0) {
      return { success: true, uploaded: 0 }
    }

    // 转换本地数据为云端格式
    const cloudItems = localItems.map(item => ({
      id: `local-${item.id}`, // 使用本地ID作为云端ID (添加前缀避免冲突)
      user_id: user.id,
      name: item.name,
      icon: item.icon || '📝',
      color: item.color || '#8b5cf6',
      work_duration: item.work_duration * 60, // 分钟 → 秒
      short_break_duration: item.short_break * 60,
      long_break_duration: item.long_break * 60,
      pomodoros_until_long_break: item.long_break_interval || 4,
      auto_start_breaks: true,
      auto_start_pomodoros: false,
      is_archived: item.is_deleted === 1,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted_at: item.is_deleted === 1 ? item.updated_at : null
    }))

    // 使用 upsert 上传 (存在则更新,不存在则插入)
    const { data, error } = await supabase
      .from('focus_items')
      .upsert(cloudItems, {
        onConflict: 'id',
        ignoreDuplicates: false
      })

    if (error) {
      throw error
    }

    console.log(`上传了 ${cloudItems.length} 个专注事项`)
    return { success: true, uploaded: cloudItems.length }
  } catch (error) {
    console.error('上传专注事项失败:', error)
    return {
      success: false,
      uploaded: 0,
      error: error.message
    }
  }
}

/**
 * 从云端下载专注事项
 *
 * @param {object} user - 当前用户
 * @returns {Promise<{success: boolean, items: array, error?: string}>}
 */
export async function downloadFocusItems(user) {
  try {
    if (!user) {
      return { success: false, items: [], error: '用户未登录' }
    }

    // 查询云端数据
    const { data, error } = await supabase
      .from('focus_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // 转换云端数据为本地格式
    const localItems = data.map(item => ({
      // 注意：本地ID从云端ID提取（去除 'local-' 前缀）
      id: item.id.startsWith('local-') ? parseInt(item.id.replace('local-', '')) : null,
      name: item.name,
      icon: item.icon,
      color: item.color,
      work_duration: Math.floor(item.work_duration / 60), // 秒 → 分钟
      short_break: Math.floor(item.short_break_duration / 60),
      long_break: Math.floor(item.long_break_duration / 60),
      long_break_interval: item.pomodoros_until_long_break,
      total_focus_time: 0, // 本地计算
      total_sessions: 0, // 本地计算
      created_at: item.created_at,
      updated_at: item.updated_at,
      is_deleted: item.is_archived ? 1 : 0
    }))

    console.log(`下载了 ${localItems.length} 个专注事项`)
    return { success: true, items: localItems }
  } catch (error) {
    console.error('下载专注事项失败:', error)
    return {
      success: false,
      items: [],
      error: error.message
    }
  }
}

/**
 * 上传专注会话到云端
 *
 * @param {object} user - 当前用户
 * @param {array} localSessions - 本地专注会话
 * @returns {Promise<{success: boolean, uploaded: number, error?: string}>}
 */
export async function uploadFocusSessions(user, localSessions) {
  try {
    if (!user || !localSessions || localSessions.length === 0) {
      return { success: true, uploaded: 0 }
    }

    const cloudSessions = localSessions.map(session => ({
      id: `local-session-${session.id}`,
      user_id: user.id,
      focus_item_id: `local-${session.focus_item_id}`,
      start_time: session.started_at,
      end_time: session.ended_at,
      total_duration: session.ended_at ? session.ended_at - session.started_at : 0,
      completed_pomodoros: session.completed_pomodoros || 0,
      is_completed: session.is_active === 0 ? true : false,
      notes: null,
      created_at: session.started_at,
      updated_at: session.ended_at || session.started_at,
      deleted_at: null
    }))

    const { data, error } = await supabase
      .from('focus_sessions')
      .upsert(cloudSessions, {
        onConflict: 'id',
        ignoreDuplicates: false
      })

    if (error) {
      throw error
    }

    console.log(`上传了 ${cloudSessions.length} 个专注会话`)
    return { success: true, uploaded: cloudSessions.length }
  } catch (error) {
    console.error('上传专注会话失败:', error)
    return {
      success: false,
      uploaded: 0,
      error: error.message
    }
  }
}

/**
 * 上传番茄钟记录到云端
 *
 * @param {object} user - 当前用户
 * @param {array} localRecords - 本地番茄钟记录
 * @returns {Promise<{success: boolean, uploaded: number, error?: string}>}
 */
export async function uploadPomodoroRecords(user, localRecords) {
  try {
    if (!user || !localRecords || localRecords.length === 0) {
      return { success: true, uploaded: 0 }
    }

    const cloudRecords = localRecords.map(record => ({
      id: `local-pomodoro-${record.id}`,
      user_id: user.id,
      session_id: `local-session-${record.session_id}`,
      focus_item_id: `local-${record.focus_item_id}`,
      type: 'work', // 本地只记录工作番茄钟
      planned_duration: record.duration,
      actual_duration: record.duration,
      start_time: record.start_time,
      end_time: record.end_time,
      is_completed: record.is_completed === 1,
      is_skipped: false,
      created_at: record.start_time,
      updated_at: record.end_time,
      deleted_at: null
    }))

    const { data, error } = await supabase
      .from('pomodoro_records')
      .upsert(cloudRecords, {
        onConflict: 'id',
        ignoreDuplicates: false
      })

    if (error) {
      throw error
    }

    console.log(`上传了 ${cloudRecords.length} 个番茄钟记录`)
    return { success: true, uploaded: cloudRecords.length }
  } catch (error) {
    console.error('上传番茄钟记录失败:', error)
    return {
      success: false,
      uploaded: 0,
      error: error.message
    }
  }
}

/**
 * 全量同步 (首次登录或手动全量同步)
 *
 * @param {object} user - 当前用户
 * @returns {Promise<{success: boolean, stats: object, error?: string}>}
 */
export async function fullSync(user) {
  try {
    if (!user) {
      return { success: false, error: '用户未登录' }
    }

    console.log('开始全量同步...')

    // 1. 获取本地数据
    const localItems = await window.api.getFocusItems()
    const localSessions = await window.api.getAllSessions()
    const localRecords = await window.api.getAllPomodoroRecords()

    // 2. 上传到云端
    const itemsResult = await uploadFocusItems(user, localItems)
    const sessionsResult = await uploadFocusSessions(user, localSessions)
    const recordsResult = await uploadPomodoroRecords(user, localRecords)

    // 3. 统计结果
    const stats = {
      itemsUploaded: itemsResult.uploaded,
      sessionsUploaded: sessionsResult.uploaded,
      recordsUploaded: recordsResult.uploaded
    }

    console.log('全量同步完成:', stats)

    return {
      success: true,
      stats
    }
  } catch (error) {
    console.error('全量同步失败:', error)
    return {
      success: false,
      stats: {},
      error: error.message
    }
  }
}

/**
 * 增量同步 (仅同步变更的数据)
 *
 * @param {object} user - 当前用户
 * @param {number} lastSyncTime - 上次同步时间戳
 * @returns {Promise<{success: boolean, stats: object, error?: string}>}
 */
export async function incrementalSync(user, lastSyncTime) {
  try {
    if (!user) {
      return { success: false, error: '用户未登录' }
    }

    console.log('开始增量同步,上次同步时间:', new Date(lastSyncTime * 1000))

    // 获取自上次同步后变更的本地数据
    const localItems = await window.api.getFocusItems()
    const changedItems = localItems.filter(item => item.updated_at > lastSyncTime)

    // 上传变更的数据
    const itemsResult = await uploadFocusItems(user, changedItems)

    const stats = {
      itemsUploaded: itemsResult.uploaded
    }

    console.log('增量同步完成:', stats)

    return {
      success: true,
      stats
    }
  } catch (error) {
    console.error('增量同步失败:', error)
    return {
      success: false,
      stats: {},
      error: error.message
    }
  }
}
