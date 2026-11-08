# 拖拽排序

`useSrDragSort` 是一个**组合式函数**，不是组件。它只做两件事：

1. **手势识别**——鼠标拖动、触屏长按
2. **落点计算**——指针落在哪一项、落在它的前 / 内 / 后

数据怎么搬、长什么样，都由你决定。正因为不含渲染逻辑，它能同时服务列表、看板、树这些结构完全不同的场景。

## 引入

```ts
// 可选样式，不引也能用，只是没有视觉反馈
import '@sunset-reverie/ui/draggable.css'

import { useSrDragSort } from '@sunset-reverie/ui'
```

## 最小示例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useSrDragSort } from '@sunset-reverie/ui'

const list = ref([
  { key: 'a', label: '任务一' },
  { key: 'b', label: '任务二' },
])

const { register, onPointerDown, stateClass } = useSrDragSort({
  onDrop: ({ dragKey, overKey, type }) => {
    // type 是 'before' | 'inside' | 'after'
    list.value = move(list.value, dragKey, overKey, type)
  },
})
</script>

<template>
  <div
    v-for="item in list"
    :key="item.key"
    :ref="(el) => register(item.key, el as HTMLElement | null)"
    :class="stateClass(item.key)"
    @pointerdown="onPointerDown(item.key, $event)"
  >
    {{ item.label }}
  </div>
</template>
```

`register` 必须在 `:ref` 里调用——落点算的是元素的**实际矩形**，拿不到元素就算不出来。

## 数据移动要自己写

组件只告诉你「A 被拖到了 B 的后面」，怎么改数组由你控制：

```ts
function move<T extends { key: string | number }>(
  list: T[], dragKey: string | number, overKey: string | number, type: string,
): T[] {
  const next = [...list]
  const from = next.findIndex((item) => item.key === dragKey)
  if (from < 0) return next

  const [moved] = next.splice(from, 1)
  if (!moved) return next

  const to = next.findIndex((item) => item.key === overKey)
  next.splice(type === 'before' ? to : to + 1, 0, moved)
  return next
}
```

这样写的好处是**和你的数据结构解耦**——数组里放对象、字符串、行 ID 都行。

## 类名与样式

`stateClass(key)` 返回拼好的类名对象，直接给 `:class`：

| 类名 | 含义 |
| --- | --- |
| `sr-draggable` | 基础（始终存在） |
| `sr-draggable--dragging` | 这一项正在被拖走 |
| `sr-draggable--drop-before` | 落点在它前面（显示一条上线） |
| `sr-draggable--drop-after` | 落点在它后面（显示一条下线） |
| `sr-draggable--drop-inside` | 放进去成为子项（整块高亮） |

`sr-draggable-container--active` 挂在容器上，用于「空列表被拖入」时高亮。

**不想用默认样式**就跳过 `draggable.css`，自己根据 `dragKey` 和 `dropTypeOf()` 画：

```vue
:class="{
  'my-dragging': dragKey === item.key,
  [`my-drop-${dropTypeOf(item.key)}`]: dropTypeOf(item.key),
}"
```

## 跨列表（看板）

两个列表要互相拖，**必须共享同一个上下文**：

```ts
import { createSrDragContext, useSrDragSort } from '@sunset-reverie/ui'

const context = createSrDragContext()

const left = useSrDragSort({ context, listId: 'todo', onDrop: moveAcross })
const right = useSrDragSort({ context, listId: 'done', onDrop: moveAcross })
```

`onDrop` 里能拿到来源和目标：

```ts
function moveAcross({ dragKey, overKey, type, fromListId, toListId }) {
  // 从 fromListId 摘出 dragKey，插到 toListId 的 overKey 附近
}
```

**为什么必须共享**：`pointermove` 是挂在 document 上的全局监听，每个实例都会收到。不共享上下文时各自只认自己的元素，指针一移出边界就无法判断落点。共享之后，落点归属由「指针在谁的容器内」决定，同一时刻只有一个列表接管。

### 空列表

目标列是空的时候没有项可命中，要靠容器接住：

```vue
<div :ref="(el) => right.registerContainer(el as HTMLElement)">
```

此时 `overKey` 是 `SR_DRAG_CONTAINER_KEY`（值为 `'__sr_container__'`），代表「追加到末尾」。

## API

### 配置

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `context` | `SrDragContext` | — | 跨列表时由 `createSrDragContext()` 创建并共享 |
| `listId` | `string` | `''` | 本列表标识，跨列表时用于区分来源和目标 |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | 判断落点的轴向 |
| `threshold` | `number` | `4` | 鼠标移动多少像素后判定为拖拽 |
| `holdDelay` | `number` | `260` | 触屏长按多久启动（毫秒） |
| `isDisabled` | `(key) => boolean` | — | 某一项是否禁止拖拽 |
| `isListDisabled` | `() => boolean` | — | 整个列表是否禁止作为落点 |
| `canDrop` | `(payload) => boolean` | — | 返回 `false` 时该落点不生效 |
| `onDrop` | `(payload) => void` | — | 放下回调 |

### 返回值

| 名称 | 说明 |
| --- | --- |
| `register(key, el)` | 注册项元素 |
| `registerContainer(el)` | 注册列表容器（空列表用） |
| `onPointerDown(key, event)` | 绑到每一项上 |
| `dragKey` | 正在被拖的项（ref） |
| `overKey` / `overType` | 当前落点项与位置 |
| `dropTypeOf(key)` | 某一项的落点类型，`null` 表示不是落点 |
| `stateClass(key)` | 拼好 `sr-draggable--*` 类名 |
| `containerClass()` | 容器状态类名 |
| `isDropTarget()` | 本列表当前是否有东西拖入 |
| `dragging` | 是否正在拖拽（ref） |
| `cancel()` | 主动取消当前拖拽 |

### onDrop 的参数

| 字段 | 说明 |
| --- | --- |
| `dragKey` | 被拖的项 |
| `overKey` | 落点项（可能是 `SR_DRAG_CONTAINER_KEY`） |
| `type` | `before` / `inside` / `after` |
| `fromListId` / `toListId` | 来源与目标列表 |
| `acrossLists` | 是否跨列表 |

## 注意事项

- **触屏需要长按**（约 260ms）。直接按下就拖会和页面滚动抢手势，所以短按 + 移动会判定成滚动并放弃拖拽。
- **必须用 Pointer Events**，不能用原生 HTML5 拖放。后者在触屏上根本不触发事件，这也是这个函数存在的理由。
- **`register` 要传真实的 DOM 元素**。传 `null` 表示卸载，会从落点计算里移除。
- **不要给项加原生 `draggable="true"`**。它会和指针事件冲突，浏览器会启动自己的拖放行为。
- 树组件内部也用的这套逻辑，但树的落点额外做了「防成环」判断（不能把父节点拖进自己的子树），那部分在 `SrTree` 里，不在这层。
