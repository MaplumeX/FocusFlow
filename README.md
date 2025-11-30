# FocusFlow - 专注力管理工具

让不同类型的工作拥有专属的专注节奏,通过数据洞察帮助你优化时间分配。

## 功能特性

### ✅ Phase 1 (已完成)

- **专注事项管理** - 创建/编辑/删除专注事项,自定义图标、颜色和番茄钟配置
- **智能计时器** - 精准的番茄钟计时(工作/短休息/长休息),基于时间戳的精确倒计时
- **自动休息提醒** - 系统通知提醒工作和休息时间结束
- **今日统计** - 实时显示累计专注时长、完成次数和当前进度
- **本地数据存储** - SQLite数据库,隐私安全,离线可用
- **响应式UI** - 完全自研组件(Button/Modal/Timer等),无第三方UI库依赖

### ✅ Phase 2 (已完成)

- **会话管理系统** - 完整的专注会话生命周期管理
- **自动休息机制** - 智能判断短/长休息,自动切换工作和休息
- **休息结束提示** - 友好的休息结束 Modal,显示会话统计
- **跳过休息功能** - 灵活跳过休息,直接开始工作
- **会话统计** - 本次会话和今日统计,实时数据展示
- **配置快照** - 保证配置修改不影响进行中的会话

### 🚧 规划中功能

- **数据统计分析** - 深入的可视化统计报表 (Phase 3)
- **历史记录查看** - 会话历史和番茄钟详情 (Phase 3)
- **云端同步** - 多设备数据同步 (Phase 4)

## 技术栈

- **前端框架:** React 18 (函数式组件 + Hooks)
- **桌面框架:** Electron 28
- **构建工具:** Vite 5
- **状态管理:** Zustand
- **数据库:** better-sqlite3 (同步SQLite)
- **样式方案:** CSS Modules

**依赖极简:** 仅 5 个核心生产依赖,打包体积 < 80MB

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd FocusFlow

# 安装依赖
pnpm install

# 手动安装 Electron (如果自动安装失败)
node node_modules/electron/install.js
```

### 开发

```bash
# 启动开发服务器 (Vite + Electron)
pnpm dev

# 构建应用
pnpm build

# 预览构建结果
pnpm preview
```

## 使用指南

### 1. 创建专注事项

在"专注事项"页面点击"+ 新建事项",配置:
- **名称和图标** - 选择合适的emoji图标和颜色
- **工作时长** - 番茄钟工作时长(默认25分钟)
- **短休息** - 短休息时长(默认5分钟)
- **长休息** - 长休息时长(默认15分钟)
- **长休息间隔** - 多少个工作时段后进行长休息(默认4次)

### 2. 开始专注

在"主页"选择专注事项后:
- 点击"开始工作"进入专注模式
- 计时器精确倒计时,显示剩余时间和进度条
- 可随时暂停/继续/停止
- 工作时段结束后自动进入休息提醒

### 3. 查看统计

主页实时显示今日统计:
- 累计专注时长
- 完成次数
- 当前进度

## 项目结构

```
FocusFlow/
├── docs/                   # 项目文档
│   ├── PRD.md             # 产品需求文档
│   ├── TECH_STACK.md      # 技术方案
│   ├── CONSTRAINTS.md     # 红线文档
│   ├── STANDARDS.md       # 开发规范
│   ├── IMPLEMENTATION.md  # 实施指南
│   ├── MASTER_PLAN.md     # 总任务文档
│   └── stages/            # 阶段任务文档
│       ├── PHASE_1.md     # MVP 核心功能 ✅
│       ├── PHASE_2.md     # 会话管理
│       ├── PHASE_3.md     # 数据统计
│       ├── PHASE_4.md     # 云端同步
│       └── PHASE_5.md     # 打包发布
│
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── index.js       # 主进程入口
│   │   ├── database.js    # 数据库操作
│   │   ├── notification.js # 系统通知
│   │   └── ipc.js         # IPC 处理器
│   │
│   ├── renderer/          # React 渲染进程
│   │   ├── pages/         # 页面组件
│   │   │   ├── Home.jsx   # 主页(计时器)
│   │   │   ├── Items.jsx  # 专注事项管理
│   │   │   ├── Stats.jsx  # 数据统计(占位)
│   │   │   └── Settings.jsx # 设置(占位)
│   │   │
│   │   ├── components/    # 通用组件
│   │   │   ├── Timer.jsx          # 计时器组件
│   │   │   ├── Button.jsx         # 按钮组件
│   │   │   ├── Modal.jsx          # 模态框组件
│   │   │   ├── FocusItemCard.jsx  # 专注事项卡片
│   │   │   └── FocusItemForm.jsx  # 专注事项表单
│   │   │
│   │   ├── store/         # Zustand 状态管理
│   │   │   ├── useFocusStore.js   # 专注事项状态
│   │   │   └── useTimerStore.js   # 计时器状态
│   │   │
│   │   ├── App.jsx        # 根组件(路由)
│   │   └── main.jsx       # 入口文件
│   │
│   └── preload/          # 预加载脚本
│       └── index.js      # 安全 API 暴露
│
├── database/             # 数据库文件
│   ├── schema.sql       # 数据库结构定义
│   └── focusflow.db     # SQLite数据文件(运行时生成)
│
├── index.html           # HTML 入口
└── package.json         # 项目配置
```

## 核心架构

### 状态管理 (Zustand)

- **useFocusStore** - 管理专注事项的CRUD操作
- **useTimerStore** - 管理计时器状态和倒计时逻辑

### IPC 通信流程

```
渲染进程 (React)
  ↓ window.api.xxx()
