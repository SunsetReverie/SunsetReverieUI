<script setup lang="ts">
import { computed, useAttrs } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import type { SrSize } from '../../../types/config'
import type { SrResponsive } from '../../../types/theme'
import { srOmit } from '../../../utils/attrs'
import SrIcon from '../../icon/src/icon.vue'
import { BUTTON_SIZE_MAP, buttonProps } from './button'

defineOptions({ name: 'SrButton', inheritAttrs: false })

const props = defineProps(buttonProps)
const attrs = useAttrs()
const config = useSrConfig()

/** 最终尺寸：props 优先，其次全局配置 */
const resolvedSize = computed<SrResponsive<SrSize>>(() => props.size ?? config.value.size)

/**
 * 把尺寸展开为 CSS 变量
 *
 * 单一尺寸只写基础变量；响应式对象逐断点写，
 * 样式表里用 fallback 链就近继承（xs → md → xl）。
 * @returns 内联样式变量
 */
const sizeVars = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {}

  /**
   * 写入一组尺寸变量
   * @param suffix 断点后缀，单一尺寸时为空
   * @param size 尺寸档位
   */
  const write = (suffix: string, size: SrSize): void => {
    const metrics = BUTTON_SIZE_MAP[size]
    if (!metrics) return
    const tail = suffix ? `-${suffix}` : ''
    out[`--sr-button-height${tail}`] = `${metrics.height}px`
    out[`--sr-button-padding-x${tail}`] = `${metrics.paddingX}px`
    out[`--sr-button-font-size${tail}`] = `${metrics.fontSize}px`
    out[`--sr-button-gap${tail}`] = `${metrics.gap}px`
    out[`--sr-button-icon-size${tail}`] = `${metrics.iconSize}px`
  }

  const size = resolvedSize.value

  if (typeof size === 'string') {
    write('', size)
    return out
  }

  for (const [bp, value] of Object.entries(size)) {
    if (value) write(bp, value as SrSize)
  }

  return out
})

/** 根样式 */
const rootStyle = computed(() => ({ ...sizeVars.value, ...(attrs.style as Record<string, string>) }))

/** 根 class */
const rootClass = computed(() => [
  `sr-button--${props.variant}`,
  {
    'is-loading': props.loading,
    'is-disabled': props.disabled,
    'is-block': props.block,
    'is-round': props.round,
  },
  attrs.class,
])

/** 原生禁用：loading 期间同样禁用，浏览器会自带事件拦截 */
const isNativeDisabled = computed(() => props.disabled || props.loading)
</script>

<template>
  <button
    class="sr-button"
    :class="rootClass"
    :style="rootStyle"
    :type="htmlType"
    :disabled="isNativeDisabled"
    :aria-disabled="isNativeDisabled || undefined"
    :aria-busy="loading || undefined"
    v-bind="srOmit(attrs, ['class', 'style'])"
  >
    <span class="sr-button__content">
      <sr-icon v-if="icon && iconPosition === 'left'" :name="icon" class="sr-button__icon" />
      <slot name="icon" />
      <slot />
      <sr-icon v-if="icon && iconPosition === 'right'" :name="icon" class="sr-button__icon" />
    </span>

    <span v-if="loading" class="sr-button__spinner" aria-hidden="true" />
  </button>
</template>
