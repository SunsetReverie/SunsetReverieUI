<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import type { SrSize } from '../../../types/config'
import SrIcon from '../../icon/src/icon.vue'
import { tabsProps, type SrTabsItem } from './tabs'

defineOptions({ name: 'SrTabs' })

const props = defineProps(tabsProps)

const emit = defineEmits<{
  'update:modelValue': [key: string]
  /** 切换标签 */
  change: [key: string]
  /** 点击标签（禁用项不派发） */
  'tab-click': [key: string]
  /** 关闭标签 */
  close: [key: string]
}>()

const config = useSrConfig()

/** 最终尺寸 */
const resolvedSize = computed<SrSize>(() => props.size ?? config.value.size)

/** 内部激活 key：未绑定 v-model 时也能切换 */
const innerKey = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    innerKey.value = value
  },
)

// 外部没传值时，默认激活第一个可用标签
onMounted(() => {
  if (!innerKey.value) {
    const first = props.items.find((item) => !item.disabled)
    if (first) innerKey.value = first.key
  }
})

/** 已渲染过的 key 集合，用于懒加载 */
const activated = ref<Set<string>>(new Set())

watch(
  innerKey,
  (value) => {
    if (value) activated.value.add(value)
  },
  { immediate: true },
)

/**
 * 是否应渲染该面板
 * @param key 面板 key
 * @returns 是否渲染
 */
function shouldRender(key: string): boolean {
  return props.lazy ? activated.value.has(key) : true
}

/** 标签节点引用，用于激活时滚入视野 */
const tabRefs = ref<Record<string, HTMLElement>>({})

/**
 * 收集标签节点
 * @param el 节点
 * @param key 标签 key
 */
function setTabRef(el: unknown, key: string): void {
  if (el instanceof HTMLElement) tabRefs.value[key] = el
}

/**
 * 切换标签
 * @param item 目标标签
 */
function activate(item: SrTabsItem): void {
  if (item.disabled) return

  emit('tab-click', item.key)
  if (item.key === innerKey.value) return

  innerKey.value = item.key
  emit('update:modelValue', item.key)
  emit('change', item.key)
}

/**
 * 键盘左右切换
 * @param event 键盘事件
 * @param index 当前下标
 */
function onKeydown(event: KeyboardEvent, index: number): void {
  const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
  if (!step) return

  event.preventDefault()
  const total = props.items.length
  for (let offset = 1; offset <= total; offset += 1) {
    const next = props.items[(index + step * offset + total * offset) % total]
    if (next && !next.disabled) {
      activate(next)
      void nextTick(() => tabRefs.value[next.key]?.focus())
      return
    }
  }
}

/**
 * 关闭标签
 * @param event 鼠标事件
 * @param item 标签
 */
function onClose(event: MouseEvent, item: SrTabsItem): void {
  event.stopPropagation()
  emit('close', item.key)
}

/**
 * 是否可关闭
 * @param item 标签
 * @returns 是否显示关闭按钮
 */
function isClosable(item: SrTabsItem): boolean {
  return item.closable ?? props.closable
}
</script>

<template>
  <div
    class="sr-tabs"
    :class="[
      `sr-tabs--${resolvedSize}`,
      `sr-tabs--${type}`,
      { 'is-vertical': direction === 'vertical', 'is-plain': !bordered },
    ]"
  >
    <div class="sr-tabs__nav" role="tablist">
      <button
        v-for="(item, index) in items"
        :key="item.key"
        :ref="(el) => setTabRef(el, item.key)"
        class="sr-tabs__tab"
        :class="{ 'is-active': item.key === innerKey, 'is-disabled': item.disabled }"
        type="button"
        role="tab"
        :aria-selected="item.key === innerKey"
        :aria-disabled="item.disabled || undefined"
        :tabindex="item.key === innerKey ? 0 : -1"
        @click="activate(item)"
        @keydown="onKeydown($event, index)"
      >
        <sr-icon v-if="item.icon" class="sr-tabs__icon" :name="item.icon" :size="15" />
        <span class="sr-tabs__label">{{ item.label }}</span>

        <span
          v-if="isClosable(item)"
          class="sr-tabs__close"
          role="button"
          aria-label="关闭标签"
          tabindex="-1"
          @click="onClose($event, item)"
        >
          <sr-icon name="lucide:x" :size="12" />
        </span>
      </button>
    </div>

    <div class="sr-tabs__content">
      <div
        v-for="item in items"
        v-show="item.key === innerKey"
        :key="item.key"
        class="sr-tabs__panel"
        role="tabpanel"
        :aria-hidden="item.key !== innerKey"
      >
        <slot v-if="shouldRender(item.key)" :name="`panel-${item.key}`" :item="item">
          <slot name="panel" :item="item" />
        </slot>
      </div>
    </div>
  </div>
</template>
