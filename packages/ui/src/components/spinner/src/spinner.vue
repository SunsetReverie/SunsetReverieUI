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
</script>

<template>
  <span
    class="sr-spinner"
    :class="{ 'is-decorative': !label }"
    :style="rootStyle"
    :role="label ? 'status' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  >
    <svg class="sr-spinner__svg" viewBox="0 0 24 24" fill="none">
      <!-- 底环：低透明度，给旋转的弧一个参照 -->
      <circle
        class="sr-spinner__track"
        cx="12"
        cy="12"
        r="10"
        :stroke-width="strokeWidth"
        stroke="currentColor"
      />

      <!-- 弧：dasharray 截出 1/4 圈，靠旋转产生动感 -->
      <circle
        class="sr-spinner__arc"
        cx="12"
        cy="12"
        r="10"
        :stroke-width="strokeWidth"
        stroke="currentColor"
        :stroke-dasharray="`${CIRCUMFERENCE * 0.25} ${CIRCUMFERENCE * 0.75}`"
        stroke-linecap="round"
      />
    </svg>
  </span>
</template>
