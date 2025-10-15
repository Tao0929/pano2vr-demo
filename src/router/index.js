import { createRouter, createWebHistory } from 'vue-router'
// import App from '../App.vue'
import Home from '../Home.vue'
import CoordinateCapture from '../CoordinateCapture.vue'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '全景图展示'
    }
  },
  {
    path: '/coordinate-capture',
    name: 'CoordinateCapture',
    component: CoordinateCapture,
    meta: {
      title: '全景图坐标捕获工具'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫，用于设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router