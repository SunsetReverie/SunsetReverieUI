import type { ExtractPropTypes, PropType } from 'vue'

/** 列表项标识 */
export type SrVirtualKey = string | number

export const virtualListProps = {
  /** 数据源 */
  items: {
    type: Array as PropType<unknown[]>,
    default: () => [],
  },
  /**
   * 每项固定高度（像素）
   *
   * 必须是固定值。不定高需要边渲染边测量，会带来位置回跳，
   * 属于另一套实现（动态虚拟滚动）。
   */
  itemHeight: {
    type: Number,
    required: true,
  },
  /** 可视区高度（像素） */
  height: {
    type: Number,
    required: true,
  },
  /**
   * 上下额外渲染的项数 @default 3
   *
   * 留一点缓冲，快速滚动时不会露出空白。
   */
  buffer: {
    type: Number,
    default: 3,
  },
  /**
   * 取每一项的 key
   *
   * 不传就用下标。**列表会增删时建议传**，否则复用逻辑会错位。
   */
  itemKey: {
    type: Function as PropType<(item: unknown, index: number) => SrVirtualKey>,
    default: undefined,
  },
} as const

export type SrVirtualListProps = ExtractPropTypes<typeof virtualListProps>
