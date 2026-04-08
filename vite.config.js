import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import videoScanPlugin from './vite-plugin-videoscan.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), videoScanPlugin()],
})
