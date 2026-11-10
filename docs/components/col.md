# SrCol 栅格列

24 栅格系统的列容器。`span` 决定占几列，可配合 `offset` / `push` / `pull` / `flex`。

<script setup>
import { ref } from 'vue'
</script>

```vue
<script setup lang="ts">
import { SrCol, SrRow } from '@sunset-reverie/ui'
</script>

<template>
  <SrRow :gutter="16">
    <SrCol :span="8">三分之一</SrCol>
    <SrCol :span="16">三分之二</SrCol>
  </SrRow>
</template>
```

## 基础用法

<div class="sr-demo is-block">
  <SrRow :gutter="12">
    <SrCol :span="6"><div class="grid-box">span 6</div></SrCol>
    <SrCol :span="18"><div class="grid-box">span 18</div></SrCol>
  </SrRow>
</div>

## 响应式

`span` 支持按断点分档的对象，组件内部按当前断点取值：

<div class="sr-demo is-block">
  <SrRow :gutter="12">
    <SrCol :span="{ xs: 24, sm: 12, md: 8 }"><div class="grid-box">xs 24 / sm 12 / md 8</div></SrCol>
    <SrCol :span="{ xs: 24, sm: 12, md: 8 }"><div class="grid-box">xs 24 / sm 12 / md 8</div></SrCol>
    <SrCol :span="{ xs: 24, sm: 12, md: 8 }"><div class="grid-box">xs 24 / sm 12 / md 8</div></SrCol>
  </SrRow>
</div>

```vue
<SrCol :span="{ xs: 24, md: 8 }" />
```

窄屏（`xs`）下自动堆成一列，这是中后台表格与表单最常见的响应式需求。

## 偏移

`offset` 用 margin-left 把列往右推，占位仍然存在：

<div class="sr-demo is-block">
  <SrRow :gutter="12">
    <SrCol :span="6"><div class="grid-box">6</div></SrCol>
    <SrCol :span="6" :offset="6"><div class="grid-box">6 · offset 6</div></SrCol>
  </SrRow>
</div>

## 推拉

`push` / `pull` 是相对位移，**不改变文档流占位**，用于在不调整 DOM 顺序的情况下改变视觉顺序：

<div class="sr-demo is-block">
  <SrRow :gutter="12">
    <SrCol :span="12" :push="12"><div class="grid-box">视觉在右（DOM 在前）</div></SrCol>
    <SrCol :span="12" :pull="12"><div class="grid-box">视觉在左（DOM 在后）</div></SrCol>
  </SrRow>
</div>

> 它只改视觉顺序，读屏和 Tab 键顺序仍按 DOM。需要语义顺序也一致时，请直接调整 DOM 结构。

## 弹性宽度

`flex` 覆盖 `span` 的固定宽度：

<div class="sr-demo is-block">
  <SrRow :gutter="12">
    <SrCol :span="8"><div class="grid-box">固定 8</div></SrCol>
    <SrCol flex="auto"><div class="grid-box">flex: auto，吃掉剩余空间</div></SrCol>
  </SrRow>
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `span` | `number \| SrResponsive<number>` | `24` | 占据列数（满 24），支持按断点分档 |
| `offset` | `number \| SrResponsive<number>` | `0` | 左侧偏移列数 |
| `push` | `number \| SrResponsive<number>` | `0` | 向右推 |
| `pull` | `number \| SrResponsive<number>` | `0` | 向左拉 |
| `flex` | `string \| number` | `''` | 弹性取值，覆盖 `span` 的固定宽度 |
| `tag` | `string` | `'div'` | 自定义标签名 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 列内容 |

## 注意事项

- **`SrCol` 必须在 `SrRow` 内**，否则左右内边距无法被行的负 margin 抵消。
- `span` 总和超过 24 时自动换行（`wrap=false` 则挤在一行溢出）。
- `push` / `pull` 只改视觉顺序，不影响读屏与 Tab 顺序。
- `flex` 与 `span` 同时传时 `flex` 优先。

<style scoped>
.grid-box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 8px;
  border-radius: 8px;
  background: var(--sr-color-primary-alpha-12);
  color: var(--sr-color-primary-text);
  font-size: 12px;
  text-align: center;
}
</style>
