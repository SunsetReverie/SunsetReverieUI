<script setup lang="ts">
import { computed, useSlots } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { resultProps } from './result'

defineOptions({ name: 'SrResult', inheritAttrs: false })

const props = defineProps(resultProps)

const slots = useSlots()

/** 各状态对应的图标 */
const ICONS: Record<string, string> = {
  success: 'lucide:circle-check',
  error: 'lucide:circle-x',
  warning: 'lucide:triangle-exclamation-point',
  info: 'lucide:info',
}

/** 最终图标：自定义优先 */
const iconName = computed(() => props.icon || ICONS[props.status] || ICONS.info || 'lucide:info')

/** 是否有副标题 */
const hasSubTitle = computed(() => Boolean(props.subTitle) || Boolean(slots.subTitle))

/** 是否有操作区 */
const hasExtra = computed(() => Boolean(slots.extra))

/** 是否有额外内容 */
const hasContent = computed(() => Boolean(slots.default))
</script>

<template>
  <div class="sr-result" :class="[`sr-result--${status}`, { 'is-compact': compact }]" role="status">
    <div class="sr-result__icon">
      <slot name="icon">
        <SrIcon :name="iconName" :size="compact ? 28 : 44" />
      </slot>
    </div>

    <p v-if="title || $slots.title" class="sr-result__title">
      <slot name="title">{{ title }}</slot>
    </p>

    <p v-if="hasSubTitle" class="sr-result__subtitle">
      <slot name="subTitle">{{ subTitle }}</slot>
    </p>

    <div v-if="hasContent" class="sr-result__content">
      <slot />
    </div>

    <div v-if="hasExtra" class="sr-result__extra">
      <slot name="extra" />
    </div>
  </div>
</template>
