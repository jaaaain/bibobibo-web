import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  server: {
    port: 5173,          // 默认端口，可改
    host: true,          // 允许外部访问
    open: true,          // 启动时不自动打开浏览器
    cors: true,          // 开发环境允许跨域

    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080', // 后端服务地址
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''), // 去掉前缀 /api
      }
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname,'src/'),
      "@api": resolve(__dirname,'src/api/'),
      "@components": resolve(__dirname,'src/components/'),
      "@utils": resolve(__dirname,'src/utils/'),
      "@types": resolve(__dirname,'src/types/'),
      "@views": resolve(__dirname,'src/views/')
    },
    extensions: ['.js', '.ts', '.json']
  }
})
