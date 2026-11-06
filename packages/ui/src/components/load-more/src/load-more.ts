import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 加载更多状态 */
export type SrLoadMoreStatus = 'idle' | 'loading' | 'done'

export const loadMoreProps = {
  /**
   * 当前状态
   * - idle：还能加载，显示按钮
   * - loading：加载中
   * - done：没有更多了
   */
  status: {
    type: String as PropType<SrLoadMoreStatus>,
    default: 'idle',
  },
  /** 可加载时的按钮文案 */
  loadText: {
    type: String,
    default: '加载更多',
  },
  /** 加载中文案 */
  loadingText: {
    type: String,
    default: '加载中',
  },
  /** 到底文案 */
  doneText: {
    type: String,
    default: '没有更多了',
  },
  /**
   * 自动模式：元素进入可视区就派发 load，不需要点击
   * 配合 maxHeight 之类的滚动容器使用，效果等同于"滚动到底自动加载"
   */
  auto: {
    type: Boolean,
    default: false,
  },
  /** 自动模式的触发提前量，语法同 IntersectionObserver 的 rootMargin */
  rootMargin: {
    type: String,
    default: '0px 0px 120px 0px',
  },
  /** 尺寸档位 */
  size: {
    type: String as PropType<SrSize>,
    default: undefined,
  },
  /** 禁用点击 */
  disabled: {
    type: Boolean,
    default: false,
  },
} as const

export type SrLoadMoreProps = ExtractPropTypes<typeof loadMoreProps>
