import type { ExtractPropTypes, PropType } from 'vue'

/** 警告类型 */
export type SrAlertType = 'info' | 'success' | 'warning' | 'error'

export const alertProps = {
  /**
   * 类型 @default 'info'
   *
   * 决定图标、底色和强调色。
   */
  type: {
    type: String as PropType<SrAlertType>,
    default: 'info',
  },
  /** 标题，不传则只显示描述 */
  title: {
    type: String,
    default: '',
  },
  /** 描述文案，也可以直接用默认插槽 */
  description: {
    type: String,
    default: '',
  },
  /** 显示图标 @default true */
  showIcon: {
    type: Boolean,
    default: true,
  },
  /** 显示关闭按钮 @default false */
  closable: {
    type: Boolean,
    default: false,
  },
  /**
   * 通栏样式 @default false
   *
   * 去掉圆角与左右边框，贴住容器边缘，适合页面顶部横贯一条。
   */
  banner: {
    type: Boolean,
    default: false,
  },
  /** 文字居中 @default false */
  center: {
    type: Boolean,
    default: false,
  },
} as const

export type SrAlertProps = ExtractPropTypes<typeof alertProps>
