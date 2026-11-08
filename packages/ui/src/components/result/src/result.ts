import type { ExtractPropTypes, PropType } from 'vue'

/** 结果类型 */
export type SrResultStatus = 'success' | 'error' | 'warning' | 'info'

export const resultProps = {
  /**
   * 结果类型 @default 'info'
   *
   * 决定图标与主色。业务上「404 / 403」这类场景用 `warning` 或 `error`，
   * 文案自己写，不需要额外的枚举值。
   */
  status: {
    type: String as PropType<SrResultStatus>,
    default: 'info',
  },
  /** 主标题 */
  title: {
    type: String,
    default: '',
  },
  /** 副标题 / 说明 */
  subTitle: {
    type: String,
    default: '',
  },
  /**
   * 自定义图标 @default undefined
   *
   * 传了就不再显示状态图标，适合「提交成功用插画」这类需求。
   */
  icon: {
    type: String,
    default: '',
  },
  /**
   * 紧凑模式 @default false
   *
   * 缩小图标与间距，适合嵌在卡片或弹窗里，而不是占满整页。
   */
  compact: {
    type: Boolean,
    default: false,
  },
} as const

export type SrResultProps = ExtractPropTypes<typeof resultProps>
