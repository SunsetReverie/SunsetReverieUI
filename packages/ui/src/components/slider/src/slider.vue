<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import { sliderProps, type SrSliderValue } from './slider'

defineOptions({ name: 'SrSlider', inheritAttrs: false })

const props = defineProps(sliderProps)

const emit = defineEmits<{
  /** 值变化（拖动过程中持续触发） */
  'update:modelValue': [value: SrSliderValue]
  /** 拖动结束 */
  change: [value: SrSliderValue]
}>()

const config = useSrConfig()

/** 轨道元素 */
const trackRef = ref<HTMLElement | null>(null)

/** 正在拖动的滑块下标（区间模式下 0 是左、1 是右） */
const activeIndex = ref<number | null>(null)

/** 尺寸：自身 > 全局配置 */
const resolvedSize = computed(() => props.size ?? config.value.size)

/** 区间模式下的两个值 */
const pair = computed<[number, number]>(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue
  return [props.min, Number(props.modelValue)]
})

/** 单值模式下的值 */
const single = computed(() =>
  Array.isArray(props.modelValue) ? props.modelValue[1] : Number(props.modelValue),
)

/** 值域跨度 */
const span = computed(() => props.max - props.min || 1)

/**
 * 数值转百分比位置
 * @param value 数值
 * @returns 百分比（0~100）
 */
function toPercent(value: number): number {
  return Math.min(100, Math.max(0, ((value - props.min) / span.value) * 100))
}

/**
 * 把任意数值吸附到合法值
 * @param value 原始数值
 * @returns 对齐 step 后的值
 */
function normalize(value: number): number {
  const clamped = Math.min(props.max, Math.max(props.min, value))
  if (!props.step || props.step <= 0) return clamped

  const steps = Math.round((clamped - props.min) / props.step)
  return Math.min(props.max, props.min + steps * props.step)
}

/**
 * 数值的显示文案
 * @param value 数值
 * @returns 文案
 */
function display(value: number): string {
  if (props.formatTooltip) return props.formatTooltip(value)
  // 步长是小数时保留一位，避免出现 12.000000000000002
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

/**
 * 根据指针位置算出数值
 * @param event 指针事件
 * @returns 数值
 */
function valueFromEvent(event: PointerEvent): number {
  const el = trackRef.value
  if (!el) return props.min

  const rect = el.getBoundingClientRect()
  const ratio = props.vertical
    ? 1 - (event.clientY - rect.top) / (rect.height || 1)
    : (event.clientX - rect.left) / (rect.width || 1)

  return normalize(props.min + Math.min(1, Math.max(0, ratio)) * span.value)
}

/**
 * 写回新值
 * @param index 滑块下标
 * @param value 数值
 */
function apply(index: number, value: number): void {
  if (!props.range) {
    emit('update:modelValue', value)
    return
  }

  const next: [number, number] = [...pair.value]
  next[index] = value
  // 区间两端不允许交叉：拖左滑块超过右侧时，把它顶到右侧的位置
  if (next[0] > next[1]) next[index === 0 ? 0 : 1] = next[index === 0 ? 1 : 0]
  emit('update:modelValue', next)
}

/**
 * 开始拖动
 * @param index 滑块下标
 * @param event 指针事件
 */
function onPointerDown(index: number, event: PointerEvent): void {
  if (props.disabled) return

  activeIndex.value = index
  event.preventDefault()

  document.addEventListener('pointermove', onPointerMove, true)
  document.addEventListener('pointerup', onPointerUp, true)
  document.addEventListener('pointercancel', onPointerUp, true)
}

/**
 * 拖动中
 * @param event 指针事件
 */
function onPointerMove(event: PointerEvent): void {
  if (activeIndex.value === null) return
  apply(activeIndex.value, valueFromEvent(event))
}

/** 结束拖动 */
function onPointerUp(): void {
  if (activeIndex.value === null) return

  activeIndex.value = null
  document.removeEventListener('pointermove', onPointerMove, true)
  document.removeEventListener('pointerup', onPointerUp, true)
  document.removeEventListener('pointercancel', onPointerUp, true)

  emit('change', props.modelValue)
}

/**
 * 键盘调整
 * @param index 滑块下标
 * @param event 键盘事件
 */
function onKeydown(index: number, event: KeyboardEvent): void {
  if (props.disabled) return

  const current = props.range ? pair.value[index] : single.value
  const step = props.step || 1

  const map: Record<string, number> = {
    ArrowRight: step,
    ArrowUp: step,
    ArrowLeft: -step,
    ArrowDown: -step,
  }

  let next = current

  if (event.key in map) next = normalize(current + (map[event.key] ?? 0))
  else if (event.key === 'Home') next = props.min
  else if (event.key === 'End') next = props.max
  else return

  event.preventDefault()
  apply(index, next)
  emit('change', props.modelValue)
}

/** 间断点位置 */
const stops = computed(() => {
  if (!props.showStops || !props.step || props.step <= 0) return []
  const count = Math.floor(span.value / props.step)
  if (count > 60) return []

  return Array.from({ length: Math.max(0, count - 1) }, (_, index) =>
    toPercent(props.min + (index + 1) * props.step),
  )
})

onBeforeUnmount(() => {
  document.removeEventListener('pointermove', onPointerMove, true)
  document.removeEventListener('pointerup', onPointerUp, true)
  document.removeEventListener('pointercancel', onPointerUp, true)
})
</script>

<template>
  <div
    class="sr-slider"
    :class="[
      {
        'is-disabled': disabled,
        'is-vertical': vertical,
        'is-dragging': activeIndex !== null,
      },
      resolvedSize ? `sr-slider--${resolvedSize}` : '',
    ]"
  >
    <div ref="trackRef" class="sr-slider__track">
      <!-- 已选段 -->
      <div
        v-if="range"
        class="sr-slider__fill"
        :style="
          vertical
            ? { height: `${toPercent(pair[1]) - toPercent(pair[0])}%`, bottom: `${toPercent(pair[0])}%` }
            : { left: `${toPercent(pair[0])}%`, width: `${toPercent(pair[1]) - toPercent(pair[0])}%` }
        "
      />
      <div
        v-else
        class="sr-slider__fill"
        :style="vertical ? { height: `${toPercent(single)}%` } : { width: `${toPercent(single)}%` }"
      />

      <!-- 间断点 -->
      <span
        v-for="(pos, index) in stops"
        :key="index"
        class="sr-slider__stop"
        :style="vertical ? { bottom: `${pos}%` } : { left: `${pos}%` }"
      />

      <!-- 滑块 -->
      <button
        v-for="index in range ? [0, 1] : [0]"
        :key="index"
        class="sr-slider__handle"
        :class="{ 'is-active': activeIndex === index }"
        type="button"
        role="slider"
        :disabled="disabled"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="range ? pair[index] : single"
        :style="
          vertical
            ? { bottom: `${toPercent(range ? pair[index]! : single)}%` }
            : { left: `${toPercent(range ? pair[index]! : single)}%` }
        "
        @pointerdown="onPointerDown(index - 1, $event)"
        @keydown="onKeydown(index - 1, $event)"
      >
        <span v-if="showTooltip && activeIndex === index - 1" class="sr-slider__tooltip">
          {{ display(range ? pair[index - 1]! : single) }}
        </span>
      </button>
    </div>
  </div>
</template>
