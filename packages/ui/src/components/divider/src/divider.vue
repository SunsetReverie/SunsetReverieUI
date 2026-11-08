<script setup lang="ts">
import { computed, useSlots } from 'vue'

import { dividerProps } from './divider'

defineOptions({ name: 'SrDivider', inheritAttrs: false })

const props = defineProps(dividerProps)

const slots = useSlots()

/** 是否带文字内容 */
const hasContent = computed(() => Boolean(slots.default))

/** 只有水平方向才认文字位置 */
const position = computed(() => (props.direction === 'horizontal' ? props.contentPosition : 'center'))
</script>

<template>
  <div
    class="sr-divider"
    :class="[
      `sr-divider--${direction}`,
      {
        'is-dashed': dashed,
        'is-with-text': hasContent,
      },
      `sr-divider--text-${position}`,
    ]"
    role="separator"
    :aria-orientation="direction === 'vertical' ? 'vertical' : 'horizontal'"
  >
    <span v-if="hasContent" class="sr-divider__text">
      <slot />
    </span>
  </div>
</template>
