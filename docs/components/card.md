# SrCard 卡片

带头部、主体、底部的容器。比 `SrPanel` 更重，自带边框与阴影，适合放在页面里作为独立的信息块。

<script setup>
import { ref } from 'vue'
</script>

```vue
<script setup lang="ts">
import { SrCard } from '@sunset-reverie/ui'
</script>

<template>
  <SrCard title="组件状态" subtitle="近 7 天">
    卡片内容
  </SrCard>
</template>
```

## 基础用法

<div class="sr-demo is-block">
  <SrCard title="组件状态" subtitle="近 7 天的构建结果">
    <p style="margin: 0">主体内容放这里。</p>
  </SrCard>
</div>

传了 `title` 或 `subtitle` 才渲染头部。都没有时卡片只有主体，适合纯内容块。

## 三段式

`header` / `default` / `footer` 三个插槽，`extra` 落在头部右侧：

<div class="sr-demo is-block">
  <SrCard title="发布配置">
    <template #extra>
      <SrTag type="primary" size="sm" round>预览版</SrTag>
    </template>

    <p style="margin: 0">主体内容</p>

    <template #footer>
      <SrButton size="sm" variant="text">取消</SrButton>
      <SrButton size="sm" variant="primary">保存</SrButton>
    </template>
  </SrCard>
</div>

底部插槽自带右对齐与上边框。

## 内边距

`size` 是整体档位，`padding` 单独控制且**优先于 `size`**：

| `padding` | 效果 |
| --- | --- |
| `none` | 只有内容区贴边，头部与底部仍保留内边距 |
| `xs` / `sm` / `md` / `lg` | 覆盖 `size` 的档位 |

<div class="sr-demo is-block">
  <SrCard title="padding = none" padding="none">
    <div
      style="display: flex; align-items: center; justify-content: center; height: 68px; background: linear-gradient(120deg, var(--sr-color-primary-alpha-12), var(--sr-color-primary-alpha-08)); color: var(--sr-color-primary-text); font-size: 13px"
    >
      内容贴边，适合自带留白的图表或图片
    </div>
  </SrCard>
</div>

> `none` 不会让标题也贴边——那样边框会直接切到文字上，很难看。

## 描边与悬停

<div class="sr-demo">
  <SrCard title="默认（有描边）" style="width: 220px">
    <p style="margin: 0; font-size: 13px">bordered = true</p>
  </SrCard>

  <SrCard title="无描边" :bordered="false" style="width: 220px">
    <p style="margin: 0; font-size: 13px">改用阴影托住边界</p>
  </SrCard>

  <SrCard title="可悬停" hoverable style="width: 220px">
    <p style="margin: 0; font-size: 13px">上浮 + 主色描边</p>
  </SrCard>
</div>

`bordered=false` 会补一层浅阴影，否则卡片和页面底色会糊在一起。`hoverable` 在悬停时上浮 2px、加深阴影并加主色描边。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | `''` | 标题，也可用 `header` 插槽完全自定义 |
| `subtitle` | `string` | `''` | 副标题 |
| `size` | `SrSize` | `'md'` | 内边距档位 |
| `padding` | `'none' \| SrSize` | `''` | 单独指定内边距，优先于 `size` |
| `bordered` | `boolean` | `true` | 显示外边框 |
| `hoverable` | `boolean` | `false` | 悬停时轻微上浮 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 主体内容 |
| `header` | 完全自定义头部，覆盖 `title` / `subtitle` |
| `extra` | 头部右侧的附加信息 |
| `footer` | 底部操作区，自带右对齐与上边框 |

## 注意事项

- **`extra` 单独存在时也会触发头部渲染**，不用同时传 `title`。
- 卡片自身没有外边距，布局间距由父容器给（`gap` 或 `margin`）。
- `hoverable` 只是视觉反馈，不会让卡片变得可点击，点击事件还是要自己绑。
