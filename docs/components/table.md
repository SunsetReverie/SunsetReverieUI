# SrTable 数据表格

列配置驱动的表格。支持排序、多选、展开行、固定列、分页与懒加载，窄屏自动切换卡片视图。

<script setup>
import { ref } from 'vue'

const columns = [
  { key: 'name', title: '组件', minWidth: 140, sortable: true },
  { key: 'owner', title: '负责人', width: 110 },
  { key: 'status', title: '状态', width: 110 },
]

const data = ref([
  { id: 1, name: 'SrTable', owner: '林深', status: 'stable' },
  { id: 2, name: 'SrNav', owner: '周夏', status: 'beta' },
  { id: 3, name: 'SrDrawer', owner: '陈默', status: 'stable' },
  { id: 4, name: 'SrTag', owner: '苏白', status: 'beta' },
])

const statusText = { stable: '稳定', beta: '预览版' }

const selected = ref([])
const page = ref(1)

const wideColumns = [
  { key: 'id', title: 'ID', width: 80, fixed: 'left' },
  { key: 'name', title: '组件', width: 160, fixed: 'left' },
  { key: 'type', title: '类型', width: 130 },
  { key: 'owner', title: '负责人', width: 130 },
  { key: 'version', title: '版本', width: 120 },
  { key: 'status', title: '状态', width: 130 },
  { key: 'actions', title: '操作', width: 150, fixed: 'right' },
]

const wideRows = data.value.map((row, i) => ({ ...row, type: '展示型', version: `0.${i + 2}.1` }))
</script>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrTable, type SrTableColumn, type SrTableRow } from '@sunset-reverie/ui'

const columns: SrTableColumn[] = [
  { key: 'name', title: '组件', minWidth: 160 },
  { key: 'owner', title: '负责人', width: 120 },
  { key: 'status', title: '状态', width: 110 },
]

const data = ref<SrTableRow[]>([
  { id: 1, name: 'SrTable', owner: '林深', status: 'stable' },
  { id: 2, name: 'SrNav', owner: '周夏', status: 'beta' },
])
</script>

<template>
  <SrTable :columns="columns" :data="data">
    <template #cell-status="{ value }">
      <SrTag>{{ value }}</SrTag>
    </template>
  </SrTable>
</template>
```

## 交互演示

排序、多选都是真的，点表头试试：

<div class="sr-demo is-block">
  <SrTable v-model:selected-keys="selected" :columns="columns" :data="data" selectable>
    <template #cell-status="{ value }">
      <SrTag :type="value === 'stable' ? 'success' : 'warning'" size="sm" round>
        {{ statusText[value] ?? value }}
      </SrTag>
    </template>
  </SrTable>
  <p style="margin: 12px 0 0; font-size: 13px; color: var(--vp-c-text-3)">
    已选 {{ selected.length }} 行
  </p>
</div>

## 列配置

每个 `SrTableColumn` 描述一列：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `key` | `string` | 字段名，同时作为默认插槽名 `#cell-<key>` |
| `title` | `string` | 表头文案 |
| `width` | `number \| string` | 列宽，数字按 px |
| `minWidth` | `number \| string` | 最小宽度 |
| `align` | `'left' \| 'center' \| 'right'` | 对齐，默认 `left` |
| `sortable` | `boolean` | 是否可排序 |
| `ellipsis` | `boolean` | 超长单行省略 |
| `fixed` | `'left' \| 'right'` | 横向滚动时固定 |
| `slot` | `string` | 自定义插槽名，默认取 `key` |
| `formatter` | `(row, index, column) => string` | 文本格式化，**仅在无对应插槽时生效** |

## 单元格渲染

三种方式，优先级从高到低：

1. **具名插槽** `#cell-<key>`（或 `columns[].slot` 指定的名字），作用域参数是 `{ row, value, index, column }`
2. **`formatter`**：返回字符串
3. **原始值**：直接输出

