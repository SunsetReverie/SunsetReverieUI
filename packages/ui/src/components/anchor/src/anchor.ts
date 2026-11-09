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

/** `#title` 插槽的作用域 */
export interface SrAnchorTitleScope {
  /** 当前项数据 */
  item: SrAnchorItem
  /** 层级，0 是顶层 */
  depth: number
  /** 同层内序号，从 1 开始 */
  index: number
  /** 是否在当前路径上（含祖先） */
  active: boolean
  /** 是否是当前项本身 */
  current: boolean
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
  /**
   * 激活项样式 @default 'line'
   *
   * - `line` 左侧竖线 + 文字加深（默认，最干净）
   * - `block` 底色块 + 主色文字
   * - `pill` 圆角胶囊
   * - `dot` 左侧小圆点
   * - `bold` 只变粗变色，连竖线都不要
   */
  activeVariant: {
    type: String as PropType<'line' | 'block' | 'pill' | 'dot' | 'bold'>,
    default: 'line',
  },
  /**
   * 父级可折叠 @default false
   *
   * 打开后每一项前面出现箭头，点击箭头折叠子级、点击文字仍跳转。
   */
  collapsible: {
    type: Boolean,
    default: false,
  },
  /**
   * 显示折叠箭头 @default true
   *
   * 关掉后仍然可以折叠，只是没有箭头——用 `v-model:expanded-keys` 控制。
   * 有些设计里目录本身就很窄，箭头会显得多余。
   */
  showToggle: {
    type: Boolean,
    default: true,
  },
  /**
   * 箭头位置 @default 'left'
   *
   * `right` 时箭头靠右，标题从左侧对齐，视觉更接近「文档目录」。
   */
  togglePosition: {
    type: String as PropType<'left' | 'right'>,
    default: 'left',
  },
  /**
   * 默认全部展开 @default true
   *
   * 只在 `collapsible` 打开、且 `autoExpand` 关闭时有意义：
   * 开了自动跟随的话，展开状态由当前章节决定。
   */
  defaultExpandAll: {
    type: Boolean,
    default: true,
  },
  /**
   * 子项激活时自动展开父级 @default true
   *
   * 滚动到某个子章节时，它所在的父级会自动展开，不用手动点。
   */
  autoExpand: {
    type: Boolean,
    default: true,
  },
  /**
   * 展开的父级 key（受控）
   *
   * 传了就以外部为准；配合 `v-model:expanded-keys`。
   */
  expandedKeys: {
    type: Array as unknown as PropType<string[]>,
    default: undefined,
  },
  /**
   * 最多显示的层级 @default 0
   *
   * 0 表示不限。设为 2 时只渲染前两层，更深的子级不出现。
   */
  maxDepth: {
    type: Number,
    default: 0,
  },
} as const

export type SrAnchorProps = ExtractPropTypes<typeof anchorProps>
