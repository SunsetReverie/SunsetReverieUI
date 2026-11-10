import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'
import type { SrEmojiItem, SrEmojiPackage } from '../../emoji-picker/src/emoji-picker'
import { buildEmojiMap, parseEmojiText } from '../../emoji-picker/src/parse'

/** 校验态 */
export type SrTextareaStatus = 'default' | 'error' | 'warning' | 'success'

/** 背景内容的落点：九宫格 */
export type SrTextareaBackgroundPosition =
  'top-left' | 'top' | 'top-right' | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right'

/**
 * 九宫格到 CSS 的映射
 *
 * @remarks 背景图用 `background-position`，背景文字用 flex 对齐——
 * 两者共用同一份配置，语义保持一致。
 */
export const BG_POSITION_MAP: Record<
  SrTextareaBackgroundPosition,
  { image: string; align: string; justify: string }
> = {
  'top-left': { image: 'left top', align: 'flex-start', justify: 'flex-start' },
  top: { image: 'center top', align: 'flex-start', justify: 'center' },
  'top-right': { image: 'right top', align: 'flex-start', justify: 'flex-end' },
  left: { image: 'left center', align: 'center', justify: 'flex-start' },
  center: { image: 'center center', align: 'center', justify: 'center' },
  right: { image: 'right center', align: 'center', justify: 'flex-end' },
  'bottom-left': { image: 'left bottom', align: 'flex-end', justify: 'flex-start' },
  bottom: { image: 'center bottom', align: 'flex-end', justify: 'center' },
  'bottom-right': { image: 'right bottom', align: 'flex-end', justify: 'flex-end' },
}

/**
 * 富文本编辑器里的表情节点标记。
 *
 * @remarks 用 `data-mark` 存回原始标记（`[微笑]`），序列化时直接取这个属性。
 * 字符表情也必须包一层——否则文本节点里只剩 `🙂`，无法还原成标记。
 */
export const SR_EMOJI_MARK_ATTR = 'data-mark'

export const textareaProps = {
  /**
   * 内容，`v-model`
   *
   * @remarks 富文本模式下收发的是**标记文本**（`你好[微笑]`），
   * 不是渲染后的 HTML。这样存库、传输、反渲染都简单。
   */
  modelValue: {
    type: String,
    default: '',
  },
  /** 占位文案 */
  placeholder: {
    type: String,
    default: '',
  },
  /** 初始行数 @default 3 */
  rows: {
    type: Number,
    default: 3,
  },
  /**
   * 高度跟随内容 @default true
   *
   * 达到 `maxRows` 后停止长高，改为内部滚动。
   */
  autosize: {
    type: Boolean,
    default: true,
  },
  /**
   * 自动增高的上限行数 @default 0
   *
   * 0 表示不限制。只对 `autosize` 生效。
   */
  maxRows: {
    type: Number,
    default: 0,
  },
  /** 最大长度，同时用于字数统计 */
  maxlength: {
    type: Number,
    default: undefined,
  },
  /** 显示字数统计（给了 `maxlength` 才有「/n」） */
  showCount: {
    type: Boolean,
    default: false,
  },
  /** 尺寸档位 @default 'md' */
  size: {
    type: String as PropType<SrSize>,
    default: 'md',
  },
  /** 禁用 */
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 只读 */
  readonly: {
    type: Boolean,
    default: false,
  },
  /** 校验态，只影响边框颜色 @default 'default' */
  status: {
    type: String as PropType<SrTextareaStatus>,
    default: 'default',
  },
  /**
   * 允许用户纵向拖拽调整高度 @default 'none'
   *
   * `maxRows` 生效时不建议再开，两种高度来源会打架。
   */
  resize: {
    type: String as PropType<'none' | 'vertical'>,
    default: 'none',
  },
  /**
   * 背景图
   *
   * 支持三种写法：`url(...)` 片段、`linear-gradient(...)` 这类渐变函数、
   * 以及裸地址（内部会包成 `url()`）。只放行 http(s)、data:image 与相对路径。
   */
  backgroundImage: {
    type: String,
    default: '',
  },
  /**
   * 背景内容的落点 @default 'center'
   *
   * 同时作用于背景图与背景文字：九宫格任选其一。
   */
  backgroundPosition: {
    type: String as PropType<SrTextareaBackgroundPosition>,
    default: 'center',
  },
  /**
   * 背景图尺寸 @default 'cover'
   *
   * 也接受任意 CSS 值（如 `'120px 80px'`、`'contain'`）。
   */
  backgroundSize: {
    type: String,
    default: 'cover',
  },
  /**
   * 背景文字（水印）
   *
   * 绝对定位在内容下层，`pointer-events: none`，不参与编辑与选中。
   */
  backgroundText: {
    type: String,
    default: '',
  },
  /** 背景文字字号（px） @default 0 表示跟随组件字号（2.8em） */
  backgroundTextSize: {
    type: Number,
    default: 0,
  },
  /** 背景文字不透明度 @default 0.06 */
  backgroundTextOpacity: {
    type: Number,
    default: 0.06,
  },
  /**
   * 表情包
   *
   * 传了才启用富文本模式：输入区变成 `contenteditable`，
   * 表情按 `char` / `url` 内联渲染，`v-model` 仍然是标记文本。
   * 不传则走原生 `textarea`，行为与普通输入框一致。
   */
  emojiPackages: {
    type: Array as unknown as PropType<SrEmojiPackage[]>,
    default: () => [],
  },
  /**
   * `Enter` 直接提交 @default false
   *
   * 开启后 `Enter` 触发 `submit` 事件，`Shift + Enter` 换行；
   * 关闭时 `Enter` 就是换行。输入法组合中的回车不会误触发。
   */
  submitOnEnter: {
    type: Boolean,
    default: false,
  },
} as const

