import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: '夕梦 UI',
  description: 'SunsetReverie-UI —— Vue 3 / Nuxt 4 组件库',
  cleanUrls: true,

  // 规划文档是内部材料（4500 行），不参与文档站渲染。
  // 它留在 docs/ 根目录供评审使用，README 的链接也指向那里。
  srcExclude: ['夕梦UI组件库开发规划.md'],

  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '组件', link: '/components/button' },
      { text: 'Token 验证页', link: '/token-gallery.html' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [{ text: '快速开始', link: '/guide/getting-started' }],
        },
      ],
      // W7 只落地 3 个组件的文档，其余在 W11 补齐（侧边栏先不列，避免死链）
      '/components/': [
        {
          text: '组件',
          items: [
            { text: 'SrButton', link: '/components/button' },
            { text: 'SrInput', link: '/components/input' },
            { text: 'SrModal', link: '/components/modal' },
          ],
        },
      ],
    },

    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },

    search: { provider: 'local' },
  },
})
