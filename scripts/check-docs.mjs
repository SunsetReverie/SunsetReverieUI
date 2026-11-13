import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'

/**
 * 文档站守卫
 *
 * 旧版只跑 `md.includes(name)`：任何表格、甚至正文里顺带提一句都算通过，
 * 于是「34 个组件」「不存在的 prop」「断锚」「侧边栏漏掉一页」全都能混过去。
 * 现在按六组不变量核对：
 *   1. 组件目录 ↔ 组件文档 ↔ API 产物
 *   2. Props / 事件 / 插槽表按区块解析后的**名字**与 props.json 精确比对
 *   3. 侧边栏 / 导航链接覆盖全部文档，且没有死链
 *   4. 站内链接与锚点指向真实文件与标题
 *   5. 门面数字与过时表述
 *   6. 正文内联代码里的未转义 Vue 插值（会让 SSR 构建直接失败）
 *
 * 退出码：0 通过；1 发现缺口。
 */

const COMPONENTS = 'packages/ui/src/components'
const DOCS = 'docs/components'
const GUIDES = 'docs/guide'
const CONFIG = 'docs/.vitepress/config.ts'
/**
 * API 事实源的候选路径
 *
 * `docs/api/props.json` 随仓库分发，干净检出（CI、新 clone）也有；
 * `playground-*` 里的那份只服务本地演示站，不进远程仓库。
 */
const PROPS_JSON_CANDIDATES = ['docs/api/props.json', 'playground-vue3/src/demos/props.json']
const HOME = 'docs/index.md'
const OVERVIEW = 'docs/components/index.md'

/** 正文里不该再出现的旧事实 */
const STALE_PATTERNS = [
  { pattern: /34 个组件|全部 34 个|共 34 个/, hint: '组件数量以 components 目录为准' },
  { pattern: /30 个组件的 SSR|30 个组件冒烟/, hint: '冒烟覆盖数以 lint:smoke 输出为准' },
  { pattern: /大部分 P2|尚未实现/, hint: 'P0–P2 已全量落地，组件均已实现' },
]

/** 源码里动态生成的插槽占位名，文档不可能逐字写出 */
const IGNORED_SLOT = /^[`${]|slotNameOf|insertPanel\.slotName|^\$slots/

/** 表格表头里表示「这一列是名字」的写法 */
const NAME_HEADERS = new Set(['名称', '字段', 'prop', '参数', '插槽', '事件'])

/** 表示 Prop 表的表头 */
const PROP_HEADERS = new Set(['prop', '名称', '字段', '参数'])

const problems = []
const warnings = []

/**
 * 记一条必须修的问题
 * @param name 组件或文件名
 * @param kind 缺口类别
 * @param items 具体项
 * @returns 无
 */
function fail(name, kind, items) {
  if (items.length) problems.push({ name, kind, items })
}

/**
 * 把 Markdown 切成 h2 区块
 * @param md 文档全文
 * @returns 区块列表，含标题与行内容
 */
function splitSections(md) {
  const lines = md.split('\n')
  const sections = []
  let current = { title: '', lines: [] }

  for (const line of lines) {
    const heading = /^##\s+(.+)$/.exec(line)
    if (heading) {
      sections.push(current)
      current = { title: heading[1].trim(), lines: [] }
    } else current.lines.push(line)
  }
  sections.push(current)
  return sections
}

/**
 * 从表格行首列取出反引号包住的名字
 *
 * @param line 表格行
 * @returns 名字列表；不是数据行时返回空数组
 */
function rowNames(line) {
  if (!/^\|\s*`/.test(line)) return []
  const firstCell = line.split('|')[1] ?? ''
  return [...firstCell.matchAll(/`([^`]+)`/g)].map((match) => match[1].trim())
}

/**
 * 按区块解析文档的 API 名字
 *
 * 59 篇用 `## Props / ## 事件 / ## 插槽` 三段式，另有 10 篇沿用合并的
 * `## API`（里面用 `###` 分小节）。两种都要认，但只看对应区块里的表格，
 * 避免把「按需隐藏部件」「插槽作用域参数」这类表误当成 Props。
 *
 * @param md 文档全文
 * @returns { props: string[], emits: string[], slots: string[] }
 */
