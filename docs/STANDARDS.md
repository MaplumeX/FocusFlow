# FocusFlow - 规范文档（Standards Document）

**版本:** 1.0
**日期:** 2025-11-29
**重要性:** ✅ 强烈推荐，代码审查检查项
**适用范围:** 所有开发人员、AI 助手

---

## 📘 文档说明

本文档定义 FocusFlow 项目的**开发规范和最佳实践**。

**遵循规范的好处：**
- ✅ 代码风格统一，易于阅读
- ✅ 减少代码审查时间
- ✅ 降低维护成本
- ✅ 提高团队协作效率

**原则：**
> 规范是为了提高代码质量和团队协作效率，而非限制创造力。
> 在合理的情况下，优先遵循规范；特殊情况需注释说明。

---

## 1. 代码风格规范

### 1.1 JavaScript 代码风格

#### 1.1.1 缩进和空格

```javascript
// ✅ 使用 2 空格缩进
function example() {
  const x = 1
  if (x > 0) {
    return true
  }
}

// ❌ 不要使用 Tab
function example() {
→   const x = 1  // Tab 缩进
}
```

#### 1.1.2 引号

```javascript
// ✅ 优先使用单引号
const name = 'FocusFlow'
const message = `Hello, ${name}` // 模板字符串使用反引号

// ❌ 避免双引号（除非字符串包含单引号）
const name = "FocusFlow"
```

#### 1.1.3 分号

```javascript
// ✅ 不使用分号（JavaScript ASI 规则）
const x = 1
const y = 2
const sum = x + y

// 特殊情况：行首为 [ 或 ( 时，前面加分号
;[1, 2, 3].forEach(n => console.log(n))
;(function() {})()
```

#### 1.1.4 花括号

```javascript
// ✅ 花括号与语句同行
if (condition) {
  doSomething()
}

// ❌ 不要换行
if (condition)
{
  doSomething()
}

// ✅ 单行语句可省略花括号
if (condition) return true

// ❌ 但多行必须使用花括号
if (condition)
  doSomething()
  doAnotherThing() // 缩进误导
```

#### 1.1.5 空格规范

```javascript
// ✅ 操作符前后加空格
const sum = a + b
if (x > 0) {}
for (let i = 0; i < 10; i++) {}

// ✅ 逗号后加空格
const arr = [1, 2, 3]
const obj = { a: 1, b: 2 }

// ✅ 冒号后加空格（对象属性）
const user = {
  name: 'Alice',
  age: 30
}

// ❌ 不要在函数名和括号之间加空格
function foo() {}   // ✅
function foo () {}  // ❌
```

#### 1.1.6 空行规范

```javascript
// ✅ 逻辑块之间空一行
function calculate() {
  const x = 1
  const y = 2

  const sum = x + y
  const product = x * y

  return { sum, product }
}

// ✅ import 语句后空一行
import React from 'react'
import { useState } from 'react'

function MyComponent() {}
```

---

### 1.2 变量声明规范

#### 1.2.1 优先级

```javascript
// ✅ 优先使用 const
const MAX_COUNT = 100
const items = []

// ✅ 需要重新赋值时使用 let
let count = 0
count++

// ❌ 永远不要使用 var
var x = 1 // ❌
```

#### 1.2.2 声明位置

```javascript
// ✅ 在使用前声明
function example() {
  const x = 1
  const y = 2
  return x + y
}

// ❌ 不要在使用后声明
function example() {
  return x + y
  const x = 1  // ❌
  const y = 2
}
```

---

### 1.3 函数规范

#### 1.3.1 函数定义

```javascript
// ✅ 优先使用箭头函数（简短函数）
const add = (a, b) => a + b
const double = x => x * 2

// ✅ 使用函数声明（复杂逻辑）
function processData(data) {
  // 复杂逻辑
  return result
}

// ✅ 单个参数可省略括号
const square = x => x * x

// ❌ 不要混合使用
const foo = function() {} // ❌ 使用箭头函数或函数声明
```

