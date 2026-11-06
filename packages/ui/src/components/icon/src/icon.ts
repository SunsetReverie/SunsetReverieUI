import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/**
 * 尺寸档位 → 像素值
 * 与 SrButton 内图标的尺寸保持一致，保证同一档位在两处视觉相同
 */
export const ICON_SIZE_MAP: Record<SrSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
}

/** 翻转方向 */
export type SrIconFlip = boolean | 'horizontal' | 'vertical' | 'both'

export const iconProps = {
  /**
   * 图标名，格式「集合:图标名」，如 'lucide:house'
   * 使用 default 插槽自定义渲染时可省略
   */
  name: {
    type: String,
    default: '',
  },
  /**
   * 尺寸，三种形态：
   * 1. 档位关键字 `xs | sm | md | lg` —— 与 SrButton 等组件的 size 语义一致
   * 2. 数字 —— 按 px 处理
   * 3. 带单位字符串 —— 原样透传（'1em' / '1.5rem' / '24px'）
   * @default '1em'
   */
  size: {
    type: [Number, String] as PropType<number | string | SrSize>,
    default: '1em',
  },
  /** 颜色，默认跟随父级 currentColor */
  color: {
    type: String,
    default: 'currentColor',
  },
  /** 翻转：true 等价于 horizontal */
  flip: {
    type: [Boolean, String] as PropType<SrIconFlip>,
    default: false,
  },
  /** 旋转角度（deg），如 90 / 180 */
  rotate: {
    type: [Number, String] as PropType<number | string>,
    default: 0,
  },
  /** 是否匀速旋转（loading 场景） */
  spin: {
    type: Boolean,
    default: false,
  },
  /**
   * 无障碍标签
   * 不传视为装饰性图标，自动加 aria-hidden
   */
  label: {
    type: String,
    default: '',
  },
} as const

export type SrIconProps = ExtractPropTypes<typeof iconProps>
