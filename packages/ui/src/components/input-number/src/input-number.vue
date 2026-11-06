<script setup lang="ts">
import { computed, inject, ref, useAttrs, watch } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import { SR_FORM_ITEM_KEY } from '../../form/src/form'
import type { SrSize } from '../../../types/config'
import type { SrResponsive } from '../../../types/theme'
import { srOmit } from '../../../utils/attrs'
import SrIcon from '../../icon/src/icon.vue'
import { INPUT_SIZE_MAP } from '../../input/src/input'
import { inputNumberProps, srClampNumber, srNumberPrecision } from './input-number'

defineOptions({ name: 'SrInputNumber', inheritAttrs: false })

const props = defineProps(inputNumberProps)

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  change: [value: number | null]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  /** 步进按钮或方向键触发，type 表示方向 */
  step: [value: number | null, type: 'increase' | 'decrease']
}>()

const attrs = useAttrs()
const config = useSrConfig()
const formItem = inject(SR_FORM_ITEM_KEY, null)

/** 小数位：显式 precision 优先，否则从 step 推导 */
const resolvedPrecision = computed(() => props.precision ?? srNumberPrecision(Math.abs(props.step) || 1))

const inputRef = ref<HTMLInputElement | null>(null)
/** 编辑中的原始文本：允许 "-"、"1." 这类中间态，不被格式化打断 */
const inputText = ref(format(props.modelValue))
const isFocused = ref(false)

/** 最终尺寸 */
const resolvedSize = computed<SrResponsive<SrSize>>(() => props.size ?? config.value.size)

/** 尺寸变量：与 SrInput 共用同名变量，因此直接复用 .sr-input 的尺寸规则 */
const sizeVars = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {}

  /**
   * 写入一组尺寸变量
   * @param suffix 断点后缀，空表示基础值
   * @param size 尺寸档位
   */
  const write = (suffix: string, size: SrSize): void => {
    const metrics = INPUT_SIZE_MAP[size]
    if (!metrics) return
    const tail = suffix ? `-${suffix}` : ''
    out[`--sr-input-height${tail}`] = `${metrics.height}px`
    out[`--sr-input-padding-x${tail}`] = `${metrics.paddingX}px`
    out[`--sr-input-font-size${tail}`] = `${metrics.fontSize}px`
  }

  const size = resolvedSize.value
  if (typeof size === 'string') {
    write('', size)
    return out
  }
  for (const [bp, value] of Object.entries(size)) {
    if (value) write(bp, value as SrSize)
  }
  return out
})

/** 实际校验态：自身显式指定优先，否则跟随表单项 */
const resolvedStatus = computed(() =>
  props.status !== 'default' ? props.status : (formItem?.status.value ?? 'default'),
)

/** 当前有效数值，空值返回 null */
const currentValue = computed<number | null>(() =>
  typeof props.modelValue === 'number' && Number.isFinite(props.modelValue) ? props.modelValue : null,
)

/** 是否显示步进按钮 */
const showControls = computed(() => props.controls && !props.disabled)
/** 是否可继续增加 / 减小 */
const canIncrease = computed(() => currentValue.value === null || currentValue.value < props.max)
const canDecrease = computed(() => currentValue.value === null || currentValue.value > props.min)

const rootClass = computed(() => [
  `sr-input--${resolvedStatus.value}`,
  {
    'is-disabled': props.disabled,
    'is-readonly': props.readonly,
    'sr-input-number--both': props.controlsPosition === 'both',
  },
  attrs.class,
])

const rootStyle = computed(() => ({
  ...sizeVars.value,
  ...(attrs.style as Record<string, string>),
}))

/** 落到原生 input 的属性 */
const inputAttrs = computed(() => srOmit(attrs as Record<string, unknown>, ['class', 'style']))

/**
 * 按精度格式化展示文本
 * @param value 数值或空值
 * @returns 展示文本
 */
function format(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return ''
  return value.toFixed(resolvedPrecision.value)
}

/**
 * 提交一个新值并派发事件
 * @param value 新值
 * @param type 若为步进操作则带上方向
 */
function commit(value: number | null, type?: 'increase' | 'decrease'): void {
  inputText.value = format(value)
  if (value !== currentValue.value) {
    emit('update:modelValue', value)
    emit('change', value)
    formItem?.notify('change')
  }
  if (type) emit('step', value, type)
}

/**
 * 步进
 * @param direction 1 增加 / -1 减小
 */
