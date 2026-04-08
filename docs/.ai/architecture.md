# 架构设计

## 整体架构

PTab 采用典型的 React 单页应用架构，以组件化方式构建。作为 Chrome 扩展，它通过 manifest.json 注册为新标签页覆盖。

```
┌─────────────────────────────────────────────────────────┐
│                    Chrome 扩展层                          │
│              (manifest.json, Chrome API)                  │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                   React 应用层                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   App.jsx    │──▶│  Components  │──▶│    CSS       │ │
│  │  (根组件)     │  │              │  │  (样式层)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                   构建工具层                               │
│              (Vite + 自定义插件)                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  vite-plugin-videoscan.js (视频扫描插件)          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                   数据持久化层                             │
│                    (localStorage)                         │
└───────────────────────────────────────────────────────────┘
```

## 组件层级结构

```
App (根组件)
├── VideoBackground (视频背景层)
│   ├── <video> 或 <div.video-fallback>
│   └── <div.video-overlay> (遮罩层)
├── Content (内容区，flex 居中)
│   ├── Clock (时钟)
│   │   ├── .clock-time
│   │   │   ├── .clock-hm (HH:MM)
│   │   │   └── .clock-sec (秒数)
│   │   └── .clock-date (日期)
│   └── Greeting (问候语)
├── SettingsButton (设置按钮，右下角)
└── SettingsPanel (设置面板，条件渲染)
    ├── SettingsHeader (标题栏)
    ├── SettingsBody (内容区)
    │   ├── Video Select (视频选择 - 自动扫描)
    │   ├── Opacity Slider (遮罩透明度)
    │   └── Color Picker (主题色)
    └── SettingsFooter (底部按钮)
```

## 数据流

### 设置状态流程

```
┌──────────────┐
│  localStorage│
│  (持久化)    │
└──────┬───────┘
       │ 1. 初始化读取
       ▼
┌──────────────────┐
│  App.state.settings│
│  (单一数据源)    │
└──────┬───────────┘
       │ 2. 向下传递
       ├───────────────────┬───────────────────┐
       ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│VideoBackground│  │SettingsPanel │  │   CSS 变量   │
│(src, opacity) │  │(编辑暂存)    │  │  (--accent)   │
└──────────────┘  └──────┬───────┘  └──────────────┘
                          │ 3. 提交修改
                          ▼
                   ┌──────────────┐
                   │  onChange()  │
                   │  (更新 state)│
                   └──────┬───────┘
                          │ 4. 自动保存
                          ▼
                   ┌──────────────┐
                   │  localStorage│
                   │  (useEffect) │
                   └──────────────┘
```

### 视频扫描数据流

```
┌─────────────────────┐
│  public/videos/     │
│  目录文件变化       │
└──────────┬──────────┘
           │
           ▼
┌───────────────────────────────┐
│  vite-plugin-videoscan.js     │
│  - 扫描目录                   │
│  - 生成 PRESET_VIDEOS 数组    │
│  - 写入 video-list.generated.js│
└──────────┬────────────────────┘
           │
           ▼
┌───────────────────────────────┐
│  src/video-list.generated.js  │
│  export PRESET_VIDEOS         │
└──────────┬────────────────────┘
           │
           ▼
┌───────────────────────────────┐
│  SettingsPanel.jsx            │
│  import { PRESET_VIDEOS }     │
│  from '../video-list.generated.js'│
└───────────────────────────────┘
```

## 状态管理

### App 组件状态 (src/App.jsx)

| 状态         | 类型    | 说明                                                        |
| ------------ | ------- | ----------------------------------------------------------- |
| settings     | Object  | 当前用户设置（包含 videoFile, overlayOpacity, accentColor） |
| showSettings | Boolean | 设置面板显示/隐藏状态                                       |

### SettingsPanel 本地状态

| 状态  | 类型   | 说明                           |
| ----- | ------ | ------------------------------ |
| local | Object | 暂存用户修改，点击 Save 才提交 |

