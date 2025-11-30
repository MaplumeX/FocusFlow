/**
 * FocusFlow - 设置页面(占位)
 *
 * Phase 1 暂不实现
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

function Settings() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '40px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', color: '#333', marginBottom: '16px' }}>
          ⚙️ 设置
        </h1>
        <p style={{ color: '#999', fontSize: '15px' }}>
          此功能将在 Phase 2 实现
        </p>
        <p style={{ color: '#ccc', fontSize: '13px', marginTop: '8px' }}>
          敬请期待...
        </p>
      </div>
    </div>
  )
}

export default Settings
