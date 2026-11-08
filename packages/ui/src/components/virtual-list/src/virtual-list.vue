<script setup lang="ts">
import { computed, ref } from 'vue'

import { virtualListProps } from './virtual-list'

defineOptions({ name: 'SrVirtualList', inheritAttrs: false })

const props = defineProps(virtualListProps)

const emit = defineEmits<{
  /** 滚动 */
  scroll: [scrollTop: number]
}>()

/** 滚动容器 */
const viewportRef = ref<HTMLElement | null>(null)

/** 当前滚动偏移 */
const scrollTop = ref(0)

/** 可视区能放下多少项 */
const visibleCount = computed(() => Math.ceil(props.height / props.itemHeight))

/**
 * 起始下标
 *
 * 减去 buffer 是为了在快速滚动时提前渲染，避免露白。
 * 上下都要夹住：
 * - 下限 0：顶部不出现负下标
 * - 上限 = 总条数 - 一屏条数 - buffer：数据变少或滚动位置异常时，
 *   不夹上限会渲染出一段空区域
 */
const startIndex = computed(() => {
  const raw = Math.floor(scrollTop.value / props.itemHeight) - props.buffer
  const maxStart = Math.max(0, props.items.length - visibleCount.value - props.buffer)
  return Math.min(Math.max(0, raw), maxStart)
})

/** 结束下标 */
const endIndex = computed(() =>
  Math.min(props.items.length, startIndex.value + visibleCount.value + props.buffer * 2),
)

/** 实际渲染的项（带上真实下标） */
const visibleItems = computed(() =>
  props.items.slice(startIndex.value, endIndex.value).map((item, offset) => ({
    item,
    index: startIndex.value + offset,
  })),
)

/** 渲染段相对顶部的偏移 */
const offsetY = computed(() => startIndex.value * props.itemHeight)

/** 撑开滚动条所需的总高度 */
const totalHeight = computed(() => props.items.length * props.itemHeight)

/**
 * 取某一项的 key
 * @param item 数据
 * @param index 下标
 * @returns key
 */
function keyOf(item: unknown, index: number): string | number {
  return props.itemKey ? props.itemKey(item, index) : index
}

/**
 * 滚动处理
 * @param event 滚动事件
 */
function onScroll(event: Event): void {
  scrollTop.value = (event.target as HTMLElement).scrollTop
  emit('scroll', scrollTop.value)
}

/**
 * 滚到指定下标
 * @param index 目标下标
 */
function scrollToIndex(index: number): void {
  const el = viewportRef.value
  if (!el) return

  const target = Math.max(0, Math.min(props.items.length - 1, index))
  el.scrollTop = target * props.itemHeight
  scrollTop.value = el.scrollTop
}

/** 滚回顶部 */
function scrollToTop(): void {
  scrollToIndex(0)
}

defineExpose({ scrollToIndex, scrollToTop })
</script>

<template>
  <div ref="viewportRef" class="sr-virtual-list" :style="{ height: `${height}px` }" @scroll="onScroll">
    <!-- 撑出总高度，让滚动条长度正确 -->
    <div class="sr-virtual-list__phantom" :style="{ height: `${totalHeight}px` }">
      <!-- 把这一段整体推到正确位置，而不是逐项定位 -->
      <div class="sr-virtual-list__inner" :style="{ transform: `translateY(${offsetY}px)` }">
        <div
          v-for="entry in visibleItems"
          :key="keyOf(entry.item, entry.index)"
          class="sr-virtual-list__item"
          :style="{ height: `${itemHeight}px` }"
        >
          <slot :item="entry.item" :index="entry.index" />
        </div>
      </div>
    </div>
  </div>
</template>
