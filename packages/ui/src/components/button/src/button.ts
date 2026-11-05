import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'
import type { SrResponsive } from '../../../types/theme'

/** 视觉变体 */
export type SrButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger'

/** 原生 type 属性（避免与组件的 type 语义冲突，改名 htmlType） */
export type SrButtonHtmlType = 'button' | 'submit' | 'reset'

/** 图标位置 */
export type SrButtonIconPosition = 'left' | 'right'

export const buttonProps = {
  /** 视觉变体 */
  variant: {
    type: String as PropType<SrButtonVariant>,
    default: 'secondary',
  },
  /**
   * 尺寸，支持按断点分档
   * 不传则继承 SrConfigProvider 的 size，最外层未配置时为 md
   */
  size: {
    type: [String, Object] as PropType<SrResponsive<SrSize>>,
    default: undefined,
  },
  /** 禁用 */
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 加载中：禁用交互但保留 DOM，避免布局跳动 */
  loading: {
    type: Boolean,
    default: false,
  },
  /** 占满父容器宽度 */
  block: {
    type: Boolean,
    default: false,
  },
  /** 胶囊圆角 */
  round: {
    type: Boolean,
    default: false,
  },
  /** 原生 type */
  htmlType: {
    type: String as PropType<SrButtonHtmlType>,
    default: 'button',
  },
  /** 图标名（集合:图标名），也可用 icon 插槽自定义 */
  icon: {
    type: String,
    default: '',
  },
  /** 图标位置 */
  iconPosition: {
    type: String as PropType<SrButtonIconPosition>,
    default: 'left',
  },
} as const

export type SrButtonProps = ExtractPropTypes<typeof buttonProps>

/** 各尺寸的度量值（L3 组件级 token 的取值来源） */
export const BUTTON_SIZE_MAP: Record<
  SrSize,
  { height: number; paddingX: number; fontSize: number; gap: number; iconSize: number }
> = {
  xs: { height: 24, paddingX: 8, fontSize: 12, gap: 4, iconSize: 12 },
  sm: { height: 28, paddingX: 10, fontSize: 13, gap: 4, iconSize: 14 },
  md: { height: 36, paddingX: 16, fontSize: 14, gap: 6, iconSize: 16 },
  lg: { height: 44, paddingX: 20, fontSize: 16, gap: 8, iconSize: 18 },
}
