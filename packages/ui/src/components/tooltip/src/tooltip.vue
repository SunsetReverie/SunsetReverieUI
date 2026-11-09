<script setup lang="ts">
import { computed, nextTick, onMounted, onScopeDispose, ref, useAttrs, useId, useSlots } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import { srOmit } from '../../../utils/attrs'
import {
  srComputeFloating,
  srGetRect,
  type SrFloatingResult,
  type SrPlacement,
} from '../../../utils/floating'
import { tooltipProps } from './tooltip'

defineOptions({ name: 'SrTooltip', inheritAttrs: false })

const props = defineProps(tooltipProps)

const attrs = useAttrs()
const slots = useSlots()
const config = useSrConfig()

/** 触发元素 */
const triggerRef = ref<HTMLElement | null>(null)
/** 浮层元素 */
const floatingRef = ref<HTMLElement | null>(null)

/** 是否可见 */
const visible = ref(false)

/** 计算出的坐标 */
const position = ref({ top: 0, left: 0 })

/** 实际采用的方位（翻转后可能与 props 不同） */
const actualPlacement = ref<SrPlacement>(props.placement)

/** 提示内容 id，供 aria-describedby 关联 */
const contentId = useId()

/** 显示 / 隐藏定时器 */
let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

/** rAF 句柄，用于合并 scroll / resize */
let frame = 0

/** 是否有内容可展示 */
const hasContent = computed(() => Boolean(props.content || slots.content))

/**
 * 计算并写入位置
 * @returns {Promise<void>}
 */
async function updatePosition(): Promise<void> {
  if (typeof window === 'undefined') return
  await nextTick()

  const trigger = triggerRef.value
  const floating = floatingRef.value
  if (!trigger || !floating) return

  const result: SrFloatingResult = srComputeFloating({
    reference: srGetRect(trigger),
    floating: { width: floating.offsetWidth, height: floating.offsetHeight },
    placement: props.placement,
    offset: props.offset,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    padding: 8,
  })

  position.value = { top: result.top, left: result.left }
  actualPlacement.value = result.placement
}

/**
 * 合并到下一帧再重算，避免滚动时每像素都触发布局读取
 * @returns {void}
 */
function scheduleUpdate(): void {
  if (typeof window === 'undefined') return
  if (frame) return

  frame = window.requestAnimationFrame(() => {
    frame = 0
    void updatePosition()
  })
}

/** 显示 */
function show(): void {
  if (props.disabled || !hasContent.value) return
  clearTimeout(hideTimer ?? undefined)
  clearTimeout(showTimer ?? undefined)

  showTimer = setTimeout(
    () => {
      visible.value = true
      void updatePosition()
    },
    Math.max(0, props.showDelay),
  )
}

/** 隐藏 */
function hide(): void {
  clearTimeout(showTimer ?? undefined)
  clearTimeout(hideTimer ?? undefined)

  hideTimer = setTimeout(
    () => {
      visible.value = false
    },
    Math.max(0, props.hideDelay),
  )
}

/**
 * 焦点进入
 * @param event 焦点事件
 */
function onFocus(event: FocusEvent): void {
  show()
  // 键盘聚焦到 trigger 内部元素时，让 trigger 自己也记录 aria-describedby
  void event
}

/** 点击：用于触屏等无 hover 的场景 */
function onClick(): void {
  if (props.disabled || !hasContent.value) return
  visible.value = !visible.value
  if (visible.value) void updatePosition()
}

onMounted(() => {
  window.addEventListener('scroll', scheduleUpdate, true)
  window.addEventListener('resize', scheduleUpdate)
})

onScopeDispose(() => {
  clearTimeout(showTimer ?? undefined)
  clearTimeout(hideTimer ?? undefined)
  if (frame) cancelAnimationFrame(frame)

  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', scheduleUpdate, true)
    window.removeEventListener('resize', scheduleUpdate)
  }
})

/** 浮层内联样式 */
const floatingStyle = computed(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
  maxWidth: `${props.maxWidth}px`,
  '--sr-tooltip-z': String((config.value.zIndex || 1000) + 1002),
  // 内联变量优先级高于样式表里的 preset，因此能直接覆盖底色
  ...(props.backgroundColor ? { '--sr-tooltip-bg': props.backgroundColor } : {}),
}))
</script>

<template>
  <span
    ref="triggerRef"
    class="sr-tooltip__trigger"
    :aria-describedby="visible ? contentId : undefined"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="onFocus"
    @focusout="hide"
    @click="onClick"
    @keydown.escape="visible = false"
  >
    <slot />
  </span>

  <Teleport :to="teleportTo">
    <Transition name="sr-tooltip">
      <div
        v-show="visible"
        :id="contentId"
        ref="floatingRef"
        class="sr-tooltip"
        :class="[
          `sr-tooltip--${actualPlacement}`,
          `sr-tooltip--${variant}`,
          { 'has-arrow': arrow },
          attrs.class,
        ]"
        :style="floatingStyle"
        role="tooltip"
        v-bind="srOmit(attrs as Record<string, unknown>, ['class', 'style'])"
      >
        <span v-if="arrow" class="sr-tooltip__arrow" aria-hidden="true" />

        <div class="sr-tooltip__content">
          <slot name="content">{{ content }}</slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
