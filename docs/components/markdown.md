# SrMarkdown Markdown 渲染器

把 Markdown 渲染成带排版的 HTML。解析器由使用方提供，组件负责渲染管线、短代码扩展与安全边界。

<script setup>
import { ref } from 'vue'

const mdTheme = ref('vivid')
const themeOptions = [
  { label: '极简', value: 'plain' },
  { label: '现代', value: 'vivid' },
  { label: '阅读', value: 'editorial' },
  { label: '玻璃', value: 'glass' },
]

const source = `## 这是个渲染示例

正文支持 **加粗**、*斜体*、~~删除线~~ 与 \`行内代码\`。

- 列表项
- 另一项

> 引用内容

\`\`\`ts
const a = 1
\`\`\`

| 列一 | 列二 |
| :-- | --: |
| 左 | 右 |`

const shortcodeSource = `正文里内联一个入口 {{gallery id=42}}，点开看图集。

::: note 说明
这段内容来自围栏内部。
:::`

const inlineExt = {
  name: 'gallery',
  inline: /\{\{gallery\s+id=(\d+)\}\}/g,
  render: (match) => `<a class="demo-inline-sc">查看图集 #${match[1]}</a>`,
}

const blockExt = {
  name: 'note',
  block: /^:::\s*note\s+(.*?)\n([\s\S]*?)\n:::\s*$/gm,
  render: (match, ctx) =>
    `<div class="demo-block-sc"><strong>${ctx.escape(match[1])}</strong><p>${ctx.escape(match[2])}</p></div>`,
}
</script>

## 渲染模板

内置四套，用 `theme` 切换：

<div class="sr-demo is-block">
  <div style="margin-bottom: 12px">
    <SrSegmented v-model="mdTheme" :options="themeOptions" size="sm" />
  </div>
  <SrMarkdown :source="source" engine="builtin" :theme="mdTheme" />
</div>

```vue
<SrMarkdown :source="content" theme="vivid" />
```

| 模板 | 观感 | 主要装饰 |
| --- | --- | --- |
| `plain` | 极简中性 | 几乎无装饰，正文保持中性色 |
| `vivid`（默认） | 现代、年轻 | 标题主色 + 48px 渐变短线、行内代码淡底、引用色条+底色、列表圆点主色、表头底色+斑马纹、渐变分割线、深色代码块 |
| `editorial` | 阅读 / 杂志 | 衬线标题、细线分隔、引用斜体、表格只留横线 |
| `glass` | 玻璃拟态 | 半透明表面 + 背景模糊、大圆角、柔光阴影 |

四套共用**同一份 DOM 结构**，切换的只是一组 `--sr-md-*` CSS 变量。装饰的「有无」也用变量控制：宽度或高度为 0 的伪元素自然不可见，不用为每套模板写一份选择器。

### 二次定制

直接覆盖变量即可，不用 fork 样式：

```css
.my-article .sr-md {
  --sr-md-accent: #7c5cff;
  --sr-md-heading-color: #7c5cff;
  --sr-md-h1-bar-width: 72px;
  --sr-md-code-bg: #12141c;
}
```

变量分组：

| 组 | 变量 |
| --- | --- |
| 标题 | `--sr-md-heading-color` / `--sr-md-heading-font` / `--sr-md-heading-weight` / `--sr-md-h1-bar-*` / `--sr-md-h2-underline` |
| 行内 | `--sr-md-strong-color` / `--sr-md-link-*` / `--sr-md-inline-*` |
| 块 | `--sr-md-quote-*` / `--sr-md-marker-color` / `--sr-md-code-*` / `--sr-md-table-*` / `--sr-md-hr-bg` |
| 图片 | `--sr-md-img-radius` / `--sr-md-img-shadow` |

> **完整的变量参考、六个实战案例、作用域与优先级、排查清单**见
> [Markdown 渲染样式定制指南](/guide/markdown-theming)。换品牌色、打印样式、暗色主题适配、从零做第五套模板都在那篇里。

### 为什么用标准标签选择器

样式挂在 `h1` / `p` / `blockquote` / `table` / `pre` 这些**标准标签**上，而不是 `.sr-md__*` 类名。

内置解析器输出的是「带类的标准标签」，markdown-it 输出的是不带类的标准标签。早期版本只认类名，换引擎后整篇样式会静默失效——这是最容易被忽略的一类问题。现在两种引擎表现一致。

## 交互演示

<div class="sr-demo is-block">
  <SrMarkdown :source="source" engine="builtin" />
</div>

## 三种引擎

### 内置解析器

```vue
<SrMarkdown :source="content" engine="builtin" />
```

