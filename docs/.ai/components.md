# 组件文档

## 概述

本文档详细描述 PTab 项目中所有 React 组件的 API、Props 和实现细节。

---

## App 组件

文件: src/App.jsx

职责: 根组件，管理全局状态和布局

### Props

无

### State

| 状态         | 类型    | 默认值           | 说明                                               |
| ------------ | ------- | ---------------- | -------------------------------------------------- |
| settings     | Object  | DEFAULT_SETTINGS | 用户设置（videoFile, overlayOpacity, accentColor） |
| showSettings | Boolean | false            | 设置面板显示状态                                   |

### Imports

```javascript
import { PRESET_VIDEOS } from "./video-list.generated.js";
```

### DEFAULT_SETTINGS

```javascript
const DEFAULT_SETTINGS = {
  videoFile: PRESET_VIDEOS[0].value, // 使用扫描到的第一个视频
  overlayOpacity: 0.35,
  accentColor: "#f0c040",
};
```

### 主要逻辑

1. 初始化: 从 localStorage 读取设置，失败则用默认值
2. 视频有效性检查: 检查保存的视频是否在可用列表中，不存在则回退到第一个
3. 自动保存: useEffect 监听 settings 变化，自动保存到 localStorage
4. 主题注入: 通过 CSS 变量 --accent 传递主题色给子组件

### 初始化 State 逻辑

```javascript
const [settings, setSettings] = useState(() => {
  try {
    const saved = localStorage.getItem("newtab_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      const videoExists = PRESET_VIDEOS.some(
        (v) => v.value === parsed.videoFile,
      );
      if (!videoExists) {
        parsed.videoFile = PRESET_VIDEOS[0].value;
      }
      return parsed;
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
});
```

### 渲染结构

```jsx
<div className="app" style={{ "--accent": settings.accentColor }}>
  <VideoBackground
    src={settings.videoFile}
    overlayOpacity={settings.overlayOpacity}
  />
  <div className="content">
    <Clock />
    <Greeting />
  </div>
  <button className="settings-btn" onClick={() => setShowSettings(true)}>
    ⚙
  </button>
  {showSettings && (
    <SettingsPanel
      settings={settings}
      onChange={setSettings}
      onClose={() => setShowSettings(false)}
    />
  )}
</div>
```

---

## VideoBackground 组件

文件: src/components/VideoBackground.jsx

职责: 全屏视频背景 + 遮罩层

### Props

| Prop           | 类型   | 必填 | 说明             |
| -------------- | ------ | ---- | ---------------- |
| src            | String | 是   | 视频文件路径     |
| overlayOpacity | Number | 是   | 遮罩透明度 (0-1) |

### State

| 状态     | 类型    | 默认值 | 说明             |
| -------- | ------- | ------ | ---------------- |
| hasError | Boolean | false  | 视频加载是否失败 |

### Refs

| Ref      | 类型             | 说明         |
| -------- | ---------------- | ------------ |
| videoRef | HTMLVideoElement | 视频元素引用 |

### 主要逻辑

1. src 变化时重新加载: useEffect 监听 src，调用 videoRef.current.load()
2. 错误处理: onError 回调设置 hasError = true，显示兜底背景
3. 双格式支持: 同时提供 MP4 和 WebM source，浏览器自动选择

### 渲染结构

```jsx
<div className="video-wrapper">
  {!hasError ? (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      onError={() => setHasError(true)}
    >
      <source src={src} type="video/mp4" />
      <source src={src.replace(".mp4", ".webm")} type="video/webm" />
    </video>
  ) : (
    <div className="video-fallback" />
  )}
  <div
    className="video-overlay"
    style={{ background: `rgba(0, 0, 0, ${overlayOpacity})` }}
  />
</div>
```

### CSS 类

| 类名            | 说明                        |
| --------------- | --------------------------- |
| .video-wrapper  | 绝对定位全屏容器            |
| .video-bg       | 视频元素，object-fit: cover |
| .video-fallback | 渐变兜底背景                |
| .video-overlay  | 黑色遮罩层                  |

---

## Clock 组件

文件: src/components/Clock.jsx

职责: 实时时钟显示

### Props

无

### State

