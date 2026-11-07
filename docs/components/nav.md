# SrNav 导航

侧边栏与顶栏导航。支持分组、两级子菜单、整体收起、品牌区与底部区，激活态有两种视觉语言。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrNav, type SrNavItem } from '@sunset-reverie/ui'

const current = ref('overview')

const items: SrNavItem[] = [
  { group: '工作台', key: 'overview', label: '概览', icon: 'lucide:house' },
  { group: '工作台', key: 'message', label: '消息', icon: 'lucide:inbox', badge: 12 },
  { group: '系统', key: 'setting', label: '设置', icon: 'lucide:settings', divider: true },
]
</script>

<template>
  <SrNav v-model="current" :items="items" mode="vertical" logo="lucide:moon-star" title="夕梦 UI" />
</template>
```

## 方向

`mode="horizontal"`（默认）是顶栏形态，激活项用底部指示条；`mode="vertical"` 是侧边栏形态，激活项是整块。

侧边栏通常还要配合 `bare`：去掉导航自身的玻璃外壳，由外层容器提供通栏背景。

```vue
<aside class="side">
  <SrNav bare v-model="current" :items="items" mode="vertical" />
</aside>
```

```css
.side {
  height: 100%;
  border-right: 1px solid var(--sr-color-border-subtle);
}
```

## 激活样式

`activeStyle` 决定选中项怎么表达：

| 值 | 形态 | 适用 |
| --- | --- | --- |
| `pill`（默认） | 实色主色胶囊 + 同色柔光 | 顶栏、深色底 |
| `bar` | 淡主色底 + 左侧 3px 竖条 | 侧边栏，色弱用户也能分辨 |

## 品牌区与底部区

设置 `logo` 与 `title` 后，导航顶部会渲染品牌区，高度固定 56px，底部分隔线可与页面 header 对齐。

底部用 `#footer` 插槽，会自动推到容器底部（`margin-top: auto`）：

```vue
<SrNav bare :items="items" mode="vertical" logo="lucide:moon-star" title="夕梦 UI">
  <template #footer>
    <SrAvatar alt="林" size="sm" />
    <span>林深</span>
  </template>
</SrNav>
```

需要完全自定义品牌区时用 `#header` 插槽覆盖。

## 两级子菜单

给导航项配置 `children` 即可，点击父项就地展开，子项缩进并用左侧竖线表达层级。

```ts
const items: SrNavItem[] = [
  {
    key: 'res',
    label: '资源',
    icon: 'lucide:inbox',
    children: [
      { key: 'file', label: '文件' },
      { key: 'image', label: '图片' },
    ],
  },
]
```

## 整体收起

`collapsed` 为真时只显示图标，宽度收窄到 `collapsedWidth`。此时：

- 品牌区只留图标方块，`title` 隐藏
- 徽标退化成右上角小圆点（56px 宽放不下数字）
- 有 `children` 的项悬停时在右侧弹出浮层显示子项
- 分组标题整块不渲染，避免留下可点击的空白

```vue
<SrNav v-model="current" :items="items" mode="vertical" :collapsed="isCollapsed" />
```

## 分组

同名 `group` 的导航项归为一组，只在垂直模式渲染分组标题（水平模式下一横排分组没有意义）。

分组默认可点击折叠。给分组首项设 `collapsible: false` 后，标题只作说明文字，不显示箭头也不可点：

```ts
{ group: '反馈组件', key: 'modal', label: 'Modal', collapsible: false }
```

> 分组折叠状态在收起态会被忽略——收起态只有图标，若沿用折叠状态，那组图标会一起消失。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | 当前选中项的 key，支持 `v-model` |
| `items` | `SrNavItem[]` | `[]` | 导航项列表 |
| `mode` | `'horizontal' \| 'vertical'` | `'horizontal'` | 排列方向 |
| `activeStyle` | `'pill' \| 'bar'` | `'pill'` | 激活态视觉语言 |
| `bare` | `boolean` | `false` | 去壳：去掉圆角、边框、阴影与背景，用于通栏侧边栏 |
| `collapsed` | `boolean` | `false` | 整体收起，只显示图标 |
| `width` | `string \| number` | `220` | 展开宽度，数字按 px |
| `collapsedWidth` | `string \| number` | `56` | 收起宽度 |
| `maxHeight` | `string \| number` | — | 内容最大高度，超出时菜单区滚动且不显示滚动条 |
| `logo` | `string` | `''` | 品牌图标名 |
| `title` | `string` | `''` | 品牌名称，收起态隐藏 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |
| `disabled` | `boolean` | `false` | 禁用整个导航 |

### SrNavItem

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `key` | `string` | 唯一标识，选中与展开都靠它；有 `children` 的父项也需要 |
| `label` | `string` | 文案 |
| `icon` | `string` | 图标名 |
| `badge` | `string \| number` | 徽标；收起态只显示圆点 |
| `disabled` | `boolean` | 该项不可点 |
| `group` | `string` | 分组标题，与上一项不同时渲染 |
| `divider` | `boolean` | 上方加一条分割线 |
| `children` | `SrNavItem[]` | 子菜单 |
| `collapsible` | `boolean` | 该分组是否可折叠，挂在分组首项上 |
| `collapsed` | `boolean` | 该分组默认收起 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `key` | 选中项变化，配合 `v-model` |
| `select` | `key, item` | 选中某项（点击有子项的父项时不触发） |
| `update:openedKeys` | `keys` | 子菜单展开集合变化 |
| `update:collapsed` | `collapsed` | 收起状态变化 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `header` | 自定义品牌区，覆盖默认的 `logo` + `title` |
| `footer` | 底部固定区，自动推到底部 |

## 注意事项

- **滚动只发生在菜单区**。品牌区与 `#footer` 固定在两端，菜单区用 `flex: 1` + `min-height: 0` 承担滚动，滚动条默认隐藏。
- **收起态浮层靠 CSS `:hover` 驱动**，不用 JS 事件。图标与浮层之间有 10px 间隙，用透明伪元素覆盖，鼠标横移时不会误关。
- **`bare` 与 `maxHeight` 同时用时**，高度由父容器决定，`maxHeight` 不再生效。
- 水平模式不支持分组标题、分割线与收起态浮层。
