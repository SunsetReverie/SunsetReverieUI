import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

export const spinnerProps = {
  /** 尺寸档位，或直接给像素值 */
  size: {
    type: [String, Number] as PropType<SrSize | number>,
    default: 'md',
  },
  /** 单色，默认跟随主色 */
  color: {
    type: String,
    default: '',
  },
  /**
   * 多色，按顺序分配给子元素 @default []
   *
   * 只对由多个元素组成的变体有意义：
   * `dots` 用前 3 个、`bars` 用前 4 个、`pulse` 用前 2 个。
   * 数量不足时循环取用；`ring` / `gradient` / `orbit` 仍是单色，会忽略它。
   */
  colors: {
    type: Array as unknown as PropType<string[]>,
    default: () => [],
  },
  /** 无障碍名称；不传则视为装饰性 */
  label: {
    type: String,
    default: '',
  },
  /** 线条粗细（px），只对 `ring` 与 `gradient` 生效 */
  strokeWidth: {
    type: Number,
    default: 2,
  },
  /**
   * 动画样式 @default 'ring'
   *
   * - `ring` 圆环旋转（默认）
   * - `dots` 三点跳动
   * - `pulse` 同心圆扩散
   * - `bars` 竖条起伏
   * - `orbit` 小球绕轨
   * - `gradient` 渐变环旋转
   */
  variant: {
    type: String as PropType<'ring' | 'dots' | 'pulse' | 'bars' | 'orbit' | 'gradient'>,
    default: 'ring',
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
