import type { ExtractPropTypes, InjectionKey, PropType, Ref } from 'vue'

import type { SrSize } from '../../../types/config'

/** 触发时机 */
export type SrFormTrigger = 'blur' | 'change'

/** 单条校验规则 */
export interface SrFormRule {
  /** 必填 */
  required?: boolean
  /** 失败提示，未提供时用内置文案 */
  message?: string
  /** 字符串最小长度 / 数字最小值 / 数组最小长度 */
  min?: number
  /** 字符串最大长度 / 数字最大值 / 数组最大长度 */
  max?: number
  /** 正则匹配 */
  pattern?: RegExp
  /**
   * 自定义校验
   * 返回 true 表示通过；返回字符串表示失败原因；也可以返回 Promise
   */
  validator?: (value: unknown, model: Record<string, unknown>) => boolean | string | Promise<boolean | string>
  /** 该规则在什么时机触发 @default 'blur' */
  trigger?: SrFormTrigger
}

/** 校验结果：空字符串表示通过 */
export type SrFormError = string

/** 表单字段注册对象（由 SrFormItem 提供） */
export interface SrFormField {
  /** 字段名 */
  prop: string
  /**
   * 执行校验
   * @param trigger 触发时机；manual 表示只校验不区分规则时机
   * @returns 错误信息，通过时为空字符串
   */
  validate: (trigger?: SrFormTrigger | 'manual') => Promise<SrFormError>
  /** 清空错误 */
  clear: () => void
}

/** 表单上下文 */
export interface SrFormContext {
  model: Record<string, unknown>
  rules: Ref<Record<string, SrFormRule | SrFormRule[]>>
  labelWidth: Ref<string>
  labelPosition: Ref<'top' | 'left' | 'right'>
  disabled: Ref<boolean>
  size: Ref<SrSize | undefined>
  showMessage: Ref<boolean>
  registerField: (field: SrFormField) => void
  unregisterField: (prop: string) => void
}

/** 表单注入键 */
export const SR_FORM_KEY: InjectionKey<SrFormContext> = Symbol('srForm')

/**
 * 表单项上下文
 *
 * 子组件（SrInput / SrSelect）注入它来获得当前校验态，
 * 并在自身 blur / change 时通知表单项执行校验 —— 这样表单不需要
 * 逐个给子组件传 status，也不会出现「父组件不知道子组件何时失焦」的问题。
 */
export interface SrFormItemContext {
  /** 当前校验态 */
  status: Ref<'default' | 'error' | 'warning' | 'success'>
  /** 错误文案元素 id，供 aria-describedby 使用 */
  messageId: string
  /** 标签元素 id，供 aria-labelledby 使用 */
  labelId: string
  /** 是否禁用：自身 disabled 或表单级 disabled */
  disabled: Ref<boolean>
  /** 通知表单项：字段发生了某种交互 */
  notify: (trigger: SrFormTrigger) => void
}

/** 表单项注入键 */
export const SR_FORM_ITEM_KEY: InjectionKey<SrFormItemContext> = Symbol('srFormItem')

export const formProps = {
  /** 表单数据对象 */
  model: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({}),
  },
  /** 全局校验规则，按字段名索引 */
  rules: {
    type: Object as PropType<Record<string, SrFormRule | SrFormRule[]>>,
    default: () => ({}),
  },
  /** 标签宽度 */
  labelWidth: {
    type: [String, Number] as PropType<string | number>,
    default: '88px',
  },
  /** 标签位置 */
  labelPosition: {
    type: String as PropType<'top' | 'left' | 'right'>,
    default: 'top',
  },
  /**
   * 隐藏必填项标签后的星号 @default false
   *
   * 有些设计规范不在标签上打星，改为在占位文案或校验提示里说明。
   */
  hideRequiredMark: {
    type: Boolean,
    default: false,
  },
  /** 表单级尺寸，下发给子组件 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
  /** 整表禁用 */
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 是否显示错误文案（关闭后只保留边框变色） */
  showMessage: {
    type: Boolean,
    default: true,
  },
} as const

export type SrFormProps = ExtractPropTypes<typeof formProps>

export const formItemProps = {
  /** 对应 model 中的字段名 */
  prop: {
    type: String,
    default: '',
  },
  /** 标签文案 */
  label: {
    type: String,
    default: '',
  },
  /** 字段级规则，优先于表单级 */
  rules: {
    type: [Object, Array] as PropType<SrFormRule | SrFormRule[]>,
    default: undefined,
  },
  /** 强制显示必填星号（未给 rules 时也用） */
  required: {
    type: Boolean,
    default: false,
  },
  /** 手动指定错误文案，优先于校验结果 */
  error: {
    type: String,
    default: '',
  },
  /** 单独覆盖标签宽度 */
  labelWidth: {
    type: [String, Number] as PropType<string | number>,
    default: undefined,
  },
  /** 单独禁用这一项，与表单级 disabled 取或 */
  disabled: {
    type: Boolean,
    default: false,
  },
} as const

export type SrFormItemProps = ExtractPropTypes<typeof formItemProps>
