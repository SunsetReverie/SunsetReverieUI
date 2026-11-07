import { defineConfig } from 'vitepress'

/**
 * 夕梦 UI 文档站
 *
 * 视觉风格与同品牌的框架文档站保持一致（纯色靛蓝、通栏毛玻璃导航、卡片式首页），
 * 主题定制集中在 .vitepress/theme/style.css，这里只管站点结构与文案。
 */
export default defineConfig({
  lang: 'zh-CN',
  title: '夕梦',
  titleTemplate: ':title · 夕梦 UI',
  description: 'SunsetReverie-UI —— Vue 3 / Nuxt 4 组件库，毛玻璃与扁平双风格',

  cleanUrls: true,
  lastUpdated: true,

  // 规划文档是内部材料（4900+ 行），不参与文档站渲染。
  // 它留在 docs/ 根目录供评审使用，README 的链接也指向那里。
  srcExclude: ['夕梦UI组件库开发规划.md'],

  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#3e3edc' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: '夕梦 UI' }],
    ['meta', { property: 'og:description', content: 'Vue 3 / Nuxt 4 组件库' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    /*
     * 导航只列**已写完**的页面。
     * 未写的先不放，否则点进去是 404 —— 宁可少一项，也不要死链。
     * 每写完一批，把对应项加回来。
     */
    nav: [
      { text: '指南', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: '组件', link: '/components/button', activeMatch: '/components/' },
      { text: 'Token 验证页', link: '/token-gallery.html' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [{ text: '快速开始', link: '/guide/getting-started' }],
        },
      ],
      '/components/': [
        {
          text: '开始',
          items: [{ text: '概览', link: '/components/' }],
        },
        {
          text: '基础',
          items: [
            { text: 'SrButton', link: '/components/button' },
            { text: 'SrInput', link: '/components/input' },
          ],
        },
        {
          text: '数据录入',
          items: [{ text: 'SrForm', link: '/components/form' }],
        },
        {
          text: '数据展示',
          items: [{ text: 'SrTable', link: '/components/table' }],
        },
        {
          text: '导航',
          items: [{ text: 'SrNav', link: '/components/nav' }],
        },
        {
          text: '反馈',
          items: [{ text: 'SrModal', link: '/components/modal' }],
        },
      ],
    },

    search: {
      provider: 'local',
      options: {
        // 中文需要按字切分，默认的分词器只按空格
        miniSearch: {
          options: {
            tokenize: (text: string) => text.split(/[\s\-_.，。！？、；：（）《》【】]+/u).filter(Boolean),
          },
        },
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索' },
          modal: {
            noResultsText: '没有找到结果',
            resetButtonTitle: '清除',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },

    outline: { level: [2, 3], label: '本页目录' },

    docFooter: { prev: '上一篇', next: '下一篇' },

    lastUpdated: {
      text: '最后更新',
      formatOptions: { dateStyle: 'medium' },
    },

    darkModeSwitchLabel: '主题',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',

    footer: {
      message: '以 MIT 许可发布 · 私有仓库 tag 分发',
      copyright: '日落时分的第一束稳定光',
    },
  },
})
