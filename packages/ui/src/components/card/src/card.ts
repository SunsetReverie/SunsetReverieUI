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
  /**
   * 单独指定内边距，优先于 size。
   * 'none' 时内容紧贴边缘，适合自带内边距的图表或图片
   */
  padding: {
    type: String as PropType<'none' | SrSize>,
    default: '',
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
