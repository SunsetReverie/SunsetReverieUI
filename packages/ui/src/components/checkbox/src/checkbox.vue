<script setup lang="ts">
import { computed, inject, ref, useAttrs, watchEffect } from 'vue'
import { SR_FORM_ITEM_KEY } from '../../form/src/form'

import { useSrConfig } from '../../../composables/use-sr-config'
import { srOmit } from '../../../utils/attrs'
import { SR_CHECKBOX_GROUP_KEY, checkboxProps, type SrCheckboxValue } from './checkbox'

defineOptions({ name: 'SrCheckbox', inheritAttrs: false })

const props = defineProps(checkboxProps)

/** 表单项上下文：表单级 disabled 从这里下发 */
const formItem = inject(SR_FORM_ITEM_KEY, null)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const attrs = useAttrs()
const config = useSrConfig()
const group = inject(SR_CHECKBOX_GROUP_KEY, null)

/** 原生 input */
const inputRef = ref<HTMLInputElement | null>(null)

/**
 * 是否真正作为「组内选项」工作
 *
 * 组里允许放不带 value 的独立复选框（典型场景：表头的全选/半选框）。
 * 若只看 group 是否存在，会把它当成值为 undefined 的选项写进数组，
 * 既污染绑定值，也让 update:modelValue 永远不触发。
 */
const isGrouped = computed(() => group !== null && props.value !== undefined)

/** 是否选中 */
const checked = computed(() => {
  if (isGrouped.value && group) {
    return group.value.value.includes(props.value as SrCheckboxValue)
  }
  return props.modelValue
})

/** 是否禁用：组级与自身任一为真 */
const isDisabled = computed(
  () => props.disabled || Boolean(group?.disabled.value) || (formItem?.disabled?.value ?? false),
)

/** 尺寸：自身 > 组 > 全局配置 */
const resolvedSize = computed(() => props.size ?? config.value.size)

/**
 * 变更处理
 * @param event 原生 change 事件
 */
function onChange(event: Event): void {
  const next = (event.target as HTMLInputElement).checked

  if (isGrouped.value && group) {
    group.toggle(props.value as SrCheckboxValue, next)
  } else {
    emit('update:modelValue', next)
  }

  emit('change', next)
  // 通知表单：值变了，可以跑 change 类规则
  formItem?.notify('change')
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
        // 半选是独立视觉状态，优先于 checked，否则勾和横线会叠在一起
        'is-checked': checked && !indeterminate,
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
