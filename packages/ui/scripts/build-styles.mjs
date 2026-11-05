/**
 * 样式产物构建脚本
 *
 * 分别产出：
 * - dist/base.css   仅 CSS 变量 + reset（全站引入一次）
 * - dist/style.css  base + 全部组件样式
 *
 * 为什么要拆：CSS 变量的 :root 块若被打进每个组件的 CSS，
 * 会导致体积重复，且后加载的组件可能覆盖前面的主题变量。
 *
 * 说明：W1 直接用 Less 的 render API 编译，不经过 PostCSS。
 * 若后续需要 autoprefixer / cssnano，改为走 Vite 的 CSS 管线即可。
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import less from 'less'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const OUT_DIR = resolve(ROOT, 'dist')

/**
 * 编译单个 Less 入口为 CSS 文件
 * @param {string} entry 相对包根目录的 Less 路径
 * @param {string} outFile 输出文件名（位于 dist 下）
 * @returns {Promise<void>}
 */
async function compile(entry, outFile) {
  const entryPath = resolve(ROOT, entry)
  const source = readFileSync(entryPath, 'utf-8')

  const result = await less.render(source, {
    filename: entryPath,
    javascriptEnabled: true,
    paths: [resolve(ROOT, 'src')],
  })

  const target = resolve(OUT_DIR, outFile)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, result.css, 'utf-8')
  console.log(`[ui] 生成 dist/${outFile}（${(result.css.length / 1024).toFixed(1)} KB）`)
}

async function main() {
  await compile('src/styles/base/index.less', 'base.css')
  await compile('src/styles/index.less', 'style.css')
}

main().catch((error) => {
  console.error('[ui] 样式构建失败：', error.message)
  process.exit(1)
})
