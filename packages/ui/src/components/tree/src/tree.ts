import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'
import type { SrTreeKey, SrTreeNode } from './tree-utils'

export const treeProps = {
  /** 树数据 */
  data: {
    type: Array as PropType<SrTreeNode[]>,
    default: () => [],
  },
  /** 选中的 key，配合 v-model */
  modelValue: {
    type: Array as PropType<SrTreeKey[]>,
    default: () => [],
  },
  /** 展开的 key，配合 v-model:expanded-keys */
  expandedKeys: {
    type: Array as PropType<SrTreeKey[]>,
    default: undefined,
  },
  /** 默认展开的 key（非受控时生效） */
  defaultExpandedKeys: {
    type: Array as PropType<SrTreeKey[]>,
    default: () => [],
  },
  /** 默认展开全部 @default false */
  defaultExpandAll: {
    type: Boolean,
    default: false,
  },
  /** 显示复选框 @default false */
  checkable: {
    type: Boolean,
    default: false,
  },
  /**
   * 父子勾选不联动 @default false
   *
   * 默认联动：勾父带子、子全选则父自动选中。
   * 开启后每个节点独立，只影响自己。
   */
  checkStrictly: {
    type: Boolean,
    default: false,
  },
  /** 允许多选 @default true */
  multiple: {
    type: Boolean,
    default: true,
  },
  /** 点击节点文字即可选中 @default true */
  selectable: {
    type: Boolean,
    default: true,
  },
  /** 点击整行都能切换展开 @default false */
  expandOnClickNode: {
    type: Boolean,
    default: false,
  },
  /** 禁用整棵树 @default false */
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 显示层级连接线 @default false */
  showLine: {
    type: Boolean,
    default: false,
  },
  /** 每层缩进（px）@default 18 */
  indent: {
    type: Number,
    default: 18,
  },
  /** 空数据文案 @default '暂无数据' */
  emptyText: {
    type: String,
    default: '暂无数据',
  },
  /**
   * 开启虚拟滚动 @default false
   *
   * 数据量大（几千行以上）时必开，否则一次性渲染全部行会明显卡顿。
   */
  virtual: {
    type: Boolean,
    default: false,
  },
  /** 虚拟滚动容器高度（px）@default 320 */
  height: {
    type: Number,
    default: 320,
  },
  /** 行高（px），虚拟滚动按它算可视区 @default 32 */
  itemHeight: {
    type: Number,
    default: 32,
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
} as const

export type SrTreeProps = ExtractPropTypes<typeof treeProps>
