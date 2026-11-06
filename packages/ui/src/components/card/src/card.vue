<script setup lang="ts">
import { useSlots } from 'vue'

import { cardProps } from './card'

defineOptions({ name: 'SrCard' })

defineProps(cardProps)

const slots = useSlots()

/** 有标题、副标题或 header 插槽时才渲染头部 */
function hasHeader(title: string, subtitle: string): boolean {
  return Boolean(title || subtitle || slots.header)
}
</script>

<template>
  <div class="sr-card" :class="[`sr-card--${size}`, { 'is-bordered': bordered, 'is-hoverable': hoverable }]">
    <div v-if="hasHeader(title, subtitle)" class="sr-card__header">
      <slot name="header">
        <div class="sr-card__titles">
          <h3 v-if="title" class="sr-card__title">{{ title }}</h3>
          <p v-if="subtitle" class="sr-card__subtitle">{{ subtitle }}</p>
        </div>
      </slot>
    </div>

    <div class="sr-card__body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="sr-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>
