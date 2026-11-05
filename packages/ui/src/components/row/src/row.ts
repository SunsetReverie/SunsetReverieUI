import type { ExtractPropTypes, PropType } from 'vue'

import type { SrResponsive } from '../../../types/theme'

/** 主轴对齐方式（语义值，运行时映射为 flex 值） */
export type SrRowJustify = 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'

/** 交叉轴对齐方式（语义值，运行时映射为 flex 值） */
export type SrRowAlign = 'top' | 'middle' | 'bottom' | 'stretch'

/** 栅格间隔：单值表示水平垂直相同，数组表示 [水平, 垂直] */
export type SrGutter = number | [number, number]

export const rowProps = {
  /**
   * 栅格间隔（px）
   * 支持单值、[水平, 垂直]、以及按断点分档的对象
   */
  gutter: {
    type: [Number, Array, Object] as PropType<SrResponsive<SrGutter>>,
    default: 0,
  },
  /** 主轴对齐 */
  justify: {
    type: String as PropType<SrRowJustify>,
    default: 'start',
  },
  /** 交叉轴对齐 */
  align: {
    type: String as PropType<SrRowAlign>,
    default: 'top',
  },
  /** 是否允许换行 */
  wrap: {
    type: Boolean,
    default: true,
  },
  /** 自定义标签名，便于语义化（如 section） */
  tag: {
    type: String,
    default: 'div',
  },
} as const

export type SrRowProps = ExtractPropTypes<typeof rowProps>

/** 语义对齐值 → flex 值 */
export const ROW_JUSTIFY_MAP: Record<SrRowJustify, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
}

/** 语义对齐值 → flex 值 */
export const ROW_ALIGN_MAP: Record<SrRowAlign, string> = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
  stretch: 'stretch',
}
