<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useSlots, watch } from 'vue'

import SrSpinner from '../../spinner/src/spinner.vue'
import { loadingProps } from './loading'

defineOptions({ name: 'SrLoading', inheritAttrs: false })

const props = defineProps(loadingProps)

const slots = useSlots()

/** 是否真的有内容要包 */
const hasSlot = computed(() => Boolean(slots.default))

/** 延迟后是否该显示 */
const visible = ref(props.loading && props.delay === 0)

/** 延迟定时器 */
let timer: ReturnType<typeof setTimeout> | null = null

/**
 * 清理定时器
 */
function clearTimer(): void {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

watch(
  () => [props.loading, props.delay] as const,
  ([loading, delay]) => {
    clearTimer()

    // 关掉立即生效，不要等延迟
    if (!loading) {
      visible.value = false
      return
    }

    if (delay <= 0) {
      visible.value = true
      return
    }

    visible.value = false
    timer = setTimeout(() => {
      visible.value = props.loading
      timer = null
    }, delay)
  },
  { immediate: true },
)

onBeforeUnmount(clearTimer)

/** 全屏时锁滚动 */
watch(
  () => props.fullscreen && visible.value,
  (locked) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = locked ? 'hidden' : ''
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined' && props.fullscreen) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <div
    v-if="hasSlot"
    class="sr-loading sr-loading--wrapper"
    :class="[{ 'is-loading': visible }, size ? `sr-loading--${size}` : '']"
  >
    <slot />

    <Transition name="sr-loading-fade">
      <div v-if="visible" class="sr-loading__overlay" :class="{ 'is-mask': mask }">
        <div class="sr-loading__body">
          <SrSpinner :size="size ?? 'md'" :variant="variant" :colors="colors" />
          <span v-if="text || $slots.text" class="sr-loading__text">
            <slot name="text">{{ text }}</slot>
          </span>
        </div>
      </div>
    </Transition>
  </div>

  <Teleport v-else-if="fullscreen" to="body">
    <Transition name="sr-loading-fade">
      <div v-if="visible" class="sr-loading sr-loading--fullscreen" :class="{ 'is-mask': mask }">
        <div class="sr-loading__body">
          <SrSpinner :size="size ?? 'lg'" :variant="variant" :colors="colors" />
          <span v-if="text || $slots.text" class="sr-loading__text">
            <slot name="text">{{ text }}</slot>
          </span>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Transition v-else name="sr-loading-fade">
    <div v-if="visible" class="sr-loading sr-loading--inline" :class="{ 'is-mask': mask }">
      <div class="sr-loading__body">
        <SrSpinner :size="size ?? 'md'" :variant="variant" :colors="colors" />
        <span v-if="text || $slots.text" class="sr-loading__text">
          <slot name="text">{{ text }}</slot>
        </span>
      </div>
    </div>
  </Transition>
</template>
