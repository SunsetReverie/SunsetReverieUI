import { fileURLToPath } from 'node:url'

const resolvePath = (path: string): string => fileURLToPath(new URL(path, import.meta.url))

/**
 * 夕梦 UI × Nuxt 4 演示站
 *
 * 接入方式就是两行配置：modules 里加包名，sunsetReverie 里给选项。
 * 样式注入、组件注册、组合式函数自动导入、SSR 防闪烁脚本都由 module 完成。
 */
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false },

  // ↓↓↓ 接入的全部内容 ↓↓↓
  modules: ['@sunset-reverie/nuxt'],
  sunsetReverie: {
    defaultTheme: 'auto',
    defaultStyle: 'flat',
  },
  app: { head: { htmlAttrs: { lang: 'zh-CN' } } },
  // ↑↑↑ 接入的全部内容 ↑↑↑

  vite: {
    resolve: {
      alias: [
        {
          find: /^@sunset-reverie\/ui$/,
          replacement: resolvePath('../packages/ui/src/index.ts'),
        },
        {
          find: /^@sunset-reverie\/ui\/base\.css$/,
          replacement: resolvePath('../packages/ui/src/styles/base/index.less'),
        },
        {
          find: /^@sunset-reverie\/ui\/style\.css$/,
          replacement: resolvePath('../packages/ui/src/styles/index.less'),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        less: { javascriptEnabled: true },
      },
    },
  },
})
