<template>
  <div class="coordinate-capture-container">
    <h1>全景图坐标捕获工具</h1>
    
    <!-- 返回主页面链接 -->
    <div class="back-navigation">
      <router-link to="/" class="back-link">
        返回全景图展示
      </router-link>
    </div>
    
    <!-- 全景图容器 -->
    <div ref="viewerContainer" class="viewer-container"></div>
    
    <!-- 控制面板 -->
    <div class="control-panel">
      <h2>当前坐标信息</h2>
      
      <!-- 点击位置坐标显示 -->
      <div class="coordinate-info">
        <label>点击位置:</label>
        <div class="coordinate-display">
          <span>Yaw: {{ clickedPosition.yaw }}</span>
          <span>Pitch: {{ clickedPosition.pitch }}</span>
        </div>
      </div>
      <!-- 已选坐标点列表 -->
      <div class="selected-points-container">
        <h3>已选坐标点 ({{ selectedPoints.length }})</h3>
        <div v-if="selectedPoints.length === 0" class="no-points-message">
          暂无选中的坐标点，请在全景图上点击添加
        </div>
        <div v-for="point in selectedPoints" :key="point.id" class="point-item">
          <div class="point-info">
            <span class="point-id">ID: {{ point.id }}</span>
            <div class="point-coordinates">
              <span>Yaw: {{ point.yaw.toFixed(4) }}</span>
              <span>Pitch: {{ point.pitch.toFixed(4) }}</span>
            </div>
          </div>
          <div class="point-actions">
            <button @click="removePoint(point.id)" class="remove-button">删除</button>
            <button @click="copyClickedPosition(point)" class="copy-button">复制</button>
          </div>
        </div>
      </div>

      <!-- 当前视图中心坐标显示 -->
      <!-- <div class="coordinate-info">
        <label>视图中心:</label>
        <div class="coordinate-display">
          <span>Yaw: {{ centerPosition.yaw }}</span>
          <span>Pitch: {{ centerPosition.pitch }}</span>
        </div>
        <button 
          @click="copyCenterPosition"
          class="copy-button"
        >
          {{ centerCopySuccess ? '已复制!' : '复制坐标' }}
        </button>
      </div> -->
      
      <!-- 全景图选择 -->
      <div class="panorama-selector">
        <label>选择全景图:</label>
        <select v-model="selectedPanorama" @change="changePanorama">
          <option v-for="pano in panoramaImages" :key="pano.id" :value="pano.path">
            {{ pano.name }}
          </option>
        </select>
      </div>
      
      <!-- 清除信息点按钮 -->
      <div class="clear-markers-section">
        <button 
          @click="clearAllInfoPoints"
          class="clear-button"
        >
          清除所有信息点 ({{ selectedPoints.length }})
        </button>
      </div>
      
      <!-- 使用提示 -->
      <div class="instructions">
        <h3>使用说明:</h3>
        <ul>
          <li>拖动鼠标可以旋转全景图到任意位置</li>
          <li>点击全景图中的任意点获取该点的坐标</li>
          <li>点击"复制坐标"按钮可以复制当前显示的坐标值</li>
          <li>可以选择不同的全景图进行坐标捕获</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Viewer } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'

