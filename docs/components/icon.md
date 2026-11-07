# SrIcon 图标

统一的图标出口。基于 Iconify，编译期把用到的图标子集化进产物，运行时不发请求。

```vue
<script setup lang="ts">
import { SrIcon } from '@sunset-reverie/ui'
</script>

<template>
  <SrIcon name="lucide:house" />
</template>
```

## 基础用法

<div class="sr-demo">
  <SrIcon name="lucide:house" :size="24" />
  <SrIcon name="lucide:inbox" :size="24" />
  <SrIcon name="lucide:heart" :size="24" />
  <SrIcon name="lucide:settings" :size="24" />
  <SrIcon name="lucide:moon-star" :size="24" />
</div>

图标名格式是 `集合:图标名`，不带集合前缀会按当前注册的集合查找。

## 尺寸

三种写法都支持：

<div class="sr-demo">
  <SrIcon name="lucide:house" size="xs" />
  <SrIcon name="lucide:house" size="sm" />
  <SrIcon name="lucide:house" size="md" />
  <SrIcon name="lucide:house" size="lg" />
  <SrIcon name="lucide:house" :size="32" />
  <SrIcon name="lucide:house" size="1.5rem" />
</div>

| 写法 | 含义 |
| --- | --- |
| `xs` / `sm` / `md` / `lg` | 档位关键字，与 `SrButton` 等组件一致 |
| 数字 | 按 px |
| 带单位的字符串 | 原样透传（`1em` / `1.5rem` / `24px`） |

默认值是 `1em`——跟着父级字号走，放在按钮或标签里不用另外调尺寸。

## 颜色

默认不输出内联颜色，直接继承父级的 `currentColor`：

<div class="sr-demo">
  <span style="color: var(--sr-color-primary)"><SrIcon name="lucide:heart" :size="24" /></span>
  <span style="color: var(--sr-color-success)"><SrIcon name="lucide:check" :size="24" /></span>
  <SrIcon name="lucide:trash" :size="24" color="var(--sr-color-danger)" />
</div>

> 这里刻意不把 `currentColor` 写进内联 style——内联样式的优先级会压掉外部类设置的颜色，导致所有图标都变成正文色。

## 变换

<div class="sr-demo">
  <SrIcon name="lucide:chevron-right" :size="24" />
  <SrIcon name="lucide:chevron-right" :size="24" :rotate="90" />
  <SrIcon name="lucide:chevron-right" :size="24" flip="horizontal" />
  <SrIcon name="lucide:chevron-right" :size="24" flip="vertical" />
  <SrIcon name="lucide:loader-circle" :size="24" spin />
</div>

`spin` 用于加载态，会匀速旋转；它同时会尊重 `prefers-reduced-motion`。

## 自定义渲染

`default` 插槽接管整个图标内容，`name` 可以省略：

```vue
<SrIcon :size="24" label="自定义">
  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="currentColor" /></svg>
</SrIcon>
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | `''` | 图标名，格式「集合:图标名」 |
| `size` | `number \| string \| SrSize` | `'1em'` | 尺寸，支持档位 / 数字（px）/ 带单位字符串 |
| `color` | `string` | — | 颜色，默认继承 `currentColor` |
| `flip` | `boolean \| 'horizontal' \| 'vertical'` | `false` | 翻转，`true` 等价于 `horizontal` |
| `rotate` | `number \| string` | `0` | 旋转角度（deg） |
| `spin` | `boolean` | `false` | 匀速旋转 |
| `label` | `string` | `''` | 无障碍标签；不传则视为装饰性图标并加 `aria-hidden` |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 自定义图标内容，覆盖 `name` |

## 注意事项

- **图标必须先在构建期被扫描到**。源码里写死的图标名会被 `pnpm gen:icons` 子集化进产物；拼字符串生成的动态名（`\`lucide:${x}\``）不会被收录，渲染时是空白。
- 校验命令 `pnpm lint:icons` 会比对「源码引用的图标」与「离线集合」，缺失直接报错。
- 不传 `label` 时自动加 `aria-hidden="true"`，纯装饰性图标不会干扰读屏。
- 图标大小默认 `1em`，在按钮里会自动跟按钮字号；需要独立尺寸时显式传。
