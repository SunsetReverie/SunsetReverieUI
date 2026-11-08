import type { ExtractPropTypes, PropType } from 'vue'

import type { SrQrLevel } from './encoder'

export const qrcodeProps = {
  /** 要编码的内容（URL、文本、Wi-Fi 配置等） */
  value: {
    type: String,
    default: '',
  },
  /**
   * 渲染尺寸（像素） @default 160
   *
   * 这是容器边长，内部用 SVG 绘制，放大不会模糊。
   */
  size: {
    type: Number,
    default: 160,
  },
  /**
   * 纠错等级 @default 'M'
   *
   * L 约 7%、M 约 15%、Q 约 25%、H 约 30% 的码字可被修复。
   * 等级越高越抗污损，但同样内容需要的版本更大。
   */
  level: {
    type: String as PropType<SrQrLevel>,
    default: 'M',
  },
  /**
   * 静区宽度（模块数） @default 2
   *
   * 规范建议 4，但小尺寸下会显得四周很空；2 在多数扫码器上够用。
   */
  margin: {
    type: Number,
    default: 2,
  },
  /** 前景色 @default '#000000' */
  color: {
    type: String,
    default: '#000000',
  },
  /** 背景色 @default '#ffffff' */
  backgroundColor: {
    type: String,
    default: '#ffffff',
  },
  /**
   * 中心图标名 @default ''
   *
   * 会盖住中间一块区域，建议同时把 `level` 提到 `H`。
   */
  icon: {
    type: String,
    default: '',
  },
  /** 图标尺寸（像素） @default 28 */
  iconSize: {
    type: Number,
    default: 28,
  },
  /**
   * 状态 @default 'active'
   *
   * `expired` 会盖一层「已失效」遮罩并停止渲染码点，`loading` 显示占位。
   */
  status: {
    type: String as PropType<'active' | 'loading' | 'expired'>,
    default: 'active',
  },
  /** 失效状态的提示文案 @default '二维码已失效' */
  expiredText: {
    type: String,
    default: '二维码已失效',
  },
} as const

export type SrQRCodeProps = ExtractPropTypes<typeof qrcodeProps>
