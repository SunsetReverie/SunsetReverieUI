import type { ExtractPropTypes, PropType } from 'vue'

/** 内置过渡名，对应 styles/base/transitions.less 中的类名前缀 */
export type SrTransitionName = 'fade' | 'fade-up' | 'zoom' | 'list' | 'collapse'

export const transitionProps = {
  /** 过渡名 */
  name: {
    type: String as PropType<SrTransitionName>,
    default: 'fade',
  },
  /**
   * 是否启用动画
   * false 时直接切换（仍走 Vue 的 Transition 流程，不产生过渡帧）
   */
  enabled: {
    type: Boolean,
    default: true,
  },
  /** 首次渲染是否也播放 */
  appear: {
    type: Boolean,
    default: false,
  },
  /**
   * 进出场模式
   * 默认（不传）表示进出同时进行
   */
  mode: {
    type: String as PropType<'in-out' | 'out-in'>,
    default: undefined,
  },
} as const

export type SrTransitionProps = ExtractPropTypes<typeof transitionProps>