#### 1.3.2 函数命名

```javascript
// ✅ 使用动词开头
function getData() {}
function createItem() {}
function handleClick() {}
function isValid() {}
function hasPermission() {}

// ❌ 不要使用名词
function data() {}      // ❌
function item() {}      // ❌
```

#### 1.3.3 函数长度

```javascript
// ✅ 单个函数不超过 50 行
function shortFunction() {
  // < 50 行
}

// ❌ 超过 50 行应拆分
function longFunction() {
  // > 50 行 - 需要拆分
}
```

---

### 1.4 对象和数组规范

#### 1.4.1 对象字面量

```javascript
// ✅ 使用简写属性
const name = 'Alice'
const age = 30
const user = { name, age }

// ✅ 使用简写方法
const obj = {
  getValue() {
    return this.value
  }
}

// ❌ 不要使用冗长写法
const user = { name: name, age: age } // ❌
const obj = {
  getValue: function() {} // ❌
}
```

#### 1.4.2 解构赋值

```javascript
// ✅ 使用对象解构
const { name, age } = user
const { x, y } = getPosition()

// ✅ 使用数组解构
const [first, second] = arr
const [count, setCount] = useState(0)

// ✅ 剩余参数
const { id, ...rest } = data
const [first, ...others] = arr
```

#### 1.4.3 扩展运算符

```javascript
// ✅ 使用扩展运算符
const newArr = [...oldArr, newItem]
const newObj = { ...oldObj, newProp: value }

// ❌ 避免使用 Object.assign / concat
const newObj = Object.assign({}, oldObj, { newProp: value }) // ❌
const newArr = oldArr.concat(newItem) // ❌
```

---

### 1.5 条件语句规范

```javascript
// ✅ 使用 === 而非 ==
if (x === 10) {}

// ✅ 使用三元运算符（简单条件）
const result = condition ? 'yes' : 'no'

// ❌ 避免嵌套三元运算符
const result = a ? (b ? 'x' : 'y') : 'z' // ❌

// ✅ 使用早返回（减少嵌套）
function validate(data) {
  if (!data) return false
  if (!data.name) return false
  return true
}

// ❌ 避免深层嵌套
function validate(data) {
  if (data) {
    if (data.name) {
      return true
    }
  }
  return false
}
```

---

## 2. React 代码规范

### 2.1 组件定义

#### 2.1.1 函数组件

```javascript
// ✅ 使用函数组件
function MyComponent({ title, onClick }) {
  return <div onClick={onClick}>{title}</div>
}

// ❌ 不要使用 class 组件（除非必要）
class MyComponent extends React.Component {} // ❌
```

#### 2.1.2 组件命名

```javascript
// ✅ 使用 PascalCase
function UserProfile() {}
function FocusItemCard() {}

// ❌ 不要使用 camelCase
function userProfile() {}   // ❌
function focusItemCard() {} // ❌
```

#### 2.1.3 Props 定义

```javascript
// ✅ 使用解构
function MyComponent({ name, age, onClick }) {
  return <div onClick={onClick}>{name}</div>
}

// ❌ 避免使用 props 对象
function MyComponent(props) {
  return <div>{props.name}</div> // ❌
}

// ✅ 使用默认值
function MyComponent({ count = 0, items = [] }) {
  return <div>{count}</div>
}
```

---

### 2.2 Hooks 规范

#### 2.2.1 Hooks 调用顺序

```javascript
// ✅ Hooks 在组件顶层调用
function MyComponent() {
  const [count, setCount] = useState(0)
  const value = useMemo(() => count * 2, [count])

  return <div>{value}</div>
}

// ❌ 不要在条件语句中调用 Hooks
function MyComponent() {
  if (condition) {
    const [count, setCount] = useState(0) // ❌
  }
}
```

#### 2.2.2 依赖数组

