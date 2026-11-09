# SrMarkdownEditor Markdown 编辑器

分栏实时预览的 Markdown 编辑器。工具栏可配置，短代码按钮由扩展自动生成。

<script setup>
import { ref } from 'vue'

const content = ref(`## 用法说明

写 Markdown 就行，右侧实时预览。

- 支持 **加粗**、*斜体*、~~删除线~~
- 支持 \`行内代码\` 与代码块
- 支持 [链接](https://example.com)

> 快捷键：Cmd/Ctrl + B / I / K`)

const customToolbar = [
  'bold',
  'italic',
  '|',
  'heading',
  'list-ul',
  '|',
  {
    key: 'date',
    label: '插入日期',
    icon: 'lucide:calendar',
    action: (api) => api.insert(new Date().toLocaleDateString('zh-CN'), false),
  },
]
</script>

## 交互演示

<div class="sr-demo is-block">
  <SrMarkdownEditor v-model="content" :height="300" />
</div>

## 基础用法

```vue
<SrMarkdownEditor v-model="content" engine="builtin" />
```

编辑区是**原生 textarea**，不是 contenteditable——输入法、撤销栈、拼写检查都是系统级能力，重做一遍代价太大。

`engine` 与 `extensions` 透传给内部的 `SrMarkdown`，所以**编辑器里预览的效果和前台展示的完全一致**。这条不能有偏差，否则写作者会不断踩「预览正常、发布出错」的坑。

## 视图模式

```vue
<SrMarkdownEditor v-model="content" mode="split" />
```

| 值 | 效果 |
| --- | --- |
| `edit` | 只显示编辑区 |
| `split` | 左右分栏（默认） |
| `preview` | 只显示预览区 |

右上角可以随时切换，`mode-change` 事件同步给外部。

## 工具栏

### 默认 15 项

粗体、斜体、删除线、标题、引用、行内代码、代码块、无序列表、有序列表、链接、图片、分割线。

### 自定义

```vue
<SrMarkdownEditor :toolbar="['bold', 'italic', '|', 'heading']" />
```

预设名与自定义对象可以混用。`'|'` 是分隔线：

```ts
const toolbar = [
  'bold',
  '|',
  {
    key: 'date',
    label: '插入日期',
    icon: 'lucide:calendar',
    action: (api) => api.insert(new Date().toLocaleDateString('zh-CN'), false),
  },
]
```

<div class="sr-demo is-block">
  <SrMarkdownEditor v-model="content" :toolbar="customToolbar" :height="220" />
</div>

### 完全接管

```vue
<SrMarkdownEditor v-model="content">
  <template #toolbar="{ api, items }">
    <button @click="api.wrap('**', '**')">粗体</button>
  </template>
</SrMarkdownEditor>
```

插槽作用域给了 `api`（编辑器方法）和 `items`（解析后的工具栏项）。右侧的视图切换仍然保留。

### 关掉

```vue
<SrMarkdownEditor v-model="content" :toolbar="false" />
```

## 短代码按钮

扩展里配 `insert` 后，工具栏会**自动多出一个按钮**：

