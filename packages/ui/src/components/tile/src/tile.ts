import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

export const tileProps = {
  /** 图标名 */
  icon: {
    type: String,
    default: '',
  },
  /** 标题 */
  title: {
    type: String,
    default: '',
  },
  /** 描述，标题下方的一行小字 */
  description: {
    type: String,
    default: '',
  },
  /**
   * 选中态 @default false
   *
   * 用于「图标选择器」「功能开关」这类可选的宫格。
   */
  active: {
    type: Boolean,
    default: false,
  },
  /** 禁用 @default false */
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * 图标区域的配色 @default 'default'
   *
   * 传语义色时图标底色会跟着变，用于区分功能分组。
   */
  type: {
    type: String as PropType<'default' | 'primary' | 'success' | 'warning' | 'error'>,
    default: 'default',
  },
  /** 尺寸档位 @default 'md' */
  size: {
    type: String as PropType<SrSize>,
    default: 'md',
  },
  /**
   * 横向排布 @default false
   *
   * 打开后图标在左、文字在右，适合列表式的快捷入口。
   */
  horizontal: {
    type: Boolean,
    default: false,
  },
} as const

export type SrTileProps = ExtractPropTypes<typeof tileProps>