export default {
  name: 'CoordinateCapture',
  setup() {
    const viewerContainer = ref(null)
    let viewer = null
    let markersPlugin = null
    let infoPointIndex = 0  // 用于生成唯一的信息点ID
    
    // 全景图片数据
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
    
    const selectedPanorama = ref('/company/1.JPG')
    const clickedPosition = ref({ yaw: 0, pitch: 0 })
    const centerPosition = ref({ yaw: 0, pitch: 0 })
    const copySuccess = ref(false)
    const centerCopySuccess = ref(false)
    // 记录已选坐标点
    const selectedPoints = ref([])
    
    // 初始化全景图查看器
    const initViewer = () => {
      if (viewerContainer.value) {
        try {
          // 重置信息点索引
          infoPointIndex = 0
          
          viewer = new Viewer({
            container: viewerContainer.value,
            panorama: selectedPanorama.value,
            caption: '全景图坐标捕获',
            touchmoveTwoFingers: true,
            navbar: ['zoom', 'fullscreen'],
            // transition: { duration: 200, loader: true },
            transition: { duration: 200, loader: true },
            showloader: false,
            defaultZoomLvl: 1,
            moveSpeed: 1,
            zoomSpeed: 1,
            fisheye: false,
            minFov: 30,
            maxFov: 140,
            requestKeyframe: true,
            // 在Viewer初始化时注册MarkersPlugin
            plugins: [MarkersPlugin]
          })
          console.log({viewer})
          // 添加事件监听器
          // 获取已注册的插件实例
          markersPlugin = viewer.getPlugin(MarkersPlugin)
          
          // 添加事件监听器
          viewer.addEventListener('ready', () => {
            console.log('全景图已加载完成')
            updateCenterPosition()
          })
          // viewer.addEventListener('ready', () => {
          // // 初始化标记插件
          //   markersPlugin = viewer.getPlugin(MarkersPlugin)
          //   console.log({markersPlugin})
          //   console.log('全景图已加载完成')
          //   updateCenterPosition()
          // })
          
          // 监听鼠标点击事件
          viewer.addEventListener('click', handleClick)
          
          // 监听全景图移动事件，更新中心坐标
          viewer.addEventListener('position-updated', updateCenterPosition)
          
          // 添加错误处理
          viewer.addEventListener('error', (error) => {
            console.error('Viewer error:', error)
          })
        } catch (error) {
          console.error('Failed to initialize viewer:', error)
        }
      }
    }
    // 在指定位置添加信息点
    const addInfoPoint = (position) => {
      console.log({markersPlugin})
      try {
        if (!markersPlugin) return;
        
        infoPointIndex++;
        const markerId = `info-${infoPointIndex}`;
        
        markersPlugin.addMarker({
          id: markerId,
          position: {
            yaw: position.yaw,
            pitch: position.pitch
          },
          html: `<div style="background: rgba(255, 255, 255, 0.9); padding: 6px; border-radius: 4px; font-size: 12px;">坐标 ${infoPointIndex}</div>`,
          anchor: 'bottom center',
          style: {
            opacity: 0.9,
            transition: 'opacity 0.3s'
          }
        });
        
        console.log(`Marker ${markerId} added successfully at position:`, position);
        // 记录坐标点
        selectedPoints.value.push({
          id: markerId,
          yaw: position.yaw,
          pitch: position.pitch
        });
      } catch (error) {
        console.error('Failed to add marker:', error);
      }
    }
    // 清除所有信息点
    const clearAllInfoPoints = () => {
      try {
        if (markersPlugin) {
          // 获取所有标记并移除
          const allMarkers = markersPlugin.getMarkers();
          allMarkers.forEach(marker => {
            if (marker.id.startsWith('info-')) {
              markersPlugin.removeMarker(marker.id);
            }
          });
          
          // 重置信息点索引
          infoPointIndex = 0;
          selectedPoints.value = []
          console.log('All info points have been cleared');
        }
      } catch (error) {
        console.error('Failed to clear all info points:', error);
      }
    }
    
    // 处理全景图点击事件
    const handleClick = (event) => {
      try {
        console.log(event?.data)
        if (viewer && event && event.data && (event.data.yaw !== undefined || event.data.pitch !== undefined)) {
          // 获取点击位置的坐标，确保有有效的值
          const position = {
            yaw: event.data.yaw || 0,
            pitch: event.data.pitch || 0
          }

          // 格式化坐标值为小数点后两位
          clickedPosition.value = {
            yaw: Math.round(position.yaw * 100) / 100,
            pitch: Math.round(position.pitch * 100) / 100
          }
          copySuccess.value = false
          console.log('-------添加点位', position)
          // 在点击位置添加信息点标签
          addInfoPoint(position)
        } else {
          console.warn('Invalid click event or missing viewer:', { event, hasViewer: !!viewer });
        }
      } catch (error) {
        console.error('Error in handleClick:', error);
      }
    }
    
    // 更新视图中心坐标
    const updateCenterPosition = () => {
      if (viewer) {
        const position = viewer.getPosition()
        centerPosition.value = {
          yaw: Math.round(position.yaw * 100) / 100,
          pitch: Math.round(position.pitch * 100) / 100
        }
        centerCopySuccess.value = false
      }
    }
    
    // 复制点击位置坐标
    const copyClickedPosition = (pData) => {
      try {
        // 更严格的参数检查，确保有有效的坐标数据
        let targetData;
        if (pData && pData.yaw !== undefined && pData.pitch !== undefined) {
          targetData = pData;
        } else if (clickedPosition.value && clickedPosition.value.yaw !== undefined && clickedPosition.value.pitch !== undefined) {
          targetData = clickedPosition.value;
        } else {
          console.error('No valid coordinates to copy');
          return;
        }
        
        const coordsText = `{ yaw: ${targetData.yaw}, pitch: ${targetData.pitch} }`
        
        // 检查clipboard API是否可用
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(coordsText).then(() => {
            copySuccess.value = true
            setTimeout(() => {
              copySuccess.value = false
            }, 2000)
          }).catch(err => {
            console.error('Failed to copy using Clipboard API:', err);
            // 尝试备用方法（虽然现代浏览器通常不支持）
            fallbackCopyTextToClipboard(coordsText);
          })
        } else {
          // 降级处理
          fallbackCopyTextToClipboard(coordsText);
        }
      } catch (err) {
        console.error('Error in copyClickedPosition:', err);
      }
    }
    
    // 复制文本到剪贴板的备用方法
    const fallbackCopyTextToClipboard = (text, isCenter = false) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      try {
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        if (successful) {
          if (isCenter) {
            centerCopySuccess.value = true
            setTimeout(() => {
              centerCopySuccess.value = false
            }, 2000)
          } else {
            copySuccess.value = true
            setTimeout(() => {
              copySuccess.value = false
            }, 2000)
          }
        } else {
          console.error('Fallback: Copy command was unsuccessful');
        }
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      } finally {
        document.body.removeChild(textArea);
      }
    }
    
    // 移除单个信息点
    const removePoint = (id) => {
      try {
        if (markersPlugin) {
          // 从标记插件中移除标记
          markersPlugin.removeMarker(id);
          
          // 从selectedPoints数组中移除对应的坐标点
          const index = selectedPoints.value.findIndex(point => point.id === id);
          if (index !== -1) {
            selectedPoints.value.splice(index, 1);
          }
          
          console.log(`Marker ${id} removed successfully`);
        }
      } catch (error) {
        console.error('Failed to remove marker:', error);
      }
    }
    
    // 复制视图中心坐标
    const copyCenterPosition = () => {
      try {
        // 检查centerPosition是否有有效的坐标数据
        if (centerPosition.value && centerPosition.value.yaw !== undefined && centerPosition.value.pitch !== undefined) {
          const coordsText = `{ yaw: ${centerPosition.value.yaw}, pitch: ${centerPosition.value.pitch} }`
          
          // 检查clipboard API是否可用
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(coordsText).then(() => {
              centerCopySuccess.value = true
              setTimeout(() => {
                centerCopySuccess.value = false
              }, 2000)
            }).catch(err => {
              console.error('Failed to copy using Clipboard API:', err);
              // 尝试备用方法
              fallbackCopyTextToClipboard(coordsText, true);
            })
          } else {
            // 降级处理
            fallbackCopyTextToClipboard(coordsText, true);
          }
        } else {
          console.error('No valid center coordinates to copy');
        }
      } catch (err) {
        console.error('Error in copyCenterPosition:', err);
      }
    }
    
    // 切换全景图
    const changePanorama = () => {
      if (viewer) {
        // 清除所有信息点
        clearAllInfoPoints()
        
        // 设置新的全景图
        viewer.setPanorama(selectedPanorama.value)
      }
    }
    
    // 组件挂载时初始化
    onMounted(() => {
      initViewer()
    })
    
    // 组件卸载时清理
    onBeforeUnmount(() => {
      if (viewer) {
        viewer.destroy()
        viewer = null
      }
    })
    
    return {
      viewerContainer,
      panoramaImages,
      selectedPanorama,
      clickedPosition,
      centerPosition,
      copySuccess,
      centerCopySuccess,
      markersPlugin,
      infoPointIndex,
      selectedPoints,
      handleClick,
      updateCenterPosition,
      copyClickedPosition,
      copyCenterPosition,
      changePanorama,
      clearAllInfoPoints,
      removePoint
    }
  }
}
</script>

