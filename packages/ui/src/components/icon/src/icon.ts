import type { ExtractPropTypes, PropType } from 'vue'

/** 翻转方向 */
export type SrIconFlip = boolean | 'horizontal' | 'vertical' | 'both'

export const iconProps = {
  /**
   * 图标名，格式「集合:图标名」，如 'mdi:home'
   * 使用 default 插槽自定义渲染时可省略
   */
  name: {
    type: String,
    default: '',
  },
  /** 尺寸：数字按 px 处理，字符串原样透传（'1em' / '1.5rem'） */
  size: {
    type: [Number, String] as PropType<number | string>,
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