function parseApiNames(md) {
  const found = { props: new Set(), emits: new Set(), slots: new Set() }

  for (const section of splitSections(md)) {
    const parent = section.title
    let isProps = /^Props/.test(parent)
    let isApi = /^API/.test(parent)
    let isEvents = /^事件/.test(parent)
    let isSlots = /^插槽/.test(parent)
    if (!isProps && !isApi && !isEvents && !isSlots) continue

    for (let i = 0; i < section.lines.length; i += 1) {
      const line = section.lines[i]

      // `## API` 里常用 `### 插槽（组件式）` / `### 事件（组件式）` 再分小节，
      // 遇到这类三级标题就临时改写本节的类型；`### SrMusicPlayer` 只分组件，
      // 不改变类型，仍按 Props 表收集
      const sub = /^###\s+(.+)$/.exec(line)
      if (sub) {
        const name = sub[1].trim()
        if (/^插槽/.test(name)) {
          isProps = isApi = isEvents = false
          isSlots = true
        } else if (/^事件/.test(name)) {
          isProps = isApi = isSlots = false
          isEvents = true
        }
        continue
      }

      if (!/^\| /.test(line)) continue
      if (/^\| /.test(section.lines[i - 1] ?? '')) continue // 非表头
      const headerZh = (line.split('|')[1] ?? '').trim()
      if (!NAME_HEADERS.has(headerZh.toLowerCase())) continue

      // 区块标题 + 表头共同决定这张表属于哪一类，避免把「插槽作用域参数」
      // 「关闭原因」这类补充说明表误当成 API 表
      let bucket = null
      if (headerZh === '事件' && (isEvents || isApi)) bucket = 'emits'
      else if (headerZh === '插槽' && (isSlots || isApi)) bucket = 'slots'
      else if (isSlots && headerZh === '名称') bucket = 'slots'
      else if (PROP_HEADERS.has(headerZh.toLowerCase()) && (isProps || isApi)) bucket = 'props'
      if (!bucket) continue

      for (let j = i + 1; j < section.lines.length; j += 1) {
        const row = section.lines[j]
        if (!/^\|/.test(row)) break
        if (/^\|\s*-+/.test(row)) continue
        for (const name of rowNames(row)) found[bucket].add(name)
      }
    }
  }

  return {
    props: [...found.props].filter(Boolean),
    emits: [...found.emits].filter(Boolean),
    slots: [...found.slots].filter(Boolean),
  }
}

/**
 * 生成 VitePress 风格的标题锚点
 * @param text 标题文本
 * @returns 归一化后的锚点
 */
function slug(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[`*_~$]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
}

/**
 * 收集文档里的所有标题锚点
 * @param md 文档全文
 * @returns 锚点集合
 */
function headingSlugs(md) {
  const set = new Set()
  for (const match of md.matchAll(/^#{1,6}\s+(.+)$/gm)) set.add(slug(match[1]))
  return set
}

/**
 * 找正文里未转义的 Vue 插值（围栏代码块与实时演示模板不算）
 * @param md 文档全文
 * @returns 出问题的行号列表
 */
function findUnescapedMustache(md) {
  const bad = []
  let fenced = false
  md.split('\n').forEach((line, index) => {
    if (/^```/.test(line)) {
      fenced = !fenced
      return
    }
    if (fenced) return
    // 只看行内代码：`` `{{ item.title }}` `` 这类才会被 Vue 模板编译器解析
    if (/`[^`]*\{\{[^`]*`/.test(line) && !line.includes('v-pre')) bad.push(index + 1)
  })
  return bad
}

// ---------- 1. 文件与产物 ----------
const PROPS_JSON = PROPS_JSON_CANDIDATES.find((file) => existsSync(file))