| 状态 | 类型 | 默认值     | 说明     |
| ---- | ---- | ---------- | -------- |
| now  | Date | new Date() | 当前时间 |

### 工具函数

#### pad(n)

个位数前面补零

参数: n (Number) - 数字
返回: String - 补零后的字符串

示例:

```javascript
pad(9); // "09"
pad(12); // "12"
```

### 主要逻辑

1. 每秒更新: setInterval 每 1000ms 更新 now state
2. 清理定时器: useEffect cleanup 函数清除定时器，防止内存泄漏
3. 格式化:
   - hh:mm:ss - 使用 pad() 补零
   - 日期 - 使用 toLocaleDateString('en-US', options)

### 日期格式选项

```javascript
{
  weekday: 'long',    // "Wednesday"
  year:    'numeric', // "2026"
  month:   'long',    // "March"
  day:     'numeric', // "11"
}
```

### 渲染结构

```jsx
<div className="clock">
  <div className="clock-time">
    <span className="clock-hm">
      {hh}:{mm}
    </span>
    <span className="clock-sec">{ss}</span>
  </div>
  <div className="clock-date">{dateStr}</div>
</div>
```

### CSS 类

| 类名        | 说明                              |
| ----------- | --------------------------------- |
| .clock      | 时钟容器，user-select: none       |
| .clock-time | flex 容器，底部对齐               |
| .clock-hm   | 大字 HH:MM，Playfair Display 字体 |
| .clock-sec  | 小字秒数，使用 var(--accent)      |
| .clock-date | 日期行，大写，字间距加宽          |

---

## Greeting 组件

文件: src/components/Greeting.jsx

职责: 根据时段显示随机问候语

### Props

无

### State

| 状态 | 类型   | 默认值 | 说明       |
| ---- | ------ | ------ | ---------- |
| text | String | ''     | 问候语文本 |

### 常量

#### GREETINGS

按时段分组的问候语池

```javascript
const GREETINGS = {
  night:     [...],
  morning:   [...],
  noon:      [...],
  afternoon: [...],
  evening:   [...],
}
```

### 工具函数

#### getPeriod(hour)

根据小时判断时段

参数: hour (Number) - 小时 (0-23)
返回: String - 时段名称 ('night'|'morning'|'noon'|'afternoon'|'evening')

时段映射:

| 小时  | 返回        |
| ----- | ----------- |
| 0-4   | 'night'     |
| 5-11  | 'morning'   |
| 12-13 | 'noon'      |
| 14-17 | 'afternoon' |
| 18-23 | 'evening'   |

### 主要逻辑

1. 只在挂载时执行: useEffect 空依赖数组 []，确保只在组件首次渲染时选择问候语
2. 随机选择: Math.floor(Math.random() \* pool.length) 从对应时段随机选取

### 渲染结构

```jsx
<p className="greeting">{text}</p>
```

### CSS 类

| 类名      | 说明                   |
| --------- | ---------------------- |
| .greeting | 斜体，浅色，字间距加宽 |

---

## SettingsPanel 组件

文件: src/components/SettingsPanel.jsx

职责: 设置面板 UI，暂存用户修改

### Props

| Prop     | 类型     | 必填 | 说明                               |
| -------- | -------- | ---- | ---------------------------------- |
| settings | Object   | 是   | 当前设置对象                       |
| onChange | Function | 是   | 保存时的回调，接收新 settings 对象 |
| onClose  | Function | 是   | 关闭面板的回调                     |

### State

| 状态  | 类型   | 默认值                   | 说明                 |
| ----- | ------ | ------------------------ | -------------------- |
| local | Object | 包含视频有效性检查的对象 | 暂存修改的本地 state |

### 初始化 State 逻辑

```javascript
const [local, setLocal] = useState(() => {
  const videoExists = PRESET_VIDEOS.some((v) => v.value === settings.videoFile);
  return {
    ...settings,
    videoFile: videoExists ? settings.videoFile : PRESET_VIDEOS[0].value,
  };
});
```

### Imports

```javascript
import { PRESET_VIDEOS } from "../video-list.generated.js";
```

PRESET_VIDEOS 由 vite-plugin-videoscan.js 自动生成，扫描 public/videos/ 目录并写入 src/video-list.generated.js。

### 常量

