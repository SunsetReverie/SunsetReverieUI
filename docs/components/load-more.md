# SrLoadMore 加载更多

顺序推进式分页。只负责「三态展示 + 触发」，数据怎么取由调用方决定。

<script setup>
import { ref } from 'vue'

const status = ref('idle')

function load() {
  status.value = 'loading'
  setTimeout(() => {
    status.value = 'done'
  }, 900)
}

function reset() {
  status.value = 'idle'
}
</script>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrLoadMore } from '@sunset-reverie/ui'

const status = ref<'idle' | 'loading' | 'done'>('idle')

async function fetchNext() {
  status.value = 'loading'
  await loadPage()
  status.value = hasMore ? 'idle' : 'done'
}
</script>

<template>
  <SrLoadMore :status="status" @load="fetchNext" />
</template>
```

## 三态

<div class="sr-demo is-column">
  <div>
    <span class="sr-demo__label">idle → loading → done（点一下看过程）</span>
    <SrLoadMore :status="status" @load="load" />
    <SrButton v-if="status === 'done'" size="xs" variant="text" @click="reset">重置演示</SrButton>
  </div>
  <p style="margin: 8px 0 0; font-size: 13px; color: var(--vp-c-text-3)">
    当前状态：{{ status }}
  </p>
</div>

三态是**互斥**的枚举，而不是两个布尔：

| 状态 | 表现 |
| --- | --- |
| `idle` | 显示按钮，可点击 |
| `loading` | 显示「加载中」+ 加载图标，不可点 |
| `done` | 两侧分隔线 + 「没有更多了」 |

> 用 `loading` + `hasMore` 两个布尔会有 4 种组合，其中「加载中且没有更多」是无意义状态。枚举天然排除了这种组合。

## 自动加载

`auto` 让元素进入可视区就派发 `load`，不需要点击：

```vue
<div style="max-height: 360px; overflow-y: auto">
  <ItemList />
  <SrLoadMore auto :status="status" @load="fetchNext" />
</div>
```

`rootMargin` 控制提前量，默认 `0px 0px 120px 0px`——距底部还有 120px 就开始加载，用户不会看到空白。

**关键实现**：组件会向上找最近的滚动祖先（`overflow-y: auto/scroll`）作为 IntersectionObserver 的 `root`。如果只是用默认的视口作 root，当这个滚动容器本身不在视口内时，内部的元素永远不会「进入视口」，自动加载就失效了。

## 自定义文案

`loadText` / `loadingText` / `doneText` 分别覆盖三态的文案。

```vue
<SrLoadMore :status="status" load-text="加载更多评论" done-text="已经到底啦" @load="fetchNext" />
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `status` | `'idle' \| 'loading' \| 'done'` | `'idle'` | 当前状态 |
| `loadText` | `string` | `'加载更多'` | 可加载时的按钮文案 |
| `loadingText` | `string` | `'加载中'` | 加载中文案 |
| `doneText` | `string` | `'没有更多了'` | 到底文案 |
| `auto` | `boolean` | `false` | 进入可视区自动触发 |
| `rootMargin` | `string` | `'0px 0px 120px 0px'` | 自动模式的触发提前量 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |
| `disabled` | `boolean` | `false` | 禁用点击 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `load` | — | 点击按钮或进入可视区时触发 |

## 注意事项

- **组件不关心数据**。`status` 完全由调用方维护，加载失败也想重试的话，把状态改回 `idle` 即可。
- `loading` 期间自动模式不会重复触发，`done` 期间完全停用。
- 没有插槽，需要自定义外观就直接用普通按钮。
- 与 `SrPagination` 的区别：这是**顺序推进**（只能往前），分页是**随机访问**（可以跳任意页）。两者的适用场景不重叠。
