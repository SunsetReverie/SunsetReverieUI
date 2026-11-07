# SrPagination 分页

页码导航。支持页码收敛、每页条数切换、跳页输入与简洁模式。

<script setup>
import { ref } from 'vue'

const page = ref(1)
const pageSize = ref(10)
const simplePage = ref(1)
</script>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrPagination } from '@sunset-reverie/ui'

const page = ref(1)
</script>

<template>
  <SrPagination v-model="page" :total="120" />
</template>
```

## 基础用法

<div class="sr-demo">
  <SrPagination v-model="page" :total="120" />
</div>

当前第 {{ page }} 页。总页数超过 7 页时，中间会收敛成 `1 … 7 8 9 … 14` 的形式。

## 每页条数

`pageSizeOptions` 控制切换器的可选值；传空数组则隐藏切换器。

<div class="sr-demo">
  <SrPagination v-model:page-size="pageSize" v-model="page" :total="120" />
  <span style="font-size: 13px; color: var(--vp-c-text-3)">每页 {{ pageSize }} 条</span>
</div>

切换每页条数时，页码会重置回第 1 页——否则会停在一个越界的页上。

## 跳页与简洁模式

<div class="sr-demo">
  <SrPagination v-model="page" :total="200" show-jumper />
  <SrPagination v-model="simplePage" :total="200" simple />
</div>

`simple` 只保留上一页 / 下一页，适合窄容器或移动端。

## 按需隐藏部件

| Prop | 默认 | 关掉后 |
| --- | --- | --- |
| `showTotal` | `true` | 不显示「共 N 条」 |
| `showSizer` | `true` | 不显示每页条数切换器 |
| `showJumper` | `false` | — |

`SrTable` 内部就是传 `:show-sizer="false"` 复用的这个组件。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `number` | `1` | 当前页，支持 `v-model` |
| `total` | `number` | `0` | 总条数 |
| `pageSize` | `number` | `10` | 每页条数，支持 `v-model:page-size` |
| `pageSizeOptions` | `number[]` | `[10, 20, 50]` | 每页条数可选项，空数组隐藏切换器 |
| `showTotal` | `boolean` | `true` | 显示「共 N 条」 |
| `showSizer` | `boolean` | `true` | 显示每页条数切换器 |
| `showJumper` | `boolean` | `false` | 显示跳页输入框 |
| `simple` | `boolean` | `false` | 只保留上一页 / 下一页 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |
| `disabled` | `boolean` | `false` | 禁用整个分页 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `page` | 当前页变化 |
| `update:pageSize` | `pageSize` | 每页条数变化 |
| `change` | `page, pageSize` | 任一变化都触发 |
| `size-change` | `pageSize` | 仅每页条数变化 |

## 注意事项

- **总条数变少时当前页会自动回落**。比如停在第 10 页、数据只剩 3 页，会退到第 3 页而不是显示空列表。
- 总数为 0 时仍然渲染控件（页码只有一个 1），方便布局稳定。
- 页码按钮圆角 6px，比默认的 4px 略大，和标签、卡片一致。
- 跳页输入是 `type="text"` + `inputmode="numeric"`，避免数字输入框的上下微调箭头。
