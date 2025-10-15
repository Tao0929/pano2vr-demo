<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { Viewer } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'

const viewerContainer = ref(null)
let viewer = null
let markersPlugin = null

// 定义公司全景图片数据 - 确保路径正确 - 每个全景图可配置自定义跳转标记点
const panoramaImages = ref([
  {
    id: '1', 
    name: '全景图 1', 
    path: '/company/1.JPG', 
    markers: [
      {
        id: 'to-pano-2',
        targetIndex: 1, // 目标全景图索引（全景图2）
        position: { yaw: 0.5, pitch: 0.1 }, // 标记点在当前全景图中的位置
        tooltip: '切换到全景图 2'
      },
      {
        id: 'to-pano-3',
        targetIndex: 2, // 目标全景图索引（全景图3）
        position: { yaw: -0.8, pitch: 0.2 },
        tooltip: '切换到全景图 3'
      }
    ]
  },
  {
    id: '2', 
    name: '全景图 2', 
    path: '/company/2.JPG', 
    markers: [
      {
        id: 'to-pano-1',
        targetIndex: 0, // 目标全景图索引（全景图1）
        position: { yaw: -0.2, pitch: -0.4 },
        tooltip: '后退到全景图 1'
      },
      {
        id: 'to-pano-3',
        targetIndex: 2, // 目标全景图索引（全景图3）
        position: { yaw: 0.2, pitch: -0.1 },
        tooltip: '切换到全景图 3'
      }
    ]
  },
  {
    id: '3', 
    name: '全景图 3', 
    path: '/company/3.JPG', 
    markers: [
      {
        id: 'to-pano-2',
        targetIndex: 1, // 目标全景图索引（全景图2）
        position: { yaw: -1.0, pitch: 0.1 },
        tooltip: '回退到全景图 2'
      },
      {
        id: 'to-pano-4',
        targetIndex: 3, // 目标全景图索引（全景图4）
        position: { yaw: 1.0, pitch: 0.1 },
        tooltip: '切换到全景图 4'
      }
    ]
  },
  {
    id: '4', 
    name: '全景图 4', 
    path: '/company/4.JPG', 
    markers: [
      {
        id: 'to-pano-3',
        targetIndex: 2, // 前一张图（全景图3）
        position: { yaw: -1.0, pitch: 0.1 },
        tooltip: '后退到全景图 3'
      },
      {
        id: 'to-pano-5',
        targetIndex: 4, // 后一张图（全景图5）
        position: { yaw: 1.0, pitch: 0.1 },
        tooltip: '前进到全景图 5'
      }
    ]
  },
  {
    id: '5', 
    name: '全景图 5', 
    path: '/company/5.JPG', 
    markers: [
      {
        id: 'to-pano-4',
        targetIndex: 3, // 前一张图（全景图4）
        position: { yaw: -1.0, pitch: 0.1 },
        tooltip: '后退到全景图 4'
      },
      {
        id: 'to-pano-6',
        targetIndex: 5, // 后一张图（全景图6）
        position: { yaw: 1.0, pitch: 0.1 },
        tooltip: '前进到全景图 6'
      }
    ]
  },
  {
    id: '6', 
    name: '全景图 6', 
    path: '/company/6.JPG', 
    markers: [
      {
        id: 'to-pano-5',
        targetIndex: 4, // 前一张图（全景图5）
        position: { yaw: -1.0, pitch: 0.1 },
        tooltip: '后退到全景图 5'
      },
      {
        id: 'to-pano-7',
        targetIndex: 5, // 后一张图（全景图7）
        position: { yaw: 1.0, pitch: 0.1 },
        tooltip: '前进到全景图 7'
      }
    ]
  },
  {
    id: '7', 
    name: '全景图 7', 
    path: '/company/7.JPG', 
    markers: [
      {
        id: 'to-pano-6',
        targetIndex: 5, // 前一张图（全景图6）
        position: { yaw: -1.0, pitch: 0.1 },
        tooltip: '后退到全景图 6'
      },
      {
        id: 'to-pano-8',
        targetIndex: 7, // 后一张图（全景图8）
        position: { yaw: 1.0, pitch: 0.1 },
        tooltip: '前进到全景图 8'
      }
    ]
  },
  {
    id: '8', 
    name: '全景图 8', 
    path: '/company/8.JPG', 
    markers: [
      {
        id: 'to-pano-7',
        targetIndex: 6, // 前一张图（全景图7）
        position: { yaw: -1.0, pitch: 0.1 },
        tooltip: '后退到全景图 7'
      },
      {
        id: 'to-pano-9',
        targetIndex: 8, // 后一张图（全景图9）
        position: { yaw: 1.0, pitch: 0.1 },
        tooltip: '前进到全景图 9'
      }
    ]
  },
  {
    id: '9', 
    name: '全景图 9', 
    path: '/company/9.JPG', 
    markers: [
      {
        id: 'to-pano-8',
        targetIndex: 7, // 前一张图（全景图8）
        position: { yaw: -1.0, pitch: 0.1 },
        tooltip: '后退到全景图 8'
      },
      {
        id: 'to-pano-10',
        targetIndex: 9, // 后一张图（全景图10）
        position: { yaw: 1.0, pitch: 0.1 },
        tooltip: '前进到全景图 10'
      }
    ]
  },
  {
    id: '10', 
    name: '全景图 10', 
    path: '/company/10.JPG', 
    markers: [
      {
        id: 'to-pano-9',
        targetIndex: 8, // 前一张图（全景图9）
        position: { yaw: -1.0, pitch: 0.1 },
        tooltip: '后退到全景图 9'
      },
      {
        id: 'to-pano-11',
        targetIndex: 10, // 后一张图（全景图11）
        position: { yaw: 1.0, pitch: 0.1 },
        tooltip: '前进到全景图 11'
      }
    ]
  },
  {
    id: '11', 
    name: '全景图 11', 
    path: '/company/11.JPG', 
    markers: [
      {
        id: 'to-pano-10',
        targetIndex: 9, // 前一张图（全景图10）
        position: { yaw: -1.0, pitch: 0.1 },
        tooltip: '后退到全景图 10'
      },
      {
        id: 'to-pano-12',
        targetIndex: 11, // 后一张图（全景图12）
        position: { yaw: 1.0, pitch: 0.1 },
        tooltip: '前进到全景图 12'
      }
    ]
  },
  {
    id: '12', 
    name: '全景图 12', 
    path: '/company/12.jpg', 
    markers: [
      {
        id: 'to-pano-11',
        targetIndex: 10, // 只能后退到前一张图（全景图11）
        position: { yaw: -1.0, pitch: 0.1 },
        tooltip: '后退到全景图 11'
      }
    ]
  }
])

