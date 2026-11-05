<script setup lang="ts">
import { computed, useAttrs } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import { srOmit } from '../../../utils/attrs'
import SrSpinner from '../../spinner/src/spinner.vue'
import { switchProps } from './switch'

defineOptions({ name: 'SrSwitch', inheritAttrs: false })

const props = defineProps(switchProps)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const attrs = useAttrs()
const config = useSrConfig()

/** 尺寸 */
const size = computed(() => props.size ?? config.value.size)

/** 是否不可交互 */
const isDisabled = computed(() => props.disabled || props.loading)

/** 当前应显示的文字 */
const text = computed(() => (props.modelValue ? props.checkedText : props.uncheckedText))

/**
 * 切换
 *
 * 用原生 <button role="switch"> 承载，Enter / Space 由浏览器直接支持，
 * 不需要手写 keydown 分支。
 */
function onToggle(): void {
  if (isDisabled.value) return
  const next = !props.modelValue
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<template>
  <button
    class="sr-switch"
    :class="[
      `sr-switch--${size}`,
      {
        'is-checked': modelValue,
        'is-disabled': isDisabled,
        'is-loading': loading,
      },
      attrs.class,
    ]"
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label || undefined"
    :disabled="isDisabled"
    :style="attrs.style as Record<string, string>"
    v-bind="srOmit(attrs as Record<string, unknown>, ['class', 'style'])"
    @click="onToggle"
  >
    <span class="sr-switch__rail">
      <span class="sr-switch__handle">
        <sr-spinner v-if="loading" class="sr-switch__spinner" size="xs" :stroke-width="2.5" />
      </span>
    </span>

    <span v-if="text || $slots.default" class="sr-switch__text">
      <slot>{{ text }}</slot>
    </span>
  </button>
</template>
