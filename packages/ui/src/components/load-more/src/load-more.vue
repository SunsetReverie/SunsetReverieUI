<script setup lang="ts">
import { computed, onMounted, onScopeDispose, ref, watch } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import type { SrSize } from '../../../types/config'
import SrSpinner from '../../spinner/src/spinner.vue'
import { loadMoreProps } from './load-more'

defineOptions({ name: 'SrLoadMore' })

const props = defineProps(loadMoreProps)

const emit = defineEmits<{
  /** 需要加载下一批 */
  load: []
}>()

const config = useSrConfig()

/** 最终尺寸 */
const resolvedSize = computed<SrSize>(() => props.size ?? config.value.size)

/** 根节点 */
const rootRef = ref<HTMLElement>()

/** 交叉观察器 */
let observer: IntersectionObserver | null = null

/** 当前是否满足自动加载条件 */
function shouldAutoLoad(): boolean {
  return props.auto && props.status === 'idle' && !props.disabled
}

/**
 * 找最近的可滚动祖先
 *
 * observer 默认以视口为 root，但组件常常被放在 maxHeight 造成的内部滚动容器里：
 * 此时容器可能整个都在视口之外，元素永远不会"进入视口"，自动加载就失效了。
 * 把 root 定位到那个滚动容器，语义才等价于"容器滚到底"。
 * @param el 起始元素
 * @returns 滚动容器，找不到返回 null（回退到视口）
 */
function findScrollParent(el: HTMLElement | null | undefined): HTMLElement | null {
  let node = el?.parentElement ?? null
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node)
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') return node
    node = node.parentElement
  }
  return null
}

onMounted(() => {
  if (!props.auto || typeof IntersectionObserver === 'undefined') return

  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      if (!shouldAutoLoad()) return
      emit('load')
    },
    { root: findScrollParent(rootRef.value), rootMargin: props.rootMargin },
  )

  if (rootRef.value) observer.observe(rootRef.value)
})

// 重新观察会立刻回调一次当前交叉状态，
// 这样「内容不够撑满容器」时也能连续加载，而不是卡在 idle 不动
watch(
  () => props.status,
  (value) => {
    if (value !== 'idle' || !observer || !rootRef.value) return
    observer.unobserve(rootRef.value)
    observer.observe(rootRef.value)
  },
)

onScopeDispose(() => {
  observer?.disconnect()
  observer = null
})

/** 点击加载 */
function onLoad(): void {
  if (props.disabled || props.status !== 'idle') return
  emit('load')
}
</script>

<template>
  <div
    ref="rootRef"
    class="sr-load-more"
    :class="[`sr-load-more--${status}`, `sr-load-more--${resolvedSize}`]"
    role="status"
  >
    <template v-if="status === 'loading'">
      <sr-spinner size="sm" />
      <span class="sr-load-more__text">{{ loadingText }}</span>
    </template>

    <template v-else-if="status === 'done'">
      <span class="sr-load-more__line" aria-hidden="true" />
      <span class="sr-load-more__text">{{ doneText }}</span>
      <span class="sr-load-more__line" aria-hidden="true" />
    </template>

    <button v-else class="sr-load-more__btn" type="button" :disabled="disabled" @click="onLoad">
      {{ loadText }}
    </button>
  </div>
</template>
