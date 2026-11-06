<script setup lang="ts">
import { computed } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { tagProps } from './tag'

defineOptions({ name: 'SrTag' })

const props = defineProps(tagProps)

const emit = defineEmits<{
  close: [event: MouseEvent]
}>()

/** 自定义基色：走内联变量，优先级高于 type 类里的同名变量 */
const rootStyle = computed(() => (props.color ? { '--sr-tag-base': props.color } : undefined))

/**
 * 点击关闭
 * @param event 鼠标事件
 */
function onClose(event: MouseEvent): void {
  emit('close', event)
}
</script>

<template>
  <span
    class="sr-tag"
    :class="[
      `sr-tag--${type}`,
      `sr-tag--${size}`,
      { 'is-dark': variant === 'dark', 'is-round': round, 'is-closable': closable },
    ]"
    :style="rootStyle"
  >
    <span class="sr-tag__text">
      <slot />
    </span>

    <button v-if="closable" class="sr-tag__close" type="button" aria-label="移除标签" @click.stop="onClose">
      <sr-icon name="lucide:x" :size="'1em'" />
    </button>
  </span>
</template>
