# Supabase 数据库迁移脚本问题修复

## 问题描述

在执行 `001_initial_schema.sql` 时遇到错误：

```
ERROR: 42804: column "auto_start_breaks" is of type boolean but default expression is of type integer
```

## 问题原因

**SQLite vs PostgreSQL 差异：**
- **SQLite**: 布尔类型使用整数表示（0 = false, 1 = true）
- **PostgreSQL**: 布尔类型使用关键字 `TRUE`/`FALSE`

原SQL脚本使用了SQLite的语法：
```sql
auto_start_breaks BOOLEAN NOT NULL DEFAULT 1  -- ❌ 错误
```

## 解决方案

已将所有布尔默认值更新为PostgreSQL兼容语法：

```sql
auto_start_breaks BOOLEAN NOT NULL DEFAULT TRUE  -- ✅ 正确
```

## 修改的字段

### focus_items 表
- `auto_start_breaks`: `DEFAULT 1` → `DEFAULT TRUE`
- `auto_start_pomodoros`: `DEFAULT 0` → `DEFAULT FALSE`

### focus_sessions 表
- `is_completed`: `DEFAULT 0` → `DEFAULT FALSE`

### pomodoro_records 表
- `is_completed`: `DEFAULT 0` → `DEFAULT FALSE`
- `is_skipped`: `DEFAULT 0` → `DEFAULT FALSE`

## 验证修复

修复后，执行SQL脚本应该成功，所有表会正确创建。

## 使用说明

1. 打开 Supabase Dashboard
2. 进入 SQL Editor
3. 复制整个 `001_initial_schema.sql` 文件内容
4. 粘贴到编辑器
5. 点击 Run
6. 确认所有表创建成功

## 注意事项

如果之前已经尝试执行过失败的脚本，可能需要：

1. 删除已创建的部分表
2. 或使用 `DROP TABLE IF EXISTS` 清理
3. 然后重新执行修复后的脚本

---

**状态**: ✅ 已修复
**更新时间**: 2025-12-04
