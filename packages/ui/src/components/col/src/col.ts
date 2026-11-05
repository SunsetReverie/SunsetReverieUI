import type { ExtractPropTypes, PropType } from 'vue'

import type { SrResponsive } from '../../../types/theme'

/** 栅格总列数：24 能被 3/4/6/8 整除，中后台的 5~6 列布局更好表达 */
export const SR_GRID_COLUMNS = 24

export const colProps = {
  /** 占据列数（满 24），支持按断点分档 */
  span: {
    type: [Number, Object] as PropType<SrResponsive<number>>,
    default: SR_GRID_COLUMNS,
  },
  /** 左侧偏移列数（用 margin 实现） */
  offset: {
    type: [Number, Object] as PropType<SrResponsive<number>>,
    default: 0,
  },
  /** 向右推（相对位移，不改变文档流占位） */
  push: {
    type: [Number, Object] as PropType<SrResponsive<number>>,
    default: 0,
  },
  /** 向左拉（相对位移，与 push 相互抵消） */
  pull: {
    type: [Number, Object] as PropType<SrResponsive<number>>,
    default: 0,
  },
  /** 弹性布局取值，传值后覆盖 span 的固定宽度（如 'auto' 或 1） */
  flex: {
    type: [String, Number] as PropType<string | number>,
    default: '',
  },
  /** 自定义标签名 */
  tag: {
    type: String,
    default: 'div',
  },
} as const

export type SrColProps = ExtractPropTypes<typeof colProps>
