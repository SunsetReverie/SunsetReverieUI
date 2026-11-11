#!/usr/bin/env node
/**
 * 发版打包：把四个包各打成一个 tarball，输出到 `release/`
 *
 * 分发方式是「Release 挂 tgz 附件」，所以每次发版都要产出标准 tarball：
 * tarball 里的包名、files、exports 都是正确的，下游用 npm / pnpm 直接装 URL 即可，
 * 不存在从 Git 装到 monorepo 根壳、也装不到构建产物的问题。
 *
 * 为什么不用 Git 依赖分发：Git 依赖会把整棵仓库树装进 node_modules，
 * 且本仓库的 dist 不进版本库、根 package.json 是 private 壳，
 * 装下来是一个没有入口的空包。tarball 是唯一不牺牲现有构建体系的可行形态。
 *
 * 用法：`pnpm release:pack`（先 `pnpm build`，否则 dist 缺失会直接报错退出）
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

/** 仓库根目录，脚本固定从自身的上一级推导，不依赖当前工作目录 */
const ROOT = resolve(import.meta.dirname, '..')

/** 包源码目录 */
const PACKAGES_DIR = join(ROOT, 'packages')

/** tarball 输出目录（已被 .gitignore 忽略） */
const RELEASE_DIR = join(ROOT, 'release')

/**
 * 读取全部待打包的包信息
 *
 * 只认 `packages/` 下带 `dist` 目录的子目录，避免把示例工程也卷进来。
 * @returns {{ dir: string, name: string, version: string }[]} 包的目录名、包名与版本号
 * @throws {Error} package.json 缺失或不是合法 JSON 时抛出
 */
function readPackages() {
  const entries = readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((dir) => existsSync(join(PACKAGES_DIR, dir, 'package.json')))

  const packages = entries.map((dir) => {
    const manifest = JSON.parse(readFileSync(join(PACKAGES_DIR, dir, 'package.json'), 'utf-8'))
    return { dir, name: manifest.name, version: manifest.version }
  })

  // 排序只为输出稳定，与打包顺序无关
  return packages.sort((a, b) => a.dir.localeCompare(b.dir))
}

/**
 * 校验每个包都已构建
 *
 * 没构建就 pack 会得到一个只有 package.json 的空壳，且 pnpm 只给一句警告，
 * 很容易在发版时被忽略，所以这里提前拦成硬错误。
 * @param {{ dir: string, name: string }[]} packages 待校验的包
 * @throws {Error} 任一包的 dist 目录不存在时抛出
 */
function assertBuilt(packages) {
  const missing = packages.filter((pkg) => !existsSync(join(PACKAGES_DIR, pkg.dir, 'dist')))

  if (missing.length > 0) {
    throw new Error(
      `以下包缺少 dist，先执行 pnpm build：\n${missing.map((pkg) => `  - ${pkg.name}`).join('\n')}`,
    )
  }
}

/**
 * 清空上一次的 tarball
 *
 * 只删 `*.tgz`，不动目录里的其它人工文件，避免误删。
 * @throws {Error} 目录存在但无法写入时抛出
 */
function cleanRelease() {
  if (!existsSync(RELEASE_DIR)) {
    mkdirSync(RELEASE_DIR, { recursive: true })
    return
  }

  for (const file of readdirSync(RELEASE_DIR)) {
    if (file.endsWith('.tgz')) rmSync(join(RELEASE_DIR, file), { force: true })
  }
}

/**
 * 打包单个包
 *
 * 交给 pnpm 而非手写 tar，是为了让 files 字段、publishConfig、包名前缀
 * 等规则与后续可能接入的 registry 发布完全一致。
 * @param {string} name 包名，如 `@sunset-reverie/ui`
 * @throws {Error} pnpm 退出码非零时抛出，并把 stderr 带上便于排查
 */
function pack(name) {
  const result = spawnSync('pnpm', ['--filter', name, 'pack', '--pack-destination', RELEASE_DIR], {
    cwd: ROOT,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  if (result.status !== 0) {
    throw new Error(`打包失败：${name}\n${result.stderr || result.stdout || ''}`)
  }
}

/**
 * 汇总产物清单并打印
 *
 * @returns {void}
 */
function report() {
  const files = readdirSync(RELEASE_DIR).filter((file) => file.endsWith('.tgz'))

  console.log(`\n共生成 ${files.length} 个 tarball（${RELEASE_DIR}）：`)
  for (const file of files) {
    const size = statSync(join(RELEASE_DIR, file)).size
    console.log(`  ${file}  ${(size / 1024).toFixed(0)} KB`)
  }

  console.log(
    '\n下一步：把 release/ 下的 tgz 全部挂到 Git Release（tag 与包版本同名），\n' +
      '再把 docs/guide/getting-started.md 里的安装 URL 换成新版本号。',
  )
}

/**
 * 主流程：校验 → 清理 → 逐个打包 → 汇报
 *
 * @returns {void}
 * @throws {Error} 任一环节失败时抛出，由顶层捕获后以非零码退出
 */
function main() {
  const packages = readPackages()
  assertBuilt(packages)
  cleanRelease()

  for (const pkg of packages) {
    console.log(`打包 ${pkg.name}@${pkg.version} ...`)
    pack(pkg.name)
  }

  report()
}

try {
  main()
} catch (error) {
  console.error(`\n[release:pack] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}
