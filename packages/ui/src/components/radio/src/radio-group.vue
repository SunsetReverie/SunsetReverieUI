<script setup lang="ts">
import { computed, provide, toRef, useAttrs, useId } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import { SR_RADIO_GROUP_KEY, radioGroupProps, type SrRadioValue } from './radio'

defineOptions({ name: 'SrRadioGroup', inheritAttrs: false })

const props = defineProps(radioGroupProps)

const emit = defineEmits<{
  'update:modelValue': [value: SrRadioValue]
  change: [value: SrRadioValue]
}>()

const attrs = useAttrs()
const config = useSrConfig()

/** 组内共享的 name，未指定时自动生成，保证原生 radio 的互斥语义 */
const autoName = useId()

/**
 * 选中某一项
 * @param value 目标值
 */
function select(value: SrRadioValue): void {
  if (props.disabled || value === props.modelValue) return
  emit('update:modelValue', value)
  emit('change', value)
}

provide(SR_RADIO_GROUP_KEY, {
  value: computed(() => props.modelValue),
  disabled: toRef(props, 'disabled'),
  name: computed(() => props.name || `sr-radio-${autoName}`),
  select,
})

/** 组尺寸 */
const size = computed(() => props.size ?? config.value.size)
</script>

<template>
  <div
    class="sr-radio-group"
    :class="[`sr-radio-group--${size}`, attrs.class]"
    role="radiogroup"
    :style="attrs.style as Record<string, string>"
  >
    <slot />
  </div>
</template>
