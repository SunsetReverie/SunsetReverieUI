import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 导航项 */
export interface SrNavItem {
  /** 唯一标识，选中与展开都靠它；有 children 的父项也需要 */
  key?: string
  /** 文案 */
  label?: string
  /** 图标名 */
  icon?: string
  /** 右侧徽标（数字或短文本）；收起态下只显示圆点 */
  badge?: string | number
  /** 禁用 */
  disabled?: boolean
  /** 分组标题，与上一项不同时渲染 */
  group?: string
  /** 顶部加一条分割线 */
  divider?: boolean
  /** 子菜单，点击父项展开 */
  children?: SrNavItem[]
  /**
   * 该分组是否可折叠，挂在分组首项上。
   * 传 false 时标题只是说明文字，不显示箭头也不可点
   */
  collapsible?: boolean
  /** 分组默认是否收起 */
  collapsed?: boolean
}

/** 激活态样式 */
export type SrNavActiveStyle = 'pill' | 'bar'

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
  /** 排列方向；侧边导航用 vertical @default 'horizontal' */
  mode: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
  },
  /**
   * 激活态样式
   * - pill：实色胶囊 + 柔光
   * - bar：淡底 + 左侧主色竖条（侧边栏常用，色弱也能分辨）
   * @default 'pill'
   */
  activeStyle: {
    type: String as PropType<SrNavActiveStyle>,
    default: 'pill',
  },
  /** 整体收起，只显示图标（需有图标才有意义） */
  collapsed: {
    type: Boolean,
    default: false,
  },
  /** 展开宽度 */
  width: {
    type: [String, Number] as PropType<string | number>,
    default: 220,
  },
  /** 收起宽度 */
  collapsedWidth: {
    type: [String, Number] as PropType<string | number>,
    default: 56,
  },
  /** 内容最大高度，超出时纵向滚动且不显示滚动条 */
  maxHeight: {
    type: [String, Number] as PropType<string | number>,
    default: undefined,
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
