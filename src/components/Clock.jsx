import { useState, useEffect } from 'react'

// 个位数前面补零，例如 9 → "09"
function pad(n) {
  return String(n).padStart(2, '0')
}

/**
 * 实时时钟组件
 * 每秒更新一次，显示：
 *   - 大字 HH:MM（小时:分钟）
 *   - 小字秒数（使用主题色高亮）
 *   - 下方日期行（英文格式）
 */
export default function Clock() {
  const [now, setNow] = useState(new Date())

  // 每秒触发一次更新
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer) // 组件卸载时清除定时器，防止内存泄漏
  }, [])

  // 格式化时间部分
  const hh = pad(now.getHours())
  const mm = pad(now.getMinutes())
  const ss = pad(now.getSeconds())

  // 格式化日期：例如 "Wednesday, March 11, 2026"
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  })

  return (
    <div className="clock">
      {/* 时间行：大字 HH:MM + 小字秒 */}
      <div className="clock-time">
        <span className="clock-hm">{hh}:{mm}</span>
        <span className="clock-sec">{ss}</span>
      </div>

      {/* 日期行 */}
      <div className="clock-date">{dateStr}</div>
    </div>
  )
}
