# FocusFlow - 番茄钟应用产品需求文档 (PRD)

**版本:** 2.0
**日期:** 2025-11-29
**项目类型:** Electron 桌面应用
**更新日志:** 重构"任务"概念为"专注事项"（Focus Item），采用 Preset 配置模式

---

## 1. 产品概述

### 1.1 产品定位
FocusFlow 是一款基于番茄工作法的专注力管理桌面应用，通过"专注事项"（Focus Item）的预设配置，让用户为不同类型的工作设定专属的专注节奏，配合数据统计和多设备同步，科学提升专注力和工作效率。

### 1.2 核心理念
**专注事项 (Focus Item) = 可重复使用的专注模板**

不同于传统待办事项，专注事项是一种"专注配置预设"：
- 📊 **深度编程**：50分钟工作 + 10分钟休息（深度工作）
- 📧 **处理邮件**：15分钟工作 + 3分钟休息（快速处理）
- 📚 **学习阅读**：25分钟工作 + 5分钟休息（标准节奏）
- 🎨 **创意设计**：40分钟工作 + 8分钟休息（创造性工作）

### 1.3 目标用户
- 需要提升专注力的知识工作者
- 不同工作类型需要不同专注节奏的用户
- 学生群体（不同科目不同学习节奏）
- 自由职业者和远程工作者

### 1.4 技术栈
- **框架:** Electron
- **前端:** React
- **UI 组件库:** Ant Design / shadcn/ui（待定）
- **状态管理:** Zustand / Redux Toolkit
- **本地存储:** SQLite
- **云端同步:** Supabase（推荐方案）
- **样式:** Tailwind CSS
- **打包工具:** Electron Builder
- **目标平台:** Windows（首期）

---

## 2. 核心功能需求

### 2.1 专注事项管理

#### 2.1.1 专注事项数据模型
```typescript
FocusItem {
  id: string (UUID)
  name: string                    // 事项名称，如"深度编程"
  icon: string                    // 图标（emoji 或图标名）
  color: string                   // 颜色标识（HEX）

  // 番茄钟配置（每个事项独立配置）
  config: {
    work_duration: number         // 工作时长（分钟）
    short_break_duration: number  // 短休息时长（分钟）
    long_break_duration: number   // 长休息时长（分钟）
    long_break_interval: number   // 长休息间隔（几个番茄钟后）
  }

  // 统计数据（自动计算）
  stats: {
    total_sessions: number        // 累计专注次数
    total_duration: number        // 累计专注时长（分钟）
    last_used_at: timestamp       // 最后使用时间
  }

  created_at: timestamp
  updated_at: timestamp
}
```

#### 2.1.2 专注事项操作
- ➕ **创建事项**：设置名称、图标、颜色、番茄钟配置
- ✏️ **编辑事项**：修改配置和外观
- 🗑️ **删除事项**：删除后历史数据保留
- 📌 **常用事项**：可设置为常用，快速访问
- 🎨 **自定义配置**：每个事项独立的番茄钟时长配置

#### 2.1.3 预设模板
系统提供默认模板（用户可修改或删除）：
```
📊 深度工作
   └─ 50分钟工作 + 10分钟休息，2个番茄钟后长休息30分钟

⚡ 快速处理
   └─ 15分钟工作 + 3分钟休息，4个番茄钟后长休息10分钟

📚 标准学习
   └─ 25分钟工作 + 5分钟休息，4个番茄钟后长休息15分钟

🎨 创意工作
   └─ 40分钟工作 + 8分钟休息，3个番茄钟后长休息20分钟
```

---

### 2.2 专注会话（Focus Session）

#### 2.2.1 使用流程
```
1. 用户选择专注事项
   ↓
2. 应用该事项的番茄钟配置
   ↓
3. 用户点击"开始专注"
   ↓
4. 计时开始，记录到该事项的会话中
   ↓
5. 完成后统计到该事项的数据
```

