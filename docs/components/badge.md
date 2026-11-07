# SrBadge 徽标

数字角标与状态点。两种形态：贴在内容右上角的**角标**，或独立的**状态点 + 文字**。

<script setup>
import { ref } from 'vue'
</script>

```vue
<script setup lang="ts">
import { SrBadge } from '@sunset-reverie/ui'
</script>

<template>
  <SrBadge :value="12">
    <SrButton variant="outline" size="sm">消息</SrButton>
  </SrBadge>
</template>
```

## 数字角标

<div class="sr-demo">
  <SrBadge :value="12">
    <SrButton variant="outline" size="sm">消息</SrButton>
  </SrBadge>
  <SrBadge :value="120">
    <SrButton variant="outline" size="sm">超出上限</SrButton>
  </SrBadge>
  <SrBadge dot>
    <SrButton variant="outline" size="sm">圆点</SrButton>
  </SrBadge>
  <SrBadge :value="0" show-zero>
    <SrButton variant="outline" size="sm">显示 0</SrButton>
  </SrBadge>
</div>

- 数字超过 `max`（默认 99）折叠成 `99+`
- `dot` 只显示圆点，不显示内容
- 值为 0 时默认隐藏，`showZero` 可以让它显示

## 语义类型

`type` 六选一：`danger`（默认）、`primary`、`success`、`warning`、`info`、`default`。

<div class="sr-demo">
  <SrBadge v-for="t in ['danger', 'primary', 'success', 'warning', 'info', 'default']" :key="t" :value="3" :type="t">
    <SrButton variant="outline" size="sm">{{ t }}</SrButton>
  </SrBadge>
</div>

## 状态点

传 `status` 后切到「圆点 + 文字」形态，忽略 `value`。适合表达「运行中 / 已停用」这类持续状态：

<div class="sr-demo is-column">
  <SrBadge status="processing" text="部署中" />
  <SrBadge status="success" text="运行正常" />
  <SrBadge status="warning" text="资源紧张" />
  <SrBadge status="danger" text="已停止" />
  <SrBadge status="default" text="未启用" />
</div>

`processing` 会以 1.4s 为周期改变透明度做呼吸脉冲，只动透明度、不额外生成合成层。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| number` | `''` | 显示内容，数字超过 `max` 折叠成 `max+` |
| `max` | `number` | `99` | 数字上限 |
| `dot` | `boolean` | `false` | 只显示圆点 |
| `type` | `'danger' \| 'primary' \| 'success' \| 'warning' \| 'info' \| 'default'` | `'danger'` | 语义类型 |
| `showZero` | `boolean` | `false` | 值为 0 时也显示 |
| `status` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'processing'` | `''` | 状态点模式，传值后忽略 `value` |
| `text` | `string` | `''` | 状态点右侧的文字 |
| `hidden` | `boolean` | `false` | 隐藏徽标 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 被标记的内容，角标绝对定位在它右上角 |

## 注意事项

- **角标是绝对定位的**，父元素需要 `position: relative`（组件内部已经处理）。放在 `overflow: hidden` 的容器里会被裁掉。
- 只有插槽内容时（不传 `value` / `dot` / `status`）徽标本身不渲染。
- `hidden` 只是视觉隐藏，不改变布局，适合「先占位再显示」的动画场景。
