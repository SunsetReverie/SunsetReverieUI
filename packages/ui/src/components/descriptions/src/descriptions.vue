<script setup lang="ts">
import { computed, useSlots } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import { descriptionsProps, type SrDescriptionItem } from './descriptions'

defineOptions({ name: 'SrDescriptions', inheritAttrs: false })

const props = defineProps(descriptionsProps)

const slots = useSlots()
const config = useSrConfig()

/** 尺寸：自身 > 全局配置 */
const resolvedSize = computed(() => props.size ?? config.value.size)

/** 是否有头部 */
const hasHeader = computed(() => Boolean(props.title) || Boolean(slots.title) || Boolean(slots.extra))

/**
 * 字段名宽度
 *
 * horizontal 下才需要固定宽度，让多行左对齐。
 * @returns 内联样式
 */
const labelStyle = computed<Record<string, string> | undefined>(() => {
  if (props.direction !== 'horizontal' || props.labelWidth === undefined) return undefined

  const width = typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth
  return { flex: `0 0 ${width}`, width }
})

/**
 * 单项的栅格跨度
 *
 * 超过列数时夹到列数，否则会顶出一行。
 * @param item 字段
 * @returns 内联样式
 */
function itemStyle(item: SrDescriptionItem): Record<string, string> | undefined {
  if (!item.span || item.span <= 1) return undefined
  const span = Math.min(item.span, props.column)
  return { gridColumn: `span ${span}` }
}
</script>

<template>
  <div
    class="sr-descriptions"
    :class="[
      `sr-descriptions--${direction}`,
      {
        'is-bordered': border,
      },
      resolvedSize ? `sr-descriptions--${resolvedSize}` : '',
    ]"
    :style="{ '--sr-desc-column': column }"
  >
    <div v-if="hasHeader" class="sr-descriptions__header">
      <div class="sr-descriptions__title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="$slots.extra" class="sr-descriptions__extra">
        <slot name="extra" />
      </div>
    </div>

    <div class="sr-descriptions__body">
      <div
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        class="sr-descriptions__item"
        :style="itemStyle(item)"
      >
        <div class="sr-descriptions__label" :style="labelStyle">
          <slot name="label" :item="item" :index="index">{{ item.label }}</slot>
        </div>
        <div class="sr-descriptions__value">
          <slot name="value" :item="item" :index="index">{{ item.value ?? '—' }}</slot>
        </div>
      </div>
    </div>
  </div>
</template>
