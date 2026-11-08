# SrTree 树形控件

展开折叠、复选联动（含半选）、虚拟滚动。父子勾选联动逻辑自研，不依赖任何树库。

<script setup>
import { ref } from 'vue'
import { SrTag } from '@sunset-reverie/ui'

const selected = ref([])
const checked = ref([])
const halfKeys = ref([])
const strictChecked = ref([])
const single = ref([])

const catalog = [
  {
    key: 'design',
    label: '设计系统',
    children: [
      { key: 'token', label: 'Token' },
      {
        key: 'component',
        label: '组件',
        children: [
          { key: 'button', label: 'SrButton' },
          { key: 'input', label: 'SrInput' },
          { key: 'table', label: 'SrTable' },
        ],
      },
    ],
  },
  {
    key: 'project',
    label: '工程',
    children: [
      { key: 'build', label: '构建' },
      { key: 'test', label: '测试' },
      { key: 'docs', label: '文档（禁用）', disabled: true },
    ],
  },
  { key: 'about', label: '关于' },
]

function onCheck(keys, detail) {
  halfKeys.value = detail.halfCheckedKeys
}

const bigTree = Array.from({ length: 40 }, (_, g) => ({
  key: `g${g}`,
  label: `分组 ${g + 1}`,
  children: Array.from({ length: 20 }, (_, i) => ({
    key: `g${g}-${i}`,
    label: `条目 ${g * 20 + i + 1}`,
  })),
}))
const bigExpanded = ref(['g0', 'g1'])
</script>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrTree } from '@sunset-reverie/ui'

const data = [
  {
    key: 'a',
    label: '设计',
    children: [{ key: 'a1', label: 'Token' }],
  },
]

const selected = ref([])
</script>

<template>
  <SrTree v-model="selected" :data="data" default-expand-all />
