# 快速开始

夕梦 UI 不发布到公共 npm 源，按 tag 把每个包打成 tarball，挂在私有 Git 仓库的 Release 附件上分发。

## 能力概览

面向需要长期维护的中后台：组件不依赖第三方 UI 拼装，主题不靠覆盖选择器，升级时不要求业务方跟着改样式。

| 方面 | 现状 |
| --- | --- |
| 组件 | 69 个，按基础 / 表单 / 数据 / 展示 / 导航 / 反馈 / 布局与配置分组；每个都有独立文档，其中 68 个带演示页 |
| 主题 | 明暗 × 玻璃/扁平 × 品牌色 × 动效三档，全部由 CSS 变量驱动；组件里没有写死的颜色与时长 |
| Token | L1 原始色板 → L2 语义映射 → L3 组件级，`pnpm build:tokens` 一份源文件生成 CSS 与 TS 常量 |
| 分发 | 核心包运行时只依赖 `@iconify/vue`；支持全量引入、按需引入与 resolver 自动导入 |
| 框架 | Vue 3.4+、Nuxt 4 模块；SSR 首帧由内联脚本决定根属性，水合不闪白、不重排 |
| 质量 | 单测 + SSR 冒烟 + Nuxt 水合 e2e + 演示站全页冒烟 + 布局与水合告警守卫 + 视觉基线；新增组件漏测会被 lint 拦下 |

组件索引见[组件概览](/components/)，主题与 Token 的细节见[主题与 Token](/guide/theming)。

## 安装

按 tag 把每个包打成一个 tarball 挂 Release，装法与装普通包完全一致，npm 与 pnpm 命令相同：

```bash
# 只装核心库：把 <Git 地址> 与 <版本> 换成实际值（当前为 1.0.0-beta.1）
npm i https://<Git 地址>/releases/download/v<版本>/sunset-reverie-ui-<版本>.tgz

# pnpm 写法相同
pnpm add https://<Git 地址>/releases/download/v<版本>/sunset-reverie-ui-<版本>.tgz
```

> 注意是 **tarball URL**，不是 `git+https://...#tag`。Git 依赖装的是仓库根（`sunsetreverie-ui@0.0.0` 私有壳），而 `dist` 不进版本库，装下来既没有入口也没有产物；tarball 里是标准包结构（`dist` + `exports` + 类型声明），所以 npm 装它能直接用。
>
> 用 Nuxt 模块或按需解析器的，要把对应附件一起装，四个包同版本、不能混用。`@sunset-reverie/nuxt` 的 `peerDependencies` 里有 `@sunset-reverie/ui`，单独装它会去 npm 源找 `ui` 而失败，所以必须同一条命令带上：
>
> ```bash
> npm i \
>   https://<Git 地址>/releases/download/v<版本>/sunset-reverie-ui-<版本>.tgz \
>   https://<Git 地址>/releases/download/v<版本>/sunset-reverie-nuxt-<版本>.tgz \
>   https://<Git 地址>/releases/download/v<版本>/sunset-reverie-resolver-<版本>.tgz
> ```
>
> 升级与回滚同样只换 URL 里的 `<版本>`，见[版本升级](/guide/upgrading)。

`@sunset-reverie/ui` 的运行时依赖只有 `@iconify/vue`；图标数据在构建时已内联进产物，不需要额外安装图标包。

## 在 Vite 项目中使用

```ts
// main.ts
import { createApp } from 'vue'
import { useSrTheme } from '@sunset-reverie/ui'
import '@sunset-reverie/ui/style.css'

import App from './App.vue'

useSrTheme().init()
createApp(App).mount('#app')
```

组件**不需要全局注册**，在 SFC 里按需 import 即可，未用到的组件不会进包：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrInput } from '@sunset-reverie/ui'

const keyword = ref('')
</script>

<template>
  <SrInput v-model="keyword" placeholder="搜索组件" />
  <SrButton variant="primary">查询</SrButton>
</template>
```

样式分两层，按引入方式选一个：

```ts
// 全量：变量层 + 69 个组件样式，最省心
import '@sunset-reverie/ui/style.css'

