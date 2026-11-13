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

## 术语

三组容易混的名字，先对齐一下：

| 概念 | 字段 / 方法 | 取值 |
| --- | --- | --- |
| 明暗模式 | `mode` / `setTheme()` | `light` \| `dark` \| `auto` |
| 实际生效的明暗 | `resolved`（只读） | `light` \| `dark` |
| 质感 | `style` / `setStyle()` | `glass` \| `flat` |
| 主色 | `preset` / `setPreset()` / `setPrimaryColor()` | 预设代号或任意色值 |

注意「明暗模式」的字段叫 `mode`，但切换方法是 `setTheme()` —— 没有 `setMode()`，也没有 `theme` 这个字段。

## 运行时切换

```ts
import { useSrTheme } from '@sunset-reverie/ui'

const {
  mode,        // 用户意图：'light' | 'dark' | 'auto'
  resolved,    // 实际生效：跟随系统时会与 mode 不同
  style,       // 'glass' | 'flat'
  preset,      // 当前预设主题色代号
  init,        // 从 localStorage 恢复偏好，应用启动时调一次
  setTheme,
  setStyle,
  setPreset,
  setPrimaryColor,
  resetPrimaryColor,
} = useSrTheme()

init()                      // 客户端启动时调用一次
setTheme('dark')            // 明暗模式
setStyle('glass')           // 质感
setPreset('dusk')           // 预设主色
setPrimaryColor('#22aa66')  // 任意色值，自动派生 hover / active / 文字色
resetPrimaryColor()         // 回到预设
```

### init() 与默认值

`init()` 从 `localStorage` 读回用户上次的选择，**没有记录时保持模块默认值**（`auto` + `flat`）。想让项目默认就是毛玻璃，通过参数传：

```ts
init({ defaultTheme: 'auto', defaultStyle: 'glass' })
```

优先级是「存储里的值 > `init` 的默认值 > 模块默认值」。用户手动切过之后，参数里的默认值就不再生效了。

> **`init` 的默认值要和首帧脚本对齐**，否则会闪一下：`srThemeInitScript({ defaultStyle: 'glass' })` 把首帧画成 glass，而 `init()` 不传参数就会退回 `flat`，中间那一帧仍会跳变。两处写同一个值即可。

偏好会写进 `localStorage`（键带 `sr-` 前缀）；隐私模式下写入失败只影响持久化，当前会话照常工作。

四个键都有导出的常量，不要手写字符串：

| 常量 | 实际键名 | 存什么 | 无记录时 |
| --- | --- | --- | --- |
| `SR_THEME_STORAGE_KEY` | `sr-theme` | `light` \| `dark` \| `auto` | `auto` |
| `SR_STYLE_STORAGE_KEY` | `sr-style` | `glass` \| `flat` | `flat` |
| `SR_PRESET_STORAGE_KEY` | `sr-primary-preset` | 预设色代号 | 落日橙 |
| `SR_PRIMARY_STORAGE_KEY` | `sr-primary` | 自定义主色色值 | 空（用预设） |

```ts
import {
  SR_THEME_STORAGE_KEY,
  SR_STYLE_STORAGE_KEY,
  SR_PRESET_STORAGE_KEY,
  SR_PRIMARY_STORAGE_KEY,
} from '@sunset-reverie/ui'
```

预设色在 `SR_THEME_PRESETS` 里：落日橙（默认）、霞紫、暮蓝等，换预设等于换一组 `--sr-color-primary*` 派生值，不需要重写组件背景。

## 自定义主色

预设只是默认值，不是封闭选项。主色有三档做法，按「谁来决定」选：

| 场景 | 做法 | 持久化 | 影响范围 |
| --- | --- | --- | --- |
| 产品固定品牌色 | CSS 覆盖主色派生变量 | — | 全局 |
| 用户在设置里自选 | `setPrimaryColor(color)` | 是 | 全局 |
| 同一页多品牌 / 白标 | `setPrimaryColor(color, el)` | 否 | 仅该子树 |

### 内置的 5 套预设

`SR_THEME_PRESETS` 从包入口直接导出，可以直接拿来渲染选择器，不用手抄色值：

| 代号 | 名称 | 主色 | 定位 |
| --- | --- | --- | --- |
| `sunset` | 落日橙（默认） | `#FF7A45` | 暖而不刺 |
| `dusk` | 霞紫 | `#7A64B5` | 沉静，适合工具型 |
| `ember` | 余烬红 | `#F5456B` | 张扬，强调行动 |
| `night` | 暮蓝 | `#2578F5` | 克制，偏企业风格 |
| `jade` | 翡翠绿 | `#10B981` | 清新，偏内容型 |

```ts
import { SR_THEME_PRESETS } from '@sunset-reverie/ui'

// [{ key: 'sunset', label: '落日橙', primary: '#FF7A45', mood: '...' }, ...]
```

### 用户自选颜色（带取色器）