```javascript
// ✅ 正确声明依赖
useEffect(() => {
  console.log(count)
}, [count]) // ✅ 包含 count

// ❌ 缺少依赖
useEffect(() => {
  console.log(count)
}, []) // ❌ 应该包含 count

// ✅ 空依赖（仅运行一次）
useEffect(() => {
  initializeApp()
}, []) // ✅ 明确不依赖任何值
```

#### 2.2.3 自定义 Hooks

```javascript
// ✅ 自定义 Hooks 以 use 开头
function useFocusTimer(duration) {
  const [timeLeft, setTimeLeft] = useState(duration)
  // ...
  return { timeLeft, start, pause }
}

// ❌ 不要省略 use 前缀
function focusTimer() {} // ❌
```

---

### 2.3 JSX 规范

#### 2.3.1 标签格式

```javascript
// ✅ 自闭合标签
<Input />
<img src="..." alt="..." />

// ❌ 不要写成
<Input></Input> // ❌

// ✅ 多个属性换行
<Button
  type="primary"
  onClick={handleClick}
  disabled={isLoading}
>
  Submit
</Button>

// ✅ 单个属性同行
<Button onClick={handleClick}>Submit</Button>
```

#### 2.3.2 条件渲染

```javascript
// ✅ 使用 && 运算符
{isLoading && <Spinner />}
{count > 0 && <div>{count}</div>}

// ✅ 使用三元运算符
{isLoggedIn ? <UserMenu /> : <LoginButton />}

// ❌ 避免复杂的条件表达式
{a && b && c ? (d ? <X /> : <Y />) : <Z />} // ❌
```

#### 2.3.3 列表渲染

```javascript
// ✅ 使用 key 属性
{items.map(item => (
  <Item key={item.id} data={item} />
))}

// ❌ 不要使用 index 作为 key（除非列表固定）
{items.map((item, index) => (
  <Item key={index} /> // ❌
))}

// ✅ 使用稳定的 ID
{items.map(item => (
  <Item key={item.id} /> // ✅
))}
```

---

### 2.4 状态管理规范

#### 2.4.1 Zustand Store 定义

```javascript
// ✅ Store 文件命名：use{Name}Store.js
// store/useFocusStore.js
import create from 'zustand'

const useFocusStore = create((set, get) => ({
  // 状态
  items: [],
  selectedId: null,

  // 方法
  setItems: (items) => set({ items }),
  selectItem: (id) => set({ selectedId: id }),

  // 计算属性
  getSelectedItem: () => {
    const { items, selectedId } = get()
    return items.find(item => item.id === selectedId)
  }
}))

export default useFocusStore
```

#### 2.4.2 Store 使用

```javascript
// ✅ 仅订阅需要的状态
function MyComponent() {
  const items = useFocusStore(state => state.items)
  const setItems = useFocusStore(state => state.setItems)

  return <div>{items.length}</div>
}

// ❌ 不要订阅整个 store
function MyComponent() {
  const store = useFocusStore() // ❌ 任何状态变化都会重渲染
}
```

---

## 3. 命名约定

### 3.1 文件命名

#### 3.1.1 文件名规则

```
组件文件：PascalCase.jsx
  ✅ Timer.jsx
  ✅ FocusItemCard.jsx
  ❌ timer.jsx
  ❌ focus-item-card.jsx

工具文件：camelCase.js
  ✅ timeUtils.js
  ✅ formatDate.js
  ❌ TimeUtils.js

Store 文件：use{Name}Store.js
  ✅ useFocusStore.js
  ✅ useTimerStore.js

样式文件：{ComponentName}.module.css
  ✅ Timer.module.css
  ✅ FocusItemCard.module.css
```

---

### 3.2 变量命名

#### 3.2.1 基本规则

