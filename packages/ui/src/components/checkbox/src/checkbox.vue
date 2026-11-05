<script setup lang="ts">
import { computed, inject, ref, useAttrs, watchEffect } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import { srOmit } from '../../../utils/attrs'
import { SR_CHECKBOX_GROUP_KEY, checkboxProps, type SrCheckboxValue } from './checkbox'

defineOptions({ name: 'SrCheckbox', inheritAttrs: false })

const props = defineProps(checkboxProps)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const attrs = useAttrs()
const config = useSrConfig()
const group = inject(SR_CHECKBOX_GROUP_KEY, null)

/** 原生 input */
const inputRef = ref<HTMLInputElement | null>(null)

/** 是否处于分组中 */
const isGrouped = computed(() => group !== null)

/** 是否选中 */
const checked = computed(() => {
  if (group) {
    return group.value.value.includes(props.value as SrCheckboxValue)
  }
  return props.modelValue
})

/** 是否禁用：组级与自身任一为真 */
const isDisabled = computed(() => props.disabled || Boolean(group?.disabled.value))

/** 尺寸：自身 > 组 > 全局配置 */
const resolvedSize = computed(() => props.size ?? config.value.size)

/**
 * 变更处理
 * @param event 原生 change 事件
 */
function onChange(event: Event): void {
  const next = (event.target as HTMLInputElement).checked

  if (group) {
    group.toggle(props.value as SrCheckboxValue, next)
  } else {
    emit('update:modelValue', next)
  }

  emit('change', next)
}

// indeterminate 是 DOM 属性而非 attribute，只能通过 ref 写。
// 用 watchEffect + flush: 'post'：模板 ref 在挂载后才可用，
// post 时机保证 DOM 已打补丁，挂载后的首次赋值不会落空。
watchEffect(
  () => {
    const element = inputRef.value
    if (element) element.indeterminate = props.indeterminate
  },
  { flush: 'post' },
)
</script>

<template>
  <label
    class="sr-checkbox"
    :class="[
      `sr-checkbox--${resolvedSize}`,
      {
        'is-checked': checked,
        'is-indeterminate': indeterminate,
        'is-disabled': isDisabled,
      },
      attrs.class,
    ]"
    :style="attrs.style as Record<string, string>"
  >
    <input
      ref="inputRef"
      class="sr-checkbox__input"
      type="checkbox"
      :checked="checked"
      :disabled="isDisabled"
      :name="name"
      :value="isGrouped ? value : undefined"
      v-bind="srOmit(attrs as Record<string, unknown>, ['class', 'style'])"
      @change="onChange"
    />

    <span class="sr-checkbox__box" aria-hidden="true">
      <svg class="sr-checkbox__tick" viewBox="0 0 16 16" fill="none">
        <path
          d="M3.5 8.5L6.5 11.5L12.5 5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <span class="sr-checkbox__dash" />
    </span>

    <span v-if="label || $slots.default" class="sr-checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
