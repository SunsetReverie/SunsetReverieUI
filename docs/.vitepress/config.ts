import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

/**
 * 把相对路径解析成本文件所在目录起算的绝对路径
 * @param path 相对 `docs/.vitepress/` 的路径
 * @returns 绝对路径
 */
const resolvePath = (path: string): string => fileURLToPath(new URL(path, import.meta.url))

/**
 * 当前发布版本号，用于导航栏上的版本入口
 *
 * 唯一真源是 `packages/ui/package.json`：发版后重启 dev 或重新 build 即自动跟上，
 * 不要在文档站里另抄一份版本号。
 * @throws {Error} 文件缺失或内容不是合法 JSON 时抛出
 */
const UI_VERSION = (
  JSON.parse(readFileSync(resolvePath('../../packages/ui/package.json'), 'utf-8')) as {
    version: string
  }
).version

// 组件库的 token 挂在 [data-sr-theme] / [data-sr-style] 上，
// 这两个属性必须在首帧前写好，否则文档里的演示会先闪一下无样式状态
import { SR_THEME_INIT_SNIPPET } from '../../packages/ui/src/utils/theme-script'

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

  // 规划文档是内部材料，不参与文档站渲染。
  // 它们留在 docs/ 根目录供评审使用；正文里的 `{{...}}` 短代码示例
  // 会被 Vue 模板编译器当成插值，放进站点会直接构建失败。
  srcExclude: ['夕梦UI组件库开发规划.md', 'SrMarkdown组件规划.md'],

  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#3e3edc' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: '夕梦 UI' }],
    ['meta', { property: 'og:description', content: 'Vue 3 / Nuxt 4 组件库' }],
    ['script', {}, SR_THEME_INIT_SNIPPET],
  ],

  // 直连源码：文档里的演示渲染的就是当前代码，不需要先 build 库
  vite: {
    resolve: {
      alias: [
        {
          find: /^@sunset-reverie\/ui\/base\.css$/,
          replacement: resolvePath('../../packages/ui/src/styles/base/index.less'),
        },
        {
          find: /^@sunset-reverie\/ui\/style\.css$/,
          replacement: resolvePath('../../packages/ui/src/styles/index.less'),
        },
        {
          find: /^@sunset-reverie\/ui$/,
          replacement: resolvePath('../../packages/ui/src/index.ts'),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        less: { javascriptEnabled: true },
      },
    },
  },

  themeConfig: {
    logo: '/logo.svg',

    /*
     * 导航与侧边栏覆盖全部已写文档。新增组件文档时两项都要补，
     * `pnpm lint` 里的 check-docs 会比对侧边栏链接与 docs/components 下的文件。
     */
    nav: [
      { text: '指南', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: '组件', link: '/components/button', activeMatch: '/components/' },
      // 更新日志页在 docs 根目录，不进 guide 与 components 两个侧边栏。
      // 标题直接用版本号：点进去就是该版本的全部变更，比「更新日志」更快认出版本
      { text: `v${UI_VERSION}`, link: '/changelog', activeMatch: '/changelog' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '版本升级', link: '/guide/upgrading' },
            { text: '主题与 Token', link: '/guide/theming' },
            { text: '拖拽排序', link: '/guide/drag-sort' },
            { text: 'Markdown 渲染样式定制', link: '/guide/markdown-theming' },
          ],
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
            { text: 'SrTextarea', link: '/components/textarea' },
            { text: 'SrComment', link: '/components/comment' },
            { text: 'SrMusicPlayer', link: '/components/music-player' },
            { text: 'SrIcon', link: '/components/icon' },
            { text: 'SrSpinner', link: '/components/spinner' },
            { text: 'SrProgress', link: '/components/progress' },
            { text: 'SrStatistic', link: '/components/statistic' },
            { text: 'SrTile', link: '/components/tile' },
            { text: 'SrLoading', link: '/components/loading' },
          ],
        },
        {
          text: '布局与配置',
          items: [
            { text: 'SrRow', link: '/components/row' },
            { text: 'SrCol', link: '/components/col' },
            { text: 'SrConfigProvider', link: '/components/config-provider' },
            { text: 'SrTransition', link: '/components/transition' },
          ],
        },
        {
          text: '浮层',
          items: [{ text: 'SrTooltip', link: '/components/tooltip' }],
        },
        {
          text: '数据录入',
          items: [
            { text: 'SrForm', link: '/components/form' },
            { text: 'SrSelect', link: '/components/select' },
            { text: 'SrCascader', link: '/components/cascader' },
            { text: 'SrTransfer', link: '/components/transfer' },
            { text: 'SrColorPicker', link: '/components/color-picker' },
            { text: 'SrEmojiPicker', link: '/components/emoji-picker' },
            { text: 'SrQRCode', link: '/components/qrcode' },
            { text: 'SrCodeBlock', link: '/components/code-block' },
            { text: 'SrMarkdown', link: '/components/markdown' },
            { text: 'SrMarkdownEditor', link: '/components/markdown-editor' },
            { text: 'SrInputNumber', link: '/components/input-number' },
            { text: 'SrCheckbox', link: '/components/checkbox' },
            { text: 'SrRadio', link: '/components/radio' },
            { text: 'SrSwitch', link: '/components/switch' },
            { text: 'SrSlider', link: '/components/slider' },
            { text: 'SrDatePicker', link: '/components/date-picker' },
            { text: 'SrCalendar', link: '/components/calendar' },
          ],
        },
        {
          text: '数据展示',
          items: [
            { text: 'SrChart', link: '/components/chart' },
            { text: 'SrTable', link: '/components/table' },
            { text: 'SrPagination', link: '/components/pagination' },
            { text: 'SrLoadMore', link: '/components/load-more' },
            { text: 'SrUpload', link: '/components/upload' },
            { text: 'SrTree', link: '/components/tree' },
            { text: 'SrVirtualList', link: '/components/virtual-list' },
          ],
        },
        {
          text: '展示元素',
          items: [
            { text: 'SrTag', link: '/components/tag' },
            { text: 'SrAlert', link: '/components/alert' },
            { text: 'SrSteps', link: '/components/steps' },
            { text: 'SrDescriptions', link: '/components/descriptions' },
            { text: 'SrCollapse', link: '/components/collapse' },
            { text: 'SrSegmented', link: '/components/segmented' },
            { text: 'SrTimeline', link: '/components/timeline' },
            { text: 'SrBadge', link: '/components/badge' },
            { text: 'SrAvatar', link: '/components/avatar' },
            { text: 'SrImage', link: '/components/image' },
            { text: 'SrEmpty', link: '/components/empty' },
            { text: 'SrResult', link: '/components/result' },
            { text: 'SrSkeleton', link: '/components/skeleton' },
          ],
        },
        {
          text: '容器',
          items: [
            { text: 'SrCard', link: '/components/card' },
            { text: 'SrDivider', link: '/components/divider' },
            { text: 'SrSpace', link: '/components/space' },
            { text: 'SrPanel', link: '/components/panel' },
            { text: 'SrCarousel', link: '/components/carousel' },
          ],
        },
        {
          text: '导航',
          items: [
            { text: 'SrNav', link: '/components/nav' },
            { text: 'SrTabs', link: '/components/tabs' },
            { text: 'SrDropdown', link: '/components/dropdown' },
            { text: 'SrContextMenu', link: '/components/context-menu' },
            { text: 'SrBreadcrumb', link: '/components/breadcrumb' },
            { text: 'SrAnchor', link: '/components/anchor' },
          ],
        },
        {
          text: '反馈',
          items: [
            { text: 'SrModal', link: '/components/modal' },
            { text: 'SrDrawer', link: '/components/drawer' },
            { text: 'SrConfirm', link: '/components/confirm' },
          ],
        },
        {
          text: '全局提示',
          items: [
            { text: 'SrToast', link: '/components/toast' },
            { text: 'SrMessage', link: '/components/message' },
            { text: 'SrNotification', link: '/components/notification' },
          ],
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
