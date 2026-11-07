<script setup lang="ts">
import { computed } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import type { SrSize } from '../../../types/config'
import SrIcon from '../../icon/src/icon.vue'
import { navProps, type SrNavItem } from './nav'

defineOptions({ name: 'SrNav' })

const props = defineProps(navProps)

const emit = defineEmits<{
  'update:modelValue': [key: string]
  /** 选中某项 */
  select: [key: string, item: SrNavItem]
}>()

const config = useSrConfig()

/** 最终尺寸 */
const resolvedSize = computed<SrSize>(() => props.size ?? config.value.size)

/**
 * 点击导航项
 * @param item 导航项
 */
function pick(item: SrNavItem): void {
  if (props.disabled || item.disabled || !item.key) return
  if (item.key === props.modelValue) return
  emit('update:modelValue', item.key)
  emit('select', item.key, item)
}
</script>

<template>
  <nav class="sr-nav" :class="[`sr-nav--${resolvedSize}`, `sr-nav--${mode}`, { 'is-disabled': disabled }]">
    <template v-for="(item, index) in items" :key="item.key ?? index">
      <div v-if="item.divider" class="sr-nav__divider" role="separator" />

      <div v-if="item.group && item.group !== items[index - 1]?.group" class="sr-nav__group">
        {{ item.group }}
      </div>

      <button
        class="sr-nav__item"
        :class="{ 'is-active': item.key === modelValue, 'is-disabled': item.disabled || disabled }"
        type="button"
        :aria-current="item.key === modelValue ? 'page' : undefined"
        :disabled="item.disabled || disabled"
        @click="pick(item)"
      >
        <sr-icon v-if="item.icon" class="sr-nav__icon" :name="item.icon" :size="16" />
        <span class="sr-nav__label">{{ item.label }}</span>
        <span v-if="item.badge !== undefined && item.badge !== ''" class="sr-nav__badge">
          {{ item.badge }}
        </span>
      </button>
    </template>
  </nav>
</template>
