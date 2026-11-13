# SrNav 导航

侧边栏与顶栏导航。支持分组、两级子菜单、整体收起、品牌区与底部区，激活态有两种视觉语言。

<script setup>
import { ref } from 'vue'

const current = ref('overview')
const collapsed = ref(false)

const items = [
  { group: '工作台', key: 'overview', label: '概览', icon: 'lucide:house' },
  { group: '工作台', key: 'message', label: '消息', icon: 'lucide:inbox', badge: 12 },
  { group: '工作台', key: 'team', label: '团队', icon: 'lucide:heart', children: [
    { key: 'member', label: '成员' },
    { key: 'role', label: '角色' },
  ] },
  { group: '系统', key: 'setting', label: '设置', icon: 'lucide:settings', divider: true },
  { group: '系统', key: 'trash', label: '回收站', icon: 'lucide:trash' },
]

const styleItems = [
  { key: 'a', label: '概览', icon: 'lucide:house' },
  { key: 'b', label: '消息', icon: 'lucide:inbox', badge: 6 },
  { key: 'c', label: '设置', icon: 'lucide:settings' },
]
</script>

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

<div class="sr-demo is-column">
  <SrNav v-model="current" :items="items" />
</div>

侧边栏通常还要配合 `bare`：去掉导航自身的玻璃外壳，由外层容器提供通栏背景。

<div class="sr-demo is-block">
  <SrNav
    v-model="current"
    :items="items"
    mode="vertical"
    bare
    logo="lucide:moon-star"
    title="夕梦 UI"
    :width="200"
  />
</div>

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

<div class="sr-demo">
  <div>
    <span class="sr-demo__label">pill</span>
    <SrNav :items="styleItems" model-value="a" mode="vertical" active-style="pill" :width="160" />
  </div>
  <div>
    <span class="sr-demo__label">bar</span>
    <SrNav :items="styleItems" model-value="a" mode="vertical" active-style="bar" :width="160" />
  </div>
</div>

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

### 父项与普通项同级

父项和普通项共用同一个 `.sr-nav__item`，**高度、字号、图标尺寸完全相同**，唯一区别是多一个右侧箭头：

| | 高度 | 字号 | 图标 |
| --- | --- | --- | --- |
| 普通项 | 36px | 13px | 16px |
| 可折叠父项 | 36px | 13px | 16px |

整个「可折叠」这件事只体现在箭头上（`chevron-right`，展开时旋转 90° 变成向下）。子项才缩一级（32px / 12px），用来表达层级。

### 父项也能被选中

默认行为是**父项只负责展开，选中项只能是叶子节点**——因为多数后台的选中态代表"当前页面"，而父项通常不是页面。

但有些设计里父项本身就代表一个页面（比如「文章管理」有自己的概览页），此时打开 `selectableParent`：

```vue
<SrNav v-model="active" :items="items" mode="vertical" selectable-parent />
```

点父项会**同时**做两件事：展开子菜单、把 `modelValue` 设成父项自己的 key。这样父项能吃到 `is-active` 的激活样式，和普通项长得一样。

重复点已选中的父项只切换展开，不会重复派发 `update:modelValue`。

## 整体收起

`collapsed` 为真时只显示图标，宽度收窄到 `collapsedWidth`。此时：

- 品牌区只留图标方块，`title` 隐藏
- 徽标退化成右上角小圆点（56px 宽放不下数字）
- 有 `children` 的项悬停时在右侧弹出浮层显示子项
- 分组标题整块不渲染，避免留下可点击的空白

```vue
<SrNav v-model="current" :items="items" mode="vertical" :collapsed="isCollapsed" />
```

<div class="sr-demo is-block">
  <p style="margin: 0 0 12px">
    <SrButton size="sm" variant="outline" @click="collapsed = !collapsed">
      {{ collapsed ? '展开' : '收起' }}
    </SrButton>
  </p>
  <SrNav
    v-model="current"
    :items="items"
    mode="vertical"
    :collapsed="collapsed"
    logo="lucide:moon-star"
    title="夕梦 UI"
    :width="200"
  />
</div>

## 分组

同名 `group` 的导航项归为一组，只在垂直模式渲染分组标题（水平模式下一横排分组没有意义）。

分组默认可点击折叠。给分组首项设 `collapsible: false` 后，标题只作说明文字，不显示箭头也不可点：

```ts
{ group: '反馈组件', key: 'modal', label: 'Modal', collapsible: false }
```

> 分组折叠状态在收起态会被忽略——收起态只有图标，若沿用折叠状态，那组图标会一起消失。
>
> 宿主自己做搜索过滤时，把 `filter-active` 绑到「搜索词非空」上：结果里可能只剩某个已折叠组的最后一项，沿用折叠状态会出现「1 / 74 项」却一个条目都看不到。这个开关只临时架空折叠状态，不改用户手动收起的记录，清空搜索后原样恢复。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | 当前选中项的 key，支持 `v-model` |
| `items` | `SrNavItem[]` | `[]` | 导航项列表 |
| `mode` | `'horizontal' \| 'vertical'` | `'horizontal'` | 排列方向 |
| `activeStyle` | `'pill' \| 'bar'` | `'pill'` | 激活态视觉语言 |
| `bare` | `boolean` | `false` | 去壳：去掉圆角、边框、阴影与背景，用于通栏侧边栏 |
| `selectableParent` | `boolean` | `false` | 允许带子菜单的父项被选中 |
| `collapsed` | `boolean` | `false` | 整体收起，只显示图标 |
| `width` | `string \| number` | `220` | 展开宽度，数字按 px |
| `collapsedWidth` | `string \| number` | `56` | 收起宽度 |
| `maxHeight` | `string \| number` | — | 内容最大高度，超出时菜单区滚动且不显示滚动条 |
| `logo` | `string` | `''` | 品牌图标名 |
| `title` | `string` | `''` | 品牌名称，收起态隐藏 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |
| `disabled` | `boolean` | `false` | 禁用整个导航 |
| `filterActive` | `boolean` | `false` | 外部正在过滤 `items`（如侧栏搜索）：临时忽略分组折叠并禁用折叠按钮，结束后恢复原状态 |

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

- **默认父项不可选中**。`modelValue` 只接受叶子节点的 key；要让父项也能高亮，开 `selectableParent`。

- **SrNav 是受控组件，必须绑 `v-model`；它是「反映当前路由」的展示型组件，不自己记状态。**

- **滚动只发生在菜单区**。品牌区与 `#footer` 固定在两端，菜单区用 `flex: 1` + `min-height: 0` 承担滚动，滚动条默认隐藏。
- **收起态浮层靠 CSS `:hover` 驱动**，不用 JS 事件。图标与浮层之间有 10px 间隙，用透明伪元素覆盖，鼠标横移时不会误关。
- **`bare` 与 `maxHeight` 同时用时**，高度由父容器决定，`maxHeight` 不再生效。
- 水平模式不支持分组标题、分割线与收起态浮层。
