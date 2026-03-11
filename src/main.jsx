import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'

// 挂载 React 应用到 #root 节点
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
