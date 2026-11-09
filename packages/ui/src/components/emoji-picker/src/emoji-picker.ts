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
  /**
   * 图片地址。
   *
   * @remarks 与 `char` 二选一。可为相对路径（`/emojis/a.png`）或完整 URL；
   * 存放位置完全由宿主决定，组件不关心。
   */
  url?: string
  /**
   * 字符表情内容（如 `😀`）。
   *
   * @remarks 与 `url` 二选一。两者都缺时该项被忽略。
   */
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
   * 显示「最近使用」 @default true
   *
   * 会话级，不持久化——组件不该替宿主决定存哪。
   */
  showRecent: {
    type: Boolean,
    default: true,
  },
  /** 尺寸档位 @default 'md' */
  size: {
    type: String as PropType<SrSize>,
    default: 'md',
  },
  /** 面板最大高度（px） @default 260 */
  maxHeight: {
    type: Number,
    default: 260,
  },
  /** 禁用 @default false */
  disabled: {
    type: Boolean,
    default: false,
  },
} as const

export type SrEmojiPickerProps = ExtractPropTypes<typeof emojiPickerProps>
