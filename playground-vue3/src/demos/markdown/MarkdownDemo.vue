<script setup lang="ts">
import {
  SrMarkdown,
  SrSegmented,
  parseMarkdownBuiltin,
  type SrMarkdownEngine,
  type SrMarkdownExtension,
} from '@sunset-reverie/ui'
import { ref } from 'vue'

defineOptions({ name: 'MarkdownDemo' })

/** 基础内容 */
const basic = `# 一级标题

这是一段正文，支持 **加粗**、*斜体*、~~删除线~~ 和 \`行内代码\`。

## 二级标题

- 无序列表项
- 另一项

1. 有序列表
2. 第二项

> 引用内容，颜色比正文淡一档。

[链接](https://example.com) 与 ![图片](https://example.com/a.png)

\`\`\`ts
const a = 1
\`\`\`

| 列一 | 列二 |
| :-- | --: |
| 左对齐 | 右对齐 |

---

以上是内置解析器覆盖的语法。`

/** 短代码示例 */
const withShortcodes = `正文里可以内联一个图集入口：{{gallery id=42}}，点开看大图。

下面是一个块级短代码，内部可以有内容：

::: note 提示
这段文字来自围栏内部，会原样交给扩展处理。
:::

普通段落继续。`

/** 内联短代码扩展 */
const inlineExt: SrMarkdownExtension = {
  name: 'gallery-link',
  inline: /\{\{gallery\s+id=(\d+)\}\}/g,
  render: (match, ctx) =>
    `<a class="sc-inline" href="#gallery-${match[1]}">查看图集 #${ctx.escape(String(match[1]))}</a>`,
}

/** 块级短代码扩展 */
const blockExt: SrMarkdownExtension = {
  name: 'note',
  block: /^:::\s*note\s+(.*?)\n([\s\S]*?)\n:::\s*$/gm,
  render: (match, ctx) =>
    `<div class="sc-note"><strong>${ctx.escape(match[1] ?? '')}</strong><p>${ctx.escape(match[2] ?? '')}</p></div>`,
}

/** 短代码扩展列表 */
const extensions = [blockExt, inlineExt]

/** 自定义引擎：给每个标题加个标记 */
const customEngine: SrMarkdownEngine = {
  render: (source: string) =>
    parseMarkdownBuiltin(source).replace(
      /<h([1-6]) class="sr-md__h sr-md__h--\1">/g,
      (_m, level: string) => `<h${level} class="sr-md__h sr-md__h--${level}"><span class="h-num">§</span>`,
    ),
}

/** 异步引擎：模拟 shiki 这类需要初始化的场景 */
const asyncEngine: SrMarkdownEngine = {
  render: (source: string) =>
    new Promise((resolve) => {
      setTimeout(() => resolve(parseMarkdownBuiltin(source)), 600)
    }),
}

/** 尺寸 */
const size = ref<'sm' | 'md' | 'lg'>('md')

/** 尺寸选项 */
const sizeOptions = [
  { label: '小', value: 'sm' },
  { label: '中', value: 'md' },
  { label: '大', value: 'lg' },
]

/** 是否开启清洗（把 script 标签去掉） */
const withSanitize = ref(false)

/**
 * 清洗钩子：去掉 script 块
 * @param html 引擎输出
 * @returns 清洗后
 */
function stripScripts(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '')
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>内置解析器</h3>
      <div class="doc">
        <SrMarkdown :source="basic" engine="builtin" />
      </div>
      <p class="hint">
        <code>engine="builtin"</code> 用内置的精简解析器，覆盖日常语法。 正式使用建议换成
        markdown-it——它支持嵌套列表、任务列表和插件
      </p>
    </section>

    <section>
      <h3>短代码：内联 + 块级</h3>
      <div class="doc">
        <SrMarkdown :source="withShortcodes" engine="builtin" :extensions="extensions" />
      </div>
      <p class="hint">
        内联 <code v-pre>{{gallery id=42}}</code> 与块级
        <code>::: note 标题 ... :::</code> 都由扩展在解析前替换。 块级先执行——围栏内部的内容不会被内联规则拆散
      </p>
    </section>

    <section>
      <h3>自定义引擎</h3>
      <div class="doc">
        <SrMarkdown :source="basic" :engine="customEngine" />
      </div>
      <p class="hint">
        传一个带 <code>render</code> 的对象即可。这里在标题前插了个 <code>§</code> 标记，
        模拟「接管渲染规则」的用法——改已有元素的输出不需要改组件
      </p>
    </section>

    <section>
      <h3>异步引擎</h3>
      <div class="doc">
        <SrMarkdown :source="basic" :engine="asyncEngine" />
      </div>
      <p class="hint">
        <code>render</code> 返回 Promise 时组件先显示空内容并标记 <code>is-pending</code>， 完成后填入。shiki
        这类需要异步初始化的高亮器走这条路径
      </p>
    </section>

    <section>
      <h3>尺寸</h3>
      <SrSegmented v-model="size" :options="sizeOptions" size="sm" />
      <div class="doc">
        <SrMarkdown :source="basic" engine="builtin" :size="size" />
      </div>
    </section>

    <section>
      <h3>清洗钩子</h3>
      <label class="switch">
        <input v-model="withSanitize" type="checkbox" />
        <span>开启 sanitize</span>
      </label>
      <div class="doc">
        <SrMarkdown
          source="尝试注入：<script>alert(1)</script> 结束"
          engine="builtin"
          :sanitize="withSanitize ? stripScripts : undefined"
        />
      </div>
      <p class="hint">
        内置解析器本身已做整体转义，script 只会显示成文本。
        <code>sanitize</code> 是给外部引擎用的——接 DOMPurify 之类时挂在这里
      </p>
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

h3 {
  margin: 0 0 12px;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.hint {
  margin: 10px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 1.6;
}

.hint code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--sr-color-bg-sunken);
  font-family: var(--sr-font-family-mono);
  font-size: 11.5px;
}

.doc {
  max-width: 680px;
  padding: 16px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.switch {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
  color: var(--sr-color-text-tertiary);
  font-family: var(--sr-font-family-mono);
  font-size: 11.5px;
  cursor: pointer;
}

.switch input {
  margin: 0;
  accent-color: var(--sr-color-primary);
}

/* 短代码渲染出来的样子 */
:deep(.sc-inline) {
  padding: 1px 6px;
  border-radius: var(--sr-radius-sm);
  background: var(--sr-color-primary-alpha-12);
  color: var(--sr-color-primary-text);
  text-decoration: none;
}

:deep(.sc-note) {
  margin: 12px 0;
  padding: 10px 14px;
  border-left: 3px solid var(--sr-color-primary);
  border-radius: 0 var(--sr-radius-sm) var(--sr-radius-sm) 0;
  background: var(--sr-color-bg-sunken);
}

:deep(.sc-note strong) {
  display: block;
  margin-bottom: 4px;
  color: var(--sr-color-text);
  font-size: 12.5px;
}

:deep(.sc-note p) {
  margin: 0;
  color: var(--sr-color-text-secondary);
  font-size: 12.5px;
}

:deep(.h-num) {
  margin-right: 4px;
  color: var(--sr-color-primary);
  font-weight: 400;
}
</style>
