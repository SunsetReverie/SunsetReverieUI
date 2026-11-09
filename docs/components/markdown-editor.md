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

`engine` / `extensions` / `theme` 透传给内部的 `SrMarkdown`，所以**编辑器里预览的效果和前台展示的完全一致**。这条不能有偏差，否则写作者会不断踩「预览正常、发布出错」的坑——换成不同模板也算偏差，所以主题也一并透传。

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

### 我该配什么（按需求查）

| 我想要 | 怎么配 | 工具栏会怎样 |
| --- | --- | --- |
| 就是写 Markdown | **什么都不传** | 12 个预设按钮 + 3 条分隔线 |
| 精简成几个 | `:toolbar="['bold','italic','|','heading']"` | 只留这几项 |
| 加自己的动作 | 数组里放一个 `{ key, label, action }` 对象 | 多一个按钮 |
| 插入自定义短代码 | 给 `extensions` 的项配 `insert` | **自动**多出按钮，不用写进数组 |
| 表情面板 | 传 `emoji-packages` | **自动**多出表情按钮 |
| 上传图片 | 传 `upload` | 图片按钮自动从「插模板」升级为「选文件」 |
| 全都要 | 见下面的完整配置 | 16 个按钮 |
| 完全不要工具栏 | `:toolbar="false"` | 整个工具栏不渲染 |

**最常用的调用就是什么都不配**：默认已经能写完整的 Markdown。其余能力按需叠加。

### 完整工具清单

预设按钮 12 个（默认全部出现）：

| 标识 | 名称 | 点击后 |
| --- | --- | --- |
| `bold` | 粗体 | 用 `**` 包裹选区 |
| `italic` | 斜体 | 用 `*` 包裹选区 |
| `strike` | 删除线 | 用 `~~` 包裹选区 |
| `heading` | 标题 | 给选中行加 `## ` |
| `quote` | 引用 | 给选中行加 `> ` |
| `code` | 行内代码 | 用反引号包裹选区 |
| `code-block` | 代码块 | 插入围栏代码块 |
| `list-ul` | 无序列表 | 给选中行加 `- ` |
| `list-ol` | 有序列表 | 给选中行加递增序号 |
| `link` | 链接 | 插入 `[文字](https://)` |
| `image` | 图片 | 配了 `upload` 就选文件，否则插 `![描述](https://)` |
| `hr` | 分割线 | 插入 `---` |
| `'\|'` | 分隔线 | 只是视觉分组，**不是按钮**，不会响应点击 |

另外三类按钮：

