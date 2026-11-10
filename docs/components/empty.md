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
  <SrEmpty type="search" />
</div>

## 场景类型

`type` 直接给出整套预设：图标、默认文案、图标块色调。常见的空态场景不用再手写 `icon` + `description`。

<div class="sr-demo">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; width: 100%">
    <SrEmpty type="default" bordered />
    <SrEmpty type="search" bordered>
      <template #action>
        <SrButton size="sm">清空筛选条件</SrButton>
      </template>
    </SrEmpty>
    <SrEmpty type="data" bordered>
      <template #action>
        <SrButton size="sm" variant="primary">新建项目</SrButton>
      </template>
    </SrEmpty>
    <SrEmpty type="error" bordered>
      <template #action>
        <SrButton size="sm">重新加载</SrButton>
      </template>
    </SrEmpty>
    <SrEmpty type="network" bordered>
      <template #action>
        <SrButton size="sm">重新连接</SrButton>
      </template>
    </SrEmpty>
    <SrEmpty type="permission" bordered>
      <template #action>
        <SrButton size="sm">申请权限</SrButton>
      </template>
    </SrEmpty>
  </div>
</div>

| `type` | 图标 | 默认文案 | 色调 |
| --- | --- | --- | --- |
| `default` | 收件箱 | 暂无数据 | 中性灰 |
| `search` | 搜索无果 | 没有找到匹配的结果 | 中性灰 |
| `data` | 数据库 | 还没有创建任何内容 | 中性灰 |
| `error` | 感叹号圆圈 | 加载失败，请稍后重试 | 危险红 |
| `network` | 断开的 Wi-Fi | 网络连接失败，请检查网络 | 警示黄 |
| `permission` | 锁 | 暂无访问权限 | 警示黄 |

色调只影响图标块：中性灰表示「还没有」，警示黄/危险红表示「出事了、点不动了」。`icon` 或 `description` 显式传入时以传入值为准。

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
| `type` | `'default' \| 'search' \| 'data' \| 'error' \| 'network' \| 'permission'` | `'default'` | 场景类型，决定预设图标、文案与色调 |
| `description` | `string` | `''` | 描述文案，留空用场景预设文案 |
| `icon` | `string` | — | 图标名，不传用场景预设图标；传空字符串则不显示图标 |
| `image` | `string` | `''` | 图片地址，传了就用图片替代图标 |
| `bordered` | `boolean` | `false` | 套一层虚线框 |
| `size` | `SrSize` | `'md'` | 尺寸档位 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `action` | 描述下方的操作区 |
| `default` | 完全自定义内容，覆盖图标与描述 |

## 注意事项

- `image` 优先于 `icon`；想只留文字就把 `icon` 传空字符串。
- `description` 默认是空串（不是 `'暂无数据'`），留空才走场景预设文案——这样换 `type` 时文案会跟着变。
- 图标外面有一块 12% 透明度的淡色圆角底，圆角按块宽等比取，`xs` 到 `lg` 都是圆润的小方块。
- `bordered` 的虚线框用的是 `--sr-color-border`，亮暗主题下自动适配。
- 放在 `SrTable` 里时不用这个组件，直接用表格自带的 `#empty` 插槽（它已经内置了图标 + 文案）。
