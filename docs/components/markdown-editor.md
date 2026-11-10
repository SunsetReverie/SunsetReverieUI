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

### 切换控件的显示形式

```vue
<SrMarkdownEditor v-model="content" />                        <!-- 图标 + 文字（默认） -->
<SrMarkdownEditor v-model="content" mode-toggle="text" />   <!-- 只有文字 -->
<SrMarkdownEditor v-model="content" mode-toggle="icon" />   <!-- 只有图标 -->
```

| `modeToggle` | 效果 | 适合 |
| --- | --- | --- |
| `both`（默认） | 图标 + 文字 | 最好认，工具栏空间够时用它 |
| `text` | 只有文字 | 旧版观感，或图标风格不搭时 |
| `icon` | 只有图标 | 工具栏按钮多、右侧空间紧张 |

三个图标：编辑 `lucide:pencil`、分栏 `lucide:columns-2`（左右两栏示意图）、预览 `lucide:eye`。

`icon` 模式下文案不是被删掉，而是转为视觉隐藏层，同时补上 `title` 与 `aria-label`——鼠标悬停有提示，屏幕阅读器也读得到。这一能力由 `SrSegmented` 的 `icon-only` 提供，其他用到分段控件的地方也能复用。

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
| `image` | 随配置变化 | 配了 `upload` → **上传图片**（上传图标）；没配 → **插入图片（外链）**（图片图标） |
| `hr` | 分割线 | 插入 `---` |
| `'\|'` | 分隔线 | 只是视觉分组，**不是按钮**，不会响应点击 |

另外三类按钮：

