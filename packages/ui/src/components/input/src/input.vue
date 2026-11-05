<script setup lang="ts">
import { computed, inject, nextTick, ref, useAttrs, useSlots, watch } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import { SR_FORM_ITEM_KEY } from '../../form/src/form'
import type { SrSize } from '../../../types/config'
import type { SrResponsive } from '../../../types/theme'
import { srOmit } from '../../../utils/attrs'
import SrIcon from '../../icon/src/icon.vue'
import { INPUT_SIZE_MAP, inputProps } from './input'

defineOptions({ name: 'SrInput', inheritAttrs: false })

const props = defineProps(inputProps)

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  clear: []
  enter: [event: KeyboardEvent]
}>()

const attrs = useAttrs()
const slots = useSlots()
const config = useSrConfig()
// 表单内使用时由 SrFormItem 提供校验态，自身 status 优先级更高
const formItem = inject(SR_FORM_ITEM_KEY, null)

/** 原生输入元素 */
const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)
/** 密码是否明文显示 */
const passwordVisible = ref(false)
/** 输入法组合中：组合期间不派发 change，避免中文输入被逐字截断 */
const composing = ref(false)

/** 最终尺寸 */
const resolvedSize = computed<SrResponsive<SrSize>>(() => props.size ?? config.value.size)

/**
 * 尺寸变量
 * @returns 内联样式变量表
 */
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

/** 是否 textarea 分支 */
const isTextarea = computed(() => props.type === 'textarea')

/** 真实 type：密码可见时降级为 text */
const actualType = computed(() => {
  if (props.type !== 'password') return props.type
  return passwordVisible.value ? 'text' : 'password'
})

/** 当前值的字符串形式 */
const stringValue = computed(() => (props.modelValue === undefined ? '' : String(props.modelValue)))

/** 是否有值 */
const hasValue = computed(() => stringValue.value.length > 0)

/** 是否显示清空按钮 */
const showClear = computed(() => props.clearable && hasValue.value && !props.disabled && !props.readonly)

/** 是否显示密码切换按钮 */
const showPasswordToggle = computed(() => props.type === 'password' && props.showPassword && !props.disabled)

/** 字数统计文本 */
const countText = computed(() => {
  const length = stringValue.value.length
  return props.maxlength ? `${length} / ${props.maxlength}` : `${length}`
})

/**
 * 根 class
 * @returns class 列表
 */
const rootClass = computed(() => [
  `sr-input--${resolvedStatus.value}`,
  {
    'is-disabled': props.disabled,
    'is-readonly': props.readonly,
    'is-textarea': isTextarea.value,
    'has-prefix': Boolean(slots.prefix),
    'has-suffix': Boolean(slots.suffix),
    'has-count': props.showCount,
  },
  attrs.class,
])

/** 根样式：尺寸变量 + 外部 style */
const rootStyle = computed(() => ({
  ...sizeVars.value,
  ...(attrs.style as Record<string, string>),
}))

/**
 * 落到原生 input 的属性
 * class / style 归 wrapper，其余（autocomplete / maxlength / data-*）直达 input
 */
const inputAttrs = computed(() => srOmit(attrs as Record<string, unknown>, ['class', 'style']))

/**
 * 输入回调
 * @param event 输入事件
 */
function onInput(event: Event): void {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  const numeric = typeof props.modelValue === 'number'
  const value = numeric ? Number(target.value) || 0 : target.value

  emit('update:modelValue', value)
  if (!composing.value) {
    emit('change', value)
    formItem?.notify('change')
  }
  if (props.autosize && isTextarea.value) resizeTextarea()
}

/** 中文输入开始 */
function onCompositionStart(): void {
  composing.value = true
}

/**
 * 中文输入结束：此时才认为一次输入完成
 * @param event 组合事件
 */
function onCompositionEnd(event: CompositionEvent): void {
  composing.value = false
  const target = event.target as HTMLInputElement
  emit('change', typeof props.modelValue === 'number' ? Number(target.value) || 0 : target.value)
}

/**
 * 键盘事件：单行输入框的 Enter 单独派发
 * @param event 键盘事件
 */
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !isTextarea.value) emit('enter', event)
}

/**
 * 失焦：派发事件并通知表单项校验
 * @param event 焦点事件
 */
function onBlur(event: FocusEvent): void {
  emit('blur', event)
  formItem?.notify('blur')
}

/** 清空 */
function onClear(): void {
  emit('update:modelValue', '')
  emit('change', '')
  emit('clear')
  void nextTick(() => inputRef.value?.focus())
}

/** 切换密码可见，并保持光标位置 */
function togglePassword(): void {
  passwordVisible.value = !passwordVisible.value
  void nextTick(() => {
    const element = inputRef.value
    if (!element) return
    const end = element.value.length
    element.setSelectionRange(end, end)
    element.focus()
  })
}

/** textarea 高度自适应 */
function resizeTextarea(): void {
  const element = inputRef.value
  if (!element || element.tagName !== 'TEXTAREA') return
  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight}px`
}

watch(
  () => props.modelValue,
  () => {
    if (props.autosize && isTextarea.value) void nextTick(resizeTextarea)
  },
)
</script>

<template>
  <div class="sr-input" :class="rootClass" :style="rootStyle">
    <span v-if="slots.prefix" class="sr-input__prefix">
      <slot name="prefix" />
    </span>

    <textarea
      v-if="isTextarea"
      ref="inputRef"
      class="sr-input__inner sr-input__inner--textarea"
      :value="stringValue"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :aria-invalid="resolvedStatus === 'error' ? 'true' : undefined"
      :aria-describedby="resolvedStatus === 'error' ? formItem?.messageId : undefined"
      :aria-labelledby="formItem?.labelId"
      v-bind="inputAttrs"
      @input="onInput"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
      @keydown="onKeydown"
      @focus="emit('focus', $event)"
      @blur="onBlur($event)"
    />

    <input
      v-else
      ref="inputRef"
      class="sr-input__inner"
      :type="actualType"
      :value="stringValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :aria-invalid="resolvedStatus === 'error' ? 'true' : undefined"
      :aria-describedby="resolvedStatus === 'error' ? formItem?.messageId : undefined"
      :aria-labelledby="formItem?.labelId"
      v-bind="inputAttrs"
      @input="onInput"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
      @keydown="onKeydown"
      @focus="emit('focus', $event)"
      @blur="onBlur($event)"
    />

    <span v-if="showCount" class="sr-input__count">{{ countText }}</span>

    <button
      v-if="showClear"
      class="sr-input__action"
      type="button"
      tabindex="-1"
      aria-label="清空"
      @mousedown.prevent
      @click="onClear"
    >
      <sr-icon name="mdi:close" />
    </button>

    <button
      v-if="showPasswordToggle"
      class="sr-input__action"
      type="button"
      tabindex="-1"
      :aria-label="passwordVisible ? '隐藏密码' : '显示密码'"
      @mousedown.prevent
      @click="togglePassword"
    >
      <sr-icon :name="passwordVisible ? 'mdi:eye-off' : 'mdi:eye'" />
    </button>

    <span v-if="slots.suffix" class="sr-input__suffix">
      <slot name="suffix" />
    </span>
  </div>
</template>
