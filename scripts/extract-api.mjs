#!/usr/bin/env node
/**
 * 组件 API 提取
 *
 * 文档必须和源码一致，靠手抄必漏。这个脚本直接读组件的 .ts / .vue 声明，
 * 把 props、emits、slots 抽成结构化数据，写文档时以它为准。
 *
 * 用法：
 *   node scripts/extract-api.mjs            # 全部组件，输出 JSON
 *   node scripts/extract-api.mjs button nav # 指定组件，输出 Markdown 事实表
 */

import { readdirSync, readFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const COMPONENTS = join(ROOT, 'packages/ui/src/components')

/**
 * 读取组件的所有源码文件
 * @param dir 组件目录
 * @returns 文件列表与拼接内容
 */
function readSources(dir) {
  const files = []
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue
      const full = join(current, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.(ts|vue)$/.test(entry.name)) files.push(full)
    }
  }
  walk(dir)
  return files.map((file) => ({ file, code: readFileSync(file, 'utf-8') }))
}

/** Vue 运行时构造器到 TS 类型的映射 */
const BASIC = {
  String: 'string',
  Number: 'number',
  Boolean: 'boolean',
  Array: 'unknown[]',
  Object: 'Record<string, unknown>',
  Function: '(...args: unknown[]) => void',
}

/**
 * 从一个 props 对象字面量里解析出所有 prop
 * @param code 源码
 * @param name props 变量名
 * @returns prop 列表
 */
function parseProps(code, name) {
  const start = code.indexOf(`export const ${name} = {`)
  if (start < 0) return []

  // 找到配对的 } as const
  let depth = 0
  let index = code.indexOf('{', start)
  const begin = index
  for (; index < code.length; index += 1) {
    if (code[index] === '{') depth += 1
    else if (code[index] === '}') {
      depth -= 1
      if (depth === 0) break
    }
  }
  const body = code.slice(begin + 1, index)

  const props = []
  // 逐行扫描：顶层 prop 的缩进是两个空格
  const lines = body.split('\n')
  let doc = []
  let inDoc = false

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]

    const docStart = line.trim().startsWith('/**')
    if (docStart || inDoc) {
      const text = line
        .trim()
        .replace(/^\/\*\*?/, '')
        .replace(/\*\/$/, '')
        .replace(/^\*/, '')
        .trim()
      if (text) doc.push(text)
      if (line.includes('/*')) inDoc = !line.includes('*/')
      else if (line.includes('*/')) inDoc = false
      continue
    }

    const match = /^ {2}([A-Za-z][\w]*):\s*\{/.exec(line)
    if (!match) continue

    // 收集这个 prop 的对象体
    let blockDepth = 1
    const block = [line]
    for (let j = i + 1; j < lines.length && blockDepth > 0; j += 1) {
      block.push(lines[j])
      blockDepth += (lines[j].match(/\{/g) ?? []).length
      blockDepth -= (lines[j].match(/\}/g) ?? []).length
      if (blockDepth === 0) {
        i = j
        break
      }
    }

    const blockText = block.join('\n')
    // 第一行是「propName: {」本身，其中可能就含 "type:" 字样（prop 名恰好叫 type），
    // 必须跳过，否则会把 '{' 当成类型
    const body = blockText.replace(/^[\s\S]*?\n/, '')
    // PropType<...> 里的内容才是对外类型，注意里面可能还有嵌套尖括号
    let type = ''
    const propTypeAt = body.indexOf('PropType<')
    if (propTypeAt >= 0) {
      let depth = 0
      for (let k = propTypeAt + 'PropType<'.length; k < body.length; k += 1) {
        const ch = body[k]
        if (ch === '<') depth += 1
        if (ch === '>') {
          if (depth === 0) break
          depth -= 1
        }
        type += ch
      }
    } else {
      const raw = /type:\s*([^,\n]+)/.exec(body)
      type = raw?.[1] ?? ''
      // 数组写法 [String, Number] 转成联合类型
      const tuple = /^\[([^\]]+)\]/.exec(type.trim())
      if (tuple) {
        type = tuple[1]
          .split(',')
          .map((item) => BASIC[item.trim()] ?? item.trim().toLowerCase())
          .join(' | ')
      } else if (BASIC[type.trim()]) {
        type = BASIC[type.trim()]
      }
    }

    const defaultMatch = /default:\s*([^\n]+)/.exec(body)
    const def = (defaultMatch?.[1] ?? '')
      .trim()
      .replace(/,$/, '')
      .replace(/\s*\/$/, '')

    props.push({
      from: name,
      name: match[1],
      type,
      default: def,
      description: doc.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(),
    })
    doc = []
  }

  return props
}

