<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { avatarProps } from './avatar'

defineOptions({ name: 'SrAvatar' })

const props = defineProps(avatarProps)

/** 图片是否加载失败 */
const failed = ref(false)

// 换图后要重新给一次机会
watch(
  () => props.src,
  () => {
    failed.value = false
  },
)

/** 根样式：数字尺寸走内联，档位走类名 */
const rootStyle = computed(() => {
  if (typeof props.size !== 'number') return undefined
  const px = `${props.size}px`
  return { '--sr-avatar-size': px, '--sr-avatar-font': `${Math.round(props.size * 0.42)}px` }
})

/** 回退文字：取名称前两个字符 */
const fallbackText = computed(() => props.alt.trim().slice(0, 2))

/** 是否显示图片 */
const showImage = computed(() => Boolean(props.src) && !failed.value)
</script>

<template>
  <span
    class="sr-avatar"
    :class="[typeof size === 'number' ? 'sr-avatar--custom' : `sr-avatar--${size}`, `is-${shape}`]"
    :style="rootStyle"
  >
    <img v-if="showImage" class="sr-avatar__image" :src="src" :alt="alt" @error="failed = true" />
    <sr-icon v-else-if="icon" class="sr-avatar__icon" :name="icon" :size="'55%'" />
    <slot v-else>{{ fallbackText }}</slot>
  </span>
</template>
