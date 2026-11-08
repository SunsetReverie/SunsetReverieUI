import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 输出格式 */
export type SrColorFormat = 'hex' | 'rgb' | 'hsl'

export const colorPickerProps = {
  /**
   * 颜色值，配合 v-model
   *
   * 接受 hex / rgb() / hsl() 三种输入，输出格式由 `format` 决定。
   */
  modelValue: {
    type: String,
    default: '',
  },
  /** 输出格式 @default 'hex' */
  format: {
    type: String as PropType<SrColorFormat>,
    default: 'hex',
  },
  /**
   * 显示透明度 @default false
   *
   * 打开后会多一条透明度滑条，输出值带 alpha（hex 为 8 位）。
   */
  showAlpha: {
    type: Boolean,
    default: false,
  },
  /** 预设色板，点一下直接选中 */
  presets: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  /** 可清空 @default false */
  clearable: {
    type: Boolean,
    default: false,
  },
  /** 禁用 @default false */
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 占位文案 @default '请选择颜色' */
  placeholder: {
    type: String,
    default: '请选择颜色',
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
} as const

export type SrColorPickerProps = ExtractPropTypes<typeof colorPickerProps>
