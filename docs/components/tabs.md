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
const sortTab = ref('latest')

const sortItems = [
  { key: 'latest', label: '最新' },
  { key: 'hot', label: '最热' },
  { key: 'pick', label: '推荐' },
]

const postRanks = {
  latest: [
    { title: 'Vue 3.5 的响应式又快了三成', meta: '3 小时前' },
    { title: 'Nuxt 4 目录结构迁移笔记', meta: '昨天' },
  ],
  hot: [
    { title: '一张图看懂 SSR 与 CSR 的取舍', meta: '阅读 1.2w' },
    { title: '手写一个虚拟滚动列表', meta: '阅读 8k' },
  ],
  pick: [
    { title: '组件库的视觉一致性怎么守', meta: '编辑推荐' },
    { title: '从零搭建一套设计令牌', meta: '编辑推荐' },
  ],
}

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
| `pill` | 实色圆角标签，未选中项带淡底 | 筛选项、前台列表排序 |

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

## 前台列表排序

前台栏目的「最新 / 最热 / 推荐」这类文字切换，`type="pill"` 最省事：一排等高标签，选中项主色实底白字，其余淡主色底。圆角按标签高度等比取（`md` 40px → 8px），是圆角矩形而不是全圆胶囊——椭圆在小尺寸上显得过软，也会挤占左右留白。

<div class="sr-demo is-block">
  <SrTabs v-model="sortTab" :items="sortItems" type="pill" size="sm">
    <template #panel="{ item }">
      <ul style="display: flex; flex-direction: column; gap: 10px; margin: 0; padding: 0; list-style: none">
        <li v-for="(post, index) in postRanks[item.key]" :key="post.title" style="display: flex; align-items: center; gap: 8px">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 5px; background: var(--sr-color-primary-alpha-08); color: var(--sr-color-text-tertiary); font-size: 11px">{{ index + 1 }}</span>
          <span style="flex: 1; color: var(--sr-color-text-secondary); font-size: 13px">{{ post.title }}</span>
          <span style="color: var(--sr-color-text-tertiary); font-size: 12px">{{ post.meta }}</span>
        </li>
      </ul>
    </template>
  </SrTabs>
</div>

通用 `#panel` 插槽透出当前 `item`，换档位时直接按 `item.key` 取对应数据，不用为每一档写一个插槽：

```vue
<SrTabs v-model="sort" :items="sortItems" type="pill">
  <template #panel="{ item }">
    <ul>
      <li v-for="post in listBySort[item.key]" :key="post.title">{{ post.title }}</li>
    </ul>
  </template>
</SrTabs>
```

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
- `pill` 的圆角是 `calc(标签高度 * 0.2)`（`md` 8px、`sm` 6.8px），hover 与竖排都沿用同一个变量，不会出现圆角跳变；想回到全圆胶囊把 `--sr-tabs-tab-radius` 覆盖成 `var(--sr-radius-full)` 即可。
