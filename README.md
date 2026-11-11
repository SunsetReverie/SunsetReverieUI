# SunsetReverie-UI（夕梦 UI）

面向中后台的 Vue 3 / Nuxt 4 组件库：**71 个组件**，三层 Token 驱动主题，玻璃拟态与扁平双风格可切，SSR 首帧不闪白。

不发布到公共 npm 源，按 tag 把四个包打成 tarball，挂在 Release 附件上分发。

| 项 | 说明 |
| --- | --- |
| 版本 | `v1.0.0-beta.2`，逐版本条目见 [CHANGELOG](./CHANGELOG.md) |
| 运行时 | Vue 3.4+ · Nuxt 4.x |
| 工具链 | TypeScript · Less · Vite（库模式）· pnpm monorepo |
| 体积 | 全量 310.7KB（gzip，含 CSS）· 按需最重 67.4KB |
| 仓库 | [GitHub](https://github.com/SunsetReverie/SunsetReverieUI) · [Gitee](https://gitee.com/SunsetReverie/sunset-reverie-ui) |

## 特性

- **71 个组件**：基础 / 表单 / 数据 / 展示 / 导航 / 反馈 / 布局，每个都有独立文档与演示
- **三层 Token**：L1 原始值 → L2 语义 → L3 组件级，`pnpm build:tokens` 一份源文件同时生成 CSS 与 TS 常量
- **四维主题**：明暗 × 玻璃/扁平 × 品牌色 × 动效档位，全部由 CSS 变量驱动，切换不重建样式
- **SSR 就绪**：内联脚本在首帧前定下主题，水合 0 告警；全部组件都有 node 环境渲染测试
- **按需引入**：每个组件独立入口与独立样式，`@sunset-reverie/resolver` 支持 unplugin 自动导入，Nuxt 模块批量注册
- **轻依赖**：运行时只依赖 `@iconify/vue`，图标在编译期子集化进产物，运行时不发请求
- **图表与地图**：`SrChart`（折线/柱状/面积/饼图）与 `SrChinaMap`（省级分级着色/气泡），纯 SVG，无第三方图表库

## 安装

发布物是 Release 附件里的 tarball，两个镜像内容一致，npm 与 pnpm 命令相同：

```bash
# 把 <版本> 换成实际版本号（当前 1.0.0-beta.2）
npm i https://github.com/SunsetReverie/SunsetReverieUI/releases/download/v<版本>/sunset-reverie-ui-<版本>.tgz

# Gitee 镜像（文件名相同）
npm i https://gitee.com/SunsetReverie/sunset-reverie-ui/releases/download/v<版本>/sunset-reverie-ui-<版本>.tgz
```

用的是 **tarball URL**，不是 `git+https://...#tag`：Git 依赖装到的是 monorepo 根壳（`sunsetreverie-ui@0.0.0`，无入口），而 `dist` 不进版本库，装下来没有产物。

用到 Nuxt 模块或按需解析器时，四个包要一起装（版本必须一致）：

```bash
npm i \
  https://github.com/SunsetReverie/SunsetReverieUI/releases/download/v<版本>/sunset-reverie-ui-<版本>.tgz \
  https://github.com/SunsetReverie/SunsetReverieUI/releases/download/v<版本>/sunset-reverie-nuxt-<版本>.tgz \
  https://github.com/SunsetReverie/SunsetReverieUI/releases/download/v<版本>/sunset-reverie-resolver-<版本>.tgz
```

## 使用

Vue 3 项目：

```ts
// main.ts
import { createApp } from 'vue'
import { useSrTheme } from '@sunset-reverie/ui'
import '@sunset-reverie/ui/style.css'

import App from './App.vue'

useSrTheme().init()
createApp(App).mount('#app')
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

Nuxt 4 项目只要两行：

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@sunset-reverie/nuxt'],
})
```

组件、样式、组合式函数自动导入与防闪烁脚本都由模块处理，模板里直接写 `<SrButton>`。

按需引入、自动导入、主题定制、地图与图表的完整用法见文档站：`pnpm docs:dev` 本地预览。

## 仓库结构

```
packages/
├── ui/          # @sunset-reverie/ui        核心组件库（71 个组件）
├── icons/       # @sunset-reverie/icons     Iconify 封装与离线图标子集
├── resolver/    # @sunset-reverie/resolver  按需引入解析器 + 自动导入 preset
└── nuxt/        # @sunset-reverie/nuxt      Nuxt Module
internal/tokens/ # Token 唯一手写源与代码生成
docs/            # VitePress 文档站
scripts/         # 命名 / 图标 / 产物 / 变量 / 文档 / 体积 / 地图数据校验与生成
```

演示站（`playground-vue3`、`playground-nuxt4`）、视觉基线与 e2e 只在本地保留，不进远程仓库。

## 本地开发

环境要求：Node >= 20.11，pnpm >= 9。

```bash
pnpm install
pnpm build       # tokens → icons → ui → resolver → nuxt
pnpm dev         # 演示站（直连源码，HMR）
```

| 命令 | 说明 |
| --- | --- |
| `pnpm build` | 全量构建，产物在 `packages/*/dist` |
| `pnpm dev` | 演示站（Vite，本地 playground） |
| `pnpm test` | 单元测试（Vitest，1267 条） |
| `pnpm typecheck` | `vue-tsc` 类型检查 |
| `pnpm lint` | ESLint + Stylelint + 模板标签 / 文档 / CSS 变量校验 |
| `pnpm size` | 全量与按需产物体积报告，超预算非零退出 |
| `pnpm verify:dist` | 产物完整性（exports / 组件三件套 / 清单一致性） |
| `pnpm release:pack` | 发版：四个包各打一个 tarball 到 `release/` |
| `pnpm gen:components` | 新增组件后同步 resolver / nuxt 的组件清单 |
| `pnpm gen:china-map` | 重新生成中国地图边界数据 |
| `pnpm --filter @sunset-reverie/docs dev` | 启动文档站 |
| `pnpm --filter @sunset-reverie/docs build` | 构建文档站 |

## 约定

| 对象 | 规范 | 示例 |
| --- | --- | --- |
| 组件 | `Sr` + PascalCase | `SrButton` |
| 标签 | `sr-` + kebab | `<sr-button>` |
| CSS 变量 | `--sr-*` | `--sr-color-primary` |
| Less 变量 / mixin | `@sr-*` / `.sr-*()` | `@sr-radius-base` |
| 类名 | BEM + `sr-` 前缀 | `.sr-button__icon` |
| 组合式函数 | `useSr*` | `useSrTheme` |
| 根属性 | `data-sr-*` | `data-sr-theme` |

提交信息遵循 `<type>(<scope>): <subject>`，`scope` 见 `commitlint.config.js` 白名单，`subject` 用中文、不超过 50 字。`pre-commit` 跑 lint-staged 与命名校验，`commit-msg` 跑 commitlint。

## 分发与版本

- 版本号用 SemVer，四个包在 changesets 的 `fixed` 组里，永远同版本发布；`1.x` 起破坏性变更只进 MAJOR
- 发版流程：`pnpm changeset` → `pnpm version-packages` → `pnpm build` → `pnpm release:pack` → 打 tag → 建 Release 上传 `release/` 下四个 tgz
- 打 tag 后 GitHub Actions 会自动构建并创建 Release（见 `.github/workflows/release.yml`），Gitee 镜像手动上传同一批附件
- 下游升级方式是替换依赖 URL 里的版本号，`npm update` 不会动它；回滚同理

## 文档

文档站源码在 `docs/`（VitePress）。`docs/components/` 每篇对应一个组件，Props / 事件 / 插槽表由脚本与源码比对，不允许与代码脱节。