```javascript
// ✅ 使用 camelCase
const userName = 'Alice'
const itemCount = 10
let isLoading = false

// ✅ 布尔值使用 is / has / can 前缀
const isActive = true
const hasPermission = false
const canEdit = true

// ✅ 数组使用复数
const items = []
const users = []
const focusItems = []

// ❌ 不要使用单字母变量（除循环）
const x = getUserData() // ❌
const data = getUserData() // ✅

// ✅ 循环中可使用单字母
for (let i = 0; i < 10; i++) {}
items.forEach(item => {})
```

#### 3.2.2 常量命名

```javascript
// ✅ 使用 UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3
const API_BASE_URL = 'https://api.example.com'
const DEFAULT_TIMEOUT = 5000

// ✅ 配置对象可使用 camelCase
const config = {
  maxRetry: 3,
  timeout: 5000
}
```

---

### 3.3 函数命名

#### 3.3.1 事件处理函数

```javascript
// ✅ 使用 handle{Event} 格式
function handleClick() {}
function handleSubmit() {}
function handleChange(e) {}

// ✅ 组件内部使用 on{Event}
<Button onClick={handleClick} />

// ❌ 不要混淆
<Button handleClick={onClick} /> // ❌
```

#### 3.3.2 工具函数

```javascript
// ✅ 使用动词开头
function formatTime(seconds) {}
function calculateDuration(start, end) {}
function validateEmail(email) {}

// ✅ 返回布尔值使用 is / has / can
function isValidEmail(email) {}
function hasPermission(user) {}
function canEdit(item) {}
```

---

## 4. 目录结构规范

### 4.1 整体结构

```
src/
├── main/                   # Electron 主进程
│   ├── index.js           # 主进程入口
│   ├── database.js        # 数据库操作
│   ├── notification.js    # 系统通知
│   └── ipc.js            # IPC 处理器
│
├── renderer/              # React 渲染进程
│   ├── pages/            # 页面组件
│   │   ├── Home.jsx
│   │   ├── Items.jsx
│   │   ├── Stats.jsx
│   │   └── Settings.jsx
│   │
│   ├── components/       # 通用组件
│   │   ├── Timer.jsx
│   │   ├── Button.jsx
│   │   └── Modal.jsx
│   │
│   ├── store/            # Zustand 状态
│   │   ├── useFocusStore.js
│   │   ├── useTimerStore.js
│   │   └── useSettingsStore.js
│   │
│   ├── styles/           # CSS Modules
│   │   ├── Timer.module.css
│   │   └── global.css
│   │
│   ├── utils/            # 工具函数
│   │   ├── time.js
│   │   ├── format.js
│   │   └── stats.js
│   │
│   ├── hooks/            # 自定义 Hooks
│   │   └── useTimer.js
│   │
│   ├── App.jsx           # 根组件
│   └── main.jsx          # 入口文件
│
├── preload/
│   └── index.js          # 预加载脚本
│
└── shared/               # 共享代码
    ├── constants.js      # 常量定义
    └── types.js          # 类型定义
```

### 4.2 组件目录规则

```javascript
// ✅ 简单组件：单文件
components/
  └── Button.jsx

// ✅ 复杂组件：独立目录
components/
  └── Timer/
      ├── index.jsx          // 导出组件
      ├── Timer.module.css   // 样式
      └── TimerDisplay.jsx   // 子组件
```

---

## 5. 注释规范

### 5.1 文件头注释

```javascript
/**
 * FocusFlow - 计时器组件
 *
 * 功能：
 * - 显示倒计时
 * - 控制开始/暂停/停止
 * - 自动进入休息
 *
 * @author FocusFlow Team
 * @created 2025-11-29
 */
```

### 5.2 函数注释

```javascript
/**
 * 格式化秒数为 MM:SS 格式
 *
 * @param {number} seconds - 总秒数
 * @returns {string} 格式化的时间字符串
 *
 * @example
 * formatTime(125) // => "02:05"
 * formatTime(70)  // => "01:10"
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
```

### 5.3 行内注释

