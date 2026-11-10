# SrCalendar 日历

常驻显示的月历。和 `SrDatePicker` 的区别就在这里：它不弹层，占一张卡片的位置。

<script setup>
import { ref } from 'vue'

const picked = ref('2026-11-09')
const ranged = ref('2026-11-15')
const sundayFirst = ref('2026-11-01')

const eventDays = ['2026-11-03', '2026-11-12', '2026-11-18', '2026-11-25']
</script>

## 交互演示

<div class="sr-demo is-block">
  <div style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap">
    <div style="width: 320px">
      <SrCalendar v-model="picked" :marks="eventDays" />
    </div>
    <div style="flex: 1 1 200px">
      <p style="margin: 0; font-size: 12px; color: var(--vp-c-text-3)">
        选中：<code>{{ picked || '未选' }}</code>
      </p>
      <p style="margin: 8px 0 0; font-size: 12px; color: var(--vp-c-text-3)">
        带小点的日期来自 <code>marks</code>。
      </p>
    </div>
  </div>
</div>

## 基础用法

```vue
<SrCalendar v-model="date" />
```

```ts
const date = ref('2026-11-09')   // 格式 YYYY-MM-DD
```

默认周一为每周第一天，带「今天」按钮——它固定在头部右侧，点了只把视图拉回今天所在月份，不会改动选中值。

当前日期用主色淡底圆角块标注，鼠标悬停和选中日期同样是圆角块，三种状态不会看不出区别。卡片本身是一层玻璃：`data-sr-style="glass"` 下半透明底 + 背景模糊，`flat` 下退化为实色卡片。

## 日期标记

```vue
<SrCalendar v-model="date" :marks="['2026-11-03', '2026-11-12']" />
```

有标记的日期下方显示一个小点。用于「哪些天有内容」的快速预览——具体是什么内容还是得在下面列出来。

## 可选范围

<div class="sr-demo is-block">
  <div style="width: 320px">
    <SrCalendar v-model="ranged" min="2026-11-10" max="2026-11-20" />
  </div>
</div>

```vue
<SrCalendar v-model="date" min="2026-11-10" max="2026-11-20" />
```

范围外的日期变灰、点了没反应。传 `YYYY-MM-DD` 字符串。

## 每周起始日

<div class="sr-demo is-block">
  <div style="display: flex; gap: 16px; flex-wrap: wrap">
    <div style="width: 280px">
      <SrCalendar v-model="picked" :first-day-of-week="1" :show-today="false" :cell-height="36" />
    </div>
    <div style="width: 280px">
      <SrCalendar v-model="sundayFirst" :first-day-of-week="0" :show-today="false" :cell-height="36" />
    </div>
  </div>
</div>

`0` 是周日、`1` 是周一。国内习惯周一起，部分海外产品用周日起。

## 格子高度

`cellHeight` 控制每格高度，默认 44px。调大到 56px 以上就能在格子里塞事件标题，当排期表用。

## 和 DatePicker 的区别

| | `SrCalendar` | `SrDatePicker` |
| --- | --- | --- |
| 形态 | 常驻显示 | 输入框 + 弹层 |
| 占用 | 一张卡片的位置 | 一个输入框 |
| 场景 | 仪表盘、排期页、请假申请 | 表单里的日期字段 |

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | 选中日期 `YYYY-MM-DD` |
| `firstDayOfWeek` | `number` | `1` | 每周第一天，0 是周日 |
| `min` | `string` | `''` | 最小可选日期 |
| `max` | `string` | `''` | 最大可选日期 |
| `marks` | `string[]` | `[]` | 需要标记的日期 |
| `showToday` | `boolean` | `true` | 显示「今天」按钮 |
| `cellHeight` | `number` | `44` | 格子高度（px） |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `value` | 选中日期变化 |
| `change` | `value` | 选中日期变化 |
| `month-change` | `year, month` | 切换月份（月份从 1 开始） |

## 注意事项

- **固定 6 行 × 7 列**。始终渲染 42 格，切换月份时高度不会抖。
- **切换月份不改变选中值**。只改视图，选中仍在原来那天——如果想让选中的日期始终在视口内，用 `month-change` 自己处理。
- **`min` / `max` 是闭区间**，边界当天可选。
- **非本月日期也能点**。点了会跳到那个日期，但视图不会自动跟着切月。
- **`marks` 只做视觉标记**，不参与选中逻辑，也不会阻止选择。