#### PRESET_COLORS

预设主题色列表

```javascript
const PRESET_COLORS = [
  "#f0c040",
  "#60d0f0",
  "#f08060",
  "#80e0a0",
  "#e080d0",
  "#ffffff",
];
```

### 方法

#### update(key, value)

通用字段更新函数

参数:

- key (String) - 要更新的字段名
- value (Any) - 新值

实现:

```javascript
const update = (key, value) => setLocal((prev) => ({ ...prev, [key]: value }));
```

#### handleSave()

保存按钮点击处理

逻辑:

1. 调用 onChange(local) 提交修改
2. 调用 onClose() 关闭面板

#### handleBackdropClick(e)

遮罩背景点击处理

逻辑: 仅当点击目标是遮罩本身时才关闭（避免点击面板内容时误关闭）

### 渲染结构

```jsx
<div className="settings-backdrop" onClick={handleBackdropClick}>
  <div className="settings-panel">
    <div className="settings-header">
      <h2>Settings</h2>
      <button className="settings-close" onClick={onClose}>
        ✕
      </button>
    </div>
    <div className="settings-body">
      {/* 视频选择 */}
      <section className="settings-section">
        <label className="settings-label">Background Video</label>
        <select
          className="settings-select"
          value={local.videoFile}
          onChange={(e) => update("videoFile", e.target.value)}
        >
          {PRESET_VIDEOS.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>
        <p className="settings-hint">
          Place your .mp4, .webm, or .ogg file in the videos/ folder, and it
          will be automatically detected.
        </p>
      </section>
      {/* 遮罩透明度滑块 */}
      <section className="settings-section">
        <label className="settings-label">
          Overlay Opacity — {Math.round(local.overlayOpacity * 100)}%
        </label>
        <input
          type="range"
          className="settings-slider"
          min="0"
          max="0.85"
          step="0.05"
          value={local.overlayOpacity}
          onChange={(e) => update("overlayOpacity", parseFloat(e.target.value))}
        />
      </section>
      {/* 主题色选择 */}
      <section className="settings-section">
        <label className="settings-label">Accent Color</label>
        <div className="color-presets">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              className={`color-dot ${local.accentColor === c ? "active" : ""}`}
              style={{ background: c }}
              onClick={() => update("accentColor", c)}
            />
          ))}
          <input
            type="color"
            className="color-picker"
            value={local.accentColor}
            onChange={(e) => update("accentColor", e.target.value)}
          />
        </div>
      </section>
    </div>
    <div className="settings-footer">
      <button className="btn-cancel" onClick={onClose}>
        Cancel
      </button>
      <button className="btn-save" onClick={handleSave}>
        Save
      </button>
    </div>
  </div>
</div>
```

### CSS 类

| 类名               | 说明                                  |
| ------------------ | ------------------------------------- |
| .settings-backdrop | 全屏半透明遮罩，backdrop-filter: blur |
| .settings-panel    | 面板主体，毛玻璃效果                  |
| .settings-header   | 标题栏，flex 两端对齐                 |
| .settings-body     | 内容区，flex 列布局                   |
| .settings-section  | 单个设置项容器                        |
| .settings-label    | 设置项标签，大写，小字号              |
| .settings-select   | 下拉菜单（自定义样式，悬停/聚焦效果） |
| .settings-hint     | 提示文字                              |
| .settings-slider   | 透明度滑块                            |
| .color-presets     | 颜色选择区容器                        |
| .color-dot         | 预设色块按钮                          |
| .color-picker      | 自定义颜色输入框                      |
| .settings-footer   | 底部按钮区                            |
| .btn-cancel        | 取消按钮                              |
| .btn-save          | 保存按钮，使用 var(--accent)          |

### .settings-select 详细样式说明

下拉框样式特性：
- appearance: none - 移除浏览器默认样式
- 自定义 SVG 下拉箭头
- padding: 0.6rem 1rem - 更大的内边距
- border-radius: 12px - 圆角
- backdrop-filter: blur(10px) - 毛玻璃效果
- 悬停效果：背景变亮，边框加深
- 聚焦效果：边框变为主题色，添加柔和光晕
- transition: all 0.2s ease - 平滑动画
- option 深色背景：#1a1a2e
