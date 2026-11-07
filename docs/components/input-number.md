# SrInputNumber 数字输入框

带步进按钮的数值输入。支持范围限制、步长、精度控制与校验态。

<script setup>
import { ref } from 'vue'

const count = ref(1)
const price = ref(9.9)
const bounded = ref(5)
const noControls = ref(3)
</script>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrInputNumber } from '@sunset-reverie/ui'

const count = ref(1)
</script>

<template>
  <SrInputNumber v-model="count" :min="0" :max="10" />
</template>
```

## 基础用法

<div class="sr-demo">
  <SrInputNumber v-model="count" :min="0" :max="10" style="width: 140px" />
  <span style="font-size: 13px; color: var(--vp-c-text-3)">当前 {{ count }}</span>
</div>

到达 `min` / `max` 时对应方向的按钮自动禁用，继续点也不会越界。

## 步长与精度

<div class="sr-demo">
  <SrInputNumber v-model="price" :step="0.1" :min="0" :precision="2" style="width: 140px" />
  <SrInputNumber v-model="bounded" :step="5" :min="0" :max="100" style="width: 140px" />
</div>

`step` 决定每次增减多少，`precision` 决定保留几位小数。

**`precision` 不传时会由 `step` 推导**：`step=0.1` 自动得到 1 位小数。显式传值时会用它抹平浮点误差——否则 `0.1 + 0.2` 会算出 `0.30000000000000004` 这种结果。

## 隐藏步进按钮

`controls="false"` 只保留输入，适合需要纯手工填写的场景：

<div class="sr-demo">
  <SrInputNumber v-model="noControls" :controls="false" style="width: 140px" />
</div>

## 校验态

`status` 与 `SrInput` 一致，供 `SrFormItem` 复用：

| 值 | 表现 |
| --- | --- |
| `default` | 常规边框 |
| `error` | 红色边框 |
| `warning` | 橙色边框 |
| `success` | 绿色边框 |

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `number \| null` | `null` | 值，支持 `v-model`；空值为 `null` |
| `min` | `number` | `-Infinity` | 最小值 |
| `max` | `number` | `Infinity` | 最大值 |
| `step` | `number` | `1` | 每次步进的增量，必须大于 0 |
| `precision` | `number` | 由 `step` 推导 | 小数位精度 |
| `size` | `SrResponsive<SrSize>` | 继承配置 | 尺寸，支持按断点分档 |
| `placeholder` | `string` | `''` | 占位文案 |
| `disabled` | `boolean` | `false` | 禁用 |
| `readonly` | `boolean` | `false` | 只读，仍可聚焦复制 |
| `controls` | `boolean` | `true` | 显示步进按钮 |
| `controlsPosition` | `'right' \| 'both'` | `'right'` | 步进按钮位置 |
| `status` | `'default' \| 'error' \| 'warning' \| 'success'` | `'default'` | 校验态 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `value` | 值变化，配合 `v-model` |
| `change` | `value` | 同上，提交语义 |
| `focus` | `event` | 获得焦点 |
| `blur` | `event` | 失去焦点 |
| `step` | `value, direction` | 点击步进按钮，`direction` 为 `'up'` / `'down'` |

## 注意事项

- **空值用 `null` 表示**，不是 `0`。清空输入框后 `modelValue` 为 `null`，便于区分「没填」和「填了 0」。
- 手动输入超出 `min` / `max` 时，失焦后会**自动夹到边界值**，不会保留非法数字。
- 输入非数字内容时，失焦后回退到上一个合法值，不会变成 `NaN`。
- 步进按钮长按不会连续加减，每次点击只走一步。
