import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'
import type { SrResponsive } from '../../../types/theme'

/** 校验态 */
export type SrInputStatus = 'default' | 'error' | 'warning' | 'success'

export const inputProps = {
  /** 值，支持 v-model */
  modelValue: {
    type: [String, Number] as PropType<string | number>,
    default: '',
  },
  /**
   * 原生 input type
   * textarea 是独立分支，不看这个字段
   */
  type: {
    type: String,
    default: 'text',
  },
  /** 尺寸，支持按断点分档；不传则继承 SrConfigProvider */
  size: {
    type: [String, Object] as PropType<SrResponsive<SrSize>>,
    default: undefined,
  },
  /** 占位文案 */
  placeholder: {
    type: String,
    default: '',
  },
  /** 禁用 */
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 只读 */
  readonly: {
    type: Boolean,
    default: false,
  },
  /** 有值时显示清空按钮 */
  clearable: {
    type: Boolean,
    default: false,
  },
  /** type="password" 时显示「显示/隐藏」切换 */
  showPassword: {
    type: Boolean,
    default: false,
  },
  /** 最大长度，同时用于字数统计 */
  maxlength: {
    type: Number,
    default: undefined,
  },
  /** 显示字数统计（需同时给 maxlength 才有「/n」） */
  showCount: {
    type: Boolean,
    default: false,
  },
  /** 校验态，仅影响边框与图标颜色 */
  status: {
    type: String as PropType<SrInputStatus>,
    default: 'default',
  },
  /** textarea 行数 */
  rows: {
    type: Number,
    default: 3,
  },
  /** textarea 高度自适应内容 */
  autosize: {
    type: Boolean,
    default: false,
  },
} as const

export type SrInputProps = ExtractPropTypes<typeof inputProps>

/** 各尺寸的度量值 */
export const INPUT_SIZE_MAP: Record<SrSize, { height: number; paddingX: number; fontSize: number }> = {
  xs: { height: 24, paddingX: 8, fontSize: 12 },
  sm: { height: 28, paddingX: 10, fontSize: 13 },
  md: { height: 32, paddingX: 12, fontSize: 14 },
  lg: { height: 40, paddingX: 14, fontSize: 16 },
}
