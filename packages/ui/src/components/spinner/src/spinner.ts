import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

export const spinnerProps = {
  /** 尺寸档位，或直接给像素值 */
  size: {
    type: [String, Number] as PropType<SrSize | number>,
    default: 'md',
  },
  /** 颜色，默认跟随主色 */
  color: {
    type: String,
    default: '',
  },
  /** 无障碍名称；不传则视为装饰性 */
  label: {
    type: String,
    default: '',
  },
  /** 线条粗细（px） */
  strokeWidth: {
    type: Number,
    default: 2,
  },
} as const

export type SrSpinnerProps = ExtractPropTypes<typeof spinnerProps>

/** 尺寸档位 → 像素 */
export const SPINNER_SIZE_MAP: Record<SrSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 28,
}
