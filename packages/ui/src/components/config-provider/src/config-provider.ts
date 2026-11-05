import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

export const configProviderProps = {
  /**
   * 子组件的默认尺寸
   * 不传则沿用上层配置，最外层未配置时用 md
   */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
  /**
   * 弹层层级基数
   * Modal / Dropdown 等在其之上叠加
   */
  zIndex: {
    type: Number,
    default: undefined,
  },
} as const

export type SrConfigProviderProps = ExtractPropTypes<typeof configProviderProps>
