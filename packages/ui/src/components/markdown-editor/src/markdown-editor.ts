import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'
import type { SrMarkdownExtension } from '../../markdown/src/extensions'
import type { SrMarkdownEngine } from '../../markdown/src/markdown'
import type { SrEmojiPackage } from '../../emoji-picker/src/emoji-picker'

/** 视图模式 */
export type SrMarkdownEditorMode = 'edit' | 'split' | 'preview'

/**
 * 编辑器 API
 *
 * @remarks 自定义工具栏项、`#toolbar` 插槽、外部通过 ref 调用，拿到的都是这套方法。
 */
export interface SrMarkdownEditorApi {
  /** 插入文本；`block` 为 true 时保证前后有空行 */
  insert: (text: string, block?: boolean) => void
  /** 用前后缀包裹选区，无选区时插入占位文字并选中 */
  wrap: (before: string, after: string, placeholder?: string) => void
  /** 给选中的每一行加前缀；`ordered` 为 true 时加递增序号 */
  prefixLines: (marker: string, ordered?: boolean) => void
  /** 聚焦到编辑区 */
  focus: () => void
  /** 读取当前值 */
  getValue: () => string
  /** 写入新值 */
  setValue: (value: string) => void
}

/** 预设工具栏项 */
export type SrMarkdownToolbarPreset =
  | 'bold'
  | 'italic'
  | 'strike'
  | 'heading'
  | 'list-ul'
  | 'list-ol'
  | 'quote'
  | 'code'
  | 'code-block'
  | 'link'
  | 'image'
  | 'hr'
  | '|'

/** 自定义工具栏项 */
export interface SrMarkdownToolbarAction {
  /** 唯一标识 */
  key: string
  /** 提示文案，同时用作无障碍名称 */
  label: string
  /** 图标名，不传则只显示文字 */
  icon?: string
  /** 点击行为 */
  action: (api: SrMarkdownEditorApi) => void
  /** 禁用 */
  disabled?: boolean
}

/** 工具栏项 */
export type SrMarkdownToolbarItem = SrMarkdownToolbarPreset | SrMarkdownToolbarAction

/** 默认工具栏 */
export const SR_MARKDOWN_DEFAULT_TOOLBAR: SrMarkdownToolbarItem[] = [
  'bold',
  'italic',
  'strike',
  '|',
  'heading',
  'quote',
  'code',
  'code-block',
  '|',
  'list-ul',
  'list-ol',
  '|',
  'link',
  'image',
  'hr',
]

export const markdownEditorProps = {
  /** 文本内容（`v-model`） */
  modelValue: {
    type: String,
    default: '',
  },
  /** 渲染引擎，透传给内部 `SrMarkdown` */
  engine: {
    type: [String, Object] as PropType<SrMarkdownEngine | 'builtin'>,
    default: 'builtin',
  },
  /** 短代码扩展，透传给内部 `SrMarkdown` */
  extensions: {
    type: Array as unknown as PropType<SrMarkdownExtension[]>,
    default: () => [],
  },
  /** HTML 后处理钩子，透传给内部 `SrMarkdown` */
  sanitize: {
    type: Function as PropType<(html: string) => string>,
    default: undefined,
  },
  /** 视图模式 @default 'split' */
  mode: {
    type: String as PropType<SrMarkdownEditorMode>,
    default: 'split',
  },
  /**
   * 工具栏
   *
   * @default 默认 15 项
   *
   * 传 `false` 关闭；传数组则完全按数组渲染（预设名 + 自定义对象混用）。
   * 扩展里配了 `insert` 的会自动追加到末尾。
   */
  toolbar: {
    type: [Boolean, Array] as unknown as PropType<SrMarkdownToolbarItem[] | false>,
    default: undefined,
  },
  /** 占位提示 */
  placeholder: {
    type: String,
    default: '开始写作…',
  },
  /** 编辑区高度 @default 360 */
  height: {
    type: [Number, String] as PropType<number | string>,
    default: 360,
  },
  /** 只读 @default false */
  readonly: {
    type: Boolean,
    default: false,
  },
  /** 最大字数，0 表示不限 */
  maxLength: {
    type: Number,
    default: 0,
  },
  /** 显示字数统计 @default true */
  showCount: {
    type: Boolean,
    default: true,
  },
  /**
   * 表情包
   *
   * 传了才显示表情按钮。**必须与渲染端用同一份数据**，
   * 否则插进去的标记在正文里查不到。
   */
  emojiPackages: {
    type: Array as unknown as PropType<SrEmojiPackage[]>,
    default: () => [],
  },
  /**
   * 图片上传
   *
   * 提供后工具栏的图片按钮改为「选文件 → 调用它 → 插入返回的地址」。
   * 不提供则插入 `![](url)` 模板让用户自己贴地址。
   */
  upload: {
    type: Function as PropType<(file: File) => Promise<string>>,
    default: undefined,
  },
  /** 尺寸档位 @default 'md' */
  size: {
    type: String as PropType<SrSize>,
    default: 'md',
  },
} as const

export type SrMarkdownEditorProps = ExtractPropTypes<typeof markdownEditorProps>
