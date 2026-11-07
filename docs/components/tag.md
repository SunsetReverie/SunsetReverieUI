# SrTag 标签

状态标记。六种语义色，两种深浅档位，可自定义基色与关闭。

<script setup>
import { ref } from 'vue'

const tags = ref(['设计', '前端', '组件库'])
</script>

```vue
<script setup lang="ts">
import { SrTag } from '@sunset-reverie/ui'
</script>

<template>
  <SrTag type="primary">进行中</SrTag>
  <SrTag type="success" variant="dark">已完成</SrTag>
</template>
```

## 语义类型

`type` 六选一：`default`、`primary`、`success`、`warning`、`danger`、`info`。

<div class="sr-demo is-column">
  <div style="display: flex; gap: 8px; flex-wrap: wrap">
    <SrTag v-for="t in ['default', 'primary', 'success', 'warning', 'danger', 'info']" :key="t" :type="t">
      {{ t }}
    </SrTag>
  </div>
</div>

## 深浅两档

`variant="light"`（默认）是淡色底 + 深色字；`variant="dark"` 是实色底 + 白字：

<div class="sr-demo is-column">
  <div style="display: flex; gap: 8px; flex-wrap: wrap">
    <SrTag v-for="t in ['primary', 'success', 'warning', 'danger']" :key="t" :type="t" variant="light">
      {{ t }} · light
    </SrTag>
  </div>
  <div style="display: flex; gap: 8px; flex-wrap: wrap">
    <SrTag v-for="t in ['primary', 'success', 'warning', 'danger']" :key="t" :type="t" variant="dark">
      {{ t }} · dark
    </SrTag>
  </div>
</div>

## 自定义基色

`color` 直接给任意 CSS 颜色，覆盖 `type` 的基色，深浅档仍由 `variant` 从它派生：

<div class="sr-demo">
  <SrTag color="#8b5cf6">紫</SrTag>
  <SrTag color="#0ea5e9">天蓝</SrTag>
  <SrTag color="#10b981" variant="dark">深绿</SrTag>
  <SrTag color="#f59e0b" variant="dark">琥珀</SrTag>
</div>

## 尺寸与圆角

<div class="sr-demo">
  <SrTag size="xs">xs</SrTag>
  <SrTag size="sm">sm</SrTag>
  <SrTag size="md">md</SrTag>
  <SrTag size="lg">lg</SrTag>
  <SrTag round type="primary">胶囊</SrTag>
</div>

## 可关闭

<div class="sr-demo">
  <SrTag
    v-for="(tag, index) in tags"
    :key="tag"
    closable
    type="primary"
    @close="tags.splice(index, 1)"
  >
    {{ tag }}
  </SrTag>
</div>

`close` 事件只负责通知，**不会自己删除**——移除逻辑由调用方维护，这样能配合异步确认或撤销。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | 语义类型，决定基色 |
| `variant` | `'light' \| 'dark'` | `'light'` | 配色深浅 |
| `color` | `string` | `''` | 自定义基色，覆盖 `type` |
| `size` | `SrSize` | `'md'` | 尺寸档位 |
| `closable` | `boolean` | `false` | 显示关闭按钮 |
| `round` | `boolean` | `false` | 胶囊圆角 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `close` | `event` | 点击关闭按钮 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 标签文本 |

## 注意事项

- `color` 与 `type` 同时传时以 `color` 为准，`variant` 仍生效（从 `color` 派生出淡底或实底）。
- `dark` 档在玻璃风格下会带一点柔光，扁平风格下是纯实色。
- 标签不换行，长文本会被容器裁掉。需要多行请用 `SrTag` 之外的方案。
