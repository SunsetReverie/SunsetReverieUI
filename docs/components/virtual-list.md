# SrVirtualList 虚拟列表

长列表只渲染可视区那几条，一万条数据 DOM 里也始终只有十几个节点。

<script setup>
import { ref } from 'vue'

const bigItems = Array.from({ length: 10000 }, (_, i) => i)
const users = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${String(i + 1).padStart(4, '0')}`,
  email: `user${i + 1}@example.com`,
}))

const listRef = ref(null)
</script>

## 交互演示

<div class="sr-demo is-block">
  <div style="height: 260px; border: 1px solid var(--sr-color-border-subtle); border-radius: 8px; overflow: hidden">
    <SrVirtualList :items="bigItems" :item-height="32" :height="260">
      <template #default="{ item, index }">
        <div style="display: flex; align-items: center; gap: 10px; height: 100%; padding: 0 12px; font-size: 13px; box-sizing: border-box">
          <span style="min-width: 44px; color: var(--vp-c-text-3); font-size: 11px">{{ index }}</span>
          <span>第 {{ item }} 条数据</span>
        </div>
      </template>
    </SrVirtualList>
  </div>
</div>

滚动条长度按**总高度**算（10000 × 32px），所以拖动条的手感是正常的，不会因为只渲染十几条就变成一小截。

## 基础用法

```vue
<SrVirtualList :items="list" :item-height="32" :height="300">
  <template #default="{ item, index }">
    <div>{{ index }} - {{ item.name }}</div>
  </template>
</SrVirtualList>
```

两个**必填**参数：

| 参数 | 说明 |
| --- | --- |
| `item-height` | 每项固定高度（px） |
| `height` | 可视区高度（px） |

组件靠这两个值算「一屏能放几条」和「总高度多少」，缺一个就没法虚拟化。

## 数据结构

`items` 可以是任意数组：

<div class="sr-demo is-block">
  <div style="height: 240px; border: 1px solid var(--sr-color-border-subtle); border-radius: 8px; overflow: hidden">
    <SrVirtualList :items="users" :item-height="56" :height="240" :item-key="(item) => item.id">
      <template #default="{ item }">
        <div style="display: flex; align-items: center; gap: 10px; height: 100%; padding: 0 12px; box-sizing: border-box">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--sr-color-bg-sunken); display: flex; align-items: center; justify-content: center; font-size: 11px">
            {{ item.name.slice(-2) }}
          </div>
          <div>
            <p style="margin: 0; font-size: 13px">{{ item.name }}</p>
            <p style="margin: 1px 0 0; font-size: 11px; color: var(--vp-c-text-3)">{{ item.email }}</p>
          </div>
        </div>
      </template>
    </SrVirtualList>
  </div>
</div>

插槽拿到 `{ item, index }`，`index` 是**真实下标**（不是可视区内的相对位置），所以用来渲染序号、隔行变色都正确。

## 列表会增删时传 itemKey

```vue
<SrVirtualList
  :items="users"
  :item-height="56"
  :height="300"
  :item-key="(item) => item.id"
>
```

不传时用**下标**当 key。如果列表会插入、删除、排序，Vue 复用节点时会把旧内容留在错误的位置——表现为「滚一下内容就变了」。

数据是静态的就无所谓。

## 滚动控制

组件暴露了两个方法：

```ts
const listRef = ref()

listRef.value?.scrollToIndex(500)   // 滚到第 500 条
listRef.value?.scrollToTop()        // 回到顶部
```

<div class="sr-demo is-block">
  <div style="display: flex; gap: 8px; margin-bottom: 10px">
    <SrButton size="xs" variant="outline" @click="listRef?.scrollToIndex(8888)">跳到第 8888 条</SrButton>
    <SrButton size="xs" variant="outline" @click="listRef?.scrollToTop()">回顶部</SrButton>
  </div>
  <div style="height: 180px; border: 1px solid var(--sr-color-border-subtle); border-radius: 8px; overflow: hidden">
    <SrVirtualList ref="listRef" :items="bigItems" :item-height="32" :height="180">
      <template #default="{ item, index }">
        <div style="display: flex; align-items: center; gap: 10px; height: 100%; padding: 0 12px; font-size: 13px; box-sizing: border-box">
          <span style="min-width: 48px; color: var(--vp-c-text-3); font-size: 11px">{{ index }}</span>
          <span>第 {{ item }} 条</span>
        </div>
      </template>
    </SrVirtualList>
  </div>
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `unknown[]` | `[]` | 数据源 |
| `itemHeight` | `number` | **必填** | 每项固定高度（px） |
| `height` | `number` | **必填** | 可视区高度（px） |
| `buffer` | `number` | `3` | 上下额外渲染的项数 |
| `itemKey` | `(item, index) => string \| number` | — | 取 key，不传用下标 |

## 插槽

| 名称 | 参数 | 说明 |
| --- | --- | --- |
| `default` | `{ item, index }` | 每一项的内容 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `scroll` | `scrollTop` | 滚动 |

## 注意事项

- **每项高度必须真的固定**。内容换行、图片未加载完成导致高度变化，都会让后续项位置错乱。两行文字配 `itemHeight: 56` 就要保证两行永远显示。
- **不支持不定高**。不定高需要边渲染边测量，位置会回跳，属于另一套实现。
- **`buffer` 别调太小**。默认 3 够用；快速滚动加惯性时如果看到白边，加到 5~8。
- **内容不要用 `position: sticky`**。内部是绝对定位的平移容器，sticky 会失效。
- **不要在外层再套一个滚动容器**。`height` 决定的可视区就是滚动区，再套一层会有双滚动条。
