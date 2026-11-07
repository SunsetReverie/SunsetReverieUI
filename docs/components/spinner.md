# SrSpinner 加载指示器

环形加载动画。用于数据请求、提交反馈这类「等待中」的场景。

```vue
<script setup lang="ts">
import { SrSpinner } from '@sunset-reverie/ui'
</script>

<template>
  <SrSpinner />
</template>
```

## 基础用法

<div class="sr-demo">
  <SrSpinner />
  <SrSpinner>加载中…</SrSpinner>
</div>

包在文字外面时，图标在左、文字在右，间距由组件内部处理。

## 尺寸

<div class="sr-demo">
  <SrSpinner size="xs" />
  <SrSpinner size="sm" />
  <SrSpinner size="md" />
  <SrSpinner size="lg" />
  <SrSpinner :size="32" />
</div>

`size` 支持档位关键字或像素数字。

## 颜色与线宽

<div class="sr-demo">
  <SrSpinner color="var(--sr-color-success)" />
  <SrSpinner color="var(--sr-color-danger)" />
  <SrSpinner :stroke-width="1" />
  <SrSpinner :stroke-width="3" />
</div>

默认跟随当前文字颜色（`currentColor`），所以在按钮里会自动变成按钮的文字色。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `SrSize \| number` | `'md'` | 尺寸档位，或直接给像素值 |
| `color` | `string` | `''` | 颜色，默认跟随主色 |
| `label` | `string` | `''` | 无障碍名称；不传则视为装饰性 |
| `strokeWidth` | `number` | `2` | 线条粗细（px） |

## 注意事项

- **动画会尊重 `prefers-reduced-motion`**：用户开了「减少动效」时停止旋转，但图标仍然显示，避免出现「什么都没有」的空白。
- 组件本身没有插槽；需要「图标 + 文案」的组合直接写在外面，或使用 `SrButton` 的 `loading` 属性。
- 全屏或区块级的加载遮罩不要自己用 spinner 拼，`SrTable` 已有 `loading` 属性，其它场景可以用 `SrEmpty` + `SrSpinner` 组合。
