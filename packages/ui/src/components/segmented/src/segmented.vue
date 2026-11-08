<script setup lang="ts">
import { computed } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import SrIcon from '../../icon/src/icon.vue'
import { segmentedProps, type SrSegmentedOption, type SrSegmentedValue } from './segmented'

defineOptions({ name: 'SrSegmented', inheritAttrs: false })

const props = defineProps(segmentedProps)

const emit = defineEmits<{
  /** 选中值变化 */
  'update:modelValue': [value: SrSegmentedValue]
  /** 切换了选项 */
  change: [value: SrSegmentedValue]
}>()

const config = useSrConfig()

/** 尺寸：自身 > 全局配置 */
const resolvedSize = computed(() => props.size ?? config.value.size)

/** 选项数量 */
const count = computed(() => props.options.length)

/**
 * 选中项的下标
 *
 * 用来把滑块移到正确位置。没选中时返回 -1，滑块会隐藏。
 * @returns 下标
 */
const activeIndex = computed(() => props.options.findIndex((option) => option.value === props.modelValue))

/**
 * 滑块样式
 *
 * 选项是等宽的（grid 等分），所以按百分比算位置就够，不用量 DOM。
 * @returns 内联样式
 */
const indicatorStyle = computed<Record<string, string> | undefined>(() => {
  if (activeIndex.value < 0 || count.value === 0) return undefined

  return {
    width: `${100 / count.value}%`,
    transform: `translateX(${activeIndex.value * 100}%)`,
  }
})

/**
 * 选择某一项
 * @param option 选项
 */
function select(option: SrSegmentedOption): void {
  if (props.disabled || option.disabled || option.value === props.modelValue) return

  emit('update:modelValue', option.value)
  emit('change', option.value)
}
</script>

<template>
  <div
    class="sr-segmented"
    :class="[
      {
        'is-block': block,
        'is-disabled': disabled,
      },
      resolvedSize ? `sr-segmented--${resolvedSize}` : '',
    ]"
    :style="{ '--sr-segmented-count': count }"
    role="tablist"
  >
    <!-- 滑块：等宽选项下按百分比定位，不需要测量真实位置 -->
    <span v-if="indicatorStyle" class="sr-segmented__indicator" :style="indicatorStyle" />

    <button
      v-for="option in options"
      :key="option.value"
      class="sr-segmented__item"
      :class="{ 'is-active': option.value === modelValue }"
      type="button"
      role="tab"
      :disabled="disabled || option.disabled"
      :aria-selected="option.value === modelValue"
      @click="select(option)"
    >
      <SrIcon v-if="option.icon" :name="option.icon" :size="13" />
      <span class="sr-segmented__label">{{ option.label }}</span>
    </button>
  </div>
</template>
