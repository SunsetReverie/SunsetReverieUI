# SrMarkdown 组件规划（草案）

> 本文是 `SrMarkdown` / `SrMarkdownEditor` 的规划与决策记录，独立于 `夕梦UI组件库开发规划.md`。
> 状态：**草案，继续补充中**。文中标注「待定」的条目尚未拍板。

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
| 内容来源 | 待定（内部人员 / 允许 UGC），直接影响安全方案 |
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

> 待定：是否需要 C。如果后续确认"写的时候必须看到组件真实外观"，需要重新评估。

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

> 待定：是否提供一个内置的"最小解析器"作为默认值（只覆盖标题/段落/列表/代码/链接/图片/引用/表格）。
> 倾向不做——默认解析器的边界 bug 会持续消耗维护成本，而使用方既然写 Markdown 就有现成解析器。

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

在 Markdown 解析**之前**扫描并替换成 HTML：

```ts
extensions: [
  {
    name: 'gallery',
    pattern: /\{\{gallery\s+id=(\d+)\}\}/g,
    render: (match) => `<div data-gallery="${match[1]}"></div>`,
  },
]
```

**这一层覆盖 90% 的短代码需求**，因为短代码的本质就是"一段自定义语法 → 一段 HTML"。

要点：

- 必须在解析前执行，否则 `{{...}}` 会被 Markdown 当作普通文本
- 替换结果要避免被 Markdown 二次解释（如放在独占行、或用不会被转义的标签）
- 与 `allowHtml: false` 的关系需明确：扩展产出的 HTML 视为可信，用户内容不可信

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

> 待定：内容可信度。若仅内部人员写作，可简化；若有 UGC，上述四条缺一不可，还要加服务端二次清洗。

---

## 十、已知限制

### 10.1 短代码在编辑器里不高亮

`{{gallery id=3}}` 在 `textarea` 中就是一行普通文字，只有预览区才变成图集。

要做到"写的也是所见所得"，需要：

- 在 textarea 上叠透明高亮层（字体/换行稍有不一致就错位，脆弱）
- 或改用 `contenteditable`（约等于重写一遍编辑器）

**折中方案**：工具栏提供"插入图集"按钮，点击插入模板文本，右侧实时看效果。

> 待定：这个取舍用户是否接受。若不可接受，需回到形态 C。

### 10.2 代码高亮的样式要自己带

组件不内置高亮器，也不内置高亮主题的 CSS。

使用方接入 hljs 就要引 `highlight.js/styles/*.css`，用 shiki 就要用它的主题内联样式。**组件的样式表不包含任何代码配色规则**——这条要写进文档，否则用户会发现"代码块没颜色"却不知道缺了什么。

### 10.3 滚动同步

分栏模式下两侧滚动同步，纯 DOM 比例映射在长短内容差异大时会有漂移。不做精细的"行对行"映射。

---

## 十一、实施阶段

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

### 12.2 仍待确认

| # | 决策点 | 选项 | 当前倾向 |
| --- | --- | --- | --- |
| 6 | 短代码语法 | `{{gallery id=3}}` / `:::gallery`（围栏） / 自定义 | `{{...}}` |
| 7 | 内容可信度 | 内部人员写作 / 允许 UGC | 待定 |
| 8 | 短代码编辑器内是否高亮 | 接受不高亮 / 必须高亮 | 接受不高亮 |
| 9 | 是否内置最小解析器做默认值 | 提供 / 不提供 | 不提供 |
| 10 | 异步解析时的占位形态 | 骨架条 / 保留旧内容 | 待定 |

---

## 附录：与现有规划的差异

`夕梦UI组件库开发规划.md` 里没有 Markdown 编辑器的条目。本组件属于**超出原三批清单的新增需求**，因此单独建档，完成后再回填到主规划文档的进度快照。
