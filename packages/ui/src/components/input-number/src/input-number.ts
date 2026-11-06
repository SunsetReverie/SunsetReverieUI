import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'
import type { SrResponsive } from '../../../types/theme'

/** 校验态，与 SrInput 保持一致 */
export type SrInputNumberStatus = 'default' | 'error' | 'warning' | 'success'

/** 步进控件位置：右侧竖排 / 两侧分列 */
export type SrInputNumberControlsPosition = 'right' | 'both'

export const inputNumberProps = {
  /** 值，支持 v-model；空值为 null */
  modelValue: {
    type: Number as PropType<number | null>,
    default: null,
  },
  /** 最小值 */
  min: {
    type: Number,
    default: -Infinity,
  },
  /** 最大值 */
  max: {
    type: Number,
    default: Infinity,
  },
  /** 每次步进的增量，必须大于 0 */
  step: {
    type: Number,
    default: 1,
  },
  /**
   * 小数位精度
   * 不传时由 step 推导，例如 step=0.1 得到 1 位小数。
   * 显式传值时以它为准，并用它抹平 0.1 + 0.2 这类浮点误差。
   */
  precision: {
    type: Number as PropType<number | undefined>,
    default: undefined,
  },
  /** 尺寸，支持按断点分档；不传则继承 SrConfigProvider */
  size: {
    type: [String, Object] as PropType<SrResponsive<SrSize>>,
    default: undefined,
  },
  /** 占位文案 */
  placeholder: {
    type: String,
    default: '',
  },
  /** 禁用 */
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 只读：仍可聚焦复制，但不能改值 */
  readonly: {
    type: Boolean,
    default: false,
  },
  /** 是否显示步进按钮 */
  controls: {
    type: Boolean,
    default: true,
  },
  /** 步进按钮位置 */
  controlsPosition: {
    type: String as PropType<SrInputNumberControlsPosition>,
    default: 'right',
  },
  /** 校验态，仅影响边框与图标颜色 */
  status: {
    type: String as PropType<SrInputNumberStatus>,
    default: 'default',
  },
} as const

export type SrInputNumberProps = ExtractPropTypes<typeof inputNumberProps>

/** 各尺寸档位的步进箭头图标大小 */
export const NUMBER_ICON_SIZE: Record<SrSize, number> = {
  xs: 8,
  sm: 9,
  md: 10,
  lg: 11,
}

/**
 * 取一个数字的小数位数
 *
 * 需要处理科学计数法：1e-7 的 String 结果里没有小数点，但精度是 7。
 * @param value 数字
 * @returns 小数位数
 */
export function srNumberPrecision(value: number): number {
  const text = String(value)
  if (text.includes('e-')) {
    const [base, exponent] = text.split('e-')
    return srNumberPrecision(Number(base)) + Number(exponent)
  }
  const dot = text.indexOf('.')
  return dot < 0 ? 0 : text.length - dot - 1
}

/**
 * 钳制到 [min, max] 并按精度取整
 * @param value 原始值
 * @param min 下界
 * @param max 上界
 * @param precision 小数位
 * @returns 规范化后的值
 */
export function srClampNumber(value: number, min: number, max: number, precision: number): number {
  const clamped = Math.min(max, Math.max(min, value))
  return Number(clamped.toFixed(Math.min(Math.max(precision, 0), 100)))
}
