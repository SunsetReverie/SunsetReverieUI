import type { ExtractPropTypes, InjectionKey, PropType, Ref } from 'vue'

import type { SrSize } from '../../../types/config'

/** 在组内使用的取值类型 */
export type SrCheckboxValue = string | number

/** 分组上下文 */
export interface SrCheckboxGroupContext {
  /** 当前选中的值集合 */
  value: Ref<SrCheckboxValue[]>
  /** 组级禁用 */
  disabled: Ref<boolean>
  /** 切换某一项 */
  toggle: (item: SrCheckboxValue, checked: boolean) => void
}

/** 分组注入键 */
export const SR_CHECKBOX_GROUP_KEY: InjectionKey<SrCheckboxGroupContext> = Symbol('srCheckboxGroup')

export const checkboxProps = {
  /** 单独使用时的值，支持 v-model */
  modelValue: {
    type: Boolean,
    default: false,
  },
  /** 组内使用时的标识 */
  value: {
    type: [String, Number] as PropType<SrCheckboxValue>,
    default: undefined,
  },
  /** 半选状态（只影响视觉，不改变 modelValue） */
  indeterminate: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 文字，也可用默认插槽 */
  label: {
    type: String,
    default: '',
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
  /** 原生 name */
  name: {
    type: String,
    default: '',
  },
} as const

export type SrCheckboxProps = ExtractPropTypes<typeof checkboxProps>

export const checkboxGroupProps = {
  /** 选中的值集合 */
  modelValue: {
    type: Array as PropType<SrCheckboxValue[]>,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 组级尺寸，子项可覆盖 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
} as const

export type SrCheckboxGroupProps = ExtractPropTypes<typeof checkboxGroupProps>
