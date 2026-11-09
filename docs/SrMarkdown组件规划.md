# SrMarkdown 组件规划（草案）

> 本文是 `SrMarkdown` / `SrMarkdownEditor` 的规划与决策记录，独立于 `夕梦UI组件库开发规划.md`。
> 状态：**方案已定稿**。11 项决策全部拍板，仅「异步解析占位形态」一项细节留待实施时确定。

> 编写日期：2026-11-09　目标周期：待评估
> 依赖策略基线：UI 包运行时仅 `@iconify/vue`，peer 仅 `vue`

---

## 目录

| 章节 | 标题 |
| --- | --- |
| 一 | [背景与定位](#一背景与定位) |
| 二 | [核心矛盾](#二核心矛盾) |
| 三 | [编辑器形态选型](#三编辑器形态选型) |
| 四 | [解析器策略](#四解析器策略) |
| 五 | [代码高亮](#五代码高亮) |
| 六 | [扩展机制（四层）](#六扩展机制四层) |
| 七 | [组件拆分与 API](#七组件拆分与-api) |
| 八 | [工具栏](#八工具栏) |
| 九 | [安全设计](#九安全设计) |
| 十 | [已知限制](#十已知限制) |
| 十一 | [实施阶段](#十一实施阶段) |
| 十二 | [待决策清单](#十二待决策清单) |
| 十三 | [参考实现对照（StarRiver-UI）](#十三参考实现对照starriver-ui) |

---

## 一、背景与定位

### 1.1 为什么要单独做

现有的 `SrInput`（多行 `textarea`）只能承载纯文本。内容型产品需要的是：

- 写作时能实时看到渲染结果
- 支持 Markdown 语法
- **能扩展自定义语法**（短代码），因为不同业务会插入图集、视频、商品卡片这类结构化区块

第三点是关键差异：它不是"给 textarea 加个预览"，而是"一套可扩展的渲染管线 + 一个编辑器外壳"。

### 1.2 定位

| 项 | 说明 |
| --- | --- |
| 使用方 | 后台写作端（`SrMarkdownEditor`）、前台展示端（`SrMarkdown`） |
| 内容来源 | 内部人员写作 + 允许 UGC，按严格模式设计（见 9.1） |
| 语法范围 | CommonMark + GFM，由外部解析器提供 |
| 扩展方式 | 四层可插拔，见第五节 |

### 1.3 明确不做

- **不做所见即所得（WYSIWYG）**。理由见第三节。
- **不自研 Markdown 解析器**。理由见第二节。
- **不做协同编辑**。范围外。
- **不做移动端工具栏适配**的完整方案（可后续补）。

---

## 二、核心矛盾

Markdown 解析是**规范密集**的工作，不是"写个正则就能搞定"：

- CommonMark 规范有数百条边界规则（嵌套列表的缩进、强调符号的歧义、链接与图片的优先级……）
- GFM 再加表格、任务列表、删除线、自动链接
- 自行实现至少 5000 行，且需要长期维护才能跟上社区修正

这与 `SrQRCode` 的情况不同：QR 编码有明确的算法终点（码表 + RS 纠错 + 掩码），一旦对就永远对。Markdown 没有终点，只有持续修补。

**结论**：解析器不能背在自己身上。方案的核心问题因此变成——

> 在"不内置解析器"的前提下，如何做出足够的扩展性？

---

## 三、编辑器形态选型

### 3.1 三种形态

| 形态 | 说明 | 扩展成本 | 评价 |
| --- | --- | --- | --- |
| A. 源码编辑 | 纯 `textarea`，无预览 | 低 | 太弱，算不上编辑器 |
| B. 分栏 + 实时预览 | 左写右渲染 | 中 | 主流方案 |
| C. 所见即所得 | Tiptap / ProseMirror | 高（5~10 倍） | 不是 Markdown 编辑器 |

### 3.2 为什么不做 WYSIWYG

C 看起来最"高级"，但它的本质是**富文本编辑器**：

- 内部是 ProseMirror / Slate 的文档树，Markdown 只是导入导出格式
- 短代码需要在 `Node` 层注册 schema、写 `parseDOM` / `toDOM` / `renderHTML`
- 输入时的语法糖（`**bold**` 自动变粗）要额外实现，且与 Markdown 的"字面量"语义冲突

你要的"可扩展短代码"，在 B 里就是一行正则 + 一个渲染函数；在 C 里是一个自定义 Node 的完整实现。

**选定：B（分栏 + 实时预览）**，通过 `mode` 支持降级为纯编辑或纯预览。

**已定**：不做 C。短代码在编辑器内不高亮，靠右侧实时预览看效果（见 10.1）。

---

## 四、解析器策略

### 4.1 三种做法

| 方案 | 说明 | 问题 |
| --- | --- | --- |
| ① 自带解析器 | 内联一套实现 | 只支持子集会让用户困惑；内联第三方破坏零依赖 |
| ② 硬依赖 markdown-it | 装进 `dependencies` | 所有用户都背上 ~100KB，哪怕不用这个组件 |
| ③ **可选 peer + 适配器** | 用户自己装，组件只定义接口 | 需要用户多一步安装 |

### 4.2 选定：可选 peer + markdown-it

组件不 import 任何解析库，只约定接口（见 4.3）。**具体解析器定稿为 markdown-it**。

#### 为什么是 markdown-it 而不是 marked

实测体积（bundlephobia）：

| 包 | min | gzip | 依赖数 |
| --- | --- | --- | --- |
| marked | 47.4KB | **14.3KB** | **0** |
| markdown-it | 95.9KB | 39.8KB | 6 |

体积上 marked 明显更优，gzip 差 25KB 且零依赖。但对方的需求来说，**扩展性权重远高于体积**，这项 markdown-it 优势是决定性的。

**① 短代码有更优雅的语法方案**

markdown-it 配合 `markdown-it-container` 可以直接支持围栏式短代码：

```md
::: gallery
![](a.jpg)
![](b.jpg)
:::
```

比正则替换强在**短代码能包含内容**——图集要写图片、卡片要写描述，正则方案只能做无内容的占位标记。marked 的 `extensions` 也能实现，但需要手写 tokenizer，生态和示例都少。

**② 渲染规则的覆盖粒度更细**

```ts
md.renderer.rules.heading_open = (tokens, idx) => { /* 精确控制 */ }
```

markdown-it 的 token 分 block 和 inline 两层，能精确到单个 token 的属性。marked 的 token 粒度更粗，行内层面支持有限。

**③ 插件生态**

`-footnote` / `-attrs` / `-anchor` / `-task-lists` / `-container` / `-emoji` 等成熟插件齐全。使用方需要的语法，很可能已经有人做了。

#### 体积差如何处理

25KB gzip 对后台写作工具可以忽略。且按可选 peer 策略，**这个体积不进 UI 包**，只在使用方项目里。

若在意首屏体积，用动态 `import()` 把整个编辑器 chunk 拆出去——编辑器本来就不在首屏。

#### 不传 engine 时的行为

`SrMarkdown` 在没传 `engine` 时不具备渲染能力，此时**显式报错**而非静默降级，否则用户会以为是组件坏了。

#### 内置最小解析器：提供，但默认关闭

**已定**：内置一个精简解析器作为兜底，需显式开启，默认不生效。

```vue
<SrMarkdown :source="content" engine="builtin" />
```

理由：完全不给默认值，第一次用的人会撞上「没传 engine 就报错」，得先去看文档才知道要装 markdown-it。有个兜底能让组件先跑起来。

但**不能默认开启**，否则用户会以为它支持全部语法，遇到嵌套列表、任务列表失效时来找 bug。默认关闭 + 文档里明确写「内置只支持这些语法」，预期才是对的。

内置解析器覆盖范围（和旧库 `parser.ts` 基本一致）：

| 支持 | 不支持 |
| --- | --- |
| 标题 h1-h6、段落、引用 | 嵌套列表 |
| 有序/无序列表（单层） | 任务列表 |
| 代码块（无高亮）、行内代码 | 内联 HTML |
| 表格（含对齐） | 脚注、定义列表 |
| 链接、图片、自动链接 | 数学公式 |
| 粗体、斜体、删除线 | 任何 markdown-it 插件 |
| 分割线、短代码扩展 | — |

**内置解析器只用于「先跑起来」**，正式使用建议换 markdown-it。这句要写进文档首屏，不能只藏在 props 表里。

### 4.3 引擎接口：同步与异步都支持

```ts
interface SrMarkdownEngine {
  /** 把 Markdown 源码渲染成 HTML；允许返回 Promise */
  render(source: string): string | Promise<string>
}
```

**必须支持异步**，理由是高亮：

markdown-it 的 `highlight` 钩子是**同步**的，而 shiki 的初始化是**异步**的。如果引擎接口锁死同步，shiki 这条路直接堵死，只能退回 highlight.js。

代价是 `SrMarkdown` 要处理加载态——解析完成前内容区显示占位。这个成本可接受，换来的是不强绑任何一种高亮器。

组件内部处理：

| 返回值 | 处理 |
| --- | --- |
| `string` | 直接渲染，无加载态 |
| `Promise<string>` | 先显示占位，resolve 后替换 |

> 待定：占位形态用骨架条还是保持旧内容（内容切换时不闪）。

---

## 五、代码高亮

### 5.1 原则：不进组件库

高亮器和解析器一样，属于使用方已有的技术选型。组件库内置任何一种都会造成冲突——比如前台已经用 shiki 的主题，再被塞一个 highlight.js 的样式表，代码块会互相打架。

**组件库只保证接口能接，不代替使用方选择。**

### 5.2 接入方式

高亮完全通过 markdown-it 自己的 `highlight` 钩子接入，`SrMarkdown` 不需要任何额外 API：

```ts
const md = new MarkdownIt({
  highlight: (code, lang) => {
    // 返回空字符串时，markdown-it 会走默认转义
    if (!lang) return ''
    return `<pre class="hljs"><code>${highlighter(code, lang)}</code></pre>`
  },
})
```

约定：钩子返回以 `<pre` 开头的完整 HTML 时，markdown-it 不再额外包一层。

### 5.3 三个高亮器对比

| 方案 | min | gzip | 依赖 | 渲染时机 | 主题质量 |
| --- | --- | --- | --- | --- | --- |
| prismjs | 18.5KB | 7.0KB | 0 | 同步 | 一般 |
| shiki | 205.7KB | 63.9KB | 8 | 异步（可同步预加载） | **最好**（VSCode 主题） |
| highlight.js | 901.4KB | 299.9KB | 0 | 同步 | 一般 |

后两行是**全量**体积。按需引入后差别很大：

- highlight.js 只引 5 种语言约 40KB，不是 900KB
- shiki core + 5 种语言 + 1 个主题约 100KB

### 5.4 同步与异步的取舍

| | 同步（hljs / prism） | 异步（shiki） |
| --- | --- | --- |
| 编辑器实时预览 | 简单，直接塞进 `highlight` 钩子 | 需要预加载或外层转 async |
| SSR 首屏 | 服务端同步渲染即可 | 服务端也支持，但要注意 await |
| 视觉效果 | 一般 | 最好 |
| 语言按需加载 | 手动 import | 内置动态加载 |

### 5.5 两个可运行的接入示例

文档里会同时给出，**不预设哪个更该用**：

**示例 A：highlight.js（同步，最省事）**

```ts
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import css from 'highlight.js/lib/languages/css'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('css', css)

const engine = {
  render: (src: string) =>
    new MarkdownIt({
      highlight: (code, lang) =>
        lang && hljs.getLanguage(lang)
          ? `<pre class="hljs"><code>${hljs.highlight(code, { language: lang }).value}</code></pre>`
          : '',
    }).render(src),
}
```

**示例 B：shiki（异步，效果最好）**

```ts
import MarkdownIt from 'markdown-it'
import { createHighlighter } from 'shiki'

const highlighter = await createHighlighter({
  themes: ['github-light'],
  langs: ['javascript', 'css', 'vue'],
})

const md = new MarkdownIt({
  highlight: (code, lang) =>
    `<pre class="shiki">${highlighter.codeToHtml(code, { lang, theme: 'github-light' })}</pre>`,
})

const engine = { render: (src: string) => md.render(src) }
```

注意示例 B 的 `await` 在模块顶层——这意味着引擎要在应用启动时准备好，而不是每次渲染现建。**这也正是引擎接口支持异步的意义**。

### 5.6 不预设选型

前台技术栈（Nuxt）尚未开始开发，因此**不绑定任何高亮器**。

Nuxt 生态里 shiki 很常见（Nuxt Content 内置），但如果最终选型是别的（比如 `highlight.js`、`markdown-it-prism`、或构建时用 `rehype-highlight` 预渲染），本组件的接入方式都不用改——始终是"给 markdown-it 配 `highlight` 钩子"这一条路。

选型建议留给前台开发时按实际情况定：

| 场景 | 倾向 |
| --- | --- |
| 内容静态、构建时可确定 | shiki（构建时高亮，客户端零 JS） |
| 内容运行时动态 / UGC | highlight.js 或 prism（同步、体积可控） |
| 已经用了 Nuxt Content | 直接沿用它的 shiki 配置 |

### 5.7 预览性能

编辑器里每次按键都重新渲染 + 高亮整篇，长文档会明显卡顿。

对策按优先级：

1. **预览渲染防抖 150~300ms**（必做，成本低）
2. 只重算变化的代码块（需要缓存已高亮结果，实现成本较高）
3. 编辑器内不高亮、只有前台展示时高亮（降级方案，不推荐）

先做第 1 条，第 2 条等实际反馈。

---

## 六、扩展机制（四层）

这是本组件的核心设计。四层覆盖不同粒度：

### 6.1 第一层：预处理（新增短代码）

在 Markdown 解析**之前**扫描并替换成 HTML。**支持两种语法**，分别对应两类场景：

| 语法 | 形态 | 适合 |
| --- | --- | --- |
| `{{名字 参数}}` | 内联，可写在句子中间 | 无内容占位：视频、商品链接、变量插值 |
| `:::名字 ... :::` | 块级围栏，独占多行 | 有内容：图集、提示框、折叠块 |

#### 内联短代码

```md
这里有张图 {{image id=42}} 点击查看
```

```ts
{
  name: 'image',
  inline: /\{\{image\s+id=(\d+)\}\}/g,
  render: (match) => `<span data-image="${match[1]}"></span>`,
}
```

#### 块级短代码

```md
::: gallery
![](a.jpg)
![](b.jpg)
:::
```

```ts
{
  name: 'gallery',
  block: /^:::\s*gallery\s*\n([\s\S]*?)\n:::\s*$/gm,
  render: (match) => `<div data-gallery>${match[1]}</div>`,
}
```

#### 为什么两种都由组件预处理

块级围栏也可以用 `markdown-it-container` 插件实现，但那样扩展机制就分成两条路——一种靠组件、一种靠插件，使用方要理解两套规则。

**统一在预处理层做**的好处：

- 扩展 API 只有一种形态，注册一次就生效
- 不依赖任何 markdown-it 插件，使用方不必额外安装
- 内联和块级共享同一套参数解析逻辑

代价：块级围栏在替换前不能被 Markdown 当作语法处理，所以**必须整块替换**，内部内容要自己递归渲染或原样保留。

#### 三条硬约束

**① 必须在解析前执行**

否则 `{{...}}` 会被 Markdown 当作普通文本，围栏会被当成一行以 `:::` 开头的段落。

**② 替换结果必须避免被二次解释**

内联替换的产物要保证不含 Markdown 特殊字符（`*` / `_` / `` ` `` / `[`）。旧库踩过的坑：class 名里的 `__` 被粗体规则吃掉。

块级替换的产物要保证独占整行，前后有空行，否则会被并进上一个段落。

**③ 扩展产出的 HTML 视为可信**

和 `allowHtml: false` 不冲突：那个开关管的是**用户输入里的 HTML**，扩展产出的 HTML 来自开发者注册的 `render` 函数，天然可信。

这个边界要在实现时严格分开——先对用户内容做转义，再跑扩展替换，顺序反了就等于开了个后门。

### 6.2 第二层：渲染规则覆盖（改变已有元素）

解析成 AST 后，按节点类型替换渲染函数：

```ts
renderers: {
  // 所有 h2 自动加锚点
  heading: (node, defaultRender) => {
    const html = defaultRender(node)
    return node.level === 2 ? html.replace('<h2', `<h2 id="${slug(node.text)}"`) : html
  },
  // 外链自动加 target / rel
  link: (node, defaultRender) => { /* ... */ },
}
```

**适用**：改输出但不改语法。比如标题加锚点、图片包裹懒加载容器、代码块套高亮。

> 依赖前置：解析器需要能产出 AST。`markdown-it` 的 `renderer.rules` 可以做到等价效果，但需要适配层翻译成本组件的 `renderers` 形态。

### 6.3 第三层：整体替换解析器

`engine` prop 直接换掉：

```ts
// 换成 unified + remark 那套
const engine = {
  render: async (src) => String(await unified().use(remarkParse).use(remarkHtml).process(src)),
}
```

也可用于"后端渲染好 HTML，前端只负责展示"的场景。

返回 `Promise` 时组件显示加载态，详见 4.3。**已定稿支持异步**，理由是不能堵死 shiki 这类异步高亮器。

### 6.4 第四层：完全接管输出

```vue
<SrMarkdown :source="content">
  <template #default="{ ast, html }">
    <!-- 自己渲染 -->
  </template>
</SrMarkdown>
```

**适用**：需要渲染成非 HTML 结构（小程序富文本节点、原生 App 的 JSON 描述）。

### 6.5 四层对照

| 层 | 能力 | 侵入度 | 典型场景 |
| --- | --- | --- | --- |
| ① 预处理 | 新增语法 | 低 | 短代码、`[[toc]]`、变量插值 |
| ② 渲染覆盖 | 改已有元素输出 | 中 | 锚点、懒加载、代码高亮 |
| ③ 换解析器 | 换整套实现 | 高 | remark 生态、后端渲染 |
| ④ 接管输出 | 换目标格式 | 极高 | 非 HTML 目标 |

---

## 七、组件拆分与 API

### 7.1 两个组件

| 组件 | 场景 | SSR |
| --- | --- | --- |
| `SrMarkdown` | 前台文章展示，只读 | 可（纯字符串渲染） |
| `SrMarkdownEditor` | 后台写作 | 仅客户端 |

**`SrMarkdownEditor` 内部复用 `SrMarkdown` 的渲染管线**，保证"预览看到的"与"最终展示的"完全一致。这条不能妥协——两者有偏差，写作者会不断踩"预览正常、发布出错"的坑。

### 7.2 `SrMarkdown` 草图

```ts
{
  source: string              // Markdown 源码
  engine: SrMarkdownEngine    // 必传，不传则显式报错（见 4.2）
  extensions?: SrMdExtension[]
  renderers?: SrMdRenderers
  allowHtml?: boolean         // 默认 false
  linkTarget?: '_blank' | ''  // 默认 '_blank'，外链自动加 rel
  sanitize?: (html: string) => string  // 可选清洗钩子
}
```

插槽：`default`（作用域 `{ html, ast }`）

### 7.3 `SrMarkdownEditor` 草图

```ts
{
  modelValue: string
  engine, extensions, renderers  // 透传给内部 SrMarkdown
  mode?: 'split' | 'edit' | 'preview'   // 默认 'split'
  toolbar?: SrMdToolbarItem[] | false   // false 关掉
  placeholder?: string
  height?: string | number
  readonly?: boolean
  maxLength?: number
  // 上传相关
  upload?: (file: File) => Promise<string>  // 返回图片 URL
}
```

事件：`update:modelValue`、`change`、`save`（`Cmd+S`）、`upload-error`

插槽：`toolbar`、`preview`、`empty`

### 7.4 依赖的现有能力

| 能力 | 来源 |
| --- | --- |
| 浮层定位 | `utils/floating.ts` |
| 焦点管理 | `utils/focus-trap.ts` |
| 全屏时的滚动锁 | `utils/scroll-lock.ts` |
| 图标 | `SrIcon` |
| 弹窗类（如插入链接） | 复用 `SrModal` 或自绘小浮层 |

---

### 7.5 配套组件：SrCodeBlock 与 SrEmojiPicker

两者都作为**独立组件**提供，Markdown 只是复用它们。

#### SrCodeBlock

```ts
{
  code?: string
  lang?: string          // 默认 'text'，不做高亮
  lineNumbers?: boolean  // 默认 false
  copyable?: boolean     // 默认 true
  title?: string         // 顶栏文件名，如 'main.ts'
  wrap?: boolean         // 长行折行，默认 false
}
```

**为什么独立**：

- 文档站、示例页、MDX 场景都要单独展示代码块，不该为此引入整个 Markdown 渲染器
- `SrMarkdown` 内部渲染代码块时复用它的结构，避免两套逻辑漂移

**渲染结构**（来自旧库实践）：

```html
<div class="sr-code">
  <div class="sr-code__bar">        <!-- 顶栏：语言 / 标题 / 复制按钮 -->
  <span class="sr-code__gutter">    <!-- 行号：独立一列 -->
  <pre><code>                        <!-- 高亮结果 -->
```

行号必须是独立一列，**不能按行切分高亮结果**——切分会切断块注释和多行字符串的着色。

#### SrEmojiPicker

```ts
{
  packages?: SrEmojiPackage[]   // 不传用内置字符表情包
  columns?: number
  showRecent?: boolean
}

interface SrEmojiPackage { key: string; name: string; emojis: SrEmojiItem[] }
interface SrEmojiItem { name: string; url?: string; char?: string }
```

`url` 与 `char` 二选一，不额外加 `type` 字段——多一个字段就多一处可能与实际内容不一致的地方。

**导出的工具函数**：

| 函数 | 作用 |
| --- | --- |
| `buildEmojiMap(packages)` | 建「名称 → 表情」查找表，重名以先出现为准 |
| `parseEmojiText(text, map)` | 把 `[名称]` 切成 segments（文本片段 / 表情片段） |
| `stringifyEmoji(item)` | 反向：表情项 → 标记文本 |
| `DEFAULT_EMOJI_PACKAGES` | 内置字符表情包 |

**与 Markdown 的耦合点只有一处**：编辑器插入的是**标记文本** `[微笑]`，渲染时按名称反查。

这样做的好处是**表情包可以整体替换**（字符换成图片、换一套画风），历史内容里存的标记不用动。代价是渲染端必须认识这套标记。

> **必须保证编辑器与渲染器用同一份 `packages`**。否则用户在编辑器里插的表情，预览时查不到，显示成一串 `[表情名]` 纯文本。旧库把这一点写在了 prop 注释里，新实现要在运行时也做一次开发环境告警。

### 7.6 组件间的依赖关系

```
SrEmojiPicker ──(packages)──┐
                            ├──▶ SrMarkdownEditor
SrCodeBlock ─(代码块结构)───┤
                            │
                            └──▶ SrMarkdown ──▶ (engine: markdown-it)
```

| 依赖 | 方向 | 说明 |
| --- | --- | --- |
| `SrMarkdownEditor` → `SrMarkdown` | 强 | 预览区就是 `SrMarkdown` |
| `SrMarkdown` → `SrCodeBlock` 结构 | 弱 | 只复用 HTML 结构与样式，不实例化组件 |
| `SrMarkdownEditor` → `SrEmojiPicker` | 弱 | 工具栏的表情按钮，可选 |

**`SrMarkdown` 不直接依赖 `SrEmojiPicker`**：它只需要 `emojiMap` 这一个查找表，由宿主或编辑器传进来即可。这样只读渲染场景不必引入整个表情面板。

---

## 八、工具栏

### 8.1 可配置

```ts
toolbar: [
  'bold', 'italic', 'strike', '|',
  'heading', 'quote', 'code', '|',
  'unordered-list', 'ordered-list', 'task', '|',
  'link', 'image', 'table', '|',
  { key: 'gallery', label: '插入图集', icon: 'lucide:images', action: (api) => {} },
]
```

自定义项用对象形式，`action` 收到编辑器 API（`insert`、`wrap`、`replaceSelection`）。

### 8.2 完全接管

`#toolbar` 插槽替换整条工具栏，作用域同样给编辑器 API。

### 8.3 行为细节

| 项 | 说明 |
| --- | --- |
| 包裹型（粗体/斜体） | 有选区则包裹，无选区则插入成对符号并把光标放中间 |
| 行首型（标题/引用/列表） | 在当前行首插入前缀，再次点击移除 |
| 插入型（链接/图片/表格） | 需要参数，弹小浮层或直接插模板 |
| 快捷键 | `Cmd/Ctrl + B/I/K`、`Tab` 缩进、`Shift+Tab` 反缩进 |

---

## 九、安全设计

Markdown 渲染是 XSS 高发区，尤其内容来自用户输入时。以下四条**内建**，不靠文档约束：

1. **默认 `html: false`**（不解析裸 HTML），需显式 `allowHtml` 才放开
2. **放开 HTML 时建议接 DOMPurify**，通过 `sanitize` 钩子注入
3. **链接统一处理**：外链加 `target="_blank"` + `rel="noopener noreferrer"`
4. **图片协议白名单**：拦掉 `javascript:`、`data:text/html` 等

### 9.1 内容来源：两种都有

**已定**：既有内部人员写作，也允许普通用户提交。因此**按严格模式做默认，内部场景通过配置放宽**。

| 场景 | 配置 | 说明 |
| --- | --- | --- |
| 默认（UGC） | 上述四条全开 | 不需要任何额外配置 |
| 内部写作 | `allow-html` + 自定义 `sanitize` | 可放宽到允许内联 HTML |

**不要用「可信模式」绕开转义**。即使内部人员写的内容，也可能从网页复制粘贴带进 `<script>`。放宽的只是「是否解析 HTML」这一个开关，转义与协议白名单始终生效。

### 9.2 UGC 场景的额外要求

前端清洗只能挡住浏览器里的执行，**挡不住存储型攻击**。文档里要明确建议：

1. 服务端对 Markdown 源文本做一次同样的渲染 + 清洗
2. 或直接存渲染后的 HTML（存源文本更灵活，推荐存源文本 + 服务端渲染）
3. 存储层限制长度，防止超长内容拖垮渲染

这三条不属于组件职责，但必须写进文档的「接入建议」——否则使用方会以为前端做了 XSS 防护就安全了。

---

## 十、已知限制

### 10.1 短代码在编辑器里不高亮

`{{gallery id=3}}` 在 `textarea` 中就是一行普通文字，只有预览区才变成图集。

要做到"写的也是所见所得"，需要：

- 在 textarea 上叠透明高亮层（字体/换行稍有不一致就错位，脆弱）
- 或改用 `contenteditable`（约等于重写一遍编辑器）

**折中方案**：工具栏提供"插入图集"按钮，点击插入模板文本，右侧实时看效果。

**已定：接受不高亮。** 缓解手段有三条：

1. **工具栏提供插入按钮**：`{{图集}}` 这类短代码由按钮插入模板，不需要手动记语法
2. **右侧预览实时反馈**：写的时候看不到组件外观，但一眼能看到渲染结果
3. **可选的行内提示**：鼠标停在短代码上时，用 `title` 显示「这是一个图集短代码」

不做透明高亮层：字体、行高、换行规则稍有偏差就会错位，维护成本高于收益。

### 10.2 代码高亮的样式要自己带

组件不内置高亮器，也不内置高亮主题的 CSS。

使用方接入 hljs 就要引 `highlight.js/styles/*.css`，用 shiki 就要用它的主题内联样式。**组件的样式表不包含任何代码配色规则**——这条要写进文档，否则用户会发现"代码块没颜色"却不知道缺了什么。

### 10.3 滚动同步

分栏模式下两侧滚动同步，纯 DOM 比例映射在长短内容差异大时会有漂移。不做精细的"行对行"映射。

---

## 十一、实施阶段

### 阶段零：前置组件

`SrCodeBlock` 与 `SrEmojiPicker` 先落地，它们是 Markdown 体系的零件：

| 组件 | 理由 |
| --- | --- |
| `SrCodeBlock` | Markdown 的代码块要复用它的结构与样式；本身也是文档站刚需 |
| `SrEmojiPicker` | 提供表情数据结构与 `parseEmojiText`，Markdown 的标记渲染依赖它 |

两个都可以独立交付、独立验证，不阻塞主线。

### 阶段一：`SrMarkdown` + 四层扩展（核心）

这是价值主体。没有它，编辑器只是个带工具栏的 textarea。

产出：只读渲染器、扩展机制、AST 处理、安全内建。做完即可用于前台文章页。

### 阶段二：`SrMarkdownEditor`

工具栏、分栏、快捷键、tab 缩进、滚动同步、上传接口。

### 阶段三：增强

代码高亮、目录、全屏、字数统计、拖拽上传、粘贴图片。

---

## 十二、待决策清单

### 12.1 已定稿

| # | 决策点 | 结论 | 依据 |
| --- | --- | --- | --- |
| 1 | 编辑器形态 | **分栏 + 实时预览** | 短代码在 WYSIWYG 里要注册 Node schema，成本高出数倍（见三） |
| 2 | 解析器 | **markdown-it，可选 peer** | 扩展性与插件生态决定性优于 marked（见 4.2） |
| 3 | 引擎接口 | **同步/异步都支持** | 锁死同步会堵死 shiki 这类异步高亮器（见 4.3） |
| 4 | 代码高亮 | **不内置**，由使用方经 `highlight` 钩子接入 | 避免与使用方已有的高亮方案冲突（见 5.1） |
| 5 | 高亮器选型 | **不预设** | 前台技术栈尚未开始开发（见 5.6） |
| 6 | `SrCodeBlock` | **独立组件** | 文档站/示例页需要单独用；Markdown 复用其结构（见 7.5） |
| 7 | 表情机制 | **移植 `SrEmojiPicker`** | 标记文本比字符更稳，表情包可整体替换（见 7.5） |
| 8 | 短代码语法 | **两种都支持**：内联 `{{名字 参数}}` + 块级 `:::名字` | 两类场景需求不同，统一在预处理层实现（见 6.1） |
| 9 | 内容来源 | **两者都有**：按严格模式默认，内部场景放宽 | 前端清洗挡不住存储型攻击，必须从严（见 9.1） |
| 10 | 编辑器内短代码高亮 | **不高亮** | 透明高亮层对齐风险高，靠工具栏插入 + 实时预览兜底（见 10.1） |
| 11 | 内置最小解析器 | **提供，但默认关闭** | 兜底用，正式使用建议换 markdown-it（见 4.2） |

### 12.2 仍待确认

| # | 决策点 | 选项 | 当前倾向 |
| --- | --- | --- | --- |
| 12 | 异步解析时的占位形态 | 骨架条 / 保留旧内容 | 待定 |

---

## 十三、参考实现对照（StarRiver-UI）

旧库 `StarRiver-UI` 已有一套完整的 Markdown 体系，全部零依赖自研。重写时值得逐条对照：**代码质量可以直接借鉴，但扩展性路线必须改**。

### 13.1 旧实现盘点

| 文件 | 行数 | 说明 |
| --- | --- | --- |
| `markdown/parser.ts` | 479 | 自研解析器，51 个测试用例 |
| `markdown/SrMarkdown.vue` | 134 | 渲染器，`v-html` + 事件委托 |
| `markdown/style.less` | 320 | 内容排版样式 |
| `markdown-editor/SrMarkdownEditor.vue` | 495 | 编辑器 |
| `markdown-editor/style.less` | 245 | 编辑器样式 |
| `code-block/highlight.ts` | 516 | 自研高亮器（关键词表 + 正则） |
| `code-block/SrCodeBlock.vue` | — | 独立代码块组件 |

约 2200 行，零运行时依赖。

**语法覆盖**：代码块（带行号 / 复制 / 语言标签）、分割线、标题 h1-h6、引用、表格（含对齐）、列表、段落、行内代码、图片、链接、自动链接、粗体、斜体、删除线、表情标记。

**未覆盖**：嵌套列表、任务列表、内联 HTML、任何短代码机制。

### 13.2 值得直接吸收的十条

这几条都是踩过坑后的结论，重写时不必再试错。

**① 先整体转义，再自己拼标签**

```ts
const lines = escapeHtml(source.replace(/\r\n?/g, '\n')).split('\n')
```

安全模型比「解析后 sanitize」可靠：不存在某条规则漏掉、某个标签没被清洗的可能。代价是不支持内联 HTML，但对「展示用户写的内容」这个定位是正确取舍。

**② 链接地址白名单，不安全时退回原文**

```ts
if (!allow(url)) return matched   // 返回整段原文，不是只留 label
```

注释写清了为什么不能只留 `label`：`[点我](javascript:alert(1))` 里的 `)` 会让正则提前截断，只留 label 会得到「点我)」这种残句。**退回原文至少是自洽的**——用户看到语法没被解析，知道有问题。

**③ 占位符池，解决行内规则互相干扰**

自己生成的标签先塞进占位符数组，等所有行内规则跑完再统一还原。原因是粗体规则 `__([^_]+)__` 会吃掉 class 名里的双下划线：

```
<span class="sr-md__emoji sr-md__emoji--char">
        ↓ 被当成加粗
<span class="sr-md<strong>emoji sr-md</strong>emoji--char">
```

用 `markdown-it` 后这层由它内部的 token 机制保证，不用自己处理。

**④ 代码块的行号是独立一列，不切分高亮结果**

```html
<div class="sr-md__code-body">
  <span class="sr-md__code-gutter">1\n2\n3</span>
  <pre><code>...高亮后的 HTML...</code></pre>
</div>
```

注释点明：按行切分高亮结果会切断块注释和多行字符串。这个细节很容易忽略。

**⑤ 复制按钮用事件委托**

`v-html` 插进来的节点不经过 Vue 渲染，挂不了 `@click`。委托挂在容器上，对节点增删天然免疫。

**⑥ 复制内容取 `<code>` 的 `textContent`**

那是浏览器还原后的纯文本，与源码一致，且不含行号（行号是兄弟节点）。

**⑦ 字数统计先剔除语法符号**

```ts
.replace(/^\s{0,3}#{1,6}\s+/gm, '')   // 标题的 #
.replace(/[*_~]/g, '')                 // 强调符号
```

`## 标题` 算 2 字不算 5 字。且注释提醒：`countText` 拿到的是**原始 Markdown**，引用行匹配 `>` 而不是 `&gt;`，不能照搬解析函数里的正则。

**⑧ 样式不加 `scoped`**

`scoped` 靠给模板元素打 `data-v-xxx` 实现，而 `v-html` 的节点拿不到这个属性，选择器一条都匹配不上，结果是「有 class 没样式」的裸 HTML。

隔离改由选择器前缀保证（全部以 `.sr-md` 开头）。**我们现有的样式体系也是全局 less + 类名前缀，正好一致。**

**⑨ `defineProps` 的类型必须内联**

引用外部类型会让编译器顺着 import 链读文件，在非 Node 环境报 `No fs option provided to compileScript`。旧库为此外单独写一份 `types.ts` 作对外文档，并在注释里说明「两处要同步」。

> 我们的项目是全量打包 + vue-tsc，可能不受此限制。实施时验证一次，能引外部类型就引，避免两份定义漂移。

**⑩ 表情存标记文本而非字符**

编辑器插入的是 `[微笑]` 而不是 `😀`，渲染时查表。标记比字符更稳：表情包可以整体换（字符换图片、换画风），历史内容不用动。

### 13.3 旧实现的不足（正是本次要解决的）

| 问题 | 影响 |
| --- | --- |
| **无短代码 / 插件机制** | 加一种自定义语法就要改 `parser.ts`，动内核 |
| **工具栏是硬编码数组** | 只能整体 `toolbar: false` 关掉，不能增删改 |
| **无快捷键** | 没有 `Cmd+B` / `Cmd+K`，写作全靠点按钮 |
| **无滚动同步** | 分栏模式下两侧各自滚，长文档对不上 |
| **无嵌套列表** | 列表正则只匹配单层 |
| **无内联 HTML** | 设计取舍，但对「可信内容」场景是限制 |

前四条是扩展性问题，第五条是语法覆盖问题。`markdown-it` 一次性解决全部五项。

### 13.4 路线差异

两条路的核心分歧是**依赖策略**：

| | StarRiver-UI | 本方案 |
| --- | --- | --- |
| 解析器 | 自研 479 行 | markdown-it（可选 peer） |
| 高亮器 | 自研 516 行（关键词表） | 不内置，使用方接入 |
| 语法覆盖 | 子集，固定 | CommonMark + GFM，可插件扩展 |
| 新增语法 | 改内核源码 | 注册扩展，不碰内核 |
| 依赖数 | 0 | 使用方装 1 个解析器 |
| 体积 | 全部进包 | 不进 UI 包 |

**自研高亮器的实际效果**值得说明：它基于「关键词表 + 正则」，不是真正的语法分析。好处是零依赖、体积小；代价是：

- 只能覆盖 javascript / typescript / json / css / html / vue 等少数语言
- 无法正确处理字符串里的关键词、正则字面量、嵌套模板字符串
- 新增语言要手写关键词表（`javascript` 那段就列了 40 个关键字）

重写时**不建议再背这一套**：语言覆盖面会持续成为短板，而使用方往往已经有成熟的高亮方案。

### 13.5 对当前方案的结论

**保持可选 peer + markdown-it**，理由：

1. 重写的动机就是「不再缝缝补补」，而自研解析器正是最需要缝补的部分
2. 用户明确要求「渲染器扩展性强、可能新增短代码」——自研要改内核，markdown-it 只需注册插件
3. 13.2 的十条工程细节与解析器选型无关，可以全部吸收

**具体吸收清单**：

| 旧实现的做法 | 在本方案中的位置 |
| --- | --- |
| 先转义再拼标签 | 由 markdown-it 的 `html: false` 覆盖（行为等价） |
| 链接白名单 | 保留，作为 `renderers.link` 的默认实现 |
| 占位符池 | 由 markdown-it 的 token 机制天然保证 |
| 代码块行号独立列 | 保留，作为代码块渲染的默认结构 |
| 复制按钮事件委托 | 保留（`SrMarkdown` 容器上的委托） |
| `textContent` 取代码 | 保留 |
| `countText` 剔语法 | 保留，作为编辑器字数统计的实现 |
| 样式不加 scoped | 保留（与现有全局 less 体系一致） |
| props 类型内联 | 实施时验证；能引外部类型就引 |
| 表情存标记文本 | 保留，纳入扩展机制（作为短代码的一种） |

**`SrCodeBlock` 定为独立组件**（已决）。Markdown 内部渲染代码块时复用它的 HTML 结构与样式类，但不实例化组件——因为 `v-html` 插进来的内容不归 Vue 管，没法在这里挂组件实例。两处共用同一份 `style.less` 保证外观一致。

---

## 附录：与现有规划的差异

`夕梦UI组件库开发规划.md` 里没有 Markdown 编辑器的条目。本组件属于**超出原三批清单的新增需求**，因此单独建档，完成后再回填到主规划文档的进度快照。