// 按需：只引变量层，组件样式随组件单独引入（顺序必须是 base 在前）
import '@sunset-reverie/ui/base.css'
import '@sunset-reverie/ui/components/button/style.css'
```

**防闪烁**：`index.html` 的 `<head>` 最前面插入初始化脚本，它会在首次绘制前决定明暗与风格：

```html
<script>
  // 从 `SR_THEME_INIT_SNIPPET` 复制，或直接用下面这份等价代码
  ;(function () {
    try {
      var d = document.documentElement
      var m = localStorage.getItem('sr-theme') || 'auto'
      var s = localStorage.getItem('sr-style') || 'flat'
      var dark = m === 'dark' || (m === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches)
      d.setAttribute('data-sr-theme', dark ? 'dark' : 'light')
      d.setAttribute('data-sr-style', s === 'glass' ? 'glass' : 'flat')
      d.style.colorScheme = dark ? 'dark' : 'light'
    } catch (e) {}
  })()
</script>
```

也可以直接引用库导出的字符串，避免手抄：

```ts
import { SR_THEME_INIT_SNIPPET } from '@sunset-reverie/ui'
```

## 全局配置

`SrConfigProvider` 只下发上下文、不渲染额外 DOM，适合放在应用根部统一组件尺寸与弹层层级：

```vue
<script setup lang="ts">
import { SrConfigProvider } from '@sunset-reverie/ui'
</script>

<template>
  <SrConfigProvider size="sm" :z-index="2000">
    <RouterView />
  </SrConfigProvider>
</template>
```

| 配置 | 类型 | 说明 |
| --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | 子组件默认尺寸；局部可以再套一层覆盖 |
| `zIndex` | `number` | 弹层层级基数，Modal / Dropdown / Tooltip 在其上叠加 |

## TypeScript

包内类型随源码一起发布，不需要装额外的 `@types`：

- Props 由 `ExtractPropTypes` 推导，模板里写错值或漏传必填项会直接报错；
- 事件与插槽用 `defineEmits` / `defineSlots` 声明，Volar 里能拿到参数补全；
- 常用数据结构（`SrTableColumn`、`SrSelectOption`、`SrEmojiPackage` 等）都从包入口导出，可直接标注接口。

## 在 Nuxt 4 中使用

**接入只需要两行配置**：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@sunset-reverie/nuxt'],
  sunsetReverie: {
    defaultTheme: 'auto',
    defaultStyle: 'flat',
  },
})
```

模块会自动完成四件事：

| 动作 | 说明 |
| --- | --- |
| 注入样式 | 把 `style.css` 插到 `css` 数组最前，保证变量层先于业务样式 |
| 注册组件 | 扫描组件目录批量 `addComponent`，构建期按需打包 |
| 自动导入 | `useSrTheme` / `useSrBreakpoint` / `useSrConfig` / `srToast` |
| 防闪烁 | 注入内联脚本并设置 `<html>` 初始属性 |

### 模块选项

| 选项 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `prefix` | `string` | `'Sr'` | 组件名前缀 |
| `injectComponentStyle` | `boolean` | `true` | 注入全量组件样式 |
| `injectBaseStyle` | `boolean` | `true` | 仅当关闭上一项时生效，注入变量层 |
| `injectThemeScript` | `boolean` | `true` | 注入 SSR 防闪烁脚本 |
| `defaultTheme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | 服务端输出的默认明暗 |
| `defaultStyle` | `'flat' \| 'glass'` | `'flat'` | 服务端输出的默认质感 |
| `autoImports` | `boolean` | `true` | 注册组合式函数到自动导入 |

## 按需引入

```ts
import { SrButton } from '@sunset-reverie/ui/button'
import '@sunset-reverie/ui/components/button/style.css'
```

或用 resolver 自动完成：

```ts
// vite.config.ts
import { SunsetReverieResolver } from '@sunset-reverie/resolver'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [Components({ resolvers: [SunsetReverieResolver()] })],
})
```

`SunsetReverieResolver` 的 `importStyle` 默认 `'css'`，直接用编译好的样式，下游不需要 Less。`'less'` 会去引 `.less` 源码，而 tarball 里只有 `dist`，所以那个选项仅在本地 `link:` 联调时有效；要改主题请用 CSS 变量覆盖，见[主题与 Token](/guide/theming)。

## 下一步

- [组件概览](/components/) —— 69 个组件按分组索引，先看全貌再挑
- [版本升级](/guide/upgrading) —— 从旧 tag 换到新版本，BREAKING 怎么看、怎么回滚
- [主题与 Token](/guide/theming) —— 明暗 / 质感 / 品牌色 / 动效怎么切、怎么扩展
- [拖拽排序](/guide/drag-sort) —— 表格、树、看板共用的拖拽能力
- [Markdown 渲染样式定制](/guide/markdown-theming) —— 阅读区排版与代码高亮
