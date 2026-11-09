import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'

/** 高亮函数：把源码转成带标签的 HTML 片段 */
export type SrCodeHighlight = (code: string, lang: string) => string

export const codeBlockProps = {
  /** 代码内容（原始文本，不要预先转义） */
  code: {
    type: String,
    default: '',
  },
  /**
   * 语言标识 @default 'text'
   *
   * 支持别名（`js` / `ts` / `yml` / `sh`），由 `highlight` 决定怎么解析。
   * 不认识的语言应当原样返回，不要抛错。
   */
  lang: {
    type: String,
    default: 'text',
  },
  /**
   * 高亮函数
   *
   * 不传则按纯文本展示（内部会做 HTML 转义）。
   *
   * **返回值会被直接插入 DOM**，所以函数里必须自己处理转义——
   * highlight.js 的 `highlight()` 和 shiki 的 `codeToHtml()` 返回的
   * 都是已转义的 HTML，可以直接用。自己写高亮器时要记得这一点。
   */
  highlight: {
    type: Function as PropType<SrCodeHighlight>,
    default: undefined,
  },
  /** 是否显示行号 @default false */
  lineNumbers: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否显示复制按钮 @default true
   *
   * 与 `lineNumbers` 相互独立：行号是阅读辅助，复制是操作辅助，
   * 两者的取舍理由不同。
   */
  copyable: {
    type: Boolean,
    default: true,
  },
  /** 顶栏左侧的文件名，如 `main.ts`；不传则显示语言名 */
  title: {
    type: String,
    default: '',
  },
  /**
   * 长行折行 @default false
   *
   * 默认不折行，超出时横向滚动——代码的换行位置有语义，
   * 自动折行会让缩进层级看不清。
   */
  wrap: {
    type: Boolean,
    default: false,
  },
  /** 尺寸档位 @default 'md' */
  size: {
    type: String as PropType<SrSize>,
    default: 'md',
  },
} as const

export type SrCodeBlockProps = ExtractPropTypes<typeof codeBlockProps>
