import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 级联节点的值 */
export type SrCascaderValue = string | number

/** 级联选项 */
export interface SrCascaderOption {
  /** 值 */
  value: SrCascaderValue
  /** 显示文案 */
  label: string
  /** 子节点 */
  children?: SrCascaderOption[]
  /** 禁用 */
  disabled?: boolean
}

/** 选中值的形态：单选是路径数组，多选是路径数组的数组 */
export type SrCascaderModel = SrCascaderValue[] | SrCascaderValue[][]

export const cascaderProps = {
  /**
   * 选中值，配合 v-model
   *
   * 单选时是**路径数组**（从根到叶子），多选时是路径数组的数组。
   */
  modelValue: {
    type: Array as PropType<SrCascaderModel>,
    default: () => [],
  },
  /** 级联数据 */
  options: {
    type: Array as PropType<SrCascaderOption[]>,
    default: () => [],
  },
  /** 多选 @default false */
  multiple: {
    type: Boolean,
    default: false,
  },
  /** 可搜索 @default false */
  filterable: {
    type: Boolean,
    default: false,
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
  /** 占位文案 @default '请选择' */
  placeholder: {
    type: String,
    default: '请选择',
  },
  /**
   * 层级分隔符 @default ' / '
   *
   * 显示选中路径时用它连接各级标签。
   */
  separator: {
    type: String,
    default: ' / ',
  },
  /**
   * 显示完整路径 @default true
   *
   * 关掉后只显示最后一级，触发器更省空间但看不出层级。
   */
  showAllLevels: {
    type: Boolean,
    default: true,
  },
  /**
   * 展开方式 @default 'click'
   *
   * `hover` 在鼠标移入时就展开下一级，适合层级浅的数据。
   */
  expandTrigger: {
    type: String as PropType<'click' | 'hover'>,
    default: 'click',
  },
  /** 面板最大高度 @default 280 */
  maxHeight: {
    type: Number,
    default: 280,
  },
  /** 空状态文案 @default '暂无数据' */
  emptyText: {
    type: String,
    default: '暂无数据',
  },
  /** 校验态 */
  status: {
    type: String as PropType<'error' | 'warning'>,
    default: undefined,
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
} as const

export type SrCascaderProps = ExtractPropTypes<typeof cascaderProps>
