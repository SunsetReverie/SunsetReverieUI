<script setup lang="ts">
import { computed, inject, useAttrs } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import { srOmit } from '../../../utils/attrs'
import { SR_RADIO_GROUP_KEY, radioProps, type SrRadioProps } from './radio'

defineOptions({ name: 'SrRadio', inheritAttrs: false })

const props = defineProps(radioProps)

const emit = defineEmits<{
  'update:modelValue': [value: SrRadioProps['value']]
  change: [value: SrRadioProps['value']]
}>()

const attrs = useAttrs()
const config = useSrConfig()
const group = inject(SR_RADIO_GROUP_KEY, null)

/** 是否选中 */
const checked = computed(() => (group ? group.value.value === props.value : props.modelValue === props.value))

/** 是否禁用 */
const isDisabled = computed(() => props.disabled || Boolean(group?.disabled.value))

/** 尺寸：自身 > 全局配置（组尺寸通过 CSS 变量下发，不参与 JS 计算） */
const resolvedSize = computed(() => props.size ?? config.value.size)

/** 原生 name：自身 > 组 */
const resolvedName = computed(() => props.name || group?.name.value || '')

/**
 * 变更处理
 * @param event 原生 change 事件
 */
function onChange(event: Event): void {
  if (!(event.target as HTMLInputElement).checked) return
  // 没有 value 的单选项无法参与选中，直接忽略（通常是用法错误）
  if (props.value === undefined) return

  if (group) {
    group.select(props.value)
  } else {
    emit('update:modelValue', props.value)
  }

  emit('change', props.value)
}
</script>

<template>
  <label
    class="sr-radio"
    :class="[`sr-radio--${resolvedSize}`, { 'is-checked': checked, 'is-disabled': isDisabled }, attrs.class]"
    :style="attrs.style as Record<string, string>"
  >
    <input
      class="sr-radio__input"
      type="radio"
      :checked="checked"
      :disabled="isDisabled"
      :name="resolvedName"
      :value="String(value)"
      v-bind="srOmit(attrs as Record<string, unknown>, ['class', 'style'])"
      @change="onChange"
    />

    <span class="sr-radio__circle" aria-hidden="true">
      <span class="sr-radio__dot" />
    </span>

    <span v-if="label || $slots.default" class="sr-radio__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
