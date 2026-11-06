import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

export const emptyProps = {
  /** 描述文案 @default '暂无数据' */
  description: {
    type: String,
    default: '暂无数据',
  },
  /** 图标名，传空字符串则不显示图标 */
  icon: {
    type: String,
    default: 'lucide:inbox',
  },
  /** 尺寸档位 @default 'md' */
  size: {
    type: String as PropType<SrSize>,
    default: 'md',
  },
} as const

export type SrEmptyProps = ExtractPropTypes<typeof emptyProps>
