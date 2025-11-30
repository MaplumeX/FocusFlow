# FocusFlow - 专注力管理工具

让不同类型的工作拥有专属的专注节奏,通过数据洞察帮助你优化时间分配。

## 功能特性

- ✅ 专注事项管理 - 为不同类型的工作创建专属配置
- ✅ 智能计时器 - 精准的番茄钟计时
- ✅ 自动休息提醒 - 工作与休息的完美平衡
- ✅ 数据统计分析 - 深入了解你的专注习惯
- ✅ 本地数据存储 - 隐私安全,离线可用
- ✅ 云端同步 - 多设备数据同步(Phase 4)

## 技术栈

- **前端框架:** React 18
- **桌面框架:** Electron 28
- **构建工具:** Vite 5
- **状态管理:** Zustand
- **数据库:** better-sqlite3
- **图表库:** Recharts

**依赖极简:** 仅 5 个生产依赖,打包体积 < 80MB

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
# 启动开发服务器
pnpm dev

# 构建应用
pnpm build

# 预览构建结果
pnpm preview
```

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
│       ├── PHASE_1.md     # MVP 核心功能
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
│   │   ├── components/    # 通用组件
│   │   ├── store/         # Zustand 状态
│   │   ├── styles/        # CSS Modules
│   │   ├── utils/         # 工具函数
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── App.jsx        # 根组件
│   │   └── main.jsx       # 入口文件
│   │
│   ├── preload/          # 预加载脚本
│   │   └── index.js      # 安全 API 暴露
│   │
│   └── shared/           # 共享代码
│       ├── constants.js  # 常量定义
│       └── types.js      # 类型定义
│
├── database/             # 数据库文件
│   └── schema.sql       # 数据库结构
│
├── public/              # 静态资源
│
├── index.html           # HTML 入口
└── package.json         # 项目配置
```

## 开发进度

- [x] Phase 1: MVP 核心功能 (当前阶段)
  - [x] 项目架构搭建
  - [x] 基础组件实现
  - [x] 数据库层实现 (JSON存储)
  - [x] IPC 通信层
  - [x] 专注事项数据管理
  - [ ] 专注事项 UI 完善
  - [ ] 计时器功能
  - [ ] 系统通知

- [ ] Phase 2: 会话管理
- [ ] Phase 3: 数据统计
- [ ] Phase 4: 云端同步
- [ ] Phase 5: 打包发布

## 贡献指南

本项目严格遵循以下原则:

- **KISS (简单至上)** - 追求代码和设计的极致简洁
- **YAGNI (精益求精)** - 仅实现当前明确所需的功能
- **DRY (杜绝重复)** - 自动识别重复代码模式
- **SOLID 原则** - 良好的架构设计

**重要文档:**
- [红线文档](docs/CONSTRAINTS.md) - 强制执行的禁止事项
- [规范文档](docs/STANDARDS.md) - 开发规范和最佳实践

## 许可证

MIT License

---

**当前版本:** 0.1.0 (MVP 阶段)
**最后更新:** 2025-11-30
