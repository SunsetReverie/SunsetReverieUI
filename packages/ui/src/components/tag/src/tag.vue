<script setup lang="ts">
import SrIcon from '../../icon/src/icon.vue'
import { tagProps } from './tag'

defineOptions({ name: 'SrTag' })

defineProps(tagProps)

const emit = defineEmits<{
  close: [event: MouseEvent]
}>()

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
    :class="[`sr-tag--${type}`, `sr-tag--${size}`, { 'is-round': round, 'is-closable': closable }]"
  >
    <span class="sr-tag__text">
      <slot />
    </span>

    <button v-if="closable" class="sr-tag__close" type="button" aria-label="移除标签" @click.stop="onClose">
      <sr-icon name="lucide:x" :size="'1em'" />
    </button>
  </span>
</template>