```vue
<SrTable :columns="columns" :data="data">
  <template #cell-actions="{ row }">
    <SrButton size="sm" @click="edit(row)">编辑</SrButton>
  </template>
</SrTable>
```

## 排序

`sortMode` 区分两种模式：

| 值 | 行为 |
| --- | --- |
| `client`（默认） | 组件内部对 `data` 排序，点击表头在 asc → desc → 取消三态间循环 |
| `server` | 不排序，只派发 `sort-change`，由调用方换数据 |

```vue
<!-- 服务端排序 -->
<SrTable :columns="columns" :data="rows" sort-mode="server" @sort-change="onSort" />
```

`columns[].sortable` 决定哪几列可点。

## 多选与展开

```vue
<SrTable
  v-model:selected-keys="selected"
  v-model:expanded-keys="expanded"
  :columns="columns"
  :data="data"
  selectable
  expandable
>
  <template #expand="{ row }">
    <p>{{ row.name }} 的详细说明</p>
  </template>
</SrTable>
```

表头复选框带半选态。行标识取自 `rowKey`（默认 `'id'`），也可以传函数：`:row-key="(row) => row.code"`。

## 固定列

```ts
const columns: SrTableColumn[] = [
  { key: 'id', title: 'ID', width: 80, fixed: 'left' },
  // ...中间若干列
  { key: 'actions', title: '操作', width: 200, fixed: 'right' },
]
```

三个约束：

- **固定列必须给 px 宽度**，偏移量是按前面列的宽度累加出来的，百分比之类的相对单位没法参与计算
- 有固定列时表格会自动兜一个 `min-width`（各列宽之和）。否则 `table-layout: auto` 会把表格压回容器宽度，根本不会横向溢出，固定也就无从谈起
- 固定列自身是不透明白底 + 模糊层。玻璃风格下容器色只有 0.72 不透明，单层会透出滚动过去的文字

左右两侧各有 6px 渐变投影，提示还有内容。

横向滚一下就能看到两侧固定列的效果：

<div class="sr-demo is-block">
  <SrTable :columns="wideColumns" :data="wideRows" bordered>
    <template #cell-status="{ value }">
      <SrTag :type="value === 'stable' ? 'success' : 'warning'" size="sm" round>
        {{ statusText[value] ?? value }}
      </SrTag>
    </template>
    <template #cell-actions>
      <SrButton size="xs" variant="primary">编辑</SrButton>
    </template>
  </SrTable>
</div>

## 分页

```vue
<SrTable v-model:page="page" :columns="columns" :data="rows" :pagination="{ pageSize: 10 }" />
```

组件内部切片数据，页脚复用 `SrPagination`（隐藏了每页条数选择器）。总条数变少时会自动回落到最后一页，不会停在空页上。

<div class="sr-demo is-block">
  <SrTable v-model:page="page" :columns="columns" :data="data" :pagination="{ pageSize: 2 }">
    <template #cell-status="{ value }">
      <SrTag :type="value === 'stable' ? 'success' : 'warning'" size="sm" round>
        {{ statusText[value] ?? value }}
      </SrTag>
    </template>
  </SrTable>
</div>

## 懒加载

```vue
<SrTable
  :columns="columns"
  :data="rows"
  lazy
  :has-more="hasMore"
  :loading-more="loading"
  :max-height="360"
  @load-more="fetchNext"
/>
```

底部复用 `SrLoadMore`，滚动到距底部 48px 内自动派发 `load-more`，同时保留「加载更多」按钮兜底。

> `lazy` 需要配合 `max-height` 才会出现滚动容器。两者都不设时表格不会滚动，也就永远不会触发加载。

## 空状态

```vue
<SrTable :columns="columns" :data="[]" empty-text="还没有组件" empty-icon="lucide:inbox" />
```

`emptyIcon` 传空字符串可关掉图标。需要完全自定义时用 `#empty` 插槽。

## 窄屏卡片视图

`responsive` 为真时，`xs` 断点下每行渲染成一张卡片（标题取第一列，其余键值对排列）。

