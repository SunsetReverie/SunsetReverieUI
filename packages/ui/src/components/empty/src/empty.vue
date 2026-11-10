<script setup lang="ts">
import { computed } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { emptyPresets, emptyProps } from './empty'

defineOptions({ name: 'SrEmpty' })

const props = defineProps(emptyProps)

/** 图标本身尺寸，约为图标块的一半，四周留出呼吸空间 */
const GLYPH_SIZE: Record<string, number> = { xs: 16, sm: 20, md: 26, lg: 32 }

/** 当前场景的预设（图标 / 文案 / 色调） */
const preset = computed(() => emptyPresets[props.type] ?? emptyPresets.default)

/** 实际图标：显式 icon 优先（传空串表示不显示图标），未传则用预设 */
const mergedIcon = computed(() => (props.icon === undefined ? preset.value.icon : props.icon))

/** 实际文案：显式 description 优先，未传则用预设 */
const mergedDescription = computed(() => props.description || preset.value.description)

/** 图标尺寸 */
const iconSize = computed(() => GLYPH_SIZE[props.size] ?? GLYPH_SIZE.md)
</script>

<template>
  <div class="sr-empty" :class="[`sr-empty--${size}`, `is-tone-${preset.tone}`, { 'is-bordered': bordered }]">
    <img v-if="image" class="sr-empty__image" :src="image" alt="" />
    <span v-else-if="mergedIcon" class="sr-empty__icon">
      <SrIcon :name="mergedIcon" :size="iconSize" />
    </span>

    <p class="sr-empty__description">
      <slot>{{ mergedDescription }}</slot>
    </p>

    <div v-if="$slots.action" class="sr-empty__action">
      <slot name="action" />
    </div>
  </div>
</template>
