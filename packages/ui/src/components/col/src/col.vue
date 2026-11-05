<script setup lang="ts">
import { computed, useAttrs } from 'vue'

import { srOmit } from '../../../utils/attrs'
import type { SrResponsive } from '../../../types/theme'
import { colProps } from './col'

defineOptions({ name: 'SrCol', inheritAttrs: false })

const props = defineProps(colProps)
const attrs = useAttrs()

/**
 * 把 span / offset / push / pull 的响应式值展开为 CSS 变量
 *
 * 例：span={ xs: 24, md: 12 }
 *   → { '--sr-col-span-xs': '24', '--sr-col-span-md': '12' }
 * 未声明的断点在样式里由 fallback 链就近继承，无需 JS 参与。
 * @returns 内联样式变量表
 */
const layoutVars = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {}

  /**
   * 写入某一维度的变量
   * @param name 维度名（span / offset / push / pull）
   * @param value 数字或按断点分档的对象
   */
  const write = (name: string, value: SrResponsive<number>): void => {
    if (typeof value === 'number') {
      out[`--sr-col-${name}-xs`] = String(value)
      return
    }
    if (!value || typeof value !== 'object') return
    for (const [bp, val] of Object.entries(value)) {
      if (val == null) continue
      out[`--sr-col-${name}-${bp}`] = String(val)
    }
  }

  write('span', props.span)
  write('offset', props.offset)
  write('push', props.push)
  write('pull', props.pull)

  return out
})

/** 合并后的根样式（布局变量 + flex 覆盖 + 外部 style） */
const rootStyle = computed(() => {
  const style: Record<string, string | number> = { ...layoutVars.value }
  // 传了 flex 就交给弹性布局决定宽度，需同时解除 span 算出的固定宽度与上限
  if (props.flex !== '' && props.flex !== undefined) {
    style.flex = typeof props.flex === 'number' ? `${props.flex} 1 0%` : props.flex
    style.width = 'auto'
    style.maxWidth = '100%'
  }
  return { ...style, ...(attrs.style as Record<string, string>) }
})

/** 根元素 class */
const rootClass = computed(() => ['sr-col', attrs.class])
</script>

<template>
  <component :is="tag" :class="rootClass" :style="rootStyle" v-bind="srOmit(attrs, ['class', 'style'])">
    <slot />
  </component>
</template>
