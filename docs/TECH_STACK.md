# FocusFlow - 技术框架方案

**版本:** 1.0
**日期:** 2025-11-29
**设计原则:** KISS（简单至上）+ 轻量化

---

## 1. 核心技术栈

### 1.1 基础框架（必选）

| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|---------|
| **Electron** | ^28.0.0 | 桌面应用框架 | 唯一选择，提供桌面能力 |
| **React** | ^18.2.0 | UI 框架 | 轻量、生态成熟、组件化 |
| **Vite** | ^5.0.0 | 构建工具 | 快速、零配置、开箱即用 |

### 1.2 样式方案（最简方案）

**选择：原生 CSS Modules**

```
理由：
✅ 无需额外依赖
✅ Vite 原生支持
✅ 作用域隔离
✅ 学习成本低

不选择：
❌ Tailwind CSS - 增加打包体积，过度依赖
❌ Styled-components - 增加运行时开销
❌ CSS-in-JS - 过度复杂
```

### 1.3 状态管理（最简方案）

**选择：Zustand**

```javascript
// 仅需一个依赖：zustand
import create from 'zustand'

const useStore = create((set) => ({
  focusItems: [],
  addItem: (item) => set((state) => ({
    focusItems: [...state.focusItems, item]
  }))
}))
```

```
理由：
✅ 极简 API（仅 1KB gzipped）
✅ 无需 Provider 包裹
✅ 支持 DevTools
✅ TypeScript 友好

不选择：
❌ Redux Toolkit - 过于重量级
❌ MobX - 学习曲线陡
❌ Context API - 性能问题
```

### 1.4 本地数据库（最简方案）

**选择：better-sqlite3**

```javascript
const Database = require('better-sqlite3')
const db = new Database('focusflow.db')

// 同步 API，简单直接
const items = db.prepare('SELECT * FROM focus_items').all()
```

```
理由：
✅ 纯 SQLite，无额外依赖
✅ 同步 API，代码简洁
✅ 性能优秀
✅ 零配置

不选择：
❌ TypeORM - 过于重量级
❌ Prisma - 需要代码生成，复杂
❌ Knex.js - 增加抽象层，不必要
```

### 1.5 云端同步（推迟到 Phase 4）

**推荐：Supabase**

```
MVP 阶段不实现，Phase 4 再集成
理由：
- 先验证核心功能
- 避免过早优化
```

---

## 2. 项目结构（扁平化）

```
FocusFlow/
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── index.js             # 主进程入口
│   │   ├── database.js          # 数据库操作
│   │   └── notification.js      # 系统通知
│   │
│   ├── renderer/                # React 渲染进程
│   │   ├── pages/               # 页面（仅 4 个）
│   │   │   ├── Home.jsx         # 主页
│   │   │   ├── Items.jsx        # 事项管理
│   │   │   ├── Stats.jsx        # 统计
│   │   │   └── Settings.jsx     # 设置
│   │   │
│   │   ├── components/          # 组件（按功能分）
│   │   │   ├── Timer.jsx        # 计时器
│   │   │   ├── FocusItemCard.jsx
│   │   │   ├── SessionStats.jsx
│   │   │   └── Chart.jsx        # 图表
│   │   │
│   │   ├── store/               # Zustand 状态
│   │   │   ├── useFocusStore.js # 专注事项
│   │   │   ├── useTimerStore.js # 计时器
│   │   │   └── useSettingsStore.js # 设置
│   │   │
│   │   ├── styles/              # CSS Modules
│   │   │   └── *.module.css
│   │   │
│   │   ├── utils/               # 工具函数
│   │   │   ├── time.js          # 时间格式化
│   │   │   └── stats.js         # 统计计算
│   │   │
│   │   ├── App.jsx              # 根组件
│   │   └── main.jsx             # 入口
│   │
│   └── preload/
│       └── index.js             # 预加载脚本
│
├── database/
│   └── schema.sql               # 数据库架构
│
├── public/
│   ├── icon.png                 # 应用图标
│   └── notification.mp3         # 提示音
│
├── package.json
├── vite.config.js               # Vite 配置
└── electron.vite.config.js      # Electron Vite 配置
```

**原则：**
- 页面仅 4 个，无需复杂路由
- 组件按功能分，不按类型分
- 避免过度嵌套

---

## 3. 核心依赖列表（极简）

