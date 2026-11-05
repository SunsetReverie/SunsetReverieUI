<script setup lang="ts">
import { computed, inject, onScopeDispose, provide, ref, useAttrs, useId } from 'vue'

import {
  SR_FORM_ITEM_KEY,
  SR_FORM_KEY,
  formItemProps,
  type SrFormError,
  type SrFormRule,
  type SrFormTrigger,
} from './form'

defineOptions({ name: 'SrFormItem', inheritAttrs: false })

const props = defineProps(formItemProps)

const attrs = useAttrs()
const form = inject(SR_FORM_KEY, null)

/** 唯一 id，用于串联 label / error / 控件 */
const uid = useId()
const labelId = `sr-form-label-${uid}`
const messageId = `sr-form-message-${uid}`

/** 当前错误文案 */
const errorMessage = ref<SrFormError>('')

/** 规则归一化为数组 */
const rules = computed<SrFormRule[]>(() => {
  const own = props.rules ?? (props.prop ? form?.rules.value[props.prop] : undefined)
  if (!own) return []
  return Array.isArray(own) ? own : [own]
})

/** 是否必填 */
const isRequired = computed(() => props.required || rules.value.some((rule) => rule.required === true))

/** 最终展示的错误（手动 error 优先） */
const currentError = computed(() => props.error || errorMessage.value)

/** 校验态 */
const status = computed<'default' | 'error' | 'warning' | 'success'>(() =>
  currentError.value ? 'error' : 'default',
)

/** 是否显示错误文案 */
const showMessage = computed(() => Boolean(currentError.value) && (form?.showMessage.value ?? true))

/** 标签宽度 */
const labelWidth = computed(() => {
  const width = props.labelWidth ?? form?.labelWidth.value ?? '88px'
  return typeof width === 'number' ? `${width}px` : width
})

/**
 * 单条规则的执行
 * @param rule 规则
 * @returns 错误文案，通过时为空字符串
 */
async function runRule(rule: SrFormRule): Promise<SrFormError> {
  const model = form?.model ?? {}
  const value = props.prop ? model[props.prop] : undefined

  // 必填优先：为空时不再跑后续规则，避免「请输入」和「格式不对」同时出现
  const isEmpty =
    value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)

  if (rule.required && isEmpty) {
    return rule.message ?? `请输入${props.label || '该项'}`
  }

  if (isEmpty) return ''

  if (rule.min !== undefined || rule.max !== undefined) {
    const length = typeof value === 'number' ? value : (value as { length?: number })?.length
    if (typeof length === 'number') {
      if (rule.min !== undefined && length < rule.min) {
        return rule.message ?? `不能少于 ${rule.min}`
      }
      if (rule.max !== undefined && length > rule.max) {
        return rule.message ?? `不能超过 ${rule.max}`
      }
    }
  }

  if (rule.pattern && !rule.pattern.test(String(value))) {
    return rule.message ?? '格式不正确'
  }

  if (rule.validator) {
    const result = await rule.validator(value, model)
    if (result === false) return rule.message ?? '校验未通过'
    if (typeof result === 'string') return result
  }

  return ''
}

/**
 * 执行校验
 * @param trigger 触发时机；manual 表示不区分规则时机
 * @returns 错误文案
 */
async function validate(trigger: SrFormTrigger | 'manual' = 'manual'): Promise<SrFormError> {
  // 错误态下任何交互都重新校验全部规则，让用户边改边看到结果变绿
  const isRecovering = errorMessage.value !== ''
  const list =
    trigger === 'manual' || isRecovering
      ? rules.value
      : rules.value.filter((rule) => (rule.trigger ?? 'blur') === trigger)

  if (list.length === 0) {
    errorMessage.value = ''
    return ''
  }

  for (const rule of list) {
    const message = await runRule(rule)
    if (message) {
      errorMessage.value = message
      return message
    }
  }

  errorMessage.value = ''
  return ''
}

/**
 * 收到子组件的交互通知
 * @param trigger 触发时机
 */
function notify(trigger: SrFormTrigger): void {
  void validate(trigger)
}

/** 清空错误 */
function clear(): void {
  errorMessage.value = ''
}

provide(SR_FORM_ITEM_KEY, {
  status,
  messageId,
  labelId,
  notify,
})

if (form && props.prop) {
  form.registerField({ prop: props.prop, validate, clear })
  onScopeDispose(() => form.unregisterField(props.prop))
}

defineExpose({ validate, clear })
</script>

<template>
  <div
    class="sr-form-item"
    :class="[{ 'is-error': status === 'error', 'is-required': isRequired }, attrs.class]"
    :style="[{ '--sr-form-item-label-width': labelWidth }, attrs.style]"
  >
    <label v-if="label" :id="labelId" class="sr-form-item__label">
      {{ label }}
    </label>

    <div class="sr-form-item__control">
      <slot />

      <Transition name="sr-collapse">
        <div v-if="showMessage" :id="messageId" class="sr-form-item__error" role="alert">
          {{ currentError }}
        </div>
      </Transition>
    </div>
  </div>
</template>
