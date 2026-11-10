import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * 文档缺口检查
 *
 * 对比组件实际 API（props.json，由 extract-api 从源码生成）与文档内容：
 * - 每个组件目录都要有对应的 .md
 * - Props 表里要出现该组件的每个 prop
 * - 事件、插槽同理
 *
 * 只查「有没有提到」，不判断写得对不对。目的是拦住「加了 prop 忘了写文档」。
 */

const COMPONENTS = 'packages/ui/src/components'
const DOCS = 'docs/components'
const PROPS_JSON = 'playground-vue3/src/demos/props.json'

/** 解析产物里的占位名，不是真实插槽 */
const IGNORED_SLOT = /^[`${]|slotNameOf/

if (!existsSync(PROPS_JSON)) {
  console.error(`[文档校验] 找不到 ${PROPS_JSON}，先跑 pnpm gen:demo-props`)
  process.exit(1)
}

const api = JSON.parse(readFileSync(PROPS_JSON, 'utf-8'))
const componentNames = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

const problems = []

for (const name of componentNames) {
  const docFile = join(DOCS, `${name}.md`)

  if (!existsSync(docFile)) {
    problems.push({ name, kind: '整篇缺失', items: [docFile] })
    continue
  }

  const md = readFileSync(docFile, 'utf-8')
  const entry = api[name]
  // 过去这里静默 continue：props.json 过期漏掉组件时，文档校验照样「通过」。
  // 现在把它算成缺口，提示重新生成产物。
  if (!entry) {
    problems.push({ name, kind: 'API 产物缺失', items: ['pnpm gen:demo-props'] })
    continue
  }

  const props = [...new Set((entry.options || []).map((option) => option.name))]
  const missingProps = props.filter((prop) => !new RegExp('\\| `' + prop + '`').test(md))

  const emits = (entry.emits || []).map((item) => (typeof item === 'string' ? item : item.name))
  const missingEmits = emits.filter((item) => item && !md.includes(item))

  const slots = (entry.slots || []).map((item) => (typeof item === 'string' ? item : item.name))
  const missingSlots = slots.filter((item) => item && !IGNORED_SLOT.test(item) && !md.includes(item))

  if (missingProps.length) problems.push({ name, kind: 'Props', items: missingProps })
  if (missingEmits.length) problems.push({ name, kind: '事件', items: missingEmits })
  if (missingSlots.length) problems.push({ name, kind: '插槽', items: missingSlots })
}

if (!problems.length) {
  console.log(`[文档校验] 通过（${componentNames.length} 个组件的 Props / 事件 / 插槽均有文档）`)
  process.exit(0)
}

console.log(`\n[文档校验] 发现 ${problems.length} 处缺口：\n`)
for (const problem of problems) {
  console.log(`  ${problem.name} · ${problem.kind}`)
  console.log(`    ${problem.items.join(', ')}`)
}
console.log('\n补到 docs/components/<组件>.md 里对应的表格中。\n')
process.exit(1)
