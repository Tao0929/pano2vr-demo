import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 支持1920*1080的屏幕
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
})
