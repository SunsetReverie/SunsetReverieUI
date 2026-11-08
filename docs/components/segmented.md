# SrSegmented 分段控制器

一排等宽的选项，选中项有一块会滑动的底板。用来切换**视图**——比如日/周/月、列表/图表。

<script setup>
import { ref } from 'vue'

const range = ref('week')
const rangeOptions = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '季', value: 'quarter' },
]

const view = ref('list')
const blockValue = ref('grid')
</script>

## 交互演示

<div class="sr-demo is-block">
  <SrSegmented v-model="range" :options="rangeOptions" />
</div>

切换时白色底板会滑过去，不是直接跳。

## 基础用法

```vue
<SrSegmented v-model="range" :options="[
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
]" />
```

选项**等宽**（grid 等分），所以滑块按百分比定位就够，不需要测量 DOM。代价是文案长短不一时，短的那个周围留白会多些。

## 带图标

```vue
<SrSegmented v-model="view" :options="[
  { label: '列表', value: 'list', icon: 'lucide:menu' },
  { label: '图表', value: 'chart', icon: 'lucide:eye' },
]" />
```

<div class="sr-demo is-block">
  <SrSegmented v-model="view" :options="[
    { label: '列表', value: 'list', icon: 'lucide:menu' },
    { label: '图表', value: 'chart', icon: 'lucide:eye' },
  ]" />
</div>

## 禁用

**单项禁用**：

<div class="sr-demo is-block">
  <SrSegmented :options="[
    { label: '全部', value: 'all' },
    { label: '进行中', value: 'active' },
    { label: '已完成', value: 'done' },
    { label: '已归档（不可选）', value: 'archived', disabled: true },
  ]" model-value="all" />
</div>

**整体禁用**——传在组件上，所有项都不可交互：

<div class="sr-demo is-block">
  <SrSegmented :options="[
    { label: '选项 A', value: 'a' },
    { label: '选项 B', value: 'b' },
  ]" model-value="a" disabled />
</div>

## 占满宽度

`block` 让每项等分容器宽度，适合和输入框上下对齐：

<div class="sr-demo is-block">
  <SrSegmented v-model="blockValue" :options="[
    { label: '网格', value: 'grid' },
    { label: '表格', value: 'table' },
    { label: '看板', value: 'board' },
  ]" block />
</div>

不传时宽度随内容，多个分段控制器并排时更紧凑。

## 尺寸

<div class="sr-demo is-block">
  <div style="display: flex; flex-direction: column; gap: 14px">
    <SrSegmented :options="rangeOptions.slice(0, 3)" model-value="week" size="xs" />
    <SrSegmented :options="rangeOptions.slice(0, 3)" model-value="week" size="sm" />
    <SrSegmented :options="rangeOptions.slice(0, 3)" model-value="week" />
    <SrSegmented :options="rangeOptions.slice(0, 3)" model-value="week" size="lg" />
  </div>
</div>

## 和 RadioGroup 怎么选

两个都能「多选一」，但语义不同：

| | SrSegmented | SrRadioGroup |
| --- | --- | --- |
| 视觉 | 标签栏，选中态很轻 | 表单项，圆圈 + 文字 |
| 布局 | 横向等分 | 纵向列表，可横向 |
| 用途 | **切换视图**（日/周/月、列表/网格） | **填写值**（性别、类型） |

判断标准：如果切换后「页面内容整体变了」，用 Segmented；如果只是「记录用户选了什么」，用 RadioGroup。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string \| number` | — | 当前选中值 |
| `options` | `SrSegmentedOption[]` | `[]` | 选项列表 |
| `block` | `boolean` | `false` | 占满容器宽度 |
| `disabled` | `boolean` | `false` | 整体禁用 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |

### SrSegmentedOption

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string` | 显示文案 |
| `value` | `string \| number` | 值 |
| `icon` | `string` | 图标名，放在文案前 |
| `disabled` | `boolean` | 禁用该项 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `value` | 选中值变化 |
| `change` | `value` | 切换了选项 |

点已选中的项**不派发事件**——值没变，没必要触发副作用。

## 注意事项

- **选项是等宽的**。文案长短差很多时，短的那项留白会明显，可以考虑缩短文案或加图标平衡。
- **未选中时不渲染滑块**。`modelValue` 传了不存在的值时同理，此时看起来像一排普通按钮。
- **`disabled` 在组件上是全禁**，在选项上是单项禁，两者可以叠加。
- **滑块动画在 `prefers-reduced-motion` 下关闭**。