#### 2.2.2 专注会话数据模型
```typescript
FocusSession {
  id: string (UUID)
  focus_item_id: string           // 关联的专注事项

  // 会话配置（快照，记录当时的配置）
  config_snapshot: {
    work_duration: number
    short_break_duration: number
    long_break_duration: number
    long_break_interval: number
  }

  // 会话记录
  pomodoros: [                    // 番茄钟数组
    {
      type: 'work' | 'short_break' | 'long_break'
      duration: number            // 实际时长（秒）
      start_time: timestamp
      end_time: timestamp
      is_completed: boolean       // 是否完整完成
    }
  ]

  // 会话统计
  session_stats: {
    total_pomodoros: number       // 本次会话番茄钟数
    total_duration: number        // 本次会话总时长
    completed_pomodoros: number   // 完整完成的番茄钟数
  }

  started_at: timestamp           // 会话开始时间
  ended_at: timestamp             // 会话结束时间（可为空）
  is_active: boolean              // 是否为当前活动会话
}
```

#### 2.2.3 计时器控制
- **选择事项** → 显示该事项的配置信息
- **开始专注** → 创建新会话，开始计时
- ⏸️ **暂停/继续** → 暂停当前番茄钟
- ⏹️ **停止** → 结束当前会话
- ⏭️ **跳过休息** → 直接进入下一个工作时段

#### 2.2.4 状态显示
- 当前选择的专注事项（名称、图标、颜色）
- 该事项的配置信息预览
- 倒计时显示（MM:SS）
- 当前阶段（工作中 / 短休息 / 长休息）
- 本次会话已完成番茄钟数
- 今日总计完成番茄钟数

#### 2.2.5 系统通知
- **触发时机:**
  - 工作时段结束
  - 休息时段结束
- **通知内容:**
  - 标题：包含事项名称（如"深度编程 - 工作时段结束"）
  - 内容：下一步操作提示
  - 系统原生通知（Windows Notification）
- **通知音效:** 可选开启/关闭（默认开启）

---

### 2.3 数据统计

#### 2.3.1 统计维度
- **时间维度:**
  - 今日统计
  - 本周统计
  - 本月统计
  - 自定义日期范围

- **专注事项维度:**
  - 按事项统计专注时长
  - 按事项统计番茄钟数量
  - 事项使用频率排行

#### 2.3.2 统计指标

**全局统计：**
- 📊 总专注时长（小时）
- 🍅 总番茄钟数
- 📈 每日平均番茄钟数
- 🔥 连续专注天数
- ⏱️ 平均每次专注时长

**按事项统计：**
```
本周专注事项分布：

📊 深度编程
   ├─ 专注时长: 12小时
   ├─ 番茄钟数: 14个 (50分钟/个)
   ├─ 占比: 50%
   └─ 使用次数: 8次

📧 处理邮件
   ├─ 专注时长: 3小时
   ├─ 番茄钟数: 12个 (15分钟/个)
   ├─ 占比: 12.5%
   └─ 使用次数: 4次

📚 学习阅读
   ├─ 专注时长: 6小时
   ├─ 番茄钟数: 14个 (25分钟/个)
   ├─ 占比: 25%
   └─ 使用次数: 6次
```

#### 2.3.3 数据可视化

**图表类型：**
- 📊 **柱状图**：每日番茄钟数量对比
- 📈 **折线图**：专注时长趋势
- 🥧 **饼图**：专注事项时间分布
- 🗓️ **热力图**：月度专注日历
- 📉 **排行榜**：最常用的专注事项

**关键洞察：**
- "本周你在'深度编程'上花费了最多时间"
- "你的专注高峰时段是上午10-12点"
- "相比上周，本周专注时长增加了15%"

#### 2.3.4 数据导出
- **导出格式:** CSV / JSON
- **导出内容:**
  - 专注事项配置
  - 完整的会话记录
  - 统计数据汇总
- **导出入口:** 统计页面

---

### 2.4 数据同步

#### 2.4.1 本地存储
- **存储方案:** SQLite
- **存储内容:**
  - 专注事项配置
  - 专注会话记录
  - 用户全局设置（通知、音效等）