### 3.1 生产依赖

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "better-sqlite3": "^9.2.0",
    "recharts": "^2.10.0"
  }
}
```

**说明：**
- `react` + `react-dom`: UI 框架（必须）
- `zustand`: 状态管理（1KB，必须）
- `better-sqlite3`: 本地数据库（必须）
- `recharts`: 图表库（简单、声明式）

**总计：仅 5 个生产依赖**

### 3.2 开发依赖

```json
{
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "electron-vite": "^2.0.0"
  }
}
```

**不引入：**
- ❌ ESLint/Prettier（IDE 自带）
- ❌ Testing 库（MVP 阶段不写测试）
- ❌ Husky/Lint-staged（过度工程化）
- ❌ TypeScript（增加编译复杂度，JS 够用）

---

## 4. 数据库设计（3 张表）

### 4.1 Schema

```sql
-- 专注事项表
CREATE TABLE focus_items (
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
CREATE TABLE focus_sessions (
  id TEXT PRIMARY KEY,
  focus_item_id TEXT NOT NULL,
  config_work_duration INTEGER NOT NULL,
  config_short_break INTEGER NOT NULL,
  config_long_break INTEGER NOT NULL,
  total_pomodoros INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  FOREIGN KEY (focus_item_id) REFERENCES focus_items(id)
);

-- 番茄钟记录表
CREATE TABLE pomodoro_records (
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
CREATE TABLE settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  notification_enabled INTEGER DEFAULT 1,
  sound_enabled INTEGER DEFAULT 1,
  theme TEXT DEFAULT 'system'
);
```

**设计原则：**
- 使用 INTEGER 存储时间戳（Unix timestamp）
- 使用 INTEGER 存储布尔值（0/1）
- 使用 TEXT 存储 UUID
- 无冗余字段

---

## 5. 状态管理设计

### 5.1 Store 划分（3 个 Store）

```javascript
// 1. 专注事项 Store
const useFocusStore = create((set, get) => ({
  items: [],
  selectedItem: null,

  loadItems: async () => {
    const items = await window.api.getFocusItems()
    set({ items })
  },

  selectItem: (id) => set({ selectedItem: id })
}))

// 2. 计时器 Store
const useTimerStore = create((set) => ({
  isRunning: false,
  timeLeft: 0,
  currentType: 'work', // work | short_break | long_break
  currentSession: null,

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  tick: () => set((state) => ({ timeLeft: state.timeLeft - 1 }))
}))

// 3. 设置 Store
const useSettingsStore = create((set) => ({
  notificationEnabled: true,
  soundEnabled: true,
  theme: 'system',

  updateSettings: (settings) => set(settings)
}))
```

**原则：**
- 按领域分 Store，不按页面分
- 异步操作放在 Store 中
- 避免嵌套状态

---

## 6. IPC 通信设计（最小化）

### 6.1 Preload Script

```javascript
// preload/index.js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  // 专注事项
  getFocusItems: () => ipcRenderer.invoke('get-focus-items'),
  createFocusItem: (item) => ipcRenderer.invoke('create-focus-item', item),
  updateFocusItem: (id, data) => ipcRenderer.invoke('update-focus-item', id, data),

  // 会话
  startSession: (itemId) => ipcRenderer.invoke('start-session', itemId),
  endSession: (sessionId) => ipcRenderer.invoke('end-session', sessionId),

  // 番茄钟
  completePomodoro: (data) => ipcRenderer.invoke('complete-pomodoro', data),

  // 统计
  getStats: (range) => ipcRenderer.invoke('get-stats', range),

  // 通知
  showNotification: (title, body) => ipcRenderer.send('show-notification', title, body)
})
```

**原则：**
- 所有 IPC 调用封装在 `window.api`
- 使用 `invoke` 而非 `send`（更简洁）
- 仅暴露必要的 API

---

## 7. UI 组件设计（无 UI 库）

### 7.1 不使用 UI 组件库

**理由：**
```
✅ 应用界面简单，自定义组件更轻量
✅ 避免引入大量不需要的组件
✅ 完全可控的样式
✅ 减少打包体积

不使用：
❌ Ant Design - 过于庞大（1MB+）
❌ Material-UI - 样式侵入性强
❌ shadcn/ui - 需要复制大量代码
```

### 7.2 自定义核心组件

```
核心组件（仅 10 个）：

布局：
- Layout.jsx         # 主布局
- Sidebar.jsx        # 侧边栏

计时器：
- Timer.jsx          # 计时器显示
- TimerControls.jsx  # 控制按钮

专注事项：
- FocusItemCard.jsx  # 事项卡片
- FocusItemForm.jsx  # 事项表单

统计：
- StatsCard.jsx      # 统计卡片
- Chart.jsx          # 图表（基于 recharts）

