# SrCollapse 折叠面板组

把一组长内容收起来，只露出标题。和 `SrPanel` 的区别：`SrPanel` 是**单个**可折叠容器，`SrCollapse` 是**一组**面板的列表，支持手风琴互斥。

<script setup>
import { ref } from 'vue'

const basicItems = [
  { key: '1', title: '什么是设计 Token', content: 'Token 是设计决策的最小单位，把颜色、间距、字号这些值命名后统一管理。' },
  { key: '2', title: '为什么要分三层', content: '原始值、语义、组件三层各管一段：改一处原始色，所有语义和组件跟着变。' },
  { key: '3', title: 'glass 和 flat 的区别', content: 'glass 用半透明背景加模糊，flat 用实色。两者共用同一套语义变量。' },
]

const basicOpen = ref(['1'])
const accordionOpen = ref(['a'])

const accordionItems = [
  { key: 'a', title: '第一步：创建项目', content: '用 pnpm create vite 建一个 Vue 3 项目。' },
  { key: 'b', title: '第二步：引入样式', content: '在 main.ts 里 import 样式文件。' },
  { key: 'c', title: '第三步：开始使用', content: '组件已全局可用，也可以按需引入。' },
]
</script>

## 交互演示

<div class="sr-demo is-block">
  <SrCollapse v-model="basicOpen" :items="basicItems" />
  <div style="display: flex; gap: 8px; margin-top: 12px">
    <SrButton size="xs" variant="outline" @click="basicOpen = []">全部收起</SrButton>
    <SrButton size="xs" variant="outline" @click="basicOpen = ['1', '2', '3']">全部展开</SrButton>
  </div>
</div>

## 基础用法

```vue
<SrCollapse v-model="open" :items="[
  { key: '1', title: '标题一', content: '内容一' },
  { key: '2', title: '标题二', content: '内容二' },
]" />
```

```ts
const open = ref<string[]>(['1'])   // 默认展开第一项
```

点标题、箭头或右侧区域都能切换。

## 手风琴

`accordion` 让同一时刻只展开一个——展开新的会自动收起之前的：

<div class="sr-demo is-block">
  <SrCollapse v-model="accordionOpen" :items="accordionItems" accordion />
</div>

实现上不是「禁掉其他项」，而是把 `modelValue` 直接替换成 `[新key]`。所以开着手风琴时，`v-model` 里的数组最多只有一个元素。

适合 FAQ、步骤说明这类「一次只看一条」的内容。

## 附加信息

`extra` 放在标题右侧，通常放条数或状态：

<div class="sr-demo is-block">
  <SrCollapse :items="[
    { key: 'todo', title: '待办', extra: '3', content: '补文档、写测试、改样式' },
    { key: 'done', title: '已完成', extra: '12', content: '定 API、搭骨架、接接口' },
    { key: 'archived', title: '已归档（不可展开）', extra: '48', content: '这里的内容看不到', disabled: true },
  ]" :model-value="['todo']" />
</div>

`disabled` 的面板点击无反应，箭头和文字都变灰。

## 无边框

`ghost` 去掉外框和背景，适合嵌在卡片里：

<div class="sr-demo is-block">
  <div style="padding: 14px; border: 1px solid var(--sr-color-border-subtle); border-radius: 8px">
    <SrCollapse :items="basicItems" :model-value="['1']" ghost />
  </div>
</div>

不加这个的话，卡片里再套一个带边框的折叠组，会出现「框中框」。

## 自定义内容

`#item` 插槽替换 `content`，可以放列表、表格甚至另一个折叠组：

<div class="sr-demo is-block">
  <SrCollapse :items="[{ key: 'x', title: '更多信息' }]" :model-value="['x']">
    <template #item>
      <ul style="margin: 0; padding-left: 18px; line-height: 1.9">
        <li>支持放列表、表格、表单</li>
        <li>内容高度不限，展开动画按实际高度过渡</li>
      </ul>
    </template>
  </SrCollapse>
</div>

`#title` 插槽可以给标题加标签：

<div class="sr-demo is-block">
  <SrCollapse
    :items="[
      { key: '1', title: '设计系统', content: 'Token、主题、响应式三块内容。' },
      { key: '2', title: '组件库', content: '44 个组件，覆盖后台常见场景。' },
    ]"
    :model-value="['1']"
  >
    <template #title="{ item }">
      <span style="display: inline-flex; align-items: center; gap: 8px">
        {{ item.title }}
        <SrTag type="info" size="sm">{{ item.key === '1' ? '文档' : '代码' }}</SrTag>
      </span>
    </template>
  </SrCollapse>
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `SrCollapseKey[]` | `[]` | 展开的面板 key，配合 `v-model` |
| `items` | `SrCollapseItem[]` | `[]` | 面板数据 |
| `accordion` | `boolean` | `false` | 手风琴模式（只开一个） |
| `ghost` | `boolean` | `false` | 无边框无背景 |

### SrCollapseItem

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `key` | `string \| number` | 标识 |
| `title` | `string` | 标题 |
| `content` | `string` | 内容，可用 `#item` 插槽替代 |
| `extra` | `string` | 右侧附加文字 |
| `disabled` | `boolean` | 禁用，不可展开 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `keys` | 展开状态变化 |
| `change` | `keys, key` | 某一项被展开或收起，`key` 是触发的那一项 |

## 插槽

| 名称 | 参数 | 说明 |
| --- | --- | --- |
| `item` | `{ item, open }` | 自定义内容 |
| `title` | `{ item, open }` | 自定义标题 |

## 注意事项

- **手风琴模式下 `modelValue` 最多一个元素**。组件内部会替换数组，不是追加。
- **展开动画用 `grid-template-rows: 0fr → 1fr`**，不用 `max-height`。后者得猜一个大值，内容少时过渡会「先快后慢」。
- **`prefers-reduced-motion` 下无动画**，直接出现。
- **内容里有表单时注意**：收起只是视觉隐藏，DOM 还在，表单值不会丢——这通常是好事，但如果你希望收起时重置，得自己监听 `change`。
