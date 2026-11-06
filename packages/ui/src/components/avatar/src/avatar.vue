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

/** 回退态的备用配色，按名字散列取一个，避免同一个人换机器就变色 */
const PALETTE = ['#ff8a4c', '#10b981', '#6366f1', '#f43f5e', '#0ea5e9', '#f59e0b', '#8b5cf6']

/**
 * 取字符串散列
 * @param value 输入
 * @returns 非负整数
 */
function hashCode(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 1_000_003
  }
  return Math.abs(hash)
}

/** 回退态底色 */
const accent = computed(() => {
  if (props.color) return props.color
  return PALETTE[hashCode(props.alt || props.icon || 'sr') % PALETTE.length] as string
})

/** 根样式：尺寸与配色都走变量 */
const rootStyle = computed(() => {
  const style: Record<string, string> = {
    '--sr-avatar-accent': accent.value,
  }
  if (typeof props.size === 'number') {
    style['--sr-avatar-size'] = `${props.size}px`
    style['--sr-avatar-font'] = `${Math.round(props.size * 0.42)}px`
  }
  return style
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
