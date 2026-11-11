# 扩展图标

核心库 `@sunset-reverie/ui` 已经内联了 **86 个常用图标**（离线子集），装完就能用，不需要额外依赖。但如果业务里要用到别的图标（Lucide 共 2100 个），装配套的图标包、在入口注册一次即可，**运行时不发网络请求**。

| 场景 | 需要装图标包吗 |
| --- | --- |
| 只用核心库自带的 86 个（搜索、关闭、勾选、加载等） | 不需要 |
| 要用任意 Lucide 图标（如 `lucide:zap`、`lucide:database`） | 需要，见下文 |
| 想用其它图标集（Tabler、MDI…） | 需要，但当前包只预置了 Lucide 全量 |

## 一、下载与安装图标包

图标包叫 `@sunset-reverie/icons`，和核心库同版本发布，产物是 Release 附件 `sunset-reverie-icons-<版本>.tgz`。

和核心库一样，**用 Release 的 tarball 地址安装**，不要用 `git+https://...#tag`：

```bash
# GitHub（把 <版本> 换成实际版本号，当前 1.0.0-beta.2）
npm i https://github.com/SunsetReverie/SunsetReverieUI/releases/download/v<版本>/sunset-reverie-icons-<版本>.tgz

# Gitee 镜像，文件名相同
npm i https://gitee.com/SunsetReverie/sunset-reverie-ui/releases/download/v<版本>/sunset-reverie-icons-<版本>.tgz
```

也可以直接去 Release 页面把 `sunset-reverie-icons-1.0.0-beta.2.tgz` 下载到本地，再 `npm i ./sunset-reverie-icons-1.0.0-beta.2.tgz`。

> 版本必须与 `@sunset-reverie/ui` **一致**。四个包在 changesets 的 `fixed` 组里，永远同版本发布；混用会在类型与运行时行为上出现难以排查的差异。

安装完成后检查一下依赖：

```json
{
  "dependencies": {
    "@sunset-reverie/ui": "https://.../sunset-reverie-ui-1.0.0-beta.2.tgz",
    "@sunset-reverie/icons": "https://.../sunset-reverie-icons-1.0.0-beta.2.tgz"
  }
}
```

## 二、注册全量集合

图标数据是静态 JSON，注册就是把整份数据交给 Iconify。**必须在应用入口同步调用**，因为它要在服务端渲染时就生效。

### Vue 3 + Vite

```ts
// main.ts
import { createApp } from 'vue'
import { srRegisterIcons, useSrTheme } from '@sunset-reverie/ui'
import { LUCIDE_FULL } from '@sunset-reverie/icons/lucide-full'
import '@sunset-reverie/ui/style.css'

import App from './App.vue'

// 同步注册：服务端渲染前就绪，客户端水合时不会出现「服务端空 SVG、客户端有图标」
srRegisterIcons({ lucide: LUCIDE_FULL })

useSrTheme().init()
createApp(App).mount('#app')
```

### Nuxt 4

新建一个插件（**不带** `.client` / `.server` 后缀，两端都要执行）：

```ts
// plugins/icons.ts
import { srRegisterIcons } from '@sunset-reverie/ui'
import { LUCIDE_FULL } from '@sunset-reverie/icons/lucide-full'

export default defineNuxtPlugin(() => {
  srRegisterIcons({ lucide: LUCIDE_FULL })
})
```

Nuxt 会自动注册 `plugins/` 下的文件，不需要在 `nuxt.config.ts` 里再写。

### 只想要「常用但不全量」？

`@sunset-reverie/icons/offline` 是核心库内联的那 86 个：

```ts
import { SR_OFFLINE_COLLECTIONS } from '@sunset-reverie/icons/offline'
```

它和核心库自带的是同一份数据，通常**不需要**再注册一遍（核心库的 `SrIcon` 会在首次渲染时自动注册），留作给不想用 `SrIcon`、只想拿集合数据的场景。

## 三、使用

注册之后，`SrIcon` 就能渲染任意 Lucide 图标，写法与之前完全一致：

```vue
<script setup lang="ts">
import { SrIcon } from '@sunset-reverie/ui'
</script>

<template>
  <SrIcon name="lucide:zap" />
  <SrIcon name="lucide:database" :size="20" />
  <SrIcon name="lucide:workflow" size="lg" color="var(--sr-color-primary)" />
</template>
```

图标名去哪查：打开 [lucide.dev/icons](https://lucide.dev/icons)，复制图标名后加 `lucide:` 前缀。旧的别名（如 `lucide:alert-triangle`、`lucide:trash-2`）在全量数据里同样可用。

非模板场景（`h()` 渲染、动态组件）也一致：

```ts
import { h } from 'vue'
import { SrIcon } from '@sunset-reverie/ui'

const icon = h(SrIcon, { name: 'lucide:zap', size: 18 })
```

## 四、使用其它图标集

`srRegisterIcons` 不绑定 Lucide，传任意 Iconify 集合数据都可以：

```ts
import { srRegisterIcons } from '@sunset-reverie/ui'
import tablerIcons from '@iconify-json/tabler/icons.json'

srRegisterIcons({ tabler: tablerIcons })

// <SrIcon name="tabler:brand-github" />
```

`@iconify-json/<集合>` 的 `icons.json` 就是 Iconify 的标准集合格式，直接传即可。注意这种用法需要你自己装对应的数据包，并且**打包时会全量进入 bundle**，建议按需选用。

## 五、体积与性能

| 用法 | 增量 | 说明 |
| --- | --- | --- |
| 只用核心库（86 个） | 0 | 子集已内联进 `@sunset-reverie/ui` |
| 加装全量 Lucide 并注册 | **约 96KB（gzip）** | 只影响显式 `import ... from '@sunset-reverie/icons/lucide-full'` 的项目 |

几个要点：

- 全量数据 619KB 源码、2100 个图标，gzip 后约 96KB，**进的是业务侧 bundle**，核心库体积不变；
- 注册是纯内存操作，没有网络请求，图标在首屏就能渲染；
- 不需要「按需加载单个图标」的机制：Iconify 的渲染是按名字查表，注册整份数据后每个图标的渲染成本相同。

## 六、常见问题

**图标显示为空白？**

按顺序排查：① 图标包版本是否与 `@sunset-reverie/ui` 一致；② 名字是否写成 `lucide:xxx`（少了前缀会按当前集合查找，通常找不到）；③ 注册代码是否在应用入口执行了（不是写在某个组件的 `onMounted` 里）。

**服务端渲染出来是空的，客户端才有图标？**

注册放晚了。必须放在创建应用**之前**、模块顶层同步执行；放到 `onMounted` 或异步回调里，服务端渲染阶段就还没有集合数据。

**重复注册会出问题吗？**

不会。`srRegisterIcons` 与核心库的内联注册是同一套 Iconify 逻辑，同一个 prefix 重复注册会按图标名合并，幂等。

**能不能只打包部分图标？**

当前图标包只提供「86 个常用」与「Lucide 全量」两档。如果需要 200 个左右的中间档，可以在你的项目里用 `@iconify-json/lucide/icons.json` 自己裁剪后传给 `srRegisterIcons`，数据结构一致。
