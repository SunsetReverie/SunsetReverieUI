import { fileURLToPath } from 'node:url'

const resolvePath = (path: string): string => fileURLToPath(new URL(path, import.meta.url))

/**
 * 最小 Nuxt 4 调试站
 *
 * 目的：在 W7 实现 @sunset-reverie/nuxt 之前，先手动把「SSR + 主题 + 组件」跑通，
 * 提前暴露水合问题。W7 之后这里的 plugin 会被一条 modules 配置替代，页面代码不动。
 *
 * 注意：组件与样式直接 alias 到源码，不需要先 build ui 包，改组件即时生效。
 */
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false },

  // 样式直接指向源码入口，由 Nuxt 的 Vite 管线编译 Less
  css: [resolvePath('../packages/ui/src/styles/index.less')],

  vite: {
    resolve: {
      alias: [
        {
          find: /^@sunset-reverie\/ui$/,
          replacement: resolvePath('../packages/ui/src/index.ts'),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        less: { javascriptEnabled: true },
      },
    },
  },

  // 服务端渲染时就带上确定的根属性，避免首帧结构差异
  app: {
    head: {
      htmlAttrs: {
        'data-sr-theme': 'light',
        'data-sr-style': 'flat',
        lang: 'zh-CN',
      },
    },
  },
})
