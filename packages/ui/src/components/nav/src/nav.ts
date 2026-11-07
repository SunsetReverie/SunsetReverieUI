import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 导航项 */
export interface SrNavItem {
  /** 唯一标识，选中时回传 */
  key?: string
  /** 文案 */
  label?: string
  /** 图标名 */
  icon?: string
  /** 右侧徽标（数字或短文本） */
  badge?: string | number
  /** 禁用 */
  disabled?: boolean
  /** 分组标题，与上一项不同时渲染小标题 */
  group?: string
  /** 顶部加一条分割线 */
  divider?: boolean
}

export const navProps = {
  /** 当前选中项，支持 v-model */
  modelValue: {
    type: String,
    default: '',
  },
  /** 导航项列表 */
  items: {
    type: Array as PropType<SrNavItem[]>,
    default: () => [],
  },
  /** 排列方向 @default 'horizontal' */
  mode: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
  /** 禁用整个导航 */
  disabled: {
    type: Boolean,
    default: false,
  },
} as const

export type SrNavProps = ExtractPropTypes<typeof navProps>
