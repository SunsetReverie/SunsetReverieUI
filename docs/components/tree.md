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
| `modelValue` | `SrTreeKey[]` | `[]` | 选中的 key |
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

## 暴露的方法

| 方法 | 说明 |
| --- | --- |
| `leafCheckedKeys` | 只含叶子节点的勾选集合 |
| `rows` | 当前扁平化后的可见行 |

## 注意事项

- **`key` 必须唯一且稳定**。用数组下标当 key，增删节点后选中态会错乱。
- **`check` 事件里的 `keys` 含父节点**。勾选一个父节点会把它自己的 key 也加进去，业务方通常只关心叶子——用 `halfCheckedKeys` 判断半选，或用暴露的 `leafCheckedKeys`。
- 虚拟滚动下如果自定义了行高，`itemHeight` 必须同步，否则可视区计算和实际渲染对不上。
- **没有实现拖拽排序**。拖拽要引入 `sortablejs`，会破坏「零运行时依赖」的定位；而且树形拖拽的交互细节（跨层、禁用节点、防成环）本身就够写一个组件，需要时单独评估。
- **没有实现异步加载子节点**。`children` 需要一次性给全；懒加载要处理 loading 态、失败重试、展开中状态，是另一套逻辑。
