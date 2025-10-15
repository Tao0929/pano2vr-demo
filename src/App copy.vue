<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { Viewer } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'

const viewerContainer = ref(null)
let viewer = null
let markersPlugin = null

// 定义公司全景图片数据 - 确保路径正确
const panoramaImages = ref([
  { id: '1', name: '全景图 1', path: '/company/1.JPG' },
  { id: '2', name: '全景图 2', path: '/company/2.JPG' },
  { id: '3', name: '全景图 3', path: '/company/3.JPG' },
  { id: '4', name: '全景图 4', path: '/company/4.JPG' },
  { id: '5', name: '全景图 5', path: '/company/5.JPG' },
  { id: '6', name: '全景图 6', path: '/company/6.JPG' },
  { id: '7', name: '全景图 7', path: '/company/7.JPG' },
  { id: '8', name: '全景图 8', path: '/company/8.JPG' },
  { id: '9', name: '全景图 9', path: '/company/9.JPG' },
  { id: '10', name: '全景图 10', path: '/company/10.JPG' },
  { id: '11', name: '全景图 11', path: '/company/11.JPG' },
  { id: '12', name: '全景图 12', path: '/company/12.jpg' }
])

// 预加载图片函数
async function preloadImages() {
  const promises = panoramaImages.value.map(pano => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(pano)
      img.onerror = (error) => {
        console.warn(`Failed to preload ${pano.path}:`, error)
        resolve(pano) // 即使加载失败也继续，只是记录警告
      }
      img.src = pano.path
    })
  })
  
  try {
    await Promise.all(promises)
    console.log('All images preloaded (or warnings logged)')
  } catch (error) {
    console.error('Error during image preloading:', error)
  }
}

// 当前活动的全景图索引
const activePanoramaIndex = ref(0)

onMounted(async () => {
  // 先预加载图片
  await preloadImages()
    // 创建 Viewer，并在创建时注册 MarkersPlugin
    viewer = new Viewer({
      container: viewerContainer.value,
      panorama: '/company/1.JPG',
      caption: '全景1',
      // panorama: panoramaImages.value[activePanoramaIndex.value].path,
      // caption: panoramaImages.value[activePanoramaIndex.value].name,
      touchmoveTwoFingers: true,
      navbar: ['zoom', 'fullscreen'],
      transition: { duration: 1200, loader: true },
      plugins: [
        // 注册插件的正确方式
        [MarkersPlugin, {}],
      ],
    })

    // 添加错误处理
    viewer.addEventListener('error', (error) => {
      console.error('Viewer error:', error)
    })
    
    // 注意：不要用 viewer.once(...)，而是 addEventListener
    viewer.addEventListener('ready', () => {
    // Viewer 准备好后取得插件实例
    markersPlugin = viewer.getPlugin(MarkersPlugin)
    console.log('markersPlugin =>', markersPlugin)

    if (!markersPlugin) {
      console.error('MarkersPlugin 未能注册，请检查依赖版本。')
      return
    }

    // 添加一个跳转热点
    markersPlugin.addMarker({
      id: 'to-pano2',
      longitude: 0.5,   // yaw（左右）
      latitude: 0.1,    // pitch（上下）
      image: 'https://photo-sphere-viewer.js.org/assets/pin-red.png',
      width: 32,
      height: 32,
      anchor: 'bottom center',
      tooltip: '点击切换到 pano2',
    })

    // 添加另一个信息点示例
    markersPlugin.addMarker({
      id: 'info-1',
      longitude: -0.8,
      latitude: 0.0,
      html: '<div style="padding:6px">信息点</div>',
      anchor: 'center',
    })

    // 订阅插件事件：也使用 addEventListener（而不是 .on/.once）
    markersPlugin.addEventListener('select-marker', (evt) => {
      const marker = evt.marker
      console.log('clicked marker', marker.id)

      // 检查标记ID是否包含全景图索引
      const match = marker.id.match(/^to-pano-(\d+)$/)
      if (match) {
        const targetIndex = parseInt(match[1])
        
        // 调用切换全景图的方法
        viewer.setPanorama(panoramaImages.value[targetIndex].path, {
          transition: { duration: 1200, loader: true },
        }).then(() => {
          activePanoramaIndex.value = targetIndex
          viewer.setCaption(panoramaImages.value[targetIndex].name)
          
          // 清除并重新添加标记
          markersPlugin.clearMarkers()
          addNavigationMarkers(targetIndex)
        }).catch(error => {
          console.error(`Failed to switch to panorama ${targetIndex}:`, error)
        })
      } else if (marker.id === 'back-to-pano1') {
        // 这个分支保留用于向后兼容
        viewer.setPanorama('/company/1.JPG', {
          transition: { duration: 1200, loader: true },
        }).then(() => {
          activePanoramaIndex.value = 0
          viewer.setCaption(panoramaImages.value[0].name)
          
          if (markersPlugin) {
            markersPlugin.clearMarkers()
            addNavigationMarkers(0)
          }
        }).catch(error => {
          console.error('Failed to switch back to panorama 1:', error)
        })
      }
    })
    
    // 添加初始导航标记
    addNavigationMarkers(activePanoramaIndex.value)
  }, { once: true }) // 只触发一次

  // debug：若需要在控制台查看 viewer 方法
  // console.log('viewer methods', Object.keys(viewer))
})

