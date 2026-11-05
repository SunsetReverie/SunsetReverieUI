<script setup lang="ts">
import { computed, useAttrs } from 'vue'

import { srOmit } from '../../../utils/attrs'
import type { SrResponsive } from '../../../types/theme'
import { ROW_ALIGN_MAP, ROW_JUSTIFY_MAP, rowProps, type SrGutter } from './row'

defineOptions({ name: 'SrRow', inheritAttrs: false })

// 刻意不写 <style> 块：组件样式统一由 src/styles/index.less 汇总、由 build-styles.mjs 编译成独立 CSS，保证「样式不进入 JS」这一按需引入的前提。

const props = defineProps(rowProps)
const attrs = useAttrs()

/**
 * 把 gutter 展开成按断点的 CSS 变量
 *
 * 输出形如 --sr-row-gutter-x-md: 16px，
 * 由 SrCol 在自己的媒体查询里按 fallback 链消费。
 * @returns 内联样式变量表
 */
const gutterVars = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {}

  /**
   * 写入单个断点的水平/垂直间距
   * @param suffix 断点后缀（xs / sm / md / lg / xl）
   * @param value 间距值
   */
  const write = (suffix: string, value: SrGutter): void => {
    if (typeof value === 'number') {
      out[`--sr-row-gutter-x-${suffix}`] = `${value}px`
      out[`--sr-row-gutter-y-${suffix}`] = `${value}px`
      return
    }
    out[`--sr-row-gutter-x-${suffix}`] = `${value[0]}px`
    out[`--sr-row-gutter-y-${suffix}`] = `${value[1]}px`
  }

  const gutter: SrResponsive<SrGutter> = props.gutter

  if (typeof gutter === 'number' || Array.isArray(gutter)) {
    write('xs', gutter as SrGutter)
  } else if (gutter && typeof gutter === 'object') {
    for (const [bp, value] of Object.entries(gutter)) {
      if (value == null) continue
      write(bp, value as SrGutter)
    }
  }

  return out
})

/** 合并后的根样式（间距变量 + 外部 style） */
const rootStyle = computed(() => ({ ...gutterVars.value, ...(attrs.style as Record<string, string>) }))

/** 对齐方式映射为 CSS 变量 */
const alignVars = computed<Record<string, string>>(() => ({
  '--sr-row-justify': ROW_JUSTIFY_MAP[props.justify] ?? 'flex-start',
  '--sr-row-align': ROW_ALIGN_MAP[props.align] ?? 'flex-start',
}))

/** 根元素 class */
const rootClass = computed(() => ['sr-row', { 'is-nowrap': !props.wrap }, attrs.class])
</script>

<template>
  <component
    :is="tag"
    :class="rootClass"
    :style="{ ...alignVars, ...rootStyle }"
    v-bind="srOmit(attrs, ['class', 'style'])"
  >
    <slot />
  </component>
</template>
