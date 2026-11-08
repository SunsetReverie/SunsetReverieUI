import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

export const spaceProps = {
  /** 排列方向 @default 'horizontal' */
  direction: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
  },
  /**
   * 间距 @default 'sm'
   *
   * 传档位用设计令牌，传数字直接当像素。
   */
  size: {
    type: [String, Number] as PropType<SrSize | number>,
    default: 'sm',
  },
  /** 交叉轴对齐 @default 'center' */
  align: {
    type: String as PropType<'start' | 'end' | 'center' | 'baseline'>,
    default: 'center',
  },
  /** 空间不足时换行 @default false */
  wrap: {
    type: Boolean,
    default: false,
  },
  /**
   * 行内模式 @default false
   *
   * 打开后用 inline-flex，适合夹在文字中间的小按钮组。
   */
  inline: {
    type: Boolean,
    default: false,
  },
} as const

export type SrSpaceProps = ExtractPropTypes<typeof spaceProps>
