import type { ExtractPropTypes, PropType } from 'vue'

/** 菜单项 */
export interface SrContextMenuItem {
  /** 唯一标识，选中时回传 */
  key: string
  /** 文案 */
  label: string
  /** 图标名 */
  icon?: string
  /** 禁用 */
  disabled?: boolean
  /** 危险操作，文字标红 */
  danger?: boolean
  /** 上方加一条分割线 */
  divider?: boolean
}

export const contextMenuProps = {
  /** 菜单项 */
  items: {
    type: Array as PropType<SrContextMenuItem[]>,
    default: () => [],
  },
  /**
   * 禁用整个菜单 @default false
   *
   * 禁用后右键仍会阻止默认菜单，只是不弹出自己的。
   */
  disabled: {
    type: Boolean,
    default: false,
  },
} as const

export type SrContextMenuProps = ExtractPropTypes<typeof contextMenuProps>
