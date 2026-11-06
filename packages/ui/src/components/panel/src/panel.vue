<script setup lang="ts">
import { computed, ref, useSlots, watch } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { panelProps } from './panel'

defineOptions({ name: 'SrPanel' })

const props = defineProps(panelProps)

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
}>()

const slots = useSlots()

/** 内部展开态：未绑定 v-model 时也能自己收放 */
const innerOpen = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    innerOpen.value = value
  },
)

/** 有标题、说明或 header 插槽时才渲染头部 */
const hasHeader = computed(() => Boolean(props.title || props.description || slots.header || slots.extra))

/** 点击头部切换 */
function toggle(): void {
  if (!props.collapsible) return
  innerOpen.value = !innerOpen.value
  emit('update:modelValue', innerOpen.value)
}
</script>

<template>
  <section
    class="sr-panel"
    :class="{ 'is-collapsible': collapsible, 'is-collapsed': !innerOpen, 'is-flush': flush }"
  >
    <header
      v-if="hasHeader"
      class="sr-panel__header"
      :class="{ 'is-clickable': collapsible }"
      @click="toggle"
    >
      <div class="sr-panel__titles">
        <slot name="header">
          <h3 v-if="title" class="sr-panel__title">{{ title }}</h3>
          <p v-if="description" class="sr-panel__description">{{ description }}</p>
        </slot>
      </div>

      <div class="sr-panel__extra">
        <slot name="extra" />
        <sr-icon
          v-if="collapsible"
          class="sr-panel__arrow"
          :class="{ 'is-open': innerOpen }"
          name="lucide:chevron-down"
          :size="16"
        />
      </div>
    </header>

    <div v-show="innerOpen" class="sr-panel__body">
      <slot />
    </div>
  </section>
</template>
