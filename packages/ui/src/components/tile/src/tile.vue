<script setup lang="ts">
import SrIcon from '../../icon/src/icon.vue'
import { tileProps } from './tile'

defineOptions({ name: 'SrTile', inheritAttrs: false })

const props = defineProps(tileProps)

const emit = defineEmits<{
  /** 点击 */
  click: [event: MouseEvent]
}>()

/**
 * 点击
 * @param event 鼠标事件
 */
function onClick(event: MouseEvent): void {
  if (props.disabled) return
  emit('click', event)
}
</script>

<template>
  <button
    class="sr-tile"
    :class="[
      `sr-tile--${size}`,
      `sr-tile--${type}`,
      {
        'is-active': active,
        'is-disabled': disabled,
        'is-horizontal': horizontal,
      },
    ]"
    type="button"
    :disabled="disabled"
    :aria-pressed="active"
    @click="onClick"
  >
    <span v-if="icon || $slots.icon" class="sr-tile__icon">
      <slot name="icon">
        <SrIcon :name="icon" :size="horizontal ? 18 : 22" />
      </slot>
    </span>

    <span class="sr-tile__body">
      <span v-if="title || $slots.title" class="sr-tile__title">
        <slot name="title">{{ title }}</slot>
      </span>
      <span v-if="description || $slots.description" class="sr-tile__desc">
        <slot name="description">{{ description }}</slot>
      </span>
    </span>

    <span v-if="active" class="sr-tile__check">
      <SrIcon name="lucide:check" :size="11" />
    </span>
  </button>
</template>