```ts
const extensions = [
  {
    name: 'gallery',
    inline: /\{\{gallery\s+id=(\d+)\}\}/g,
    render: (match) => `<a href="#g-${match[1]}">图集 #${match[1]}</a>`,
    insert: {
      label: '插入图集',
      icon: 'lucide:images',
      template: '{{gallery id=$1}}',
      placeholder: '1',
    },
  },
]
```

点击后插入模板，并把 `$1` 换成占位文字**选中**——用户直接输入就能覆盖，不用手动删。

好处是使用方不需要记短代码语法，也不用另外配工具栏项。

## 表情

```vue
<SrMarkdownEditor v-model="content" :emoji-packages="packages" />
```

传了 `emoji-packages` 才出现表情按钮，点击弹出 `SrEmojiPicker`，选中的是**标记文本**（`[微笑]`）。

> **编辑器与渲染端必须用同一份 `packages`**，否则插进去的标记在正文里查不到，会静默降级成纯文本。

## 图片上传

```vue
<SrMarkdownEditor v-model="content" :upload="uploadFile" />
```

```ts
async function uploadFile(file: File) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: form })
  return (await res.json()).url      // 返回图片地址
}
```

配了 `upload` 后，图片按钮改为「选文件 → 调用它 → 插入 `![](返回地址)`」。

不配则插入 `![描述](https://)` 模板，让用户自己贴地址。

失败时派发 `upload-error`，失败提示由使用方决定——组件只负责在按钮旁显示「上传中…」。

## 快捷键

| 按键 | 效果 |
| --- | --- |
| `Cmd/Ctrl + B` | 加粗 |
| `Cmd/Ctrl + I` | 斜体 |
| `Cmd/Ctrl + K` | 链接 |
| `Cmd/Ctrl + S` | 派发 `save` 事件（阻止浏览器保存页面） |
| `Tab` | 插入两个空格；有跨行选区时整块缩进 |
| `Shift + Tab` | 反缩进 |

`Tab` 用空格而不是制表符：Markdown 里制表符的宽度依赖渲染环境，两个空格更稳。

## 字数限制

```vue
<SrMarkdownEditor v-model="content" :max-length="500" />
```

字数**剔除语法符号**后统计——`## 标题` 算 2 个字而不是 5 个。

超限时边框与字数变红，但**不阻止输入**。硬截断会让用户丢内容，交给业务层处理更安全。

## 滚动同步

分栏模式下，编辑区滚动时预览区按比例跟随。

只做比例映射，不做行对行——后者需要把预览区每个块元素和源码行号对应起来，内容差异大时反而更不自然。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | 内容（`v-model`） |
| `engine` | `SrMarkdownEngine \| 'builtin'` | `'builtin'` | 渲染引擎 |
| `extensions` | `SrMarkdownExtension[]` | `[]` | 短代码扩展 |
| `sanitize` | `(html) => string` | — | HTML 后处理 |
| `mode` | `'edit' \| 'split' \| 'preview'` | `'split'` | 视图模式 |
| `toolbar` | `SrMarkdownToolbarItem[] \| false` | 默认 15 项 | 工具栏配置 |
| `placeholder` | `string` | `'开始写作…'` | 占位提示 |
| `height` | `number \| string` | `360` | 主体高度 |
| `readonly` | `boolean` | `false` | 只读 |
| `maxLength` | `number` | `0` | 最大字数，0 不限 |
| `showCount` | `boolean` | `true` | 显示字数 |
| `emojiPackages` | `SrEmojiPackage[]` | `[]` | 表情包，传了才显示表情按钮 |
| `upload` | `(file: File) => Promise<string>` | — | 图片上传 |
| `size` | `SrSize` | `'md'` | 尺寸档位 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `value` | 内容变化 |
| `change` | `value` | 内容变化（语义更明确） |
| `save` | `value` | `Cmd/Ctrl + S` |
| `upload-error` | `error` | 上传失败 |
| `mode-change` | `mode` | 视图模式变化 |

## 插槽

| 名称 | 作用域 | 说明 |
| --- | --- | --- |
| `toolbar` | `api, items` | 替换左侧工具区 |
| `preview` | `value` | 替换预览区 |

## 暴露方法

| 方法 | 说明 |
| --- | --- |
| `insert(text, block?)` | 插入文本；`block` 为 true 时前后补空行 |
| `wrap(before, after, placeholder?)` | 包裹选区 |
| `prefixLines(marker, ordered?)` | 给选中行加前缀 |
| `focus()` | 聚焦编辑区 |
| `getValue()` | 读取当前值 |
| `setValue(value)` | 写入新值 |
| `openEmoji()` / `closeEmoji()` | 控制表情浮层 |

## 注意事项

- **`engine` 默认 `'builtin'`**，编辑器开箱即用。正式使用建议换成 markdown-it，与前台展示保持一致。
- **字数超限不阻止输入**，只做视觉提示。
- **`Tab` 会拦截焦点跳转**。这是编辑器的正常行为，但嵌在表单里时要知道这一点——用户没法用 Tab 跳过它。
- **表情按钮的浮层被 Teleport 到 body**，不会被父级 `overflow: hidden` 裁掉。
- **上传失败只派发事件**，组件不内置提示——用 Toast 还是行内文案由业务决定。
- **工具栏在窄容器下会换行**。`__tools` 是 `flex-wrap: wrap`，按钮不会溢出被裁。