export type SrTextareaProps = ExtractPropTypes<typeof textareaProps>

/** 各尺寸的度量值 */
export const TEXTAREA_SIZE_MAP: Record<
  SrSize,
  { paddingX: number; paddingY: number; fontSize: number; lineHeight: number }
> = {
  xs: { paddingX: 8, paddingY: 6, fontSize: 12, lineHeight: 1.6 },
  sm: { paddingX: 10, paddingY: 8, fontSize: 13, lineHeight: 1.6 },
  md: { paddingX: 12, paddingY: 10, fontSize: 14, lineHeight: 1.7 },
  lg: { paddingX: 14, paddingY: 12, fontSize: 16, lineHeight: 1.7 },
}

/** 允许作为背景图的安全地址 */
const SAFE_BG_URL = /^(https?:\/\/|\/\/|\/|\.{0,2}\/|data:image\/)/i

/**
 * 把背景配置规整成可用的 `background-image` 值
 *
 * @param value 用户传入的地址或渐变函数
 * @returns CSS 值，空串表示不设置
 *
 * @remarks 已经是 `url(...)` / `linear-gradient(...)` 这类函数写法时原样返回；
 * 裸地址先校验协议再包 `url()`，避免 `javascript:` 之类混进样式。
 */
export function srNormalizeBackgroundImage(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  if (/^(url|linear-gradient|radial-gradient|conic-gradient|repeating-)/i.test(trimmed)) {
    return trimmed
  }

  if (!SAFE_BG_URL.test(trimmed)) return ''

  return `url("${trimmed.replace(/"/g, '%22')}")`
}

/**
 * 序列化富文本内容
 *
 * @param root 编辑容器（或任意节点）
 * @returns 标记文本
 *
 * @remarks
 * 规则：文本节点原样取，`data-mark` 节点取回标记，`br` 与块级元素算换行。
 * 末尾多出的一个换行会被去掉——浏览器回车常留下一个空的块级节点，
 * 不去掉的话内容会莫名多一行。
 */
