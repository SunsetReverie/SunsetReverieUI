# SrCheckbox 多选框

单个勾选，或配合 `SrCheckboxGroup` 做多选组。组模式支持半选态与全选。

<script setup>
import { ref } from 'vue'

const single = ref(true)
const multi = ref(['apple'])
const fruits = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'cherry', label: '樱桃' },
  { value: 'durian', label: '榴莲', disabled: true },
]
</script>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrCheckbox } from '@sunset-reverie/ui'

const checked = ref(true)
</script>

<template>
  <SrCheckbox v-model="checked" label="同意条款" />
</template>
```

## 单个使用

<div class="sr-demo">
  <SrCheckbox v-model="single" label="接收通知" />
  <SrCheckbox v-model="single" disabled label="禁用" />
  <SrCheckbox :model-value="true" indeterminate label="半选（只影响视觉）" />
</div>

## 多选组

组模式用 `SrCheckboxGroup` 包住多个 `SrCheckbox`，子项通过 `value` 标识：

<div class="sr-demo is-column">
  <SrCheckboxGroup v-model="multi">
    <SrCheckbox v-for="item in fruits" :key="item.value" :value="item.value" :disabled="item.disabled">
      {{ item.label }}
    </SrCheckbox>
  </SrCheckboxGroup>
  <span style="font-size: 13px; color: var(--vp-c-text-3)">已选：{{ multi.join('、') || '无' }}</span>
</div>

## 半选态

`indeterminate` 只影响视觉，不会改变 `modelValue`。典型用法是「全选」控件：部分选中时显示半选。

```vue
<SrCheckbox
  :model-value="allChecked"
  :indeterminate="someChecked && !allChecked"
  label="全选"
  @change="toggleAll"
/>
```

半选时点击会先变成全选（而不是取消），这符合用户预期。

## 尺寸与组级控制

<div class="sr-demo">
  <SrCheckbox v-model="single" size="sm" label="sm" />
  <SrCheckbox v-model="single" size="md" label="md" />
  <SrCheckbox v-model="single" size="lg" label="lg" />
</div>

`SrCheckboxGroup` 上的 `size` / `disabled` 会下发给所有子项，子项自己设的值优先。

## Props（SrCheckbox）

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | 单独使用时的值，支持 `v-model` |
| `value` | `string \| number \| boolean` | — | 组内使用时的标识 |
| `indeterminate` | `boolean` | `false` | 半选状态，只影响视觉 |
| `disabled` | `boolean` | `false` | 禁用 |
| `label` | `string` | `''` | 文字；也可用 `default` 插槽替代 |
| `size` | `SrSize` | 继承组/配置 | 尺寸档位 |
| `name` | `string` | `''` | 原生 name |

## Props（SrCheckboxGroup）

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `(string \| number \| boolean)[]` | `[]` | 选中的值集合 |
| `disabled` | `boolean` | `false` | 整组禁用 |
| `size` | `SrSize` | 继承配置 | 组级尺寸，子项可覆盖 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `value` | 值变化，配合 `v-model` |
| `change` | `value` | 同上，提交语义 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 勾选框右侧的标签内容 |

## 注意事项

- **单个使用时绑 `v-model`（布尔），组内使用时绑 `value`**。两种模式互斥：组内给 `modelValue` 会被组忽略。
- 组内子项的选中状态由组统一管理，子项自己不需要 `v-model`。
- `indeterminate` 是纯视觉标记，要自己根据「已选数量」算出来。
- 勾选框是 `10px` 圆角的小方块，选中后填充主色并显示对勾。