// 切换全景图的方法
async function switchPanorama(index) {
  if (!viewer || index < 0 || index >= panoramaImages.value.length) {
    return
  }
  
  activePanoramaIndex.value = index
  
  await viewer.setPanorama(panoramaImages.value[index].path, {
    transition: { duration: 1200, loader: true },
  })
  
  // 更新标题
  viewer.setCaption(panoramaImages.value[index].name)
  
  // 清除并重新添加标记
  if (markersPlugin) {
    markersPlugin.clearMarkers()
    
    // 在每个全景图中添加标记点，指向其他全景图
    addNavigationMarkers(index)
  }
}

// 下一个全景图
function nextPanorama() {
  const nextIndex = (activePanoramaIndex.value + 1) % panoramaImages.value.length
  switchPanorama(nextIndex)
}

// 上一个全景图
function prevPanorama() {
  const prevIndex = (activePanoramaIndex.value - 1 + panoramaImages.value.length) % panoramaImages.value.length
  switchPanorama(prevIndex)
}

// 暴露方法给外部组件使用（如果需要）
defineExpose({
  switchPanorama,
  nextPanorama,
  prevPanorama
})

// 添加导航标记
function addNavigationMarkers(currentIndex) {
  if (!markersPlugin) return
  
  // 为每个其他全景图添加一个标记点
  panoramaImages.value.forEach((pano, index) => {
    if (index !== currentIndex) {
      // 计算位置（简单的圆形分布）
      const angle = (2 * Math.PI * index) / panoramaImages.value.length
      const longitude = Math.cos(angle) * 0.7
      const latitude = Math.sin(angle) * 0.3
      
      markersPlugin.addMarker({
        id: `to-pano-${index}`,
        longitude: longitude,
        latitude: latitude,
        image: 'https://photo-sphere-viewer.js.org/assets/pin-red.png',
        width: 32,
        height: 32,
        anchor: 'bottom center',
        tooltip: `切换到 ${pano.name}`,
      })
    }
  })
}

onBeforeUnmount(() => {
  try { viewer?.destroy() } catch (e) { console.warn(e) }
})
</script>

<template>
  <div class="app-container">
    <div ref="viewerContainer" class="viewer"></div>
    
    <!-- 底部导览栏 -->
    <div class="navigation-bar">
      <div class="navigation-content">
        <!-- 上一个按钮 -->
        <button 
          class="nav-button prev-button"
          @click="prevPanorama"
          title="上一个全景图"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        
        <!-- 全景图缩略图列表 -->
        <div class="panorama-thumbs">
          <div 
            v-for="(pano, index) in panoramaImages"
            :key="pano.id"
            class="thumb-item"
            :class="{ active: index === activePanoramaIndex }"
            @click="switchPanorama(index)"
            :title="pano.name"
          >
            <div class="thumb-image-container">
              <img :src="pano.path" :alt="pano.name" class="thumb-image">
              <div v-if="index === activePanoramaIndex" class="active-indicator"></div>
            </div>
            <div class="thumb-name">{{ pano.name }}</div>
          </div>
        </div>
        
        <!-- 下一个按钮 -->
        <button 
          class="nav-button next-button"
          @click="nextPanorama"
          title="下一个全景图"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style>
/* 确保真正全屏 */
html, body, #app {
  height: 100%;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.viewer {
  flex: 1;
  position: relative;
  background: #000;
}

/* 底部导览栏样式 */
.navigation-bar {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 10px 0;
}

.navigation-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  gap: 15px;
}

/* 导航按钮样式 */
.nav-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.nav-button:active {
  transform: scale(0.95);
}

/* 缩略图列表样式 */
.panorama-thumbs {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 5px 0;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.panorama-thumbs::-webkit-scrollbar {
  height: 6px;
}

.panorama-thumbs::-webkit-scrollbar-track {
  background: transparent;
}

.panorama-thumbs::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

/* 缩略图项样式 */
.thumb-item {
  flex: 0 0 auto;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 6px;
  overflow: hidden;
}

.thumb-item:hover {
  transform: translateY(-2px);
}

.thumb-item.active {
  transform: scale(1.05);
}

.thumb-image-container {
  width: 120px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  border: 2px solid transparent;
}

.thumb-item.active .thumb-image-container {
  border-color: #4CAF50;
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.thumb-item:hover .thumb-image {
  transform: scale(1.05);
}

.active-indicator {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 12px;
  height: 12px;
  background: #4CAF50;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
}

.thumb-name {
  color: white;
  font-size: 12px;
  text-align: center;
  margin-top: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 120px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .thumb-image-container {
    width: 100px;
    height: 70px;
  }
  
  .thumb-name {
    font-size: 11px;
    width: 100px;
  }
  
  .navigation-content {
    padding: 0 10px;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .thumb-image-container {
    width: 80px;
    height: 60px;
  }
  
  .thumb-name {
    font-size: 10px;
    width: 80px;
  }
  
  .nav-button {
    width: 35px;
    height: 35px;
  }
  
  .navigation-bar {
    padding: 8px 0;
  }
}
</style>