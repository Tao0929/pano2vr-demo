<script setup>
import { ref, onMounted, onBeforeUnmount, computed, reactive } from 'vue'
import { Viewer } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import triggerImg from './assets/trigger.png'

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
        position: { yaw: 0.8159770789335171, pitch: -0.19101426200111793 },
        tooltip: '切换到全景图 2'
      },
      {
        id: 'to-pano-4',
        targetIndex: 3, // 目标全景图索引（全景图3）
        position: { yaw: 0.19895918267014728, pitch: -0.19485441756178745 }, // 标记点在当前全景图中的位置
        tooltip: '切换到全景图 4'
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
        position: { yaw: 0.7048732247500537, pitch: -0.49153785432671926 },
        tooltip: '后退到全景图 1'
      },
      {
        id: 'to-pano-3',
        targetIndex: 2, // 目标全景图索引（全景图3）
        position: { yaw: 6.215713346950477, pitch: -0.3045063193037636 },
        tooltip: '切换到全景图 3'
      },
      {
        id: 'to-pano-4',
        targetIndex: 3, // 目标全景图索引（全景图3）
        position: { yaw: 4.143851390900332, pitch: -0.5038495605730189 },
        tooltip: '切换到全景图 4'
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
        position: { yaw: 2.865155004610195, pitch: -0.24389706438669867 },
        tooltip: '回退到全景图 2'
      },
      {
        id: 'to-pano-4',
        targetIndex: 3, // 目标全景图索引（全景图4）
        position: { yaw: 3.532585287739699, pitch: -0.22916419164392066 },
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
        position: { yaw: 3.206306190844711, pitch: -0.27112578078523253 },
        tooltip: '后退到全景图 3'
      },
      {
        id: 'to-pano-5',
        targetIndex: 4, // 后一张图（全景图5）
        position: { yaw: 0.04755909684640482, pitch: -0.2519401711416786 },
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
        position: { yaw: 3.163556233126383, pitch: -0.24767686028922342 },
        tooltip: '后退到全景图 4'
      },
      {
        id: 'to-pano-6',
        targetIndex: 5, // 后一张图（全景图6）
        position: { yaw: 0.004006762799096119, pitch: -0.30491095802474666 },
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
        position: { yaw: 3.163556233126383, pitch: -0.24767686028922342 },
        tooltip: '后退到全景图 5'
      },
      {
        id: 'to-pano-7',
        targetIndex: 5, // 后一张图（全景图7）
        position: { yaw: 0.004006762799096119, pitch: -0.30491095802474666 },
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
        position: { yaw: 3.163556233126383, pitch: -0.24767686028922342 },
        tooltip: '后退到全景图 6'
      },
      {
        id: 'to-pano-8',
        targetIndex: 7, // 后一张图（全景图8）
        position: { yaw: 0.004006762799096119, pitch: -0.30491095802474666 },
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
        position: { yaw: 3.163556233126383, pitch: -0.24767686028922342 },
        tooltip: '后退到全景图 7'
      },
      {
        id: 'to-pano-9',
        targetIndex: 8, // 后一张图（全景图9）
        position: { yaw: 0.004006762799096119, pitch: -0.30491095802474666 },
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
        position: { yaw: 4.519280168479489, pitch: -0.8144439941908299 },
        tooltip: '后退到全景图 8'
      },
      {
        id: 'to-pano-10',
        targetIndex: 9, // 后一张图（全景图10）
        position: { yaw: 0.11727839363151057, pitch: -0.2943573810018462 },
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
        position: { yaw: 3.1891094134339175, pitch: -0.45221322302647504 },
        tooltip: '后退到全景图 9'
      },
      {
        id: 'to-pano-11',
        targetIndex: 10, // 后一张图（全景图11）
        position: { yaw: 0.01871354923955571, pitch: -0.5615787232734366 },
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
        position: { yaw: 4.432047187554286, pitch: -1.0417373214627652 },
        tooltip: '后退到全景图 10'
      },
      {
        id: 'to-pano-12',
        targetIndex: 11, // 后一张图（全景图12）
        position: { yaw: 0.2705120475404308, pitch: -0.5060475526053616 },
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
        position: { yaw: 3.22425483273526, pitch: -0.9720153009743981 },
        tooltip: '后退到全景图 11'
      }
    ]
  }
])

// 当前活动全景图索引
const activePanoramaIndex = ref(0)

// 存储缩略图加载状态
const thumbnailsLoaded = ref({})
// 存储缩略图数据
const thumbnails = ref({})