#### 2.4.2 云端同步
- **同步方案:** Supabase
  - 用户注册/登录（邮箱 + 密码）
  - 自动同步到云端
  - 多设备数据一致性保证

- **同步策略:**
  - 实时同步（网络可用时）
  - 离线优先（本地数据为主，网络恢复后同步）
  - 冲突解决：以最新时间戳为准

- **同步内容:**
  - ✅ 专注事项配置
  - ✅ 专注会话记录
  - ✅ 用户全局设置

---

## 3. 用户界面设计

### 3.1 设计风格
- **整体风格:** 简约现代
- **色彩方案:**
  - 主色调：专注蓝 (#3498DB)
  - 辅助色：活力橙 (#E67E22)
  - 背景：浅色主题（支持暗色模式可选）
- **设计原则:**
  - 界面简洁，减少干扰
  - 信息层级清晰
  - 操作流畅，响应及时

### 3.2 主要页面

#### 3.2.1 主页面（专注计时器）

**布局设计：**
```
┌─────────────────────────────────────────┐
│  FocusFlow                    [设置] [统计] │
├─────────────────────────────────────────┤
│                                         │
│  当前事项：📊 深度编程                   │
│  配置：50分钟工作 + 10分钟休息           │
│                                         │
│            ⏱️  49:35                    │
│          工作中 · 第1个番茄钟             │
│                                         │
│      [⏸️ 暂停]  [⏹️ 停止]               │
│                                         │
├─────────────────────────────────────────┤
│  本次会话: 🍅 1个  |  今日: 🍅🍅🍅 3个   │
└─────────────────────────────────────────┘

侧边栏 - 专注事项列表：
┌──────────────────────┐
│ 📋 我的专注事项       │
├──────────────────────┤
│ [📊 深度编程]  ⭐    │  ← 当前选中
│  12h  |  14次        │
│                      │
│ 📧 处理邮件          │
│  3h   |  4次         │
│                      │
│ 📚 学习阅读          │
│  6h   |  6次         │
│                      │
│ [+ 新建事项]         │
└──────────────────────┘
```

**未选择事项时的状态：**
```
┌─────────────────────────────────────────┐
│           选择一个专注事项开始           │
│                                         │
│              ⬅️ 从左侧选择              │
│                  或                     │
│          [+ 创建新的专注事项]            │
└─────────────────────────────────────────┘
```

**选择事项后，未开始状态：**
```
┌─────────────────────────────────────────┐
│  当前事项：📊 深度编程                   │
│  配置：50分钟工作 + 10分钟休息           │
│        2个番茄钟后长休息30分钟           │
│                                         │
│            [▶️ 开始专注]                │
│                                         │
│  累计: 12小时  |  14次  |  上次: 今天10:00 │
└─────────────────────────────────────────┘
```

#### 3.2.2 专注事项管理页面

**列表视图：**
```
┌─────────────────────────────────────────┐
│  专注事项管理              [+ 新建事项]   │
├─────────────────────────────────────────┤
│                                         │
│  📊 深度编程                       [编辑] │
│     50分钟工作 + 10分钟休息              │
│     累计: 12小时  |  14次               │
│     ━━━━━━━━━━━━━━━━━━━━ 50%          │
│                                         │
│  📧 处理邮件                       [编辑] │
│     15分钟工作 + 3分钟休息               │
│     累计: 3小时   |  4次                │
│     ━━━━ 12.5%                        │
│                                         │
│  📚 学习阅读                       [编辑] │
│     25分钟工作 + 5分钟休息               │
│     累计: 6小时   |  6次                │
│     ━━━━━━━━ 25%                     │
│                                         │
└─────────────────────────────────────────┘
```

**创建/编辑事项：**
```
┌─────────────────────────────────────────┐
│  创建专注事项                            │
├─────────────────────────────────────────┤
│  事项名称: [深度编程______________]      │
│                                         │
│  图标: 📊 📧 📚 🎨 💻 🔬 ✏️ ...       │
│                                         │
│  颜色: 🔴 🟠 🟡 🟢 🔵 🟣 ...           │
│                                         │
│  ─────── 番茄钟配置 ───────              │
│                                         │
│  工作时长:     [50] 分钟                 │
│  短休息:       [10] 分钟                 │
│  长休息:       [30] 分钟                 │
│  长休息间隔:   [2]  个番茄钟后           │
│                                         │
│  预设模板: [深度工作▼]                   │
│                                         │
│            [取消]  [保存]               │
└─────────────────────────────────────────┘
```

#### 3.2.3 统计页面

```
┌─────────────────────────────────────────┐
│  数据统计          [今日▼] [本周] [本月]  │
├─────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │  24小时   │ │  12个    │ │   95%   ││
│  │ 专注时长  │ │ 番茄钟   │ │ 完成率  ││
│  └──────────┘ └──────────┘ └──────────┘│
├─────────────────────────────────────────┤
│  📊 专注事项分布                          │
│                                         │
│       🥧 饼图                            │
│  📊 深度编程 50%                         │
│  📚 学习阅读 25%                         │
│  📧 处理邮件 12.5%                       │
│  🎨 创意设计 12.5%                       │
│                                         │
├─────────────────────────────────────────┤
│  📈 本周趋势                             │
│                                         │
│      折线图/柱状图                       │
│  周一  周二  周三  周四  周五  周六  周日 │
│   4    6    5    7    8    3    2      │
│                                         │
├─────────────────────────────────────────┤
│  🔥 最常用事项                           │
│  1. 📊 深度编程    14次                  │
│  2. 📚 学习阅读     6次                  │
│  3. 📧 处理邮件     4次                  │
│                                         │
│              [导出数据 CSV/JSON]         │
└─────────────────────────────────────────┘
```

#### 3.2.4 设置页面

```
┌─────────────────────────────────────────┐
│  设置                                    │
├─────────────────────────────────────────┤
│  通知设置                                │
│    ☑️ 启用系统通知                       │
│    ☑️ 启用提示音效                       │
│                                         │
│  账户管理                                │
│    已登录: user@example.com             │
│    同步状态: ✅ 已同步 (2分钟前)         │
│    [登出]                               │
│                                         │
│  数据管理                                │
│    [导出所有数据]                        │
│    [清除本地数据]                        │
│                                         │
│  外观                                    │
│    主题: ○ 浅色  ○ 深色  ● 跟随系统    │
│                                         │
│  关于                                    │
│    FocusFlow v1.0.0                     │
│    [检查更新] [使用帮助] [反馈问题]      │
└─────────────────────────────────────────┘
```

---

## 4. 技术架构

### 4.1 项目结构
```
FocusFlow/
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── index.js       # 主进程入口
│   │   ├── ipc.js         # IPC 通信处理
│   │   └── notification.js # 系统通知
│   ├── renderer/          # React 渲染进程
│   │   ├── components/    # React 组件
│   │   │   ├── Timer/     # 计时器组件
│   │   │   ├── FocusItem/ # 专注事项组件
│   │   │   ├── Statistics/# 统计组件
│   │   │   └── Common/    # 通用组件
│   │   ├── pages/         # 页面组件
│   │   │   ├── Home.jsx   # 主页（计时器）
│   │   │   ├── Items.jsx  # 事项管理
│   │   │   ├── Stats.jsx  # 统计页面
│   │   │   └── Settings.jsx # 设置页面
│   │   ├── store/         # 状态管理
│   │   │   ├── focusItems.js  # 专注事项状态
│   │   │   ├── sessions.js    # 会话状态
│   │   │   └── timer.js       # 计时器状态
│   │   ├── services/      # 服务层
│   │   │   ├── database.js    # 本地数据库
│   │   │   ├── sync.js        # 云端同步
│   │   │   └── statistics.js  # 统计计算
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── utils/         # 工具函数
│   │   └── App.jsx        # 应用入口
│   ├── shared/            # 共享代码
│   │   ├── constants.js   # 常量定义
│   │   └── types.js       # TypeScript 类型
│   └── preload/           # 预加载脚本
├── public/                # 静态资源
│   ├── icons/             # 应用图标
│   └── sounds/            # 提示音效
├── database/              # 数据库文件
│   └── schema.sql         # 数据库架构
└── package.json
```

### 4.2 数据库设计

#### 专注事项表 (focus_items)
```sql
CREATE TABLE focus_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,

  -- 番茄钟配置
  work_duration INTEGER NOT NULL,
  short_break_duration INTEGER NOT NULL,
  long_break_duration INTEGER NOT NULL,
  long_break_interval INTEGER NOT NULL,

  -- 统计数据
  total_sessions INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 专注会话表 (focus_sessions)
```sql
CREATE TABLE focus_sessions (
  id TEXT PRIMARY KEY,
  focus_item_id TEXT NOT NULL,

  -- 配置快照
  config_work_duration INTEGER NOT NULL,
  config_short_break INTEGER NOT NULL,
  config_long_break INTEGER NOT NULL,
  config_long_break_interval INTEGER NOT NULL,

  -- 会话数据
  total_pomodoros INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  completed_pomodoros INTEGER DEFAULT 0,

  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,

  FOREIGN KEY (focus_item_id) REFERENCES focus_items(id)
);
```

#### 番茄钟记录表 (pomodoro_records)
```sql
CREATE TABLE pomodoro_records (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  focus_item_id TEXT NOT NULL,

  -- 仅记录工作番茄钟, 不再区分 type
  duration INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,

  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,

  FOREIGN KEY (session_id) REFERENCES focus_sessions(id),
  FOREIGN KEY (focus_item_id) REFERENCES focus_items(id)
);
```

#### 用户设置表 (settings)
```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  notification_enabled BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'system' CHECK(theme IN ('light', 'dark', 'system')),

  -- 云端同步
  sync_enabled BOOLEAN DEFAULT FALSE,
  user_email TEXT,
  last_sync_at TIMESTAMP
);
```

### 4.3 核心业务逻辑

#### 开始专注会话
```javascript
async function startFocusSession(focusItemId) {
  // 1. 获取专注事项配置
  const focusItem = await db.getFocusItem(focusItemId);

  // 2. 创建新会话（保存配置快照）
  const session = await db.createSession({
    focus_item_id: focusItemId,
    config_snapshot: focusItem.config,
    started_at: new Date()
  });

  // 3. 开始第一个番茄钟
  await startPomodoro(session.id, focusItem.config.work_duration, 'work');

  // 4. 更新专注事项的 last_used_at
  await db.updateFocusItem(focusItemId, { last_used_at: new Date() });
}
```

#### 番茄钟完成处理
```javascript
async function onPomodoroComplete(sessionId, pomodoroId, isCompleted) {
  // 1. 更新番茄钟记录
  await db.updatePomodoro(pomodoroId, {
    is_completed: isCompleted,
    end_time: new Date()
  });

  // 2. 如果完整完成，更新会话和事项统计
  if (isCompleted) {
    await db.incrementSessionStats(sessionId);
    await db.incrementFocusItemStats(focusItemId);
  }

  // 3. 发送系统通知
  await sendNotification(focusItem.name, nextStepMessage);

  // 4. 自动进入休息（或提示用户）
  await startBreak(sessionId);
}
```

---

## 5. 开发计划

### Phase 1: MVP（最小可行产品）- 2周
- ✅ 项目初始化和基础架构
- ✅ 专注事项 CRUD 功能
- ✅ 基础计时器功能（应用事项配置）
- ✅ 本地数据存储（SQLite）
- ✅ 基础 UI（主页 + 事项管理）
- ✅ 系统通知

### Phase 2: 会话管理 - 1周
- ✅ 完整的会话生命周期管理
- ✅ 多番茄钟连续执行
- ✅ 暂停/继续/停止功能
- ✅ 会话数据记录

### Phase 3: 数据统计 - 1-2周
- ✅ 统计数据计算引擎
- ✅ 数据可视化图表
- ✅ 按事项维度统计
- ✅ 数据导出功能

### Phase 4: 云端同步 - 1-2周
- ✅ Supabase 集成
- ✅ 用户认证系统
- ✅ 数据同步逻辑
- ✅ 离线优先策略

### Phase 5: 优化和发布 - 1周
- ✅ 性能优化
- ✅ UI/UX 打磨
- ✅ 错误处理和边界情况
- ✅ 打包和分发

**预计总开发时间：6-8周**

---

## 6. 非功能性需求

### 6.1 性能要求
- 应用启动时间 < 2 秒
- 计时器精度误差 < 1 秒
- 界面响应时间 < 100ms
- 数据统计计算 < 500ms

### 6.2 稳定性
- 异常处理和错误提示
- 会话数据自动保存（防止意外关闭）
- 数据恢复机制

### 6.3 用户体验
- 简洁直观的界面
- 流畅的动画效果（但不过度）
- 清晰的操作反馈
- 键盘快捷键（可选）

---

## 7. 未来扩展功能（可选）

### 7.1 高优先级
- 🎵 **白噪音播放**：为专注事项配置专属背景音
- 🔔 **倒计时提醒**：剩余5分钟时提醒
- 📱 **托盘模式**：最小化到系统托盘

### 7.2 中优先级
- 🏆 **成就系统**：连续专注奖励
- 📊 **周报/月报**：自动生成专注报告
- 🎯 **每日目标**：设置每日专注目标

### 7.3 低优先级
- ⌨️ **全局快捷键**：快速开始/暂停
- 🌙 **专注时段**：自动检测专注高峰期
- 👥 **团队协作**：团队专注统计
- 🔗 **第三方集成**：Notion、Todoist 等

---

## 8. 核心差异化优势

### vs 传统番茄钟应用
| 传统应用 | FocusFlow |
|---------|-----------|
| 全局统一配置 | 每个专注事项独立配置 |
| 单一计时模式 | 根据工作类型切换专注节奏 |
| 简单计数统计 | 按事项维度深度分析 |
| 一次性任务 | 可重复使用的专注模板 |

### 核心价值
1. **个性化专注节奏**：不同工作类型，不同专注配置
2. **数据洞察**：了解自己在哪类工作上最专注
3. **长期追踪**：持续统计每种专注事项的时间投入
4. **简化流程**：预设配置，快速开始

---

## 9. 技术选型说明

### 9.1 为什么选择 Electron
- 桌面应用体验（独立窗口、系统通知）
- 前端技术栈，开发效率高
- 未来可扩展 macOS/Linux

### 9.2 为什么选择 React
- 组件化开发，代码复用性强
- 丰富的状态管理方案
- 成熟的 UI 组件库生态

### 9.3 为什么选择 Supabase
- 开箱即用的认证和数据库
- 实时同步支持
- 免费额度充足
- PostgreSQL 强大的查询能力
- 优秀的 JavaScript SDK

### 9.4 为什么选择 SQLite
- 轻量级，无需额外服务
- 完整的 SQL 支持
- 可靠的本地持久化
- 易于备份和迁移

---

## 10. 关键问题和解决方案

### Q1: 专注事项被删除后，历史数据怎么办？
**A:** 采用软删除策略
- 专注事项添加 `is_deleted` 字段
- 删除时标记为已删除，不真正删除
- 统计时过滤掉已删除事项
- 用户可以"恢复"已删除事项

### Q2: 用户修改专注事项配置，历史会话怎么办？
**A:** 会话记录保存配置快照
- 每次开始会话时，保存当时的配置
- 历史数据保持一致性
- 统计时使用快照中的配置

### Q3: 如何防止数据丢失？
**A:** 多重保障
- 定时自动保存（每30秒）
- 窗口关闭前保存当前状态
- 云端自动同步
- 本地数据库定期备份

### Q4: 多设备同步冲突怎么处理？
**A:** 时间戳优先 + 会话隔离
- 专注事项配置：取最新时间戳
- 会话记录：不会冲突（设备独立）
- 统计数据：服务端重新计算

---

**文档状态:** ✅ 已完成 v2.0
**下一步:** 开始项目初始化和技术架构搭建
