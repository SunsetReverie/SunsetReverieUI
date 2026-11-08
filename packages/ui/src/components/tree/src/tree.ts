import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'
import type { SrTreeDropType, SrTreeKey, SrTreeNode } from './tree-utils'

export const treeProps = {
  /** 树数据 */
  data: {
    type: Array as PropType<SrTreeNode[]>,
    default: () => [],
  },
  /**
   * 选中的 key，配合 v-model
   *
   * 不传就是非受控：组件自己维护勾选状态，点击依然有效。
   * 只支持受控的话，「checkable 但忘了绑 v-model」会变成点了没反应。
   */
  modelValue: {
    type: Array as PropType<SrTreeKey[]>,
    default: undefined,
  },
  /** 非受控时的初始勾选 */
  defaultCheckedKeys: {
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
  /** 开启键盘导航 @default true */
  keyboard: {
    type: Boolean,
    default: true,
  },
  /**
   * 允许拖拽节点调整位置 @default false
   *
   * 用 Pointer Events 实现，不依赖 sortablejs。
   */
  draggable: {
    type: Boolean,
    default: false,
  },
  /** 判断某个节点能否拖放，返回 false 会拒绝 */
  allowDrop: {
    type: Function as PropType<(dragNode: SrTreeNode, dropNode: SrTreeNode, type: SrTreeDropType) => boolean>,
    default: undefined,
  },
  /**
   * 异步加载子节点
   *
   * 节点没有 children 且未加载过时，展开会先调用它。
   * 返回的数组会作为该节点的 children。
   */
  loadData: {
    type: Function as PropType<(node: SrTreeNode) => Promise<SrTreeNode[]>>,
    default: undefined,
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
} as const

export type SrTreeProps = ExtractPropTypes<typeof treeProps>
