<script setup lang="ts">
import { computed, provide, reactive, toRef, useAttrs } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import { SR_FORM_KEY, formProps, type SrFormError, type SrFormField } from './form'

defineOptions({ name: 'SrForm', inheritAttrs: false })

const props = defineProps(formProps)

const emit = defineEmits<{
  /** 全部校验通过后提交 */
  submit: [model: Record<string, unknown>]
  /** 校验失败 */
  'validate-fail': [errors: Record<string, SrFormError>]
}>()

const attrs = useAttrs()
const config = useSrConfig()

/** 已注册字段 */
const fields = reactive(new Map<string, SrFormField>())

/** 标签宽度统一转字符串 */
const labelWidth = computed(() =>
  typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth,
)

/** 表单尺寸：自身 > 全局配置 */
const size = computed(() => props.size ?? config.value.size)

/**
 * 注册字段
 * @param field 字段对象
 */
function registerField(field: SrFormField): void {
  fields.set(field.prop, field)
}

/**
 * 注销字段
 * @param prop 字段名
 */
function unregisterField(prop: string): void {
  fields.delete(prop)
}

/**
 * 校验全部字段
 *
 * 有意不短路：要让所有错误一次性暴露，而不是改一个再冒一个。
 * @returns 是否全部通过
 */
async function validate(): Promise<boolean> {
  const results = await Promise.all(
    [...fields.values()].map(async (field) => ({
      prop: field.prop,
      error: await field.validate('manual'),
    })),
  )

  const errors = results.reduce<Record<string, SrFormError>>((acc, item) => {
    if (item.error) acc[item.prop] = item.error
    return acc
  }, {})

  if (Object.keys(errors).length > 0) {
    emit('validate-fail', errors)
    return false
  }
  return true
}

/**
 * 校验单个字段
 * @param prop 字段名
 * @returns 是否通过
 */
async function validateField(prop: string): Promise<boolean> {
  const field = fields.get(prop)
  if (!field) return true
  return (await field.validate('manual')) === ''
}

/** 清空全部错误 */
function clearValidate(): void {
  for (const field of fields.values()) field.clear()
}

/**
 * 提交：校验通过后派发 submit
 * @param event 提交事件
 */
async function onSubmit(event: Event): Promise<void> {
  event.preventDefault()
  if (await validate()) emit('submit', props.model)
}

provide(SR_FORM_KEY, {
  model: props.model,
  rules: computed(() => props.rules ?? {}),
  labelWidth,
  labelPosition: toRef(props, 'labelPosition'),
  disabled: toRef(props, 'disabled'),
  size,
  showMessage: toRef(props, 'showMessage'),
  registerField,
  unregisterField,
})

defineExpose({ validate, validateField, clearValidate })

/** 是否有标签（决定是否用 grid 布局） */
const hasLabel = computed(() => props.labelPosition !== 'top')
</script>

<template>
  <form
    class="sr-form"
    :class="[`sr-form--label-${labelPosition}`, { 'is-label-inline': hasLabel }, attrs.class]"
    :style="[{ '--sr-form-label-width': labelWidth }, attrs.style]"
    @submit="onSubmit"
  >
    <slot />
  </form>
</template>
