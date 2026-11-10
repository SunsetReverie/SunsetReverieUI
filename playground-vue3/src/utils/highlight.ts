/**
 * 演示站用的极简高亮器
 *
 * SrCodeBlock 刻意不内置高亮器（见 docs/components/code-block.md）：
 * 它需要的是「返回已转义 HTML 的函数」，语言覆盖面交给使用方。
 * 演示站只有几段短代码，不值得为此引一整套 highlight.js / shiki，
 * 所以这里做一次性的词法着色，输出 SrCodeBlock 能直接插入的 HTML。
 *
 * 实现要点：用**一次扫描 + 命名捕获组**分词，边扫描边转义，
 * 而不是「先插入 <span> 再继续 replace」——后者会把新插入的
 * class="..." 里的引号、属性名再匹配一遍，越替换越乱。
 */

/** 语言族 → 词法规则。捕获组名直接对应 CSS 类名 tk-<name> */
const RULES: Record<string, RegExp> = {
  code: /(?<com>\/\*[\s\S]*?\*\/|\/\/[^\n]*)|(?<str>`(?:\\[\s\S]|[^`\\])*`|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*')|(?<num>\b\d+(?:\.\d+)?\b)|(?<kw>\b(?:const|let|var|function|return|if|else|for|while|import|export|from|default|new|class|extends|async|await|type|interface|as|void|null|undefined|true|false)\b)/g,
  css: /(?<com>\/\*[\s\S]*?\*\/)|(?<str>"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*')|(?<kw>@[a-zA-Z-]+)|(?<num>#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|fr|s|ms)?\b)|(?<var>[a-zA-Z-]+(?=\s*:))|(?<tag>[.#]?[a-zA-Z_][\w-]*(?=\s*\{))/g,
  html: /(?<com><!--[\s\S]*?-->)|(?<tag><\/?[a-zA-Z][\w-]*|\/?>)|(?<str>"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*')|(?<attr>[a-zA-Z-]+(?==))/g,
  text: /(?<attr>[\w-]+(?=\s*=))|(?<num>\b\d+\b)/g,
}

/** 语言别名到语言族的映射 */
const LANG_FAMILY: Record<string, string> = {
  js: 'code',
  javascript: 'code',
  jsx: 'code',
  ts: 'code',
  tsx: 'code',
  typescript: 'code',
  css: 'css',
  less: 'css',
  scss: 'css',
  html: 'html',
  xml: 'html',
  vue: 'html',
  text: 'text',
}

/**
 * HTML 转义：代码里出现 <script> 时只能显示成字面文本
 * @param text 原始片段
 * @returns 转义后的文本
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 高亮一段代码，返回可直接交给 SrCodeBlock 的 HTML 片段
 *
 * 不认识的语言按 text 处理，不抛错；SrCodeBlock 自身也有「高亮器抛错就退回纯文本」的兜底。
 * @param code 原始代码
 * @param lang 语言标识
 * @returns 已转义的 HTML
 */
export function srHighlightCode(code: string, lang: string): string {
  const family = LANG_FAMILY[lang.toLowerCase()] ?? 'text'
  const rule = RULES[family] ?? RULES.text
  // 每次用新实例，避免带 g 的正则复用时 lastIndex 串台
  const pattern = new RegExp(rule.source, rule.flags)

  let html = ''
  let cursor = 0

  for (const match of code.matchAll(pattern)) {
    const index = match.index ?? 0
    const token = match[0]
    const kind = Object.entries(match.groups ?? {}).find(([, value]) => value !== undefined)?.[0] ?? 'var'

    html += escapeHtml(code.slice(cursor, index))
    html += `<span class="tk-${kind}">${escapeHtml(token)}</span>`
    cursor = index + token.length
  }

  html += escapeHtml(code.slice(cursor))
  return html
}
