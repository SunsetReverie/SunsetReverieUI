import type { ExtractPropTypes, PropType } from 'vue'

/** 抽屉方向 */
export type SrDrawerPlacement = 'left' | 'right' | 'top' | 'bottom'

/** 尺寸预设或自定义值 */
export type SrDrawerSize = 'sm' | 'md' | 'lg' | string | number

/** 尺寸预设对应的像素值 */
export const DRAWER_SIZE_PRESET: Record<string, number> = {
  sm: 320,
  md: 440,
  lg: 600,
}

/** 关闭原因 */
export type SrDrawerCloseReason = 'close' | 'mask' | 'esc'

export const drawerProps = {
  /** 是否打开，支持 v-model */
  modelValue: {
    type: Boolean,
    default: false,
  },
  /** 滑出方向 @default 'right' */
  placement: {
    type: String as PropType<SrDrawerPlacement>,
    default: 'right',
  },
  /**
   * 尺寸：左右方向为宽度、上下方向为高度。
   * 可传 sm / md / lg 预设，也可传任意 CSS 值或数字（按 px）
   */
  size: {
    type: [String, Number] as PropType<SrDrawerSize>,
    default: '',
  },
  /** 层级，需要盖在其它浮层之上时调大 */
  zIndex: {
    type: Number,
    default: undefined,
  },
  /** 标题，留空则不渲染头部 */
  title: {
    type: String,
    default: '',
  },
  /** 显示右上角关闭按钮 */
  closable: {
    type: Boolean,
    default: true,
  },
  /** 点击遮罩关闭 */
  maskClosable: {
    type: Boolean,
    default: true,
  },
  /** 按 Esc 关闭 */
  escToClose: {
    type: Boolean,
    default: true,
  },
  /**
   * 内嵌形态：不贴视口边缘，四周留出间距、四角圆角。
   * 玻璃质感在这种形态下才看得出来
   */
  inset: {
    type: Boolean,
    default: false,
  },
  /** 显示遮罩 */
  mask: {
    type: Boolean,
    default: true,
  },
  /** 打开时锁定页面滚动 */
  lockScroll: {
    type: Boolean,
    default: true,
  },
} as const

export type SrDrawerProps = ExtractPropTypes<typeof drawerProps>