export function srSerializeRich(root: Node): string {
  /**
   * 递归收集
   * @param node 当前节点
   * @returns 文本片段
   */
  const walk = (node: Node): string => {
    // contenteditable 里的空格常被写成 &nbsp;，存库前统一换成普通空格，
    // 否则后端拿到的是 \u00A0，搜索、截断都会出问题
    if (node.nodeType === 3) return (node.nodeValue ?? '').replace(/\u00A0/g, ' ')
    if (node.nodeType !== 1) return ''

    const el = node as HTMLElement
    const mark = el.getAttribute(SR_EMOJI_MARK_ATTR)
    if (mark) return mark
    if (el.tagName === 'BR') return '\n'

    let out = ''
    el.childNodes.forEach((child) => {
      out += walk(child)
    })

    // contenteditable 回车会包一层 div/p，这里的换行由结构补出来
    if (el.tagName === 'DIV' || el.tagName === 'P') out += '\n'

    return out
  }

  return walk(root).replace(/\n$/, '')
}

/**
 * 用标记文本重建富文本内容
 *
 * @param el 编辑容器
 * @param value 标记文本
 * @param emoji 表情查找表，不传则全部按纯文本渲染
 *
 * @remarks 会清空既有子节点。调用方负责判断「内容是否真的变了」，
 * 否则会打断光标与输入法。
 */
export function srRenderRich(el: HTMLElement, value: string, emoji?: Map<string, SrEmojiItem>): void {
  el.textContent = ''

  const segments = parseEmojiText(value, emoji ?? new Map())

  for (const segment of segments) {
    if (segment.type === 'text' || !segment.emoji) {
      // 文本里的换行要变成 br，否则 pre-wrap 下只是一段长文本
      segment.value.split('\n').forEach((line, index) => {
        if (index > 0) el.appendChild(document.createElement('br'))
        if (line) el.appendChild(document.createTextNode(line))
      })
      continue
    }

    el.appendChild(srCreateEmojiNode(segment.emoji))
  }
}

/**
 * 造一个表情节点
 *
 * @param item 表情项
 * @returns 带 `data-mark` 的节点：字符表情用 span，图片表情用 img
 */
export function srCreateEmojiNode(item: SrEmojiItem): HTMLElement {
  const mark = `[${item.name}]`

  if (item.url && !item.char) {
    const img = document.createElement('img')
    img.className = 'sr-textarea__emoji-img'
    img.src = item.url
    img.alt = mark
    img.setAttribute(SR_EMOJI_MARK_ATTR, mark)
    img.setAttribute('draggable', 'false')
    // 关掉节点内部的可编辑性：光标只能落在它前后，
    // 否则随后输入的字符会被塞进表情节点里，序列化时连带丢失
    img.setAttribute('contenteditable', 'false')
    return img
  }

  const span = document.createElement('span')
  span.className = 'sr-textarea__emoji-char'
  span.textContent = item.char ?? mark
  span.setAttribute(SR_EMOJI_MARK_ATTR, mark)
  span.setAttribute('contenteditable', 'false')
  return span
}

/**
 * 建表情查找表
 *
 * @param packages 表情包
 * @returns 名称到表情的映射；空数组返回 undefined，调用方据此判断是否进富文本模式
 */
export function srBuildTextareaEmojiMap(packages: SrEmojiPackage[]): Map<string, SrEmojiItem> | undefined {
  return packages.length ? buildEmojiMap(packages) : undefined
}

/**
 * 统计「用户看到的字数」
 *
 * @param value 标记文本
 * @param emoji 表情查找表
 * @returns 字数
 *
 * @remarks
 * 标记文本里 `[微笑]` 是 4 个字符，但对用户来说只是一个表情，
 * 所以命中的标记按 1 个字算。没传表情表时按码点计数（代理对算一个）。
 */
export function srCountTextareaText(value: string, emoji?: Map<string, SrEmojiItem>): number {
  if (!value) return 0
  if (!emoji) return [...value].length

  return parseEmojiText(value, emoji).reduce((sum, segment) => {
    return sum + (segment.type === 'emoji' ? 1 : [...segment.value].length)
  }, 0)
}
