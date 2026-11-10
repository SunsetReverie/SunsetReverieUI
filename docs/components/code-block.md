# SrCodeBlock 代码块

带行号、复制按钮与语言标签的代码块。高亮由使用方接入，组件本身不绑定任何高亮器。

<script setup>
const sample = `export function greet(name: string) {
  // 打招呼
  const text = \`你好，\${name}\`
  return text
}`
</script>

## 交互演示

<div class="sr-demo is-block">
  <SrCodeBlock :code="sample" lang="ts" title="greet.ts" line-numbers />
</div>

## 基础用法

```vue
<SrCodeBlock :code="code" lang="ts" />
```

不传 `highlight` 时按**纯文本**展示，内部会做 HTML 转义——代码里的 `<script>` 只会显示成字面文本，不会被解析。

## 行号与标题

```vue
<SrCodeBlock :code="code" lang="ts" title="greet.ts" line-numbers />
```

`title` 不传时顶栏显示语言名；两者都没有且 `copyable` 为 `false` 时，整条顶栏不渲染。

**行号是独立一列**，不切分高亮结果：

```html
<div class="sr-code__body">
  <span class="sr-code__gutter">1\n2\n3</span>
  <pre><code>...高亮后的 HTML...</code></pre>
</div>
```

按行拆分会把块注释和多行字符串的着色切断——这是很多自研代码块的通病。代价是行号与代码的行高必须严格一致，所以两者的字号、行高、上下内边距共用同一组变量。

横滚时行号用 `position: sticky` 固定在左侧。

## 接入高亮器

```vue
<script setup>
import hljs from 'highlight.js/lib/core'
import typescript from 'highlight.js/lib/languages/typescript'

hljs.registerLanguage('typescript', typescript)

const highlight = (code, lang) => hljs.highlight(code, { language: lang }).value
</script>

<SrCodeBlock :code="code" lang="typescript" :highlight="highlight" />
```

签名是 `(code: string, lang: string) => string`，返回**已转义的 HTML 片段**。

> **返回值会被直接插入 DOM**，必须自己处理转义。
> `highlight.js` 的 `highlight()` 和 shiki 的 `codeToHtml()` 返回的都是已转义内容，可以直接用；
> 自己写高亮器时先调用转义再上色，顺序反了就是 XSS 漏洞。

| 高亮器 | 接入方式 | 说明 |
| --- | --- | --- |
| highlight.js | `hljs.highlight(code, { language }).value` | 同步，语言按需注册 |
| shiki | `highlighter.codeToHtml(code, { lang, theme })` | 异步初始化，效果最好 |
| prism.js | `Prism.highlight(code, Prism.languages[lang], lang)` | 最轻 |

**组件不内置高亮 token 的配色**——那是高亮器样式表的职责。接 hljs 要引 `highlight.js/styles/*.css`，用 shiki 则用它的主题内联样式。缺了这步代码块会是纯色，很容易被误认为"高亮没生效"。

## 折行

```vue
<SrCodeBlock :code="longLine" wrap />
```

折行时**行号自动隐藏**：行号按逻辑行算，折行后一行会占多个视觉行，两者必然对不上。

默认不折行，超出时横向滚动——代码的换行位置有语义，自动折行会让缩进层级看不清。

## 复制

`copyable` 默认开启。点击后按钮文案变为「已复制」，2 秒后恢复；失败时显示「复制失败」。

复制取的是 `props.code` 的原始文本，不是 DOM 的 `textContent`——后者在高亮后会被拆成多个 `<span>`。

按钮宽度固定（`min-width`），文案变化时不会把顶栏挤得跳动。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `code` | `string` | `''` | 代码内容（原始文本） |
| `lang` | `string` | `'text'` | 语言标识，支持别名 |
| `highlight` | `(code, lang) => string` | — | 高亮函数，返回已转义的 HTML |
| `lineNumbers` | `boolean` | `false` | 显示行号 |
| `copyable` | `boolean` | `true` | 显示复制按钮 |
| `title` | `string` | `''` | 顶栏文件名 |
| `wrap` | `boolean` | `false` | 长行折行（会隐藏行号） |
| `size` | `SrSize` | `'md'` | 尺寸档位 |

## 注意事项

- **不内置高亮器**。语言覆盖面靠使用方的高亮器，比自研关键词表可靠得多。代码块一片纯色时先查两件事：`highlight` 传了没、高亮器的 token 配色样式表引了没——这两样缺一个都会看起来像「高亮没生效」。
- **演示站的实验室页面**用 `playground-vue3/src/utils/highlight.ts` 里的 `srHighlightCode`：一次扫描 + 命名捕获组分词、边扫边转义，只覆盖 ts / css / html / text 几段短示例；正式项目请换成 highlight.js 或 shiki。
- **`highlight` 抛错时退回纯文本**，不会让整块内容消失。
- **`lang` 不认识时不报错**，由高亮器决定是原样返回还是降级。
- **`wrap` 与 `lineNumbers` 互斥**，同时开启时只保留折行、隐藏行号。
- **组件不引入高亮主题的 CSS**，代码配色需要自己引对应高亮器的样式表。
- **深色代码块不是 prop**。给任意祖先加 `data-sr-theme="dark"`，语义变量会整体切到暗色，但高亮 token 得另配一套浅色字，否则深色底上的深色字看不清。演示站用 `[data-sr-theme='dark'] .sr-code` 处理，见 CodeBlock 演示页的「深色代码块」。
- **复制不派发事件**。按钮只切换自己的文案（已复制 / 复制失败），不会顺手弹全局通知——代码块通常是安静的阅读区。要通知就在业务层调 `srCopyText` + `srNotification`，演示页的「复制后调用通知系统」给了完整写法。
