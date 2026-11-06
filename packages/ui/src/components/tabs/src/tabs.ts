import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 外观变体 */
export type SrTabsType = 'line' | 'card' | 'segment' | 'pill'

/** 单个标签页 */
export interface SrTabsItem {
  /** 唯一标识，同时作为面板插槽名 `panel-<key>` */
  key: string
  /** 标签文案 */
  label: string
  /** 图标名 */
  icon?: string
  /** 禁用 */
  disabled?: boolean
  /** 可关闭，会覆盖全局 closable */
  closable?: boolean
}

export const tabsProps = {
  /** 当前激活的 key，支持 v-model */
  modelValue: {
    type: String,
    default: '',
  },
  /** 标签页列表 */
  items: {
    type: Array as PropType<SrTabsItem[]>,
    default: () => [],
  },
  /**
   * 外观
   * - line：下划线指示
   * - card：连接式卡片，选中项与内容区连成一片
   * - segment：背板内浮起，类似分段控件
   * - pill：胶囊标签
   * @default 'line'
   */
  type: {
    type: String as PropType<SrTabsType>,
    default: 'line',
  },
  /**
   * 是否显示背板与边框。
   * 传 false 时 card / segment / pill 只剩文字与选中态，适合嵌在已有容器里
   * @default true
   */
  bordered: {
    type: Boolean,
    default: true,
  },
  /** 排列方向 @default 'horizontal' */
  direction: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
  /** 全部标签可关闭 */
  closable: {
    type: Boolean,
    default: false,
  },
  /** 懒加载：未激活过的面板不渲染 */
  lazy: {
    type: Boolean,
    default: false,
  },
} as const

export type SrTabsProps = ExtractPropTypes<typeof tabsProps>
