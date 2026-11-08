import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 选项值 */
export type SrSelectValue = string | number

/** 单个选项 */
export interface SrSelectOption {
  /** 选项值 */
  value: SrSelectValue
  /** 展示文案 */
  label: string
  /** 该选项禁用 */
  disabled?: boolean
}

/** 校验态（与 SrInput 保持一致，供 SrFormItem 复用） */
export type SrSelectStatus = 'default' | 'error' | 'warning' | 'success'

export const selectProps = {
  /** 选中值；multiple 时为数组 */
  /**
   * 选中值，配合 v-model
   *
   * 不传就是非受控：组件自己维护选中状态，点击依然有效。
   */
  modelValue: {
    type: [String, Number, Array] as PropType<SrSelectValue | SrSelectValue[] | undefined>,
    default: undefined,
  },
  /** 非受控时的初始值 */
  defaultValue: {
    type: [String, Number, Array] as PropType<SrSelectValue | SrSelectValue[] | undefined>,
    default: undefined,
  },
  /** 选项列表 */
  options: {
    type: Array as PropType<SrSelectOption[]>,
    default: () => [],
  },
  /** 多选 */
  multiple: {
    type: Boolean,
    default: false,
  },
  /** 可搜索：面板顶部出现输入框 */
  filterable: {
    type: Boolean,
    default: false,
  },
  /** 可清空 */
  clearable: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
  /** 校验态 */
  status: {
    type: String as PropType<SrSelectStatus>,
    default: 'default',
  },
  /** 占位文案 */
  placeholder: {
    type: String,
    default: '请选择',
  },
  /** 无匹配项时的文案 */
  emptyText: {
    type: String,
    default: '无匹配项',
  },
  /** 面板最大高度（px），超出滚动 */
  maxHeight: {
    type: Number,
    default: 260,
  },
} as const

export type SrSelectProps = ExtractPropTypes<typeof selectProps>

/** 各尺寸的度量值（与 SrInput 对齐，保证同一表单里高度一致） */
export const SELECT_SIZE_MAP: Record<SrSize, { height: number; paddingX: number; fontSize: number }> = {
  xs: { height: 24, paddingX: 8, fontSize: 12 },
  sm: { height: 28, paddingX: 10, fontSize: 13 },
  md: { height: 32, paddingX: 12, fontSize: 14 },
  lg: { height: 40, paddingX: 14, fontSize: 16 },
}
