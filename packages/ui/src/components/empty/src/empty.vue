<script setup lang="ts">
import { computed } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { emptyProps } from './empty'

defineOptions({ name: 'SrEmpty' })

const props = defineProps(emptyProps)

/** 图标尺寸 */
const ICON_SIZE: Record<string, number> = { xs: 24, sm: 30, md: 40, lg: 52 }

/** 当前档位对应的图标尺寸 */
const iconSize = computed(() => ICON_SIZE[props.size] ?? 40)
</script>

<template>
  <div class="sr-empty" :class="[`sr-empty--${size}`, { 'is-bordered': bordered }]">
    <img v-if="image" class="sr-empty__image" :src="image" alt="" />
    <sr-icon v-else-if="icon" class="sr-empty__icon" :name="icon" :size="iconSize" />

    <p class="sr-empty__description">
      <slot>{{ description }}</slot>
    </p>

    <div v-if="$slots.action" class="sr-empty__action">
      <slot name="action" />
    </div>
  </div>
</template>
