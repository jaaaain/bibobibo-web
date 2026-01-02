import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "vue-router", "@vueuse/core"],
      resolvers: [ElementPlusResolver()],
      dts: "src/auto-imports.d.ts"
    }),
    // 自动导入组件
    Components({
      dirs: ['src/components'], // 自动扫描你的组件目录
      resolvers: [ElementPlusResolver()], // UI 框架自动按需引入
      extensions: ['vue'],
      dts: 'src/components.d.ts'
    })],

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
      "@": resolve(__dirname,'src/')
    },
    extensions: ['.js', '.ts', '.json']
  }
})
