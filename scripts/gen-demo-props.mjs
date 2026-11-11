#!/usr/bin/env node
/**
 * 生成 API 事实源（props / emits / slots）
 *
 * `extract-api.mjs` 把结果打到 stdout，这里负责落盘，写两份：
 *   - `docs/api/props.json`：**随仓库分发**。CI 与干净检出没有 playground，
 *     文档校验就靠这份数据做 Props / 事件 / 插槽的逐名比对；
 *   - `playground-vue3/src/demos/props.json`：本地演示站消费。
 *     演示站不进远程仓库，目录不存在时直接跳过。
 *
 * 两份内容完全一致，因为来自同一次提取。
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

/** 仓库根目录 */
const ROOT = resolve(import.meta.dirname, '..')

/** 随仓库分发的事实源 */
const DOCS_OUT = join(ROOT, 'docs/api/props.json')

/** 本地演示站目录（可能不存在） */
const DEMO_DIR = join(ROOT, 'playground-vue3/src/demos')

/**
 * 主流程：提取 → 写两份 → 打印体积
 * @returns {void}
 * @throws {Error} 提取脚本退出码非零时抛出
 */
function main() {
  const json = execFileSync(process.execPath, [join(ROOT, 'scripts/extract-api.mjs')], {
    encoding: 'utf-8',
    maxBuffer: 32 * 1024 * 1024,
  })

  mkdirSync(join(ROOT, 'docs/api'), { recursive: true })
  writeFileSync(DOCS_OUT, json, 'utf-8')

  if (existsSync(DEMO_DIR)) {
    writeFileSync(join(DEMO_DIR, 'props.json'), json, 'utf-8')
  }

  const kb = (json.length / 1024).toFixed(0)
  console.log(`[gen:demo-props] 写入 docs/api/props.json（${kb}KB）`)
  if (existsSync(DEMO_DIR)) {
    console.log('[gen:demo-props] 已同步 playground-vue3/src/demos/props.json')
  } else {
    console.log('[gen:demo-props] 未发现 playground-vue3，跳过演示站副本')
  }
}

try {
  main()
} catch (error) {
  console.error(`[gen:demo-props] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}