| 类型 | 怎么出现 | 说明 |
| --- | --- | --- |
| 自定义动作 | `toolbar` 数组里的对象 | `{ key, label, icon?, disabled?, action(api) }` |
| 短代码按钮 | `extensions[].insert` | 每个配了 `insert` 的扩展自动追加一个，见[短代码按钮](#短代码按钮) |
| 表情按钮 | 传了 `emojiPackages` | 自动追加在末尾，见[表情](#表情) |

### 三层叠加规则

实际渲染的按钮 = **你传的数组**（不传就用 `SR_MARKDOWN_DEFAULT_TOOLBAR`）**＋** 扩展自带的插入按钮 **＋** 表情按钮。

后两类是自动追加的，**不要写进 `toolbar` 数组**。传 `:toolbar="false"` 则整条工具栏关闭，包括自动追加的项；传 `[]` 则只剩自动追加的项。

### 完整配置（16 个按钮）

```vue
<SrMarkdownEditor
  v-model="content"
  :toolbar="[
    'bold','italic','strike','|',
    'heading','quote','code','code-block','|',
    'list-ul','list-ol','|',
    'link','image','hr','|',
    { key: 'date', label: '插入日期', icon: 'lucide:calendar',
      action: (api) => api.insert(new Date().toLocaleDateString('zh-CN'), false) },
  ]"
  :extensions="extensions"
  :emoji-packages="emojiPackages"
  :upload="uploadImage"
/>
```

这里 `extensions` 里有 2 个扩展配了 `insert`，所以最终是 12 预设 + 1 自定义 + 2 短代码 + 1 表情 = **16 个按钮**。演示页第一处「完整工具栏」就是这个配置，旁边有逐个按钮的对照表。

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

## 工具栏提示

每个按钮鼠标移入时会弹出功能说明，**默认跟随明暗主题**：

```vue
<SrMarkdownEditor v-model="content" />                              <!-- 跟随主题 / top -->
<SrMarkdownEditor v-model="content" tooltip-variant="light" />     <!-- 锁定浅色 -->
<SrMarkdownEditor v-model="content" tooltip-variant="dark" />      <!-- 锁定深色 -->
<SrMarkdownEditor v-model="content" tooltip-placement="bottom" />  <!-- 改方位 -->
<SrMarkdownEditor v-model="content" :tooltips="false" />          <!-- 关掉 -->
```

| prop | 默认 | 说明 |
| --- | --- | --- |
| `tooltips` | `true` | 是否显示气泡 |
| `tooltipVariant` | `'auto'` | `'auto'` 跟随主题 / `'light'` 白玻璃 / `'dark'` 黑玻璃 |
| `tooltipPlacement` | `'top'` | 期望方位，空间不足时自动翻转 |

`auto` 下浅色主题用白玻璃、深色主题用黑玻璃，**主题切换时实时跟随**。组件观察根元素的 `data-sr-theme` 属性，因此无论是 `useSrTheme()`、首帧主题脚本还是手动修改属性都能响应——`SrTooltip` 自己的两套配色是独立于明暗主题的，所以需要这一层来联动。

显式传 `light` / `dark` 则不受主题切换影响，适合需要固定对比的场景。

提示复用库内的 `SrTooltip`，因此：

- **键盘 Tab 到按钮上也会显示**（`focusin` 触发），不是只服务鼠标
- 带显示/隐藏延迟，鼠标划过按钮缝隙不会闪
- 气泡 Teleport 到 `body`，不会被编辑器的 `overflow: hidden` 裁掉
- 工具栏贴页面顶部时会自动翻到下方

自定义工具栏项、扩展自动生成的短代码按钮、表情按钮都带同名提示，不需要额外配置。

**关掉 tips 后退回原生 `title`**，按钮不会完全失去说明。开启时不会同时挂 `title`，避免出现原生提示和气泡两层。

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

配了 `upload` 后，图片按钮改为「选文件 → 调用它 → 插入 `![](返回地址)`」。不配则插入 `![描述](https://)` 模板，让用户自己贴地址。

失败时派发 `upload-error`，失败提示由使用方决定——组件只负责在按钮旁显示「上传中…」。

### 目前支持到什么程度

| 能力 | 状态 | 说明 |
| --- | --- | --- |
| 点击图片按钮选文件 | 支持 | `accept="image/*"`，单选 |
| 上传中禁用工具栏 + 显示「上传中…」 | 支持 | 避免重复点击 |
| 上传失败回调 | 支持 | `upload-error` 事件 |
| 拖拽文件到编辑区上传 | **不支持** | 目前没有拖放监听 |
| 粘贴剪贴板图片上传 | **不支持** | 目前不拦截 `paste` |
| 多图一次选择 | **不支持** | 每次只取 `files[0]` |
| 上传进度 | **不支持** | `upload` 只返回最终 URL |
| 文件类型 / 大小校验 | 交给使用方 | 在 `upload` 里自己判断，抛错即走 `upload-error` |

也就是说：**图片功能是「点按钮选一张 → 拿回 URL → 插进正文」**，上传策略（存哪、压缩、鉴权、格式校验）完全由 `upload` 函数决定，组件不碰。

需要拖拽或粘贴的话要另外接；这两者都需要在编辑区绑 `dragover/drop`、`paste` 事件，属于独立能力，不在当前工具栏范围内。

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
| `tooltips` | `boolean` | `true` | 工具栏功能提示 |
| `tooltipVariant` | `'auto' \| 'light' \| 'dark'` | `'auto'` | 提示配色，auto 跟随明暗主题 |
| `tooltipPlacement` | `SrPlacement` | `'top'` | 提示方位 |
| `placeholder` | `string` | `'开始写作…'` | 占位提示 |
| `height` | `number \| string` | `360` | 主体高度 |
| `readonly` | `boolean` | `false` | 只读 |
| `maxLength` | `number` | `0` | 最大字数，0 不限 |
| `showCount` | `boolean` | `true` | 显示字数 |
| `emojiPackages` | `SrEmojiPackage[]` | `[]` | 表情包，传了才显示表情按钮 |
| `upload` | `(file: File) => Promise<string>` | — | 图片上传 |
| `theme` | `'plain' \| 'vivid' \| 'editorial' \| 'glass'` | `'vivid'` | 渲染模板，透传给预览区 |
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