| 类型 | 怎么出现 | 说明 |
| --- | --- | --- |
| 自定义动作 | `toolbar` 数组里的对象 | `{ key, label, icon?, disabled?, action(api) }` |
| 短代码按钮 | `extensions[].insert` | 每个配了 `insert` 的扩展自动追加一个，见[短代码按钮](#短代码按钮参数面板) |
| 表情按钮 | 传了 `emojiPackages` | 自动追加在末尾，见[表情](#表情) |

### 同类按钮怎么区分

工具栏里常会同时出现「上传一张图」和「插入图集短代码」这类语义相近的按钮。组件用两条规则避免混淆：

**① `image` 预设的图标与提示随 `upload` 自适应**

| 配置 | 图标 | tips / `aria-label` | 行为 |
| --- | --- | --- | --- |
| 没传 `upload` | `lucide:image` | 插入图片（外链） | 插 `![描述](https://)` 模板 |
| 传了 `upload` | `lucide:upload` | 上传图片 | 选文件 → 上传 → 插 `![](返回地址)` |

同一个按钮在两种配置下是两件事，不能都含糊地叫「图片」。

**② 短代码按钮用自己的图标与文案**

扩展的 `insert.label` 会直接成为 tips，所以写**动作**而不是名词：

```ts
insert: {
  label: '插入图集',            // 不要只写「图集」
  icon: 'lucide:layout-grid',   // 不要复用 lucide:image / images
  template: '{{gallery id=$1}}',
}
```

`lucide:image` 和 `lucide:images` 在 14px 下几乎看不出差别，图集类扩展建议换成 `layout-grid` 这类形状明显不同的图标；也可以**干脆不传 `icon`**，按钮会直接显示文字，天然可分。

> 自动追加的按钮不会覆盖预设项的图标或文案，两者各读各的配置。区分责任在 `insert` 的配置上——组件不猜你的短代码是什么含义。

### 三层叠加规则

实际渲染的按钮 = **你传的数组**（不传就用 `SR_MARKDOWN_DEFAULT_TOOLBAR`）**＋** 扩展自带的插入按钮 **＋** 表情按钮。

后两类是自动追加的，**不要写进 `toolbar` 数组**。传 `:toolbar="false"` 则整条工具栏关闭，包括自动追加的项；传 `[]` 则只剩自动追加的项。

### 完整配置（17 个按钮）

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

演示页的 `extensions` 里有 3 个扩展配了 `insert`，所以最终是 12 预设 + 1 自定义 + 3 短代码 + 1 表情 = **17 个按钮**。演示页第一处「完整工具栏」就是这个配置，旁边有逐个按钮的对照表。

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
- **进入时不淡入**：玻璃气泡若用 opacity 淡入，首帧模糊还没生效会透出下面的正文。原因见 [Tooltip 注意事项](/components/tooltip#进入动画为什么不淡入)
- 气泡 Teleport 到 `body`，不会被编辑器的 `overflow: hidden` 裁掉
- 工具栏贴页面顶部时会自动翻到下方

自定义工具栏项、扩展自动生成的短代码按钮、表情按钮都带同名提示，不需要额外配置。

**关掉 tips 后退回原生 `title`**，按钮不会完全失去说明。开启时不会同时挂 `title`，避免出现原生提示和气泡两层。

## 工具栏摆放方式

短代码是扩展能力——不是每个人都用，每个人用的还不一样。全部平铺进工具栏，会和加粗、列表这类内置格式混在一起，扩展一多就认不过来。

`shortcodeMenu` 决定怎么摆：

| 值 | 工具栏末尾 | 适合 |
| --- | --- | --- |
| `inline` | 每个短代码一个按钮（默认，兼容旧写法） | 只有一两个短代码 |
| `group` | 一个「插入短代码」按钮，点开是下拉（**推荐**） | 短代码超过两个，或要和内置按钮区分开 |

```vue
<SrMarkdownEditor v-model="content" :extensions="extensions" shortcode-menu="group" />
```

下拉按扩展注册顺序列出所有配了 `insert` 的短代码。点其中一项和点平铺按钮完全等价：参数面板、`#insert-{name}` 插槽、`insert.action` 都会照常走。按 `Esc` 或点面板外收起。

演示页「短代码：博客后台场景」末尾有平铺 / 分组两种方式的即时对比。

> 默认保留 `inline` 是为了不打断已有写法。新项目建议直接开 `group`——短代码始终是自己的扩展，不该和 `**加粗**` 这种基础格式抢同一排按钮。

## 短代码按钮：参数面板

扩展里配 `insert.fields` 后，点击工具栏按钮会**先弹出参数面板**，设好参数再插入正文。这是短代码在后台写作场景里的主要用法——写作者不需要记语法，也不用手动拼参数。

面板是模态的：全屏遮罩 + 居中卡片。玻璃主题下它和 `SrModal` 用同一套磨砂配方（背景取 `--sr-color-bg-modal` 档，而不是更透的 popover 档，并加 `backdrop-filter`），所以背后的正文会被糊掉、不回字。

演示页「短代码：博客后台场景」给了三个完整例子：

| 短代码 | 面板字段 | 渲染结果 |
| --- | --- | --- |
| `article` 短代码 | 文章（`select`，从文章库取选项） | 站内文章卡片（标签 / 摘要 / 日期） |
| `download` 短代码 | 网盘（`select`）、文件名、链接、大小 | 按网盘类型换配色与角标的下载卡片 |
| `:::note 标题…:::` | 标题（`text`）、内容（`textarea`） | 块级提示块 |

### 声明式字段

字段用 `SrMarkdownInsertField` 描述（可从 `@sunset-reverie/ui` 导入类型），编辑器据此自动生成表单，不用为每个短代码写一套 UI：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `key` | `string` | 参数名，对应模板里的 `{key}` |
| `label` | `string` | 表单标签 |
| `type` | `'text' \| 'textarea' \| 'select' \| 'number'` | 控件类型，默认 `text` |
| `options` | `{ label, value }[]` | `select` 的选项 |
| `default` | `string` | 默认值 |
| `placeholder` | `string` | 占位提示 |
| `required` | `boolean` | 必填；未填时「插入」按钮禁用 |
| `help` | `string` | 字段下方的说明文字 |

`panelTitle` 改面板标题（默认取 `label`），`panelWidth` 改宽度（默认 360px）。

### 模板占位符

```ts
insert: {
  label: '插入站内文章',
  icon: 'lucide:file-text',
  panelTitle: '选择要插入的文章',
  template: '{{article id={id}}}',
  fields: [
    {
      key: 'id', label: '文章', type: 'select', required: true, default: 'a01',
      options: articles.map((a) => ({ label: a.title, value: a.id })),
      help: '插进正文的只有文章 ID；改标题时历史内容不用动',
    },
  ],
}
```

`{key}` 会被替换成面板里对应字段的值。**值里的花括号和换行会被剥离**，因为它们会破坏短代码语法边界（内联短代码的正则以 `}` 收尾）；空格保留，文件名之类的值仍然可读。

配套的渲染端按同一份数据查表：

```ts
{
  name: 'article',
  inline: /\{\{article\s+([^}]+)\}\}/g,
  render: (match, ctx) => {
    const id = parseParams(match[1]).id
    const article = articles.find((a) => a.id === id)
    return `<a class="card" href="/posts/${ctx.escape(article.id)}">${ctx.escape(article.title)}</a>`
  },
  insert: { /* 见上 */ },
}
```

> `render` 返回的 HTML 直接插入 DOM，**用户填的值一律要经 `ctx.escape()`**，链接用 `ctx.safeUrl()` 校验。这是短代码最常见的 XSS 入口。

### 面板交互

| 行为 | 说明 |
| --- | --- |
| 打开时 | 记住当前光标位置，焦点移到面板后不会插错地方 |
| 确认 | 恢复选区 → 拼模板 → 走统一的插入逻辑（块级短代码前后补空行） |
| 取消 / 遮罩 / `Esc` | 关闭且不改动正文 |
| 必填校验 | 有空值就禁用「插入」，不需要弹错误提示 |
| 关闭后 | 预览区立即渲染，因为内容变化会走 `SrMarkdown` 的渲染管线 |

### 不配 fields：直接插模板

```ts
insert: { label: '插入图集', icon: 'lucide:images', template: '{{gallery id=$1}}' }
```

没有 `fields` 时维持旧行为：直接插入模板，把 `$1` 换成占位文字并**选中**，用户接着输入就能覆盖。适合只有一个参数、不需要面板的轻量短代码。

两种形式可以混用：常用短代码走面板，简单的走直接插入。

### 完全自定义面板

声明式字段适合表单类参数。需要搜索、上传、跨组件选数据时，用下面两种逃生口。

#### ① `#insert-{扩展名}` 插槽（推荐）

组件仍负责遮罩、标题、取消、`Esc` 和底部「插入」按钮；插槽只负责**挑出一段文本**：

```vue
<SrMarkdownEditor v-model="content" :extensions="extensions">
  <template #insert-pick="{ setResult, result, close }">
    <input v-model="query" placeholder="搜索文章" />
    <button
      v-for="article in filtered"
      :key="article.id"
      :class="{ selected: result === mark(article.id) }"
      @click="setResult(mark(article.id))"
    >
      {{ article.title }}
    </button>
    <button @click="close">收起</button>
  </template>
</SrMarkdownEditor>
```

```ts
// 扩展只需要声明按钮；没有 fields 也不会直接插模板，因为插槽存在
insert: {
  label: '挑一篇精选文章',
  icon: 'lucide:search',
  panelTitle: '搜索站内文章',
  panelWidth: 420,
  template: '',   // 插槽模式下用 setResult 的文本，不需要模板
}
```

作用域 `SrMarkdownInsertSlotScope`：

| 字段 | 说明 |
| --- | --- |
| `setResult(text)` | 设置最终插入的文本；没设置时「插入」按钮禁用 |
| `close()` | 关闭面板 |
| `value` | 当前正文 |
| `result` | 当前已设置的文本，用来做选中态 |

**插槽名必须和 `extension.name` 对应**：`name: 'pick'` → `#insert-pick`。组件按这个名字查找，找不到就退回声明式字段表单。

演示页第四个短代码就是这种形式：带搜索框和文章列表，选中后由组件的「插入」按钮落地。

#### ② `insert.action` 完全接管

项目里已有统一的 Modal 服务、面板要跨路由、或者需要嵌在别的容器里时，让组件完全不弹面板：

```ts
insert: {
  label: '从素材库选择',
  icon: 'lucide:images',
  action: ({ insert, close, value }) => {
    myModal.open({
      component: AssetPicker,
      onConfirm: (asset) => insert(`{{asset id=${asset.id}}}`),
      onCancel: close,
    })
  },
}
```

`insert(text, block?)` 会恢复到**点按钮那一刻**的光标位置，所以异步等接口、等用户在别处选完再调用也不会插错地方。`value` 是触发时的正文，可用于做「已插入过哪些」之类的判断。

> `action` 提供后，`fields`、模板占位符、插槽都不再生效——这是最高优先级的分支。

### 三种面板形式对照

| 形式 | 配置 | 适合 |
| --- | --- | --- |
| 直接插模板 | 无 `fields` / `action` / 插槽 | 单参数、不需要选择 |
| 声明式字段 | `fields` | 表单类参数（文本、下拉、数字） |
| 自定义插槽 | `#insert-{name}` | 搜索、列表、预览、上传 |
| 完全接管 | `action` | 复用项目自己的弹层体系 |

## 表情

```vue
<SrMarkdownEditor v-model="content" :emoji-packages="packages" />
```

不传时用内置的字符表情包。点工具条的表情按钮弹出 `SrEmojiPicker`，**选中一个就插入并自动关闭面板**——表情是「点一下就完事」的操作，不需要连点。

插进文本的是**标记**（`[微笑]`），不是表情本身，渲染时才按名称反查：

| 表情数据 | 插入的文本 | 预览里的结果 |
| --- | --- | --- |
| `{ name: '微笑', char: '🙂' }` | `[微笑]` | `🙂`，直接是字符，不生成 `img` |
| `{ name: '狗头', url: '...png' }` | `[狗头]` | `<img class="sr-md__emoji">`，按字号缩放 |

所以换一整套表情包不用改历史内容，渲染时重新查表即可。

::: warning 编辑器与渲染端要用同一份数据
标记查不到就会静默降级成 `[微笑]` 纯文本。`SrMarkdownEditor` 会把 `emojiPackages` 自动透传给内部预览，所以给编辑器传一次就够；自己单独用 `SrMarkdown` 渲染时，要传同一份给它的 `emoji-packages`。
:::

只有**命中表情表**的方括号才会被替换，正文里写 `[注]` 这类方括号不会被误吞；链接语法优先，`[微笑](https://a.com)` 仍然是链接。

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

字数**剔除语法符号**后统计——`## 标题` 算 2 个字而不是 5 个。代码块与行内代码整段不计入：代码通常是粘贴来的，算进「写作字数」没有意义。

超限时边框与字数变红，但**不阻止输入**。硬截断会让用户丢内容，交给业务层处理更安全。

## 代码块

预览里的代码块自带四项能力，都由 [SrMarkdown](/components/markdown#代码块) 提供，编辑器只做透传：

| 能力 | 属性 | 默认 |
| --- | --- | --- |
| 语法着色 | `codeHighlight` | `true` |
| 行号 | `codeLineNumbers` | `true` |
| 复制按钮 | `codeCopy` | `true` |
| 复制反馈 | `codeCopyNotify` | `false` |

```vue
<!-- 行号默认就开着，这一行是为了关掉它 -->
<SrMarkdownEditor v-model="content" :code-line-numbers="false" />
```

着色是内置的零依赖实现，认 JS / TS / JSON / HTML / Vue / CSS / Shell / Python / Markdown，写 `typescript`、`bash`、`py` 这类别名也行。行号用 CSS 计数器画，选中代码时不会把数字带走；复制按钮在代码块顶栏，点一下变「已复制」。

### 复制后联动通知

把 `codeCopyNotify` 打开，复制成功会弹一条 `srMessage.success('已复制到剪贴板')`：

```vue
<SrMarkdownEditor v-model="content" code-copy-notify />
```

想换成 `srToast` / `srNotification`，用 `copy` 事件自己接管——编辑器会把它从 `SrMarkdown` 透传上来，参数是被复制的代码（不含行号）：

```vue
<SrMarkdownEditor v-model="content" @copy="(text) => srNotification.success({ message: '已复制 ' + text.length + ' 字符' })" />
```

要 Prism / shiki 那种精确高亮，关掉 `codeHighlight`，在 `sanitize` 钩子里把 `<code>` 的内容替换成自己的高亮输出——顶栏、行号、复制按钮照常工作，因为它们只依赖 `.sr-md__pre > code` 这个结构。

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
| `codeHighlight` | `boolean` | `true` | 预览里的代码块语法着色 |
| `codeLineNumbers` | `boolean` | `true` | 预览里的代码块显示行号 |
| `codeCopy` | `boolean` | `true` | 预览里的代码块显示复制按钮 |
| `codeCopyNotify` | `boolean` | `false` | 复制成功后弹一条 `srMessage` |
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
| `modeToggle` | `'text' \| 'both' \| 'icon'` | `'both'` | 视图切换的显示形式 |
| `shortcodeMenu` | `'inline' \| 'group'` | `'inline'` | 短代码按钮平铺还是收进一个下拉 |
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
| `copy` | `text` | 预览里的代码块复制成功，携带被复制的代码 |

## 插槽

| 名称 | 作用域 | 说明 |
| --- | --- | --- |
| `toolbar` | `api, items` | 替换左侧工具区 |
| `preview` | `value` | 替换预览区 |
| `insertPanel.slotName` | `setResult, close, value, result` | 动态插槽在组件内部的写法；使用方按下面的规则命名 |
| `insert-{扩展名}` | `setResult, close, value, result` | 自定义某个短代码的参数面板内容，如 `#insert-pick` |

> `insert-{扩展名}` 是**命名约定**，不是源码里声明的固定插槽；组件只有一个动态入口 `insertPanel.slotName`，由扩展名拼出实际插槽名。

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
- **预览里的代码块复制走事件委托**，监听的是预览容器。用 `preview` 插槽自己渲染时，里面的代码块不会被接管，需要自己实现复制。
- **代码块行号默认开启**（`codeLineNumbers` 默认 `true`）。行号是 CSS 计数器画的，既不参与选中也不进复制内容。
