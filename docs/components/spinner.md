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

### 多色

由多个元素组成的变体可以逐个上色：`dots` 用前 3 个、`bars` 用前 4 个、`pulse` 用前 2 个。

```vue
<SrSpinner variant="bars" :colors="['#ffd8a8', '#ffc078', '#ffa94d', '#ff922b']" />
<SrSpinner variant="dots" :colors="['#fca5a5', '#fcd34d', '#86efac']" />
```

<div class="sr-demo is-block">
  <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center">
    <div style="text-align: center">
      <SrSpinner variant="dots" :size="36" :colors="['#ffd8a8', '#ffc078', '#ffa94d']" />
      <p style="margin: 8px 0 0; font-size: 11px; color: var(--vp-c-text-3)">同色系（3 点）</p>
    </div>
    <div style="text-align: center">
      <SrSpinner variant="bars" :size="36" :colors="['#ffd8a8', '#ffc078', '#ffa94d', '#ff922b']" />
      <p style="margin: 8px 0 0; font-size: 11px; color: var(--vp-c-text-3)">同色系（4 条）</p>
    </div>
    <div style="text-align: center">
      <SrSpinner variant="dots" :size="36" :colors="['#fca5a5', '#fcd34d', '#86efac']" />
      <p style="margin: 8px 0 0; font-size: 11px; color: var(--vp-c-text-3)">四色（3 点）</p>
    </div>
    <div style="text-align: center">
      <SrSpinner variant="bars" :size="36" :colors="['#fca5a5', '#fcd34d', '#86efac', '#93c5fd']" />
      <p style="margin: 8px 0 0; font-size: 11px; color: var(--vp-c-text-3)">四色（4 条）</p>
    </div>
    <div style="text-align: center">
      <SrSpinner variant="pulse" :size="36" :colors="['#fca5a5', '#93c5fd']" />
      <p style="margin: 8px 0 0; font-size: 11px; color: var(--vp-c-text-3)">双色（2 圈）</p>
    </div>
  </div>
</div>

两条规则：

- **数量不足时循环取用**。`bars` 只给 2 个颜色，第 3、4 根会回到第 1、2 个，不会出现一半有色一半透明。
- **`ring` / `gradient` / `orbit` 只有一个元素**，会忽略 `colors`，仍用 `color` 或主色。

配色建议：**同色系由浅到深**最协调（像进度条的层次）；**四色区分**适合表达「多个任务并行」。两种都比纯单色更有信息量，但也更容易喧宾夺主——页面里已经有主色强调时，保持单色更稳妥。

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
| `colors` | `string[]` | `[]` | 多色，按顺序分配给子元素 |

## 注意事项

- **动画会尊重 `prefers-reduced-motion`**：用户开了「减少动效」时停止旋转，但图标仍然显示，避免出现「什么都没有」的空白。
- 组件本身没有插槽；需要「图标 + 文案」的组合直接写在外面，或使用 `SrButton` 的 `loading` 属性。
- 全屏或区块级的加载遮罩不要自己用 spinner 拼，`SrTable` 已有 `loading` 属性，其他场景可以用 `SrEmpty` + `SrSpinner` 组合。

## 注意事项

- **`variant` 默认是 `ring`**。已有的按钮、表格里都是这个，升级不会改变现有观感。
- **`strokeWidth` 只对 `ring` 与 `gradient` 生效**。三点、竖条这类变体的粗细由尺寸决定，不是线宽。
- **减少动态效果时降速而不是停止**。完全静止会被误认为卡死。
- **`dots` / `bars` 在小尺寸下更清楚**。12~16px 时圆环的线段会糊，点阵反而更利落。
- **`colors` 只对多元素变体生效**。`dots` / `bars` / `pulse` 用得上，其余是单元素、会忽略它。
- **`colors` 与 `color` 同时传时，`colors` 优先**于被分配到颜色的子元素。
