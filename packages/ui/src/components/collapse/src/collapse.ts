import type { ExtractPropTypes, PropType } from 'vue'

/** 面板标识 */
export type SrCollapseKey = string | number

/** 单个面板 */
export interface SrCollapseItem {
  /** 标识 */
  key: SrCollapseKey
  /** 标题 */
  title: string
  /** 内容文案，也可以交给 #item 插槽 */
  content?: string
  /** 右侧附加文字，比如条数 */
  extra?: string
  /** 禁用，不可展开 */
  disabled?: boolean
}

export const collapseProps = {
  /**
   * 展开的面板 key
   *
   * 配合 `v-model`。手风琴模式下内部只会保留一个。
   */
  modelValue: {
    type: Array as PropType<SrCollapseKey[]>,
    default: () => [],
  },
  /** 面板数据 */
  items: {
    type: Array as PropType<SrCollapseItem[]>,
    default: () => [],
  },
  /**
   * 手风琴模式 @default false
   *
   * 同一时刻只允许展开一个，展开新的会自动收起之前的。
   */
  accordion: {
    type: Boolean,
    default: false,
  },
  /**
   * 无边框、无背景 @default false
   *
   * 适合嵌在卡片内部，避免出现「框中框」。
   */
  ghost: {
    type: Boolean,
    default: false,
  },
} as const

export type SrCollapseProps = ExtractPropTypes<typeof collapseProps>