/**
 * 取出泛型声明里的花括号块
 *
 * @remarks 用括号配平而不是 `/defineEmits<\{([\s\S]*?)\}>/`：
 * 事件参数里常有 `{ key: string }` 这类内联对象，非贪婪正则会在第一个
 * 内部右括号处截断，把后面的事件全丢掉。
 *
 * @param code 源码
 * @param marker 起始标记，如 `defineEmits<{`
 * @returns 花括号内的文本；没有声明时返回空串
 */
function genericBlock(code, marker) {
  const start = code.indexOf(marker)
  if (start < 0) return ''

  let depth = 0
  for (let i = start + marker.length - 1; i < code.length; i += 1) {
    if (code[i] === '{') depth += 1
    else if (code[i] === '}') {
      depth -= 1
      if (depth === 0) return code.slice(start + marker.length, i)
    }
  }
  return ''
}

/**
 * 找与起始括号配对的右括号
 *
 * @param code 文本
 * @param open 起始括号下标
 * @returns 右括号下标；找不到返回 -1
 */
function findClosing(code, open) {
  let depth = 0
  for (let i = open; i < code.length; i += 1) {
    if ('[{<('.includes(code[i])) depth += 1
    else if (']}>'.includes(code[i])) {
      // `=>` 里的 > 不是泛型闭合，不能拿来减深度
      if (code[i] === '>' && code[i - 1] === '=') continue
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

/**
 * 按顶层逗号拆分参数列表
 *
 * @param inner 方括号内的文本
 * @returns 每个参数的类型声明文本
 */
function splitTopLevel(inner) {
  const parts = []
  let depth = 0
  let buffer = ''
  for (let i = 0; i < inner.length; i += 1) {
    const ch = inner[i]
    if ('[{<('.includes(ch)) depth += 1
    else if (']}>'.includes(ch)) {
      if (ch === '>' && inner[i - 1] === '=') {
        buffer += ch
        continue
      }
      depth -= 1
    }
    if (ch === ',' && depth === 0) {
      parts.push(buffer.trim())
      buffer = ''
    } else buffer += ch
  }
  if (buffer.trim()) parts.push(buffer.trim())
  return parts.filter(Boolean)
}

/**
 * 解析 emits
 * @param code 源码
 * @returns 事件列表
 */
function parseEmits(code) {
  const emits = []
  const block = genericBlock(code, 'defineEmits<{')

  // 事件名可以带引号（'update:modelValue'）也可以不带（select）。
  // 只认两格缩进的顶层键，避开多行参数里同样形如 `x: [` 的内联对象。
  for (const match of block.matchAll(/^ {2}(?:'([^']+)'|([A-Za-z]\w*)):\s*\[/gm)) {
    const open = match.index + match[0].length - 1
    const close = findClosing(block, open)
    const inner = block.slice(open + 1, close < 0 ? block.length : close)
    emits.push({
      name: match[1] ?? match[2],
      params: splitTopLevel(inner).map((item) => item.split(':')[0]?.trim() ?? ''),
    })
  }

  // 数组式声明 defineEmits(['open', 'close'])
  const array = /defineEmits\(\[([^\]]*)\]\)/.exec(code)
  if (array) {
    for (const match of array[1].matchAll(/['"]([^'"]+)['"]/g)) {
      emits.push({ name: match[1], params: [] })
    }
  }

  return emits
}

/**
 * 解析 slots
 *
 * @remarks 模板里的 `<slot>`、脚本里的 `$slots.xxx`、以及 `defineSlots<{}>()`
 * 三种写法都要认；后者是 Volar 的类型声明，不一定伴随模板 slot 标签。
 *
 * @param code 源码
 * @returns 插槽名列表
 */
function parseSlots(code) {
  const names = new Set()

  for (const match of code.matchAll(/<slot\b[^>]*\bname=["']([^"']+)["']/g)) names.add(match[1])
  for (const match of code.matchAll(/\$slots\.([a-zA-Z]\w*)/g)) names.add(match[1])
  for (const match of code.matchAll(/slots\.([a-zA-Z]\w*)/g)) names.add(match[1])

  // defineSlots<{ default?: () => unknown; item(props: {...}): unknown }>()
  // 只认缩进两格的顶层键，避免把内联参数对象里的字段也当成插槽
  const typed = genericBlock(code, 'defineSlots<{')
  for (const match of typed.matchAll(/^ {2}(?:'([^']+)'|([A-Za-z_]\w*))\??\s*[(:]/gm)) {
    names.add(match[1] ?? match[2])
  }

  // 有裸 <slot 说明存在默认插槽
  if (/<slot(?![^>]*name=)/.test(code)) names.add('default')
  return [...names].sort()
}

/**
 * 解析命令式组件的选项接口（如 SrToastOptions）
 *
 * 这类组件的 API 不在 props 里，而是函数参数，只能从 interface 里读。
 * @param code 源码
 * @returns 选项列表
 */
function parseOptionsInterface(code) {
  const block = /export interface Sr\w+Options \{([\s\S]*?)\n\}/.exec(code)
  if (!block) return []

  const options = []
  const lines = block[1].split('\n')
  let doc = []

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('/**') || trimmed.startsWith('*')) {
      const text = trimmed
        .replace(/^\/\*\*?/, '')
        .replace(/\*\/$/, '')
        .replace(/^\*/, '')
        .trim()
      if (text) doc.push(text)
      continue
    }

    const match = /^([a-zA-Z]\w*)\??:\s*(.+?)$/.exec(trimmed)
    if (!match) continue

    options.push({
      from: 'options',
      name: match[1],
      type: match[2].replace(/;$/, ''),
      default: '',
      description: doc.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(),
    })
    doc = []
  }

  return options
}

