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

/** 根节点样式 */
const rootStyle = computed(() => ({
  '--sr-progress-height': `${height.value}px`,
  '--sr-progress-percent': `${percent.value}%`,
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
        'is-inside': inside,
        'is-striped': striped,
        'is-animated': striped && animated,
      },
    ]"
    :style="rootStyle"
    role="progressbar"
    :aria-valuenow="Math.round(percent)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
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
  </div>
</template>