配一个原生取色器就能让用户现场换色：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, useSrTheme } from '@sunset-reverie/ui'

const theme = useSrTheme()
const color = ref('#22aa66')

/**
 * 应用自定义主色
 * @param value 任意合法 CSS 颜色，不限于十六进制
 */
function apply(value: string): void {
  theme.setPrimaryColor(value)
}
</script>

<template>
  <input v-model="color" type="color" @input="apply(color)" />
  <SrButton size="sm" @click="theme.resetPrimaryColor()">恢复默认</SrButton>
</template>
```

几点行为要知道：

- **与预设互斥**：调用后 `preset` 变成空字符串，`data-sr-primary` 属性被移除，避免两套规则互相覆盖；
- **会持久化**：写进 `localStorage` 的 `sr-primary`，刷新后仍是用户选的颜色，`resetPrimaryColor()` 才会清掉；
- **首帧不闪**：内联主题脚本会先读 `sr-primary` 并把主色写进行内变量（派生色用 `color-mix()` 计算），所以不会先闪一下默认橙再变过来。不支持 `color-mix` 的旧浏览器只应用主色本身，hover / active 暂用默认值；
- 输入非十六进制（`rgb()`、`oklch()`、带透明度的颜色）同样可用，派生逻辑按 HSL 换算。

### 只作用于某一块（多品牌 / 白标）

`setPrimaryColor` 的第二个参数是作用域元素，适合同一页面里不同租户、不同品牌卡片各用各的主色：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useSrTheme } from '@sunset-reverie/ui'

const theme = useSrTheme()
const tenantRef = ref<HTMLElement | null>(null)

/**
 * 只给某个容器换主色
 * @param color 该租户的品牌色
 */
function applyTenantColor(color: string): void {
  if (tenantRef.value) theme.setPrimaryColor(color, tenantRef.value)
}
</script>

<template>
  <div ref="tenantRef" class="tenant-panel">
    <!-- 这块区域里的按钮、图表、选中态都会跟着变 -->
  </div>
</template>
```

- 它写的是该元素的**行内变量**，只影响子树，外层与全局都不动；
- 不进入 `primary` 状态、不持久化，元素卸载即消失，不需要手动清理；
- 行内变量优先级高于 `[data-sr-primary]` 规则，所以「全局用预设 + 局部用品牌色」可以共存；
- 预设只能全局切（`setPreset` 写的是 `<html>` 上的属性），局部场景只能用 `setPrimaryColor`。

### 为什么不能只改一个变量

`setPrimaryColor` 内部会派生出 7 个变量，纯 CSS 固定品牌色时也要一起写：

| 变量 | 用途 |
| --- | --- |
| `--sr-color-primary` | 主色本身：按钮底、选中态、图表默认色 |
| `--sr-color-primary-hover` | 悬停态（比主色亮一档） |
| `--sr-color-primary-active` | 按下态（比主色暗一档） |
| `--sr-color-primary-text` | 主色文字（保证在浅底上可读） |
| `--sr-color-primary-alpha-25` / `-12` / `-08` | 三档透明主色：选中底、hover 底、极淡高亮 |

只改第一个，会出现「按钮按下去没反馈」「选中行底色还是旧色」「图表色与新品牌色不一致」。这条也写在下面的[常见坑](#常见坑)里。

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
| `--sr-glass-filter-mask` | `none` | `blur(6px)` |
| `--sr-glass-filter-soft` | `none` | `blur(1px)` |
| `--sr-color-bg-container` | 实色 | 半透明 |
| `--sr-glass-highlight` | 零尺寸透明阴影占位 | 顶部 1px 内高光 |

组件不判断当前风格，只调用 `.sr-surface()` / `.sr-glass-surface()`，里面统一带一层 `.sr-glass-layer()`。五档模糊按位置分工：容器内表面用常规档，悬浮小面板用 `strong`，内容密集的大面板（如日期面板）用 `hero`，浮层遮罩用 `mask`，Loading 这类轻遮罩用 `soft`。

**任何组件里都不要写死 `blur()`**。写死之后 `flat` 风格就关不掉它，`pnpm check:layout` 会直接报「flat 风格下仍有毛玻璃层」。`anchor` 这类需要自定义强度的位置，把整条 filter 存成变量（`--sr-anchor-affix-filter: var(--sr-glass-filter)`）再交给 `.sr-glass-layer()`，风格切换才会跟着走。

三个让毛玻璃生效的必要条件：表面背景必须半透明、必须声明 `backdrop-filter`、背后必须有可模糊的内容。纯色背景上看不出玻璃，演示站因此在 `body` 上铺了渐变光晕。`backdrop-filter` 较贵，单屏别超过 5 层，也别在滚动容器里嵌套多层——这条目标目前还没达到：W14 审计实测演示站最高 31 层（表格每个表头单元格各自一层），`pnpm check:layout` 会把超过 5 层但未超过 32 层的页面列为提示，超过 32 层才判失败。

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
