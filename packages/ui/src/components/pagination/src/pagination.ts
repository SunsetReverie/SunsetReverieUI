import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

export const paginationProps = {
  /** 当前页，支持 v-model */
  modelValue: {
    type: Number,
    default: 1,
  },
  /** 总条数 */
  total: {
    type: Number,
    default: 0,
  },
  /** 每页条数，支持 v-model:page-size */
  pageSize: {
    type: Number,
    default: 10,
  },
  /** 每页条数可选项；传空数组则隐藏切换器 */
  pageSizeOptions: {
    type: Array as PropType<number[]>,
    default: () => [10, 20, 50],
  },
  /** 显示「共 N 条」 */
  showTotal: {
    type: Boolean,
    default: true,
  },
  /** 显示每页条数切换器 */
  showSizer: {
    type: Boolean,
    default: true,
  },
  /** 显示跳页输入框 */
  showJumper: {
    type: Boolean,
    default: false,
  },
  /** 简洁模式：只保留上一页 / 下一页 */
  simple: {
    type: Boolean,
    default: false,
  },
  /** 尺寸档位，不传则继承 SrConfigProvider */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
  /** 禁用整个分页 */
  disabled: {
    type: Boolean,
    default: false,
  },
} as const

export type SrPaginationProps = ExtractPropTypes<typeof paginationProps>
