# 主题与 Token

一套组件同时跑出亮/暗、毛玻璃/扁平、主色、动效三档的组合，靠的不是四份样式表，而是**根元素上的几个属性 + 三层 CSS 变量**。这篇讲清变量从哪来、运行时怎么切、以及切完为什么不会闪白。

## 四个可切换的维度

| 维度 | 载体 | 取值 | 谁负责 |
| --- | --- | --- | --- |
| <span style="white-space: nowrap">明暗</span> | `data-sr-theme` | `light` / `dark` | `useSrTheme()` 写入，支持 `auto` 跟随系统 |
| <span style="white-space: nowrap">质感</span> | `data-sr-style` | `glass` / `flat` | 同上 |
| <span style="white-space: nowrap">主色</span> | `--sr-color-primary*` 系列 | 预设主题色或任意色值 | `setPreset()` / `setPrimaryColor()` |
| <span style="white-space: nowrap">动效</span> | `data-sr-motion` | 不写（默认轻）/ `none` / `strong` | 使用方写根属性，纯 CSS 变量覆盖 |

属性都挂在 `<html>` 上。组件样式里没有任何 `if (dark)` 分支——同一条声明读到的变量值不同，表现就不同。

## 三层 Token

| 层 | 内容 | 例子 |
| --- | --- | --- |
| L1 原始色板 | 与语义无关的色阶与尺度 | `--sr-sunset-500`、`--sr-night-700`、`--sr-space-4` |
| L2 语义映射 | 把色板翻译成用途，亮暗各一套 | `--sr-color-text`、`--sr-color-bg-container`、`--sr-shadow-lg` |
| L3 组件级 | 某个组件自己的旋钮 | `--sr-button-glow-strength`、`--sr-tabs-height` |

L1/L2 的生成物是 `packages/ui/src/styles/base/primitives.generated.css` 与 `semantic.generated.css`，由 `internal/tokens/src/tokens.ts` + `semantic.ts` 通过 `pnpm build:tokens` 产出，同时会生成 TypeScript 常量供 Gallery 页面消费。**不要手改 `*.generated.css`**，改源文件后重新生成，否则下次构建会被覆盖。

组件目录里那些 `--sr-xxx` 属于 L3，跟组件样式放在同一个 `.less` 文件，方便就地调手感。

> 完整的变量与色值以 `internal/tokens/src/tokens.ts`、`semantic.ts` 为准；改完跑 `pnpm build:tokens` 重新生成三份产物。

## 运行时切换

```ts
import { useSrTheme } from '@sunset-reverie/ui'

const {
  mode,        // 用户意图：'light' | 'dark' | 'auto'
  resolved,    // 实际生效：跟随系统时会与 mode 不同
  style,       // 'glass' | 'flat'
  preset,      // 当前预设主题色代号
  setTheme,
  setStyle,
  setPreset,
  setPrimaryColor,
  resetPrimaryColor,
} = useSrTheme()

setTheme('dark')
setStyle('glass')
setPreset('dusk')
setPrimaryColor('#22aa66')  // 任意色值，自动派生 hover / active / 文字色
resetPrimaryColor()         // 回到预设
```

偏好会写进 `localStorage`（键带 `sr-` 前缀）；隐私模式下写入失败只影响持久化，当前会话照常工作。

预设色在 `SR_THEME_PRESETS` 里：落日橙（默认）、霞紫、暮蓝等，换预设等于换一组 `--sr-color-primary*` 派生值，不需要重写组件背景。

## 首帧不闪白

暗色用户打开页面时若等 JS 挂载再写 `data-sr-theme`，会先看到一帧亮色。库提供 `srThemeInitScript()`，把偏好读取提前到**所有 CSS 之前的内联脚本**：

```ts
// Nuxt 4：模块自动注入，无需手写
export default defineNuxtConfig({
  modules: ['@sunset-reverie/nuxt'],
})
```

```html
<!-- Vite / VitePress：在 head 里同步执行，必须早于样式 -->
<script>/* srThemeInitScript() 的输出 */</script>
```

文档站本身正是这么做的：`docs/.vitepress/config.ts` 把 `SR_THEME_INIT_SNIPPET` 放进 `head`，演示站则由 `vite.config.ts` 的插件注入 `index.html` 占位符。SSR 输出的是确定的根属性，服务端与客户端首帧一致，水合不会告警。

## 质感：玻璃与扁平

两套质感共享同一批变量名，只覆写值：

| 变量 | `flat` | `glass` |
| --- | --- | --- |
| `--sr-glass-filter` | `none` | `blur(16px) saturate(180%)` |
| `--sr-glass-filter-strong` | `none` | `blur(28px) saturate(200%)` |
| `--sr-glass-filter-hero` | `none` | `blur(40px) saturate(220%)` |
| `--sr-color-bg-container` | 实色 | 半透明 |
| `--sr-glass-highlight` | 零尺寸透明阴影占位 | 顶部 1px 内高光 |

组件不判断当前风格，只调用 `.sr-surface()` / `.sr-glass-surface()`，里面统一带一层 `.sr-glass-layer()`。三档模糊按位置分工：容器内表面用常规档，悬浮小面板用 `strong`，内容密集的大面板（如日期面板）用 `hero`。

三个让毛玻璃生效的必要条件：表面背景必须半透明、必须声明 `backdrop-filter`、背后必须有可模糊的内容。纯色背景上看不出玻璃，演示站因此在 `body` 上铺了渐变光晕。`backdrop-filter` 较贵，单屏别超过 5 层，也别在滚动容器里嵌套多层。

## 动效三档

```html
<html data-sr-motion="none">  <!-- 关闭过渡与循环动画，适合低端设备 -->
<html data-sr-motion="strong"> <!-- 更长时长、更明显位移 -->
```

不写属性就是默认的「轻」。另外库始终尊重系统的 `prefers-reduced-motion: reduce`。关键是**组件里不能写死时长**：一律写 `var(--sr-motion-duration-*)`，否则切到「无」时还有东西在动，三档就成了摆设。文档站顶栏可现场切换验收。

## 常见坑

- **组件里别写死颜色或圆角**。写死一条就绕过了三层 Token，切主题时那一块会掉队；`lint:tokens` 会抓引用了但未定义的变量。
- **扁平风格下不要留半透明底**。半透明会透出页面背景光晕，与「实色」的取向冲突；该用 `var(--sr-color-bg-container)` 这类语义值，由风格层决定透不透。
- **占位值不能写 `none`**。多值阴影里某一层用 `none` 会让整条声明失效，用零尺寸透明阴影占位（`--sr-glass-highlight` 就是这么做的）。
- **主色要连同派生值一起换**。直接改 `--sr-color-primary` 而不更新 hover / active / 文字色，会出现按下去没反馈；用 `setPrimaryColor()` 让库统一派生。
