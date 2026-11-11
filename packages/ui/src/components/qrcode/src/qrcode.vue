<script setup lang="ts">
import { computed, watch } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import { encodeQr } from './encoder'
import { qrcodeProps } from './qrcode'

defineOptions({ name: 'SrQrcode', inheritAttrs: false })

const props = defineProps(qrcodeProps)

const emit = defineEmits<{
  /** 内容超出容量、无法编码 */
  error: [reason: string]
}>()

/** 编码结果 */
const matrix = computed(() => {
  if (props.status === 'loading' || !props.value) return null
  return encodeQr(props.value, props.level)
})

// 容量不足时通知外部。放在 watch 里而不是 computed 内：
// computed 可能被多次求值，直接 emit 会重复派发。
watch(
  () => [props.value, props.level, props.status] as const,
  () => {
    if (!props.value || props.status === 'loading') return
    if (!matrix.value) emit('error', '内容超出可编码容量')
  },
  { immediate: true },
)

/**
 * 码点路径
 *
 * 把所有黑模块拼成一条 path，比逐个 <rect> 少几百个节点，
 * 渲染和缩放都快。
 */
const paths = computed(() => {
  const data = matrix.value
  if (!data) return []

  const lines: string[] = []

  data.modules.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) lines.push(`M${x} ${y}h1v1h-1z`)
    })
  })

  return lines
})

/** SVG 的 viewBox 尺寸（含静区） */
const viewSize = computed(() => {
  const modules = matrix.value?.modules.length ?? 21
  return modules + props.margin * 2
})

/** 是否显示图标 */
const showIcon = computed(() => Boolean(props.icon) && Boolean(matrix.value))

/** 二维码是否可用 */
const isActive = computed(() => Boolean(matrix.value))

/** 无障碍描述 */
const ariaLabel = computed(() => (props.status === 'expired' ? props.expiredText : `二维码：${props.value}`))
</script>

<template>
  <div
    class="sr-qrcode"
    :class="[`sr-qrcode--${status}`, { 'is-empty': !isActive }]"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="img"
    :aria-label="ariaLabel"
  >
    <svg
      v-if="isActive"
      class="sr-qrcode__svg"
      :viewBox="`0 0 ${viewSize} ${viewSize}`"
      :width="size"
      :height="size"
      shape-rendering="crispEdges"
    >
      <rect width="100%" height="100%" :fill="backgroundColor" />
      <g :transform="`translate(${margin} ${margin})`">
        <path :d="paths.join('')" :fill="color" />
      </g>
    </svg>

    <!-- 加载占位 -->
    <div v-if="status === 'loading'" class="sr-qrcode__placeholder">
      <SrIcon name="lucide:loader-circle" :size="22" spin />
    </div>

    <!-- 中心图标 -->
    <div
      v-if="showIcon"
      class="sr-qrcode__icon"
      :style="{
        width: `${iconSize}px`,
        height: `${iconSize}px`,
      }"
    >
      <SrIcon :name="icon" :size="Math.round(iconSize * 0.66)" />
    </div>

    <!-- 失效遮罩 -->
    <div v-if="status === 'expired'" class="sr-qrcode__mask">
      <span class="sr-qrcode__badge">{{ expiredText }}</span>
    </div>
  </div>
</template>
