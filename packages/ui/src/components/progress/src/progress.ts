import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 进度状态：影响颜色与文字 */
export type SrProgressStatus = 'normal' | 'success' | 'error' | 'warning'

export const progressProps = {
  /**
   * 形态 @default 'line'
   *
   * `line` 横向轨道，适合页面顶部的整体进度；
   * `circle` 环形，适合卡片里单独占一块，文字居中放在圆心里。
   */
  type: {
    type: String as PropType<'line' | 'circle'>,
    default: 'line',
  },
  /** 百分比 0-100，超出会被夹到边界 @default 0 */
  percent: {
    type: Number,
    default: 0,
  },
  /** 状态 @default 'normal' */
  status: {
    type: String as PropType<SrProgressStatus>,
    default: 'normal',
  },
  /** 轨道高度（px）@default 6 */
  strokeWidth: {
    type: Number,
    default: 6,
  },
  /** 显示百分比文字 @default true */
  showText: {
    type: Boolean,
    default: true,
  },
  /**
   * 文字放在轨道内部 @default false
   *
   * 只有轨道足够高（strokeWidth >= 16）时才好看，否则会溢出。
   */
  textInside: {
    type: Boolean,
    default: false,
  },
  /** 自定义文字，覆盖默认的百分比 */
  format: {
    type: Function as PropType<(percent: number) => string>,
    default: undefined,
  },
  /** 条纹背景 @default false */
  striped: {
    type: Boolean,
    default: false,
  },
  /** 条纹流动动画 @default false */
  animated: {
    type: Boolean,
    default: false,
  },
  /** 尺寸档位，同时影响高度与字号；传了以对应档位为准 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
  /**
   * 环形直径（px） @default 120
   *
   * 只对 `type="circle"` 生效；轨道粗细仍由 `strokeWidth` 控制。
   */
  width: {
    type: Number,
    default: 120,
  },
} as const

export type SrProgressProps = ExtractPropTypes<typeof progressProps>
