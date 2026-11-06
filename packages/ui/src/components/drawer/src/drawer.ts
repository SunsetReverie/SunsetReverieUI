import type { ExtractPropTypes, PropType } from 'vue'

/** 抽屉方向 */
export type SrDrawerPlacement = 'left' | 'right' | 'top' | 'bottom'

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
  /** 尺寸：左右方向为宽度、上下方向为高度；数字按 px */
  size: {
    type: [String, Number] as PropType<string | number>,
    default: '',
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
