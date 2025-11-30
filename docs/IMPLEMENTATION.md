# FocusFlow - 实施文档（Implementation Guide）

**版本:** 1.0
**日期:** 2025-11-29
**状态:** 准备就绪
**预计开发周期:** 6-8 周

---

## 📘 文档说明

本文档是 FocusFlow 项目的**完整实施指南**，整合了以下四份核心文档：

1. **需求方案**（PRD.md）- 明确做什么
2. **技术框架方案**（TECH_STACK.md）- 明确用什么技术
3. **红线文档**（CONSTRAINTS.md）- 明确不能做什么
4. **规范文档**（STANDARDS.md）- 明确怎么做

**阅读指南：**
- 🎯 **项目经理/产品**：关注第 1-3 章（项目概览、开发计划、验收标准）
- 👨‍💻 **开发人员**：关注第 4-8 章（技术实施、代码规范、质量保障）
- 🔍 **代码审查者**：关注第 7-8 章（代码规范、审查清单）

---

## 目录

1. [项目概览](#1-项目概览)
2. [开发计划](#2-开发计划)
3. [验收标准](#3-验收标准)
4. [技术实施](#4-技术实施)
5. [数据库实施](#5-数据库实施)
6. [核心功能实施](#6-核心功能实施)
7. [代码规范与红线](#7-代码规范与红线)
8. [质量保障](#8-质量保障)
9. [部署与发布](#9-部署与发布)
10. [附录](#10-附录)

---

## 1. 项目概览

### 1.1 产品定位

**FocusFlow** 是一款基于番茄工作法的**专注力管理**桌面应用。

**核心理念：**
> 专注事项（Focus Item）= 可重复使用的专注模板

**差异化特性：**
- ✅ 每个专注事项有独立的番茄钟配置
- ✅ 按事项维度统计专注时长和趋势
- ✅ 可重复使用，持续追踪时间投入
- ✅ 简洁界面，零学习成本

**示例场景：**
```
用户创建专注事项：
📊 深度编程：50分钟工作 + 10分钟休息
📧 处理邮件：15分钟工作 + 3分钟休息
📚 学习阅读：25分钟工作 + 5分钟休息

每次专注时选择对应事项，系统自动应用配置并统计
```

---

### 1.2 核心功能

#### 功能 1：专注事项管理
- 创建/编辑/删除专注事项
- 自定义图标、颜色、番茄钟配置
- 预设 4 个默认模板

#### 功能 2：专注会话
- 选择事项 → 应用配置 → 开始专注
- 支持暂停/继续/停止
- 系统通知（工作结束/休息结束）

#### 功能 3：数据统计
- 今日/本周/本月专注时长
- 按事项维度统计分布（饼图）
- 专注趋势图（折线图/柱状图）
- 数据导出（CSV/JSON）

#### 功能 4：云端同步（Phase 4）
- 用户注册/登录
- 专注事项配置同步
- 会话记录同步

---

### 1.3 技术栈总览

| 类型 | 技术 | 版本 | 理由 |
|------|------|------|------|
| **桌面框架** | Electron | ^28.0.0 | 提供桌面能力 |
| **前端框架** | React | ^18.2.0 | 组件化、生态成熟 |
| **构建工具** | Vite | ^5.0.0 | 快速、零配置 |
| **状态管理** | Zustand | ^4.4.0 | 极简 API（1KB） |
| **本地数据库** | better-sqlite3 | ^9.2.0 | 同步 API、零配置 |
| **图表库** | Recharts | ^2.10.0 | 声明式、React 友好 |
| **样式方案** | CSS Modules | 原生 | 零依赖、作用域隔离 |

**总计依赖：5 个生产依赖**

**打包体积预估：~60MB**（含 Electron runtime）

---

### 1.4 项目结构

```
FocusFlow/
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── index.js             # 主进程入口
│   │   ├── database.js          # 数据库操作
│   │   ├── notification.js      # 系统通知
│   │   └── ipc.js              # IPC 处理器
│   │
│   ├── renderer/                # React 渲染进程
│   │   ├── pages/              # 4 个页面
│   │   │   ├── Home.jsx        # 主页（计时器）
│   │   │   ├── Items.jsx       # 事项管理
│   │   │   ├── Stats.jsx       # 统计
│   │   │   └── Settings.jsx    # 设置
│   │   │
│   │   ├── components/         # 10 个核心组件
│   │   │   ├── Timer.jsx
│   │   │   ├── FocusItemCard.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── ...
│   │   │
│   │   ├── store/              # 3 个 Zustand Store
│   │   │   ├── useFocusStore.js
│   │   │   ├── useTimerStore.js
│   │   │   └── useSettingsStore.js
│   │   │
│   │   ├── styles/             # CSS Modules
│   │   │   └── *.module.css
│   │   │
│   │   ├── utils/              # 工具函数
│   │   │   ├── time.js
│   │   │   ├── format.js
│   │   │   └── stats.js
│   │   │
│   │   ├── App.jsx             # 根组件
│   │   └── main.jsx            # 入口
│   │
│   └── preload/
│       └── index.js            # 预加载脚本
│
├── database/
│   └── schema.sql              # 数据库架构
│
├── public/
│   ├── icon.png                # 应用图标
│   └── notification.mp3        # 提示音
│
├── docs/                       # 项目文档
│   ├── PRD.md
│   ├── TECH_STACK.md
│   ├── CONSTRAINTS.md
│   ├── STANDARDS.md
│   └── IMPLEMENTATION.md       # 本文档
│
├── package.json
├── vite.config.js
└── electron.vite.config.js
```

---

## 2. 开发计划

### 2.1 Phase 划分

| Phase | 名称 | 周期 | 核心目标 |
|-------|------|------|---------|
| **Phase 1** | MVP 核心功能 | 2 周 | 专注事项 + 计时器 + 本地存储 |
| **Phase 2** | 会话管理 | 1 周 | 完整会话生命周期 |
| **Phase 3** | 数据统计 | 1-2 周 | 统计计算 + 可视化 |
| **Phase 4** | 云端同步 | 1-2 周 | Supabase 集成 |
| **Phase 5** | 优化发布 | 1 周 | 性能优化 + 打包 |

**总周期：6-8 周**

---

### 2.2 Phase 1: MVP（2 周）

#### 目标

构建核心功能，验证产品概念。

#### 任务清单

**Week 1：基础架构**

✅ **Day 1-2：项目初始化**
- [ ] 初始化 Electron + React + Vite 项目
- [ ] 配置 electron-vite
- [ ] 配置开发环境（热重载、DevTools）
- [ ] 创建项目目录结构
- [ ] 安装核心依赖（5 个生产依赖）

✅ **Day 3-4：数据库层**
- [ ] 创建 SQLite 数据库架构
- [ ] 实现数据库操作封装（database.js）
- [ ] 实现 IPC 通信（preload.js + ipc.js）
- [ ] 测试数据库基本操作

✅ **Day 5：专注事项 CRUD**
- [ ] 实现 useFocusStore（Zustand）
- [ ] 实现专注事项 CRUD API
- [ ] 创建 4 个默认模板

**Week 2：核心 UI**

✅ **Day 6-7：事项管理页面**
- [ ] 实现 Items.jsx 页面
- [ ] 实现 FocusItemCard 组件
- [ ] 实现 FocusItemForm 组件（创建/编辑）
- [ ] 实现事项列表展示

✅ **Day 8-9：计时器页面**
- [ ] 实现 Timer 组件
- [ ] 实现 useTimerStore
- [ ] 实现计时器逻辑（精准计时）
- [ ] 实现开始/暂停/停止功能

✅ **Day 10：系统通知**
- [ ] 实现 notification.js（主进程）
- [ ] 集成通知音效
- [ ] 测试通知功能

#### 验收标准

- ✅ 能够创建/编辑/删除专注事项
- ✅ 能够选择事项并开始计时
- ✅ 计时器精度误差 < 1 秒
- ✅ 工作结束时显示系统通知
- ✅ 数据持久化到本地数据库

---

### 2.3 Phase 2: 会话管理（1 周）

#### 目标

实现完整的专注会话生命周期。

#### 任务清单

✅ **Day 11-12：会话数据模型**
- [ ] 实现会话表（focus_sessions）
- [ ] 实现番茄钟记录表（pomodoro_records）
- [ ] 实现会话 CRUD API

✅ **Day 13-14：多番茄钟连续执行**
- [ ] 实现自动进入休息
- [ ] 实现休息结束后提示继续
- [ ] 实现长休息间隔逻辑
- [ ] 实现跳过休息功能

✅ **Day 15：会话统计**
- [ ] 实现会话统计数据计算
- [ ] 显示本次会话番茄钟数
- [ ] 显示今日总计番茄钟数

#### 验收标准

- ✅ 完成一个工作时段后自动进入休息
- ✅ 完成 N 个番茄钟后进入长休息
- ✅ 会话数据完整记录到数据库
- ✅ 中途停止不影响历史数据

---

### 2.4 Phase 3: 数据统计（1-2 周）

#### 目标

提供数据洞察，帮助用户了解专注习惯。

#### 任务清单

✅ **Day 16-17：统计计算引擎**
- [ ] 实现 stats.js 工具函数
- [ ] 实现今日/本周/本月统计
- [ ] 实现按事项维度统计
- [ ] 实现统计数据缓存

✅ **Day 18-19：数据可视化**
- [ ] 集成 Recharts
- [ ] 实现饼图（事项分布）
- [ ] 实现柱状图/折线图（趋势）
- [ ] 实现统计卡片（关键指标）

✅ **Day 20-21：统计页面**
- [ ] 实现 Stats.jsx 页面
- [ ] 实现时间维度切换（今日/本周/本月）
- [ ] 实现事项排行榜
- [ ] 实现数据导出功能（CSV/JSON）

#### 验收标准

- ✅ 统计数据准确无误
- ✅ 图表渲染流畅（< 500ms）
- ✅ 能够导出完整数据
- ✅ 数据可视化直观易懂

---

### 2.5 Phase 4: 云端同步（1-2 周）

#### 目标

支持多设备数据同步。

#### 任务清单

✅ **Day 22-23：Supabase 集成**
- [ ] 创建 Supabase 项目
- [ ] 配置数据库表结构
- [ ] 实现用户认证 API

✅ **Day 24-25：数据同步逻辑**
- [ ] 实现专注事项同步
- [ ] 实现会话记录同步
- [ ] 实现离线优先策略
- [ ] 实现冲突解决（时间戳优先）

✅ **Day 26-27：设置页面**
- [ ] 实现 Settings.jsx 页面
- [ ] 实现登录/注册界面
- [ ] 显示同步状态
- [ ] 实现手动同步按钮

#### 验收标准

- ✅ 用户能够注册/登录
- ✅ 数据自动同步到云端
- ✅ 离线状态下可正常使用
- ✅ 多设备数据一致

---

### 2.6 Phase 5: 优化发布（1 周）

#### 目标

优化性能，打包发布。

#### 任务清单

✅ **Day 28-29：性能优化**
- [ ] 优化组件渲染（React.memo）
- [ ] 优化数据库查询（索引）
- [ ] 优化启动时间（延迟加载）
- [ ] 内存泄漏检查

✅ **Day 30-31：UI/UX 打磨**
- [ ] 优化动画效果
- [ ] 优化错误提示
- [ ] 优化加载状态
- [ ] 边界情况处理

✅ **Day 32：打包发布**
- [ ] 配置 electron-builder
- [ ] 生成 Windows 安装包
- [ ] 测试安装流程
- [ ] 编写使用文档

#### 验收标准

- ✅ 启动时间 < 2 秒
- ✅ 内存占用 < 200MB
- ✅ 无内存泄漏
- ✅ 安装包可正常使用

---

## 3. 验收标准

### 3.1 功能验收

#### 专注事项管理

| 验收项 | 标准 |
|-------|------|
| 创建事项 | 输入名称、选择图标颜色、配置时长后可成功创建 |
| 编辑事项 | 修改配置后立即生效，不影响历史会话 |
| 删除事项 | 删除后历史数据保留，统计时不显示 |
| 默认模板 | 首次启动自动创建 4 个预设模板 |

#### 专注会话

| 验收项 | 标准 |
|-------|------|
| 开始专注 | 选择事项后点击开始，计时器正常运行 |
| 暂停/继续 | 可随时暂停和继续，时间准确 |
| 停止 | 停止后会话数据保存，可查看统计 |
| 系统通知 | 工作/休息结束时显示通知并播放音效 |
| 自动休息 | 工作结束后自动进入休息倒计时 |
| 长休息 | 完成指定数量番茄钟后进入长休息 |

#### 数据统计

| 验收项 | 标准 |
|-------|------|
| 今日统计 | 准确显示今日专注时长和番茄钟数 |
| 按事项统计 | 饼图正确显示各事项时间分布 |
| 趋势图 | 折线图/柱状图正确显示历史趋势 |
| 数据导出 | CSV/JSON 格式完整导出所有数据 |

---

### 3.2 性能验收

| 指标 | 标准 |
|------|------|
| 启动时间 | < 2 秒 |
| 计时器精度 | 误差 < 1 秒 |
| 界面响应 | < 100ms |
| 统计计算 | < 500ms |
| 内存占用 | < 200MB |
| 打包体积 | < 80MB |

---

### 3.3 安全验收

| 验收项 | 标准 |
|-------|------|
| Electron 配置 | `nodeIntegration: false`, `contextIsolation: true` |
| SQL 注入防护 | 所有查询使用参数化 |
| XSS 防护 | 无 `innerHTML` / `dangerouslySetInnerHTML` |
| 数据加密 | 云端同步使用 HTTPS |

---

### 3.4 稳定性验收

| 验收项 | 标准 |
|-------|------|
| 异常处理 | 所有异步操作有 try-catch |
| 数据保存 | 窗口关闭前自动保存 |
| 内存泄漏 | 所有定时器正确清理 |
| 边界情况 | 无数据、网络断开等情况正常处理 |

---

## 4. 技术实施

### 4.1 项目初始化

#### Step 1: 初始化项目

```bash
# 使用 electron-vite 模板
pnpm create @quick-start/electron

# 项目配置
? Project name: FocusFlow
? Select a framework: React
? Add TypeScript? No
? Add Electron updater plugin? No
? Enable Electron download mirror proxy? No

cd FocusFlow
pnpm install
```

#### Step 2: 安装核心依赖

```bash
# 生产依赖（仅 5 个）
pnpm add zustand better-sqlite3 recharts

# 开发依赖
pnpm add -D electron-builder
```

#### Step 3: 配置 package.json

```json
{
  "name": "focusflow",
  "version": "1.0.0",
  "main": "dist-electron/main/index.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "package": "electron-builder"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "better-sqlite3": "^9.2.0",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-vite": "^2.0.0",
    "electron-builder": "^24.9.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

---

### 4.2 Electron 主进程实施

#### 4.2.1 主进程入口（main/index.js）

```javascript
const { app, BrowserWindow } = require('electron')
const path = require('path')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,      // 🔴 红线：必须为 false
      contextIsolation: true,      // 🔴 红线：必须为 true
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  // 开发环境加载 Vite 服务器
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  // macOS 特殊处理
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

#### 4.2.2 数据库操作（main/database.js）

```javascript
const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')
const fs = require('fs')

// 数据库文件路径
const dbPath = path.join(app.getPath('userData'), 'focusflow.db')
const db = new Database(dbPath)

// 初始化数据库
function initDatabase() {
  const schemaPath = path.join(__dirname, '../../database/schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf-8')

  // 执行 schema
  db.exec(schema)

  // 创建默认模板
  createDefaultTemplates()
}

// 创建默认模板
function createDefaultTemplates() {
  const templates = [
    {
      id: 'deep-work',
      name: '深度工作',
      icon: '📊',
      color: '#3498DB',
      work_duration: 50,
      short_break_duration: 10,
      long_break_duration: 30,
      long_break_interval: 2
    },
    {
      id: 'quick-task',
      name: '快速处理',
      icon: '⚡',
      color: '#E67E22',
      work_duration: 15,
      short_break_duration: 3,
      long_break_duration: 10,
      long_break_interval: 4
    },
    {
      id: 'standard',
      name: '标准学习',
      icon: '📚',
      color: '#2ECC71',
      work_duration: 25,
      short_break_duration: 5,
      long_break_duration: 15,
      long_break_interval: 4
    },
    {
      id: 'creative',
      name: '创意工作',
      icon: '🎨',
      color: '#9B59B6',
      work_duration: 40,
      short_break_duration: 8,
      long_break_duration: 20,
      long_break_interval: 3
    }
  ]

  const insert = db.prepare(`
    INSERT OR IGNORE INTO focus_items
    (id, name, icon, color, work_duration, short_break_duration, long_break_duration, long_break_interval)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  templates.forEach(t => {
    insert.run(t.id, t.name, t.icon, t.color, t.work_duration, t.short_break_duration, t.long_break_duration, t.long_break_interval)
  })
}

// 导出数据库操作 API
module.exports = {
  initDatabase,

  // 专注事项
  getFocusItems: () => {
    return db.prepare('SELECT * FROM focus_items ORDER BY created_at DESC').all()
  },

  getFocusItem: (id) => {
    return db.prepare('SELECT * FROM focus_items WHERE id = ?').get(id)
  },

  createFocusItem: (item) => {
    const { id, name, icon, color, work_duration, short_break_duration, long_break_duration, long_break_interval } = item
    const result = db.prepare(`
      INSERT INTO focus_items (id, name, icon, color, work_duration, short_break_duration, long_break_duration, long_break_interval)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, icon, color, work_duration, short_break_duration, long_break_duration, long_break_interval)
    return result.changes > 0
  },

  updateFocusItem: (id, updates) => {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ')
    const values = [...Object.values(updates), id]
    const result = db.prepare(`UPDATE focus_items SET ${fields} WHERE id = ?`).run(...values)
    return result.changes > 0
  },

  deleteFocusItem: (id) => {
    const result = db.prepare('DELETE FROM focus_items WHERE id = ?').run(id)
    return result.changes > 0
  },

  // 会话相关（Phase 2 实现）
  // ...
}
```

#### 4.2.3 IPC 处理器（main/ipc.js）

```javascript
const { ipcMain } = require('electron')
const db = require('./database')

function setupIPC() {
  // 专注事项
  ipcMain.handle('get-focus-items', () => db.getFocusItems())
  ipcMain.handle('get-focus-item', (_, id) => db.getFocusItem(id))
  ipcMain.handle('create-focus-item', (_, item) => db.createFocusItem(item))
  ipcMain.handle('update-focus-item', (_, id, updates) => db.updateFocusItem(id, updates))
  ipcMain.handle('delete-focus-item', (_, id) => db.deleteFocusItem(id))

  // 会话相关（Phase 2 实现）
  // ...
}

module.exports = { setupIPC }
```

#### 4.2.4 系统通知（main/notification.js）

```javascript
const { Notification } = require('electron')
const path = require('path')

function showNotification(title, body) {
  const notification = new Notification({
    title,
    body,
    icon: path.join(__dirname, '../../public/icon.png')
  })

  notification.show()

  // 播放音效（可选）
  // const player = require('play-sound')()
  // player.play('public/notification.mp3')
}

module.exports = { showNotification }
```

#### 4.2.5 预加载脚本（preload/index.js）

```javascript
const { contextBridge, ipcRenderer } = require('electron')

// 🔴 红线：仅暴露必要的 API，不暴露 Node.js API
contextBridge.exposeInMainWorld('api', {
  // 专注事项
  getFocusItems: () => ipcRenderer.invoke('get-focus-items'),
  getFocusItem: (id) => ipcRenderer.invoke('get-focus-item', id),
  createFocusItem: (item) => ipcRenderer.invoke('create-focus-item', item),
  updateFocusItem: (id, updates) => ipcRenderer.invoke('update-focus-item', id, updates),
  deleteFocusItem: (id) => ipcRenderer.invoke('delete-focus-item', id),

  // 会话（Phase 2）
  startSession: (itemId) => ipcRenderer.invoke('start-session', itemId),
  endSession: (sessionId) => ipcRenderer.invoke('end-session', sessionId),

  // 统计（Phase 3）
  getStats: (range) => ipcRenderer.invoke('get-stats', range),

  // 通知
  showNotification: (title, body) => ipcRenderer.send('show-notification', title, body)
})
```

---

### 4.3 React 渲染进程实施

#### 4.3.1 状态管理（Zustand）

```javascript
// store/useFocusStore.js
import create from 'zustand'

const useFocusStore = create((set, get) => ({
  // 状态
  items: [],
  selectedId: null,
  loading: false,
  error: null,

  // 加载事项
  loadItems: async () => {
    set({ loading: true, error: null })
    try {
      const items = await window.api.getFocusItems()
      set({ items, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // 选择事项
  selectItem: (id) => set({ selectedId: id }),

  // 获取选中的事项
  getSelectedItem: () => {
    const { items, selectedId } = get()
    return items.find(item => item.id === selectedId)
  },

  // 创建事项
  createItem: async (item) => {
    try {
      await window.api.createFocusItem(item)
      await get().loadItems()
      return true
    } catch (error) {
      set({ error: error.message })
      return false
    }
  },

  // 更新事项
  updateItem: async (id, updates) => {
    try {
      await window.api.updateFocusItem(id, updates)
      await get().loadItems()
      return true
    } catch (error) {
      set({ error: error.message })
      return false
    }
  },

  // 删除事项
  deleteItem: async (id) => {
    try {
      await window.api.deleteFocusItem(id)
      await get().loadItems()
      return true
    } catch (error) {
      set({ error: error.message })
      return false
    }
  }
}))

export default useFocusStore
```

```javascript
// store/useTimerStore.js
import create from 'zustand'

const useTimerStore = create((set, get) => ({
  // 状态
  isRunning: false,
  isPaused: false,
  timeLeft: 0,
  currentType: 'work', // work | short_break | long_break
  currentSessionId: null,
  pomodoroCount: 0,

  // 开始计时
  start: (duration, type, sessionId) => {
    set({
      isRunning: true,
      isPaused: false,
      timeLeft: duration,
      currentType: type,
      currentSessionId: sessionId
    })
  },

  // 暂停
  pause: () => set({ isPaused: true }),

  // 继续
  resume: () => set({ isPaused: false }),

  // 停止
  stop: () => {
    set({
      isRunning: false,
      isPaused: false,
      timeLeft: 0,
      currentSessionId: null
    })
  },

  // 计时（每秒调用）
  tick: () => {
    const { timeLeft, isPaused } = get()
    if (isPaused) return

    if (timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 })
    } else {
      // 时间到
      get().onComplete()
    }
  },

  // 完成回调
  onComplete: () => {
    // 显示通知、进入下一阶段等
    // 在组件中处理
  }
}))

export default useTimerStore
```

#### 4.3.2 核心组件

```javascript
// components/Timer.jsx
import { useEffect } from 'react'
import useTimerStore from '../store/useTimerStore'
import styles from './Timer.module.css'

function Timer() {
  const { timeLeft, isRunning, isPaused, tick } = useTimerStore()

  useEffect(() => {
    if (!isRunning || isPaused) return

    const timer = setInterval(() => {
      tick()
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, isPaused, tick])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className={styles.timer}>
      <div className={styles.display}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  )
}

export default Timer
```

---

## 5. 数据库实施

### 5.1 数据库架构

```sql
-- database/schema.sql

-- 专注事项表
CREATE TABLE IF NOT EXISTS focus_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,

  work_duration INTEGER NOT NULL,
  short_break_duration INTEGER NOT NULL,
  long_break_duration INTEGER NOT NULL,
  long_break_interval INTEGER NOT NULL,

  total_sessions INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  last_used_at INTEGER,

  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- 专注会话表
CREATE TABLE IF NOT EXISTS focus_sessions (
  id TEXT PRIMARY KEY,
  focus_item_id TEXT NOT NULL,

  config_work_duration INTEGER NOT NULL,
  config_short_break INTEGER NOT NULL,
  config_long_break INTEGER NOT NULL,
  config_long_break_interval INTEGER NOT NULL,

  total_pomodoros INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  completed_pomodoros INTEGER DEFAULT 0,

  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  is_active INTEGER DEFAULT 1,

  FOREIGN KEY (focus_item_id) REFERENCES focus_items(id)
);

-- 番茄钟记录表
CREATE TABLE IF NOT EXISTS pomodoro_records (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  focus_item_id TEXT NOT NULL,

  type TEXT NOT NULL CHECK(type IN ('work', 'short_break', 'long_break')),
  duration INTEGER NOT NULL,
  is_completed INTEGER DEFAULT 0,

  start_time INTEGER NOT NULL,
  end_time INTEGER,

  FOREIGN KEY (session_id) REFERENCES focus_sessions(id),
  FOREIGN KEY (focus_item_id) REFERENCES focus_items(id)
);

-- 设置表
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  notification_enabled INTEGER DEFAULT 1,
  sound_enabled INTEGER DEFAULT 1,
  theme TEXT DEFAULT 'system'
);

-- 索引（性能优化）
CREATE INDEX IF NOT EXISTS idx_sessions_item_id ON focus_sessions(focus_item_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON focus_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_records_session_id ON pomodoro_records(session_id);
CREATE INDEX IF NOT EXISTS idx_records_start_time ON pomodoro_records(start_time);
```

---

## 6. 核心功能实施

### 6.1 计时器精准实现

```javascript
// utils/timer.js

class PrecisionTimer {
  constructor(duration, onTick, onComplete) {
    this.duration = duration // 总秒数
    this.onTick = onTick // 每秒回调
    this.onComplete = onComplete // 完成回调

    this.startTime = null
    this.expectedEndTime = null
    this.interval = null
  }

  start() {
    this.startTime = Date.now()
    this.expectedEndTime = this.startTime + this.duration * 1000

    this.interval = setInterval(() => {
      const now = Date.now()
      const timeLeft = Math.max(0, Math.ceil((this.expectedEndTime - now) / 1000))

      this.onTick(timeLeft)

      if (timeLeft === 0) {
        this.stop()
        this.onComplete()
      }
    }, 100) // 每 100ms 更新一次，显示更流畅
  }

  pause() {
    clearInterval(this.interval)
    this.interval = null
  }

  resume() {
    // 重新计算结束时间
    const elapsed = Date.now() - this.startTime
    const remaining = this.duration * 1000 - elapsed
    this.expectedEndTime = Date.now() + remaining

    this.start()
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }
}

export default PrecisionTimer
```

---

### 6.2 统计计算实现

```javascript
// utils/stats.js

/**
 * 计算今日统计
 */
export function getTodayStats(sessions) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTimestamp = today.getTime() / 1000

  const todaySessions = sessions.filter(s => s.started_at >= todayTimestamp)

  return {
    totalPomodoros: todaySessions.reduce((sum, s) => sum + s.total_pomodoros, 0),
    totalDuration: todaySessions.reduce((sum, s) => sum + s.total_duration, 0),
    sessionCount: todaySessions.length
  }
}

/**
 * 按事项统计
 */
export function getStatsByItem(sessions, focusItems) {
  const itemStats = {}

  sessions.forEach(session => {
    const itemId = session.focus_item_id
    if (!itemStats[itemId]) {
      itemStats[itemId] = {
        totalDuration: 0,
        totalPomodoros: 0,
        sessionCount: 0
      }
    }

    itemStats[itemId].totalDuration += session.total_duration
    itemStats[itemId].totalPomodoros += session.total_pomodoros
    itemStats[itemId].sessionCount += 1
  })

  // 转换为数组，附加事项信息
  return Object.entries(itemStats).map(([itemId, stats]) => {
    const item = focusItems.find(i => i.id === itemId)
    return {
      ...stats,
      itemId,
      itemName: item?.name || 'Unknown',
      itemColor: item?.color || '#999'
    }
  }).sort((a, b) => b.totalDuration - a.totalDuration)
}

/**
 * 格式化时间（秒 -> "HH:MM:SS"）
 */
export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`
}
```

---

## 7. 代码规范与红线

### 7.1 代码审查清单

#### 提交前自查

```
□ 代码风格符合规范（2 空格缩进、单引号、无分号）
□ 没有 console.log / debugger
□ 没有 TODO / FIXME（已记录到 Issue）
□ 没有未使用的变量和导入
□ 函数长度 < 50 行
□ 嵌套深度 < 4 层
□ 所有 useEffect 依赖正确
□ 所有列表渲染有正确的 key
□ 错误处理完整（try-catch）
□ 提交信息清晰（feat/fix/refactor: xxx）
```

#### 红线检查

```
□ 没有引入未批准的依赖
□ 没有使用 UI 组件库（Ant Design / Material-UI 等）
□ 没有使用 eval / innerHTML
□ 没有 SQL 注入风险（使用参数化查询）
□ 没有内存泄漏（定时器已清理）
□ 没有提交敏感数据（.env / API Key）
□ 没有直接操作 DOM
□ 没有阻塞主线程（> 100ms）
□ Electron 配置安全（nodeIntegration: false）
□ 没有未清理的事件监听器
```

---

### 7.2 命名规范速查

| 类型 | 规范 | 示例 |
|------|------|------|
| **文件** | 组件：PascalCase.jsx | Timer.jsx, FocusItemCard.jsx |
| | 工具：camelCase.js | timeUtils.js, formatDate.js |
| | Store：use{Name}Store.js | useFocusStore.js |
| | 样式：{Name}.module.css | Timer.module.css |
| **变量** | camelCase | userName, itemCount |
| | 布尔：is/has/can 前缀 | isActive, hasPermission |
| | 数组：复数 | items, users |
| **常量** | UPPER_SNAKE_CASE | MAX_COUNT, API_URL |
| **函数** | 动词开头 | getData, createItem |
| | 事件：handle{Event} | handleClick, handleSubmit |
| | 布尔：is/has/can | isValid, hasData |

---

### 7.3 Git 提交规范

**分支命名：**
```
feature/timer-component
fix/memory-leak
refactor/database-layer
```

**提交格式：**
```
<type>: <subject>

type 类型：
- feat: 新功能
- fix: 修复 Bug
- refactor: 重构
- docs: 文档更新
- perf: 性能优化

示例：
feat: 添加计时器组件
fix: 修复内存泄漏问题
refactor: 重构数据库操作层
```

---

## 8. 质量保障

### 8.1 单元测试（Phase 2 开始）

```javascript
// Timer.test.jsx
import { render, screen } from '@testing-library/react'
import Timer from './Timer'

describe('Timer', () => {
  it('should display initial time correctly', () => {
    render(<Timer initialTime={1500} />)
    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('should count down when started', async () => {
    // 测试逻辑
  })
})
```

---

### 8.2 错误处理模式

```javascript
// ✅ 正确的错误处理
async function loadData() {
  try {
    const data = await window.api.getFocusItems()
    return data
  } catch (error) {
    console.error('加载数据失败:', error)
    // 显示用户友好的错误提示
    showErrorMessage('无法加载数据，请重试')
    return []
  }
}

// ✅ React 组件错误处理
function MyComponent() {
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
      .catch(err => setError(err.message))
  }, [])

  if (error) {
    return <ErrorMessage message={error} />
  }

  return <div>...</div>
}
```

---

## 9. 部署与发布

### 9.1 打包配置

```json
// package.json
{
  "build": {
    "appId": "com.focusflow.app",
    "productName": "FocusFlow",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": "nsis",
      "icon": "public/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true
    }
  }
}
```

### 9.2 构建命令

```bash
# 开发环境
pnpm dev

# 构建生产版本
pnpm build

# 打包成安装程序
pnpm package
```

---

## 10. 附录

### 10.1 开发工具推荐

**必备工具：**
- VS Code（推荐）
- React DevTools
- Electron DevTools

**VS Code 插件：**
- ES7+ React/Redux/React-Native snippets
- Path Intellisense
- Auto Rename Tag

---

### 10.2 常用命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 打包
pnpm package

# 清理
pnpm clean
```

---

### 10.3 故障排查

| 问题 | 解决方案 |
|------|---------|
| 数据库文件找不到 | 检查 `app.getPath('userData')` 路径 |
| IPC 调用失败 | 检查 preload.js 是否正确暴露 API |
| 计时器不准确 | 使用时间戳校准而非累加 |
| 内存泄漏 | 检查 useEffect 是否清理定时器 |

---

## 📋 总结

### 核心原则

1. **KISS 原则** - 保持简单
2. **YAGNI 原则** - 不过度设计
3. **DRY 原则** - 避免重复
4. **轻量化** - 最小依赖

### 关键指标

- 📦 **5 个生产依赖**
- 🚀 **< 2 秒启动时间**
- 💾 **~60MB 打包体积**
- 🎯 **6-8 周开发周期**

### 下一步

1. ✅ 审查本实施文档
2. ✅ 确认技术方案
3. ✅ 开始 Phase 1 开发

---

**文档状态:** ✅ 已完成
**版本:** 1.0
**最后更新:** 2025-11-29

**准备好开始开发了吗？** 🚀
