/**
 * 内置的精简 Markdown 解析器。
 *
 * @remarks
 * **只用于「先跑起来」**。它覆盖日常写作最常见的语法，但不追求
 * CommonMark 兼容——嵌套列表、任务列表、内联 HTML、脚注、数学公式
 * 都不支持。正式使用建议传 `engine="builtin"` 之外的解析器（markdown-it）。
 *
 * **安全模型**：解析前先对整段文本做 HTML 转义，之后所有标签都由
 * 本文件自己拼出来。因此不依赖任何 sanitizer，也不存在「解析完再清洗」
 * 漏掉某种绕过方式的风险。代价是不支持内联 HTML——这对「展示用户写的
 * 内容」这个定位是正确取舍。
 *
 * 改动本文件时必须保持「先转义、再拼标签」这个顺序。
 */

import type { SrEmojiItem } from '../../emoji-picker/src/emoji-picker'

import { srHighlightCode } from './highlight'
import { srEscapeHtml, srIsSafeImageUrl, srIsSafeUrl } from './sanitize'

/** 内置解析器的渲染选项 */
export interface SrMarkdownBuiltinOptions {
  /** 是否做语法着色 @default true */
  highlight?: boolean
  /** 是否显示行号 @default false（组件层的默认值是 true，由 props 传进来） */
  lineNumbers?: boolean
  /** 是否显示复制按钮 @default true */
  copy?: boolean
  /**
   * 表情查找表
   *
   * @remarks 用 `buildEmojiMap` 从与编辑器同一份表情包生成。
   * 不传则 `[名称]` 按普通文本原样输出。
   */
  emoji?: Map<string, SrEmojiItem>
}

/** @deprecated 改用 `SrMarkdownBuiltinOptions` */
export type SrMarkdownCodeOptions = SrMarkdownBuiltinOptions

/**
 * 给代码块的每一行套一个容器
 *
 * @param html 已着色的代码 HTML
 * @returns 每行一个 span 的 HTML
 *
 * @remarks
 * 行号由 CSS 计数器画，所以这里不写数字。
 * 空行插入零宽空格，否则 `display: block` 的 span 高度会塌成 0。
 */
function wrapCodeLines(html: string): string {
  return html
    .split('\n')
    .map((line) => `<span class="sr-md__code-line">${line || '&#8203;'}</span>`)
    .join('')
}

/**
 * 行内元素解析。
 *
 * @param text 已转义的文本
 * @returns 含行内标签的 HTML
 *
 * @remarks
 * 顺序有讲究：行内代码优先，否则 `` `**a**` `` 里的星号会被粗体规则
 * 先吃掉，代码里就出现了标签。
 */
function parseInline(text: string, emoji?: Map<string, SrEmojiItem>): string {
  let result = text

  /**
   * 占位符池。
   *
   * @remarks 自己生成的标签先换成一个占位符，等其余行内规则跑完再还原。
   * 不这么做的话，后续的粗体规则会扫到标签本身——class 名里的双下划线
   * 会被当成加粗标记，输出破标签。
   */
  const holds: string[] = []

  /**
   * 存放并返回占位符
   * @param html 生成的 HTML
   * @returns 占位符
   */
  const hold = (html: string): string => {
    holds.push(html)
    return `\uE000MDH${holds.length - 1}\uE000`
  }

  // 行内代码：先抽出来
  result = result.replace(/`([^`]+)`/g, (_, code: string) => hold(`<code class="sr-md__code">${code}</code>`))

  // 图片必须在链接之前：两者只差一个 `!`
  result = result.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (matched, alt: string, url: string, title?: string) => {
      // 地址不安全就退回整段原文，而不是只留 alt——
      // 只留 alt 会让括号残留成残句，退回原文至少是自洽的
      if (!srIsSafeImageUrl(url)) return matched
      const titleAttr = title ? ` title="${title}"` : ''
      return `<img class="sr-md__img" src="${url}" alt="${alt}"${titleAttr} loading="lazy" />`
    },
  )

  result = result.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (matched, label: string, url: string, title?: string) => {
      if (!srIsSafeUrl(url)) return matched
      const titleAttr = title ? ` title="${title}"` : ''
      return `<a class="sr-md__link" href="${url}"${titleAttr} target="_blank" rel="noopener noreferrer">${label}</a>`
    },
  )

  // 自动链接：`<https://...>`（尖括号此时已是实体）
  result = result.replace(
    /&lt;(https?:\/\/[^\s&]+)&gt;/g,
    (_, url: string) =>
      `<a class="sr-md__link" href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`,
  )

  // 表情标记 `[名称]`。放在链接之后：`[文字](url)` 已经被上面的规则吃掉，
  // 这里不会再把它的方括号误认成表情。
  // 命中才替换，没命中原样返回——正文里写 `[注]` 这类方括号不会被误吞。
  if (emoji) {
    result = result.replace(/\[([^[\]]+)\]/g, (matched, name: string) => {
      const item = emoji.get(name)
      if (!item) return matched

      // 字符表情直接吐 Unicode：不落 img，复制出去也还是表情本身
      if (item.char) return hold(item.char)

      // 图片表情要过地址校验，不安全就当普通文本，不生成破图。
      // url 来自 props 没经过源码转义，拼进属性前必须自己转一遍，
      // 否则带引号的地址能突破属性边界
      if (item.url && srIsSafeImageUrl(item.url)) {
        return hold(
          `<img class="sr-md__emoji" src="${srEscapeHtml(item.url)}" alt="${name}" loading="lazy" />`,
        )
      }

      return matched
    })
  }

  result = result
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/(^|[^_])_([^_\s][^_]*)_/g, '$1<em>$2</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')

  // 统一还原
  return result.replace(/\uE000MDH(\d+)\uE000/g, (_, index: string) => holds[Number(index)] ?? '')
}

