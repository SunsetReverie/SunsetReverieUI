# 快速开始

夕梦 UI 不发布到公共 npm 源，按 tag 把每个包打成 tarball，挂在私有 Git 仓库的 Release 附件上分发。

## 能力概览

面向需要长期维护的中后台：组件不依赖第三方 UI 拼装，主题不靠覆盖选择器，升级时不要求业务方跟着改样式。

| 方面 | 现状 |
| --- | --- |
| 组件 | 71 个，按基础 / 表单 / 数据 / 展示 / 导航 / 反馈 / 布局与配置分组；每个都有独立文档，其中 70 个带演示页 |
| 主题 | 明暗 × 玻璃/扁平 × 品牌色 × 动效三档，全部由 CSS 变量驱动；组件里没有写死的颜色与时长 |
| Token | L1 原始色板 → L2 语义映射 → L3 组件级，`pnpm build:tokens` 一份源文件生成 CSS 与 TS 常量 |
| 分发 | 核心包运行时只依赖 `@iconify/vue`；支持全量引入、按需引入与 resolver 自动导入 |
| 框架 | Vue 3.4+、Nuxt 4 模块；SSR 首帧由内联脚本决定根属性，水合不闪白、不重排 |
| 质量 | 单测 + SSR 冒烟 + Nuxt 水合 e2e + 演示站全页冒烟 + 布局与水合告警守卫 + 视觉基线；新增组件漏测会被 lint 拦下 |

组件索引见[组件概览](/components/)，主题与 Token 的细节见[主题与 Token](/guide/theming)。

## 安装

发布物是 Release 附件里的 tarball，两个仓库镜像内容一致，选一个快的即可：

| 镜像 | 地址 |
| --- | --- |
| GitHub | `github.com/SunsetReverie/SunsetReverieUI` |
| Gitee | `gitee.com/SunsetReverie/sunset-reverie-ui` |

npm 与 pnpm 命令相同，把 `<版本>` 换成实际版本号（当前 `1.0.0-beta.5`）：

```bash
# GitHub
npm i https://github.com/SunsetReverie/SunsetReverieUI/releases/download/v<版本>/sunset-reverie-ui-<版本>.tgz

# Gitee 镜像（文件名相同，国内通常更快）
npm i https://gitee.com/SunsetReverie/sunset-reverie-ui/releases/download/v<版本>/sunset-reverie-ui-<版本>.tgz
```

> 注意是 **tarball URL**，不是 `git+https://...#tag`。Git 依赖装的是仓库根（`sunsetreverie-ui@0.0.0` 私有壳），而 `dist` 不进版本库，装下来既没有入口也没有产物；tarball 里是标准包结构（`dist` + `exports` + 类型声明），所以 npm 装它能直接用。
>
> 用 Nuxt 模块或按需解析器的，要把对应附件一起装，四个包同版本、不能混用。`@sunset-reverie/nuxt` 的 `peerDependencies` 里有 `@sunset-reverie/ui`，单独装它会去 npm 源找 `ui` 而失败，所以必须同一条命令带上：
>
> ```bash
> npm i \
>   https://github.com/SunsetReverie/SunsetReverieUI/releases/download/v<版本>/sunset-reverie-ui-<版本>.tgz \
>   https://github.com/SunsetReverie/SunsetReverieUI/releases/download/v<版本>/sunset-reverie-nuxt-<版本>.tgz \
>   https://github.com/SunsetReverie/SunsetReverieUI/releases/download/v<版本>/sunset-reverie-resolver-<版本>.tgz
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

组件**不需要全局注册**，在 SFC 里按需 import 即可，未用到的组件不会进包（想让模板里直接写标签、连 import 都省掉，见下文「自动导入」）：

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
// 全量：变量层 + 71 个组件样式，最省心
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
| 自动导入 | 组件与 7 个函数：`useSrTheme` / `useSrBreakpoint` / `useSrConfig` / `srToast` / `srConfirm` / `srMessage` / `srNotification` |
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

## 自动导入

自动导入分两块能力，支持程度不一样：

| 能力 | Vue 3 + Vite | Nuxt 4 |
| --- | --- | --- |
| 组件（模板里直接写 `<SrButton>`） | 支持，需 `unplugin-vue-components` + resolver | 支持，装模块即可 |
| 组合式函数（`useSrTheme` 等 7 个） | 支持，resolver 提供 preset，另装 `unplugin-auto-import` | 支持，模块已注册 |

### Vue 3 + Vite

先装解析器与插件（resolver 不把它们列为依赖，需要使用者自备）：

```bash
# 组件自动导入
npm i -D @sunset-reverie/resolver unplugin-vue-components
# 想让 useSrTheme 这类函数也免 import，再加这一个
npm i -D unplugin-auto-import
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { SunsetReverieResolver } from '@sunset-reverie/resolver'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [SunsetReverieResolver()],
      // 生成的组件类型声明，建议提交仓库，Volar 才能补全标签与 props
      dts: 'src/components.d.ts',
    }),
  ],
})
```

配好之后模板里直接写标签，插件会自动补成按需导入，连样式一起带上：

```vue
<template>
  <!-- 等价于 import { SrButton } from '@sunset-reverie/ui/button' -->
  <!-- 外加 base.css 与 components/button/style.css 两条副作用导入 -->
  <SrButton variant="primary">提交</SrButton>
