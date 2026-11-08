import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 穿梭项的值 */
export type SrTransferValue = string | number

/** 穿梭项 */
export interface SrTransferItem {
  /** 值 */
  value: SrTransferValue
  /** 显示文案 */
  label: string
  /** 禁用，不可移动 */
  disabled?: boolean
}

export const transferProps = {
  /**
   * 右侧（已选）的值，配合 v-model
   *
   * 只存「在哪一边」，不存顺序——顺序始终跟 `data` 一致。
   */
  modelValue: {
    type: Array as PropType<SrTransferValue[]>,
    default: () => [],
  },
  /** 全部数据 */
  data: {
    type: Array as PropType<SrTransferItem[]>,
    default: () => [],
  },
  /** 两侧标题 @default ['待选', '已选'] */
  titles: {
    type: Array as unknown as PropType<[string, string]>,
    default: () => ['待选', '已选'],
  },
  /** 两侧可搜索 @default false */
  filterable: {
    type: Boolean,
    default: false,
  },
  /** 禁用 @default false */
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 列表高度 @default 260 */
  height: {
    type: Number,
    default: 260,
  },
  /** 空状态文案 @default '暂无数据' */
  emptyText: {
    type: String,
    default: '暂无数据',
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
} as const

export type SrTransferProps = ExtractPropTypes<typeof transferProps>
