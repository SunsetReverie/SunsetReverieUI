import type { ExtractPropTypes, PropType } from 'vue'

/** 面包屑条目 */
export interface SrBreadcrumbItem {
  /** 展示文案 */
  label: string
  /** 链接地址 */
  href?: string
  /** 图标名 */
  icon?: string
  /** 禁用该项，只展示不可点击 */
  disabled?: boolean
}

export const breadcrumbProps = {
  /** 条目列表，最后一项自动标记为当前页 */
  items: {
    type: Array as PropType<SrBreadcrumbItem[]>,
    default: () => [],
  },
  /** 图标分隔符，设置后优先于 separator */
  separatorIcon: {
    type: String,
    default: '',
  },
  /** 分隔符 @default '/' */
  separator: {
    type: String,
    default: '/',
  },
  /**
   * 最多显示几项，超出时中间折叠成省略号。
   * 0 表示不折叠，始终保留首项与末两项
   */
  maxItems: {
    type: Number,
    default: 0,
  },
} as const

export type SrBreadcrumbProps = ExtractPropTypes<typeof breadcrumbProps>