</template>
```

## 基础用法

<div class="sr-demo is-block">
  <SrTree v-model="selected" :data="catalog" default-expand-all />
  <p style="margin: 10px 0 0; font-size: 13px; color: var(--vp-c-text-3)">
    选中：<SrTag v-for="key in selected" :key="key" size="sm">{{ key }}</SrTag>
    <template v-if="!selected.length">无</template>
  </p>
</div>

点箭头展开收起，点文字选中。`expandOnClickNode` 可以让整行点击都切换展开。

## 复选框与半选

<div class="sr-demo is-block">
  <SrTree v-model="checked" :data="catalog" checkable default-expand-all @check="onCheck" />
  <p style="margin: 10px 0 0; font-size: 13px; color: var(--vp-c-text-3)">
    已勾选 {{ checked.length }} 个，半选 {{ halfKeys.length }} 个
  </p>
</div>

默认**父子联动**：

| 操作 | 结果 |
| --- | --- |
| 勾父节点 | 所有子孙一起勾上 |
| 取消父节点 | 所有子孙一起取消 |
| 子节点全选中 | 父节点自动变为选中 |
| 子节点部分选中 | 父节点显示为半选（方块） |

`checkStrictly` 关掉联动，每个节点独立：

<div class="sr-demo is-block">
  <SrTree v-model="strictChecked" :data="catalog" checkable check-strictly default-expand-all />
</div>

## 单选

`multiple="false"` 时只能选中一项：

<div class="sr-demo is-block">
  <SrTree v-model="single" :data="catalog" :multiple="false" default-expand-all />
</div>

## 键盘操作

树整体接收一个 Tab 焦点，内部用方向键移动——这样 Tab 不会在几十个节点之间反复停留。

| 按键 | 行为 |
| --- | --- |
| `↑` `↓` | 上下移动焦点 |
| `→` | 展开当前节点；已展开则进入第一个子节点 |
| `←` | 收起当前节点；已收起则回到父节点 |
| `空格` | 切换勾选（不可勾选时改为选中） |
| `Enter` | 选中当前节点 |
| `Home` `End` | 跳到首行 / 末行 |

`keyboard={false}` 可以整体关掉。焦点行会滚动进可视区，虚拟滚动模式下同样有效。

## 异步加载

```vue
<SrTree :data="base" :load-data="loadChildren" />
```

```ts
const loadChildren = async (node) => {
  const res = await fetch(`/api/children/${node.key}`)
  return res.json()
}
```

节点**没有 `children` 且未加载过**时，展开会先调用 `loadData`：

1. 立即展开并显示转圈（不是「点了没反应」）
2. 请求返回后把结果挂上去并铺开
3. 同一个节点再次展开不会重复请求

返回空数组时该节点会被标记成叶子，箭头随之消失——否则用户点开永远是空的。

## 拖拽排序

```vue
<SrTree :data="tree" draggable @node-drop="onDrop" />
```

拖到行内的不同位置代表不同含义：

| 落点 | 结果 |
| --- | --- |
| 上 1/4 | 放到该节点**之前**（同级） |
| 中间一半 | 放进该节点**内部**（成为子节点） |
| 下 1/4 | 放到该节点**之后**（同级） |

落点会有视觉提示：前后是一条 2px 的靛蓝横线，内部是整行高亮加描边。

**不允许的操作**会自动拒绝：拖到自己身上、拖进自己的子树（会让树变成环）。

```ts
function onDrop({ dragNode, dropNode, type }, data) {
  // data 是移动后的完整新树，直接替换即可
  tree.value = data
}
```

**鼠标和触屏都支持**：

| 设备 | 启动方式 |
| --- | --- |
| 鼠标 | 按住并拖动，超过 4px 才算拖拽（否则是点击） |
| 触屏 | 长按约 260ms 后开始拖；手指一动就取消（说明用户想滚动） |

实现用的是 Pointer Events，不是原生 Drag & Drop —— 后者在触屏上根本不触发事件。没有引入 `sortablejs`，保持零运行时依赖。

## 复用拖拽逻辑

树的拖拽底层是 `useSrDragSort`——一个组合式函数，只认「key + 元素」，不关心数据结构。

```ts
import { useSrDragSort } from '@sunset-reverie/ui'
```

完整用法（基础列表、跨列表看板、样式约定、空列表处理）见 [拖拽排序](/guide/drag-sort)。

树在这一层之上额外做了两件事：**防成环**（不能把父节点拖进自己的子树）和**层级判断**（`inside` 才是成为子节点）。那部分是树自己的逻辑，不走通用 composable。

## 虚拟滚动

数据量大时开 `virtual`，只渲染可视区内的行：

<div class="sr-demo is-block">
  <SrTree v-model:expanded-keys="bigExpanded" :data="bigTree" virtual :height="280" checkable />
</div>

800 个节点，实际 DOM 只有十几个。不开的话展开全部时会有 800 个节点同时存在，滚动明显掉帧。

`itemHeight` 默认 32px，虚拟滚动按它计算可视区行数——**如果自定义了行高，必须同步传这个值**，否则滚动位置会错位。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `SrTreeNode[]` | `[]` | 树数据 |
| `modelValue` | `SrTreeKey[]` | — | 选中的 key；**不传就是非受控**，组件自己维护 |
| `defaultCheckedKeys` | `SrTreeKey[]` | `[]` | 非受控时的初始勾选 |
| `expandedKeys` | `SrTreeKey[]` | — | 展开的 key，受控时用它 |
| `defaultExpandedKeys` | `SrTreeKey[]` | `[]` | 默认展开 |
| `defaultExpandAll` | `boolean` | `false` | 默认展开全部 |
| `checkable` | `boolean` | `false` | 显示复选框 |
| `checkStrictly` | `boolean` | `false` | 父子不联动 |
| `multiple` | `boolean` | `true` | 允许多选 |
| `selectable` | `boolean` | `true` | 点击文字可选中 |
| `expandOnClickNode` | `boolean` | `false` | 点整行切换展开 |
| `disabled` | `boolean` | `false` | 禁用 |
| `showLine` | `boolean` | `false` | 显示连接线 |
| `indent` | `number` | `18` | 每层缩进（px） |
| `emptyText` | `string` | `'暂无数据'` | 空数据文案 |
| `keyboard` | `boolean` | `true` | 开启键盘导航 |
| `draggable` | `boolean` | `false` | 允许拖拽调整位置 |
| `allowDrop` | `(drag, drop, type) => boolean` | — | 判断能否拖放，返回 false 拒绝 |
| `loadData` | `(node) => Promise<SrTreeNode[]>` | — | 异步加载子节点 |
| `virtual` | `boolean` | `false` | 开启虚拟滚动 |
| `height` | `number` | `320` | 虚拟滚动容器高度 |
| `itemHeight` | `number` | `32` | 行高，虚拟滚动依赖它 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |

### SrTreeNode

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `key` | `string \| number` | 唯一标识，必填 |
| `label` | `string` | 显示文本 |
| `icon` | `string` | 图标名 |
| `disabled` | `boolean` | 禁用该节点 |
| `children` | `SrTreeNode[]` | 子节点 |
| `isLeaf` | `boolean` | 强制标记为叶子（隐藏展开箭头） |
| 其它字段 | `unknown` | 可以挂任意业务数据，原样带回事件 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `keys` | 选中变化 |
| `update:expandedKeys` | `keys` | 展开变化 |
| `check` | `keys, { checked, node, halfCheckedKeys }` | 勾选变化 |
| `expand` | `keys, { node, expanded }` | 展开收起 |
| `node-click` | `node` | 点击节点 |
| `load` | `node, children` | 异步加载完成 |
| `node-drop` | `{ dragNode, dropNode, type }, data` | 拖放完成，`data` 是移动后的新树 |

## 暴露的方法

| 方法 | 说明 |
| --- | --- |
| `leafCheckedKeys` | 只含叶子节点的勾选集合 |
| `rows` | 当前扁平化后的可见行 |

## 注意事项

- **`key` 必须唯一且稳定**。用数组下标当 key，增删节点后选中态会错乱。
- **不传 `v-model` 也能勾选**。组件内部维护一份状态，只在传了 `modelValue` 时才要求你更新它。所以「`checkable` 但忘了绑 `v-model`」不会变成点了没反应。
- **`check` 事件里的 `keys` 含父节点**。勾选一个父节点会把它自己的 key 也加进去，业务方通常只关心叶子——用 `halfCheckedKeys` 判断半选，或用暴露的 `leafCheckedKeys`。
- 虚拟滚动下如果自定义了行高，`itemHeight` 必须同步，否则可视区计算和实际渲染对不上。
- **拖拽在触屏上需要长按**。按住约 260ms 才开始，太快会被识别成滚动或点击。
- **异步加载失败后不会自动重试**。`loadData` 抛错时节点保持展开但为空，再次点击箭头才会重新请求；需要重试策略的话在 `loadData` 内部处理。
- **拖拽只改内部数据副本**。`data` 传进来后组件会克隆一份，所以拖拽不会污染父组件的原数组——但也意味着必须监听 `node-drop` 才能把结果写回去。
