import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

export const switchProps = {
  /** 是否开启，支持 v-model */
  modelValue: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 加载中：禁止交互并显示指示器 */
  loading: {
    type: Boolean,
    default: false,
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
  /** 开启时文字 */
  checkedText: {
    type: String,
    default: '',
  },
  /** 关闭时文字 */
  uncheckedText: {
    type: String,
    default: '',
  },
  /** 无障碍名称（无文字时建议提供） */
  label: {
    type: String,
    default: '',
  },
} as const

export type SrSwitchProps = ExtractPropTypes<typeof switchProps>
