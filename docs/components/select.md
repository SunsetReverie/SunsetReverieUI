# SrSelect 选择器

下拉选择。单选、多选、可搜索、可清空，面板复用统一的浮层定位引擎。

<script setup>
import { ref } from 'vue'

const single = ref('a')
const multi = ref(['a'])
const searchable = ref('')
const empty = ref('')

const options = [
  { value: 'a', label: '选项 A' },
  { value: 'b', label: '选项 B' },
  { value: 'c', label: '选项 C', disabled: true },
  { value: 'd', label: '选项 D' },
]

const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安'].map((name) => ({
  value: name,
  label: name,
}))
</script>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrSelect } from '@sunset-reverie/ui'

const value = ref('a')
const options = [
  { value: 'a', label: '选项 A' },
  { value: 'b', label: '选项 B' },
]
</script>

<template>
  <SrSelect v-model="value" :options="options" />
</template>
```

## 单选与多选

<div class="sr-demo">
  <SrSelect v-model="single" :options="options" style="width: 180px" />
  <SrSelect v-model="multi" :options="options" multiple style="width: 260px" />
</div>

多选时 `modelValue` 是数组，已选项在触发器里渲染成可关闭的标签（复用 `SrTag`）。

## 可搜索

`filterable` 会在面板顶部加一个输入框，输入时按 `label` 过滤：

<div class="sr-demo">
  <SrSelect v-model="searchable" :options="cities" filterable placeholder="搜索城市" style="width: 180px" />
  <SrSelect v-model="empty" :options="options" clearable placeholder="可清空" style="width: 180px" />
</div>

右侧那个开了 `clearable`，有选中值时才出现清空按钮。

## 校验态

`status` 与 `SrInput` 保持一致，供 `SrFormItem` 复用：

| 值 | 表现 |
| --- | --- |
| `default` | 常规边框 |
| `error` | 红色边框 |
| `warning` | 橙色边框 |
| `success` | 绿色边框 |

```vue
<SrSelect v-model="value" :options="options" status="error" />
```

放在 `SrFormItem` 里时不用手动传，校验失败会自动下发。

## 自定义选项

`#option` 插槽可以完全自定义每个选项的渲染：

```vue
<SrSelect v-model="value" :options="options">
  <template #option="{ option, selected }">
    <span>{{ option.label }}</span>
    <SrTag v-if="selected" size="sm">已选</SrTag>
  </template>
</SrSelect>
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `SrSelectValue \| SrSelectValue[]` | — | 选中值；`multiple` 时为数组 |
| `options` | `SrSelectOption[]` | `[]` | 选项列表 |
| `multiple` | `boolean` | `false` | 多选 |
| `filterable` | `boolean` | `false` | 可搜索，面板顶部出现输入框 |
| `clearable` | `boolean` | `false` | 可清空 |
| `disabled` | `boolean` | `false` | 禁用 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |
| `status` | `'default' \| 'error' \| 'warning' \| 'success'` | `'default'` | 校验态 |
| `placeholder` | `string` | `'请选择'` | 占位文案 |
| `emptyText` | `string` | `'无匹配项'` | 无匹配项时的文案 |
| `maxHeight` | `number` | `260` | 面板最大高度（px），超出滚动 |

### SrSelectOption

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| number` | 选项值 |
| `label` | `string` | 展示文案 |
| `disabled` | `boolean` | 该项不可选 |

> 选项目前只支持平铺列表，没有分组与远程加载。需要分组时用 `#option` 插槽自己在数据里加标记。

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `value` | 选中值变化，配合 `v-model` |
| `change` | `value` | 同上，提交语义 |
| `visible-change` | `visible` | 面板开合 |
| `search` | `keyword` | 搜索关键词变化（`filterable` 时） |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `option` | 自定义选项渲染，作用域 `{ option, selected }` |

## 注意事项

- **多选不会关闭面板**，单选点完即关。
- 面板最大高度由 `maxHeight` 控制（默认 260px），超出后内部滚动，滚动条默认隐藏。
- 页面滚动时面板会跟着触发器重新定位；触发器滚出视口后自动关闭。
- 搜索是**纯前端过滤**，不做远程查询。需要远程搜索时监听 `search` 事件自己换 `options`。