通用：
- Button.jsx         # 按钮
- Modal.jsx          # 模态框
```

---

## 8. 图表方案

### 8.1 选择 Recharts

```javascript
import { PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

// 示例：饼图
<PieChart width={400} height={400}>
  <Pie data={data} dataKey="value" nameKey="name">
    {data.map((entry, index) => (
      <Cell key={index} fill={entry.color} />
    ))}
  </Pie>
</PieChart>
```

**理由：**
```
✅ 声明式 API，简单直接
✅ 基于 React 组件
✅ 无需复杂配置
✅ 体积适中（~100KB）

不选择：
❌ ECharts - 过于庞大，非 React 生态
❌ Chart.js - 命令式 API，不适合 React
❌ D3.js - 学习曲线陡，过度复杂
```

---

## 9. 计时器实现（核心逻辑）

### 9.1 精准计时方案

```javascript
// 使用 setInterval + 时间戳校准
class Timer {
  constructor() {
    this.startTime = null
    this.expectedTime = null
    this.interval = null
  }

  start(duration) {
    this.startTime = Date.now()
    this.expectedTime = this.startTime + duration * 1000

    this.interval = setInterval(() => {
      const now = Date.now()
      const timeLeft = Math.max(0, this.expectedTime - now)

      if (timeLeft === 0) {
        this.onComplete()
        this.stop()
      } else {
        this.onTick(timeLeft)
      }
    }, 100) // 每 100ms 更新一次
  }

  stop() {
    clearInterval(this.interval)
  }
}
```

**原则：**
- 使用时间戳校准，避免累积误差
- 高频更新（100ms），确保显示流畅
- 主进程和渲染进程分离

---

## 10. 系统通知实现

### 10.1 Electron Notification

```javascript
// main/notification.js
const { Notification } = require('electron')

function showNotification(title, body) {
  new Notification({
    title,
    body,
    icon: path.join(__dirname, '../public/icon.png')
  }).show()
}

// 可选：播放声音
const player = require('play-sound')()
player.play('public/notification.mp3')
```

**原则：**
- 使用 Electron 原生 Notification
- 音效可选（MP3 文件）
- 主进程处理

---

## 11. 打包配置

### 11.1 electron-builder 配置

```json
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
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

**输出：**
- Windows: `.exe` 安装包
- 大小预估: ~60MB（含 Electron runtime）

---

## 12. 性能优化策略

### 12.1 启动优化

```javascript
// 主进程延迟加载
app.whenReady().then(() => {
  createWindow() // 先显示窗口

  setTimeout(() => {
    loadDatabase() // 延迟加载数据库
  }, 100)
})
```

### 12.2 渲染优化

```javascript
// 使用 React.memo 优化组件
const FocusItemCard = React.memo(({ item }) => {
  return <div>{item.name}</div>
})

// 虚拟列表（仅在事项 > 50 时考虑）
// 暂不实现，YAGNI 原则
```

### 12.3 数据库优化

```sql
-- 添加索引
CREATE INDEX idx_sessions_item_id ON focus_sessions(focus_item_id);
CREATE INDEX idx_records_session_id ON pomodoro_records(session_id);
```

**原则：**
- 过早优化是万恶之源
- 先实现，后优化
- 只优化瓶颈

---

## 13. 开发工具链

### 13.1 最小化工具

```json
{
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "package": "electron-builder"
  }
}
```

**不引入：**
- ❌ 代码格式化工具（IDE 自带）
- ❌ Git Hooks（增加复杂度）
- ❌ 自动化测试（MVP 阶段不需要）

### 13.2 调试方案

```javascript
// 开发环境打开 DevTools
if (process.env.NODE_ENV === 'development') {
  mainWindow.webContents.openDevTools()
}
```

---

## 14. 技术债务管理

### 14.1 允许的技术债

**MVP 阶段允许：**
- 无单元测试（先验证需求）
- 无国际化（仅中文）
- 无主题切换（仅浅色）
- 无快捷键（Phase 2 再加）

**不允许：**
- 数据库设计缺陷（后续难改）
- 架构设计错误（重构成本高）
- 数据丢失风险（核心功能）

---

## 15. 依赖升级策略

**原则：**
```
- 锁定主版本（package.json 使用 ^）
- 定期更新安全补丁
- 避免大版本升级（除非必要）
```

---

## 16. 架构决策记录（ADR）

### ADR-001: 为什么不用 TypeScript？

**决策：** MVP 阶段使用 JavaScript

**理由：**
- 减少编译配置复杂度
- 加快开发速度
- 应用规模小，类型安全收益有限
- 可在 Phase 2 逐步迁移

**后果：**
- 可能有运行时类型错误
- IDE 提示不如 TS 完善

---

### ADR-002: 为什么不用 UI 组件库？

**决策：** 自定义所有组件

**理由：**
- 应用界面简单（仅 4 个页面）
- 自定义组件更轻量（< 50 行/组件）
- 完全可控的样式
- 减少打包体积（节省 1MB+）

**后果：**
- 需要自己处理无障碍（a11y）
- 缺少一些高级组件（可接受）

---

### ADR-003: 为什么选择 Zustand 而不是 Redux？

**决策：** 使用 Zustand 作为状态管理

**理由：**
- 极简 API（学习成本低）
- 无需 Provider 包裹（减少嵌套）
- 体积小（仅 1KB）
- 满足应用需求（状态不复杂）

**后果：**
- 社区生态不如 Redux 丰富
- 缺少时间旅行调试（可接受）

---

## 17. 总结

### 17.1 技术栈总览

```
核心框架：Electron + React + Vite
状态管理：Zustand（1KB）
样式方案：CSS Modules（零依赖）
数据库：better-sqlite3（零配置）
图表库：Recharts（声明式）

总依赖数：5 个生产依赖
预计打包体积：~60MB
```

### 17.2 设计原则

```
✅ KISS - 保持简单
✅ YAGNI - 不过度设计
✅ DRY - 避免重复
✅ 轻量化 - 最小依赖
```

### 17.3 下一步

1. 初始化项目骨架
2. 搭建 Electron + React 开发环境
3. 实现数据库层
4. 开发核心计时器功能

---

**文档状态:** ✅ 已完成
**审批状态:** 待确认
**下一步:** 等待确认后开始项目初始化
