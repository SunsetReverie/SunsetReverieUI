import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

export const cardProps = {
  /** 标题，也可用 header 插槽完全自定义 */
  title: {
    type: String,
    default: '',
  },
  /** 副标题 */
  subtitle: {
    type: String,
    default: '',
  },
  /** 内边距档位 @default 'md' */
  size: {
    type: String as PropType<SrSize>,
    default: 'md',
  },
  /** 是否显示外边框 @default true */
  bordered: {
    type: Boolean,
    default: true,
  },
  /** 悬停时轻微上浮 */
  hoverable: {
    type: Boolean,
    default: false,
  },
} as const

export type SrCardProps = ExtractPropTypes<typeof cardProps>