/**
 * 把 Markdown 渲染成 HTML。
 *
 * @param source 原始 Markdown
 * @returns HTML 字符串
 */
export function parseMarkdownBuiltin(source: string, options: SrMarkdownBuiltinOptions = {}): string {
  if (!source) return ''

  /** 表情查找表：整篇共用一份，行内解析时逐段查 */
  const emojiMap = options.emoji

  // 先整体转义，后续标签全部由本函数拼出
  const lines = srEscapeHtml(source.replace(/\r\n?/g, '\n')).split('\n')
  const html: string[] = []

  let index = 0

  /**
   * 判断是否无序列表行
   * @param text 行内容
   * @returns 是否匹配
   */
  const isUl = (text: string): boolean => /^\s{0,3}[-*+]\s+/.test(text)

  /**
   * 判断是否有序列表行
   * @param text 行内容
   * @returns 是否匹配
   */
  const isOl = (text: string): boolean => /^\s{0,3}\d+[.)]\s+/.test(text)

  /** 分割线 */
  const isHr = (text: string): boolean => /^\s*([-*_])(\s*\1){2,}\s*$/.test(text)

  while (index < lines.length) {
    const line = lines[index] ?? ''

    // ---------- 代码块 ----------
    // 语言标识不限于 ASCII：```中文、```c++、```C# 都要能开代码块。
    // 这里放宽到「任意非空白字符」，否则中文标识会漏到段落分支（见文末兜底）
    const fence = line.match(/^\s*```\s*([^`\s]*)\s*$/)
    if (fence) {
      const lang = fence[1] ?? ''
      const body: string[] = []
      index += 1

      while (index < lines.length && !/^\s*```\s*$/.test(lines[index] ?? '')) {
        body.push(lines[index] ?? '')
        index += 1
      }

      index += 1

      const raw = body.join('\n')
      // 着色、行号、复制按钮都是可选装饰：全部关掉时输出与旧版逐字节一致
      const codeHtml = options.highlight === false ? raw : srHighlightCode(raw, lang)
      const bodyHtml = options.lineNumbers ? wrapCodeLines(codeHtml) : codeHtml
      const langAttr = lang ? ` data-lang="${lang}"` : ''
      const langHtml = lang ? `<span class="sr-md__code-lang">${lang}</span>` : ''
      const copyHtml =
        options.copy === false
          ? ''
          : `<button type="button" class="sr-md__copy" aria-label="复制代码">复制</button>`
      const barHtml = langHtml || copyHtml ? `<div class="sr-md__pre-bar">${langHtml}${copyHtml}</div>` : ''

      html.push(
        `<div class="sr-md__pre"${langAttr}>` +
          barHtml +
          `<pre class="sr-md__pre-body"><code>${bodyHtml}</code></pre>` +
          `</div>`,
      )
      continue
    }

    // ---------- 空行 ----------
    if (!line.trim()) {
      index += 1
      continue
    }

    // ---------- 分割线 ----------
    if (isHr(line)) {
      html.push('<hr class="sr-md__hr" />')
      index += 1
      continue
    }

    // ---------- 标题 ----------
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.*)$/)
    if (heading) {
      const level = (heading[1] ?? '#').length
      html.push(
        `<h${level} class="sr-md__h sr-md__h--${level}">${parseInline((heading[2] ?? '').trim(), emojiMap)}</h${level}>`,
      )
      index += 1
      continue
    }

    // ---------- 引用 ----------
    if (/^\s{0,3}&gt;\s?/.test(line)) {
      const body: string[] = []

      while (index < lines.length && /^\s{0,3}&gt;\s?/.test(lines[index] ?? '')) {
        body.push((lines[index] ?? '').replace(/^\s{0,3}&gt;\s?/, ''))
        index += 1
      }

      const inner = body
        .join('\n')
        .split(/\n{2,}/)
        .map((part) => `<p class="sr-md__p">${parseInline(part.replace(/\n/g, '<br />'), emojiMap)}</p>`)
        .join('')

      html.push(`<blockquote class="sr-md__quote">${inner}</blockquote>`)
      continue
    }

    // ---------- 表格 ----------
    if (line.includes('|')) {
      const divider = lines[index + 1] ?? ''

      if (/^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(divider) && divider.includes('-')) {
        /**
         * 拆一行表格
         * @param row 行文本
         * @returns 单元格
         */
        const splitRow = (row: string): string[] =>
          row
            .replace(/^\s*\|/, '')
            .replace(/\|\s*$/, '')
            .split('|')
            .map((cell) => cell.trim())

        const head = splitRow(line)
        const aligns = splitRow(divider).map((cell) => {
          const left = cell.startsWith(':')
          const right = cell.endsWith(':')
          if (left && right) return 'center'
          if (right) return 'right'
          if (left) return 'left'
          return ''
        })

        index += 2
        const rows: string[][] = []

        while (index < lines.length && (lines[index] ?? '').includes('|') && (lines[index] ?? '').trim()) {
          rows.push(splitRow(lines[index] ?? ''))
          index += 1
        }

        const headHtml = head
          .map((cell) => `<th class="sr-md__th">${parseInline(cell, emojiMap)}</th>`)
          .join('')

        const bodyHtml = rows
          .map((row) => {
            const cells = head
              .map((_, i) => {
                const align = aligns[i] ? ` style="text-align: ${aligns[i]}"` : ''
                return `<td class="sr-md__td"${align}>${parseInline(row[i] ?? '', emojiMap)}</td>`
              })
              .join('')
            return `<tr class="sr-md__tr">${cells}</tr>`
          })
          .join('')

        html.push(
          `<div class="sr-md__table-wrap"><table class="sr-md__table">` +
            `<thead class="sr-md__thead"><tr class="sr-md__tr">${headHtml}</tr></thead>` +
            (bodyHtml ? `<tbody class="sr-md__tbody">${bodyHtml}</tbody>` : '') +
            `</table></div>`,
        )
        continue
      }
    }

    // ---------- 列表 ----------
    if (isUl(line) || isOl(line)) {
      const ordered = isOl(line)
      const items: string[] = []

      while (index < lines.length) {
        const current = lines[index] ?? ''
        if (!(ordered ? isOl(current) : isUl(current))) break

        const text = current.replace(/^\s{0,3}(?:[-*+]|\d+[.)])\s+/, '')
        items.push(`<li class="sr-md__li">${parseInline(text, emojiMap)}</li>`)
        index += 1
      }

      const tag = ordered ? 'ol' : 'ul'
      html.push(
        `<${tag} class="sr-md__list sr-md__list--${ordered ? 'ol' : 'ul'}">${items.join('')}</${tag}>`,
      )
      continue
    }

    // ---------- 段落 ----------
    const paragraph: string[] = []

    while (index < lines.length && (lines[index] ?? '').trim()) {
      const current = lines[index] ?? ''

      // 撞上块级语法就停，交给下一轮
      if (
        /^\s*```/.test(current) ||
        /^\s{0,3}#{1,6}\s+/.test(current) ||
        /^\s{0,3}&gt;\s?/.test(current) ||
        isUl(current) ||
        isOl(current) ||
        isHr(current)
      ) {
        break
      }

      paragraph.push(current.trim())
      index += 1
    }

    if (paragraph.length) {
      html.push(`<p class="sr-md__p">${parseInline(paragraph.join('<br />'), emojiMap)}</p>`)
      continue
    }

    // 兜底：上面的循环被「块级语法」判断打断，但那一行最终没被任何块级分支接住
    // （比如 fence 后面跟了非法标识、表格分隔行格式不对）。这时必须强制吃掉一行，
    // 否则 index 原地不动，外层 while 会死循环把整页卡住
    html.push(`<p class="sr-md__p">${parseInline(line.trim(), emojiMap)}</p>`)
    index += 1
  }

  return html.join('\n')
}

/**
 * 统计 Markdown 的纯文本字数。
 *
 * @param source 原始 Markdown（未转义）
 * @returns 字数
 *
 * @remarks 剔除语法符号后再数，否则标题的 `#`、粗体的 `**` 都会被算进去。
 */
export function srCountMarkdownText(source: string): number {
  return source
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s{0,3}(?:[-*+]|\d+[.)])\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\s/g, '').length
}
