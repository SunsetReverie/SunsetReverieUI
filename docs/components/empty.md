# SrEmpty 空状态

列表、表格、搜索无结果时的占位。图标 + 描述 + 操作，可选虚线框与插图。

```vue
<script setup lang="ts">
import { SrButton, SrEmpty } from '@sunset-reverie/ui'
</script>

<template>
  <SrEmpty description="还没有组件">
    <template #action>
      <SrButton size="sm" variant="primary">新建</SrButton>
    </template>
  </SrEmpty>
</template>
```

## 基础用法

<div class="sr-demo is-column">
  <SrEmpty />
  <SrEmpty description="搜索没有匹配结果" />
</div>

## 带操作

<div class="sr-demo is-column">
  <SrEmpty description="还没有创建任何组件">
    <template #action>
      <SrButton size="sm" variant="primary">新建组件</SrButton>
    </template>
  </SrEmpty>
</div>

## 尺寸

<div class="sr-demo is-column">
  <SrEmpty size="sm" description="sm：用于卡片或表格内部" />
  <SrEmpty size="lg" description="lg：用于整页占位" />
</div>

## 虚线框与插图

`bordered` 套一层虚线框，适合画布里的空占位；`image` 用插图替代图标，让空态不那么单调。

<div class="sr-demo is-column">
  <SrEmpty bordered description="拖拽文件到这里，或点击上传" />
</div>

```vue
<SrEmpty bordered image="/empty-state.svg" description="还没有数据" />
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `description` | `string` | `'暂无数据'` | 描述文案 |
| `icon` | `string` | `'lucide:inbox'` | 图标名，传空字符串则不显示 |
| `image` | `string` | `''` | 图片地址，传了就用图片替代图标 |
| `bordered` | `boolean` | `false` | 套一层虚线框 |
| `size` | `SrSize` | `'md'` | 尺寸档位 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `action` | 描述下方的操作区 |
| `default` | 完全自定义内容，覆盖图标与描述 |

## 注意事项

- `image` 优先于 `icon`；两者都不给时只显示描述文字。
- `bordered` 的虚线框用的是 `--sr-color-border`，亮暗主题下自动适配。
- 放在 `SrTable` 里时不用这个组件，直接用表格自带的 `#empty` 插槽（它已经内置了图标 + 文案）。