preload/index.js (contextBridge)
  ↓ ipcRenderer.invoke()
main/ipc.js (ipcMain.handle)
  ↓
main/database.js (SQLite)
```

### 计时器精度方案

使用时间戳差值计算,避免累积误差:
- 记录起始时间戳 `startTimestamp = Date.now()`
- 每100ms tick时,计算实际经过时间 `elapsed = Date.now() - startTimestamp`
- 剩余时间 `remainingTime = totalTime - elapsed`

## 开发进度

### ✅ Phase 1: MVP 核心功能 (已完成)

- [x] 项目架构搭建
- [x] 数据库层实现 (SQLite + better-sqlite3)
- [x] IPC 通信层
- [x] Zustand 状态管理
- [x] 专注事项 CRUD 功能
- [x] 专注事项 UI 组件
- [x] 计时器核心逻辑
- [x] 计时器 UI 组件
- [x] 系统通知集成
- [x] 今日统计展示
- [x] 基础路由系统

### 🚧 Phase 2: 会话管理 (规划中)

详见 [docs/stages/PHASE_2.md](docs/stages/PHASE_2.md)

### 🚧 Phase 3: 数据统计 (规划中)

详见 [docs/stages/PHASE_3.md](docs/stages/PHASE_3.md)

### 🚧 Phase 4: 云端同步 (规划中)

详见 [docs/stages/PHASE_4.md](docs/stages/PHASE_4.md)

### 🚧 Phase 5: 打包发布 (规划中)

详见 [docs/stages/PHASE_5.md](docs/stages/PHASE_5.md)

## 开发规范

本项目严格遵循以下原则:

- **KISS (简单至上)** - 追求代码和设计的极致简洁
- **YAGNI (精益求精)** - 仅实现当前明确所需的功能
- **DRY (杜绝重复)** - 自动识别重复代码模式
- **SOLID 原则** - 良好的架构设计

**重要文档:**
- [红线文档](docs/CONSTRAINTS.md) - 强制执行的禁止事项
- [规范文档](docs/STANDARDS.md) - 开发规范和最佳实践
- [实施指南](docs/IMPLEMENTATION.md) - 开发实施细节

## 贡献指南

开发新功能前请务必:
1. 阅读 [CONSTRAINTS.md](docs/CONSTRAINTS.md) 了解项目红线
2. 阅读 [STANDARDS.md](docs/STANDARDS.md) 了解编码规范
3. 查看对应阶段文档 (如 PHASE_2.md)
4. 确保所有修改符合KISS/YAGNI/DRY原则

## 许可证

MIT License

---

**当前版本:** 0.1.0 (Phase 1 完成)
**最后更新:** 2025-11-30
