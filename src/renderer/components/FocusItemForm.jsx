/**
 * FocusFlow - FocusItemForm 组件
 *
 * 功能:
 * - 创建/编辑专注事项表单
 * - 名称输入
 * - 图标选择
 * - 颜色选择
 * - 时长配置（工作时长、短休息、长休息、长休间隔）
 * - 表单验证
 * - 提交逻辑
 *
 * @author FocusFlow Team
 * @created 2025-11-30
 */

import { useState, useEffect } from 'react'
import styles from './FocusItemForm.module.css'
import Button from './Button'

// 预设图标列表
const PRESET_ICONS = [
  '📚', '💻', '🎨', '✍️', '🎵', '🏃',
  '📖', '🎯', '💡', '🔬', '🎸', '🎮',
  '📝', '🎬', '📱', '⚡', '🌟', '🔥'
]

// 预设颜色列表
const PRESET_COLORS = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d',
  '#722ed1', '#eb2f96', '#13c2c2', '#2f54eb',
  '#fa8c16', '#a0d911', '#fa541c', '#9254de'
]

function FocusItemForm({
  initialData = null,
  onSubmit,
  onCancel
}) {
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    icon: '📚',
    color: '#1890ff',
    work_duration: 25,
    short_break: 5,
    long_break: 15,
    long_break_interval: 4
  })

  // 验证错误
  const [errors, setErrors] = useState({})

  // 提交中状态
  const [submitting, setSubmitting] = useState(false)

  // 初始化表单数据（编辑模式）
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        icon: initialData.icon || '📚',
        color: initialData.color || '#1890ff',
        work_duration: initialData.work_duration || 25,
        short_break: initialData.short_break || 5,
        long_break: initialData.long_break || 15,
        long_break_interval: initialData.long_break_interval || 4
      })
    }
  }, [initialData])

  // 处理输入变化
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  // 验证表单
  const validateForm = () => {
    const newErrors = {}

    // 名称验证
    if (!formData.name.trim()) {
      newErrors.name = '请输入专注事项名称'
    } else if (formData.name.length > 50) {
      newErrors.name = '名称不能超过50个字符'
    }

    // 时长验证
    if (formData.work_duration < 1 || formData.work_duration > 120) {
      newErrors.work_duration = '工作时长应在1-120分钟之间'
    }
    if (formData.short_break < 1 || formData.short_break > 30) {
      newErrors.short_break = '短休息应在1-30分钟之间'
    }
    if (formData.long_break < 1 || formData.long_break > 60) {
      newErrors.long_break = '长休息应在1-60分钟之间'
    }
    if (formData.long_break_interval < 2 || formData.long_break_interval > 10) {
      newErrors.long_break_interval = '长休间隔应在2-10次之间'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理提交
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      // 将蛇形命名法转换为驼峰命名法,以匹配数据库更新函数的期望
      const submitData = {
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
        workDuration: formData.work_duration,
        shortBreak: formData.short_break,
        longBreak: formData.long_break,
        longBreakInterval: formData.long_break_interval
      }
      await onSubmit?.(submitData)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* 名称输入 */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          名称 <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="例如:阅读、编程、运动..."
          maxLength={50}
        />
        {errors.name && <span className={styles.errorText}>{errors.name}</span>}
      </div>

      {/* 图标选择 */}
      <div className={styles.formGroup}>
        <label className={styles.label}>图标</label>
        <div className={styles.iconGrid}>
          {PRESET_ICONS.map(icon => (
            <button
              key={icon}
              type="button"
              className={`${styles.iconButton} ${formData.icon === icon ? styles.iconButtonActive : ''}`}
              onClick={() => handleInputChange('icon', icon)}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* 颜色选择 */}
      <div className={styles.formGroup}>
        <label className={styles.label}>颜色</label>
        <div className={styles.colorGrid}>
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              type="button"
              className={`${styles.colorButton} ${formData.color === color ? styles.colorButtonActive : ''}`}
              style={{ background: color }}
              onClick={() => handleInputChange('color', color)}
            />
          ))}
        </div>
      </div>

      {/* 时长配置 */}
      <div className={styles.formGroup}>
        <label className={styles.label}>时长配置</label>
        <div className={styles.durationGrid}>
          <div className={styles.durationItem}>
            <label className={styles.durationLabel}>工作时长（分钟）</label>
            <input
              type="number"
              className={`${styles.input} ${errors.work_duration ? styles.inputError : ''}`}
              value={formData.work_duration}
              onChange={(e) => handleInputChange('work_duration', parseInt(e.target.value) || 0)}
              min="1"
              max="120"
            />
            {errors.work_duration && <span className={styles.errorText}>{errors.work_duration}</span>}
          </div>

          <div className={styles.durationItem}>
            <label className={styles.durationLabel}>短休息（分钟）</label>
            <input
              type="number"
              className={`${styles.input} ${errors.short_break ? styles.inputError : ''}`}
              value={formData.short_break}
              onChange={(e) => handleInputChange('short_break', parseInt(e.target.value) || 0)}
              min="1"
              max="30"
            />
            {errors.short_break && <span className={styles.errorText}>{errors.short_break}</span>}
          </div>

          <div className={styles.durationItem}>
            <label className={styles.durationLabel}>长休息（分钟）</label>
            <input
              type="number"
              className={`${styles.input} ${errors.long_break ? styles.inputError : ''}`}
              value={formData.long_break}
              onChange={(e) => handleInputChange('long_break', parseInt(e.target.value) || 0)}
              min="1"
              max="60"
            />
            {errors.long_break && <span className={styles.errorText}>{errors.long_break}</span>}
          </div>

          <div className={styles.durationItem}>
            <label className={styles.durationLabel}>长休间隔（次）</label>
            <input
              type="number"
              className={`${styles.input} ${errors.long_break_interval ? styles.inputError : ''}`}
              value={formData.long_break_interval}
              onChange={(e) => handleInputChange('long_break_interval', parseInt(e.target.value) || 0)}
              min="2"
              max="10"
            />
            {errors.long_break_interval && <span className={styles.errorText}>{errors.long_break_interval}</span>}
          </div>
        </div>
      </div>

      {/* 表单按钮 */}
      <div className={styles.formActions}>
        <Button
          type="default"
          onClick={onCancel}
          disabled={submitting}
        >
          取消
        </Button>
        <Button
          type="primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '提交中...' : (initialData ? '保存' : '创建')}
        </Button>
      </div>
    </form>
  )
}

export default FocusItemForm
