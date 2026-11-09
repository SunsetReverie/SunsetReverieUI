import type { ExtractPropTypes, PropType } from 'vue'

import type { SrSize } from '../../../types/config'
import type { SrMarkdownExtension } from './extensions'

/** 内置解析器哨兵 */
export const SR_MARKDOWN_BUILTIN = 'builtin' as const

/**
 * Markdown 渲染引擎。
 *
 * @remarks
 * 只要提供 `render` 一个方法就能接入。`markdown-it` 实例天然满足：
 *
 * ```ts
 * const engine = new MarkdownIt({ html: false })
 * ```
 *
 * 也可以返回 `Promise`，用于 shiki 这类异步初始化的高亮器。
 */
export interface SrMarkdownEngine {
  /**
   * 把 Markdown 渲染成 HTML
   * @param source Markdown 源码
   * @returns HTML，或 Promise
   */
  render: (source: string) => string | Promise<string>
}

export const markdownProps = {
  /** Markdown 源码 */
  source: {
    type: String,
    default: '',
  },
  /**
   * 渲染引擎
   *
   * 传 `'builtin'` 用内置的精简解析器（只覆盖常用语法，见文档）；
   * 传对象则调用它的 `render`。**不传会原样显示源码**——
   * 静默降级比报错更安全，但控制台会给出提示。
   */
  engine: {
    type: [String, Object] as PropType<SrMarkdownEngine | typeof SR_MARKDOWN_BUILTIN>,
    default: undefined,
  },
  /**
   * 短代码扩展
   *
   * 在 Markdown 解析**之前**执行，把自定义语法替换成 HTML。
   * 支持内联（`{{名字 参数}}`）与块级（`:::名字 ... :::`）两种形态。
   */
  extensions: {
    type: Array as unknown as PropType<SrMarkdownExtension[]>,
    default: () => [],
  },
  /**
   * HTML 后处理钩子
   *
   * 引擎渲染完成后、插入 DOM 之前调用一次。
   * 接了 DOMPurify 之类的清洗库时用它：
   *
   * ```ts
   * :sanitize="(html) => DOMPurify.sanitize(html)"
   * ```
   */
  sanitize: {
    type: Function as PropType<(html: string) => string>,
    default: undefined,
  },
  /** 渲染尺寸 @default 'md' */
  size: {
    type: String as PropType<SrSize>,
    default: 'md',
  },
  /**
   * 渲染模板 @default 'vivid'
   *
   * - `plain`：极简中性，几乎没有装饰
   * - `vivid`：主色装饰丰富，标题/引用/表格/代码块都有层次
   * - `editorial`：阅读型排版，衬线标题、细线、克制留白
   * - `glass`：玻璃拟态，半透明表面与柔光
   *
   * 模板本质是一组 `--sr-md-*` CSS 变量，可以直接覆盖做二次定制。
   */
  theme: {
    type: String as PropType<'plain' | 'vivid' | 'editorial' | 'glass'>,
    default: 'vivid',
  },
} as const

export type SrMarkdownProps = ExtractPropTypes<typeof markdownProps>
