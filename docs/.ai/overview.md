# 项目概述

## 项目简介

PTab 是一个以本地视频为背景的沉浸式 Chrome 新标签页扩展。每次打开新标签页，都是一段属于自己的安静时刻。

## 核心功能

| 功能         | 描述                                         |
| ------------ | -------------------------------------------- |
| 全屏视频背景 | 播放本地 MP4 视频，完全离线，无需联网        |
| 实时时钟     | 大字 HH:MM + 秒数高亮，每秒更新              |
| 智能问候语   | 根据时段（清晨/上午/下午/傍晚/深夜）随机显示 |
| 个性化设置   | 切换视频、调整遮罩深度、自定义主题色         |
| 轻量无依赖   | 数据存 localStorage，不联网，无追踪          |
| 自动视频扫描 | 自动检测 public/videos 目录中的视频文件      |

## 技术栈

| 技术         | 版本   | 用途                         |
| ------------ | ------ | ---------------------------- |
| React        | 19.2.0 | UI 组件与状态管理            |
| Vite         | 7.3.1  | 构建工具                     |
| CSS3         | -      | 样式（毛玻璃/动画/CSS 变量） |
| localStorage | -      | 设置与数据持久化             |
| Chrome MV3   | -      | 扩展规范                     |

## 项目信息

- 项目名称: newtab-extension
- 扩展名称: PTab
- 版本: 1.0.0
- License: MIT
- 创建日期: 2024

## 环境要求

- Node.js 18+
- Google Chrome 88+ 或 Microsoft Edge 88+

## 快速开始

### 安装依赖

```bash
npm install
```

### 本地预览

```bash
npm run dev
# 访问 http://localhost:5173
```

### 构建扩展

```bash
npm run build
# 产物输出到 dist/ 文件夹
```

### 加载到 Chrome

1. 打开 chrome://extensions/
2. 右上角开启开发者模式
3. 点击加载已解压的扩展程序
4. 选择项目的 dist/ 文件夹
5. 打开一个新标签页，完成！

## 目录结构

```
PTab/
├── docs/.ai/              # AI 开发文档（本目录）
├── assets/                # 仓库静态资源
├── public/
│   ├── manifest.json      # Chrome 扩展配置（MV3）
│   ├── icon.png           # 扩展图标
│   └── videos/            # 视频文件目录（自动扫描）
├── src/
│   ├── components/
│   │   ├── VideoBackground.jsx
│   │   ├── Clock.jsx
│   │   ├── Greeting.jsx
│   │   └── SettingsPanel.jsx
│   ├── App.jsx            # 根组件
│   ├── App.css            # 全局样式
│   ├── main.jsx           # 入口文件
│   └── video-list.generated.js # 自动生成的视频列表
├── vite.config.js         # Vite 配置
├── vite-plugin-videoscan.js # 视频扫描插件
└── package.json
```

## 默认配置

### 默认设置 (src/App.jsx:9-14)

```javascript
const DEFAULT_SETTINGS = {
  videoFile: PRESET_VIDEOS[0].value, // 使用扫描到的第一个视频
  overlayOpacity: 0.35,
  accentColor: "#f0c040",
};
```

### App 组件初始化逻辑

- 从 localStorage 读取设置
- 检查保存的视频是否在可用列表中
- 如果不存在，自动回退到第一个可用视频

### localStorage Key

- newtab_settings - 存储用户设置

## 关键特性说明

### 视频背景

- 支持 MP4 和 WebM 格式
- 自动循环播放，静音（Chrome 要求）
- 加载失败时有兜底渐变背景
- 可调整遮罩透明度（0-85%）

### 自动视频扫描

- 使用 Vite 插件 vite-plugin-videoscan.js 实现
- 自动扫描 public/videos 目录中的 .mp4、.webm、.ogg 文件
- 开发模式下监听目录变化，自动刷新
- 生成 src/video-list.generated.js 文件，提供 PRESET_VIDEOS
- 如果目录为空，提供默认 fallback 选项

### 主题系统

- 使用 CSS 变量 --accent 传递主题色
- 预设 6 种主题色
- 支持自定义颜色选择器
- 主题色应用于秒数高亮、滑块、保存按钮等

### 响应式设计

- 使用 clamp() 实现响应式字号
- 时钟字号范围：4.5rem - 9rem
- 面板宽度：min(400px, 92vw)

## 预设配置

### 预设主题色 (src/components/SettingsPanel.jsx:16)

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

### 时段划分 (src/components/Greeting.jsx:13-19)

| 时段      | 小时范围      |
| --------- | ------------- |
| night     | 0:00 - 5:00   |
| morning   | 5:00 - 12:00  |
| noon      | 12:00 - 14:00 |
| afternoon | 14:00 - 18:00 |
| evening   | 18:00 - 24:00 |

## 视频自动扫描功能说明

### 插件文件

vite-plugin-videoscan.js - Vite 插件，负责扫描 public/videos 目录

### 支持的视频格式

- .mp4
- .webm
- .ogg

### 使用方法

1. 将视频文件放入 public/videos/ 目录
2. 视频会自动被扫描并出现在设置面板的视频选择下拉菜单中
3. 开发模式下添加/删除视频会自动触发页面刷新

### 生成文件

- 生成文件: src/video-list.generated.js
- 导出: PRESET_VIDEOS 数组
- 注意: 此文件自动生成，请勿手动编辑
- Git 忽略: 已添加到 .gitignore
