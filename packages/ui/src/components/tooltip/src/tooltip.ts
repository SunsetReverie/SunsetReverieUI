import type { ExtractPropTypes, PropType } from 'vue'

import type { SrPlacement } from '../../../utils/floating'

export const tooltipProps = {
  /** 文本内容，也可用 content 插槽 */
  content: {
    type: String,
    default: '',
  },
  /** 期望方位（空间不足时自动翻转） */
  placement: {
    type: String as PropType<SrPlacement>,
    default: 'top',
  },
  /** 显示延迟（ms） */
  showDelay: {
    type: Number,
    default: 120,
  },
  /** 隐藏延迟（ms），留一点缓冲避免鼠标划过缝隙时闪烁 */
  hideDelay: {
    type: Number,
    default: 80,
  },
  /** 与触发元素的间距（px） */
  offset: {
    type: Number,
    default: 8,
  },
  /** 是否显示小三角 */
  arrow: {
    type: Boolean,
    default: true,
  },
  /** 最大宽度（px） */
  maxWidth: {
    type: Number,
    default: 280,
  },
  /** 禁用后不响应任何交互 */
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 点击触发元素时是否关闭（配合 click 场景） */
  closeOnClick: {
    type: Boolean,
    default: true,
  },
  /** 挂载目标 */
  teleportTo: {
    type: [String, Object] as PropType<string | HTMLElement>,
    default: 'body',
  },
} as const

export type SrTooltipProps = ExtractPropTypes<typeof tooltipProps>
