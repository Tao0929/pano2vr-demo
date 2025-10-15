import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// 创建应用实例并使用路由
const app = createApp(App)
app.use(router)
app.mount('#app')
