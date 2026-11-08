<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { imageProps } from './image'

defineOptions({ name: 'SrImage', inheritAttrs: false })

const props = defineProps(imageProps)

const emit = defineEmits<{
  /** 加载完成 */
  load: [event: Event]
  /** 加载失败 */
  error: [event: Event]
  /** 预览开关 */
  'preview-change': [open: boolean]
}>()

/** 容器 */
const rootRef = ref<HTMLElement | null>(null)
/** 实际要请求的地址 */
const currentSrc = ref('')
/** 加载状态 */
const status = ref<'idle' | 'loading' | 'loaded' | 'error'>('idle')
/** 是否已进入视口 */
const inView = ref(false)
/** 预览是否打开 */
const previewOpen = ref(false)
/** 视口观察器 */
let observer: IntersectionObserver | null = null

/** 是否懒加载待触发 */
const waitingLazy = computed(() => props.lazy && !inView.value)

/** 尺寸样式：数字按像素，字符串原样 */
const sizeStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width !== undefined) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  if (props.height !== undefined) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  if (props.radius) {
    style.borderRadius = typeof props.radius === 'number' ? `${props.radius}px` : props.radius
  }
  return style
})

/**
 * 开始加载
 */
function startLoad(): void {
  if (!props.src) {
    status.value = 'error'
    return
  }

  currentSrc.value = props.src
  status.value = 'loading'
}

watch(
  () => props.src,
  () => {
    if (waitingLazy.value) return
    startLoad()
  },
  { immediate: true },
)

watch(inView, (value) => {
  if (value && status.value === 'idle') startLoad()
})

/**
 * 加载完成
 * @param event 事件
 */
function onLoad(event: Event): void {
  status.value = 'loaded'
  emit('load', event)
}

/**
 * 加载失败
 * @param event 事件
 */
function onError(event: Event): void {
  status.value = 'error'
  emit('error', event)
}

/** 打开预览 */
function openPreview(): void {
  if (!props.preview || status.value !== 'loaded') return
  previewOpen.value = true
  emit('preview-change', true)
}

/** 关闭预览 */
function closePreview(): void {
  if (!previewOpen.value) return
  previewOpen.value = false
  emit('preview-change', false)
}

/**
 * 键盘：Esc 关闭预览
 * @param event 键盘事件
 */
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && previewOpen.value) closePreview()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)

  // 非懒加载的首次请求已由 watch(immediate) 触发，这里只管观察器
  if (!props.lazy || !props.src) return

  // 没有 IntersectionObserver 就直接加载，别把图卡死
  if (typeof IntersectionObserver === 'undefined') {
    inView.value = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        inView.value = true
        observer?.disconnect()
        observer = null
      }
    },
    { rootMargin: '100px' },
  )

  if (rootRef.value) observer.observe(rootRef.value)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div
    ref="rootRef"
    class="sr-image"
    :class="[`sr-image--${status}`, { 'is-previewable': preview && status === 'loaded' }]"
    :style="sizeStyle"
    @click="openPreview"
  >
    <!-- 加载中：优先用占位图，没有就显示骨架色块 -->
    <img
      v-if="status === 'loading' && placeholder"
      class="sr-image__media sr-image__media--placeholder"
      :src="placeholder"
      alt=""
    />

    <img
      v-if="currentSrc && status !== 'error'"
      class="sr-image__media"
      :src="currentSrc"
      :alt="alt"
      :style="{ objectFit: fit }"
      @load="onLoad"
      @error="onError"
    />

    <!-- 失败：兜底图或占位提示 -->
    <img
      v-if="status === 'error' && fallback"
      class="sr-image__media sr-image__media--fallback"
      :src="fallback"
      :alt="alt"
    />

    <div v-if="status === 'error' && !fallback" class="sr-image__error">
      <SrIcon name="lucide:image-off" :size="20" />
      <span v-if="alt" class="sr-image__error-text">{{ alt }}</span>
    </div>

    <!-- 懒加载未触发时的占位 -->
    <div v-if="waitingLazy" class="sr-image__lazy">
      <SrIcon name="lucide:image" :size="18" />
    </div>

    <span v-if="preview && status === 'loaded'" class="sr-image__hint">
      <SrIcon name="lucide:maximize-2" :size="13" />
    </span>
  </div>

  <!-- 预览层 -->
  <Teleport to="body">
    <Transition name="sr-image-preview">
      <div v-if="previewOpen" class="sr-image-preview" role="dialog" aria-modal="true" @click="closePreview">
        <img class="sr-image-preview__img" :src="src" :alt="alt" />
        <button
          class="sr-image-preview__close"
          type="button"
          aria-label="关闭预览"
          @click.stop="closePreview"
        >
          <SrIcon name="lucide:x" :size="20" />
        </button>
        <span v-if="alt" class="sr-image-preview__caption">{{ alt }}</span>
      </div>
    </Transition>
  </Teleport>
</template>
