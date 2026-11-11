import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/**
 * 一个表情。
 *
 * @remarks
 * 字符表情与图片表情共用同一个结构，靠 `char` / `url` 哪个存在来区分。
 * 不额外加 `type` 字段——多一个字段就多一处可能与实际内容不一致的地方。
 */
export interface SrEmojiItem {
  /**
   * 表情名称。
   *
   * @remarks
   * **插进文本里的标记就是它**（形如 `[微笑]`），渲染时按名称反查。
   * 同一批数据里必须唯一，否则无法确定该渲染成哪一张图——
   * 重名时以先出现的为准，并在开发环境告警。
   */
  name: string
  /** 图片地址，与 `char` 二选一 */
  url?: string
  /** 字符表情内容（如 `😀`），与 `url` 二选一 */
  char?: string
}

/**
 * 一个表情包。
 *
 * @remarks 对应宿主的一个 JSON 文件，也是面板上的一个 tab。
 */
export interface SrEmojiPackage {
  /** 包标识，用于 tab 定位与「最近使用」的分组归并，应全局唯一 */
  key: string
  /** 包名称，显示在 tab 上，建议 2~4 个字 */
  name: string
  /** 包内表情 */
  emojis: SrEmojiItem[]
}

export const emojiPickerProps = {
  /**
   * 表情包列表
   *
   * 不传则使用内置的字符表情包。
   *
   * **必须与渲染端用同一份数据**——否则编辑器里插的表情在正文里查不到，
   * 会显示成一串 `[表情名]` 纯文本。
   */
  packages: {
    type: Array as unknown as PropType<SrEmojiPackage[]>,
    default: () => [],
  },
  /** 每行几个 @default 8 */
  columns: {
    type: Number,
    default: 8,
  },
  /**
   * 分类 tab 的位置 @default 'bottom'
   *
   * - `bottom`：tab 贴在面板底部
   * - `top`：tab 在顶部
   */
  tabPosition: {
    type: String as PropType<'top' | 'bottom'>,
    default: 'bottom',
  },
  /**
   * 面板宽度
   *
   * 数字按像素，字符串原样输出（`'100%'` / `'20rem'` 都行）。
   * 不传时占满父容器。
   */
  width: {
    type: [Number, String] as PropType<number | string>,
    default: undefined,
  },
  /**
   * 面板高度
   *
   * 传了就是固定高度，内容区自动填充剩余空间并内部滚动。
   * 不传时由 `minHeight` 与内容共同决定。
   */
  height: {
    type: [Number, String] as PropType<number | string>,
    default: undefined,
  },
  /**
   * 最小高度（px） @default 240
   *
   * 表情少的包不会把面板塌成一条——切换分类时高度不跳。
   */
  minHeight: {
    type: Number,
    default: 240,
  },
  /** 内容区最大高度（px） @default 260，仅在未传 `height` 时生效 */
  maxHeight: {
    type: Number,
    default: 260,
  },
  /**
   * 显示搜索框 @default false
   *
   * 搜索跨所有分类按名称过滤，命中结果显示在一个临时「搜索」视图里。
   */
  searchable: {
    type: Boolean,
    default: false,
  },
  /** 搜索框占位文案 */
  searchPlaceholder: {
    type: String,
    default: '搜索表情',
  },
  /**
   * 表情名称的提示方式 @default 'meta'
   *
   * - `meta`：顶部信息行随悬停更新，不显示气泡
   * - `tooltip`：悬停/聚焦时在表情旁弹出气泡，信息行只显示当前分类
   * - `none`：只保留 `aria-label`，不显示名称
   *
   * 三种模式互斥，避免「信息行 + 原生 title」同时出现。
   */
  tipMode: {
    type: String as PropType<'meta' | 'tooltip' | 'none'>,
    default: 'meta',
  },
  /**
   * 显示「最近使用」 @default true
   *
   * 会话级，不持久化——组件不该替宿主决定存哪。
   */
  showRecent: {
    type: Boolean,
    default: true,
  },
  /**
   * 选中后请求关闭 @default false
   *
   * 默认连选（选完面板不关，方便连着插几个表情）。
   * 打开后 `select` 之外再派发 `close`，由外层浮层决定收起。
   */
  closeOnSelect: {
    type: Boolean,
    default: false,
  },
  /** 尺寸档位 @default 'md' */
  size: {
    type: String as PropType<SrSize>,
    default: 'md',
  },
  /** 禁用 @default false */
  disabled: {
    type: Boolean,
    default: false,
  },
} as const

export type SrEmojiPickerProps = ExtractPropTypes<typeof emojiPickerProps>
