import { useState, useEffect } from 'react'

// 按时段分组的问候语池
const GREETINGS = {
  night:     ['Still up? Take care of yourself.', 'Burning the midnight oil?', 'The night is quiet. Rest well.'],
  morning:   ['Good morning! Make it count.', 'Rise and shine!', 'A fresh start awaits.'],
  noon:      ['Good afternoon. Don\'t skip lunch.', 'Midday break — you\'ve earned it.', 'Keep the momentum going.'],
  afternoon: ['Good afternoon! Keep it up.', 'Afternoon already? Time flies.', 'Tea time? You deserve it.'],
  evening:   ['Good evening. Wind down slowly.', 'The day is wrapping up.', 'Almost there — nice work today.'],
}

// 根据小时判断时段
function getPeriod(hour) {
  if (hour >= 0  && hour < 5)  return 'night'
  if (hour >= 5  && hour < 12) return 'morning'
  if (hour >= 12 && hour < 14) return 'noon'
  if (hour >= 14 && hour < 18) return 'afternoon'
  return 'evening'
}

/**
 * 问候语组件
 * 在组件挂载时（即每次打开新标签页时）随机选一条合适的问候语
 */
export default function Greeting() {
  const [text, setText] = useState('')

  useEffect(() => {
    const hour   = new Date().getHours()
    const pool   = GREETINGS[getPeriod(hour)]
    const picked = pool[Math.floor(Math.random() * pool.length)] // 从对应时段随机取一条
    setText(picked)
  }, []) // 空依赖数组 = 只在挂载时执行一次

  return <p className="greeting">{text}</p>
}