```javascript
// ✅ 解释"为什么"，而非"做什么"
const RETRY_DELAY = 1000 // 避免频繁重试导致服务器压力

// ❌ 不要写显而易见的注释
const count = 0 // 初始化 count 为 0 ❌
```

### 5.4 TODO 注释

```javascript
// ✅ TODO 格式
// TODO(username): 描述需要做的事情
// TODO(Alice): 添加错误处理

// ✅ FIXME 格式
// FIXME: 这里有性能问题，需要优化

// ⚠️ 注意：不要提交包含 TODO/FIXME 的代码（记录到 Issue）
```

---

## 6. CSS 规范

### 6.1 CSS Modules 规范

```css
/* Timer.module.css */

/* ✅ 使用 camelCase 类名 */
.container {
  padding: 20px;
}

.timerDisplay {
  font-size: 48px;
}

/* ❌ 不要使用 kebab-case */
.timer-display {} /* ❌ */
```

```javascript
// Timer.jsx
import styles from './Timer.module.css'

function Timer() {
  return (
    <div className={styles.container}>
      <div className={styles.timerDisplay}>25:00</div>
    </div>
  )
}
```

### 6.2 CSS 属性顺序

```css
/* ✅ 推荐顺序 */
.element {
  /* 定位 */
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;

  /* 盒模型 */
  display: flex;
  width: 100px;
  height: 50px;
  padding: 10px;
  margin: 10px;

  /* 排版 */
  font-size: 16px;
  line-height: 1.5;
  text-align: center;

  /* 视觉 */
  color: #333;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;

  /* 其他 */
  cursor: pointer;
  transition: all 0.3s;
}
```

---

## 7. Git 提交规范

### 7.1 分支命名

```
功能分支：feature/功能名称
  ✅ feature/timer-component
  ✅ feature/focus-items

修复分支：fix/问题描述
  ✅ fix/timer-reset-bug
  ✅ fix/memory-leak

优化分支：refactor/优化内容
  ✅ refactor/database-layer
  ✅ refactor/store-structure
```

### 7.2 提交信息格式

```
格式：<type>: <subject>

type 类型：
- feat: 新功能
- fix: 修复 Bug
- refactor: 重构
- docs: 文档更新
- style: 代码格式（不影响功能）
- perf: 性能优化
- test: 测试相关
- chore: 构建/工具配置

示例：
✅ feat: 添加计时器组件
✅ fix: 修复内存泄漏问题
✅ refactor: 重构数据库操作层
✅ docs: 更新 API 文档
✅ perf: 优化列表渲染性能

❌ 不清晰的提交信息：
❌ update
❌ fix bug
❌ 修改
```

### 7.3 提交内容规则

```
✅ 每次提交应该：
- 只解决一个问题
- 包含相关的代码和测试
- 可以独立运行

❌ 不要：
- 一次提交修改多个不相关的文件
- 提交未完成的功能
- 提交包含 console.log 的代码
```

---

## 8. 错误处理规范

### 8.1 异步错误处理

```javascript
// ✅ 使用 try-catch
async function loadData() {
  try {
    const data = await fetchData()
    return data
  } catch (error) {
    console.error('加载数据失败:', error)
    return null
  }
}

// ✅ Promise 链
fetchData()
  .then(data => processData(data))
  .catch(error => console.error('处理失败:', error))
```

### 8.2 用户友好的错误信息

```javascript
// ✅ 提供清晰的错误提示
if (!data.name) {
  showError('请输入事项名称')
  return
}

// ❌ 技术性错误信息
if (!data.name) {
  throw new Error('Validation failed: name is required') // ❌
}
```

---

## 9. 性能优化规范

### 9.1 React 性能优化

```javascript
// ✅ 使用 React.memo
const FocusItemCard = React.memo(({ item }) => {
  return <div>{item.name}</div>
})

// ✅ 使用 useMemo
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name))
}, [items])

// ✅ 使用 useCallback
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

### 9.2 避免不必要的渲染

```javascript
// ✅ 提取不变的数据到组件外部
const COLORS = ['red', 'blue', 'green']

