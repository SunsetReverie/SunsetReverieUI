import type { ExtractPropTypes, PropType } from 'vue'

/** 徽标语义类型 */
export type SrBadgeType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

export const badgeProps = {
  /** 显示内容，数字超过 max 会折叠成 max+ */
  value: {
    type: [String, Number] as PropType<string | number>,
    default: '',
  },
  /** 数字上限 @default 99 */
  max: {
    type: Number,
    default: 99,
  },
  /** 只显示圆点，不显示内容 */
  dot: {
    type: Boolean,
    default: false,
  },
  /** 语义类型 @default 'danger' */
  type: {
    type: String as PropType<SrBadgeType>,
    default: 'danger',
  },
  /** 值为 0 时是否也显示 */
  showZero: {
    type: Boolean,
    default: false,
  },
  /**
   * 状态点模式：传值后切到「圆点 + 文字」形态，忽略 value
   * 适合表达「运行中 / 已停用」这类状态
   */
  status: {
    type: String as PropType<'default' | 'success' | 'warning' | 'danger' | 'processing'>,
    default: '',
  },
  /** 状态点右侧的文字 */
  text: {
    type: String,
    default: '',
  },
  /** 隐藏徽标（保留占位语义时更直观） */
  hidden: {
    type: Boolean,
    default: false,
  },
} as const

export type SrBadgeProps = ExtractPropTypes<typeof badgeProps>
