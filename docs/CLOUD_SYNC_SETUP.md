# FocusFlow 云端同步配置指南

本文档将指导您如何配置 Supabase 以启用 FocusFlow 的云端同步功能。

---

## 📋 前置要求

- FocusFlow 应用已安装
- 有效的邮箱账号
- 网络连接

---

## 🚀 配置步骤

### 步骤 1: 创建 Supabase 账号

1. 访问 [Supabase 官网](https://supabase.com/)
2. 点击 "Start your project" 或 "Sign Up"
3. 使用 GitHub 账号或邮箱注册

### 步骤 2: 创建新项目

1. 登录后，点击 "New Project"
2. 填写项目信息：
   - **Organization**: 选择或创建组织
   - **Name**: `FocusFlow` (或任意名称)
   - **Database Password**: 设置强密码（请妥善保存）
   - **Region**: 选择最近的区域（如 `Northeast Asia (Tokyo)`）
   - **Pricing Plan**: 选择 `Free` (免费版)
3. 点击 "Create new project"
4. 等待 2-3 分钟，项目创建完成

### 步骤 3: 获取 API 密钥

1. 项目创建完成后，进入项目主页
2. 左侧菜单点击 **Settings** (齿轮图标)
3. 点击 **API**
4. 复制以下两个值：
   - **Project URL** (形如: `https://xxxxx.supabase.co`)
   - **anon / public** key (一长串字符串)

### 步骤 4: 执行数据库迁移脚本

1. 左侧菜单点击 **SQL Editor**
2. 点击 **New query**
3. 打开 FocusFlow 项目目录中的文件：
   ```
   supabase/migrations/001_initial_schema.sql
   ```
4. 复制**全部内容**到 Supabase SQL Editor
5. 点击右下角 **Run** 按钮
6. 等待执行完成，确保没有错误提示

### 步骤 5: 配置 FocusFlow 应用

1. 在 FocusFlow 项目根目录创建文件：`.env.local`
2. 将以下内容复制到文件中，并替换为您的实际值：

```env
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. 保存文件
4. 重启 FocusFlow 应用

### 步骤 6: 测试同步功能

1. 打开 FocusFlow，进入 **设置** 页面
2. 如果配置正确，会看到登录表单
3. 点击 **立即注册** 创建账号
4. 输入邮箱和密码（至少6位）
5. 查收邮箱验证邮件（检查垃圾邮件文件夹）
6. 点击验证链接后，回到应用登录
7. 登录成功后，点击 **立即同步** 测试同步功能

---

## ✅ 验证配置

### 检查点 1: 环境变量加载

在设置页面，如果看到以下任一情况说明配置有误：
- ⚠️ "云端同步未配置"
- ⚠️ "请配置 Supabase..."

**解决方法：**
- 检查 `.env.local` 文件是否在项目根目录
- 检查变量名是否正确（`VITE_` 前缀必须有）
- 重启应用

### 检查点 2: 数据库表创建

1. 在 Supabase Dashboard，点击 **Table Editor**
2. 确认看到以下表：
   - `focus_items`
   - `focus_sessions`
   - `pomodoro_records`
   - `sync_metadata`

**如果看不到表：**
- 重新执行步骤 4 的 SQL 脚本
- 确保脚本执行无错误

### 检查点 3: 认证功能

1. 尝试注册新账号
2. 检查邮箱收到验证邮件
3. 验证后能够登录

**常见问题：**
- 未收到验证邮件 → 检查垃圾邮件，或在 Supabase Dashboard > Authentication > Settings 中关闭邮箱验证
- 登录失败 → 检查 API 密钥是否正确

### 检查点 4: 数据同步

1. 在应用中创建几个专注事项
2. 点击 **立即同步**
3. 在 Supabase Dashboard > Table Editor > focus_items 中查看数据

**如果同步失败：**
- 检查网络连接
- 查看浏览器控制台错误信息
- 检查 RLS 策略是否正确启用

---

## 🔒 安全提示

### 重要事项

1. **切勿提交 `.env.local` 到 Git**
   - 已在 `.gitignore` 中配置，请勿移除
   - API 密钥泄露可能导致数据被恶意访问

2. **定期更换密码**
   - 建议每3个月更换一次 Supabase 密码

3. **RLS 策略验证**
   - 确保 RLS 策略已启用
   - 用户只能访问自己的数据

### 数据安全

- 所有数据通过 HTTPS 加密传输
- Supabase 使用行级安全策略（RLS）隔离用户数据
- 本地数据与云端数据双重备份

---

## 🛠️ 常见问题

### Q1: 注册时提示 "Email rate limit exceeded"

**原因：** Supabase 免费版有邮件发送频率限制

**解决方法：**
1. 等待 1 小时后重试
2. 或在 Supabase Dashboard 暂时关闭邮箱验证：
   - Settings > Authentication
   - 关闭 "Enable email confirmations"

### Q2: 同步失败提示 "RLS policy violation"

**原因：** 行级安全策略配置错误

**解决方法：**
1. 重新执行 `001_initial_schema.sql` 脚本
2. 确保 RLS 策略部分完整执行

### Q3: 离线时数据会丢失吗？

**答：** 不会。数据优先保存在本地，网络恢复后自动同步。

### Q4: 可以在多台设备使用同一账号吗？

**答：** 可以。使用同一账号登录，数据会自动同步到所有设备。

### Q5: 如何删除云端数据？

**方法：**
1. 在 Supabase Dashboard > Table Editor 中手动删除
2. 或直接删除 Supabase 项目

---

## 📊 性能优化

### 同步频率

- 默认每 **5 分钟** 自动同步一次
- 可在设置页面手动触发同步
- 网络恢复时自动同步

### 数据量限制

- Supabase 免费版限制：
  - 数据库大小：500 MB
  - 月流量：5 GB
  - 对于个人使用完全足够

---

## 🆘 获取帮助

如果遇到问题：

1. 查看浏览器控制台错误信息
2. 检查 Supabase Dashboard 的 Logs
3. 确认网络连接正常
4. 重启应用重试

---

## 📝 配置检查清单

完成以下步骤后，云端同步功能应该可以正常使用：

- [ ] Supabase 项目已创建
- [ ] API 密钥已获取
- [ ] 数据库迁移脚本已执行
- [ ] `.env.local` 文件已创建并配置
- [ ] 应用已重启
- [ ] 成功注册并登录账号
- [ ] 同步功能测试通过

---

**配置完成！** 🎉

现在您可以在多台设备间无缝同步您的专注数据了。
