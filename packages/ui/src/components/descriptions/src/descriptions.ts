import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 单个字段 */
export interface SrDescriptionItem {
  /** 字段名 */
  label: string
  /** 字段值 */
  value?: string | number
  /**
   * 占几列 @default 1
   *
   * 地址、备注这类长内容给 2 或 3，避免挤在一格里换行。
   */
  span?: number
}

export const descriptionsProps = {
  /** 字段列表 */
  items: {
    type: Array as PropType<SrDescriptionItem[]>,
    default: () => [],
  },
  /** 每行列数 @default 3 */
  column: {
    type: Number,
    default: 3,
  },
  /**
   * 带边框 @default false
   *
   * 打开后是表格样式，字段名有独立底色，适合信息密度高的详情页。
   */
  border: {
    type: Boolean,
    default: false,
  },
  /**
   * 字段名与值的方向 @default 'horizontal'
   *
   * `horizontal` 是左右排（省高度），`vertical` 是上下排（省宽度）。
   */
  direction: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
  },
  /** 字段名宽度，仅 horizontal 有效 @default 'auto' */
  labelWidth: {
    type: [String, Number] as PropType<string | number>,
    default: undefined,
  },
  /** 标题 */
  title: {
    type: String,
    default: '',
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
} as const

export type SrDescriptionsProps = ExtractPropTypes<typeof descriptionsProps>
