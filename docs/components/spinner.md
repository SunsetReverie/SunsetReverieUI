# SrSpinner 加载指示器

环形加载动画。用于数据请求、提交反馈这类「等待中」的场景。

```vue
<script setup lang="ts">
import { SrSpinner } from '@sunset-reverie/ui'
</script>

<template>
  <SrSpinner />
</template>
```

## 基础用法

<div class="sr-demo">
  <SrSpinner />
  <SrSpinner>加载中…</SrSpinner>
</div>

包在文字外面时，图标在左、文字在右，间距由组件内部处理。

## 动画样式

六种，全部用 CSS 绘制，不依赖图标库或图片：

<div class="sr-demo is-block">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 12px">
    <div v-for="v in [
      { key: 'ring', name: '圆环' },
      { key: 'gradient', name: '渐变环' },
      { key: 'dots', name: '三点' },
      { key: 'bars', name: '竖条' },
      { key: 'pulse', name: '扩散' },
      { key: 'orbit', name: '绕轨' },
    ]" :key="v.key" style="display: flex; align-items: center; flex-direction: column; gap: 8px; padding: 14px 8px; border: 1px solid var(--vp-c-border); border-radius: 8px">
      <SrSpinner :variant="v.key" :size="36" />
      <span style="font-size: 11px; color: var(--vp-c-text-3)">{{ v.name }}</span>
    </div>
  </div>
</div>

```vue
<SrSpinner variant="dots" />
```

| `variant` | 观感 | 适合 |
| --- | --- | --- |
| `ring`（默认） | 经典圆环 | 通用，最不容易出错 |
| `gradient` | 渐变环 | 深色底、现代风格的产品 |
| `dots` | 三点依次跳动 | 小尺寸，塞进按钮或标签里 |
| `bars` | 竖条高低起伏 | 科技感、音频类产品 |
| `pulse` | 同心圆扩散 | 沉稳，像呼吸 |
| `orbit` | 小球绕轨 | 活泼，有故事感 |

### 为什么不用图标库

图标库里的 `loader` 图标大多是一个静态 SVG，要点起来还得自己加旋转；而 spinner 需要的是**动画本身**。用 CSS 画出来：

- 颜色走 `currentColor`，自动跟随主题与 `color` 属性
- 尺寸由外层宽高驱动，内部元素用百分比，12px 和 48px 下都不走形
- 没有额外体积，也不需要额外加载图标资源

## 尺寸

<div class="sr-demo">
  <SrSpinner size="xs" />
  <SrSpinner size="sm" />
  <SrSpinner size="md" />
  <SrSpinner size="lg" />
  <SrSpinner :size="32" />
</div>

`size` 支持档位关键字或像素数字。

## 颜色与线宽

<div class="sr-demo">
  <SrSpinner color="var(--sr-color-success)" />
  <SrSpinner color="var(--sr-color-danger)" />
  <SrSpinner :stroke-width="1" />
  <SrSpinner :stroke-width="3" />
</div>

默认跟随当前文字颜色（`currentColor`），所以在按钮里会自动变成按钮的文字色。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `SrSize \| number` | `'md'` | 尺寸档位，或直接给像素值 |
| `color` | `string` | `''` | 颜色，默认跟随主色 |
| `label` | `string` | `''` | 无障碍名称；不传则视为装饰性 |
| `strokeWidth` | `number` | `2` | 线条粗细（px），只对 `ring` / `gradient` 生效 |
| `variant` | `'ring' \| 'dots' \| 'pulse' \| 'bars' \| 'orbit' \| 'gradient'` | `'ring'` | 动画样式 |

## 注意事项

- **动画会尊重 `prefers-reduced-motion`**：用户开了「减少动效」时停止旋转，但图标仍然显示，避免出现「什么都没有」的空白。
- 组件本身没有插槽；需要「图标 + 文案」的组合直接写在外面，或使用 `SrButton` 的 `loading` 属性。
- 全屏或区块级的加载遮罩不要自己用 spinner 拼，`SrTable` 已有 `loading` 属性，其它场景可以用 `SrEmpty` + `SrSpinner` 组合。

## 注意事项

- **`variant` 默认是 `ring`**。已有的按钮、表格里都是这个，升级不会改变现有观感。
- **`strokeWidth` 只对 `ring` 与 `gradient` 生效**。三点、竖条这类变体的粗细由尺寸决定，不是线宽。
- **减少动态效果时降速而不是停止**。完全静止会被误认为卡死。
- **`dots` / `bars` 在小尺寸下更清楚**。12~16px 时圆环的线段会糊，点阵反而更利落。
