import { createApp } from 'vue'

import { useSrTheme } from '@sunset-reverie/ui'
import '@sunset-reverie/ui/style.css'

import App from './App.vue'

// 读取 localStorage、绑定系统主题监听、同步 DOM 属性。
// 首帧的防闪烁由 index.html 里的内联脚本负责，这里只做状态对齐。
const theme = useSrTheme()
theme.init()

// 调试便利：支持 ?theme=dark&style=glass，方便截图与分享复现链接
const params = new URLSearchParams(window.location.search)
const themeParam = params.get('theme')
if (themeParam === 'light' || themeParam === 'dark' || themeParam === 'auto') {
  theme.setTheme(themeParam)
}
const styleParam = params.get('style')
if (styleParam === 'flat' || styleParam === 'glass') {
  theme.setStyle(styleParam)
}
// ?preset=jade 选择预设主题色（走属性选择器，与顶栏色点同一路径）
const presetParam = params.get('preset')
if (presetParam) theme.setPreset(presetParam)

// ?primary=%23FF7A45 直接指定任意主题色，便于分享复现链接与截图对比
const primaryParam = params.get('primary')
if (primaryParam) {
  theme.setPrimaryColor(primaryParam.startsWith('#') ? primaryParam : `#${primaryParam}`)
}

createApp(App).mount('#app')
