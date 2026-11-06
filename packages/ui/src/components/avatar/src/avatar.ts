import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 形状 */
export type SrAvatarShape = 'circle' | 'square'

export const avatarProps = {
  /** 图片地址，加载失败自动回退到文字 */
  src: {
    type: String,
    default: '',
  },
  /** 图片替代文案，同时用作回退文字的来源 */
  alt: {
    type: String,
    default: '',
  },
  /** 尺寸档位；也可直接传像素数字 */
  size: {
    type: [String, Number] as PropType<SrSize | number>,
    default: 'md',
  },
  /** 形状 @default 'circle' */
  shape: {
    type: String as PropType<SrAvatarShape>,
    default: 'circle',
  },
  /** 回退图标，优先于文字 */
  icon: {
    type: String,
    default: '',
  },
} as const

export type SrAvatarProps = ExtractPropTypes<typeof avatarProps>