// 当前活动的全景图索引
const activePanoramaIndex = ref(0)

/**添加信息点 */
const addInfoPoint = (markersPlugin, targetIndex) => {
  try {
    markersPlugin.addMarker({
      id: 'info-1',
      position: {
        yaw: -0.8,  // 使用 yaw 替代 longitude
        pitch: 0.0  // 使用 pitch 替代 latitude
      },
      html: `<div style="padding:6px">信息点 ${targetIndex + 1}</div>`,
      anchor: 'center',
    });
    console.log('Marker info-1 added successfully');
  } catch (error) {
    console.error('Failed to add marker info-1:', error);
  }
}

onMounted(async () => {
    // 创建 Viewer，并在创建时注册 MarkersPlugin
    viewer = new Viewer({
      debugger: true,
      container: viewerContainer.value,
      panorama: '/company/1.JPG',
      caption: '全景1',
      // panorama: panoramaImages.value[activePanoramaIndex.value].path,
      // caption: panoramaImages.value[activePanoramaIndex.value].name,
      touchmoveTwoFingers: true,
      navbar: ['zoom', 'fullscreen'],
      transition: { duration: 1200, loader: true },
      // 使用 withConfig 方法注册插件，更符合文档推荐做法
      plugins: [
        MarkersPlugin.withConfig({
          // 这里可以配置插件的全局选项
          gotoMarkerSpeed: '8rpm', // 与文档示例保持一致
          defaultHoverScale: true // 启用默认的悬停缩放效果
        })
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
      console.log('Adding marker to-pano2', { markersPlugin });

      addInfoPoint(markersPlugin, activePanoramaIndex.value)
      addNavigationMarkers(activePanoramaIndex.value)

      // 订阅插件事件：也使用 addEventListener（而不是 .on/.once）
      markersPlugin.addEventListener('select-marker', (evt) => {
        const marker = evt.marker
        console.log('clicked marker', marker.id)

        // 检查标记ID是否包含全景图索引
        const match = marker.id.match(/^to-pano-(\d+)$/)
        if (match) {
          const targetIndex = parseInt(match[1]) - 1
          switchPanorama(targetIndex)
        }
      })
    }, { once: true }) // 只触发一次
    // debug：若需要在控制台查看 viewer 方法
    // console.log('viewer methods', Object.keys(viewer))
})

// 切换全景图的方法
async function switchPanorama(targetIndex) {
  // 添加另一个信息点示例
  console.log('Adding marker info-1');
  addInfoPoint(markersPlugin, targetIndex)
  // 清空所有标记
  markersPlugin.clearMarkers()
  viewer.setPanorama(panoramaImages.value[targetIndex].path, {
    transition: { duration: 1200, loader: true },
  }).then(() => {
    console.log('视图切换完成')
    activePanoramaIndex.value = targetIndex
    console.log('清除并重新添加标记')
    // 清除并重新添加标记
    addNavigationMarkers(targetIndex)
  }).catch(error => {
    console.error(`Failed to switch to panorama ${targetIndex}:`, error)
  })
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
  const currentPanorama = panoramaImages.value[currentIndex]
  const currentPanoramaMarkers = currentPanorama.markers || []
  
  // 检查当前全景图是否有自定义标记点配置
  if (currentPanoramaMarkers && currentPanoramaMarkers.length > 0) {
    console.log(`使用自定义标记点配置 - 全景图 ${currentPanorama.name}`);
    // 添加自定义标记点
    currentPanoramaMarkers.forEach((markerConfig) => {
      const targetPanorama = panoramaImages.value[markerConfig.targetIndex]
      
      // 确保目标全景图存在
      if (targetPanorama) {
        try {
          markersPlugin.addMarker({
            id: markerConfig.id,
            position: markerConfig.position,
            image: '/point.png',
            size: { width: 32, height: 32 },
            anchor: 'bottom center',
            tooltip: markerConfig.tooltip || `切换到 ${targetPanorama.name}`,
          });
          console.log(`添加自定义标记点成功: ${markerConfig.id} -> ${targetPanorama.name}`);
        } catch (error) {
          console.error(`添加自定义标记点失败 ${markerConfig.id}:`, error);
        }
      }
    });
  } else {
    // 没有自定义配置，使用默认的圆形分布逻辑（向后兼容）
    console.log(`未配置标记点 - 全景图 ${currentPanorama.name}`);
  }
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
          回退
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
          前进
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
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.app-container {
  width: 100vw;
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

/* 加载指示器样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #3498db;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.thumb-item:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.thumb-item:disabled:hover {
  transform: none;
}

.nav-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.nav-button:disabled:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: none;
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
  border-radius: 8px;
  width: 80px;
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
  padding: 5px 12px;
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