import fs from 'node:fs'
import path from 'node:path'

/**
 * 扫描 computed 内部未解包的 ref
 *
 * 场景：`const rootClass = computed(() => [{ 'is-disabled': isDisabled }])`
 * —— 这里 isDisabled 是 ref 对象，永远不会是 false。
 * TypeScript 不报错（类名对象的值类型宽松），运行时也不抛，只是逻辑恒为真。
 */

const ROOT = 'packages/ui/src/components'

/** 递归收集 .vue 文件 */
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name.endsWith('.vue')) out.push(full)
  }
  return out
}

/**
 * 找出某个 script 里声明的 ref / computed / toRef 变量名
 * @param {string} script 脚本内容
 * @returns {Set<string>} 变量名集合
 */
function collectRefs(script) {
  const names = new Set()

  // const xxx = ref(...) / shallowRef / computed / toRef
  const re = /const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:shallowRef|ref|computed|toRef|toRefs|reactive)\s*[<(]/g
  for (const match of script.matchAll(re)) names.add(match[1])

  // const { a, b } = toRefs(x) 这种
  const destructured = /const\s*\{([^}]+)\}\s*=\s*toRefs\(/g
  for (const match of script.matchAll(destructured)) {
    for (const part of match[1].split(',')) {
      const name = part.split(':').pop()?.trim()
      if (name) names.add(name)
    }
  }

  return names
}

/**
 * 提取所有 computed 的代码块
 * @param {string} script 脚本内容
 * @returns {Array<{ start: number, text: string }>} 代码块
 */
function collectComputedBlocks(script) {
  const blocks = []
  const re = /computed(?:<[^>]*>)?\s*\(\s*\(\s*\)\s*=>/g

  for (const match of script.matchAll(re)) {
    const start = match.index + match[0].length
    let depth = 0
    let i = start

    for (; i < script.length; i += 1) {
      const ch = script[i]
      if (ch === '{' || ch === '[' || ch === '(') {
        depth += 1
      } else if (ch === '}' || ch === ']' || ch === ')') {
        if (depth === 0) break
        depth -= 1
      }
    }

    blocks.push({ start, text: script.slice(start, i + 1) })
  }

  return blocks
}

/**
 * 在一个块里找「值位置直接写裸 ref 名」的地方
 * @param {string} text 代码块
 * @param {Set<string>} refs ref 变量名
 * @returns {string[]} 命中的变量名
 */
function findBareRefs(text, refs) {
  const hits = new Set()

  // 对象字面量：`key: refName` 或 `'key': refName`，后面紧跟 , } ]
  const valuePattern = /(?::\s*)([A-Za-z_$][\w$]*)\s*(?=[,}\]])/g
  for (const match of text.matchAll(valuePattern)) {
    const name = match[1]
    if (refs.has(name)) hits.add(name)
  }

  // 三元条件：`refName ? a : b` —— ref 恒为真，永远取前一支
  const ternaryPattern = /(?<![.\w$])([A-Za-z_$][\w$]*)\s*\?(?![.?])/g
  for (const match of text.matchAll(ternaryPattern)) {
    const name = match[1]
    if (refs.has(name)) hits.add(name)
  }

  // 数组元素：`[refName, ...]` 或 `, refName,` —— 只有整段是纯标识符列表时才可能
  const arrayPattern = /(?:\[\s*|,\s*)([A-Za-z_$][\w$]*)\s*(?=[,\]])/g
  for (const match of text.matchAll(arrayPattern)) {
    const name = match[1]
    if (!refs.has(name)) continue
    // 排除函数调用与属性访问的误报：检查前后是否紧邻 ( 或 .
    const idx = match.index + match[0].indexOf(name)
    const before = text[idx - 1]
    if (before === '.' || before === '!') continue
    hits.add(name)
  }

  return [...hits]
}

/**
 * 在条件判断里找裸 ref
 *
 * `if (isDisabled)` / `!isLoading` 这类写法，ref 对象恒为真，
 * 分支永远走同一个方向。比类名对象更隐蔽，因为看起来完全正常。
 * @param {string} script 脚本内容
 * @param {Set<string>} refs ref 变量名
 * @returns {Array<{ line: number, text: string }>} 命中项
 */
function findBareRefConditions(script, refs) {
  const hits = []

  // 跳过 import 与类型声明区域
  const lines = script.split('\n')

  lines.forEach((line, index) => {
    if (/^\s*(import|export type|\/\/|\*)/.test(line)) return

    // if (x) / while (x) / !x —— 捕获名字，再看它后面是不是紧跟 .value
    const patterns = [
      /\bif\s*\(\s*([A-Za-z_$][\w$]*)/g,
      /\bwhile\s*\(\s*([A-Za-z_$][\w$]*)/g,
      /!\s*([A-Za-z_$][\w$]*)\s*(?:\)|&&|\|\||\?)/g,
    ]

    for (const re of patterns) {
      for (const match of line.matchAll(re)) {
        const name = match[1]
        if (!refs.has(name)) continue

        // 同一个标识符后面紧跟 .value 就是已经解包了
        const after = line.slice(match.index + match[0].length)
        if (/^\s*\.\s*value\b/.test(after)) continue

        hits.push({ line: index + 1, text: line.trim().slice(0, 96) })
      }
    }
  })

  return hits
}

/** 主流程 */
const files = walk(ROOT)

/** computed 内对象/数组字面量里的裸 ref */
const literalHits = []

/** 条件判断里的裸 ref */
const conditionHits = []

for (const file of files) {
  const code = fs.readFileSync(file, 'utf-8')

  // 一个 SFC 可能有多个 script 块（类型 + setup），全部拼起来再看
  const scripts = [...code.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])
  if (!scripts.length) continue

  const script = scripts.join('\n')
  const refs = collectRefs(script)
  if (!refs.size) continue

  const relative = path.relative(process.cwd(), file)

  for (const block of collectComputedBlocks(script)) {
    const bare = findBareRefs(block.text, refs)
    if (!bare.length) continue

    literalHits.push({
      file: relative,
      line: script.slice(0, block.start).split('\n').length,
      names: bare,
      snippet: block.text.replace(/\s+/g, ' ').slice(0, 110),
    })
  }

  for (const hit of findBareRefConditions(script, refs)) {
    conditionHits.push({ file: relative, ...hit })
  }
}

const total = literalHits.length + conditionHits.length

if (!total) {
  console.log(`[ref 解包] 通过（扫描 ${files.length} 个 .vue，未发现裸 ref）`)
  process.exit(0)
}

if (literalHits.length) {
  console.log(`\n[ref 解包] computed 内写了裸 ref（值恒为真）：\n`)
  for (const item of literalHits) {
    console.log(`  ${item.file}:${item.line}`)
    console.log(`    变量: ${item.names.join(', ')}`)
    console.log(`    片段: ${item.snippet}`)
  }
}

if (conditionHits.length) {
  console.log(`\n[ref 解包] 条件判断里写了裸 ref（分支永远相同）：\n`)
  for (const item of conditionHits) {
    console.log(`  ${item.file}:${item.line}`)
    console.log(`    ${item.text}`)
  }
}

console.log(`\n共 ${total} 处，需改成 xxx.value 或解构。\n`)
process.exit(1)
