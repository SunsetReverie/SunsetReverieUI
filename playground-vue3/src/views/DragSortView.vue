<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  createSrDragContext,
  useSrDragSort,
  type SrDragDropPayload,
  type SrDragKey,
} from '@sunset-reverie/ui'

defineOptions({ name: 'DragSortView' })

/* ---------- 单个列表 ---------- */

/** 任务列表 */
const tasks = ref([
  { key: 't1', title: '整理需求文档' },
  { key: 't2', title: '拆解技术方案' },
  { key: 't3', title: '搭页面骨架' },
  { key: 't4', title: '接入接口' },
  { key: 't5', title: '补测试用例' },
])

/** 最近一次移动 */
const lastMove = ref('')

/**
 * 把元素从一个位置挪到另一个位置
 * @param list 原数组
 * @param dragKey 被拖的 key
 * @param overKey 落点 key
 * @param type 落点类型
 * @returns 新数组
 */
function moveItem<T extends { key: SrDragKey }>(
  list: T[],
  dragKey: SrDragKey,
  overKey: SrDragKey,
  type: string,
): T[] {
  const next = [...list]
  const from = next.findIndex((item) => item.key === dragKey)
  if (from < 0) return next

  const [moved] = next.splice(from, 1)
  if (!moved) return next

  if (type === 'inside') {
    next.push(moved)
    return next
  }

  const to = next.findIndex((item) => item.key === overKey)
  next.splice(type === 'before' ? to : to + 1, 0, moved)
  return next
}

const simple = useSrDragSort({
  onDrop: ({ dragKey, overKey, type }) => {
    tasks.value = moveItem(tasks.value, dragKey, overKey, type)
    lastMove.value = `${String(dragKey)} 移到 ${String(overKey)} 的 ${type}`
  },
})

/* ---------- 跨列表看板 ---------- */

/** 两列数据 */
const board = ref<Record<string, { key: SrDragKey; title: string }[]>>({
  todo: [
    { key: 'c1', title: '写周报' },
    { key: 'c2', title: '评审设计稿' },
  ],
  done: [{ key: 'c3', title: '提交发版说明' }],
})

/** 两列共享同一个上下文 */
const context = createSrDragContext()

/**
 * 跨列表移动
 * @param payload 拖放信息
 */
function moveAcross({ dragKey, overKey, type, fromListId, toListId }: SrDragDropPayload): void {
  const source = board.value[fromListId]
  const target = board.value[toListId]
  if (!source || !target) return

  const from = source.findIndex((card) => card.key === dragKey)
  if (from < 0) return

  const [card] = source.splice(from, 1)
  if (!card) return

  // 落在空区域：直接追加到末尾
  if (overKey === '__sr_container__') {
    target.push(card)
    return
  }

  const to = target.findIndex((item) => item.key === overKey)
  if (to < 0) target.push(card)
  else target.splice(type === 'before' ? to : to + 1, 0, card)
}

const left = useSrDragSort({ context, listId: 'todo', canDrop: () => true, onDrop: moveAcross })
const right = useSrDragSort({ context, listId: 'done', canDrop: () => true, onDrop: moveAcross })

/** 列配置 */
const columns = computed(() => [
  { id: 'todo', title: '待办', cards: board.value.todo ?? [], sort: left },
  { id: 'done', title: '已完成', cards: board.value.done ?? [], sort: right },
])

/* ---------- 自定义样式示例 ---------- */

/** 不套默认样式的列表 */
const plain = ref(['苹果', '香蕉', '樱桃', '芒果'])

const plainSort = useSrDragSort({
  onDrop: ({ dragKey, overKey, type }) => {
    const next = [...plain.value]
    const from = next.findIndex((item) => item === dragKey)
    if (from < 0) return
    const [moved] = next.splice(from, 1)
    if (moved === undefined) return
    const to = next.findIndex((item) => item === overKey)
    next.splice(type === 'before' ? to : to + 1, 0, moved)
    plain.value = next
  },
})
</script>

<template>
  <div class="drag-page">
    <header class="drag-page__head">
      <h1 class="drag-page__title">拖拽排序</h1>
      <p class="drag-page__desc">
        这不是组件，是一个组合式函数 <code>useSrDragSort</code>。它只负责
        <strong>手势识别</strong>（鼠标拖、触屏长按）和 <strong>落点计算</strong>
        （before / inside / after），数据怎么搬由你决定。
      </p>
      <pre class="drag-page__code"><code>import '@sunset-reverie/ui/draggable.css'   // 可选样式
