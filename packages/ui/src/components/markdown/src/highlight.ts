/**
 * 内置代码块高亮。
 *
 * @remarks
 * 不引入 Prism / shiki：它们动辄几十上百 KB，还要按语言加载包。
 * 这里用一组粘性正则做逐 token 扫描，覆盖常见语言的高频语法——
 * 目标是「一眼看得出是代码」，而不是编辑器级的准确度。
 *
 * **输入是已转义的文本**：解析器先把整段源码 `srEscapeHtml` 过一遍，
 * 所以这里的双引号是 `&quot;`、单引号是 `&#39;`、尖括号是 `&lt;`。
 * 输出只拼 `<span class="sr-md__tok--*">`，不新增任何标签，
 * 安全性仍由解析器「先转义、后拼标签」的顺序保证。
 *
 * 每个 token 内部的换行会被拆到 span 之外：这样单个 span 永远不跨行，
 * 上层按行加行号时才不会把标签切断。
 */

/** 令牌类别 */
type SrCodeToken = 'kw' | 'str' | 'num' | 'com' | 'fn' | 'tag' | 'attr' | 'op'

/** 语言配置 */
interface SrCodeProfile {
  /** 关键字表，空集表示不认关键字 */
  keywords: Set<string>
  /** 行注释前缀，空串表示没有行注释 */
  lineComment: string
  /** 是否有块注释 */
  blockComment: boolean
  /** 走 HTML 标签解析，还是通用 token 扫描 */
  mode: 'code' | 'html'
}

/** JS 关键字 */
const JS_KEYWORDS = new Set(
  (
    'const let var function return if else for while do switch case break continue new class extends super ' +
    'import export from default async await try catch finally throw typeof instanceof in of this ' +
    'null undefined true false static get set delete void yield'
  ).split(' '),
)

/** TS 关键字：在 JS 基础上追加类型系统那批 */
const TS_KEYWORDS = new Set([
  ...JS_KEYWORDS,
  ...(
    'interface type enum implements namespace declare readonly private public protected abstract ' +
    'as satisfies keyof infer asserts unique never any unknown string number boolean object'
  ).split(' '),
])

/** Python 关键字 */
const PY_KEYWORDS = new Set(
  (
    'def class return if elif else for while import from as pass raise try except finally with lambda ' +
    'yield None True False and or not in is global nonlocal assert del async await self'
  ).split(' '),
)

/** Shell 关键字 */
const SH_KEYWORDS = new Set(
  (
    'if then else elif fi for while do done case esac function return echo export local readonly ' +
    'source cd set unset exit echo printf test'
  ).split(' '),
)

/** JSON 只认三个字面量 */
const JSON_KEYWORDS = new Set(['true', 'false', 'null'])

/** 语言别名归一：用户写 `ts` / `typescript` / `TS` 都指向同一套规则 */
const LANG_ALIAS: Record<string, string> = {
  js: 'js',
  jsx: 'js',
  mjs: 'js',
  cjs: 'js',
  javascript: 'js',
  ts: 'ts',
  tsx: 'ts',
  typescript: 'ts',
  json: 'json',
  jsonc: 'json',
  html: 'html',
  htm: 'html',
  xml: 'html',
  vue: 'html',
  svg: 'html',
  css: 'css',
  scss: 'css',
  sass: 'css',
  less: 'css',
  sh: 'sh',
  bash: 'sh',
  zsh: 'sh',
  shell: 'sh',
  console: 'sh',
  py: 'py',
  python: 'py',
  md: 'md',
  markdown: 'md',
}

/** 通用扫描用的粘性正则（`y` 保证只从 lastIndex 起匹配） */
const RE_STRING = /&quot;[^\n]*?&quot;|&#39;[^\n]*?&#39;|`[^\n]*`/y
const RE_NUMBER = /0[xX][0-9a-fA-F]+|0[bB][01]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y
const RE_IDENT = /[A-Za-z_$][\w$]*/y
const RE_OPERATOR =
  /&lt;|&gt;|&amp;|===|!==|==|!=|=&gt;|\?\?|\?\.|\+\+|--|\*\*|&amp;&amp;|\|\||[-+*/%^&|~!?:;,.()[\]{}]/y

/** HTML 标签（输入已转义，尖括号是 `&lt;` / `&gt;`） */
const RE_HTML_TOKEN = /&lt;!--[\s\S]*?--&gt;|&lt;(\/?)([A-Za-z][\w-]*)([\s\S]*?)(\/?)&gt;/g

