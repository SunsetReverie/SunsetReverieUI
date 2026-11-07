#!/usr/bin/env node
/**
 * 水合冒烟覆盖校验
 *
 * 水合 e2e 只测 smoke 页里出现过的组件。靠人记着「新组件要加进去」不可靠，
 * 这里直接对比组件目录与 smoke 页里出现的标签，少一个就报错。
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const COMPONENT_DIR = join(ROOT, 'packages/ui/src/components')
const SMOKE_PAGE = join(ROOT, 'playground-nuxt4/app/pages/smoke.vue')

/**
 * 不进冒烟页的组件及原因
 * 这些要么没有模板实例，要么是纯逻辑容器，水合风险不在组件内部
 */
const SKIP = {
  transition: '无 DOM 输出，只是过渡包装',
  'config-provider': '纯 provide 容器，自身不渲染结构',
  toast: '命令式，服务端静默返回，已在 ssr.spec 覆盖',
  message: '命令式，客户端动态挂载，不参与水合',
  notification: '命令式，客户端动态挂载，不参与水合',
  confirm: '命令式，客户端动态挂载，不参与水合',
}

/** 组件目录清单 */
const components = readdirSync(COMPONENT_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

const smoke = readFileSync(SMOKE_PAGE, 'utf-8')

/** smoke 页里用到的小写标签名 */
const usedTags = new Set([...smoke.matchAll(/<(sr-[a-z-]+)/g)].map((match) => match[1]))

/** 缺失项：目录里有、但 smoke 页没出现 */
const missing = components.filter((name) => {
  if (SKIP[name]) return false
  return !usedTags.has(`sr-${name}`)
})

if (missing.length > 0) {
  console.error('[水合覆盖] 以下组件没有出现在 smoke 页里：\n')
  for (const name of missing) {
    console.error(`  ✗ Sr${name.replace(/(^|-)(\w)/g, (_, __, char) => char.toUpperCase())}`)
  }
  console.error('\n请在 playground-nuxt4/app/pages/smoke.vue 里补一个最小实例，')
  console.error('或确认它确实不需要水合测试后加入 check-smoke-coverage 的 SKIP 白名单。')
  process.exit(1)
}

const skipped = Object.keys(SKIP).filter((name) => components.includes(name))
console.log(
  `[水合覆盖] 通过（组件 ${components.length} 个，冒烟覆盖 ${components.length - skipped.length} 个，` +
    `白名单跳过 ${skipped.length} 个）`,
)
