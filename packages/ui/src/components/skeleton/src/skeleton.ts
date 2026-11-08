import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

export const skeletonProps = {
  /**
   * 是否处于加载中 @default true
   *
   * 为 true 渲染骨架占位，为 false 渲染默认插槽内容。
   * 不传插槽时可以当成纯占位块用。
   */
  loading: {
    type: Boolean,
    default: true,
  },
  /** 段落行数，0 表示不显示段落 @default 3 */
  rows: {
    type: Number,
    default: 3,
  },
  /** 显示标题占位 @default true */
  title: {
    type: Boolean,
    default: true,
  },
  /** 显示头像占位 @default false */
  avatar: {
    type: Boolean,
    default: false,
  },
  /** 头像是否为圆形 @default false */
  round: {
    type: Boolean,
    default: false,
  },
  /**
   * 闪光动画 @default true
   *
   * 关掉后是静态灰块。`prefers-reduced-motion` 下会自动关掉，不依赖这个开关。
   */
  animated: {
    type: Boolean,
    default: true,
  },
  /** 尺寸档位，影响行高与间距 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
} as const

export type SrSkeletonProps = ExtractPropTypes<typeof skeletonProps>
