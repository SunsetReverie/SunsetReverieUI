# 快速开始

夕梦 UI 不发布到 NPM，通过私有 Git 仓库以 tag 分发。

## 安装

```bash
# 锁定到某个版本（推荐）
pnpm add git+https://your-git-host/sunset-reverie-ui.git#v0.1.0

# 只装核心库时，按需引入的组件样式由子路径提供
```

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

## 下一步

- [SrButton](/components/button) —— 五种变体与响应式尺寸
- [SrInput](/components/input) —— 前后缀、清空、密码、校验态
- [SrModal](/components/modal) —— 焦点陷阱与滚动锁定
