import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/**
 * 选择模式
 *
 * - date：单个日期
 * - datetime：日期 + 时分秒
 * - daterange：日期区间
 * - datetimerange：日期区间 + 时分秒
 */
export type SrDatePickerType = 'date' | 'datetime' | 'daterange' | 'datetimerange'

/** 校验态，与 SrInput 保持一致 */
export type SrDatePickerStatus = 'default' | 'error' | 'warning' | 'success'

/** 值类型：单值为 Date，区间为 [Date, Date] */
export type SrDatePickerValue = Date | [Date, Date] | null

/** 快捷选项 */
export interface SrDatePickerShortcut {
  /** 按钮文案 */
  label: string
  /**
   * 生成值
   *
   * 用函数而不是固定值：快捷项依赖「当前时间」，在组件外计算会过时。
   */
  value: () => Date | [Date, Date]
}

export const datePickerProps = {
  /** 选中值，支持 v-model */
  modelValue: {
    type: [Date, Array] as PropType<SrDatePickerValue>,
    default: null,
  },
  /** 选择模式 @default 'date' */
  type: {
    type: String as PropType<SrDatePickerType>,
    default: 'date',
  },
  /** 最小可选日期 */
  min: {
    type: [Date, String, Number] as PropType<Date | string | number>,
    default: undefined,
  },
  /** 最大可选日期 */
  max: {
    type: [Date, String, Number] as PropType<Date | string | number>,
    default: undefined,
  },
  /** 自定义禁用规则，返回 true 表示不可选 */
  disabledDate: {
    type: Function as PropType<(date: Date) => boolean>,
    default: undefined,
  },
  /**
   * 输入框显示格式
   *
   * 不传时按 type 取默认：date 为 YYYY-MM-DD，datetime 为 YYYY-MM-DD HH:mm:ss。
   */
  format: {
    type: String,
    default: '',
  },
  /**
   * 输出格式
   *
   * 传了就按该模板输出字符串，否则输出 Date / [Date, Date]。
   */
  valueFormat: {
    type: String,
    default: '',
  },
  /** 占位文案，区间模式可传两个 */
  placeholder: {
    type: [String, Array] as PropType<string | string[]>,
    default: '',
  },
  /** 可清空 @default true */
  clearable: {
    type: Boolean,
    default: true,
  },
  /** 禁用 @default false */
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 只读：可聚焦复制，不能改值 @default false */
  readonly: {
    type: Boolean,
    default: false,
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
  /** 校验态 @default 'default' */
  status: {
    type: String as PropType<SrDatePickerStatus>,
    default: 'default',
  },
  /**
   * 快捷选项
   *
   * 不传时使用内置的「今天 / 近 7 天 / 本月」；传空数组则完全不显示。
   */
  shortcuts: {
    type: Array as PropType<SrDatePickerShortcut[]>,
    default: undefined,
  },
  /** 显示快捷区 @default true */
  showShortcuts: {
    type: Boolean,
    default: true,
  },
  /** 一周从周几开始，0 为周日 @default 1 */
  firstDayOfWeek: {
    type: Number,
    default: 1,
  },
  /** 是否可编辑输入（允许打字），默认只能通过面板选 @default false */
  editable: {
    type: Boolean,
    default: false,
  },
} as const

export type SrDatePickerProps = ExtractPropTypes<typeof datePickerProps>