// 是否正在预加载相邻全景图的标记
const isPreloadingAdjacent = ref(false)

// 控制导航栏的显示状态
const showNavigation = ref(false)

// 控制触发按钮的显示状态
const showTrigger = ref(true)

// 创建全景图缓存对象
const panoramaCache = reactive({
  // 缓存的全景图数据
  items: {},
  // 当前预加载的全景图索引
  preloadedIndices: new Set(),
  // 缓存大小限制
  MAX_CACHE_SIZE: 5,
  // 预加载范围（前后各几个）
  PRELOAD_RANGE: 1
})

// 预加载全景图函数
async function preloadPanorama(index) {
  const panorama = panoramaImages.value[index]
  try {
    if (!panorama || panoramaCache.preloadedIndices.has(index)) {
      return
    }

    // 创建Image对象进行预加载
    const img = new Image()
    img.src = panorama.path
    img.decode = img.decode || Promise.resolve().then(() => {})
    
    // 使用decode方法提高性能
    await img.decode().catch(() => {
      // 如果decode不支持或失败，回退到onload
      return new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
    })
    
    // 检查缓存大小，超过限制时清理不常用的缓存
    if (Object.keys(panoramaCache.items).length >= panoramaCache.MAX_CACHE_SIZE) {
      cleanupCache(index)
    }
    
    // 存入缓存
    panoramaCache.items[`pano_${index}`] = {
      image: img,
      lastAccessed: Date.now()
    }
    
    panoramaCache.preloadedIndices.add(index)
    
    console.log(`预加载全景图成功: ${panorama.name}`)
    
    // 预加载相邻的全景图
    await preloadAdjacentPanoramas(index)
  } catch (error) {
    console.error(`预加载全景图失败: ${panorama?.name || '未知'}`, error)
  }
}

// 预加载相邻的全景图
async function preloadAdjacentPanoramas(index) {
  // 如果已经在预加载中，直接返回
  if (isPreloadingAdjacent.value) {
    console.log('预加载已在进行中，跳过本次调用')
    return
  }
  
  try {
    isPreloadingAdjacent.value = true
    const promises = []
    const delayBase = 100
    
    // 向前预加载
    for (let i = 1; i <= panoramaCache.PRELOAD_RANGE; i++) {
      const nextIndex = (index + i) % panoramaImages.value.length
      if (!panoramaCache.preloadedIndices.has(nextIndex)) {
        promises.push(
          new Promise(resolve => {
            setTimeout(() => {
              preloadPanorama(nextIndex).then(resolve)
            }, i * delayBase)
          })
        )
      }
    }
    
    // 向后预加载
    for (let i = 1; i <= panoramaCache.PRELOAD_RANGE; i++) {
      const prevIndex = (index - i + panoramaImages.value.length) % panoramaImages.value.length
      if (!panoramaCache.preloadedIndices.has(prevIndex)) {
        promises.push(
          new Promise(resolve => {
            setTimeout(() => {
              preloadPanorama(prevIndex).then(resolve)
            }, i * delayBase)
          })
        )
      }
    }
    
    // 限制并发数量
    const MAX_CONCURRENT = 2
    for (let i = 0; i < promises.length; i += MAX_CONCURRENT) {
      const batch = promises.slice(i, i + MAX_CONCURRENT)
      await Promise.all(batch)
    }
    
  } catch (error) {
    console.error('预加载相邻全景图时出错:', error)
  } finally {
    // 使用setTimeout延迟重置状态，避免短时间内重复触发
    setTimeout(() => {
      isPreloadingAdjacent.value = false
    }, 500)
  }
}