> 切换发生在**客户端挂载之后**。断点内核在 setup 阶段就能读到真实宽度，若直接用它决定结构，SSR（固定按 md 渲染）与客户端首帧会不一致，触发水合告警。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `SrTableRow[]` | `[]` | 行数据 |
| `columns` | `SrTableColumn[]` | `[]` | 列配置 |
| `rowKey` | `string \| (row, index) => SrTableRowKey` | `'id'` | 行唯一键，用于选择与展开 |
| `size` | `SrSize` | 继承配置 | 行高与字号档位 |
| `bordered` | `boolean` | `false` | 显示竖线与外框 |
| `stripe` | `boolean` | `false` | 斑马纹 |
| `hoverable` | `boolean` | `true` | 悬停高亮 |
| `maxHeight` | `number \| string` | — | 滚动区最大高度，设置后表头吸顶 |
| `loading` | `boolean` | `false` | 加载遮罩 |
| `emptyText` | `string` | `'暂无数据'` | 空数据文案 |
| `emptyIcon` | `string` | `'lucide:inbox'` | 空数据图标，传空串关闭 |
| `selectable` | `boolean` | `false` | 显示多选列 |
| `selectedKeys` | `SrTableRowKey[]` | `[]` | 已选行，支持 `v-model:selected-keys` |
| `expandable` | `boolean` | `false` | 显示展开列 |
| `expandedKeys` | `SrTableRowKey[]` | `[]` | 展开行，支持 `v-model:expanded-keys` |
| `responsive` | `boolean` | `false` | xs 断点切换卡片视图 |
| `sortMode` | `'client' \| 'server'` | `'client'` | 排序由本地还是调用方处理 |
| `defaultSort` | `{ key, order }` | — | 默认排序 |
| `tableLayout` | `'auto' \| 'fixed'` | `'auto'` | 表格布局算法 |
| `pagination` | `boolean \| { pageSize }` | `false` | 开启前端分页 |
| `page` | `number` | `1` | 当前页，支持 `v-model:page` |
| `pageSize` | `number` | `10` | 每页条数 |
| `lazy` | `boolean` | `false` | 滚动到底派发 `load-more` |
| `hasMore` | `boolean` | `true` | 是否还有更多数据 |
| `loadingMore` | `boolean` | `false` | 底部显示加载中 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:selectedKeys` | `keys` | 选中集合变化 |
| `update:expandedKeys` | `keys` | 展开集合变化 |
| `selection-change` | `keys, rows` | 选中集合变化（带行数据） |
| `sort-change` | `payload` | 排序变化，`payload` 是 `{ key, order }`，取消时 `order` 为 `null` |
| `row-click` | `row, index` | 行点击 |
| `expand-change` | `keys, rows` | 展开集合变化（带行数据） |
| `update:page` | `page` | 当前页变化 |
| `page-change` | `page` | 页码变化 |
| `load-more` | — | 滚动到底部，懒加载 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `cell-<key>` | 单元格，作用域 `{ row, value, index, column }` |
| `expand` | 展开行内容，作用域 `{ row, index }` |
| `empty` | 空状态，覆盖默认的图标 + 文案 |

> `cell-<key>` 是**命名约定**而不是固定插槽：组件源码里只有一个动态入口 `slotNameOf(column)`，把列配置的 `key` 拼成实际插槽名（列 `status` 对应 `#cell-status`）。

## 注意事项

- **`pagination` 与 `lazy` 语义互斥**。同时开启时，`lazy` 往 `data` 里追加数据，但视图只显示当前页的切片，看起来像「加载没反应」。两者只能选一个。
- **固定列必须给 px 宽度**，否则偏移量算不出来，`sticky` 会叠在一起。
- 表格横向滚动条做了细化和半透明处理（8px 圆角滑块、透明轨道）。
- `row-click` 与内部的选择/展开点击互不干扰，后者会 `stopPropagation`。
