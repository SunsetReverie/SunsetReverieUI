/**
 * 演示页导入检查
 *
 * 只会被 Playground 加载一次，演示页里漏掉 `import { computed } from 'vue'`
 * 不会让构建失败，而是运行时 `setup` 抛错、整个 demo 白屏。
 * 这里静态扫一遍，把这类错误挡在提交前。
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const DEMO_DIR = 'playground-vue3/src/demos'

/** 需要以函数形式调用的 Vue API（宏 defineProps 等不在此列） */
const VUE_APIS = [
  'computed',
  'ref',
  'shallowRef',
  'reactive',
  'readonly',
  'toRefs',
  'toRaw',
  'markRaw',
  'watch',
  'watchEffect',
  'nextTick',
  'onMounted',
  'onUnmounted',
  'onBeforeUnmount',
  'onBeforeMount',
  'onUpdated',
  'useSlots',
  'useAttrs',
  'useTemplateRef',
  'defineAsyncComponent',
  'provide',
  'inject',
  'h',
]

/** 递归收集 .vue 文件 */
function collectVueFiles(dir) {
  const out = []

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)

    if (entry.isDirectory()) out.push(...collectVueFiles(full))
    else if (entry.name.endsWith('.vue')) out.push(full)
  }

  return out
}

/** 取出 <script setup> 的内容 */
function readScriptSetup(source) {
  const match = source.match(/<script\s+setup\s+lang="ts"[^>]*>([\s\S]*?)<\/script>/)

  return match ? match[1] : null
}

/** 从 `import { ... } from 'vue'` 里取出本地名 */
function readVueImports(script) {
  const names = new Set()
  const re = /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*'vue'/g

  for (const match of script.matchAll(re)) {
    for (const part of match[1].split(',')) {
      const raw = part.trim()
      if (!raw) continue

      // `type X` / `a as b` 都取本地名
      const local = raw
        .replace(/^type\s+/, '')
        .split(/\bas\b/)
        .pop()
        ?.trim()
      if (local) names.add(local)
    }
  }

  return names
}

/**
 * 去掉字符串、模板字符串、正则字面量和注释
 *
 * 否则 `/<h([1-6])/` 里的 `h(` 会被当函数调用。
 */
function stripLiterals(code) {
  return code
    .replace(/`(?:\\.|[^`\\])*`/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, '""')
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/\/[^\n/]*\/[gimsuy]*/g, '""')
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
}

const problems = []

for (const file of collectVueFiles(DEMO_DIR)) {
  const source = readFileSync(file, 'utf8')
  const script = readScriptSetup(source)
  if (!script) continue

  const imported = readVueImports(script)
  const code = stripLiterals(script)
  const missing = []

  for (const api of VUE_APIS) {
    if (imported.has(api)) continue

    // 只认「调用」形态，避免把同名变量算进来
    const re = new RegExp(`(?:^|[^.\\w])${api}\\s*(?:<[^>]*>)?\\(`, 'm')
    if (re.test(code)) missing.push(api)
  }

  if (missing.length) problems.push({ file, missing })
}

if (problems.length) {
  console.log('[演示导入] 失败：')
  console.log()
  for (const { file, missing } of problems) {
    console.log(`  ${relative(process.cwd(), file)}`)
    console.log(`    使用了未导入的 Vue API：${missing.join(', ')}`)
  }
  console.log()
  console.log("补到该文件 `<script setup>` 顶部的 `import { ... } from 'vue'`。")
  process.exit(1)
}

console.log(`[演示导入] 通过（扫描 ${collectVueFiles(DEMO_DIR).length} 个 demo，Vue API 均已导入）`)
