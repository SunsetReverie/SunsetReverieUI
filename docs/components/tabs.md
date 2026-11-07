# SrTabs 标签页

切换同层级内容。四种外观、支持垂直方向与懒加载。面板内容通过 `#panel-<key>` 插槽传入，不走子组件。

<script setup>
import { ref } from 'vue'

const lineTab = ref('a')
const cardTab = ref('a')
const segmentTab = ref('a')
const pillTab = ref('a')
const verticalTab = ref('a')
const plainTab = ref('a')
const lazyTab = ref('a')

const items = [
  { key: 'a', label: '概览' },
  { key: 'b', label: '配置' },
  { key: 'c', label: '禁用', disabled: true },
]

const iconItems = [
  { key: 'a', label: '首页', icon: 'lucide:house' },
  { key: 'b', label: '文件', icon: 'lucide:inbox' },
  { key: 'c', label: '设置', icon: 'lucide:settings' },
]
</script>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrTabs } from '@sunset-reverie/ui'

const current = ref('a')
const items = [
  { key: 'a', label: '概览' },
  { key: 'b', label: '配置' },
]
</script>

<template>
  <SrTabs v-model="current" :items="items">
    <template #panel-a>概览内容</template>
    <template #panel-b>配置内容</template>
  </SrTabs>
</template>
```

## 外观

`type` 四选一，决定标签的视觉形态：

| 值 | 形态 | 适用 |
| --- | --- | --- |
| `line`（默认） | 下划线指示 | 页面级导航 |
| `card` | 连接式卡片，选中项与内容区连通 | 后台详情页 |
| `segment` | 背板内浮起，类似分段控件 | 视图模式切换 |
| `pill` | 实色胶囊，未选中项带淡底 | 筛选栏、设置面板 |

<div class="sr-demo is-column">
  <div>
    <span class="sr-demo__label">line</span>
    <SrTabs v-model="lineTab" :items="items" type="line" size="sm" />
  </div>
  <div>
    <span class="sr-demo__label">card</span>
    <SrTabs v-model="cardTab" :items="items" type="card" size="sm">
      <template #panel-a>概览内容</template>
      <template #panel-b>配置内容</template>
    </SrTabs>
  </div>
  <div>
    <span class="sr-demo__label">segment</span>
    <SrTabs v-model="segmentTab" :items="iconItems" type="segment" size="sm" />
  </div>
  <div>
    <span class="sr-demo__label">pill</span>
    <SrTabs v-model="pillTab" :items="items" type="pill" size="sm" />
  </div>
</div>

## 垂直方向

`direction="vertical"` 改成左栏导航 + 右栏内容，指示器从下划线换成右侧竖线。

<div class="sr-demo is-block">
  <SrTabs v-model="verticalTab" :items="items" direction="vertical" size="sm" style="min-height: 120px">
    <template #panel-a>左侧点「配置」切换</template>
    <template #panel-b>这是配置面板</template>
  </SrTabs>
</div>

## 无背板模式

`bordered="false"` 去掉背板与边框，只保留文字与选中态，适合嵌在已有容器里：

<div class="sr-demo">
  <SrTabs v-model="plainTab" :items="items" type="pill" :bordered="false" size="sm" />
</div>

## 懒加载与关闭

`lazy` 让未激活过的面板不渲染；`closable` 让所有标签可关闭（单个标签可用 `items[].closable` 覆盖）。

```vue
<SrTabs v-model="current" :items="items" lazy closable @close="remove">
  <template #panel-a>这一块在首次点开「概览」时才挂载</template>
</SrTabs>
```

<div class="sr-demo">
  <SrTabs v-model="lazyTab" :items="items" lazy size="sm">
    <template #panel-a>概览面板</template>
    <template #panel-b>配置面板</template>
  </SrTabs>
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | 当前激活的 key，支持 `v-model` |
| `items` | `SrTabsItem[]` | `[]` | 标签列表 |
| `type` | `'line' \| 'card' \| 'segment' \| 'pill'` | `'line'` | 外观 |
| `bordered` | `boolean` | `true` | 是否显示背板与边框 |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 排列方向 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |
| `closable` | `boolean` | `false` | 全部标签可关闭 |
| `lazy` | `boolean` | `false` | 未激活过的面板不渲染 |

### SrTabsItem

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `key` | `string` | 唯一标识，同时作为面板插槽名 `panel-<key>` |
| `label` | `string` | 标签文案 |
| `icon` | `string` | 图标名 |
| `disabled` | `boolean` | 不可切换 |
| `closable` | `boolean` | 单个标签可关闭，覆盖全局 `closable` |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `key` | 激活项变化 |
| `change` | `key` | 同上，提交语义 |
| `tab-click` | `key` | 点击标签（禁用项不触发） |
| `close` | `key` | 点击关闭按钮 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `panel-<key>` | 某个标签对应的面板内容 |
| `panel` | 通用面板，作用域 `{ item }`，用于所有标签共用一套渲染 |

## 注意事项

- **没有 `modelValue` 时默认激活第一项**，这个补全发生在挂载后，所以服务端渲染出的 HTML 里没有任何标签是选中态——这是刻意为之，否则首帧结构会和客户端不一致。
- `lazy` 只影响首次挂载：切走再切回不会重建面板，状态得以保留。
- 键盘可用左右方向键在标签间移动，Home / End 跳到首尾。
- `card` 外观的标签之间共用边框（相邻标签去掉左边框），避免出现双线。
