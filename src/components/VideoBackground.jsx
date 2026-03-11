import { useRef, useEffect, useState } from 'react'

/**
 * 全屏视频背景组件
 * - 视频静音自动循环播放（Chrome 要求静音才能自动播放）
 * - 加载失败时显示纯色渐变兜底背景
 * - overlayOpacity 控制视频上方的黑色遮罩深度，方便文字可读
 */
export default function VideoBackground({ src, overlayOpacity }) {
  const videoRef = useRef(null)
  const [hasError, setHasError] = useState(false)

  // src 变化时重新加载视频（例如用户在设置里切换了视频）
  useEffect(() => {
    setHasError(false)
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [src])

  return (
    <div className="video-wrapper">

      {/* 视频正常时显示 video 标签，失败时显示兜底背景 */}
      {!hasError ? (
        <video
          ref={videoRef}
          className="video-bg"
          autoPlay
          muted       // 必须静音，否则 Chrome 会阻止自动播放
          loop
          playsInline // iOS 兼容：阻止全屏播放
          onError={() => setHasError(true)}
        >
          {/* 优先 MP4，其次 WebM，让浏览器自动选择支持的格式 */}
          <source src={src} type="video/mp4" />
          <source src={src.replace('.mp4', '.webm')} type="video/webm" />
        </video>
      ) : (
        // 兜底：视频缺失或格式不支持时的深色渐变背景
        <div className="video-fallback" />
      )}

      {/* 遮罩层：用于压暗视频，提升文字对比度 */}
      <div
        className="video-overlay"
        style={{ background: `rgba(0, 0, 0, ${overlayOpacity})` }}
      />
    </div>
  )
}