// 清理缓存，保留最近访问的全景图
function cleanupCache(currentIndex) {
  // 创建缓存项数组并按最后访问时间排序
  const cacheItems = Object.entries(panoramaCache.items)
    .map(([key, value]) => ({
      key,
      index: parseInt(key.replace('pano_', '')),
      lastAccessed: value.lastAccessed
    }))
    .filter(item => item.index !== currentIndex) // 保留当前全景图
    .sort((a, b) => a.lastAccessed - b.lastAccessed) // 按访问时间排序，最旧的在前
  
  // 计算需要清理的项数
  const itemsToClean = cacheItems.length + 1 - panoramaCache.MAX_CACHE_SIZE
  
  // 清理多余的缓存项
  for (let i = 0; i < itemsToClean && i < cacheItems.length; i++) {
    const { key, index } = cacheItems[i]
    delete panoramaCache.items[key]
    panoramaCache.preloadedIndices.delete(index)
  }
}

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
      container: viewerContainer.value,
      panorama: '/company/1.JPG',
      caption: '全景1',
      touchmoveTwoFingers: true,
      navbar: ['zoom', ], // 'fullscreen'
      transition: { duration: 200, loader: true },
      defaultZoomLvl: 1,
      moveSpeed: 1,
      zoomSpeed: 1,
      loadingImg: '/loading.gif',
      loadingTxt: '请稍等',
      // 禁用一些不必要的功能以提高性能
      // mousewheelCtrlKey: true,
      // 添加渲染性能优化配置
      requestKeyframe: true,
      fisheye: false,
      minFov: 30,
      maxFov: 140,
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
      
      // 初始化时预加载当前和相邻全景图
      preloadPanorama(activePanoramaIndex.value)
      
      // 初始化缩略图加载
      initThumbnails()

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
  // 提前清空标记，避免在过渡过程中显示
  markersPlugin.clearMarkers()
  
  const panorama = panoramaImages.value[targetIndex]
  
  // 更新缓存中当前全景图的访问时间
  if (activePanoramaIndex.value !== -1) {
    const cacheKey = `pano_${activePanoramaIndex.value}`
    if (panoramaCache.items[cacheKey]) {
      panoramaCache.items[cacheKey].lastAccessed = Date.now()
    }
  }
  
  // 根据缓存状态调整过渡时间
  const isCached = !!panoramaCache.items[`pano_${targetIndex}`]
  const transitionTime = isCached ? 200 : 400
  
  try {
    // 根据是否已缓存调整过渡时间，已缓存的可以用更短时间
    await viewer.setPanorama(panorama.path, {
      transition: {
        duration: transitionTime,
        // loader: !isCached, // 只在未缓存时显示加载指示器
        ease: 'easeInOutQuart', // 使用更平滑的缓动函数  
        effect: 'fade',
        // effect?: 'fade' | 'black' | 'white';
        rotation: true,
        // speed: '8rpm',
        speed: 200,
        // speed: '2rpm',
        // fade
      },
      showLoader: !isCached,
      // showLoader: false,
      duration: transitionTime,
      // 优化渲染性能
      partialLoad: true, // 允许部分加载
      requestKeyframe: true // 请求关键帧以提高渲染优先级
    })
    
    console.log('视图切换完成')
    activePanoramaIndex.value = targetIndex
    
    // 更新缓存中全景图的访问时间
    const cacheKey = `pano_${targetIndex}`
    if (panoramaCache.items[cacheKey]) {
      panoramaCache.items[cacheKey].lastAccessed = Date.now()
    }
    
    // 延迟添加标记点，避免影响切换动画性能
    setTimeout(() => {
      addInfoPoint(markersPlugin, targetIndex)
      addNavigationMarkers(targetIndex)
    }, 100)
    
    // 异步预加载相邻全景图，不阻塞主线程
    setTimeout(() => {
      preloadAdjacentPanoramas(targetIndex)
    }, 1000)
    
  } catch (error) {
    console.error(`Failed to switch to panorama ${targetIndex}:`, error)
    // 切换失败时尝试添加回标记
    setTimeout(() => {
      addInfoPoint(markersPlugin, activePanoramaIndex.value)
      addNavigationMarkers(activePanoramaIndex.value)
    }, 100)
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

// 获取缩略图路径
// 为JPG格式的全景图生成对应的PNG格式缩略图路径
function getThumbnailPath(pano) {
  const pathParts = pano.path.split('/')
  const fileName = pathParts.pop()
  
  // 分离文件名和扩展名
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'))
  
  // 创建缩略图文件名，使用PNG格式
  const thumbnailName = 'thumb-' + nameWithoutExt + '.png'
  pathParts.push(thumbnailName)
  return pathParts.join('/')
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

// 初始化缩略图加载
function initThumbnails() {
  // 首先加载当前显示的全景图缩略图
  loadThumbnail(activePanoramaIndex.value)
  
  // 使用 Intersection Observer API 实现缩略图懒加载
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.dataset.index)
        loadThumbnail(index)
        observer.unobserve(entry.target)
      }
    })
  }, {
    rootMargin: '100px'
  })
  
  // 为缩略图项添加观察器
  setTimeout(() => {
    document.querySelectorAll('.thumb-item').forEach((item) => {
      const index = item.dataset.index
      if (index !== undefined) {
        observer.observe(item)
      }
    })
  }, 100)
}