/** HTML 属性：`name=值` */
const RE_HTML_ATTR = /([A-Za-z_:][\w:.-]*)(=)(&quot;[\s\S]*?&quot;|&#39;[\s\S]*?&#39;|[\w-]+)/g

/**
 * 把一段文本包成令牌标签
 *
 * @param token 令牌类别
 * @param text 已转义的文本
 * @returns 含 span 的 HTML
 *
 * @remarks 换行被拆到 span 外，保证 span 不跨行。
 */
function wrapToken(token: SrCodeToken, text: string): string {
  return text
    .split('\n')
    .map((segment) => (segment ? `<span class="sr-md__tok sr-md__tok--${token}">${segment}</span>` : ''))
    .join('\n')
}

/**
 * 在指定位置尝试匹配一个粘性正则
 *
 * @param re 粘性正则
 * @param code 文本
 * @param index 起点
 * @returns 匹配到的文本，未命中返回 null
 */
function matchAt(re: RegExp, code: string, index: number): string | null {
  re.lastIndex = index
  const match = re.exec(code)
  return match ? match[0] : null
}

/**
 * 取某种语言的高亮配置
 *
 * @param lang 语言标识（已小写）
 * @returns 配置，未知语言返回通用配置
 */
function profileOf(lang: string): SrCodeProfile {
  const canonical = LANG_ALIAS[lang] ?? ''

  if (canonical === 'html') {
    return { keywords: new Set(), lineComment: '', blockComment: false, mode: 'html' }
  }

  const keywords =
    canonical === 'ts'
      ? TS_KEYWORDS
      : canonical === 'js'
        ? JS_KEYWORDS
        : canonical === 'json'
          ? JSON_KEYWORDS
          : canonical === 'py'
            ? PY_KEYWORDS
            : canonical === 'sh'
              ? SH_KEYWORDS
              : new Set<string>()

  // Python / Shell 用 `#` 注释，其余（含未知语言）按 C 系规则兜底
  const hashComment = canonical === 'py' || canonical === 'sh'

  return {
    keywords,
    lineComment: hashComment ? '#' : '//',
    blockComment: !hashComment,
    mode: 'code',
  }
}

/**
 * HTML / Vue / XML 的高亮
 *
 * @param code 已转义的代码
 * @returns HTML
 *
 * @remarks 文本节点保持原样，只给标签名、属性名、属性值上色。
 */
function highlightHtml(code: string): string {
  return code.replace(
    RE_HTML_TOKEN,
    (whole: string, slash: string, name: string, attrs: string, selfClose: string) => {
      if (whole.startsWith('&lt;!--')) return wrapToken('com', whole)

      const attrHtml = attrs.replace(
        RE_HTML_ATTR,
        (_match: string, attr: string, eq: string, value: string) => {
          return wrapToken('attr', attr) + eq + wrapToken('str', value)
        },
      )

      return (
        wrapToken('tag', `&lt;${slash ?? ''}`) +
        wrapToken('tag', name ?? '') +
        attrHtml +
        wrapToken('tag', `${selfClose ?? ''}&gt;`)
      )
    },
  )
}

/**
 * 通用 token 扫描
 *
 * @param code 已转义的代码
 * @param profile 语言配置
 * @returns HTML
 */
function scanCode(code: string, profile: SrCodeProfile): string {
  const out: string[] = []
  let index = 0

  while (index < code.length) {
    // 块注释：可能跨行，wrapToken 会按行拆开
    if (profile.blockComment && code.startsWith('/*', index)) {
      const close = code.indexOf('*/', index + 2)
      const stop = close === -1 ? code.length : close + 2
      out.push(wrapToken('com', code.slice(index, stop)))
      index = stop
      continue
    }

    // 行注释
    if (profile.lineComment && code.startsWith(profile.lineComment, index)) {
      const newline = code.indexOf('\n', index)
      const stop = newline === -1 ? code.length : newline
      out.push(wrapToken('com', code.slice(index, stop)))
      index = stop
      continue
    }

    const str = matchAt(RE_STRING, code, index)
    if (str) {
      out.push(wrapToken('str', str))
      index += str.length
      continue
    }

    const num = matchAt(RE_NUMBER, code, index)
    if (num) {
      out.push(wrapToken('num', num))
      index += num.length
      continue
    }

    const word = matchAt(RE_IDENT, code, index)
    if (word) {
      if (profile.keywords.has(word)) out.push(wrapToken('kw', word))
      // 紧跟左括号的标识符按函数名处理
      else if (code[index + word.length] === '(') out.push(wrapToken('fn', word))
      else out.push(word)
      index += word.length
      continue
    }

    const operator = matchAt(RE_OPERATOR, code, index)
    if (operator) {
      out.push(wrapToken('op', operator))
      index += operator.length
      continue
    }

    out.push(code[index] ?? '')
    index += 1
  }

  return out.join('')
}

/**
 * 高亮一段代码
 *
 * @param code 已转义的代码文本
 * @param lang 语言标识，支持中英文别名，未知语言按 C 系规则兜底
 * @returns 带 `sr-md__tok--*` 标签的 HTML
 */
export function srHighlightCode(code: string, lang: string): string {
  if (!code) return ''

  const profile = profileOf((lang || '').trim().toLowerCase())
  return profile.mode === 'html' ? highlightHtml(code) : scanCode(code, profile)
}
