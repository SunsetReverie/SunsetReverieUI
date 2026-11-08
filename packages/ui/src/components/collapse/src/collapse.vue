<script setup lang="ts">
import { computed } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { collapseProps, type SrCollapseItem, type SrCollapseKey } from './collapse'

defineOptions({ name: 'SrCollapse', inheritAttrs: false })

const props = defineProps(collapseProps)

const emit = defineEmits<{
  /** 展开状态变化 */
  'update:modelValue': [keys: SrCollapseKey[]]
  /** 某一项被展开或收起 */
  change: [keys: SrCollapseKey[], key: SrCollapseKey]
}>()

/** 当前展开的集合 */
const opened = computed(() => new Set(props.modelValue))

/**
 * 某一项是否展开
 * @param key 标识
 * @returns 是否展开
 */
function isOpen(key: SrCollapseKey): boolean {
  return opened.value.has(key)
}

/**
 * 切换某一项
 *
 * 手风琴模式下展开新的会自动收起其它的——这是它存在的意义，
 * 开启后 `modelValue` 里最多只有一个。
 * @param item 面板
 */
function toggle(item: SrCollapseItem): void {
  if (item.disabled) return

  let next: SrCollapseKey[]

  if (isOpen(item.key)) {
    next = props.modelValue.filter((key) => key !== item.key)
  } else {
    next = props.accordion ? [item.key] : [...props.modelValue, item.key]
  }

  emit('update:modelValue', next)
  emit('change', next, item.key)
}
</script>

<template>
  <div class="sr-collapse" :class="{ 'is-ghost': ghost, 'is-accordion': accordion }" role="presentation">
    <div
      v-for="item in items"
      :key="item.key"
      class="sr-collapse__item"
      :class="{ 'is-active': isOpen(item.key), 'is-disabled': item.disabled }"
    >
      <button
        class="sr-collapse__header"
        type="button"
        :disabled="item.disabled"
        :aria-expanded="isOpen(item.key)"
      >
        <span class="sr-collapse__arrow" @click.stop="toggle(item)">
          <SrIcon name="lucide:chevron-right" :size="14" />
        </span>

        <span class="sr-collapse__title" @click="toggle(item)">
          <slot name="title" :item="item" :open="isOpen(item.key)">{{ item.title }}</slot>
        </span>

        <span v-if="item.extra" class="sr-collapse__extra" @click="toggle(item)">{{ item.extra }}</span>
      </button>

      <div class="sr-collapse__content">
        <div class="sr-collapse__inner">
          <slot name="item" :item="item" :open="isOpen(item.key)">
            {{ item.content }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
