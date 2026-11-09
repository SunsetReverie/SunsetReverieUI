import type { ExtractPropTypes, PropType } from 'vue'

/** 锚点项 */
export interface SrAnchorItem {
  /** 目标元素的 id */
  key: string
  /** 显示文案 */
  title: string
  /** 自定义链接地址；默认滚动到 `key` 对应的元素，不跳转 */
  href?: string
  /** 子项 */
  children?: SrAnchorItem[]
}

export const anchorProps = {
  /** 锚点数据 */
  items: {
    type: Array as unknown as PropType<SrAnchorItem[]>,
    default: () => [],
  },
  /**
   * 滚动容器 @default window
   *
   * 传 CSS 选择器或元素本身。默认监听整个页面。
   */
  container: {
    type: [String, Object] as PropType<string | HTMLElement>,
    default: undefined,
  },
  /**
   * 顶部偏移 @default 0
   *
   * 页面有固定头栏时，把它设为头栏高度，标题才不会被盖住。
   * 判定当前章节和点击滚动都用这个值。
   */
  offsetTop: {
    type: Number,
    default: 0,
  },
  /**
   * 判定边界 @default 4
   *
   * 标题越过判定线多少像素才算「进入视口」。设小一点更灵敏，
   * 但滚动抖动时容易在两节之间反复跳。
   */
  bounds: {
    type: Number,
    default: 4,
  },
  /** 排列方向 @default 'vertical' */
  direction: {
    type: String as PropType<'vertical' | 'horizontal'>,
    default: 'vertical',
  },
  /**
   * 吸顶 @default false
   *
   * 打开后用 `position: sticky`，需要父容器有确定高度才会生效。
   */
  affix: {
    type: Boolean,
    default: false,
  },
  /** 吸顶时的 top 偏移（px） @default 0 */
  affixOffset: {
    type: Number,
    default: 0,
  },
  /**
   * 点击时平滑滚动 @default true
   *
   * 关掉后用瞬时定位，适合「用户系统开了减少动效」或需要精确控制的场景。
   */
  smooth: {
    type: Boolean,
    default: true,
  },
  /**
   * 当前激活项，配合 `v-model:activeKey` @default ''
   *
   * 不传时自己维护；传了就以外部为准。
   */
  activeKey: {
    type: String,
    default: undefined,
  },
  /**
   * 高亮滑块 @default true
   *
   * 跟随当前项移动的指示条，让「现在在哪」更明显。
   */
  showMarker: {
    type: Boolean,
    default: true,
  },
  /**
   * 同步地址栏 hash @default false
   *
   * 打开后点击会写入 `#key`，刷新或分享链接能回到同一位置。
   * 前台文章页通常要开。
   */
  syncHash: {
    type: Boolean,
    default: false,
  },
  /** 无障碍标签 @default '页面导航' */
  ariaLabel: {
    type: String,
    default: '页面导航',
  },
} as const

export type SrAnchorProps = ExtractPropTypes<typeof anchorProps>