覆盖日常写作最常见的语法。**只用于「先跑起来」**，不支持嵌套列表、任务列表、内联 HTML、脚注与数学公式。

正式使用建议换 markdown-it——它支持 CommonMark 全套语法与插件生态。

### markdown-it

```vue
<script setup>
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, linkify: true })
</script>

<SrMarkdown :source="content" :engine="md" />
```

只要对象带 `render` 方法就能接入，markdown-it 实例天然满足。用户自己装的插件（脚注、容器语法、数学公式）直接生效，组件不需要逐个支持。

### 自定义 / 异步

```ts
const engine = {
  async render(source: string) {
    return await someAsyncRenderer(source)
  },
}
```

`render` 允许返回 `Promise`。异步期间组件标记 `is-pending`，完成后填入内容。

**为什么支持异步**：markdown-it 的 `highlight` 钩子是同步的，而 shiki 的初始化是异步的。接口锁死同步就堵死了 shiki 这条路。

## 短代码扩展

两种语法，对应两类场景：

| 语法 | 形态 | 适合 |
| --- | --- | --- |
| 双花括号（内联） | 可写在句子中间 | 无内容占位 |
| `:::名字 ... :::` | 块级围栏，独占多行 | 有内容的结构块 |

<div class="sr-demo is-block">
  <SrMarkdown :source="shortcodeSource" engine="builtin" :extensions="[blockExt, inlineExt]" />
</div>

```ts
const extensions = [
  // 块级：::: note 标题 ... :::
  {
    name: 'note',
    block: /^:::\s*note\s+(.*?)\n([\s\S]*?)\n:::\s*$/gm,
    render: (match, ctx) => `<div class="note">${ctx.escape(match[2])}</div>`,
  },

  // 内联：{{gallery id=42}}
  {
    name: 'gallery',
    inline: /\{\{gallery\s+id=(\d+)\}\}/g,
    render: (match) => `<div data-gallery="${match[1]}"></div>`,
  },
]
```

### 为什么两种都由组件预处理

块级围栏也可以用 `markdown-it-container` 插件实现，但那样扩展机制就分成两条路：一种靠组件、一种靠插件，使用方要理解两套规则。

统一在预处理层做的好处：

- 扩展 API 只有一种形态，注册一次就生效
- 不依赖任何 markdown-it 插件，不必额外安装
- 内联和块级共享同一套参数解析

### 块级先于内联执行

围栏内部可能包含内联短代码。先整体替换围栏，内层规则就扫不到里面的内容了——否则内联规则会把结构拆散。

### 占位符机制

替换结果不会直接塞进 Markdown 文本，而是先换成占位符，渲染完再还原：

```ts
// 替换阶段
'{{gallery id=42}}'  →  '\uE000SRSH0\uE000'

// 渲染完还原
'\uE000SRSH0\uE000'  →  '<div data-gallery="42"></div>'
```

**必须这么做**：`markdown-it` 默认 `html: false` 会把标签当文本转义；即使开了 `html: true`，HTML 也会被 Markdown 规则重新扫一遍，标签里的 `*` `_` 会被当作强调符号。

占位符用 Unicode 私有区字符 `U+E000` 包裹，不属于任何语言的正文，不会被任何规则匹配。

### 编辑器里的插入面板

`insert` 除了描述「插什么」，还可以声明 `fields` 让 `SrMarkdownEditor` 自动生成参数面板：点工具 → 填参数 → 插入短代码文本。字段类型支持 `text` / `textarea` / `select` / `number`，模板用 `{key}` 占位。

