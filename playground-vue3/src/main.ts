import { createApp } from 'vue'

import { SR_STYLE_STORAGE_KEY, useSrTheme } from '@sunset-reverie/ui'
import '@sunset-reverie/ui/style.css'

import App from './App.vue'
import { router } from './router'
import { applyMotion, readMotion } from './motion'

// 读取 localStorage、绑定系统主题监听、同步 DOM 属性。
// 首帧的防闪烁由 index.html 里的内联脚本负责，这里只做状态对齐。
const theme = useSrTheme()
theme.init()

// 动效模式：纯 CSS 变量覆盖，必须在挂载前写好属性
// （不影响颜色，所以不需要像主题那样做防闪烁内联脚本）
applyMotion(readMotion())

// 调试便利：支持 ?theme=dark&style=glass，方便截图与分享复现链接
const params = new URLSearchParams(window.location.search)
const themeParam = params.get('theme')
if (themeParam === 'light' || themeParam === 'dark' || themeParam === 'auto') {
  theme.setTheme(themeParam)
}
const styleParam = params.get('style')
if (styleParam === 'flat' || styleParam === 'glass') {
  theme.setStyle(styleParam)
} else if (!localStorage.getItem(SR_STYLE_STORAGE_KEY)) {
  // 没存过偏好时默认玻璃：平面纯色下看不出这套设计的分层，磨砂才是它的重点
  theme.setStyle('glass')
}
// ?tip=1 强制显示所有提示气泡：无头截图无法触发 hover，用它拍视觉稿
if (params.get('tip') === '1') document.body.classList.add('force-tooltip')

// ?preset=jade 选择预设主题色（走属性选择器，与顶栏色点同一路径）
const presetParam = params.get('preset')
if (presetParam) theme.setPreset(presetParam)

// ?primary=%23FF7A45 直接指定任意主题色，便于分享复现链接与截图对比
const primaryParam = params.get('primary')
if (primaryParam) {
  theme.setPrimaryColor(primaryParam.startsWith('#') ? primaryParam : `#${primaryParam}`)
}

createApp(App).use(router).mount('#app')