</template>
```

`base.css` 只在解析到第一个组件时注入一次，后面的组件只带自己的 `style.css`；`importStyle` 默认 `'css'`，所以不需要再手动引 `style.css`。

组合式函数要一起自动导入，再加一个 `unplugin-auto-import`。resolver 自带 preset，不用手抄名字：

```ts
// vite.config.ts 的 plugins 里追加
import AutoImport from 'unplugin-auto-import/vite'
import { SunsetReverieAutoImport } from '@sunset-reverie/resolver'

AutoImport({
  // 自定义 preset 放在 imports 数组里（packagePresets 是另一种按包名解析的用法）
  imports: [SunsetReverieAutoImport()],
  dts: 'src/auto-imports.d.ts',
})
```

`SunsetReverieAutoImport()` 展开就是下面这个 preset（与 Nuxt 模块注册的同一批导出）：

```ts
{
  from: '@sunset-reverie/ui',
  imports: ['useSrTheme', 'useSrBreakpoint', 'useSrConfig', 'srToast', 'srConfirm', 'srMessage', 'srNotification'],
}
```

只要三个 `useSr*` 组合式函数、不想要全局挂命令式 API 时，传参关掉：

```ts
imports: [SunsetReverieAutoImport({ includeApis: false })]
```

配好之后，`<script setup>` 里直接调用即可，不需要 import：

```vue
<script setup lang="ts">
const theme = useSrTheme()     // 自动导入
const copy = () => srToast.success('已复制')  // 自动导入
</script>
```

### Nuxt 4

装模块就同时拿到组件与函数的自动导入，不需要 `unplugin-vue-components`：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@sunset-reverie/nuxt'],
})
```

- **组件**：模块批量 `addComponent`，模板里直接写 `<SrButton>`，构建期按需打包，未用到的组件不进产物；
- **组合式函数**：`useSrTheme` / `useSrBreakpoint` / `useSrConfig` / `srToast` / `srConfirm` / `srMessage` / `srNotification` 直接调用，不需要 import；
- 如果团队规范要求显式 import，把 `sunsetReverie.autoImports` 设为 `false` 即可关闭函数自动导入。

### 使用注意

- 自动导入只处理**模板标签**。`<script setup>` 里要用组件变量（存进 `ref`、动态组件 `:is`、`h()` 渲染）时，仍然要显式 import。
- `dts` 指定的类型声明文件没生成时，Volar 会报「找不到 SrButton」；重新跑一次 dev server 或重启 TS Server 即可。
- 标签大小写都识别（`<SrButton>` / `<sr-button>`），推荐 PascalCase，与文档和类型声明保持一致。
- 自定义 preset 要放进 `imports` 数组（`imports: [SunsetReverieAutoImport()]`）。写成 `presets` 不会报错，但插件只提示 "no imports has defined"，函数自动导入静默失效——这是实测踩过的坑。
- 项目 `package.json` 没有 `"type": "module"` 时，vite 会把配置按 CJS 打包，引入 ESM-only 的 `@sunset-reverie/resolver` 会报 `This package is ESM only but it was tried to load by require`；把配置文件改成 `vite.config.mts`，或给 `package.json` 加 `"type": "module"` 即可。

## 下一步

- [组件概览](/components/) —— 71 个组件按分组索引，先看全貌再挑
- [版本升级](/guide/upgrading) —— 从旧 tag 换到新版本，BREAKING 怎么看、怎么回滚
- [主题与 Token](/guide/theming) —— 明暗 / 质感 / 品牌色 / 动效怎么切、怎么扩展
- [拖拽排序](/guide/drag-sort) —— 表格、树、看板共用的拖拽能力
- [Markdown 渲染样式定制](/guide/markdown-theming) —— 阅读区排版与代码高亮
