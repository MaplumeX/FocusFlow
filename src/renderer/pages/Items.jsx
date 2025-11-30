/**
 * FocusFlow - 专注事项管理页面
 *
 * 功能:
 * - 显示所有专注事项
 * - 测试数据库 CRUD 操作
 */

import { useState, useEffect } from 'react'

function Items() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 加载专注事项
  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    try {
      setLoading(true)
      setError(null)

      const result = await window.api.getFocusItems()

      if (result.success) {
        setItems(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 删除事项
  async function handleDelete(id) {
    if (!confirm('确定要删除这个专注事项吗?')) {
      return
    }

    try {
      const result = await window.api.deleteFocusItem(id)

      if (result.success) {
        // 重新加载列表
        loadItems()
      } else {
        alert('删除失败: ' + result.error)
      }
    } catch (err) {
      alert('删除失败: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px' }}>
        <h1>专注事项管理</h1>
        <p style={{ color: 'red' }}>错误: {error}</p>
        <button onClick={loadItems}>重试</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>专注事项管理</h1>
        <button style={{
          padding: '10px 20px',
          background: '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}>
          + 新建事项
        </button>
      </div>

      <p style={{ marginBottom: '20px', color: '#666' }}>
        共 {items.length} 个专注事项
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {items.map(item => (
          <div key={item.id} style={{
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontSize: '32px', marginRight: '12px' }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, color: item.color }}>{item.name}</h3>
              </div>
            </div>

            <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
              <p style={{ margin: '5px 0' }}>🔥 工作: {item.work_duration} 分钟</p>
              <p style={{ margin: '5px 0' }}>☕ 短休息: {item.short_break} 分钟</p>
              <p style={{ margin: '5px 0' }}>🌴 长休息: {item.long_break} 分钟</p>
              <p style={{ margin: '5px 0' }}>📊 间隔: 每 {item.long_break_interval} 个番茄钟</p>
            </div>

            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f0f0f0', fontSize: '12px', color: '#999' }}>
              <p style={{ margin: '5px 0' }}>累计时长: {Math.floor(item.total_focus_time / 60)} 分钟</p>
              <p style={{ margin: '5px 0' }}>完成次数: {item.total_sessions} 次</p>
            </div>

            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button style={{
                flex: 1,
                padding: '8px',
                background: 'white',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                编辑
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: 'white',
                  border: '1px solid #ff4d4f',
                  color: '#ff4d4f',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
          <p>还没有专注事项</p>
          <p>点击"新建事项"创建第一个吧!</p>
        </div>
      )}
    </div>
  )
}

export default Items
