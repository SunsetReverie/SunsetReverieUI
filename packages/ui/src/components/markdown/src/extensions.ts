/**
 * 短代码扩展机制。
 *
 * @remarks
 * 短代码的本质是「一段自定义语法 → 一段 HTML」，在交给 Markdown
 * 解析器**之前**就替换掉。
 *
 * 替换不能直接塞 HTML 进去——`markdown-it` 默认 `html: false`，
 * 会把标签当文本转义；即使开了 `html: true`，HTML 也会被 Markdown
 * 规则重新扫一遍（标签里的 `*` `_` 会被当作强调符号）。
 *
 * 所以先换成**占位符**，等 Markdown 渲染完再还原成真正的 HTML。
 * 占位符用 `\u0000` 包裹：这个字符不是合法文本，不会被任何规则匹配。
 */

import { srEscapeHtml, srIsSafeImageUrl, srIsSafeUrl } from './sanitize'

/** 占位符前缀 */
const PLACEHOLDER_PREFIX = '\uE000SRSH'

/** 占位符后缀 */
const PLACEHOLDER_SUFFIX = '\uE000'

/** 占位符匹配规则 */
const PLACEHOLDER_PATTERN = /\uE000SRSH(\d+)\uE000/g

/** 扩展的渲染上下文 */
export interface SrMarkdownExtensionContext {
  /** HTML 转义 */
  escape: (text: string) => string
  /** 校验链接地址，不安全的返回 `'#'` */
  safeUrl: (url: string) => string
  /** 校验图片地址，不安全的返回空字符串 */
  safeImageUrl: (url: string) => string
  /** 扩展名称，便于排查 */
  name: string
}

/**
 * 插入面板的一个字段
 *
 * @remarks 声明式描述，编辑器据此自动生成表单，不需要为每个短代码写 UI。
 */
export interface SrMarkdownInsertField {
  /** 参数名，对应模板里的 `{key}` */
  key: string
  /** 表单标签 */
  label: string
  /** 控件类型 @default 'text' */
  type?: 'text' | 'textarea' | 'select' | 'number'
  /** `type='select'` 时的选项 */
  options?: { label: string; value: string }[]
  /** 默认值 */
  default?: string
  /** 占位提示 */
  placeholder?: string
  /** 是否必填，未填时「插入」按钮禁用 */
  required?: boolean
  /** 字段下方的说明文字 */
  help?: string
}

/** 短代码扩展 */
export interface SrMarkdownExtension {
  /** 唯一名称，重复时后者覆盖前者 */
  name: string
  /**
   * 内联短代码规则
   *
   * 匹配可写在句子中间的形式，如 `{{image id=42}}`。
   * 必须带 `g` 标志，否则只会替换第一处。
   */
  inline?: RegExp
  /**
   * 块级短代码规则
   *
   * 匹配独占多行的围栏，如 `:::gallery\n...\n:::`。
   * 必须带 `g` 和 `m` 标志，且整块内容要在一个匹配里。
   */
  block?: RegExp
  /**
   * 渲染成 HTML
   *
   * @param match 正则匹配结果，`match[1]` 起是捕获组
   * @param ctx 上下文工具
   * @returns HTML 片段
   *
   * @remarks
   * 返回值会被**直接插入 DOM**，不做二次转义——
   * 所以内容里的用户数据必须经 `ctx.escape()` 处理。
   */
  render: (match: RegExpMatchArray, ctx: SrMarkdownExtensionContext) => string
  /**
   * 「插入按钮」的描述
   *
   * @remarks
   * 提供后 `SrMarkdownEditor` 的工具栏会自动多出一个按钮，
   * 点击插入 `template` 并把光标放在合适位置——
   * 使用方不需要手动记短代码语法，也不用另外配工具栏项。
   *
   * `template` 里的 `$1` 会被替换成占位文字，光标落在占位文字上并选中，
   * 用户直接输入即可覆盖。
   */
  insert?: {
    /** 按钮提示文案 */
    label: string
    /** 图标名，不传则只显示文字 */
    icon?: string
    /** 插入的模板，如 `'{{gallery id=$1}}'` */
    template: string
    /** `$1` 的占位文字，默认 `'1'`（仅在无 `fields` 时生效） */
    placeholder?: string
    /**
     * 参数字段
     *
     * 提供后点击按钮会**先弹出参数面板**，确认后按 `template` 插入；
     * 不提供则维持旧行为——直接插模板并把 `$1` 的占位文字选中。
     */
    fields?: SrMarkdownInsertField[]
    /** 面板标题，默认取 `label` */
    panelTitle?: string
    /** 面板宽度（px） @default 360 */
    panelWidth?: number
  }
}

/** 预处理结果 */
export interface SrMarkdownPreprocessed {
  /** 替换占位符之后的文本 */
  text: string
  /** 把渲染结果里的占位符还原成 HTML */
  restore: (html: string) => string
  /** 是否有任何扩展命中 */
  matched: boolean
}

/**
 * 构造扩展上下文。
 *
 * @param name 扩展名称
 * @returns 上下文
 */
function createContext(name: string): SrMarkdownExtensionContext {
  return {
    name,
    escape: srEscapeHtml,
    safeUrl: (url: string) => (srIsSafeUrl(url) ? url : '#'),
    safeImageUrl: (url: string) => (srIsSafeImageUrl(url) ? url : ''),
  }
}

/**
 * 执行预处理：把短代码换成占位符。
 *
 * @param source 原始 Markdown
 * @param extensions 扩展列表
 * @returns 处理结果
 */
export function srPreprocess(source: string, extensions: SrMarkdownExtension[]): SrMarkdownPreprocessed {
  if (!extensions.length) {
    return { text: source, restore: (html: string) => html, matched: false }
  }

  const placeholders: string[] = []
  let text = source
  let matched = false

  /**
   * 把一段 HTML 存起来，返回占位符
   * @param html 生成的 HTML
   * @returns 占位符
   */
  const hold = (html: string): string => {
    placeholders.push(html)
    matched = true
    return `${PLACEHOLDER_PREFIX}${placeholders.length - 1}${PLACEHOLDER_SUFFIX}`
  }

  for (const extension of extensions) {
    const ctx = createContext(extension.name)

    /*
     * 块级先做：围栏内部可能包含内联短代码，
     * 先整体替换掉，避免内层规则把围栏结构拆散。
     */
    if (extension.block) {
      text = text.replace(extension.block, (...args) => {
        // 去掉 replace 追加的 offset / input 参数，只留标准匹配结果
        const match = args.slice(0, -2) as unknown as RegExpMatchArray
        return hold(extension.render(match, ctx))
      })
    }

    if (extension.inline) {
      text = text.replace(extension.inline, (...args) => {
        const match = args.slice(0, -2) as unknown as RegExpMatchArray
        return hold(extension.render(match, ctx))
      })
    }
  }

  /**
   * 还原占位符
   * @param html Markdown 渲染结果
   * @returns 真实 HTML
   */
  const restore = (html: string): string =>
    html.replace(PLACEHOLDER_PATTERN, (_, index: string) => placeholders[Number(index)] ?? '')

  return { text, restore, matched }
}
