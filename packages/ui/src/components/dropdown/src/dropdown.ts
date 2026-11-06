import type { ExtractPropTypes, PropType } from 'vue'

import type { SrPlacement } from '../../../utils/floating'

/** 菜单项 */
export interface SrDropdownItem {
  /** 唯一标识，选择时回传 */
  key?: string
  /** 文案 */
  label?: string
  /** 图标名 */
  icon?: string
  /** 禁用 */
  disabled?: boolean
  /** 顶部加一条分割线 */
  divided?: boolean
  /** 分组标题，与上一项不同时渲染小标题 */
  group?: string
}

export const dropdownProps = {
  /** 菜单项 */
  items: {
    type: Array as PropType<SrDropdownItem[]>,
    default: () => [],
  },
  /** 触发方式 @default 'click' */
  trigger: {
    type: String as PropType<'click' | 'hover'>,
    default: 'click',
  },
  /** 弹出位置 @default 'bottom-start' */
  placement: {
    type: String as PropType<SrPlacement>,
    default: 'bottom-start',
  },
  /** 禁用整个下拉 */
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 菜单最小宽度；数字按 px */
  minWidth: {
    type: [String, Number] as PropType<string | number>,
    default: 160,
  },
} as const

export type SrDropdownProps = ExtractPropTypes<typeof dropdownProps>
