import DefaultTheme from 'vitepress/theme'
import type { App } from 'vue'

import * as SunsetReverie from '@sunset-reverie/ui'
// 直接引源码样式：文档站的演示必须和当前代码完全一致。
// 基础层提供全部 CSS 变量，组件样式依赖它，两者顺序不能反。
import '../../../packages/ui/src/styles/base/index.less'
import '../../../packages/ui/src/styles/index.less'

import './style.css'
import './demo.css'

/**
 * 文档站主题
 *
 * 除了加载品牌样式，还把组件库全局注册进来 —— 这样 Markdown 里可以直接写
 * `<SrButton>`、`<SrNav>` 之类的标签，文档与演示同源，不会出现「示例代码能跑、
 * 页面里却是截图」的脱节。
 */
export default {
  extends: DefaultTheme,

  enhanceApp({ app }: { app: App }) {
    // 读取 localStorage、绑定系统主题监听、把状态同步到根属性
    SunsetReverie.useSrTheme().init()

    for (const [name, value] of Object.entries(SunsetReverie)) {
      // srWithInstall 会给每个组件挂上 install，用它把组件和工具函数区分开
      if (!name.startsWith('Sr')) continue
      if (!value || typeof value !== 'object' || !('install' in value)) continue
      app.use(value as never)
    }
  },
}
