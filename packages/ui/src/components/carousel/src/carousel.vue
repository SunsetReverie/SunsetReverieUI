<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { carouselProps } from './carousel'

defineOptions({ name: 'SrCarousel' })

const props = defineProps(carouselProps)

const emit = defineEmits<{
  /** 当前索引变化，配合 v-model */
  'update:modelValue': [index: number]
  /** 切换完成 */
  change: [index: number, prevIndex: number]
}>()

/** 总页数 */
const count = computed(() => props.items.length)

/** 当前索引，越界时夹到合法范围（items 变短时不会停在不存在的页） */
const current = computed(() => {
  if (count.value === 0) return 0
  return Math.min(Math.max(props.modelValue, 0), count.value - 1)
})

/** 高度样式 */
const rootStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

/** 轨道位移（slide 效果） */
const trackStyle = computed(() => ({
  transform: `translate3d(-${current.value * 100}%, 0, 0)`,
}))

/** 是否处于暂停状态 */
const paused = ref(false)

/** 自动播放定时器 */
let timer: ReturnType<typeof setInterval> | undefined

/** 清掉定时器 */
function clearTimer(): void {
  if (timer === undefined) return
  clearInterval(timer)
  timer = undefined
}

/**
 * 按需启动自动播放
 *
 * 只在客户端、且有多页时才启动；单页轮播自动播放没有意义。
 */
function syncAutoplay(): void {
  clearTimer()
  if (!props.autoplay || props.disabled || count.value <= 1) return
  timer = setInterval(
    () => {
      if (paused.value) return
      go(current.value + 1)
    },
    Math.max(props.interval, 500),
  )
}

onMounted(syncAutoplay)

onBeforeUnmount(clearTimer)

watch(() => [props.autoplay, props.disabled, props.interval, count.value], syncAutoplay)

/**
 * 切到指定页
 * @param next 目标索引
 */
function go(next: number): void {
  if (props.disabled || count.value === 0) return

  let target = next
  if (target < 0) {
    if (!props.loop) return
    target = count.value - 1
  } else if (target >= count.value) {
    if (!props.loop) return
    target = 0
  }

  if (target === current.value) return

  const prev = current.value
  emit('update:modelValue', target)
  emit('change', target, prev)
}

/** 上一页 */
function prev(): void {
  go(current.value - 1)
}

/** 下一页 */
function next(): void {
  go(current.value + 1)
}

/** 悬停：暂停自动播放 */
function onEnter(): void {
  if (props.pauseOnHover) paused.value = true
}

/** 移出：恢复自动播放 */
function onLeave(): void {
  paused.value = false
}

/** 触摸起点 */
let touchStartX = 0
/** 是否正在拖动 */
const dragging = ref(false)

/**
 * 触摸开始
 * @param event 触摸事件
 */
function onTouchStart(event: TouchEvent): void {
  if (!props.touchable || props.disabled) return
  touchStartX = event.touches[0]?.clientX ?? 0
  dragging.value = true
}

/**
 * 触摸结束：横向滑动超过 40px 才翻页，避免误触
 * @param event 触摸事件
 */
function onTouchEnd(event: TouchEvent): void {
  if (!dragging.value) return
  dragging.value = false

  const endX = event.changedTouches[0]?.clientX ?? 0
  const delta = endX - touchStartX
  if (Math.abs(delta) < 40) return

  if (delta < 0) next()
  else prev()
}

/** 键盘：左右方向键切换 */
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    prev()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    next()
  }
}
</script>

<template>
  <div
    class="sr-carousel"
    :class="[`sr-carousel--${effect}`, { 'is-disabled': disabled }]"
    :style="rootStyle"
    role="region"
    aria-roledescription="carousel"
    tabindex="0"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @keydown="onKeydown"
    @touchstart.passive="onTouchStart"
    @touchend="onTouchEnd"
  >
    <div class="sr-carousel__viewport">
      <div class="sr-carousel__track" :style="effect === 'slide' ? trackStyle : undefined">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="sr-carousel__slide"
          :class="{ 'is-active': index === current }"
          :style="effect === 'fade' ? { opacity: index === current ? 1 : 0 } : undefined"
          role="group"
          aria-roledescription="slide"
          :aria-label="`${index + 1} / ${items.length}`"
        >
          <slot name="item" :item="item" :index="index" :active="index === current" />
        </div>
      </div>
    </div>

    <template v-if="count > 1">
      <button
        v-if="arrows"
        class="sr-carousel__arrow sr-carousel__arrow--prev"
        type="button"
        aria-label="上一张"
        :disabled="disabled || (!loop && current === 0)"
        @click="prev"
      >
        <SrIcon name="lucide:chevron-left" :size="18" />
      </button>

      <button
        v-if="arrows"
        class="sr-carousel__arrow sr-carousel__arrow--next"
        type="button"
        aria-label="下一张"
        :disabled="disabled || (!loop && current === count - 1)"
        @click="next"
      >
        <SrIcon name="lucide:chevron-right" :size="18" />
      </button>

      <div
        v-if="indicators"
        class="sr-carousel__indicators"
        :class="`sr-carousel__indicators--${indicatorPosition}`"
        role="tablist"
      >
        <button
          v-for="(_, index) in items"
          :key="index"
          class="sr-carousel__indicator"
          :class="{ 'is-active': index === current }"
          type="button"
          role="tab"
          :aria-selected="index === current"
          :aria-label="`第 ${index + 1} 张`"
          @click="go(index)"
        />
      </div>
    </template>
  </div>
</template>
