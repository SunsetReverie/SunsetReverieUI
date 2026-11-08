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
/** 预览缩放倍数 */
const previewScale = ref(1)
/** 预览平移量 */
const previewOffset = ref({ x: 0, y: 0 })
/** 拖动起点，用来区分「拖拽」与「点击关闭」 */
let dragStart: { x: number; y: number } | null = null
/** 本次按下是否发生了实际拖动 */
let dragged = false

/** 缩放范围 */
const MIN_SCALE = 1
const MAX_SCALE = 4
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
  previewScale.value = 1
  previewOffset.value = { x: 0, y: 0 }
  emit('preview-change', true)
}

/** 关闭预览 */
function closePreview(): void {
  if (!previewOpen.value) return
  previewOpen.value = false
  previewScale.value = 1
  previewOffset.value = { x: 0, y: 0 }
  emit('preview-change', false)
}

/**
 * 调整缩放，并夹到范围内
 * @param next 目标倍数
 * @param origin 缩放中心（视口坐标）
 */
function applyScale(next: number, origin?: { x: number; y: number }): void {
  const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next))
  if (clamped === 1) previewOffset.value = { x: 0, y: 0 }
  previewScale.value = clamped

  // 缩到 1 倍以外时保持中心，避免图跑出视口
  if (origin && clamped > 1) {
    const { x, y } = previewOffset.value
    previewOffset.value = {
      x: x - (origin.x - window.innerWidth / 2) * 0.08,
      y: y - (origin.y - window.innerHeight / 2) * 0.08,
    }
  }
}

/**
 * 滚轮缩放
 * @param event 滚轮事件
 */
function onWheel(event: WheelEvent): void {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.2 : 0.2
  applyScale(previewScale.value + delta, { x: event.clientX, y: event.clientY })
}

/**
 * 双击放大 / 还原
 */
function onDoubleClick(): void {
  applyScale(previewScale.value > 1 ? 1 : 2.5)
}

/**
 * 按下开始拖拽
 * @param event 指针事件
 */
function onPreviewPointerDown(event: PointerEvent): void {
  if (previewScale.value <= 1) return
  dragStart = { x: event.clientX - previewOffset.value.x, y: event.clientY - previewOffset.value.y }
  dragged = false
  document.addEventListener('pointermove', onPreviewPointerMove)
  document.addEventListener('pointerup', onPreviewPointerUp)
}

/**
 * 拖拽中
 * @param event 指针事件
 */
function onPreviewPointerMove(event: PointerEvent): void {
  if (!dragStart) return

  const x = event.clientX - dragStart.x
  const y = event.clientY - dragStart.y
  if (Math.abs(x - previewOffset.value.x) > 2 || Math.abs(y - previewOffset.value.y) > 2) dragged = true

  previewOffset.value = { x, y }
}

/**
 * 结束拖拽
 */
function onPreviewPointerUp(): void {
  dragStart = null
  document.removeEventListener('pointermove', onPreviewPointerMove)
  document.removeEventListener('pointerup', onPreviewPointerUp)
}

/**
 * 点遮罩：拖过就不算点击
 * @param event 鼠标事件
 */
function onOverlayClick(event: MouseEvent): void {
  // 点关闭按钮时由按钮自己处理
  if ((event.target as HTMLElement).closest('.sr-image-preview__close')) return
  if (dragged) {
    dragged = false
    return
  }
  closePreview()
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
  document.removeEventListener('pointermove', onPreviewPointerMove)
  document.removeEventListener('pointerup', onPreviewPointerUp)
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
      <div
        v-if="previewOpen"
        class="sr-image-preview"
        role="dialog"
        aria-modal="true"
        @click="onOverlayClick"
        @wheel.prevent="onWheel"
        @dblclick="onDoubleClick"
      >
        <img
          class="sr-image-preview__img"
          :class="{ 'is-zoomed': previewScale > 1 }"
          :src="src"
          :alt="alt"
          :style="{
            transform: `translate(${previewOffset.x}px, ${previewOffset.y}px) scale(${previewScale})`,
          }"
          @pointerdown.stop="onPreviewPointerDown"
        />

        <button
          class="sr-image-preview__close"
          type="button"
          aria-label="关闭预览"
          @click.stop="closePreview"
        >
          <SrIcon name="lucide:x" :size="20" />
        </button>

        <!-- 缩放比例：只在放大后出现 -->
        <span v-if="previewScale > 1" class="sr-image-preview__scale">
          {{ Math.round(previewScale * 100) }}%
        </span>

        <span v-if="alt" class="sr-image-preview__caption">{{ alt }}</span>

        <span class="sr-image-preview__tip">滚轮缩放 · 双击放大 · 拖动平移</span>
      </div>
    </Transition>
  </Teleport>
</template>
