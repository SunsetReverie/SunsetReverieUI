<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'

import { alertProps } from './alert'
import SrIcon from '../../icon/src/icon.vue'

defineOptions({ name: 'SrAlert', inheritAttrs: false })

const props = defineProps(alertProps)

const emit = defineEmits<{
  /** 关闭 */
  close: []
}>()

const slots = useSlots()

/** 是否已关闭 */
const closed = ref(false)

/** 是否有标题：prop 或插槽二者其一 */
const hasTitle = computed(() => Boolean(props.title) || Boolean(slots.title))

/** 各类型对应的图标 */
const ICONS: Record<string, string> = {
  info: 'lucide:info',
  success: 'lucide:circle-check',
  warning: 'lucide:triangle-exclamation-point',
  error: 'lucide:circle-x',
}

/** 当前图标 */
const iconName = computed(() => ICONS[props.type] ?? ICONS.info ?? 'lucide:info')

/** 关闭 */
function close(): void {
  closed.value = true
  emit('close')
}
</script>

<template>
  <div
    v-if="!closed"
    class="sr-alert"
    :class="[`sr-alert--${type}`, { 'is-banner': banner, 'is-center': center, 'is-titled': hasTitle }]"
    role="alert"
  >
    <SrIcon v-if="showIcon" class="sr-alert__icon" :name="iconName" :size="16" />

    <div class="sr-alert__body">
      <p v-if="hasTitle" class="sr-alert__title">
        <slot name="title">{{ title }}</slot>
      </p>
      <div class="sr-alert__desc">
        <slot>{{ description }}</slot>
      </div>
    </div>

    <button v-if="closable" class="sr-alert__close" type="button" aria-label="关闭" @click="close">
      <SrIcon name="lucide:x" :size="14" />
    </button>
  </div>
</template>
