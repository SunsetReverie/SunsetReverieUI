import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 选项值 */
export type SrSegmentedValue = string | number

/** 单个选项 */
export interface SrSegmentedOption {
  /** 显示文案 */
  label: string
  /** 值 */
  value: SrSegmentedValue
  /** 图标名，放在文案前面 */
  icon?: string
  /** 禁用 */
  disabled?: boolean
}

export const segmentedProps = {
  /** 当前选中值，配合 v-model */
  modelValue: {
    type: [String, Number] as PropType<SrSegmentedValue | undefined>,
    default: undefined,
  },
  /** 选项列表 */
  options: {
    type: Array as PropType<SrSegmentedOption[]>,
    default: () => [],
  },
  /**
   * 占满容器宽度 @default false
   *
   * 打开后每项等分宽度；关闭时宽度随内容。
   */
  block: {
    type: Boolean,
    default: false,
  },
  /** 整体禁用 */
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * 只显示图标 @default false
   *
   * 仅对带 `icon` 的选项生效；文案会转入视觉隐藏层（屏幕阅读器仍可读），
   * 并自动补上 `title` 与 `aria-label`。没有图标的选项仍显示文字，
   * 避免出现空白按钮。
   */
  iconOnly: {
    type: Boolean,
    default: false,
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
} as const

export type SrSegmentedProps = ExtractPropTypes<typeof segmentedProps>
