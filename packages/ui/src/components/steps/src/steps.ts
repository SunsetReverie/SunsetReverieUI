import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 单个步骤的状态 */
export type SrStepStatus = 'wait' | 'process' | 'finish' | 'error'

/** 步骤项 */
export interface SrStepItem {
  /** 标题 */
  title: string
  /** 描述文案 */
  description?: string
  /** 自定义图标名，不传则用序号 / 状态图标 */
  icon?: string
  /** 单独指定这一项的状态，覆盖推导结果 */
  status?: SrStepStatus
  /** 是否禁用（禁用项不可点击） */
  disabled?: boolean
}

export const stepsProps = {
  /** 步骤数据 */
  items: {
    type: Array as PropType<SrStepItem[]>,
    default: () => [],
  },
  /**
   * 当前进行到第几步 @default 0
   *
   * 从 0 开始。小于它的都是「已完成」，大于它的都是「未开始」。
   */
  current: {
    type: Number,
    default: 0,
  },
  /**
   * 当前步骤的状态 @default 'process'
   *
   * 只影响 `current` 那一步；其余按位置推导。
   * 设成 `error` 表示这一步出了问题，后面的步骤全部停在「未开始」。
   */
  status: {
    type: String as PropType<Exclude<SrStepStatus, 'wait' | 'finish'>>,
    default: 'process',
  },
  /** 方向 @default 'horizontal' */
  direction: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
  },
  /**
   * 标题与描述的位置 @default 'horizontal'
   *
   * 横向步骤条里，`vertical` 会让标题和描述上下排列，适合文案较长的情况。
   */
  labelPlacement: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
  },
  /** 简洁模式：只显示标题和连接线 @default false */
  simple: {
    type: Boolean,
    default: false,
  },
  /** 允许点击切换 @default false */
  clickable: {
    type: Boolean,
    default: false,
  },
  /**
   * 连接线样式 @default 'solid'
   *
   * `dashed` 让未完成的连接线变成虚线，进度感更明显。
   */
  lineStyle: {
    type: String as PropType<'solid' | 'dashed'>,
    default: 'solid',
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
} as const

export type SrStepsProps = ExtractPropTypes<typeof stepsProps>
