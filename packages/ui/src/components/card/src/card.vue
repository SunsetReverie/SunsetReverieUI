<script setup lang="ts">
import { computed, useSlots } from 'vue'

import { cardProps } from './card'

defineOptions({ name: 'SrCard' })

const props = defineProps(cardProps)

const slots = useSlots()

/** 有标题、副标题、header 或 extra 插槽时才渲染头部 */
const hasHeader = computed(() => Boolean(props.title || props.subtitle || slots.header || slots.extra))

/** 内边距档位：padding 优先于 size */
const paddingClass = computed(() => {
  const padding = props.padding || props.size
  return padding === 'none' ? 'is-flush' : `sr-card--${padding}`
})
</script>

<template>
  <div class="sr-card" :class="[paddingClass, { 'is-bordered': bordered, 'is-hoverable': hoverable }]">
    <div v-if="hasHeader" class="sr-card__header">
      <slot name="header">
        <div class="sr-card__titles">
          <h3 v-if="title" class="sr-card__title">{{ title }}</h3>
          <p v-if="subtitle" class="sr-card__subtitle">{{ subtitle }}</p>
        </div>
      </slot>

      <div v-if="$slots.extra" class="sr-card__extra">
        <slot name="extra" />
      </div>
    </div>

    <div class="sr-card__body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="sr-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>
