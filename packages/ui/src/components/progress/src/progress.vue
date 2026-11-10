<script setup lang="ts">
import { computed } from 'vue'

import { progressProps } from './progress'

defineOptions({ name: 'SrProgress' })

const props = defineProps(progressProps)

defineSlots<{
  /** 完全自定义右侧文字 */
  default?: () => unknown
}>()

/** 夹到 0-100 */
const percent = computed(() => Math.min(100, Math.max(0, props.percent)))

/** 文字内容 */
const text = computed(() => {
  if (props.format) return props.format(percent.value)
  return `${Math.round(percent.value)}%`
})

/** 尺寸档位对应的轨道高度（未显式传 strokeWidth 时生效） */
const SIZE_HEIGHT: Record<string, number> = { xs: 3, sm: 4, md: 6, lg: 10 }

/** 最终轨道高度 */
const height = computed(() => {
  // strokeWidth 显式传值时优先；两者都没给则用默认 6
  if (props.strokeWidth !== 6) return props.strokeWidth
  return props.size ? (SIZE_HEIGHT[props.size] ?? 6) : 6
})

/** 是否环形 */
const isCircle = computed(() => props.type === 'circle')

/** 环形直径：夹一个下限，避免半径算出负数 */
const circleSize = computed(() => Math.max(24, props.width))

/** 环形描边宽度：与线性的 height 共用一套取值 */
const ringStroke = computed(() => height.value)

/** 圆环半径（描边画在路径中心，所以要减掉半个描边） */
const radius = computed(() => (circleSize.value - ringStroke.value) / 2)

/** 圆环周长 */
const circumference = computed(() => 2 * Math.PI * radius.value)

/** 进度对应的虚线偏移：周长 - 已走部分 */
const dashOffset = computed(() => circumference.value * (1 - percent.value / 100))

/** 根节点样式 */
const rootStyle = computed(() => ({
  '--sr-progress-height': `${height.value}px`,
  '--sr-progress-percent': `${percent.value}%`,
  '--sr-progress-size': `${circleSize.value}px`,
}))

/** 是否把文字放进轨道 */
const inside = computed(() => props.textInside && height.value >= 16)
</script>

<template>
  <div
    class="sr-progress"
    :class="[
      `sr-progress--${status}`,
      {
        'sr-progress--circle': isCircle,
        'is-inside': inside,
        'is-striped': striped && !isCircle,
        'is-animated': striped && animated && !isCircle,
      },
    ]"
    :style="rootStyle"
    role="progressbar"
    :aria-valuenow="Math.round(percent)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <template v-if="isCircle">
      <svg class="sr-progress__circle" :viewBox="`0 0 ${circleSize} ${circleSize}`" aria-hidden="true">
        <circle
          class="sr-progress__circle-track"
          :cx="circleSize / 2"
          :cy="circleSize / 2"
          :r="radius"
          :stroke-width="ringStroke"
          fill="none"
        />
        <circle
          class="sr-progress__circle-bar"
          :cx="circleSize / 2"
          :cy="circleSize / 2"
          :r="radius"
          :stroke-width="ringStroke"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          fill="none"
          stroke-linecap="round"
        />
      </svg>

      <span v-if="showText" class="sr-progress__circle-text">
        <slot>{{ text }}</slot>
      </span>
    </template>

    <template v-else>
      <div class="sr-progress__track">
        <div class="sr-progress__bar">
          <span v-if="inside" class="sr-progress__text sr-progress__text--inside">
            <slot>{{ text }}</slot>
          </span>
        </div>
      </div>

      <span v-if="showText && !inside" class="sr-progress__text">
        <slot>{{ text }}</slot>
      </span>
    </template>
  </div>
</template>