<style scoped>
.coordinate-capture-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  background-color: #f5f5f5;
}

.coordinate-capture-container h1 {
  position: absolute;
  top: 20px;
  left: 20px;
  margin: 0;
  color: #333;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.viewer-container {
  flex: 2;
  background-color: #000;
  position: relative;
  height: 100%;
}

.control-panel {
  flex: 1;
  background-color: white;
  padding: 1rem;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.control-panel h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.coordinate-info {
  margin-bottom: 8px;
  padding: 0.5rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  /* flex: 1; */
}

.coordinate-info label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #666;
}

.coordinate-display {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-family: monospace;
  background-color: #e9e9e9;
  padding: 0.5rem;
  border-radius: 4px;
}

.copy-button {
  width: 100%;
  padding: 0.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.copy-button:hover:not(:disabled) {
  background-color: #45a049;
}

.copy-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.panorama-selector {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.panorama-selector label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #666;
}

.panorama-selector select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.instructions {
  background-color: #f0f8ff;
  padding: 0.5rem;
  border-radius: 4px;
  border-left: 4px solid #1e90ff;
}

.instructions h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #1e90ff;
}

.instructions ul {
  margin: 0;
  padding-left: 1.5rem;
}

.instructions li {
  margin-bottom: 0.25rem;
  color: #666;
}
  /* 返回按钮样式 */
  .back-navigation {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1001;
  }
  
  .back-link {
    display: inline-block;
    padding: 10px 20px;
    background-color: rgba(33, 150, 243, 0.9);
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
    transition: all 0.3s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  }
  
  .back-link:hover {
    background-color: rgba(25, 118, 210, 1);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  }
  
  .back-link:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  }
  
  /* 已选坐标点列表样式 */
  .selected-points-container {
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: #fafafa;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
  }
  
  .selected-points-container h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.1rem;
  }
  
  .no-points-message {
    text-align: center;
    color: #888;
    padding: 1rem;
    font-style: italic;
    background-color: #f9f9f9;
    border-radius: 4px;
  }
  
  .point-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }
  
  .point-item:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
  
  .point-info {
    flex: 1;
  }
  
  .point-id {
    display: block;
    font-weight: bold;
    color: #424242;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }
  
  .point-coordinates {
    display: flex;
    flex-direction: column;
    font-family: monospace;
    color: #616161;
    font-size: 0.85rem;
  }
  
  .point-coordinates span {
    margin-bottom: 0.125rem;
  }
  
  .point-actions {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-left: 0.75rem;
    min-width: 60px;
  }
  
  .remove-button {
    padding: 0.375rem 0.75rem;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: background-color 0.2s ease;
  }
  
  .remove-button:hover {
    background-color: #d32f2f;
  }
  
  .remove-button:active {
    background-color: #b71c1c;
  }
  
  .point-item .copy-button {
    padding: 0.375rem 0.75rem;
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }
  
  /* 清除标记部分样式 */
  .clear-markers-section {
    margin-bottom: 1rem;
    padding: 0.5rem;
    background-color: #fff8f0;
    border-radius: 4px;
    border-left: 4px solid #ff9800;
  }
  
  .clear-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #ff9800;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    font-size: 1rem;
    transition: all 0.3s ease;
  }
  
  .clear-button:hover:not(:disabled) {
    background-color: #f57c00;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .clear-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .clear-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
</style>