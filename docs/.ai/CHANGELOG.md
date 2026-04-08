# 更新日志

## 2026-04-08

### 更新 README.md
- 更新项目徽章：React 19.2.0、Vite 7.3.1
- 更新项目结构：添加 video-list.generated.js、vite.config.js、vite-plugin-videoscan.js
- 更新功能列表：添加自动视频扫描功能
- 更新视频添加说明：改为自动扫描方式
- 更新自定义视频说明：移除手动编辑代码的要求
- 更新技术栈版本：React 19.2.0、Vite 7.3.1

### 更新所有文档
- overview.md：更新目录结构、默认设置、自动视频扫描说明
- architecture.md：更新关键设计模式、Vite 插件说明
- components.md：添加 App 组件导入说明、更新初始化逻辑、添加视频有效性检查、添加下拉框样式详细说明
- CHANGELOG.md：添加本次更新记录

### 优化下拉框样式
- 移除浏览器默认样式，使用自定义外观
- 添加 SVG 下拉箭头
- 增加内边距和圆角
- 添加毛玻璃效果
- 悬停效果：背景变亮、边框加深
- 聚焦效果：主题色边框、柔和光晕
- 平滑过渡动画

### 修复视频播放问题

- App.jsx 使用 PRESET_VIDEOS[0].value 作为默认视频
- 添加检查逻辑，确保保存的视频在可用列表中
- SettingsPanel 也添加了同样的检查
- 更新日志单独使用 CHANGELOG.md 文件

### 更新日志独立文件

- 创建 docs/.ai/CHANGELOG.md
- 从 index.md 中移除更新日志部分
- 在文档目录中添加 CHANGELOG.md 链接

### 修复视频自动扫描功能

- 改用生成真实文件的方式替代虚拟模块
- 创建 src/video-list.generated.js 自动生成文件
- 添加到 .gitignore 避免提交
- 更加稳定可靠

### 添加视频自动扫描功能

- 创建 vite-plugin-videoscan.js 插件
- 自动扫描 public/videos/ 目录
- 支持 .mp4、.webm、.ogg 格式
- 开发模式下监听目录变化自动刷新

### 优化 AI 开发文档

- 移除所有 emoji 样式
- 更适合 AI 阅读
- 更新相关文档说明

### 初始版本

- 创建 AI 开发文档框架
- 建立 docs/.ai 目录结构
- 创建 index.md 索引文件
- 生成高优先级文档（overview.md、architecture.md、components.md）
- 在 README.md 中添加 AI 开发文档链接
