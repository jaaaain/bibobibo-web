import { createApp } from 'vue'
import './style.css'
import App from '@/App.vue'
import router from './router/index'
import { createPinia } from 'pinia'
import { useUserStore } from '@/store/index'
import ElementPlus from 'element-plus'
import '@/assets/css/global.css'

const app = createApp(App)
const pinia = createPinia()
app.use(router)
app.use(ElementPlus)
app.use(pinia)
app.mount('#app')

const userStore = useUserStore();
userStore.init();