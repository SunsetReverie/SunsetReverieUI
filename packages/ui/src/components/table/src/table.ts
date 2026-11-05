import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 行数据（任意字段） */
export type SrTableRow = Record<string, unknown>

/** 行键 */
export type SrTableRowKey = string | number

/** 排序方向 */
export type SrTableSortOrder = 'asc' | 'desc'

/** 列配置 */
export interface SrTableColumn {
  /** 字段名，同时作为默认插槽名 `#cell-<key>` */
  key: string
  /** 表头文案 */
  title: string
  /** 列宽，数字按 px */
  width?: number | string
  /** 最小宽度 */
  minWidth?: number | string
  /** 对齐 @default 'left' */
  align?: 'left' | 'center' | 'right'
  /** 是否可排序 */
  sortable?: boolean
  /** 内容超长时省略（单行 + 省略号） */
  ellipsis?: boolean
  /** 自定义插槽名，默认取 key */
  slot?: string
  /**
   * 单元格文本格式化
   * 只在没有对应插槽时生效
   */
  formatter?: (row: SrTableRow, index: number, column: SrTableColumn) => string
}

/** 排序变更载荷 */
export interface SrTableSortPayload {
  /** 排序字段，取消排序时为空 */
  key: string
  /** 排序方向，取消排序时为 null */
  order: SrTableSortOrder | null
}

export const tableProps = {
  /** 行数据 */
  data: {
    type: Array as PropType<SrTableRow[]>,
    default: () => [],
  },
  /** 列配置 */
  columns: {
    type: Array as PropType<SrTableColumn[]>,
    default: () => [],
  },
  /**
   * 行键字段名，或自定义取值函数
   * 用于 v-model:selected-keys 与展开态的行标识
   */
  rowKey: {
    type: [String, Function] as PropType<string | ((row: SrTableRow, index: number) => SrTableRowKey)>,
    default: 'id',
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
  /** 显示竖线与外框 */
  bordered: {
    type: Boolean,
    default: false,
  },
  /** 斑马纹 */
  stripe: {
    type: Boolean,
    default: false,
  },
  /** 悬停高亮 @default true */
  hoverable: {
    type: Boolean,
    default: true,
  },
  /**
   * 滚动区域最大高度
   * 设置后表头自动吸顶
   */
  maxHeight: {
    type: [Number, String] as PropType<number | string>,
    default: undefined,
  },
  /** 加载中 */
  loading: {
    type: Boolean,
    default: false,
  },
  /** 空数据文案 */
  emptyText: {
    type: String,
    default: '暂无数据',
  },
  /** 显示多选列 */
  selectable: {
    type: Boolean,
    default: false,
  },
  /** 已选行的 key 集合，支持 v-model:selected-keys */
  selectedKeys: {
    type: Array as PropType<SrTableRowKey[]>,
    default: () => [],
  },
  /** 显示展开列 */
  expandable: {
    type: Boolean,
    default: false,
  },
  /** 展开行的 key 集合 */
  expandedKeys: {
    type: Array as PropType<SrTableRowKey[]>,
    default: () => [],
  },
  /**
   * 窄屏（xs）自动切换为卡片视图
   *
   * 注意：切换发生在客户端挂载之后 —— 断点内核在客户端 setup 阶段就会读到真实宽度，
   * 若直接用它决定结构，SSR（固定 md）与客户端首帧会不一致，触发水合告警。
   */
  responsive: {
    type: Boolean,
    default: false,
  },
  /**
   * 排序模式
   * - client：本地对 data 排序
   * - server：只派发 sort-change，由调用方换数据
   */
  sortMode: {
    type: String as PropType<'client' | 'server'>,
    default: 'client',
  },
  /** 默认排序 */
  defaultSort: {
    type: Object as PropType<SrTableSortPayload | undefined>,
    default: undefined,
  },
  /** 表格布局 */
  tableLayout: {
    type: String as PropType<'auto' | 'fixed'>,
    default: 'auto',
  },
} as const

export type SrTableProps = ExtractPropTypes<typeof tableProps>

/** 各尺寸的行高与字号 */
export const TABLE_SIZE_MAP: Record<SrSize, { cellPaddingY: number; fontSize: number }> = {
  xs: { cellPaddingY: 6, fontSize: 12 },
  sm: { cellPaddingY: 8, fontSize: 13 },
  md: { cellPaddingY: 10, fontSize: 14 },
  lg: { cellPaddingY: 12, fontSize: 16 },
}