if (!PROPS_JSON) {
  console.error(
    `[文档校验] 找不到 API 事实源（${PROPS_JSON_CANDIDATES.join(' 或 ')}），先跑 pnpm gen:demo-props`,
  )
  process.exit(1)
}

const api = JSON.parse(readFileSync(PROPS_JSON, 'utf-8'))
const componentNames = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

// ---------- 2. 每篇文档的 API 表 ----------
for (const name of componentNames) {
  const docFile = join(DOCS, `${name}.md`)
  if (!existsSync(docFile)) {
    problems.push({ name, kind: '整篇缺失', items: [docFile] })
    continue
  }

  const md = readFileSync(docFile, 'utf-8')
  const entry = api[name]
  if (!entry) {
    problems.push({ name, kind: 'API 产物缺失', items: ['pnpm gen:demo-props'] })
    continue
  }

  const documented = parseApiNames(md)
  const expectedProps = [...new Set((entry.options || []).map((option) => option.name))]
  const expectedEmits = (entry.emits || []).map((item) => (typeof item === 'string' ? item : item.name))
  const expectedSlots = (entry.slots || [])
    .map((item) => (typeof item === 'string' ? item : item.name))
    .filter((item) => item && !IGNORED_SLOT.test(item))

  fail(
    name,
    'Props 漏写',
    expectedProps.filter((item) => !documented.props.includes(item)),
  )
  fail(
    name,
    '事件漏写',
    expectedEmits.filter((item) => !documented.emits.includes(item)),
  )
  fail(
    name,
    '插槽漏写',
    expectedSlots.filter((item) => !documented.slots.includes(item)),
  )

  const extra = documented.props.filter((item) => !expectedProps.includes(item))
  if (extra.length) {
    warnings.push(
      `${name}: Props 区块还列了 ${extra.join(', ')}（多半是同区块的数据结构字段表，确认无误即可）`,
    )
  }

  const mustache = findUnescapedMustache(md)
  fail(
    name,
    '未转义插值（需 <code v-pre>）',
    mustache.map((line) => `第 ${line} 行`),
  )
}

