import { useState, useEffect } from 'react'
import VideoBackground from './components/VideoBackground'
import Clock from './components/Clock'
import Greeting from './components/Greeting'
import SettingsPanel from './components/SettingsPanel'
import './App.css'

// 默认设置项
const DEFAULT_SETTINGS = {
  videoFile:       'videos/background.mp4', // 视频路径（相对于扩展根目录）
  overlayOpacity:  0.35,                    // 遮罩透明度，0 = 完全透明，1 = 全黑
  accentColor:     '#f0c040',               // 主题色（用于时钟秒数等高亮）
}

export default function App() {
  // 从 localStorage 读取已保存的设置，没有则用默认值
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('newtab_settings')
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  // 设置面板的显示/隐藏状态
  const [showSettings, setShowSettings] = useState(false)

  // 每次 settings 变化时，同步保存到 localStorage
  useEffect(() => {
    localStorage.setItem('newtab_settings', JSON.stringify(settings))
  }, [settings])

  return (
    // 通过 CSS 变量把主题色传递给所有子组件
    <div className="app" style={{ '--accent': settings.accentColor }}>

      {/* 全屏视频背景层 */}
      <VideoBackground
        src={settings.videoFile}
        overlayOpacity={settings.overlayOpacity}
      />

      {/* 主内容区：时钟 + 问候语 */}
      <div className="content">
        <Clock />
        <Greeting />
      </div>

      {/* 右下角设置按钮 */}
      <button
        className="settings-btn"
        onClick={() => setShowSettings(true)}
        title="Settings"
      >
        ⚙
      </button>

      {/* 设置面板（条件渲染） */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
