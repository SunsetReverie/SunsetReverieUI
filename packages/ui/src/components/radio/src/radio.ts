import type { ExtractPropTypes, InjectionKey, PropType, Ref } from 'vue'

import type { SrSize } from '../../../types/config'

/** 单选项取值类型 */
export type SrRadioValue = string | number | boolean

/** 分组上下文 */
export interface SrRadioGroupContext {
  /** 当前选中值 */
  value: Ref<SrRadioValue | undefined>
  /** 组级禁用 */
  disabled: Ref<boolean>
  /** 组名，用于原生 name 属性 */
  name: Ref<string>
  /** 选中某一项 */
  select: (value: SrRadioValue) => void
}

/** 分组注入键 */
export const SR_RADIO_GROUP_KEY: InjectionKey<SrRadioGroupContext> = Symbol('srRadioGroup')

export const radioProps = {
  /** 单独使用时的值 */
  modelValue: {
    type: [String, Number, Boolean] as PropType<SrRadioValue>,
    default: undefined,
  },
  /** 组内使用时的标识，必填 */
  value: {
    type: [String, Number, Boolean] as PropType<SrRadioValue>,
    default: undefined,
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
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
  name: {
    type: String,
    default: '',
  },
} as const

export type SrRadioProps = ExtractPropTypes<typeof radioProps>

export const radioGroupProps = {
  modelValue: {
    type: [String, Number, Boolean] as PropType<SrRadioValue>,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
  /** 原生 name，同组内共享 */
  name: {
    type: String,
    default: '',
  },
} as const

export type SrRadioGroupProps = ExtractPropTypes<typeof radioGroupProps>
