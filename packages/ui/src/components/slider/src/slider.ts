import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 滑块值：单值或区间 */
export type SrSliderValue = number | [number, number]

export const sliderProps = {
  /** 当前值，配合 v-model */
  modelValue: {
    type: [Number, Array] as PropType<SrSliderValue>,
    default: 0,
  },
  /** 最小值 @default 0 */
  min: {
    type: Number,
    default: 0,
  },
  /** 最大值 @default 100 */
  max: {
    type: Number,
    default: 100,
  },
  /**
   * 步长 @default 1
   *
   * 传 `null` 表示不吸附——拖动时取连续值，适合精度要求高的场景。
   */
  step: {
    type: Number,
    default: 1,
  },
  /** 双滑块区间模式 @default false */
  range: {
    type: Boolean,
    default: false,
  },
  /** 禁用 @default false */
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 纵向排列 @default false */
  vertical: {
    type: Boolean,
    default: false,
  },
  /** 显示间断点 @default false */
  showStops: {
    type: Boolean,
    default: false,
  },
  /**
   * 拖动时显示数值提示 @default true
   *
   * 关掉后不渲染浮层，适合放在窄容器里。
   */
  showTooltip: {
    type: Boolean,
    default: true,
  },
  /**
   * 数值格式化
   *
   * 用于给数值加单位，比如 `(v) => \`${v}°C\``。
   */
  formatTooltip: {
    type: Function as PropType<(value: number) => string>,
    default: undefined,
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
} as const

export type SrSliderProps = ExtractPropTypes<typeof sliderProps>
