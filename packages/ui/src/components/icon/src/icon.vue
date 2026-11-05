<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, useAttrs } from 'vue'

import { srEnsureOfflineIcons } from '../../../utils/icon-registry'
import { iconProps } from './icon'

defineOptions({ name: 'SrIcon', inheritAttrs: false })

const props = defineProps(iconProps)
const attrs = useAttrs()

// setup 阶段注册离线集合：服务端也要执行，否则 SSR 产出空 SVG 导致水合不一致
srEnsureOfflineIcons()

/** 归一化尺寸：数字补 px */
const cssSize = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))

/**
 * 组合 flip 与 rotate 的 transform
 * 两者可叠加，顺序固定为「先翻转再旋转」
 * @returns transform 字符串；无变换时返回 undefined
 */
const transform = computed<string | undefined>(() => {
  const parts: string[] = []
  const { flip, rotate } = props

  if (flip === true || flip === 'horizontal' || flip === 'both') parts.push('scaleX(-1)')
  if (flip === 'vertical' || flip === 'both') parts.push('scaleY(-1)')

  const degree = Number(rotate) || 0
  if (degree) parts.push(`rotate(${degree}deg)`)

  return parts.length > 0 ? parts.join(' ') : undefined
})

/** 根元素样式 */
const rootStyle = computed(() => ({
  fontSize: cssSize.value,
  color: props.color,
  transform: transform.value,
}))
</script>

<template>
  <span
    class="sr-icon"
    :class="{ 'is-spin': spin }"
    :style="rootStyle"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
    v-bind="attrs"
  >
    <slot>
      <Icon v-if="name" :icon="name" width="1em" height="1em" />
    </slot>
  </span>
</template>
