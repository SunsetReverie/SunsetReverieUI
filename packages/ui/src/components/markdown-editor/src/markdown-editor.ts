import type { ExtractPropTypes, PropType } from 'vue'

import type { SrPlacement } from '../../../utils/floating'
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
  /**
   * 渲染模板，透传给内部 `SrMarkdown`
   *
   * 编辑时的预览必须与前台展示用同一套模板，否则写作者看到的
   * 和最终发布的不一样。
   */
  theme: {
    type: String as PropType<'plain' | 'vivid' | 'editorial' | 'glass'>,
    default: 'vivid',
  },
  /** HTML 后处理钩子，透传给内部 `SrMarkdown` */
  sanitize: {
    type: Function as PropType<(html: string) => string>,
    default: undefined,
  },
  /**
   * 预览里的代码块是否做语法着色 @default true
   *
   * 透传给 `SrMarkdown`，内置零依赖高亮器。
   */
  codeHighlight: {
    type: Boolean,
    default: true,
  },
  /**
   * 预览里的代码块是否显示行号 @default true
   *
   * 行号由 CSS 计数器画，复制时不会带上数字。
   */
  codeLineNumbers: {
    type: Boolean,
    default: true,
  },
  /**
   * 预览里的代码块是否显示复制按钮 @default true
   */
  codeCopy: {
    type: Boolean,
    default: true,
  },
  /**
   * 复制成功后是否弹一条 `srMessage` 提示 @default false
   *
   * 关闭时按钮仍会把文案切成「已复制」，只是不走全局消息。
   */
  codeCopyNotify: {
    type: Boolean,
    default: false,
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
  /**
   * 工具栏按钮的功能提示 @default true
   *
   * 鼠标移入或键盘 focus 时显示气泡。关掉后退回原生 `title`——
   * 不会让按钮完全失去说明。
   */
  tooltips: {
    type: Boolean,
    default: true,
  },
  /**
   * 提示配色 @default 'auto'
   *
   * - `auto`：跟随明暗主题——浅色主题用白玻璃，深色主题用黑玻璃
   * - `light` / `dark`：显式指定，不受主题切换影响
   *
   * 用 `auto` 时组件会观察 `data-sr-theme` 属性变化，
   * 无论是 `useSrTheme`、首帧主题脚本还是手动改属性都能跟上。
   */
  tooltipVariant: {
    type: String as PropType<'auto' | 'light' | 'dark'>,
    default: 'auto',
  },
  /** 提示方位 @default 'top' */
  tooltipPlacement: {
    type: String as PropType<SrPlacement>,
    default: 'top',
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
   * 视图切换控件的显示形式 @default 'both'
   *
   * - `text`：只有文字（旧版观感）
   * - `both`：图标 + 文字，最好认
   * - `icon`：只有图标，最省空间；文案转为 `title` 与 `aria-label`
   */
  modeToggle: {
    type: String as PropType<'text' | 'both' | 'icon'>,
    default: 'both',
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
   * 短代码插入按钮的摆放方式 @default 'inline'
   *
   * - `inline`：每个短代码一个按钮，平铺在工具栏末尾（默认，兼容旧写法）
   * - `group`：只放一个「短代码」按钮，点开下拉列出全部
   *
   * 短代码是扩展能力，跟加粗、列表这类基础格式不是一回事；数量一多，
   * 平铺会撑满工具栏、也容易和内置按钮混淆，因此推荐 `group`。
   */
  shortcodeMenu: {
    type: String as PropType<'inline' | 'group'>,
    default: 'inline',
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
