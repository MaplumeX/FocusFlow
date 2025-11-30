/**
 * FocusFlow - 专注事项管理页面
 *
 * 功能:
 * - 显示所有专注事项（使用 FocusItemCard）
 * - 新建事项（使用 FocusItemForm）
 * - 编辑事项（使用 FocusItemForm）
 * - 删除事项（使用 Modal 确认）
 * - 使用 useFocusStore 进行状态管理
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import { useState, useEffect } from 'react'
import useFocusStore from '../store/useFocusStore'
import FocusItemCard from '../components/FocusItemCard'
import FocusItemForm from '../components/FocusItemForm'
import Modal from '../components/Modal'
import Button from '../components/Button'
import styles from './Items.module.css'

function Items() {
  // 从 store 获取状态和操作
  const {
    items,
    loading,
    error,
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    clearError
  } = useFocusStore()

  // 本地状态
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)

  // 加载专注事项
  useEffect(() => {
    loadItems()
  }, [loadItems])

  // 处理创建事项
  const handleCreate = async (formData) => {
    const success = await createItem(formData)
    if (success) {
      setShowCreateModal(false)
    }
  }

  // 处理编辑事项
  const handleEdit = (item) => {
    setEditingItem(item)
    setShowEditModal(true)
  }

  const handleUpdate = async (formData) => {
    const success = await updateItem(editingItem.id, formData)
    if (success) {
      setShowEditModal(false)
      setEditingItem(null)
    }
  }

  // 处理删除事项
  const handleDeleteClick = (item) => {
    setDeletingItem(item)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    const success = await deleteItem(deletingItem.id)
    if (success) {
      setShowDeleteModal(false)
      setDeletingItem(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setDeletingItem(null)
  }

  // 加载状态
  if (loading && items.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <p className={styles.loadingText}>加载中...</p>
      </div>
    )
  }

  // 错误状态
  if (error && items.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <h1 className={styles.title}>专注事项管理</h1>
        <p className={styles.errorText}>错误: {error}</p>
        <Button
          type="primary"
          onClick={() => {
            clearError()
            loadItems()
          }}
        >
          重试
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 页头 */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>专注事项管理</h1>
          <p className={styles.subtitle}>共 {items.length} 个专注事项</p>
        </div>
        <Button
          type="primary"
          size="large"
          onClick={() => setShowCreateModal(true)}
        >
          + 新建事项
        </Button>
      </div>

      {/* 事项列表 */}
      {items.length > 0 ? (
        <div className={styles.grid}>
          {items.map(item => (
            <FocusItemCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>还没有专注事项</p>
          <p className={styles.emptyHint}>点击"新建事项"创建第一个吧!</p>
        </div>
      )}

      {/* 创建事项 Modal */}
      <Modal
        visible={showCreateModal}
        title="创建专注事项"
        onClose={() => setShowCreateModal(false)}
        size="medium"
      >
        <FocusItemForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* 编辑事项 Modal */}
      <Modal
        visible={showEditModal}
        title="编辑专注事项"
        onClose={() => {
          setShowEditModal(false)
          setEditingItem(null)
        }}
        size="medium"
      >
        <FocusItemForm
          initialData={editingItem}
          onSubmit={handleUpdate}
          onCancel={() => {
            setShowEditModal(false)
            setEditingItem(null)
          }}
        />
      </Modal>

      {/* 删除确认 Modal */}
      <Modal
        visible={showDeleteModal}
        title="删除确认"
        onClose={handleDeleteCancel}
        size="small"
      >
        <div className={styles.deleteConfirm}>
          <p className={styles.deleteMessage}>
            确定要删除专注事项 <strong>{deletingItem?.name}</strong> 吗?
          </p>
          <p className={styles.deleteWarning}>
            此操作不可恢复,所有相关的统计数据也会被删除。
          </p>
          <div className={styles.deleteActions}>
            <Button type="default" onClick={handleDeleteCancel}>
              取消
            </Button>
            <Button type="danger" onClick={handleDeleteConfirm}>
              确认删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Items
