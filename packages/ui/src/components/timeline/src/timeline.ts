import type { ExtractPropTypes } from 'vue'
import type { PropType } from 'vue'

/** 节点类型 */
export type SrTimelineType = 'default' | 'primary' | 'success' | 'warning' | 'error'

/** 单个节点 */
export interface SrTimelineItem {
  /** 内容 */
  content: string
  /** 时间戳，显示在内容旁边或上方 */
  timestamp?: string
  /** 节点类型，决定圆点颜色 @default 'default' */
  type?: SrTimelineType
  /** 自定义图标，会替换圆点 */
  icon?: string
  /** 空心圆点 @default false */
  hollow?: boolean
}

export const timelineProps = {
  /** 节点列表 */
  items: {
    type: Array as PropType<SrTimelineItem[]>,
    default: () => [],
  },
  /**
   * 时间戳位置 @default 'right'
   *
   * - `right` 内容在左、时间在右
   * - `left` 反过来
   * - `top` 时间在上、内容在下（仍保留圆点与连接线）
   */
  mode: {
    type: String as PropType<'left' | 'right' | 'top'>,
    default: 'right',
  },
  /**
   * 无节点模式 @default false
   *
   * 隐藏圆点与连接线，时间自动移到内容上方——适合「活动日志」这类
   * 只关心时间与文字、不需要图形引导的场景。
   */
  plain: {
    type: Boolean,
    default: false,
  },
  /** 倒序排列 @default false */
  reverse: {
    type: Boolean,
    default: false,
  },
} as const

export type SrTimelineProps = ExtractPropTypes<typeof timelineProps>
