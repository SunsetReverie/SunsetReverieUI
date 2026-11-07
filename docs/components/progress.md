# SrProgress 进度条

线性进度条。四种状态、可选条纹与流动、百分比文字可放轨道内或外侧。宽度由 CSS 变量驱动，过渡交给 CSS，JS 不做补间。

<script setup>
import { onBeforeUnmount, ref } from 'vue'

const basic = ref(38)
const running = ref(0)

let timer
function simulate() {
  if (timer) return
  running.value = 0
  timer = setInterval(() => {
    running.value += 8
    if (running.value >= 100) {
      running.value = 100
      clearInterval(timer)
      timer = null
    }
  }, 200)
}
onBeforeUnmount(() => timer && clearInterval(timer))
</script>

```vue
<script setup lang="ts">
import { SrProgress } from '@sunset-reverie/ui'
</script>

<template>
  <SrProgress :percent="62" />
</template>
```

## 基础用法

<div class="sr-demo is-block">
  <SrProgress :percent="basic" />
</div>

## 四种状态

<div class="sr-demo is-block">
  <SrProgress :percent="62" />
  <SrProgress :percent="100" status="success" />
  <SrProgress :percent="76" status="warning" />
  <SrProgress :percent="42" status="error" />
</div>

## 尺寸

`size` 给出预设高度（xs 3 / sm 4 / md 6 / lg 10px），`strokeWidth` 显式指定像素时以它为准：

<div class="sr-demo is-block">
  <SrProgress :percent="58" size="xs" />
  <SrProgress :percent="58" size="sm" />
  <SrProgress :percent="58" size="md" />
  <SrProgress :percent="58" size="lg" />
  <SrProgress :percent="58" :stroke-width="14" />
</div>

## 文字位置

`textInside` 把百分比放进轨道内部，要求轨道足够高：

<div class="sr-demo is-block">
  <SrProgress :percent="46" :stroke-width="20" text-inside />
</div>

轨道高度不足 **16px** 时会自动退回外侧显示——15px 高的轨道里塞 11px 的文字会贴边，很难看。这是组件里的判断，不需要自己处理。

## 不显示或自定义文字

<div class="sr-demo is-block">
  <SrProgress :percent="72" :show-text="false" />
  <SrProgress :percent="72" :format="(p) => `已完成 ${p}%`" />
  <SrProgress :percent="3" :format="() => '准备中'" />
</div>

`format` 接收夹取后的百分比，返回字符串。也可以直接用默认插槽：

```vue
<SrProgress :percent="55">
  <span>55 / 100 条</span>
</SrProgress>
```

## 条纹与流动

<div class="sr-demo is-block">
  <SrProgress :percent="64" striped />
  <SrProgress :percent="64" striped animated />
</div>

`animated` 需要同时开 `striped` 才有意义。用户开启系统「减少动效」时流动会停，条纹本身保留。

## 动态进度

<div class="sr-demo is-block">
  <SrProgress :percent="running" :status="running >= 100 ? 'success' : 'normal'" />
  <p style="margin: 10px 0 0">
    <SrButton size="sm" variant="outline" @click="simulate">开始模拟</SrButton>
  </p>
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `percent` | `number` | `0` | 百分比 0-100，超出会被夹到边界 |
| `status` | `'normal' \| 'success' \| 'error' \| 'warning'` | `'normal'` | 状态，影响颜色 |
| `strokeWidth` | `number` | `6` | 轨道高度（px） |
| `showText` | `boolean` | `true` | 显示百分比文字 |
| `textInside` | `boolean` | `false` | 文字放轨道内，高度不足 16px 时自动退回外侧 |
| `format` | `(percent: number) => string` | — | 自定义文字 |
| `striped` | `boolean` | `false` | 条纹背景 |
| `animated` | `boolean` | `false` | 条纹流动，需配合 `striped` |
| `size` | `SrSize` | — | 尺寸档位，决定轨道高度 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 自定义右侧文字，覆盖 `format` 与默认百分比 |

## 注意事项

- **`percent` 会被夹到 0-100**，传 `120` 显示 100%，不会溢出轨道。
- `textInside` 与 `showText` 独立：`textInside` 开启时文字必然显示，`showText: false` 只影响外侧文字。
- 宽度变化有过渡动画，由 `--sr-motion-duration-base` 控制；需要瞬时更新（如进度回退）时过渡会稍显拖沓，这种情况建议外层用 `key` 重建。
- 圆角固定为全圆（`--sr-radius-full`），不受外观质感影响——进度条的细长比例下，方角会显得生硬。
