# SrBreadcrumb 面包屑

层级导航。最后一项自动标为当前页，支持图标分隔符、禁用项与中间折叠。

<script setup>
import { ref } from 'vue'

const items = [
  { label: '工作台', href: '#/overview' },
  { label: '组件', href: '#/components' },
  { label: 'SrBreadcrumb' },
]

const withIcon = [
  { label: '首页', href: '#/', icon: 'lucide:house' },
  { label: '组件', href: '#/components', icon: 'lucide:inbox' },
  { label: '面包屑' },
]

const longPath = [
  { label: '工作台', href: '#/' },
  { label: '组件', href: '#/components' },
  { label: '导航', href: '#/nav' },
  { label: '面包屑', href: '#/breadcrumb' },
  { label: '示例', href: '#/demo' },
  { label: '详情' },
]
</script>

```vue
<script setup lang="ts">
import { SrBreadcrumb } from '@sunset-reverie/ui'

const items = [
  { label: '工作台', href: '/overview' },
  { label: '组件', href: '/components' },
  { label: 'SrBreadcrumb' },
]
</script>

<template>
  <SrBreadcrumb :items="items" />
</template>
```

## 基础用法

<div class="sr-demo">
  <SrBreadcrumb :items="items" />
</div>

最后一项不带链接，样式上是当前页（主色 + 加粗）。

## 图标分隔符

`separatorIcon` 优先于 `separator`：

<div class="sr-demo is-column">
  <SrBreadcrumb :items="items" />
  <SrBreadcrumb :items="items" separator="›" />
  <SrBreadcrumb :items="items" separator-icon="lucide:chevron-right" />
</div>

## 带图标

条目给 `icon` 会在文字前显示图标：

<div class="sr-demo">
  <SrBreadcrumb :items="withIcon" separator-icon="lucide:chevron-right" />
</div>

## 超长折叠

`maxItems` 控制最多显示几项，超出时中间折叠成省略号（保留首项与末两项）：

<div class="sr-demo is-column">
  <span class="sr-demo__label">max-items = 4</span>
  <SrBreadcrumb :items="longPath" :max-items="4" separator-icon="lucide:chevron-right" />
</div>

## 禁用项

`items[].disabled` 让该项只展示、不可点：

<div class="sr-demo">
  <SrBreadcrumb
    :items="[
      { label: '工作台', href: '#/' },
      { label: '无权限的目录', href: '#/x', disabled: true },
      { label: '当前页' },
    ]"
    separator-icon="lucide:chevron-right"
  />
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `SrBreadcrumbItem[]` | `[]` | 条目列表，最后一项自动标记为当前页 |
| `separator` | `string` | `'/'` | 分隔符 |
| `separatorIcon` | `string` | `''` | 图标分隔符，优先于 `separator` |
| `maxItems` | `number` | `0` | 最多显示几项，0 表示不折叠 |

### SrBreadcrumbItem

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string` | 展示文案 |
| `href` | `string` | 链接地址；不给则不可点 |
| `icon` | `string` | 图标名 |
| `disabled` | `boolean` | 只展示、不可点 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `separator` | 自定义分隔符内容，覆盖 `separator` 与 `separatorIcon` |

## 注意事项

- **`disabled` 的项不会渲染 `<a>`**，只有文字和禁用样式，避免点进去 404。
- 折叠只发生在**项数超过 `maxItems`** 时；`maxItems` 为 0（默认）永不折叠。
- 最后一个条目始终不带链接，即使数据里给了 `href`。
- 移动端如果路径过长，建议直接减少 `items`，而不是靠折叠——折叠后的省略号在窄屏上占位也不小。
