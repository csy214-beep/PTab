import { useState } from 'react'
import { PRESET_VIDEOS } from "../video-list.generated.js";

// 预设主题色
const PRESET_COLORS = ['#f0c040', '#60d0f0', '#f08060', '#80e0a0', '#e080d0', '#ffffff']

/**
 * 设置面板组件
 * Props:
 *   settings  - 当前设置对象（来自 App 的 state）
 *   onChange  - 保存时的回调，接收新 settings 对象
 *   onClose   - 关闭面板的回调
 */
export default function SettingsPanel({ settings, onChange, onClose }) {
  // 用本地 state 暂存修改，点击 Save 才提交给父组件
  // 确保当前选择的视频在可用列表中
  const [local, setLocal] = useState(() => {
    const videoExists = PRESET_VIDEOS.some(
      (v) => v.value === settings.videoFile,
    );
    return {
      ...settings,
      videoFile: videoExists ? settings.videoFile : PRESET_VIDEOS[0].value,
    };
  });

  // 通用字段更新函数
  const update = (key, value) =>
    setLocal((prev) => ({ ...prev, [key]: value }));

  // 点击 Save：把本地修改提交给父组件，然后关闭面板
  const handleSave = () => {
    onChange(local);
    onClose();
  };

  // 点击遮罩背景关闭面板
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="settings-backdrop" onClick={handleBackdropClick}>
      <div className="settings-panel">
        {/* 标题栏 */}
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-body">
          {/* ── 视频选择 ── */}
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
            {/* 提示用户如何添加自定义视频 */}
            <p className="settings-hint">
              Place your <code>.mp4</code>, <code>.webm</code>, or{" "}
              <code>.ogg</code> file in the <code>videos/</code> folder, and it
              will be automatically detected.
            </p>
          </section>

          {/* ── 遮罩透明度滑块 ── */}
          <section className="settings-section">
            <label className="settings-label">
              Overlay Opacity —{" "}
              <strong>{Math.round(local.overlayOpacity * 100)}%</strong>
            </label>
            <input
              type="range"
              className="settings-slider"
              min="0"
              max="0.85"
              step="0.05"
              value={local.overlayOpacity}
              onChange={(e) =>
                update("overlayOpacity", parseFloat(e.target.value))
              }
            />
            <div className="settings-slider-labels">
              <span>Clear</span>
              <span>Dark</span>
            </div>
          </section>

          {/* ── 主题色选择 ── */}
          <section className="settings-section">
            <label className="settings-label">Accent Color</label>
            <div className="color-presets">
              {/* 预设色块 */}
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  className={`color-dot ${local.accentColor === c ? "active" : ""}`}
                  style={{ background: c }}
                  onClick={() => update("accentColor", c)}
                />
              ))}
              {/* 自定义颜色选择器 */}
              <input
                type="color"
                className="color-picker"
                value={local.accentColor}
                onChange={(e) => update("accentColor", e.target.value)}
                title="Custom color"
              />
            </div>
          </section>
        </div>

        {/* 底部操作按钮 */}
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
  );
}
