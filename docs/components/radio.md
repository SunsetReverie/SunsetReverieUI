# SrRadio 单选框

从一组互斥选项里选一个。`SrRadioGroup` 负责管理选中值，子项通过 `value` 标识。

<script setup>
import { ref } from 'vue'

const picked = ref('standard')
const plans = [
  { value: 'free', label: '免费版' },
  { value: 'standard', label: '标准版' },
  { value: 'pro', label: '专业版' },
  { value: 'enterprise', label: '企业版', disabled: true },
]
</script>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrRadio, SrRadioGroup } from '@sunset-reverie/ui'

const picked = ref('a')
</script>

<template>
  <SrRadioGroup v-model="picked">
    <SrRadio value="a" label="选项 A" />
    <SrRadio value="b" label="选项 B" />
  </SrRadioGroup>
</template>
```

## 单选组

<div class="sr-demo is-column">
  <SrRadioGroup v-model="picked">
    <SrRadio v-for="plan in plans" :key="plan.value" :value="plan.value" :disabled="plan.disabled">
      {{ plan.label }}
    </SrRadio>
  </SrRadioGroup>
  <span style="font-size: 13px; color: var(--c-text-3, var(--vp-c-text-3))">已选：{{ picked }}</span>
</div>

## 横向排列

组默认是纵向排列。需要横排时给组加 `style` 或用容器包一层：

<div class="sr-demo">
  <SrRadioGroup v-model="picked" style="flex-direction: row; gap: 20px">
    <SrRadio value="standard" label="标准" />
    <SrRadio value="pro" label="专业" />
  </SrRadioGroup>
</div>

## 禁用

单个选项用 `disabled`，整组用组上的 `disabled`：

<div class="sr-demo is-column">
  <SrRadioGroup v-model="picked">
    <SrRadio value="standard" label="可点" />
    <SrRadio value="pro" label="不可点" disabled />
  </SrRadioGroup>

  <SrRadioGroup v-model="picked" disabled>
    <SrRadio value="standard" label="整组禁用 A" />
    <SrRadio value="pro" label="整组禁用 B" />
  </SrRadioGroup>
</div>

## 独立使用

不放在组里时，`SrRadio` 自己绑 `v-model` 也能用，但这样就失去了互斥语义——多个独立单选不会自动取消彼此，通常只在特殊布局下这么用。

## Props（SrRadio）

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string \| number \| boolean` | — | 单独使用时的值 |
| `value` | `string \| number \| boolean` | — | 组内使用时的标识，**必填** |
| `disabled` | `boolean` | `false` | 禁用 |
| `label` | `string` | `''` | 文字；也可用 `default` 插槽替代 |
| `size` | `SrSize` | 继承组/配置 | 尺寸档位 |
| `name` | `string` | `''` | 原生 name |

## Props（SrRadioGroup）

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string \| number \| boolean` | — | 选中值 |
| `disabled` | `boolean` | `false` | 整组禁用 |
| `size` | `SrSize` | 继承配置 | 组级尺寸，子项可覆盖 |
| `name` | `string` | `''` | 原生 name，同组内共享 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `value` | 选中值变化，配合 `v-model` |
| `change` | `value` | 同上，提交语义 |

## 注意事项

- **组内的 `SrRadio` 必须给 `value`**，否则无法与组的 `modelValue` 比较，点击无效。
- 单选组与 `SrSelect` 的区别：选项少于 5 个、且希望用户一眼看全时用单选组，选项多或需要搜索时用下拉。
- 圆点是实心填充而非描边，选中时带一圈外环——这在玻璃风格下比纯描边更清晰。
- 键盘可用方向键在同组内切换，这是原生 radio 的行为。
