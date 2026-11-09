<script setup lang="ts">
import { computed } from 'vue'

import { SPINNER_SIZE_MAP, spinnerProps } from './spinner'

defineOptions({ name: 'SrSpinner', inheritAttrs: false })

const props = defineProps(spinnerProps)

/** 像素尺寸 */
const px = computed(() =>
  typeof props.size === 'number' ? props.size : (SPINNER_SIZE_MAP[props.size] ?? 20),
)

/** 根样式 */
const rootStyle = computed(() => {
  const style: Record<string, string> = { width: `${px.value}px`, height: `${px.value}px` }
  if (props.color) style.color = props.color
  return style
})

/** 圆环周长（按 viewBox 24、半径 10 计算），用于 dasharray */
const CIRCUMFERENCE = 2 * Math.PI * 10

/** 圆环描边宽度：随尺寸缩放，小尺寸下不糊 */
const stroke = computed(() => props.strokeWidth)

/** 圆环类的动画数量 */
const DOT_COUNT = 3
const BAR_COUNT = 4
</script>

<template>
  <span
    class="sr-spinner"
    :class="[`sr-spinner--${variant}`, { 'is-decorative': !label }]"
    :style="rootStyle"
    :role="label ? 'status' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  >
    <!-- 圆环：底环 + 1/4 弧旋转 -->
    <svg v-if="variant === 'ring'" class="sr-spinner__svg" viewBox="0 0 24 24" fill="none">
      <circle class="sr-spinner__track" cx="12" cy="12" r="10" :stroke-width="stroke" stroke="currentColor" />
      <circle
        class="sr-spinner__arc"
        cx="12"
        cy="12"
        r="10"
        :stroke-width="stroke"
        stroke="currentColor"
        :stroke-dasharray="`${CIRCUMFERENCE * 0.25} ${CIRCUMFERENCE * 0.75}`"
        stroke-linecap="round"
      />
    </svg>

    <!-- 渐变环：conic-gradient 挖空中心 -->
    <span
      v-else-if="variant === 'gradient'"
      class="sr-spinner__gradient"
      :style="{ '--sr-spinner-stroke': `${Math.max(1.5, px * 0.1)}px` }"
    />

    <!-- 三点跳动 -->
    <template v-else-if="variant === 'dots'">
      <i v-for="n in DOT_COUNT" :key="n" class="sr-spinner__dot" />
    </template>

    <!-- 竖条起伏 -->
    <template v-else-if="variant === 'bars'">
      <i v-for="n in BAR_COUNT" :key="n" class="sr-spinner__bar" />
    </template>

    <!-- 同心圆扩散 -->
    <template v-else-if="variant === 'pulse'">
      <i class="sr-spinner__pulse" />
      <i class="sr-spinner__pulse" />
    </template>

    <!-- 小球绕轨 -->
    <template v-else-if="variant === 'orbit'">
      <i class="sr-spinner__orbit-track" />
      <i class="sr-spinner__orbit-spin" />
    </template>
  </span>
</template>