function MyComponent() {
  return <div>{COLORS.map(c => <span key={c}>{c}</span>)}</div>
}

// ❌ 不要在 render 中创建
function MyComponent() {
  const colors = ['red', 'blue', 'green'] // ❌ 每次渲染都创建
  return <div>{colors.map(c => <span key={c}>{c}</span>)}</div>
}
```

---

## 10. 测试规范（Phase 2）

### 10.1 测试文件命名

```
组件测试：{ComponentName}.test.jsx
  ✅ Timer.test.jsx
  ✅ Button.test.jsx

工具函数测试：{functionName}.test.js
  ✅ formatTime.test.js
  ✅ validateEmail.test.js
```

### 10.2 测试描述

```javascript
// ✅ 清晰的测试描述
describe('Timer', () => {
  it('should display initial time correctly', () => {})
  it('should start counting down when start is clicked', () => {})
  it('should pause when pause is clicked', () => {})
})

// ❌ 模糊的描述
describe('Timer', () => {
  it('works', () => {}) // ❌
  it('test1', () => {}) // ❌
})
```

---

## 11. 文档编写规范

### 11.1 README 结构

```markdown
# 项目名称

简短描述（1-2 句话）

## 功能特性

- 功能 1
- 功能 2

## 快速开始

### 安装

\`\`\`bash
pnpm install
\`\`\`

### 运行

\`\`\`bash
pnpm dev
\`\`\`

## 技术栈

- React
- Electron
- ...

## 贡献指南

请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)

## 许可证

MIT
```

### 11.2 代码示例规范

```markdown
✅ 包含语言标识
\`\`\`javascript
const x = 1
\`\`\`

✅ 添加注释说明
\`\`\`javascript
// 创建计时器
const timer = new Timer()
\`\`\`

❌ 不要省略代码块标识
\`\`\`
const x = 1  // ❌ 缺少语言标识
\`\`\`
```

---

## 12. 代码审查检查清单

### 12.1 提交前自查

```
□ 代码风格符合规范（缩进、空格、命名）
□ 没有 console.log / debugger
□ 没有 TODO / FIXME（已记录到 Issue）
□ 没有未使用的变量和导入
□ 函数长度 < 50 行
□ 嵌套深度 < 4 层
□ 所有 useEffect 依赖正确
□ 所有列表渲染有正确的 key
□ 错误处理完整
□ 提交信息清晰
```

### 12.2 代码审查要点

```
□ 代码可读性良好
□ 逻辑清晰，易于理解
□ 没有重复代码
□ 性能考虑合理
□ 边界情况处理完整
□ 安全性考虑充分
□ 符合项目架构
□ 文档/注释充分
```

---

## 13. 工具配置

### 13.1 VS Code 配置（推荐）

```json
// .vscode/settings.json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true
}
```

### 13.2 .editorconfig

```ini
# .editorconfig
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

---

## 14. 常见问题（FAQ）

### Q1: 何时使用 React.memo？

**A:** 当组件满足以下条件时：
- 频繁重渲染
- Props 很少变化
- 渲染成本较高（> 10ms）

### Q2: 何时拆分组件？

**A:** 当满足以下条件之一：
- 组件代码 > 200 行
- 包含独立的逻辑单元
- 需要在多处复用
- 提高可测试性

### Q3: 如何处理异步数据加载？

**A:** 推荐模式：
```javascript
function MyComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (error) return <Error message={error.message} />
  return <DataView data={data} />
}
```

---

## 15. 规范更新流程

**规范修改需要：**
1. 提出修改建议（Issue）
2. 团队讨论达成共识
3. 更新本文档并注明版本
4. 通知所有开发人员

**当前版本：** 1.0
**最后更新：** 2025-11-29
**下次审查：** Phase 2 开始前

---

**记住：规范是为了提高代码质量，而非限制创造力。**

✅ **遵循规范，编写优雅代码！**