这一步发生在**渲染之前**，所以本组件完全不参与——它只负责把最终文本渲染成 HTML。完整示例和字段说明见 [SrMarkdownEditor · 短代码按钮](/components/markdown-editor#短代码按钮参数面板)。

短代码按钮摆在工具栏里时，建议用 `shortcode-menu="group"` 收进一个下拉，别和加粗、列表抢同一排——详见 [工具栏摆放方式](/components/markdown-editor#工具栏摆放方式)。


## 渲染上下文

`render` 的第二个参数提供三个工具：

| 字段 | 签名 | 说明 |
| --- | --- | --- |
| `escape` | `(text) => string` | HTML 转义 |
| `safeUrl` | `(url) => string` | 校验链接地址，不安全返回 `'#'` |
| `safeImageUrl` | `(url) => string` | 校验图片地址，不安全返回空串 |
| `name` | `string` | 扩展名，便于排查 |

> **`render` 的返回值会直接插入 DOM**，不做二次转义。
> 所以内容里的用户数据必须经 `ctx.escape()` 处理，否则短代码就是 XSS 入口。

## 四层扩展

| 层 | 能力 | 实现位置 |
| --- | --- | --- |
| ① 预处理 | 新增语法 | 本文档的 `extensions` |
| ② 渲染覆盖 | 改已有元素的输出 | 引擎自身能力（markdown-it 的 `renderer.rules`） |
| ③ 换引擎 | 换整套实现 | `engine` prop |
| ④ 接管输出 | 换目标格式 | 外层不再用 `SrMarkdown` |

第②层不给独立 API：它本质是「改引擎的渲染规则」，markdown-it 的 `renderer.rules` 已经做得很好，组件再包一层只会增加概念负担。

## 安全

内置四条，不依赖使用方自觉：

1. **内置解析器先整体转义再拼标签**——不依赖任何 sanitizer，不存在漏掉某种绕过的可能
2. **链接协议白名单**：只放行 `http/https/mailto/tel` 与相对路径，`javascript:` 被拦下并**退回整段原文**
3. **图片额外放开 `data:image/*`**，但拦 `data:text/html`
4. **外链统一加** `target="_blank"` + `rel="noopener noreferrer"`

**链接不安全时退回原文而不是只留文字**：`[点我](javascript:alert(1))` 里的 `)` 会让正则提前截断，只留文字会得到「点我)」这种残句。退回原文至少是自洽的——用户看到语法没被解析，知道有问题。

### 接外部引擎时

`markdown-it` 的 `html: false` 会转义裸 HTML，但**它不做完整的 XSS 清洗**。如果内容来自普通用户，用 `sanitize` 钩子接 DOMPurify：

```vue
<SrMarkdown
  :source="content"
  :engine="md"
  :sanitize="(html) => DOMPurify.sanitize(html)"
/>
```

> 前端清洗只能挡住浏览器里的执行，**挡不住存储型攻击**。
> UGC 场景还应在服务端做一次同样的渲染 + 清洗。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `source` | `string` | `''` | Markdown 源码 |
| `engine` | `SrMarkdownEngine \| 'builtin'` | — | 渲染引擎 |
| `extensions` | `SrMarkdownExtension[]` | `[]` | 短代码扩展 |
| `sanitize` | `(html) => string` | — | HTML 后处理钩子 |
| `codeHighlight` | `boolean` | `true` | 代码块语法着色 |
| `codeLineNumbers` | `boolean` | `true` | 代码块显示行号 |
| `codeCopy` | `boolean` | `true` | 代码块显示复制按钮 |
| `codeCopyNotify` | `boolean` | `false` | 复制成功后弹一条 `srMessage` |
| `emojiPackages` | `SrEmojiPackage[]` | 内置字符包 | 正文 `[名称]` 的渲染依据，传 `[]` 关闭 |
| `size` | `SrSize` | `'md'` | 渲染尺寸 |
| `theme` | `'plain' \| 'vivid' \| 'editorial' \| 'glass'` | `'vivid'` | 渲染模板 |

## 代码块

内置解析器渲染的代码块带顶栏与操作，着色、行号、复制三项**默认全开**：

```vue
<!-- 默认形态，三项都在 -->
<SrMarkdown source="..." engine="builtin" />

<!-- 只要纯代码：关掉行号和复制 -->
<SrMarkdown source="..." engine="builtin" :code-line-numbers="false" :code-copy="false" />
```

::: tip 和 SrCodeBlock 的分工
这里的代码块是「正文的一部分」，追求开箱即用、零依赖、不拖包体。要单独展示一段代码、需要 highlight.js / shiki 级别的精度，用 [SrCodeBlock](/components/code-block)——它的 `highlight` 接受任意高亮函数，还多了文件名标题、长行折行等展示项。
:::

| 能力 | 由谁提供 | 说明 |
| --- | --- | --- |
| 语法着色 | `codeHighlight` | JS / TS / JSON / HTML / Vue / CSS / Shell / Python / Markdown，别名（`typescript`、`bash`、`py`…）自动归一 |
| 行号 | `codeLineNumbers` | CSS 计数器绘制，不参与选中，也不会被复制走 |
| 复制按钮 | `codeCopy` | 顶栏右侧，点击后短暂显示「已复制」；`navigator.clipboard` 不可用时退回 `execCommand` |
| 复制反馈 | `codeCopyNotify` | 复制成功后调用 `srMessage.success('已复制到剪贴板')`，默认关闭 |
| 语言标签 | 自动 | 有 `data-lang` 就显示，和复制按钮同排 |

复制走的是**事件委托**：按钮由 `v-html` 插入，拿不到 Vue 事件绑定，所以统一监听 `.sr-md__content` 的点击。这意味着自定义引擎只要产出 `.sr-md__pre > code` 结构，复制按钮同样能用。

行号数字由 `::before` 生成，`user-select: none`——选中代码时不会把数字一起带走。

### 复制后联动通知

复制成功后组件会派发 `copy` 事件，带上被复制的代码（不含行号）。两种接法：

```vue
<!-- 1. 直接开内置的全局消息 -->
<SrMarkdown source="..." engine="builtin" code-copy-notify />

<!-- 2. 自己接管，换成 toast / notification -->
<SrMarkdown source="..." engine="builtin" @copy="(text) => srToast.success('已复制 ' + text.length + ' 字符')" />
```

## 表情

正文里的 `[微笑]` 会被渲染成表情，前提是能在表情包里找到同名项：

```vue
<!-- 默认用内置字符表情包 -->
<SrMarkdown source="你好[微笑]" engine="builtin" />

<!-- 换成自己的表情包；传 [] 关闭表情解析 -->
<SrMarkdown source="..." engine="builtin" :emoji-packages="packages" />
```

| 表情数据 | 渲染结果 |
| --- | --- |
| 有 `char` | 直接输出字符（`🙂`），**不生成 `img`**，复制出去还是表情本身 |
| 只有 `url` | `<img class="sr-md__emoji">`，按字号缩放，地址要过 `srIsSafeImageUrl` |

只替换**命中表情表**的方括号：正文里写 `[注]` 这类内容保持不变；`[文字](url)` 走链接规则，不会被当成表情；代码块里的方括号更不会被动。

::: warning 数据要一致
`SrEmojiPicker`（插入端）和这里（渲染端）必须用同一份表情包，否则编辑器插进去的标记在正文里查不到，会原样显示成 `[微笑]`。
:::

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `copy` | `text: string` | 代码块复制成功，携带被复制的代码（不含行号） |

只有真正写入剪贴板成功才派发：`navigator.clipboard` 被拒、`execCommand` 返回 false 时都不发，避免外部收到「已复制」的假信号。

## 导出的工具

| 函数 | 说明 |
| --- | --- |
| `parseMarkdownBuiltin` | 内置解析器，可单独用于服务端渲染 |
| `srCountMarkdownText` | 统计纯文本字数，剔除语法符号 |
| `srIsSafeUrl` / `srIsSafeImageUrl` | 地址校验 |
| `srEscapeHtml` | HTML 转义，自写高亮器或渲染管线时复用同一套规则 |
| `srPreprocess` | 预处理，可单独用于自定义渲染管线 |
| `SR_MARKDOWN_BUILTIN` | 内置引擎的标识常量，等于 `'builtin'` |

## 已知限制

- **内置高亮是正则级的扫描，不是语法解析**。正则字面量 `/ab+c/`、模板字符串里嵌套的反引号、JSX 的 `{/* */}` 这类边界会判错颜色，但**只影响配色，不影响内容和安全性**——它只决定 `sr-md__tok--*` 包在哪，文本本身早在解析前就转义好了。
- **行号会跟着横向滚动**。长行溢出时，数字随内容一起左移；这是 `pre` 单一滚动容器的必然结果，除非给行号列做 sticky 背景层。
- **复制按钮只认 `.sr-md__pre > code` 结构**。自定义引擎产出别的高亮结构时，顶栏和复制按钮不会自动出现。

## 注意事项

- **不传 `engine` 时原样展示源码**，并在控制台告警。静默降级比报错安全，但不能让人以为渲染生效了。
- **引擎同步抛错时不炸整块内容**，只是内容为空。
- **异步竞态用批次号处理**：连续改 `source` 时，先发的慢结果不会覆盖后发的快结果。
- **SSR 友好**：同步引擎在 `setup` 阶段就完成渲染，服务端输出的是最终 HTML，不会出现水合不一致。
- **样式不加 `scoped`**：内容由 `v-html` 插入，拿不到 `data-v-xxx` 属性，隔离靠 `.sr-md` 类名前缀保证。
- **代码高亮是内置的轻量实现**，零依赖、约 4KB。要 Prism / shiki 那种精度，关掉 `codeHighlight` 后自己接管：用 `sanitize` 钩子把 `<code>` 内的文本替换成高亮输出即可。
- **代码块的语言标识不限 ASCII**。开头三连反引号后跟 `中文`、`c++`、`C#` 都能开代码块，标识原样写进 `data-lang`；只有带空格的非法标识（如 `js x`）才退化成一整行段落。未知语言照样出场，至少字符串、数字、注释有颜色。