/**
 * 提取单个组件
 * @param name 组件目录名
 * @returns API 数据
 */
function extract(name) {
  const sources = readSources(join(COMPONENTS, name))
  const all = sources.map((item) => item.code).join('\n')

  /**
   * 主组件源码
   *
   * 事件只从主组件读：目录里可能还有 tree-node.vue 这类内部子组件，
   * 它们 emit 的是内部事件，不该出现在公开 API 里。
   */
  const candidates = sources.filter((item) => basename(item.file).replace(/\.(vue|ts)$/, '') === name)
  /**
   * 主组件模板源码
   *
   * 之前把「第一个能解析出事件的文件」同时拿去解析插槽，没有自定义事件的
   * 组件就会退化到 props 的 .ts 文件，里面当然一个 `<slot>` 也没有 ——
   * 21 个组件的插槽表因此全是空的。插槽必须只看 .vue 模板。
   */
  const mainVueCode = candidates
    .filter((item) => item.file.endsWith('.vue'))
    .map((item) => item.code)
    .join('\n')
  const mainCode = candidates.find((item) => parseEmits(item.code).length > 0)?.code || mainVueCode || all

  const props = []
  /** 每个 props 变量的名字，用于区分同文件里的多个组件（如 Form / FormItem） */
  const sourceNames = []
  for (const match of all.matchAll(/export const (\w*Props) = \{/g)) {
    props.push(...parseProps(all, match[1]))
    sourceNames.push(match[1].replace(/Props$/, ''))
  }

  // 命令式组件（toast / message / notification）没有 props，回退到函数选项接口
  if (props.length === 0) {
    const fromOptions = parseOptionsInterface(all)
    if (fromOptions.length > 0) {
      return {
        name,
        options: fromOptions,
        sources: ['options'],
        emits: [],
        slots: [],
      }
    }
  }

  return {
    name,
    options: props,
    sources: sourceNames,
    emits: parseEmits(mainCode),
    slots: parseSlots(mainVueCode || mainCode),
  }
}

/**
 * 输出 Markdown 事实表
 * @param api 组件 API
 * @returns Markdown 文本
 */
function toMarkdown(api) {
  const lines = [`# ${api.name}`, '']

  lines.push('## Props', '', '| 名称 | 类型 | 默认值 | 说明 |', '| --- | --- | --- | --- |')
  for (const option of api.options) {
    const type = option.type.replace(/\|/g, '\\|')
    const def = option.default.replace(/\|/g, '\\|') || '—'
    lines.push(`| \`${option.name}\` | \`${type}\` | \`${def}\` | ${option.description} |`)
  }

  lines.push('', '## 事件', '')
  if (api.emits.length === 0) lines.push('无')
  else {
    lines.push('| 事件 | 参数 |', '| --- | --- |')
    for (const event of api.emits) lines.push(`| \`${event.name}\` | ${event.params.join(', ') || '—'} |`)
  }

  lines.push('', '## 插槽', '')
  lines.push(api.slots.length ? api.slots.map((slot) => `\`${slot}\``).join('、') : '无')

  return lines.join('\n')
}

// ---------- 入口 ----------
const targets = process.argv.slice(2)
const all = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

const names = targets.length > 0 ? targets : all

if (targets.length > 0) {
  for (const name of names) {
    const api = extract(name)
    console.log(toMarkdown(api))
    console.log('\n---\n')
  }
} else {
  const result = Object.fromEntries(names.map((name) => [name, extract(name)]))
  console.log(JSON.stringify(result, null, 2))
}
