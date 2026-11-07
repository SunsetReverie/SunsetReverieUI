#!/usr/bin/env node
/**
 * 模板标签校验
 *
 * 为什么需要这个：Vue 对模板里未注册的标签只 warn、不报错，生产构建还会
 * 当成自定义元素静默渲染成空标签。构建通过、lint 通过、页面能打开，但组件
 * 就是不生效——只能靠肉眼看截图才发现。
 *
 * 这个项目里已经踩过三次（SrCarousel / SrInput / SrIcon），所以做成机器校验：
 * 扫模板里出现的 `Sr*` / `sr-*` 标签，逐个确认 script 里由 import 或局部注册提供。
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()

/** 需要检查的源码目录 */
const TARGETS = ['packages/ui/src', 'playground-vue3/src']

/** 这些目录里的组件由 Nuxt 自动导入，不要求显式 import */
const SKIP_DIRS = ['playground-nuxt4']

/** 不是组件、无需 import 的标签 */
const BUILTIN = new Set([
  'Slot',
  'Template',
  'Component',
  'Transition',
  'TransitionGroup',
  'KeepAlive',
  'Teleport',
  'Suspense',
])

/**
 * 递归收集 .vue 文件
 * @param dir 目录
 * @param out 结果
 * @returns 文件列表
 */
function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }

  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue
      walk(full, out)
      continue
    }
    if (entry.name.endsWith('.vue')) out.push(full)
  }

  return out
}

/**
 * kebab-case 转 PascalCase：sr-input-number → SrInputNumber
 * @param tag 标签名
 * @returns 组件名
 */
function toPascal(tag) {
  return tag
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/**
 * 取出 <template> 块并去掉 HTML 注释
 * @param code SFC 源码
 * @returns 模板内容
 */
function templateOf(code) {
  const start = code.indexOf('<template>')
  if (start < 0) return ''
  const end = code.lastIndexOf('</template>')
  if (end < 0) return ''
  return code.slice(start + '<template>'.length, end).replace(/<!--[\s\S]*?-->/g, '')
}

const problems = []
let scanned = 0

for (const target of TARGETS) {
  for (const file of walk(join(ROOT, target))) {
    if (SKIP_DIRS.some((dir) => file.includes(`/${dir}/`))) continue

    const code = readFileSync(file, 'utf-8')
    const template = templateOf(code)
    if (!template) continue

    scanned += 1

    // 收集模板里用到的标签：PascalCase 的 Sr* 与 kebab 的 sr-*
    const used = new Set()
    for (const match of template.matchAll(/<([A-Za-z][\w-]*)/g)) {
      const tag = match[1]
      if (tag.startsWith('Sr') && /^Sr[A-Z]/.test(tag)) used.add(tag)
      else if (/^sr-[a-z]/.test(tag)) used.add(toPascal(tag))
    }

    // script 部分：一个 SFC 可能有多个 <script> 块
    // （常见写法是普通 script 放类型、setup 放逻辑），必须全部拼起来
    const script = [...code.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
      .map((match) => match[1])
      .join('\n')

    const missing = []
    for (const component of used) {
      if (BUILTIN.has(component)) continue
      // 只要有引用即可：import 语句或局部注册都算
      if (new RegExp(`\\b${component}\\b`).test(script)) continue
      missing.push(component)
    }

    if (missing.length) {
      problems.push({
        file: relative(ROOT, file),
        missing: [...new Set(missing)],
      })
    }
  }
}

if (problems.length) {
  console.error('\n[模板标签] 以下组件在模板里使用了，但 script 中没有 import：\n')
  for (const item of problems) {
    console.error(`  ✗ ${item.file}`)
    console.error(`    缺失：${item.missing.join(', ')}`)
  }
  console.error('\n提示：Vue 对未注册标签只会 warn，生产构建还会静默渲染成空元素，必须显式 import。\n')
  process.exit(1)
}

console.log(`[模板标签] 通过（扫描 ${scanned} 个 .vue，全部标签均已导入）`)
