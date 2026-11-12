<div align="center">

# SunsetReverie-UI（夕梦 UI）

**中后台组件库 —— 71 个组件，纯 CSS 变量驱动的双风格主题**

[![Vue](https://img.shields.io/badge/Vue-3.4%2B-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?logo=nuxtdotjs&logoColor=white)](https://nuxt.com/)
[![Version](https://img.shields.io/badge/version-1.0.0--beta.4-blue)](CHANGELOG.md)
[![Components](https://img.shields.io/badge/组件-71-4F7CFF)](docs/components/index.md)
[![Bundle](https://img.shields.io/badge/全量-312KB%20gzip-informational)](scripts/check-size.mjs)
[![Tests](https://img.shields.io/badge/tests-1280%20passing-brightgreen)](packages/ui/src)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Docs](https://img.shields.io/badge/文档-在线站点-3e3edc)](https://sunsetreverie.github.io/SunsetReverieUI/)

三层 Token · 明暗 × 玻璃/扁平 × 品牌色 · SSR 首帧不闪白 · 图表与地图不装第三方引擎

</div>

```bash
# 装核心库：走 Release 附件的 tarball，不是 npm 包
npm i https://github.com/SunsetReverie/SunsetReverieUI/releases/download/v1.0.0-beta.4/sunset-reverie-ui-1.0.0-beta.4.tgz
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrInput } from '@sunset-reverie/ui'

const keyword = ref('')
</script>

<template>
  <SrInput v-model="keyword" placeholder="搜索" />
  <SrButton variant="primary">查询</SrButton>
</template>
```

> 不发布到公共 npm 源：按 tag 把包打成 tarball 挂在 Release，GitHub 与 [Gitee](https://gitee.com/SunsetReverie/sunset-reverie-ui) 双镜像。
> 完整接入步骤见[快速开始](https://sunsetreverie.github.io/SunsetReverieUI/guide/getting-started)。

---

## 目录

- [它解决什么问题](#它解决什么问题)
- [快速开始](#快速开始)
- [核心特性](#核心特性)
- [组件一览](#组件一览)
- [图标](#图标)
- [本地开发](#本地开发)
- [刻意不做的事](#刻意不做的事)
- [文档](#文档)

---

## 它解决什么问题

### 主题不该靠覆盖选择器

多数组件库换肤的终点是满屏 `!important` 覆盖，升级一次就要重新对一遍选择器。

这里的颜色走三层 Token：L1 原始色板 → L2 语义映射 → L3 组件级，全部落在 CSS 变量上。换品牌色只改中间一层，组件样式一行不动：

```css
[data-sr-brand='violet'] {
  --sr-color-primary: #7c5cff;
}
```

明暗、玻璃/扁平、品牌色、动效档位是四个正交维度，任意组合都能成立，不用重新构建样式。

### SSR 首帧不该闪一下

主题初始化脚本内联在 `<head>` 最前面，在首次绘制前就把 `data-sr-theme` / `data-sr-style` 写到 `<html>` 上。服务端渲染产出确定值，客户端接管时不需要重算——水合测试断言告警数为 0。

### 三张图不该装一个图表引擎

`SrChart`（折线 / 柱状 / 面积 / 饼图）与 `SrChinaMap`（省级地图）都是纯 SVG：没有 canvas、没有第三方图表库，颜色直接吃主题变量，换肤时图表跟着变。

地图数据 99KB gzip，做成独立子路径——不用地图的项目一个字节都不下载。

---

## 快速开始

### Vue 3 + Vite

```bash
# 核心库（把版本号换成需要的版本）
npm i https://github.com/SunsetReverie/SunsetReverieUI/releases/download/v1.0.0-beta.4/sunset-reverie-ui-1.0.0-beta.4.tgz

# 想要模板里直接写标签（自动导入）时再加这两个
npm i -D @sunset-reverie/resolver unplugin-vue-components
```

```ts
// main.ts
import { createApp } from 'vue'
import { useSrTheme } from '@sunset-reverie/ui'
import '@sunset-reverie/ui/style.css'

useSrTheme().init()
createApp(App).mount('#app')
```

组件在 SFC 里按需 import，未用到的不会进包。想让模板里直接写 `<SrButton>`，配 `SunsetReverieResolver()` 即可，详见[自动导入](https://sunsetreverie.github.io/SunsetReverieUI/guide/getting-started#自动导入)。

### Nuxt 4

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@sunset-reverie/nuxt'],
})
```

组件注册、样式注入、组合式函数自动导入、防闪烁脚本由模块一次做完。Nuxt 项目需要把核心库与 `@sunset-reverie/nuxt` 一起装（同版本）。

---

## 核心特性

| 能力 | 说明 |
| --- | --- |
| **71 个组件** | 基础 / 表单 / 数据 / 展示 / 导航 / 反馈 / 布局，每个都有独立文档与在线演示 |
| **三层 Token** | 一份源文件生成 CSS 变量与 TS 常量，主题不靠选择器覆盖 |
| **四维主题** | 明暗 × 玻璃/扁平 × 品牌色 × 动效档位，全部 CSS 变量驱动 |
| **SSR 就绪** | 首帧前定主题，水合 0 告警；全部组件通过 node 环境渲染测试 |
| **按需引入** | 每个组件独立入口与独立样式；resolver 自动导入，Nuxt 模块批量注册 |
| **轻运行时** | 只依赖 `@iconify/vue`，图标编译期子集化进产物，运行时不发请求 |
| **纯 SVG 图表** | 折线 / 柱状 / 面积 / 饼图 + 中国省级地图，无第三方图表库 |
| **体积守卫** | `pnpm size` 全量 311KB / 按需最重 68KB（gzip），超预算直接失败 |
| **回归守卫** | 1271 个单测、SSR 冒烟、水合 e2e、视觉基线、布局与文档校验 |

---

## 组件一览

| 分类 | 组件 |
| --- | --- |
| 基础 | `SrButton` `SrIcon` `SrInput` `SrTextarea` `SrSpinner` `SrProgress` `SrStatistic` `SrTile` `SrLoading` `SrComment` `SrMusicPlayer` |
| 布局与配置 | `SrRow` `SrCol` `SrConfigProvider` `SrTransition` |
| 容器 | `SrCard` `SrDivider` `SrSpace` `SrPanel` `SrCarousel` |
| 数据录入 | `SrForm` `SrSelect` `SrCascader` `SrTransfer` `SrColorPicker` `SrEmojiPicker` `SrQRCode` `SrCodeBlock` `SrMarkdown` `SrMarkdownEditor` `SrInputNumber` `SrCheckbox` `SrRadio` `SrSwitch` `SrSlider` `SrDatePicker` `SrCalendar` `SrUpload` |
| 数据展示 | `SrChart` `SrChinaMap` `SrTable` `SrPagination` `SrLoadMore` `SrTree` `SrVirtualList` |
| 展示元素 | `SrTag` `SrAlert` `SrSteps` `SrDescriptions` `SrCollapse` `SrSegmented` `SrTimeline` `SrBadge` `SrAvatar` `SrImage` `SrEmpty` `SrResult` `SrSkeleton` |
| 导航 | `SrNav` `SrTabs` `SrDropdown` `SrContextMenu` `SrBreadcrumb` `SrAnchor` |
| 浮层与反馈 | `SrTooltip` `SrModal` `SrDrawer` `SrConfirm` |
| 全局提示 | `SrToast` `SrMessage` `SrNotification` |

完整索引与在线演示：[组件概览](https://sunsetreverie.github.io/SunsetReverieUI/components/)

---

## 图标

核心库内联了 **86 个常用图标**（搜索、关闭、勾选、加载等），装完即用。

需要其它 Lucide 图标（共 2100 个）时，装配套图标包并在入口注册一次：

```ts
import { srRegisterIcons } from '@sunset-reverie/ui'
import { LUCIDE_FULL } from '@sunset-reverie/icons/lucide-full'

srRegisterIcons({ lucide: LUCIDE_FULL })
```

全量数据 gzip 约 99KB，只有显式 import 的项目才付出这份体积；注册后运行时不发任何网络请求。下载安装细节见[扩展图标](https://sunsetreverie.github.io/SunsetReverieUI/guide/icons)。

---

## 本地开发

```bash
pnpm install
pnpm build      # tokens → icons → ui → resolver → nuxt
pnpm docs:dev   # 文档站 http://localhost:5173
```

| 命令 | 说明 |
| --- | --- |
| `pnpm build` | 全量构建，产物在 `packages/*/dist` |
| `pnpm dev` | 演示站（本地 playground，直连源码） |
| `pnpm test` | 单元测试（Vitest，1271 条） |
| `pnpm typecheck` | `vue-tsc` 类型检查 |
| `pnpm lint` | ESLint + Stylelint + 模板 / 文档 / CSS 变量校验 |
| `pnpm size` | 体积报告与预算守卫 |
| `pnpm verify:dist` | 产物完整性（exports / 组件三件套 / 清单一致性） |
| `pnpm release:pack` | 发版：四个包各打一个 tarball 到 `release/` |
| `pnpm gen:components` | 新增组件后同步 resolver / nuxt 清单 |
| `pnpm gen:icons:full` | 重新生成 Lucide 全量集合 |
| `pnpm gen:china-map` | 重新生成中国地图边界数据 |
| `pnpm docs:build` | 构建文档站（`DOCS_BASE=/SunsetReverieUI/` 时带 Pages 前缀） |

代码约定：组件 `Sr` + PascalCase、标签 `sr-` + kebab、CSS 变量 `--sr-*`、类名 BEM + `sr-` 前缀、组合式函数 `useSr*`。提交信息 `<type>(<scope>): <subject>`，scope 见 `commitlint.config.js`。

演示站、视觉基线与 e2e 只在本地保留，不进远程仓库；发版由 `.github/workflows/release.yml` 在打 tag 时自动构建并上传 Release 附件，文档站由 `.github/workflows/docs.yml` 部署到 GitHub Pages。

---

## 刻意不做的事

- **不做全局注册插件**：`app.use(SrUI)` 会把 71 个组件全打进包，按需 import 与自动导入已经够省事；
- **不做 JS 主题计算**：主题状态用 CSS 变量表达，避免运行时重渲染；
- **不把图标全量塞进主包**：99KB 的图标数据放在独立子路径，用得到再装；
- **不改写原生交互**：表单控件基于原生元素，键盘与无障碍行为来自浏览器而不是自己模拟；
- **不追新框架版本**：只承诺 Vue 3.4+ 与 Nuxt 4.x，不为每个 beta 版本适配。

---

## 文档

- **在线文档**：<https://sunsetreverie.github.io/SunsetReverieUI/>
- **更新日志**：[CHANGELOG.md](./CHANGELOG.md)（文档站[同页](https://sunsetreverie.github.io/SunsetReverieUI/changelog)）
- **仓库**：[GitHub](https://github.com/SunsetReverie/SunsetReverieUI) · [Gitee](https://gitee.com/SunsetReverie/sunset-reverie-ui)

个人维护的项目，按需发版；`1.x` 起破坏性变更只进 MAJOR，预发布版不保证互相兼容，请锁具体版本号。