function stepBy(direction: 1 | -1): void {
  if (props.disabled || props.readonly) return
  const type = direction === 1 ? 'increase' : 'decrease'
  if (direction === 1 && !canIncrease.value) return
  if (direction === -1 && !canDecrease.value) return

  const base = currentValue.value ?? 0
  const next = srClampNumber(base + direction * props.step, props.min, props.max, resolvedPrecision.value)
  commit(next, type)
  void inputRef.value?.focus()
}

/** 输入回调：中间态只保留文本，合法数字才派发 */
function onInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value
  inputText.value = raw

  if (raw.trim() === '') {
    emit('update:modelValue', null)
    emit('change', null)
    formItem?.notify('change')
    return
  }

  const value = Number(raw)
  if (!Number.isFinite(value)) return
  if (value !== currentValue.value) {
    emit('update:modelValue', value)
    emit('change', value)
    formItem?.notify('change')
  }
}

/** 键盘：上下方向键步进，Enter 立即规范化 */
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    stepBy(1)
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    stepBy(-1)
  } else if (event.key === 'Enter') {
    normalize()
  }
}

/** 失焦时把文本钳制到边界并补齐精度 */
function normalize(): void {
  const raw = inputText.value.trim()
  if (raw === '') {
    commit(null)
    return
  }
  const value = Number(raw)
  if (!Number.isFinite(value)) {
    inputText.value = format(currentValue.value)
    return
  }
  commit(srClampNumber(value, props.min, props.max, resolvedPrecision.value))
}

/** 聚焦 */
function onFocus(event: FocusEvent): void {
  isFocused.value = true
  emit('focus', event)
}

/** 失焦 */
function onBlur(event: FocusEvent): void {
  isFocused.value = false
  normalize()
  emit('blur', event)
  formItem?.notify('blur')
}

// 聚焦编辑时不回写 props，否则 "1." 这类中间态会被格式化打断
watch(
  () => props.modelValue,
  () => {
    if (!isFocused.value) inputText.value = format(currentValue.value)
  },
)
</script>

<template>
  <div class="sr-input sr-input-number" :class="rootClass" :style="rootStyle">
    <button
      v-if="showControls && controlsPosition === 'both'"
      class="sr-input-number__btn sr-input-number__btn--side"
      type="button"
      tabindex="-1"
      :disabled="!canDecrease || disabled || readonly"
      aria-label="减少"
      @mousedown.prevent
      @click="stepBy(-1)"
    >
      <sr-icon name="lucide:minus" />
    </button>

    <input
      ref="inputRef"
      class="sr-input__inner"
      type="text"
      inputmode="decimal"
      autocomplete="off"
      :value="inputText"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :aria-valuemin="Number.isFinite(min) ? min : undefined"
      :aria-valuemax="Number.isFinite(max) ? max : undefined"
      :aria-valuenow="currentValue ?? undefined"
      :aria-invalid="resolvedStatus === 'error' ? 'true' : undefined"
      :aria-describedby="resolvedStatus === 'error' ? formItem?.messageId : undefined"
      :aria-labelledby="formItem?.labelId"
      v-bind="inputAttrs"
      @input="onInput"
      @keydown="onKeydown"
      @focus="onFocus"
      @blur="onBlur"
    />

    <span v-if="showControls && controlsPosition === 'right'" class="sr-input-number__controls">
      <button
        class="sr-input-number__btn sr-input-number__btn--up"
        type="button"
        tabindex="-1"
        :disabled="!canIncrease || disabled || readonly"
        aria-label="增加"
        @mousedown.prevent
        @click="stepBy(1)"
      >
        <sr-icon name="lucide:chevron-up" />
      </button>
      <button
        class="sr-input-number__btn sr-input-number__btn--down"
        type="button"
        tabindex="-1"
        :disabled="!canDecrease || disabled || readonly"
        aria-label="减少"
        @mousedown.prevent
        @click="stepBy(-1)"
      >
        <sr-icon name="lucide:chevron-down" />
      </button>
    </span>

    <button
      v-if="showControls && controlsPosition === 'both'"
      class="sr-input-number__btn sr-input-number__btn--side"
      type="button"
      tabindex="-1"
      :disabled="!canIncrease || disabled || readonly"
      aria-label="增加"
      @mousedown.prevent
      @click="stepBy(1)"
    >
      <sr-icon name="lucide:plus" />
    </button>
  </div>
</template>
