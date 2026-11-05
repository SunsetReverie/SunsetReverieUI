<script setup lang="ts">
import { computed, provide, toRef } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import { SR_CHECKBOX_GROUP_KEY, checkboxGroupProps, type SrCheckboxValue } from './checkbox'

defineOptions({ name: 'SrCheckboxGroup', inheritAttrs: false })

const props = defineProps(checkboxGroupProps)

const emit = defineEmits<{
  'update:modelValue': [value: SrCheckboxValue[]]
  change: [value: SrCheckboxValue[]]
}>()

const config = useSrConfig()

/**
 * 切换某一项
 * @param item 该项的值
 * @param checked 是否选中
 */
function toggle(item: SrCheckboxValue, checked: boolean): void {
  const current = props.modelValue ?? []
  const next = checked
    ? current.includes(item)
      ? current
      : [...current, item]
    : current.filter((value) => value !== item)

  emit('update:modelValue', next)
  emit('change', next)
}

provide(SR_CHECKBOX_GROUP_KEY, {
  value: computed(() => props.modelValue ?? []),
  disabled: toRef(props, 'disabled'),
  toggle,
})

/** 组尺寸：自身 > 全局配置，通过 CSS 变量下发给子项 */
const size = computed(() => props.size ?? config.value.size)
</script>

<template>
  <div
    class="sr-checkbox-group"
    :class="[`sr-checkbox-group--${size}`, $attrs.class]"
    role="group"
    :style="$attrs.style as Record<string, string>"
  >
    <slot />
  </div>
</template>
