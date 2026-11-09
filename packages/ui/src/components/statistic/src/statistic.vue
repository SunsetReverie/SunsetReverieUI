<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { statisticProps } from './statistic'

defineOptions({ name: 'SrStatistic', inheritAttrs: false })

const props = defineProps(statisticProps)

/**
 * 按精度四舍五入
 * @param value 原值
 * @param precision 小数位
 * @returns 定长小数字符串
 */
function withPrecision(value: number, precision: number): string {
  if (precision <= 0) return String(Math.round(value))
  return value.toFixed(precision)
}

/**
 * 整数部分加千分位
 * @param text 数字文本
 * @param separator 分隔符
 * @returns 分组后的文本
 */
function group(text: string, separator: string): string {
  if (!separator) return text

  const negative = text.startsWith('-')
  const body = negative ? text.slice(1) : text
  const [integer, decimal] = body.split('.')

  const grouped = (integer ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, separator)

  const result = decimal === undefined ? grouped : `${grouped}.${decimal}`
  return negative ? `-${result}` : result
}

/**
 * 当前显示的数值
 *
 * 初始就取 `props.value`，这样服务端渲染和客户端首次渲染的内容一致，
 * 不会出现水合不匹配。动画在挂载后才接管。
 */
const displayValue = ref(props.value)

/** rAF 句柄 */
let frame = 0

/**
 * 缓动：先快后慢
 *
 * 数字滚动用线性会显得很「机械」，而且末尾会拖很久才停。
 * @param progress 0~1 的进度
 * @returns 缓动后的进度
 */
function easeOutCubic(progress: number): number {
  return 1 - (1 - progress) ** 3
}

/** 系统是否要求减少动态效果 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 从当前值滚动到目标值
 * @param target 目标值
 */
function animateTo(target: number): void {
  if (frame) {
    cancelAnimationFrame(frame)
    frame = 0
  }

  const from = displayValue.value

  // 不需要动画的几种情况：没开、时长归零、系统要求减动效、值没变
  if (!props.countUp || props.duration <= 0 || prefersReducedMotion() || from === target) {
    displayValue.value = target
    return
  }

  const start = performance.now()

  /**
   * 每一帧推进一步
   * @param now 当前时间戳
   */
  const step = (now: number): void => {
    const progress = Math.min(1, (now - start) / props.duration)
    displayValue.value = from + (target - from) * easeOutCubic(progress)

    if (progress < 1) {
      frame = requestAnimationFrame(step)
    } else {
      // 落回精确值，避免缓动带来的浮点误差
      displayValue.value = target
      frame = 0
    }
  }

  frame = requestAnimationFrame(step)
}

/**
 * 最终显示的数字文本
 *
 * 用 `displayValue` 而不是 `props.value`，动画过程中每帧都会重算。
 */
const display = computed(() => {
  if (props.formatter) return props.formatter(displayValue.value)

  const text = withPrecision(displayValue.value, Math.max(0, props.precision))
  return group(text, props.separator)
})

onMounted(() => {
  if (!props.countUp) return

  // 从 0 起步。这个赋值发生在浏览器首次绘制之前，看不到从目标值跳回来的闪动
  displayValue.value = 0
  animateTo(props.value)
})

watch(
  () => props.value,
  (target) => animateTo(target),
)

onBeforeUnmount(() => {
  if (frame) {
    cancelAnimationFrame(frame)
    frame = 0
  }
})

/** 数值样式 */
const valueStyle = computed(() => (props.valueColor ? { color: props.valueColor } : undefined))
</script>

<template>
  <div class="sr-statistic">
    <p v-if="title || $slots.title" class="sr-statistic__title">
      <slot name="title">{{ title }}</slot>
    </p>

    <div class="sr-statistic__value" :style="valueStyle">
      <span v-if="loading" class="sr-statistic__skeleton" aria-hidden="true" />
      <template v-else>
        <span v-if="prefix || $slots.prefix" class="sr-statistic__affix">
          <slot name="prefix">{{ prefix }}</slot>
        </span>
        <span class="sr-statistic__number">{{ display }}</span>
        <span v-if="suffix || $slots.suffix" class="sr-statistic__affix">
          <slot name="suffix">{{ suffix }}</slot>
        </span>
      </template>
    </div>
  </div>
</template>
