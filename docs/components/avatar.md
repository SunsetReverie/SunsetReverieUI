# SrAvatar 头像

图片、文字或图标。图片加载失败会自动回退，没有图片时底色按 `alt` 自动取一个稳定色。

```vue
<script setup lang="ts">
import { SrAvatar } from '@sunset-reverie/ui'
</script>

<template>
  <SrAvatar alt="林深" />
  <SrAvatar src="/avatar.png" alt="周夏" />
</template>
```

## 三种内容

<div class="sr-demo">
  <SrAvatar alt="林深" />
  <SrAvatar alt="周夏" size="lg" />
  <SrAvatar icon="lucide:heart" size="lg" />
  <SrAvatar alt="陈默" color="#8b5cf6" />
  <SrAvatar alt="苏白" shape="square" size="lg" />
</div>

优先级：`src`（加载成功）→ `icon` → `alt` 的前两个字符。

## 自动取色

不传 `color` 时，底色由 `alt` 的散列值在 7 色调色板里选一个——**同一个人始终同色**，不用逐个配。

```vue
<SrAvatar alt="林深" />   <!-- 每次渲染都是同一个颜色 -->
<SrAvatar alt="周夏" />
<SrAvatar alt="陈默" />
```

底色是「16% 淡底 + 78% 同色深字」的组合，亮暗主题都成立。想固定颜色就传 `color`：

<div class="sr-demo">
  <SrAvatar alt="林深" color="#0ea5e9" />
  <SrAvatar alt="周夏" color="#10b981" />
  <SrAvatar alt="陈默" color="#f59e0b" />
</div>

## 尺寸

预设四档，也可以直接传数字（按 px）：

<div class="sr-demo">
  <SrAvatar alt="XS" size="xs" />
  <SrAvatar alt="SM" size="sm" />
  <SrAvatar alt="MD" size="md" />
  <SrAvatar alt="LG" size="lg" />
  <SrAvatar alt="48" :size="48" />
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | `''` | 图片地址，加载失败自动回退 |
| `alt` | `string` | `''` | 替代文案，同时作为回退文字与取色来源 |
| `size` | `SrSize \| number` | `'md'` | 尺寸档位，也可传像素数字 |
| `shape` | `'circle' \| 'square'` | `'circle'` | 形状 |
| `color` | `string` | `''` | 自定义底色，不传则按 `alt` 自动取色 |
| `icon` | `string` | `''` | 回退图标，优先于文字 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 完全自定义内容，覆盖图片 / 图标 / 文字 |

## 注意事项

- **回退文字取 `alt` 的前两个字符**。中文姓名传「林深」就显示「林深」，传入英文名会取前两个字母。
- 自动取色是纯函数，服务端与客户端算出的颜色一致，不会造成水合不匹配。
- 图片加载失败会切到回退内容，切换发生在 `error` 事件之后——首屏可能出现一瞬间的空白。
