<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  createSrDragContext,
  useSrDragSort,
  type SrDragDropPayload,
  type SrDragKey,
} from '@sunset-reverie/ui'

defineOptions({ name: 'DragBoard' })

/** 卡片 */
interface Card {
  key: SrDragKey
  title: string
}

/** 两列数据 */
const columns = ref<Record<string, Card[]>>({
  todo: [
    { key: 'c1', title: '补文档' },
    { key: 'c2', title: '写测试' },
    { key: 'c3', title: '改样式' },
  ],
  done: [{ key: 'c4', title: '定 API' }],
})

/** 最近一次操作 */
const lastMove = ref('')

/**
 * 两列共用一个上下文
 *
 * 不共享的话各自只认自己的元素，指针移出列边界就什么都算不出来。
 */
const context = createSrDragContext()

/**
 * 移动卡片
 * @param payload 拖放信息
 */
function move(payload: SrDragDropPayload): void {
  const { dragKey, overKey, type, fromListId, toListId } = payload

  const source = columns.value[fromListId]
  const target = columns.value[toListId]
  if (!source || !target) return

  const index = source.findIndex((card) => card.key === dragKey)
  if (index < 0) return

  const [card] = source.splice(index, 1)
  if (!card) return

  // 落在空区域：直接追加到末尾
  if (overKey === '__sr_container__') {
    target.push(card)
  } else {
    const at = target.findIndex((item) => item.key === overKey)
    if (at < 0) target.push(card)
    else if (type === 'before') target.splice(at, 0, card)
    else target.splice(at + 1, 0, card)
  }

  lastMove.value = `${card.title}：${fromListId} → ${toListId}`
}

/** 左列的拖拽实例 */
const left = useSrDragSort({ context, listId: 'todo', canDrop: () => true, onDrop: move })

/** 右列的拖拽实例 */
const right = useSrDragSort({ context, listId: 'done', canDrop: () => true, onDrop: move })

/** 列配置：把两个实例和渲染数据拼起来 */
const lists = computed(() => [
  { id: 'todo', title: '待办', cards: columns.value.todo ?? [], sort: left },
  { id: 'done', title: '已完成', cards: columns.value.done ?? [], sort: right },
])

/**
 * 某一列的容器样式
 * @param list 列
 * @returns 类名对象
 */
function columnClass(list: { id: string; sort: ReturnType<typeof useSrDragSort> }): Record<string, boolean> {
  return {
    'board__column--over': list.sort.isDropTarget(),
    'board__column--empty': (columns.value[list.id] ?? []).length === 0,
  }
}

/**
 * 卡片的类名
 * @param sort 所属列的实例
 * @param key 卡片标识
 * @returns 类名对象
 */
function cardClass(sort: ReturnType<typeof useSrDragSort>, key: SrDragKey): Record<string, boolean | string> {
  const type = sort.dropTypeOf(key)
  return {
    'board__card--dragging': sort.dragKey.value === key,
    'board__card--drop': !!type,
    [`board__card--${type ?? 'none'}`]: !!type,
  }
}
</script>

<template>
  <div class="board">
    <div
      v-for="list in lists"
      :key="list.id"
      :ref="(el) => list.sort.registerContainer(el as HTMLElement | null)"
      class="board__column"
      :class="columnClass(list)"
    >
      <div class="board__head">
        <span>{{ list.title }}</span>
        <span class="board__count">{{ list.cards.length }}</span>
      </div>

      <div
        v-for="card in list.cards"
        :key="card.key"
        :ref="(el) => list.sort.register(card.key, el as HTMLElement | null)"
        class="board__card"
        :class="cardClass(list.sort, card.key)"
        @pointerdown="list.sort.onPointerDown(card.key, $event)"
      >
        {{ card.title }}
      </div>

      <p v-if="!list.cards.length" class="board__empty">拖到这里</p>
    </div>
  </div>

  <p v-if="lastMove" class="board__log">最近一次：{{ lastMove }}</p>
</template>

<style scoped>
.board {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.board__column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 180px;
  padding: 10px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-sunken) 60%, transparent);
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.board__column--over {
  border-color: var(--sr-color-primary);
  background: var(--sr-color-primary-alpha-08);
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
  position: relative;
  padding: 8px 10px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: 8px;
  background: var(--sr-color-bg-container);
  color: var(--sr-color-text);
  font-size: 13px;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
  transition:
    opacity 0.15s ease,
    box-shadow 0.15s ease;
}

.board__card--dragging {
  opacity: 0.45;
  cursor: grabbing;
}

.board__card--drop {
  box-shadow: inset 0 0 0 1.5px var(--sr-color-primary-alpha-25);
}

.board__card--before::before,
.board__card--after::after {
  position: absolute;
  right: 4px;
  left: 4px;
  height: 2px;
  border-radius: 1px;
  background: var(--sr-color-primary);
  content: '';
}

.board__card--before::before {
  top: -5px;
}

.board__card--after::after {
  bottom: -5px;
}

.board__empty {
  margin: auto;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.board__column--empty .board__empty {
  color: var(--sr-color-primary);
}

.board__log {
  margin: 10px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
</style>