import { useSrDragSort } from '@sunset-reverie/ui'</code></pre>
    </header>

    <section>
      <h3>基础列表</h3>
      <ul class="list">
        <li
          v-for="task in tasks"
          :key="task.key"
          :ref="(el) => simple.register(task.key, el as HTMLElement | null)"
          class="list__item"
          :class="simple.stateClass(task.key)"
          @pointerdown="simple.onPointerDown(task.key, $event)"
        >
          <span class="list__handle">⋮⋮</span>
          {{ task.title }}
        </li>
      </ul>
      <p class="hint">
        鼠标按住拖动超过 4px 开始；触屏长按约 260ms。
        <span v-if="lastMove">最近一次：{{ lastMove }}</span>
      </p>
    </section>

    <section>
      <h3>跨列表（看板）</h3>
      <div class="board">
        <div
          v-for="col in columns"
          :key="col.id"
          :ref="(el) => col.sort.registerContainer(el as HTMLElement | null)"
          class="board__col"
          :class="col.sort.containerClass()"
        >
          <div class="board__head">
            {{ col.title }}
            <span class="board__count">{{ col.cards.length }}</span>
          </div>
          <div
            v-for="card in col.cards"
            :key="card.key"
            :ref="(el) => col.sort.register(card.key, el as HTMLElement | null)"
            class="board__card"
            :class="col.sort.stateClass(card.key)"
            @pointerdown="col.sort.onPointerDown(card.key, $event)"
          >
            {{ card.title }}
          </div>
          <p v-if="!col.cards.length" class="board__empty">拖到这里</p>
        </div>
      </div>
      <p class="hint">
        两列共用 <code>createSrDragContext()</code>。不共享的话指针移出列边界就什么都算不出来
      </p>
    </section>

    <section>
      <h3>不用默认样式（自己画）</h3>
      <div class="plain">
        <div
          v-for="fruit in plain"
          :key="fruit"
          :ref="(el) => plainSort.register(fruit, el as HTMLElement | null)"
          class="plain__item"
          :class="{
            'plain__item--dragging': plainSort.dragKey.value === fruit,
            [`plain__item--${plainSort.dropTypeOf(fruit)}`]: plainSort.dropTypeOf(fruit),
          }"
          @pointerdown="plainSort.onPointerDown(fruit, $event)"
        >
          {{ fruit }}
        </div>
      </div>
      <p class="hint">
        <code>stateClass()</code> 只是帮你拼类名，不用它也能自己根据 <code>dragKey</code> /
        <code>dropTypeOf()</code> 画任意效果
      </p>
    </section>

    <section>
      <h3>API</h3>
      <div class="api">
        <div class="api__row api__row--head">
          <span>名称</span>
          <span>说明</span>
        </div>
        <div class="api__row">
          <code>register(key, el)</code>
          <span>注册项元素，落点计算靠它拿实际矩形</span>
        </div>
        <div class="api__row">
          <code>registerContainer(el)</code>
          <span>注册列表容器，空列表没有项也能接住拖拽</span>
        </div>
        <div class="api__row">
          <code>onPointerDown(key, event)</code>
          <span>绑到每一项上，是拖拽的起点</span>
        </div>
        <div class="api__row">
          <code>dragKey</code>
          <span>正在被拖的项（ref）</span>
        </div>
        <div class="api__row">
          <code>dropTypeOf(key)</code>
          <span>某一项的落点类型：before / inside / after / null</span>
        </div>
        <div class="api__row">
          <code>stateClass(key)</code>
          <span>拼好 <code>sr-draggable--*</code> 类名，配 draggable.css 用</span>
        </div>
        <div class="api__row">
          <code>containerClass()</code>
          <span>空容器被拖入时的高亮类名</span>
        </div>
        <div class="api__row">
          <code>isDropTarget()</code>
          <span>本列表当前是否有东西拖入</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.drag-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.drag-page__head {
  padding-bottom: 4px;
}

.drag-page__title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
}

.drag-page__desc {
  margin: 0;
  max-width: 620px;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  line-height: 1.7;
}

.drag-page__code {
  margin: 12px 0 0;
  padding: 10px 12px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text-secondary);
  font-family: var(--sr-font-family-mono);
  font-size: 12px;
  line-height: 1.7;
  overflow-x: auto;
}

h3 {
  margin: 0 0 10px;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.hint {
  margin: 10px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 1.7;
}

/* ---------- 基础列表 ---------- */
.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 380px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.list__item {
  padding: 10px 12px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: var(--sr-color-bg-container);
  color: var(--sr-color-text);
  font-size: 13px;
  cursor: grab;
}

.list__handle {
  margin-right: 6px;
  color: var(--sr-color-text-tertiary);
}

/* ---------- 看板 ---------- */
.board {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  max-width: 620px;
}

.board__col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 160px;
  padding: 10px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-sunken) 60%, transparent);
  transition:
    border-color var(--sr-motion-duration-fast) var(--sr-motion-easing-standard),
    background-color var(--sr-motion-duration-fast) var(--sr-motion-easing-standard);
}

.board__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 6px;
  border-bottom: 1px dashed var(--sr-color-border-subtle);
  color: var(--sr-color-text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.board__count {
  padding: 0 6px;
  border-radius: 999px;
  background: var(--sr-color-bg-container);
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
  font-weight: 400;
}

.board__card {
  padding: 8px 10px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: 8px;
  background: var(--sr-color-bg-container);
  color: var(--sr-color-text);
  font-size: 13px;
  cursor: grab;
}

.board__empty {
  margin: auto;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

/* ---------- 自定义样式 ---------- */
.plain {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 240px;
}

.plain__item {
  position: relative;
  padding: 8px 12px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--sr-color-primary) 8%, transparent);
  color: var(--sr-color-text);
  font-size: 13px;
  cursor: grab;
}

.plain__item--dragging {
  opacity: 0.3;
}

.plain__item--before {
  border-top: 2px solid var(--sr-color-primary);
}

.plain__item--after {
  border-bottom: 2px solid var(--sr-color-primary);
}

.plain__item--inside {
  background: color-mix(in srgb, var(--sr-color-primary) 20%, transparent);
}

/* ---------- API 表 ---------- */
.api {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  overflow: hidden;
  max-width: 720px;
}

.api__row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--sr-color-border-subtle);
  font-size: 12.5px;
}

.api__row:last-child {
  border-bottom: 0;
}

.api__row--head {
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  font-weight: 600;
}

.api__row code {
  color: var(--sr-color-primary-text);
  font-family: var(--sr-font-family-mono);
}

.api__row span {
  color: var(--sr-color-text-secondary);
  line-height: 1.6;
}
</style>
