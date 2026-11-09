# SrTooltip 文字提示

悬停或聚焦时出现的浮层说明。12 方向、自动翻转、边缘避让。

<script setup>
import { ref } from 'vue'
</script>

```vue
<script setup lang="ts">
import { SrTooltip } from '@sunset-reverie/ui'
</script>

<template>
  <SrTooltip content="这是一段提示">
    <SrButton>悬停我</SrButton>
  </SrTooltip>
</template>
```

## 基础用法

<div class="sr-demo">
  <SrTooltip content="默认在上方">
    <SrButton variant="outline" size="sm">上方</SrButton>
  </SrTooltip>
  <SrTooltip content="白色玻璃" variant="light">
    <SrButton variant="outline" size="sm">light</SrButton>
  </SrTooltip>
  <SrTooltip content="没有小三角" :arrow="false">
    <SrButton variant="outline" size="sm">无箭头</SrButton>
  </SrTooltip>
</div>

## 方位

`placement` 12 个方向，空间不足时会自动翻到反方向：

<div class="sr-demo">
  <SrTooltip v-for="p in ['top', 'right', 'bottom', 'left']" :key="p" :content="p" :placement="p">
    <SrButton variant="text" size="sm">{{ p }}</SrButton>
  </SrTooltip>
</div>

完整的 12 个值：`top` / `top-start` / `top-end` / `bottom` / `bottom-start` / `bottom-end` / `left` / `left-start` / `left-end` / `right` / `right-start` / `right-end`。

## 延迟

`showDelay` / `hideDelay` 控制显隐的等待时间：

<div class="sr-demo">
  <SrTooltip content="立刻出现" :show-delay="0">
    <SrButton variant="outline" size="sm">无延迟</SrButton>
  </SrTooltip>
  <SrTooltip content="等 600ms" :show-delay="600">
    <SrButton variant="outline" size="sm">慢一点</SrButton>
  </SrTooltip>
</div>

`hideDelay` 默认 80ms，留一点缓冲避免鼠标划过间隙时闪烁。

## 自定义内容

`content` 插槽可以放富内容：

```vue
<SrTooltip>
  <template #content>
    <strong>标题</strong>
    <p style="margin: 4px 0 0">支持换行与任意结构</p>
  </template>
  <SrIcon name="lucide:info" />
</SrTooltip>
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | `string` | `''` | 文本内容，也可用 `content` 插槽 |
| `variant` | `'dark' \| 'light'` | `'dark'` | 配色，dark 是黑玻璃、light 是白玻璃 |
| `backgroundColor` | `string` | `''` | 自定义背景色，覆盖 `variant` |
| `placement` | `SrPlacement` | `'top'` | 期望方位，空间不足时自动翻转 |
| `showDelay` | `number` | `120` | 显示延迟（ms） |
| `hideDelay` | `number` | `80` | 隐藏延迟（ms） |
| `offset` | `number` | `8` | 与触发元素的间距（px） |
| `arrow` | `boolean` | `true` | 显示小三角 |
| `maxWidth` | `number` | `280` | 最大宽度（px） |
| `disabled` | `boolean` | `false` | 不响应任何交互 |
| `closeOnClick` | `boolean` | `true` | 点击触发元素时关闭 |
| `teleportTo` | `string \| HTMLElement` | `'body'` | 挂载目标 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 触发元素 |
| `content` | 自定义浮层内容，覆盖 `content` 属性 |

## 注意事项

### 进入动画为什么不淡入

气泡背景是**半透明 + `backdrop-filter`** 的玻璃层。如果整个浮层用 opacity 0→1 淡入，opacity 小于 1 期间浏览器不会正常采样 backdrop，于是刚出现那一帧是透明的、能清楚看到下面的正文，等 opacity 到 1 才「突然变模糊」。

气泡落在纯色背景上时不明显，悬在正文文字上就很突兀。

所以 `SrTooltip` 用的是专用过渡 `sr-tooltip`：

| 阶段 | 动画 | 浮层 opacity |
| --- | --- | --- |
| 进场 | 轻微位移 + 缩放 | **始终 1** |
| 离场 | 淡出 + 位移 | 1 → 0 |

离场时模糊减弱是自然效果，不会造成首帧透字。背景层还加了 `will-change: backdrop-filter`，让元素从 `display: none` 出来时提前建立合成层，避免采样晚一帧。

> **改动这个组件时不要换回 `sr-fade` / `sr-zoom`**：两者都是 opacity 淡入，会把这个 bug 带回来。


- **浮层被 Teleport 到 body**，所以它的样式不受触发元素的父级选择器影响。
- 触发元素需要能接受 `mouseenter` / `focus` / `blur` 事件；纯文本节点包一层 `<span>` 更稳妥。
- 页面滚动时浮层会跟着触发元素重新定位，触发元素滚出视口则自动关闭。
- `maxWidth` 只限制宽度，长文本会自动换行，不会出现横向滚动。