// 加载缩略图
async function loadThumbnail(index) {
  if (thumbnailsLoaded.value[index]) return
  
  const pano = panoramaImages.value[index]
  if (!pano) return
  
  try {
    // 实际项目中应该使用专门的缩略图文件
    const thumbnailPath = getThumbnailPath(pano)
    
    // 使用小尺寸的图片作为缩略图
    const img = new Image()
    // 可以设置更严格的超时时间，避免长时间加载
    const loadTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Thumbnail load timeout')), 3000)
    )
    
    const loadPromise = new Promise((resolve, reject) => {
      img.onload = () => {
        thumbnails.value[index] = thumbnailPath
        thumbnailsLoaded.value[index] = true
        resolve()
      }
      img.onerror = reject
      img.src = thumbnailPath
    })
    
    // 使用 Promise.race 处理超时
    await Promise.race([loadPromise, loadTimeout])
  } catch (error) {
    console.error(`加载缩略图失败 (索引: ${index}):`, error)
    // 加载失败时，也标记为已加载，避免重复加载
    thumbnailsLoaded.value[index] = true
  }
}

// 处理缩略图加载错误
function handleThumbnailError(index) {
  console.warn(`缩略图加载失败，使用默认图片 (索引: ${index})`)
  // 可以在这里设置一个默认的缩略图路径
  // thumbnails.value[index] = '/default-thumbnail.jpg'
}

// 鼠标进入triggerImg时显示导航栏，隐藏triggerImg
function onTriggerMouseEnter() {
  showNavigation.value = true
  showTrigger.value = false
}

// 点击空白区域时隐藏导航栏，显示triggerImg
function onViewerClick() {
  // 只有在导航栏显示时才执行隐藏操作
  if (showNavigation.value) {
    showNavigation.value = false
    showTrigger.value = true
  }
}

onBeforeUnmount(() => {
  try { viewer?.destroy() } catch (e) { console.warn(e) }
})
</script>

<template>
  <div class="app-container">
    <div 
      ref="viewerContainer" 
      class="viewer"
      @click="onViewerClick"
    ></div>
    
    <!-- 底部导览栏 -->
    <div 
      v-show="showNavigation" 
      class="navigation-bar"
    >
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
            :data-index="index"
          >
            <div class="thumb-image-container">
              <!-- 使用缩略图路径替代原始图片路径，大幅减少内存占用 -->
              <div v-if="!thumbnailsLoaded[index]" class="thumb-skeleton"></div>
              <img 
                v-else
                :src="thumbnails[index] || getThumbnailPath(pano)" 
                :alt="pano.name" 
                class="thumb-image"
                loading="lazy"
                @error="handleThumbnailError(index)"
              >
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
    <img
      class="trigger-img"
      v-show="showTrigger"
      :src="triggerImg" 
      style="width: 65px;height: 65px;cursor: pointer;animation: rotate 10s linear infinite;"
      alt="点击展开导航"
      @mouseenter="onTriggerMouseEnter"
    >
    
    <!-- 路由导航链接 -->
    <div class="route-navigation">
      <router-link to="/coordinate-capture" class="nav-link">
        打开坐标捕获工具
      </router-link>
    </div>
  </div>
</template>

<style>
.psv-loader-canvas{
  display: none !important;
}
/* 确保真正全屏 */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.app-container {
  width: 100vw;
  position: relative;
  overflow: hidden;
  
  /* 旋转动画定义 */
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 路由导航样式 */
.route-navigation {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.nav-link {
  display: inline-block;
  padding: 10px 20px;
  background-color: rgba(76, 175, 80, 0.9);
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.nav-link:hover {
  background-color: rgba(69, 160, 73, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.nav-link:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
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
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: absolute;
  bottom: 88px;
  left: 44px;
  right: 44px;
  z-index: inherit;
  padding: 10px 0;
  border-radius: 20px;
}

.navigation-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  gap: 15px;
}

/* 导航按钮样式 */
.nav-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
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
  will-change: transform;
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
  background: rgba(#222, .4);
}

.thumb-item.active .thumb-image-container {
  border-color: #4CAF50;
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: pixelated;
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
  pointer-events: none;
}

/* 添加骨架屏样式，在缩略图加载过程中显示 */
.thumb-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #222 25%, #333 50%, #222 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
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
.trigger-img{
  position: absolute;
  /* 居中对齐 */
  margin: 0 auto;
  bottom: 48px;
  left: 0;
  right: 0;
  /* 旋转 */
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>