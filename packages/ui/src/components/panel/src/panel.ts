import type { ExtractPropTypes } from 'vue'

export const panelProps = {
  /** 标题 */
  title: {
    type: String,
    default: '',
  },
  /** 标题下方的说明 */
  description: {
    type: String,
    default: '',
  },
  /** 是否可折叠 */
  collapsible: {
    type: Boolean,
    default: false,
  },
  /** 展开状态，支持 v-model */
  modelValue: {
    type: Boolean,
    default: true,
  },
  /** 是否去掉内边距，交给内容自己控制 */
  flush: {
    type: Boolean,
    default: false,
  },
} as const

export type SrPanelProps = ExtractPropTypes<typeof panelProps>