// ---------- 3. 导航与侧边栏覆盖 ----------
const config = readFileSync(CONFIG, 'utf-8')
const componentLinks = new Set([...config.matchAll(/link: '\/components\/([^']+)'/g)].map((m) => m[1]))
const guideLinks = new Set([...config.matchAll(/link: '\/guide\/([^']+)'/g)].map((m) => m[1]))

const componentDocs = readdirSync(DOCS)
  .filter((file) => file.endsWith('.md') && file !== 'index.md')
  .map((file) => basename(file, '.md'))
const guideDocs = readdirSync(GUIDES)
  .filter((file) => file.endsWith('.md'))
  .map((file) => basename(file, '.md'))

fail(
  '侧边栏',
  '组件文档未挂进侧边栏',
  componentDocs.filter((name) => !componentLinks.has(name)),
)
fail(
  '侧边栏',
  '指南文档未挂进侧边栏',
  guideDocs.filter((name) => !guideLinks.has(name)),
)
fail(
  '侧边栏',
  '死链（组件）',
  [...componentLinks].filter((name) => name && !existsSync(join(DOCS, `${name}.md`))),
)
fail(
  '侧边栏',
  '死链（指南）',
  [...guideLinks].filter((name) => !existsSync(join(GUIDES, `${name}.md`))),
)

// ---------- 3.9 首页的组件数量口径 ----------
// 首页那个「N 个组件」是纯手写的数字，最容易随新增组件漂移。
// 这里直接和目录数对比，避免像 71 / 69 那样两处不一致。
if (existsSync(HOME)) {
  const homeText = readFileSync(HOME, 'utf-8')
  // 排除「N 个组件进 SSR 冒烟页」这类描述覆盖数的句子，只认「N 个组件」独立成句
  const declared = [...homeText.matchAll(/(\d+)\s*个组件(?!\s*进)/g)].map((m) => Number(m[1]))

  const mismatched = declared.filter((count) => count !== componentNames.length)
  if (mismatched.length) {
    problems.push({
      name: 'index.md',
      kind: '组件数量与实际不符',
      items: [`写的是 ${mismatched.join(', ')}，实际 ${componentNames.length} 个`],
    })
  }
}

// ---------- 4. 站内链接与锚点 ----------
const docFiles = [
  HOME,
  OVERVIEW,
  ...componentDocs.map((name) => join(DOCS, `${name}.md`)),
  ...guideDocs.map((name) => join(GUIDES, `${name}.md`)),
]

for (const docFile of docFiles) {
  if (!existsSync(docFile)) continue
  const md = readFileSync(docFile, 'utf-8')
  const brokenLinks = []
  const brokenAnchors = []

  // 行内代码里的 `![](返回地址)`、`[点我](javascript:...)` 是示例文本，不是链接
  const linkText = md.replace(/`[^`]*`/g, '')
  for (const match of linkText.matchAll(/\]\(([^)]+)\)/g)) {
    const raw = match[1].trim()
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) continue // 外部协议（含 javascript: 示例）

    const [linkPart, anchorPart] = raw.split('#')
    let target = null

    if (linkPart.startsWith('/components/')) {
      const key = linkPart.replace('/components/', '') || 'index'
      target = join(DOCS, `${key}.md`)
    } else if (linkPart.startsWith('/guide/')) {
      target = join(GUIDES, `${linkPart.replace('/guide/', '')}.md`)
    } else if (linkPart.endsWith('.md')) {
      target = resolve(dirname(docFile), linkPart)
    } else if (linkPart && !linkPart.startsWith('/')) {
      target = resolve(dirname(docFile), linkPart)
    } else if (linkPart === '' || linkPart.startsWith('#')) {
      target = docFile
    }

    if (target && !existsSync(target)) {
      brokenLinks.push(raw)
      continue
    }

    if (anchorPart && target) {
      const slugs = headingSlugs(readFileSync(target, 'utf-8'))
      if (!slugs.has(slug(decodeURIComponent(anchorPart)))) brokenAnchors.push(raw)
    } else if (raw.startsWith('#')) {
      const slugs = headingSlugs(md)
      if (!slugs.has(slug(decodeURIComponent(anchorPart ?? '')))) brokenAnchors.push(raw)
    }
  }

  fail(docFile, '站内链接指向不存在的文件', brokenLinks)
  fail(docFile, '锚点没有对应标题', brokenAnchors)
}

// ---------- 5. 门面事实 ----------
for (const file of [HOME, OVERVIEW, ...guideDocs.map((name) => join(GUIDES, `${name}.md`))]) {
  if (!existsSync(file)) continue
  const md = readFileSync(file, 'utf-8')
  const stale = STALE_PATTERNS.filter((item) => item.pattern.test(md)).map((item) => item.hint)
  fail(file, '过时表述', stale)
}

// ---------- 输出 ----------
if (warnings.length) {
  console.log(
    `[文档校验] 提醒：${warnings.length} 条（不阻断，` + `跑 node scripts/check-docs.mjs --verbose 看明细）`,
  )
  if (process.argv.includes('--verbose')) for (const warning of warnings) console.log(`  ${warning}`)
}

if (problems.length) {
  console.error(`\n[文档校验] 发现 ${problems.length} 处缺口：\n`)
  for (const problem of problems) {
    console.error(`  ${problem.name} · ${problem.kind}`)
    console.error(`    ${problem.items.join(', ')}`)
  }
  console.error('\n补到 docs/components/<组件>.md 或 docs/.vitepress/config.ts 里。\n')
  process.exit(1)
}

console.log(
  `[文档校验] 通过（${componentNames.length} 个组件 / ${componentDocs.length} 篇组件文档 / ` +
    `${guideDocs.length} 篇指南；Props / 事件 / 插槽、侧边栏、站内链接与门面事实均已核对）`,
)
