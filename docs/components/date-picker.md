# SrDatePicker 日期选择

支持单日、区间、日期时间与日期时间区间四种模式，内置快捷选项、范围限制与自定义禁用规则。日历逻辑完全自研，不依赖日期库。

<script setup>
import { ref } from 'vue'

const single = ref(new Date(2026, 10, 8))
const range = ref(null)
const dateTime = ref(null)
const dateTimeRange = ref(null)
const bounded = ref(null)
const weekdayOnly = ref(null)
const customRange = ref(null)
const strValue = ref(null)
const statusValue = ref(null)

const today = new Date()
const minDate = new Date(today.getFullYear(), today.getMonth(), 1)
const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, 0)

function disabledWeekend(date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

const customShortcuts = [
  {
    label: '本季度',
    value: () => {
      const now = new Date()
      const quarterStart = Math.floor(now.getMonth() / 3) * 3
      return [new Date(now.getFullYear(), quarterStart, 1), now]
    },
  },
  { label: '今年', value: () => [new Date(new Date().getFullYear(), 0, 1), new Date()] },
]
</script>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrDatePicker } from '@sunset-reverie/ui'

const date = ref(null)
</script>

<template>
  <SrDatePicker v-model="date" />
</template>
```

## 四种模式

| `type` | 说明 | 值类型 |
| --- | --- | --- |
| `date`（默认） | 单个日期 | `Date` |
| `datetime` | 日期 + 时分秒 | `Date` |
| `daterange` | 日期区间 | `[Date, Date]` |
| `datetimerange` | 日期时间区间 | `[Date, Date]` |

### 单个日期

<div class="sr-demo is-block">
  <SrDatePicker v-model="single" />
  <p style="margin: 8px 0 0; font-size: 13px; color: var(--vp-c-text-3)">
    {{ single ? single.toLocaleDateString('zh-CN') : '未选择' }}
  </p>
</div>

### 日期区间

<div class="sr-demo is-block">
  <SrDatePicker v-model="range" type="daterange" />
</div>

点第一次设起点，点第二次设终点。**反向选择会自动交换**——先点 20 号再点 5 号，结果仍是 5 号到 20 号。

### 日期 + 时间

<div class="sr-demo is-block">
  <SrDatePicker v-model="dateTime" type="datetime" />
</div>

带时间时点日期**不会立即提交**，需要点「确定」。否则调完时分秒面板就关了，没法继续改。

## 快捷选项（可选）

**默认不显示快捷区**。它是一个可选变体：大多数场景下用户只需要一个日历，多一排按钮反而占地方。传 `shortcuts` 才会渲染。

<div class="sr-demo is-block">
  <SrDatePicker v-model="customRange" type="daterange" :shortcuts="customShortcuts" />
</div>

自定义：

```ts
const shortcuts = [
  { label: '本季度', value: () => {
    const now = new Date()
    const quarterStart = Math.floor(now.getMonth() / 3) * 3
    return [new Date(now.getFullYear(), quarterStart, 1), now]
  } },
]
```

> **`value` 是函数而不是固定值**。快捷项依赖「当前时间」，在组件外算一次会过时——尤其页面挂着几小时后再点「今天」，应该给的是新的今天。

不传 `shortcuts`，或传空数组，或是 `:show-shortcuts="false"`，都等同于「没有快捷区」。

## 范围限制

<div class="sr-demo is-block">
  <SrDatePicker v-model="bounded" :min="minDate" :max="maxDate" />
</div>

`min` / `max` 支持 `Date`、时间戳或按 `format` 解析的字符串。超出的日期置灰并划掉。

`min` / `max` 按**天**比较，忽略时间部分——所以 `min: 今天 18:00` 仍然允许选今天的早上。

## 自定义禁用

<div class="sr-demo is-block">
  <SrDatePicker v-model="weekdayOnly" :disabled-date="disabledWeekend" />
</div>

```ts
// 禁用周末
const disabledWeekend = (date: Date) => [0, 6].includes(date.getDay())
```

`disabledDate` 返回 `true` 表示不可选。它在 `min` / `max` 之外**额外生效**，两者是「且」的关系。

## 字符串输出

`valueFormat` 让 `v-model` 直接绑定字符串：

<div class="sr-demo is-block">
  <SrDatePicker v-model="strValue" value-format="YYYY/MM/DD" />
  <p style="margin: 8px 0 0; font-size: 13px; color: var(--vp-c-text-3)">
    绑定值：{{ strValue ?? '空' }}（类型为 string）
  </p>
</div>

适合直接塞给后端接口，省掉一层转换。

## 校验态

<div class="sr-demo is-block">
  <SrDatePicker v-model="statusValue" status="error" placeholder="该项必填" />
</div>

`status` 与 `SrInput` 一致，放在 `SrFormItem` 里时由校验结果自动下发。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `Date \| [Date, Date] \| null` | `null` | 选中值 |
| `type` | `'date' \| 'datetime' \| 'daterange' \| 'datetimerange'` | `'date'` | 选择模式 |
| `min` | `Date \| string \| number` | — | 最小可选日期 |
| `max` | `Date \| string \| number` | — | 最大可选日期 |
| `disabledDate` | `(date: Date) => boolean` | — | 自定义禁用规则 |
| `format` | `string` | 按 type 推导 | 输入框显示格式 |
| `valueFormat` | `string` | `''` | 输出格式，传了则输出字符串 |
| `placeholder` | `string \| string[]` | `''` | 占位文案，区间可传两个 |
| `clearable` | `boolean` | `true` | 可清空 |
| `disabled` | `boolean` | `false` | 禁用 |
| `readonly` | `boolean` | `false` | 只读 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |
| `status` | `'default' \| 'error' \| 'warning' \| 'success'` | `'default'` | 校验态 |
| `shortcuts` | `SrDatePickerShortcut[]` | — | 快捷选项；不传则不显示快捷区 |
| `showShortcuts` | `boolean` | `true` | 是否渲染快捷区（需配合 `shortcuts`） |
| `firstDayOfWeek` | `number` | `1` | 一周起始日，0 为周日 |
| `editable` | `boolean` | `false` | 允许直接输入 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `value` | 值变化 |
| `change` | `value` | 同上，提交语义 |
| `visible-change` | `visible` | 面板开合 |

## 暴露的方法

| 方法 | 说明 |
| --- | --- |
| `open()` | 打开面板 |
| `close()` | 关闭面板 |
| `toggle()` | 切换 |

## 注意事项

- **区间模式必须点两次**。第一次点只设起点，此时不会派发 `update:modelValue`，底部会提示「请选择结束日期」。
- **带时间（`datetime` / `datetimerange`）需要点「确定」**才提交。纯日期模式点选即提交并关闭。
- 面板固定渲染 **6 行 × 7 列 = 42 格**，前后补齐上下月的日期。固定行数是为了避免切换月份时面板高度抖动。
- `addMonths` 采用「先设为 1 号再加月」的方式，所以 1 月 31 日往后翻一个月得到 2 月 1 日，不会溢出到 3 月。
- 区间模式下左右两个面板**联动**：左边翻月右边跟着翻。
- 面板用 `Teleport` 挂到 body，定位由 JS 计算（复用浮层引擎），滚动与改变窗口时会重新定位。
- 服务端渲染只输出触发器，面板在交互后才挂载，因此 SSR 安全。
