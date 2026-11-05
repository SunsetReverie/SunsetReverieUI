<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, useAttrs } from 'vue'

import { srEnsureOfflineIcons } from '../../../utils/icon-registry'
import type { SrSize } from '../../../types/config'
import { ICON_SIZE_MAP, iconProps } from './icon'

defineOptions({ name: 'SrIcon', inheritAttrs: false })

const props = defineProps(iconProps)
const attrs = useAttrs()

// setup 阶段注册离线集合：服务端也要执行，否则 SSR 产出空 SVG 导致水合不一致
srEnsureOfflineIcons()

/**
 * 归一化尺寸
 *
 * 档位关键字优先于「原样透传」：这样 <sr-icon size="md"> 与 <sr-button size="md">
 * 是同一个概念，消除「size 在 Icon 里指具体尺寸、在别处指档位」的歧义。
 * @returns 可写入 font-size 的值
 */
const cssSize = computed(() => {
  const { size } = props
  if (typeof size === 'number') return `${size}px`
  if (Object.hasOwn(ICON_SIZE_MAP, size)) return `${ICON_SIZE_MAP[size as SrSize]}px`
  return size
})

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
