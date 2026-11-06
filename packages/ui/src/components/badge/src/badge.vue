<script setup lang="ts">
import { computed } from 'vue'

import { badgeProps } from './badge'

defineOptions({ name: 'SrBadge' })

const props = defineProps(badgeProps)

/** 是否状态点模式 */
const isStatusMode = computed(() => Boolean(props.status))

/** 是否显示徽标 */
const visible = computed(() => {
  if (isStatusMode.value) return false
  if (props.hidden) return false
  if (props.dot) return true
  if (props.value === '' || props.value === undefined || props.value === null) return false
  if (props.value === 0 && !props.showZero) return false
  return true
})

/** 展示文本：纯数字才折叠（不能叫 text，会和同名 prop 冲突） */
const displayText = computed(() => {
  const raw = props.value
  if (typeof raw === 'number' && raw > props.max) return `${props.max}+`
  return String(raw)
})
</script>

<template>
  <span class="sr-badge" :class="{ 'is-standalone': !$slots.default }">
    <slot />

    <span
      v-if="isStatusMode"
      class="sr-badge__status"
      :class="[`sr-badge__status--${status}`, { 'is-processing': status === 'processing' }]"
    >
      {{ text }}
    </span>

    <sup v-if="visible" class="sr-badge__sup" :class="[`sr-badge--${type}`, { 'is-dot': dot }]">
      {{ dot ? '' : displayText }}
    </sup>
  </span>
</template>
