<script setup lang="ts">
import { computed } from 'vue'

import { badgeProps } from './badge'

defineOptions({ name: 'SrBadge' })

const props = defineProps(badgeProps)

/** 是否显示徽标 */
const visible = computed(() => {
  if (props.hidden) return false
  if (props.dot) return true
  if (props.value === '' || props.value === undefined || props.value === null) return false
  if (props.value === 0 && !props.showZero) return false
  return true
})

/** 展示文本：纯数字才折叠 */
const text = computed(() => {
  const raw = props.value
  if (typeof raw === 'number' && raw > props.max) return `${props.max}+`
  return String(raw)
})
</script>

<template>
  <span class="sr-badge" :class="{ 'is-standalone': !$slots.default }">
    <slot />
    <sup v-if="visible" class="sr-badge__sup" :class="[`sr-badge--${type}`, { 'is-dot': dot }]">
      {{ dot ? '' : text }}
    </sup>
  </span>
</template>
