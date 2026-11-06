import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 标签语义类型 */
export type SrTagType = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger'

export const tagProps = {
  /** 语义类型，决定底色与文字色 @default 'default' */
  type: {
    type: String as PropType<SrTagType>,
    default: 'default',
  },
  /** 尺寸档位 @default 'md' */
  size: {
    type: String as PropType<SrSize>,
    default: 'md',
  },
  /** 是否可关闭（显示关闭按钮） */
  closable: {
    type: Boolean,
    default: false,
  },
  /** 是否使用胶囊圆角 */
  round: {
    type: Boolean,
    default: false,
  },
} as const

export type SrTagProps = ExtractPropTypes<typeof tagProps>
