<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, onErrorCaptured } from 'vue'

// 全局错误捕获
onErrorCaptured((error, instance, info) => {
  console.error('应用级错误捕获:', error)
  console.error('错误信息:', info)
  console.error('组件实例:', instance)
  
  // 显示用户友好的错误提示
  if (typeof window !== 'undefined') {
    try {
      const errorMsg = document.createElement('div')
      errorMsg.className = 'global-error-message'
      errorMsg.innerHTML = `
        <div class="error-content">
          <h3>应用发生错误</h3>
          <p>抱歉，应用在运行过程中遇到了问题。</p>
          <p>错误信息: ${error.message}</p>
          <button onclick="location.reload()">重新加载</button>
        </div>
      `
      
      // 移除旧的错误提示
      const oldError = document.querySelector('.global-error-message')
      if (oldError) {
        oldError.remove()
      }
      
      document.body.appendChild(errorMsg)
    } catch (e) {
      console.error('创建错误提示失败:', e)
    }
  }
  
  // 返回 false 以阻止错误继续传播
  return false
})

// 应用挂载时执行的初始化代码
onMounted(() => {
  console.log('应用已成功挂载')
  
  // 可以在这里添加全局初始化逻辑，如：
  // - 检查浏览器兼容性
  // - 加载全局配置
  // - 初始化分析工具
  
  // 检查浏览器兼容性
  checkBrowserCompatibility()
})

// 浏览器兼容性检查
function checkBrowserCompatibility() {
  // 检查是否支持全景图相关特性
  const supportsWebGL = () => {
    try {
      const canvas = document.createElement('canvas')
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
    } catch (e) {
      return false
    }
  }
  
  if (!supportsWebGL()) {
    console.warn('当前浏览器不支持WebGL，全景图功能可能受限')
    // 可以在这里添加降级方案或提示
  }
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

</style>