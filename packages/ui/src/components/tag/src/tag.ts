import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 标签语义类型 */
export type SrTagType = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger'

/** 标签配色：浅色（淡底深字）/ 深色（实色底白字，同一色系只是深浅不同） */
export type SrTagVariant = 'light' | 'dark'

export const tagProps = {
  /** 语义类型，决定基色 @default 'default' */
  type: {
    type: String as PropType<SrTagType>,
    default: 'default',
  },
  /** 配色深浅 @default 'light' */
  variant: {
    type: String as PropType<SrTagVariant>,
    default: 'light',
  },
  /**
   * 自定义基色（任意 CSS 颜色），设置后覆盖 type 的基色；
   * 浅色/深色档仍由 variant 从它派生
   */
  color: {
    type: String,
    default: '',
  },
  /** 尺寸档位，与按钮一致 @default 'md' */
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