## 关键设计模式

### 1. 受控组件 + 本地暂存

SettingsPanel 使用本地 state 暂存修改，避免实时更新导致的 UI 抖动，用户确认后才提交。

### 2. CSS 变量主题系统

通过 style={{ '--accent': settings.accentColor }} 将主题色注入根元素，所有子组件通过 var(--accent) 引用。

### 3. 条件渲染

SettingsPanel 仅在 showSettings === true 时渲染，优化性能。

### 4. Effect 自动保存

useEffect(() => { localStorage.setItem(...) }, [settings]) 确保 settings 变化时自动持久化。

### 5. Vite 插件生成文件

使用 Vite 插件生成真实文件 src/video-list.generated.js，动态生成视频列表，无需手动维护，更稳定可靠。

## 层叠顺序 (z-index)

| 层级                   | z-index | 元素               |
| ---------------------- | ------- | ------------------ |
| 设置面板遮罩           | 50      | .settings-backdrop |
| 设置按钮               | 10      | .settings-btn      |
| 内容区（时钟、问候语） | 1       | .content           |
| 视频背景               | 0       | .video-wrapper     |

## 事件流

### 打开设置面板

```
点击 ⚙ 按钮
    ↓
setShowSettings(true)
    ↓
渲染 SettingsPanel
    ↓
初始化 local state = settings
```

### 修改设置并保存

```
用户操作 UI
    ↓
update(key, value) → 更新 local state
    ↓
点击 Save
    ↓
onChange(local) → 更新 App.state.settings
    ↓
useEffect 触发 → 保存到 localStorage
    ↓
onClose() → setShowSettings(false)
```

### 切换视频

```
用户选择新视频
    ↓
update('videoFile', newValue)
    ↓
Save → App.state.settings.videoFile 更新
    ↓
VideoBackground 组件检测到 src 变化
    ↓
useEffect([src]) 触发 → videoRef.current.load()
    ↓
视频重新加载
```

### 开发模式下添加新视频

```
将视频文件放入 public/videos/
    ↓
vite-plugin-videoscan.js 监听到变化
    ↓
发送 full-reload 信号
    ↓
页面自动刷新
    ↓
新视频出现在下拉菜单中
```

## 性能优化点

1. 条件渲染 - SettingsPanel 不显示时不渲染
2. 空依赖 useEffect - Clock 定时器只在挂载时设置一次
3. 本地暂存 - 避免频繁的父组件 state 更新
4. CSS 动画 - 使用 CSS transform 和 opacity 实现 GPU 加速动画
5. 构建时扫描 - 视频列表在构建时生成，运行时无额外开销

## 扩展点

### 可扩展功能位置

| 功能             | 文件位置                                        | 说明                 |
| ---------------- | ----------------------------------------------- | -------------------- |
| 添加新视频       | public/videos/ 目录 - 自动扫描                  | 直接放入视频文件即可 |
| 修改问候语       | Greeting.jsx 的 GREETINGS                       | 按时段修改文案       |
| 添加设置项       | App.jsx 的 DEFAULT_SETTINGS + SettingsPanel.jsx | 添加新字段和 UI      |
| 修改主题色       | SettingsPanel.jsx 的 PRESET_COLORS              | 数组中追加颜色       |
| 修改视频扫描逻辑 | vite-plugin-videoscan.js                        | 修改插件实现         |

## 构建工具配置

### Vite 插件

- vite-plugin-videoscan.js - 视频扫描插件
  - 功能：扫描 public/videos/ 目录，生成 src/video-list.generated.js 文件
  - 钩子：configResolved、configureServer
  - 监听：开发模式下监听目录变化
  - 输出：写入 PRESET_VIDEOS 数组到 src/video-list.generated.js

### 生成文件

- 生成文件：src/video-list.generated.js
- 导出：PRESET_VIDEOS 数组
- Git 忽略：已添加到 .gitignore
