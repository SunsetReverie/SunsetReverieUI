import type { ExtractPropTypes, PropType } from 'vue'

export const dividerProps = {
  /**
   * 方向 @default 'horizontal'
   *
   * 水平分割线占满整行，垂直分割线需要父容器有确定高度。
   */
  direction: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
  },
  /** 虚线 @default false */
  dashed: {
    type: Boolean,
    default: false,
  },
  /**
   * 文字位置 @default 'center'
   *
   * 只有在水平方向且带内容时生效。
   */
  contentPosition: {
    type: String as PropType<'left' | 'center' | 'right'>,
    default: 'center',
  },
} as const

export type SrDividerProps = ExtractPropTypes<typeof dividerProps>
