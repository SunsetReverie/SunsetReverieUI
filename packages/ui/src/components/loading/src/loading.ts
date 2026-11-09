import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

export const loadingProps = {
  /**
   * 是否显示 @default true
   *
   * 包裹内容时通常绑一个变量；单独用时不用传。
   */
  loading: {
    type: Boolean,
    default: true,
  },
  /** 提示文案 */
  text: {
    type: String,
    default: '',
  },
  /**
   * 全屏模式 @default false
   *
   * 打开后固定定位覆盖整个视口，同时锁定页面滚动。
   */
  fullscreen: {
    type: Boolean,
    default: false,
  },
  /**
   * 显示遮罩 @default true
   *
   * 关掉后只有转圈，背景内容可以继续操作。
   */
  mask: {
    type: Boolean,
    default: true,
  },
  /**
   * 延迟显示（毫秒） @default 0
   *
   * 接口很快返回时不必闪一下 loading；设成 200 可以让快请求完全不闪。
   */
  delay: {
    type: Number,
    default: 0,
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
  /**
   * 动画样式 @default 'ring'
   *
   * 与 `SrSpinner` 的 `variant` 一致：ring / dots / pulse / bars / orbit / gradient。
   */
  variant: {
    type: String as PropType<'ring' | 'dots' | 'pulse' | 'bars' | 'orbit' | 'gradient'>,
    default: 'ring',
  },
} as const

export type SrLoadingProps = ExtractPropTypes<typeof loadingProps>
