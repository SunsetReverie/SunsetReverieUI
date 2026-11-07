#!/usr/bin/env node
/**
 * 演示文件样式类校验
 *
 * 为什么需要：模板里写了 class="stack"，但 <style scoped> 里忘了定义它，
 * 不会报任何错——只是间距、布局不生效，只能靠眼睛发现。这个项目里已经
 * 出过一次（输入框尺寸演示的行间距）。
 *
 * 范围只限定在 demos 下的 demo 文件：
 * - 它们的样式都是扁平的 scoped CSS（没有 less 嵌套），解析可靠
 * - sr-* 由组件库提供、pg-* 由演示站全局提供，不在本地定义是正常的
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const DEMOS = join(ROOT, 'playground-vue3/src/demos')

/** 这些前缀的类由外部提供，不需要在本地定义 */
const EXTERNAL_PREFIX = ['sr-', 'pg-', 'vp-']

/**
 * 递归收集 .vue 文件
 * @param dir 目录
 * @param out 结果
 * @returns 文件列表
 */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue
      walk(full, out)
      continue
    }
    if (entry.name.endsWith('.vue')) out.push(full)
  }
  return out
}

const problems = []
let scanned = 0

for (const file of walk(DEMOS)) {
  const code = readFileSync(file, 'utf-8')

  const tplStart = code.indexOf('<template>')
  const tplEnd = code.lastIndexOf('</template>')
  if (tplStart < 0 || tplEnd < 0) continue

  scanned += 1

  const template = code.slice(tplStart, tplEnd).replace(/<!--[\s\S]*?-->/g, '')

  // 只取静态 class（:class / v-bind:class 是动态的，跳过）
  const used = new Set()
  for (const match of template.matchAll(/(?<!:)\bclass="([^"]*)"/g)) {
    for (const name of match[1].split(/\s+/)) {
      if (name) used.add(name)
    }
  }

  // 本文件 scoped 样式里定义的类
  const styleBlocks = [...code.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n')
  const defined = new Set()
  for (const match of styleBlocks.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
    defined.add(match[1])
  }

  const missing = []
  for (const name of used) {
    if (defined.has(name)) continue
    if (EXTERNAL_PREFIX.some((prefix) => name.startsWith(prefix))) continue
    missing.push(name)
  }

  if (missing.length) {
    problems.push({ file: relative(ROOT, file), missing: [...new Set(missing)] })
  }
}

if (problems.length) {
  console.error('\n[演示样式] 以下类在模板中使用，但本文件 scoped 样式里没有定义：\n')
  for (const item of problems) {
    console.error(`  ✗ ${item.file}`)
    console.error(`    缺失：${item.missing.join(', ')}`)
  }
  console.error('\n提示：类名拼错或漏写样式不会报错，只是布局静默失效。\n')
  process.exit(1)
}

console.log(`[演示样式] 通过（扫描 ${scanned} 个 demo，模板类名均有对应样式）`)
