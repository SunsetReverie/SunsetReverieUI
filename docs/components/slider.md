# SrSlider 滑块

拖动选择一个数值或一段区间。用于范围筛选、音量、亮度、阈值设置。

<script setup>
import { ref } from 'vue'

const basic = ref(30)
const range = ref([20, 70])
const temp = ref(22)
</script>

## 交互演示

<div class="sr-demo is-block">
  <div style="display: flex; align-items: center; gap: 12px; max-width: 420px">
    <SrSlider v-model="basic" />
    <span style="min-width: 40px; font-size: 12px; color: var(--vp-c-text-2)">{{ basic }}%</span>
  </div>
</div>

拖动滑块，或直接点轨道任意位置跳过去。聚焦后也能用方向键微调。

## 基础用法

```vue
<SrSlider v-model="value" />
```

默认范围 0~100，步长 1。

## 步长

`step` 控制吸附精度：

<div class="sr-demo is-block">
  <div style="display: flex; flex-direction: column; gap: 14px; max-width: 420px">
    <SrSlider :model-value="50" :step="1" />
    <SrSlider :model-value="50" :step="10" />
    <SrSlider :model-value="50" :step="25" show-stops />
  </div>
</div>

`showStops` 在每两个步长之间画一个小点，让「会吸附到哪」变得可见。步长太多（超过 60 个）时自动不画，否则会糊成一片。

**`step` 传 0 表示不吸附**，取连续值：

<div class="sr-demo is-block">
  <div style="max-width: 420px">
    <SrSlider :model-value="33.3" :step="0" :format-tooltip="(v: number) => v.toFixed(1)" />
  </div>
</div>

## 自定义范围

```vue
<SrSlider v-model="temp" :min="-20" :max="60" :format-tooltip="(v) => `${v}°C`" />
```

<div class="sr-demo is-block">
  <div style="display: flex; align-items: center; gap: 12px; max-width: 420px">
    <SrSlider v-model="temp" :min="-20" :max="60" :format-tooltip="(v: number) => `${v}°C`" />
    <span style="min-width: 48px; font-size: 12px; color: var(--vp-c-text-2)">{{ temp }}°C</span>
  </div>
</div>

`min` 可以是负数。`formatTooltip` 用来给数值加单位。

## 区间

`range` 模式下值是 `[起始, 结束]`：

<div class="sr-demo is-block">
  <div style="display: flex; align-items: center; gap: 12px; max-width: 420px">
    <SrSlider v-model="range" range />
    <span style="min-width: 72px; font-size: 12px; color: var(--vp-c-text-2)">{{ range[0] }} ~ {{ range[1] }}</span>
  </div>
</div>

两个滑块**不会交叉**：拖左边超过右边时，会把它顶到右边位置（而不是卡住不动）。这样用户不会觉得「拖不动了」。

## 纵向

<div class="sr-demo is-block">
  <div style="display: flex; align-items: center; gap: 16px; height: 160px">
    <SrSlider :model-value="60" vertical />
    <SrSlider :model-value="[30, 80]" vertical range />
  </div>
</div>

适合放在侧边当音量、亮度控制器。**注意父容器要有确定高度**，否则滑块会塌成一条线。

## 禁用

<div class="sr-demo is-block">
  <div style="max-width: 420px">
    <SrSlider :model-value="40" disabled />
  </div>
</div>

## 隐藏数值提示

`showTooltip="false"` 后拖动不弹浮层：

<div class="sr-demo is-block">
  <div style="max-width: 300px">
    <SrSlider :model-value="60" :show-tooltip="false" />
  </div>
</div>

适合放在很窄的容器里——提示浮层会超出边界。

## 尺寸

<div class="sr-demo is-block">
  <div style="display: flex; flex-direction: column; gap: 12px; max-width: 420px">
    <SrSlider :model-value="45" size="xs" />
    <SrSlider :model-value="45" size="sm" />
    <SrSlider :model-value="45" />
    <SrSlider :model-value="45" size="lg" />
  </div>
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `number \| [number, number]` | `0` | 当前值 |
| `min` | `number` | `0` | 最小值 |
| `max` | `number` | `100` | 最大值 |
| `step` | `number` | `1` | 步长，`0` 表示不吸附 |
| `range` | `boolean` | `false` | 双滑块区间模式 |
| `disabled` | `boolean` | `false` | 禁用 |
| `vertical` | `boolean` | `false` | 纵向排列 |
| `showStops` | `boolean` | `false` | 显示间断点 |
| `showTooltip` | `boolean` | `true` | 拖动时显示数值 |
| `formatTooltip` | `(value) => string` | — | 数值格式化 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `value` | 值变化（拖动过程中持续触发） |
| `change` | `value` | 拖动结束 |

`update:modelValue` 在拖动过程中**每次移动都会触发**，所以在里面直接发请求会很频繁。需要请求时用 `change`。

## 键盘操作

| 按键 | 行为 |
| --- | --- |
| `→` `↑` | 加一个步长 |
| `←` `↓` | 减一个步长 |
| `Home` | 跳到最小值 |
| `End` | 跳到最大值 |

## 注意事项

- **纵向模式需要父容器有高度**。`.sr-slider` 用 `align-self: stretch` 撑开，父级没有确定高度就会塌成一条线。
- **`step=0` 时不吸附**，但值仍是浮点数，格式化时记得 `toFixed`。
- **区间两端不会交叉**，拖过头会把另一端顶开。
- **`showStops` 在步长数量超过 60 时自动隐藏**，避免密集到看不清。
- **`update:modelValue` 触发很频繁**，只做本地状态更新，副作用放 `change`。
