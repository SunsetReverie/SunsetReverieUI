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

/** 是否纵向 */
const isVertical = computed(() => props.direction === 'vertical')

/** 当前索引，越界时夹到合法范围（items 变短时不会停在不存在的页） */
const current = computed(() => {
  if (count.value === 0) return 0
  return Math.min(Math.max(props.modelValue, 0), count.value - 1)
})

/** 根节点 */
const rootRef = ref<HTMLElement>()

/**
 * 高度样式
 *
 * 纯数字字符串也补上 px：模板里写 height="180" 是很自然的事，
 * 而 CSS 里 "180" 是无效值，会静默退化成 auto。
 */
const rootStyle = computed(() => {
  const raw = props.height
  if (typeof raw === 'number') return { height: `${raw}px` }
  const trimmed = String(raw).trim()
  return { height: /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed }
})

/** 拖动中的实时位移（px）；正数表示往下一页的反方向拖 */
const dragOffset = ref(0)

/** 是否正在拖动 */
const dragging = ref(false)

/** 拖动时关闭过渡，松手后恢复 */
const trackStyle = computed(() => {
  const base = current.value * 100
  const shift = isVertical.value
    ? `translate3d(0, calc(-${base}% + ${dragOffset.value}px), 0)`
    : `translate3d(calc(-${base}% + ${dragOffset.value}px), 0, 0)`

  return {
    transform: shift,
    transition: dragging.value ? 'none' : undefined,
  }
})

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

/* ---------- 拖动 ---------- */

/** 拖动起点 */
let startX = 0
let startY = 0

/** 是否已按下但还没开始拖（用于区分「点击」与「拖动」） */
let armed = false

/** 拖动方向上的容器尺寸，用于算阈值 */
function axisSize(): number {
  const el = rootRef.value
  if (!el) return 0
  return isVertical.value ? el.clientHeight : el.clientWidth
}

/** 沿旋转轴的位移 */
function axisDelta(event: PointerEvent): number {
  return isVertical.value ? event.clientY - startY : event.clientX - startX
}

/**
 * 按下：准备拖动
 *
 * 用 Pointer Events 统一鼠标、触摸与手写笔，避免三套事件各写一遍。
 * @param event 指针事件
 */
function onPointerDown(event: PointerEvent): void {
  if (props.disabled || count.value <= 1) return
  if (event.pointerType === 'mouse' ? !props.draggable : !props.touchable) return
  // 只响应主键，右键与中键不参与拖动
  if (event.pointerType === 'mouse' && event.button !== 0) return

  armed = true
  dragging.value = false
  startX = event.clientX
  startY = event.clientY
}

/**
 * 移动：跟手位移
 * @param event 指针事件
 */
function onPointerMove(event: PointerEvent): void {
  if (!armed) return

  const raw = axisDelta(event)

  // 只有真的移动了才进入拖动并捕获指针：
  // 在 pointerdown 就 capture 会把指针从箭头/指示器上抢走，点击事件不再触发
  if (!dragging.value) {
    if (Math.abs(raw) < 4) return
    dragging.value = true
    rootRef.value?.setPointerCapture?.(event.pointerId)
  }

  // 反向拖到边缘时不无限外移，用阻尼收窄，提示「已经到头了」
  const atStart = !props.loop && current.value === 0 && raw > 0
  const atEnd = !props.loop && current.value === count.value - 1 && raw < 0
  dragOffset.value = atStart || atEnd ? raw * 0.25 : raw
}

/**
 * 松开：超过阈值就翻页，否则回弹
 * @param event 指针事件
 */
function onPointerUp(event: PointerEvent): void {
  if (!armed) return
  armed = false

  // 没进入拖动 = 这是一次点击，交给按钮自己的 click
  if (!dragging.value) return

  const delta = axisDelta(event)
  const threshold = axisSize() * props.dragThreshold

  dragging.value = false
  dragOffset.value = 0
  rootRef.value?.releasePointerCapture?.(event.pointerId)

  if (Math.abs(delta) < threshold) return
  if (delta < 0) next()
  else prev()
}

/** 拖动被系统打断（来电、手势返回等）时复位 */
function onPointerCancel(): void {
  armed = false
  dragging.value = false
  dragOffset.value = 0
}

/** 键盘：左右 / 上下方向键切换 */
function onKeydown(event: KeyboardEvent): void {
  const back = isVertical.value ? 'ArrowUp' : 'ArrowLeft'
  const forward = isVertical.value ? 'ArrowDown' : 'ArrowRight'

  if (event.key === back) {
    event.preventDefault()
    prev()
  } else if (event.key === forward) {
    event.preventDefault()
    next()
  }
}
</script>

<template>
  <div
    ref="rootRef"
    class="sr-carousel"
    :class="[
      `sr-carousel--${effect}`,
      `sr-carousel--${direction}`,
      { 'is-disabled': disabled, 'is-dragging': dragging },
    ]"
    :style="rootStyle"
    role="region"
    aria-roledescription="carousel"
    tabindex="0"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @keydown="onKeydown"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
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

          <div v-if="$slots.overlay" class="sr-carousel__overlay">
            <slot name="overlay" :item="item" :index="index" :active="index === current" />
          </div>
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
        <SrIcon :name="isVertical ? 'lucide:chevron-up' : 'lucide:chevron-left'" :size="18" />
      </button>

      <button
        v-if="arrows"
        class="sr-carousel__arrow sr-carousel__arrow--next"
        type="button"
        aria-label="下一张"
        :disabled="disabled || (!loop && current === count - 1)"
        @click="next"
      >
        <SrIcon :name="isVertical ? 'lucide:chevron-down' : 'lucide:chevron-right'" :size="18" />
      </button>

      <div
        v-if="indicators"
        class="sr-carousel__indicators"
        :class="[
          `sr-carousel__indicators--${indicatorPosition}`,
          { 'sr-carousel__indicators--vertical': isVertical },
        ]"
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
