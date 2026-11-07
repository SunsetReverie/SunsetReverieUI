# SrRow 栅格行

24 栅格系统的行容器，配合 `SrCol` 使用。响应式全部由 CSS 媒体查询完成，JS 不参与布局。

```vue
<script setup lang="ts">
import { SrCol, SrRow } from '@sunset-reverie/ui'
</script>

<template>
  <SrRow :gutter="16">
    <SrCol :span="12">左</SrCol>
    <SrCol :span="12">右</SrCol>
  </SrRow>
</template>
```

## 基础用法

<div class="sr-demo is-block">
  <SrRow :gutter="12">
    <SrCol :span="8"><div class="grid-box">8</div></SrCol>
    <SrCol :span="8"><div class="grid-box">8</div></SrCol>
    <SrCol :span="8"><div class="grid-box">8</div></SrCol>
  </SrRow>
</div>

## 间隔

`gutter` 支持单值、`[水平, 垂直]` 数组，以及按断点分档的对象：

<div class="sr-demo is-block">
  <SrRow :gutter="[16, 8]">
    <SrCol :span="6"><div class="grid-box">6</div></SrCol>
    <SrCol :span="6"><div class="grid-box">6</div></SrCol>
    <SrCol :span="6"><div class="grid-box">6</div></SrCol>
    <SrCol :span="6"><div class="grid-box">6</div></SrCol>
  </SrRow>
</div>

按断点分档时写 `:gutter="{ xs: 8, md: 24 }"`，窄屏用小间隔、宽屏用大间隔。

## 对齐

<div class="sr-demo is-block">
  <SrRow justify="space-between" style="height: 60px; background: var(--sr-color-primary-alpha-08); border-radius: 8px; padding: 0 8px">
    <SrCol :span="4"><div class="grid-box">start</div></SrCol>
    <SrCol :span="4"><div class="grid-box">end</div></SrCol>
  </SrRow>
</div>

`justify` 控制主轴（水平）对齐：`start` / `center` / `end` / `space-between` / `space-around`。

`align` 控制交叉轴（垂直）对齐：`top` / `middle` / `bottom`。

## 换行

`wrap` 默认 `true`，一行的总 span 超过 24 时自动换行。设成 `false` 会强制挤在一行里（可能溢出）。

## 语义化标签

`tag` 可以改成 `section`、`nav` 等语义标签：

```vue
<SrRow tag="section" :gutter="16">…</SrRow>
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `gutter` | `number \| [number, number] \| SrResponsive<SrGutter>` | `0` | 栅格间隔（px） |
| `justify` | `'start' \| 'center' \| 'end' \| 'space-between' \| 'space-around'` | `'start'` | 主轴对齐 |
| `align` | `'top' \| 'middle' \| 'bottom'` | `'top'` | 交叉轴对齐 |
| `wrap` | `boolean` | `true` | 是否允许换行 |
| `tag` | `string` | `'div'` | 自定义标签名 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 栅格列（`SrCol`） |

## 注意事项

- **列必须放在 `SrRow` 里**，直接写 `SrCol` 没有负 margin 补偿，间隔会错位。
- 垂直间隔是通过 `row-gap` 实现的，只在换行时生效。
- 24 栅格能被 3 / 4 / 6 / 8 整除，常见的三等分是 `8`，四等分是 `6`。

<style scoped>
.grid-box {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  border-radius: 8px;
  background: var(--sr-color-primary-alpha-12);
  color: var(--sr-color-primary-text);
  font-size: 13px;
}
</style>
