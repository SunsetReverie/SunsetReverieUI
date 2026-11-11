#!/usr/bin/env node
/**
 * 生成 Lucide 全量图标集合
 *
 * 与 `gen-offline-icons.mjs` 的分工：
 *   - `gen-offline-icons.mjs`：扫描源码里用到的图标，生成 **子集**（86 个左右），内联进 ui 产物；
 *   - 本脚本：把 Lucide 全量（2100 个）原样落成一份 JSON，供 `@sunset-reverie/icons/lucide-full`
 *     子路径按需引入 —— 用得到全量的项目显式 import 才多付约 98KB（gzip）。
 *
 * 产物只保留渲染必需的字段（prefix / width / height / icons / aliases），
 * 去掉 info、lastModified 这类元数据，体积能再小一点。
 *
 * 用法：`pnpm gen:icons:full`
 */

import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

/** 仓库根目录 */
const ROOT = resolve(import.meta.dirname, '../../..')

/** 输出文件：与子集数据放在同一目录，构建时各自独立成模块 */
const OUTPUT = join(ROOT, 'packages/icons/src/collections/lucide-full.json')

/** 用包的解析规则找到 @iconify-json/lucide（它是 icons 包的 devDependency） */
const require = createRequire(import.meta.url)

/**
 * 主流程：读取全量 → 裁剪字段 → 落盘 → 打印体积
 * @returns {void}
 * @throws {Error} 找不到图标包或数据结构异常时抛出
 */
function main() {
  const source = require.resolve('@iconify-json/lucide/icons.json')
  const raw = require(source)

  if (!raw?.icons || typeof raw.icons !== 'object') {
    throw new Error('@iconify-json/lucide 数据结构不符合预期（缺少 icons）')
  }

  const data = {
    prefix: raw.prefix ?? 'lucide',
    width: raw.width ?? 24,
    height: raw.height ?? 24,
    icons: raw.icons,
    ...(raw.aliases ? { aliases: raw.aliases } : {}),
  }

  const json = `${JSON.stringify(data)}\n`
  mkdirSync(dirname(OUTPUT), { recursive: true })
  writeFileSync(OUTPUT, json, 'utf-8')

  const count = Object.keys(data.icons).length
  console.log(`[gen:icons:full] ${data.prefix}: ${count} 个图标 → ${OUTPUT}`)
  console.log(
    `[gen:icons:full] 源码 ${(json.length / 1024).toFixed(0)}KB，gzip ${(
      gzipSync(json).length / 1024
    ).toFixed(0)}KB`,
  )
}

try {
  main()
} catch (error) {
  console.error(`[gen:icons:full] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}
