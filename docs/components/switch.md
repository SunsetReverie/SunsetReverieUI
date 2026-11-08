# SrSwitch 开关

二元状态切换。立即生效，不需要确认按钮。

<script setup>
import { ref } from 'vue'

const on = ref(true)
const loading = ref(false)
const withText = ref(true)
const disabled = ref(false)
</script>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrSwitch } from '@sunset-reverie/ui'

const on = ref(true)
</script>

<template>
  <SrSwitch v-model="on" />
</template>
```

## 基础用法

<div class="sr-demo">
  <SrSwitch v-model="on" />
  <SrSwitch v-model="disabled" disabled />
  <SrSwitch v-model="on" loading />
  <span style="font-size: 13px; color: var(--vp-c-text-3)">当前：{{ on ? '开' : '关' }}</span>
</div>

三种不可交互的状态要区分清楚：

| 状态 | 表现 |
| --- | --- |
| `disabled` | 置灰，鼠标显示禁用光标 |
| `loading` | 置灰 + 指示器，用于提交中的瞬时锁定 |
| 正常 | 点击或按空格切换 |

## 带文字

`checkedText` / `uncheckedText` 在开关内部显示文案，适合「开 / 关」这类短标签：

<div class="sr-demo">
  <SrSwitch v-model="withText" checked-text="开" unchecked-text="关" />
  <SrSwitch v-model="withText" checked-text="启用" unchecked-text="停用" size="lg" />
</div>

需要在开关**外面**加说明文字时，用 `label` 属性（无障碍名称），或直接写在旁边：

```vue
<SrSwitch v-model="on" label="启用通知" />
```

## 尺寸

<div class="sr-demo">
  <SrSwitch v-model="on" size="xs" />
  <SrSwitch v-model="on" size="sm" />
  <SrSwitch v-model="on" size="md" />
  <SrSwitch v-model="on" size="lg" />
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | 是否开启，支持 `v-model` |
| `disabled` | `boolean` | `false` | 禁用 |
| `loading` | `boolean` | `false` | 加载中，禁止交互并显示指示器 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |
| `checkedText` | `string` | `''` | 开启时文字 |
| `uncheckedText` | `string` | `''` | 关闭时文字 |
| `label` | `string` | `''` | 无障碍名称，无可见文字时建议提供 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `value` | 状态变化，配合 `v-model` |
| `change` | `value` | 同上，提交语义 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 开关右侧的说明文字 |

## 注意事项

- **SrSwitch 是受控组件，必须绑 `v-model`；不绑的话点击不会改变开关状态。**

- **`loading` 和 `disabled` 都会阻止交互**，区别在于 `loading` 会显示指示器、用于「正在提交」的瞬时状态，`disabled` 是长期的不可用。
- 开关的点击区域只有开关本身，右侧文字（插槽内容）不可点。需要整行可点时，把内容包进 `<label>` 或自己绑点击。
- 键盘上空格可切换，Enter 不行——这符合原生 `role="switch"` 的行为。
