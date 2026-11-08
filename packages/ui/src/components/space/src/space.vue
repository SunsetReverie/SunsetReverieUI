<script setup lang="ts">
import { computed } from 'vue'

import { spaceProps } from './space'

defineOptions({ name: 'SrSpace', inheritAttrs: false })

const props = defineProps(spaceProps)

/** 档位到像素的映射 */
const SIZE_MAP: Record<string, number> = { xs: 4, sm: 8, md: 12, lg: 16 }

/** 实际间距值 */
const gap = computed(() => (typeof props.size === 'number' ? props.size : (SIZE_MAP[props.size] ?? 8)))
</script>

<template>
  <div
    class="sr-space"
    :class="[`sr-space--${direction}`, { 'is-wrap': wrap, 'is-inline': inline }]"
    :style="{
      gap: `${gap}px`,
      alignItems: align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : align,
    }"
  >
    <slot />
  </div>
</template>
