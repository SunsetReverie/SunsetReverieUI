<script setup lang="ts">
import {
  SrButton,
  SrMarkdownEditor,
  SrSegmented,
  SrTag,
  DEFAULT_EMOJI_PACKAGES,
  type SrMarkdownEditorApi,
  type SrMarkdownExtension,
  type SrMarkdownToolbarItem,
} from '@sunset-reverie/ui'
import { computed, ref } from 'vue'

defineOptions({ name: 'MarkdownEditorDemo' })

/** 基础内容 */
const content = ref(`## 用法说明

写 Markdown 就行，右侧实时预览。

- 支持 **加粗**、*斜体*、~~删除线~~
- 支持 \`行内代码\` 与代码块
- 支持 [链接](https://example.com) 与图片

> 快捷键：Cmd/Ctrl + B / I / K，Cmd/Ctrl + S 保存。`)

/** 短代码内容：一进来就能看到四种渲染结果 */
const shortcodeContent = ref(`## 一篇博客文章

正文里插了四种短代码，右侧就是读者最终看到的样子。

{{article id=a01}}

{{download driver=baidu|name=设计素材包.zip|url=https://pan.baidu.com/s/demo|size=128MB}}

:::note 提示
参数面板填的值会拼成短代码文本，渲染时再查表还原成卡片。
:::

{{pick id=a02}}`)

/** 只读内容 */
const readonlyContent = ref('这是只读模式，工具栏按钮和快捷键都不响应。')

/** 保存次数，用来演示 save 事件 */
const savedAt = ref('')

/** 是否显示表情 */
const withEmoji = ref(true)

/** 视图切换的显示形式 */
const modeToggleStyle = ref<'text' | 'both' | 'icon'>('both')

/** 视图切换选项 */
const modeToggleOptions = [
  { label: '文字', value: 'text' },
  { label: '图标 + 文字', value: 'both' },
  { label: '纯图标', value: 'icon' },
]

/** 工具栏提示模式 */
const tipMode = ref<'auto' | 'light' | 'dark' | 'off'>('auto')

/** 提示选项 */
const tipOptions = [
  { label: '跟随主题', value: 'auto' },
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '关闭', value: 'off' },
]

/** 短代码在工具栏里的摆放方式 */
const menuMode = ref<'inline' | 'group'>('group')

/** 摆放方式选项 */
const menuModeOptions = [
  { label: '分组下拉', value: 'group' },
  { label: '平铺', value: 'inline' },
]

/** 摆放方式对比用的正文 */
const menuContent = ref(`## 工具栏里的短代码

短代码是扩展能力，不该和内置格式抢位置。

:::note 提示
点工具栏末尾的「插入短代码」，下拉里是这个编辑器注册的全部短代码。
:::`)

/**
 * 短代码参数统一用 `key=value|key=value` 格式。
 * 值里可以有空格，但不能有 `|` 和 `}`（会破坏短代码边界）。
 */
function parseShortParams(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const pair of (raw ?? '').split('|')) {
    const i = pair.indexOf('=')
    if (i < 0) continue
    out[pair.slice(0, i).trim()] = pair.slice(i + 1).trim()
  }
  return out
}

/** 站内文章库：面板选项和渲染查表用的是同一份数据 */
const articleDb = [
  {
    id: 'a01',
    title: '从零搭建 Vue 3 组件库',
    summary: '目录结构、构建产物与按需加载怎么落地。',
    date: '2026-03-12',
    tag: '工程',
  },
  {
    id: 'a02',
    title: 'Markdown 渲染管线设计',
    summary: '预处理、引擎、后处理三层的职责边界。',
    date: '2026-04-08',
    tag: '设计',
  },
  {
    id: 'a03',
    title: 'Nuxt 4 前台性能清单',
    summary: '首屏、字体、图片与按需水合的取舍。',
    date: '2026-05-21',
    tag: '前端',
  },
]

/** 网盘类型：不同盘渲染不同颜色的下载卡片 */
const driverDb = [
  { value: 'baidu', label: '百度网盘', color: '#2b7cf3', badge: 'B' },
  { value: 'aliyun', label: '阿里云盘', color: '#ff6a00', badge: 'A' },
  { value: 'quark', label: '夸克网盘', color: '#7c5cff', badge: 'Q' },
  { value: '123', label: '123 云盘', color: '#16a34a', badge: '1' },
]

/** 站内文章：存的是 id，渲染时查表出卡片 */
const articleExt: SrMarkdownExtension = {
  name: 'article',
  inline: /\{\{article\s+([^}]+)\}\}/g,
  render: (match, ctx) => {
    const params = parseShortParams(match[1] ?? '')
    const article = articleDb.find((entry) => entry.id === params.id)

    if (!article) {
      return `<span class="sc-missing">找不到文章：${ctx.escape(params.id ?? '')}</span>`
    }

    return `<a class="sc-article" href="/posts/${ctx.escape(article.id)}">
      <span class="sc-article__tag">${ctx.escape(article.tag)}</span>
      <strong class="sc-article__title">${ctx.escape(article.title)}</strong>
      <span class="sc-article__summary">${ctx.escape(article.summary)}</span>
      <span class="sc-article__meta">${ctx.escape(article.date)} · 站内文章</span>
    </a>`
  },
  insert: {
    label: '插入站内文章',
    icon: 'lucide:file-text',
    panelTitle: '选择要插入的文章',
    template: '{{article id={id}}}',
    fields: [
      {
        key: 'id',
        label: '文章',
        type: 'select',
        required: true,
        default: 'a01',
        options: articleDb.map((entry) => ({ label: entry.title, value: entry.id })),
        help: '插进正文的只有文章 ID；改标题或换链接时历史内容不用动',
      },
    ],
  },
}

/** 网盘下载：按盘类型渲染不同卡片 */
const downloadExt: SrMarkdownExtension = {
  name: 'download',
  inline: /\{\{download\s+([^}]+)\}\}/g,
  render: (match, ctx) => {
    const params = parseShortParams(match[1] ?? '')
    const driver = driverDb.find((entry) => entry.value === params.driver) ?? driverDb[0]
    const url = ctx.safeUrl(params.url ?? '')

    return `<a class="sc-download" href="${url}" target="_blank" rel="noopener noreferrer">
      <span class="sc-download__badge" style="background:${driver?.color}">${driver?.badge}</span>
      <span class="sc-download__body">
        <strong>${ctx.escape(params.name ?? '未命名文件')}</strong>
        <span>${ctx.escape(driver?.label ?? '')} · ${ctx.escape(params.size ?? '')}</span>
      </span>
      <span class="sc-download__action">下载 →</span>
    </a>`
  },
  insert: {
    label: '插入网盘下载',
    icon: 'lucide:download',
    panelTitle: '添加下载资源',
    template: '{{download driver={driver}|name={name}|url={url}|size={size}}}',
    fields: [
      {
        key: 'driver',
        label: '网盘',
        type: 'select',
        required: true,
        default: 'baidu',
        options: driverDb.map((entry) => ({ label: entry.label, value: entry.value })),
      },
      { key: 'name', label: '文件名', required: true, placeholder: '设计素材包.zip' },
      { key: 'url', label: '下载链接', required: true, placeholder: 'https://...' },
      { key: 'size', label: '大小', default: '128MB', placeholder: '128MB' },
    ],
  },
}

/** 提示块：块级围栏，演示 textarea 字段 */
const noteExt: SrMarkdownExtension = {
  name: 'note',
  block: /^:::\s*note\s+(.*?)\n([\s\S]*?)\n:::\s*$/gm,
  render: (match, ctx) =>
    `<div class="sc-note"><strong>${ctx.escape(match[1] ?? '')}</strong><p>${ctx.escape(match[2] ?? '')}</p></div>`,
  insert: {
    label: '插入提示块',
    icon: 'lucide:info',
    panelTitle: '写一个提示块',
    template: ':::note {title}\n{content}\n:::',
    fields: [
      { key: 'title', label: '标题', default: '小提示', required: true },
      { key: 'content', label: '内容', type: 'textarea', required: true, placeholder: '写给读者的话' },
    ],
  },
}

/** 自定义面板产出的短代码文本（模板里不直接写花括号，避免被 Vue 当插值） */
function pickMark(id: string): string {
  return `{{pick id=${id}}}`
}

/** 精选文章：由自定义面板挑选，渲染成另一种卡片 */
const pickExt: SrMarkdownExtension = {
  name: 'pick',
  inline: /\{\{pick\s+id=([\w-]+)\}\}/g,
  render: (match, ctx) => {
    const article = articleDb.find((entry) => entry.id === match[1])
    if (!article) return `<span class="sc-missing">找不到文章：${ctx.escape(match[1] ?? '')}</span>`

    return `<a class="sc-pick" href="/posts/${ctx.escape(article.id)}">
      <span class="sc-pick__star">✦ 编辑精选</span>
      <strong>${ctx.escape(article.title)}</strong>
      <span>${ctx.escape(article.summary)}</span>
    </a>`
  },
  insert: {
    label: '挑一篇精选文章',
    icon: 'lucide:search',
    panelTitle: '搜索站内文章',
    panelWidth: 420,
    template: '',
  },
}

/** 自定义面板里的搜索词与过滤结果 */
const pickQuery = ref('')
const filteredArticles = computed(() =>
  articleDb.filter((entry) => entry.title.includes(pickQuery.value) || entry.tag.includes(pickQuery.value)),
)

/** 短代码扩展列表：工具栏会自动为每个 insert 生成一个按钮 */
const extensions = [articleExt, downloadExt, noteExt]

/** 短代码演示区：3 个声明式面板 + 1 个自定义面板 */
const shortcodeExtensions = [...extensions, pickExt]

/** 完整工具栏：默认 12 个预设 + 分隔符 + 1 个自定义动作 */
const fullToolbar: SrMarkdownToolbarItem[] = [
  'bold',
  'italic',
  'strike',
  '|',
  'heading',
  'quote',
  'code',
  'code-block',
  '|',
  'list-ul',
  'list-ol',
  '|',
  'link',
  'image',
  'hr',
  '|',
  {
    key: 'date',
    label: '插入日期',
    icon: 'lucide:calendar',
    action: (api: SrMarkdownEditorApi) => api.insert(new Date().toLocaleDateString('zh-CN'), false),
  },
]

/** 自定义工具栏：只留几个常用项 + 一个自定义动作 */
const customToolbar: SrMarkdownToolbarItem[] = [
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
    action: (api: SrMarkdownEditorApi) => api.insert(new Date().toLocaleDateString('zh-CN'), false),
  },
]

/** 表情包（只在演示里传，正式项目应与渲染端共用） */
const emojiPackages = DEFAULT_EMOJI_PACKAGES

/**
 * 保存
 * @param value 当前内容
 */
function onSave(value: string): void {
  savedAt.value = `${new Date().toLocaleTimeString('zh-CN')}（${value.length} 字）`
}

/**
 * 模拟上传：延迟后返回一个内联 SVG
 * @param file 文件
 * @returns 图片地址
 */
async function fakeUpload(file: File): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 600))

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80">
    <rect width="120" height="80" rx="8" fill="#7c5cff"/>
    <text x="60" y="46" font-size="12" text-anchor="middle" fill="#fff">${file.name.slice(0, 10)}</text>
  </svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>完整工具栏（全部能力一次看全）</h3>
      <p class="lead">
        这一处把<strong>所有工具都打开</strong>了：12 个预设按钮、1 个自定义动作、 2
        个由短代码扩展自动生成的按钮、表情按钮，以及图片上传。 下面每一节再单独讲某个能力怎么配
      </p>

      <SrMarkdownEditor
        v-model="content"
        :toolbar="fullToolbar"
        :extensions="extensions"
        :emoji-packages="emojiPackages"
        :upload="fakeUpload"
        :height="340"
        @save="onSave"
      />

      <div class="full-row">
        <SrTag size="sm">12 预设</SrTag>
        <SrTag size="sm">1 自定义</SrTag>
        <SrTag size="sm">3 短代码（自动）</SrTag>
        <SrTag size="sm">1 表情（自动）</SrTag>
        <SrTag size="sm">图片上传</SrTag>
        <SrTag v-if="savedAt" size="sm" type="success">已保存 {{ savedAt }}</SrTag>
      </div>

      <div class="table-wrap">
        <table class="tool-table">
          <thead>
            <tr>
              <th>按钮</th>
              <th>标识</th>
              <th>从哪来</th>
              <th>点击后</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>B</strong></td>
              <td><code>bold</code></td>
              <td>预设</td>
              <td>用 <code>**</code> 包裹选区</td>
            </tr>
            <tr>
              <td><em>I</em></td>
              <td><code>italic</code></td>
              <td>预设</td>
              <td>用 <code>*</code> 包裹选区</td>
            </tr>
            <tr>
              <td><s>S</s></td>
              <td><code>strike</code></td>
              <td>预设</td>
              <td>用 <code>~~</code> 包裹选区</td>
            </tr>
            <tr>
              <td>H</td>
              <td><code>heading</code></td>
              <td>预设</td>
              <td>给当前行加 <code>## </code></td>
            </tr>
            <tr>
              <td>❝</td>
              <td><code>quote</code></td>
              <td>预设</td>
              <td>给当前行加 <code>&gt; </code></td>
            </tr>
            <tr>
              <td>&lt;/&gt;</td>
              <td><code>code</code></td>
              <td>预设</td>
              <td>用反引号包裹选区</td>
            </tr>
            <tr>
              <td>▣</td>
              <td><code>code-block</code></td>
              <td>预设</td>
              <td>插入围栏代码块</td>
            </tr>
            <tr>
              <td>•</td>
              <td><code>list-ul</code></td>
              <td>预设</td>
              <td>给选中行加 <code>- </code></td>
            </tr>
            <tr>
              <td>1.</td>
              <td><code>list-ol</code></td>
              <td>预设</td>
              <td>给选中行加递增序号</td>
            </tr>
            <tr>
              <td>🔗</td>
              <td><code>link</code></td>
              <td>预设</td>
              <td>插入 <code>[文字](https://)</code></td>
            </tr>
            <tr>
              <td>⬆</td>
              <td><code>image</code></td>
              <td>预设</td>
              <td>
                配了 <code>upload</code> 变成「上传图片」+ 上传图标；没配是「插入图片（外链）」+ 图片图标
              </td>
            </tr>
            <tr>
              <td>—</td>
              <td><code>hr</code></td>
              <td>预设</td>
              <td>插入 <code>---</code></td>
            </tr>
            <tr>
              <td>│</td>
              <td><code>'|'</code></td>
              <td>预设</td>
              <td>只是分隔线，不是按钮</td>
            </tr>
            <tr>
              <td>📅</td>
              <td>自定义对象</td>
              <td>手动配置</td>
              <td>执行自己的 <code>action(api)</code></td>
            </tr>
            <tr>
              <td>📄 / ⬇ / ℹ</td>
              <td>自动追加</td>
              <td><code>extension.insert</code></td>
              <td>弹出参数面板，设好参数后插入短代码模板</td>
            </tr>
            <tr>
              <td>🙂</td>
              <td>自动追加</td>
              <td><code>emoji-packages</code></td>
              <td>打开表情面板，插入标记文本</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="hint">
        鼠标移到任意按钮上会显示功能说明（跟随明暗主题）；
        <code>Cmd/Ctrl + B / I / K / S</code> 是快捷键。
        <strong>自动追加的两类按钮不用写进 toolbar 数组</strong>，配置好数据就会出现。 图片类按钮容易撞：配了
        <code>upload</code> 的预设按钮是「上传图片」（⬆）， 图集短代码是「插入图集」（▦），图标和 tips 都不同
      </p>

      <pre v-pre class="code-block">
&lt;SrMarkdownEditor
  v-model="content"
  :toolbar="['bold','italic','strike','|','heading','quote','code','code-block','|',
             'list-ul','list-ol','|','link','image','hr','|', myCustomAction]"
  :extensions="extensions"
  :emoji-packages="emojiPackages"
  :upload="uploadImage"
/&gt;</pre>
    </section>

    <section>
      <h3>工具栏提示</h3>
      <div class="row" style="margin-bottom: 10px">
        <SrSegmented v-model="tipMode" :options="tipOptions" size="sm" />
        <SrTag size="sm">鼠标移到按钮上试试</SrTag>
      </div>
      <SrMarkdownEditor
        v-model="content"
        :tooltips="tipMode !== 'off'"
        :tooltip-variant="tipMode === 'dark' ? 'dark' : 'light'"
        :height="220"
      />
      <p class="hint">
        默认浅色气泡。键盘 Tab 到按钮上也会显示（不是只靠鼠标）。 关掉后退回原生
        <code>title</code>，按钮不会失去说明
      </p>
    </section>

    <section>
      <h3>视图切换的显示形式</h3>
      <div class="row" style="margin-bottom: 10px">
        <SrSegmented v-model="modeToggleStyle" :options="modeToggleOptions" size="sm" />
        <SrTag size="sm">看右上角</SrTag>
      </div>
      <SrMarkdownEditor v-model="content" :mode-toggle="modeToggleStyle" :height="220" />
      <p class="hint">
        默认 <strong>图标 + 文字</strong>：编辑 ✏️、分栏用左右两栏示意图、预览 👁。
        纯图标模式最省空间，文案会转成 <code>title</code> 与 <code>aria-label</code>，屏幕阅读器仍能读出来
      </p>
    </section>

    <section>
      <h3>短代码：博客后台场景</h3>
      <p class="lead">
        点工具栏末尾的四个按钮，会<strong>先弹出参数面板</strong>，设好参数再插入正文；
        右侧预览立刻渲染成卡片。正文里存的始终是短代码文本，不是卡片本身。 前三个用声明式字段，第四个用
        <code>#insert-pick</code> 插槽自定义面板
      </p>

      <SrMarkdownEditor
        v-model="shortcodeContent"
        :extensions="shortcodeExtensions"
        theme="vivid"
        :height="400"
      >
        <template #insert-pick="{ setResult, result, close }">
          <div class="picker">
            <input
              v-model="pickQuery"
              class="picker__search"
              type="search"
              placeholder="按标题或标签搜索…"
              aria-label="搜索文章"
            />
            <div class="picker__list">
              <button
                v-for="entry in filteredArticles"
                :key="entry.id"
                class="picker__item"
                :class="{ 'is-selected': result === pickMark(entry.id) }"
                type="button"
                @click="setResult(pickMark(entry.id))"
              >
                <span class="picker__tag">{{ entry.tag }}</span>
                <span class="picker__title">{{ entry.title }}</span>
                <span class="picker__date">{{ entry.date }}</span>
              </button>
              <p v-if="!filteredArticles.length" class="picker__empty">没有匹配的文章</p>
            </div>
            <p class="picker__hint">
              选中后点下面的「插入」。遮罩、标题、取消、Esc 和插入按钮都由编辑器提供， 这里只负责挑出一段文本
              <button class="picker__close" type="button" @click="close">收起</button>
            </p>
          </div>
        </template>
      </SrMarkdownEditor>

      <div class="flow" style="margin-top: 14px">
        <div class="flow__col">
          <p class="flow__step"><span class="flow__num">1</span>站内文章卡片</p>
          <p class="flow__note">
            <code>select</code> 选文章 → 插入 <code v-pre>{{article id=a01}}</code
            >。 渲染时按 ID 查文章库，输出带标签、摘要、日期的卡片。 改标题不用动历史文章
          </p>
        </div>
        <div class="flow__col">
          <p class="flow__step"><span class="flow__num">2</span>网盘下载卡片</p>
          <p class="flow__note">
            面板里选网盘、填文件名/链接/大小。 渲染时按
            <code>driver</code> 换配色与角标，百度、阿里、夸克、123 各一张脸
          </p>
        </div>
        <div class="flow__col">
          <p class="flow__step"><span class="flow__num">3</span>提示块（块级）</p>
          <p class="flow__note">
            用 <code>textarea</code> 填内容，插入 <code>:::note</code> 围栏。 演示块级短代码也能由面板生成
          </p>
        </div>
        <div class="flow__col">
          <p class="flow__step"><span class="flow__num">4</span>自定义搜索面板</p>
          <p class="flow__note">
            点「挑一篇精选文章」：用 <code>#insert-pick</code> 插槽接管面板，带搜索框和文章列表。 选中后调
            <code>setResult</code>，底部插入按钮仍由组件负责
          </p>
        </div>
      </div>

      <p class="hint">
        <code>render</code> 返回的 HTML 会直接插入 DOM，所以用户填的值一律经
        <code>ctx.escape()</code> 处理，链接经 <code>ctx.safeUrl()</code> 校验
      </p>

      <h4>工具栏摆放方式</h4>
      <p class="hint">
        短代码是扩展能力，平铺在工具栏里会和加粗、列表这些内置格式混在一起，数量一多就认不出来。 推荐
        <code>shortcode-menu="group"</code>：只留一个入口，点开再选。 下面切换两种方式，看工具栏末尾的变化
      </p>
      <div class="row" style="margin-bottom: 10px">
        <SrSegmented v-model="menuMode" :options="menuModeOptions" size="sm" />
        <SrTag size="sm">{{ menuMode === 'group' ? '推荐' : '旧写法' }}</SrTag>
      </div>
      <SrMarkdownEditor
        v-model="menuContent"
        :extensions="extensions"
        :shortcode-menu="menuMode"
        theme="vivid"
        :height="240"
      />

      <pre v-pre class="code-block">
const extensions = [{
  name: 'article',
  inline: /\{\{article\s+([^}]+)\}\}/g,
  render: (match, ctx) => `&lt;article&gt;${ctx.escape(title)}&lt;/article&gt;`,
  insert: {
    label: '插入站内文章',
    icon: 'lucide:file-text',
    template: '{{article id={id}}}',
    fields: [{ key: 'id', label: '文章', type: 'select', options, required: true }],
  },
}]</pre>
    </section>

    <section>
      <h3>表情</h3>
      <div class="row" style="margin-bottom: 10px">
        <SrButton size="sm" variant="outline" @click="withEmoji = !withEmoji">
          {{ withEmoji ? '关闭表情按钮' : '开启表情按钮' }}
        </SrButton>
        <SrTag size="sm">{{ withEmoji ? '已开启' : '已关闭' }}</SrTag>
      </div>
      <SrMarkdownEditor v-model="content" :emoji-packages="withEmoji ? emojiPackages : []" :height="260" />
      <p class="hint">
        传了 <code>emoji-packages</code> 才出现表情按钮。点击插入的是标记文本
        <code>[微笑]</code>，预览区按同一份数据查表还原
      </p>
    </section>

    <section>
      <h3>自定义工具栏</h3>
      <SrMarkdownEditor v-model="content" :toolbar="customToolbar" :height="240" />
      <p class="hint">
        传数组就完全按数组渲染。对象形式的项可以带自己的 <code>action</code>， 这里加了个「插入日期」
      </p>
    </section>

    <section>
      <h3>图片上传</h3>
      <SrMarkdownEditor v-model="content" :upload="fakeUpload" :height="240" />
      <p class="hint">
        配了 <code>upload</code> 后图片按钮改为选文件。这里用假的实现， 上传完成后把返回地址插入正文
      </p>
    </section>

    <section>
      <h3>字数限制与只读</h3>
      <SrMarkdownEditor v-model="readonlyContent" :max-length="20" readonly :height="180" />
      <p class="hint">
        <code>readonly</code> 时工具栏置灰、快捷键不响应； <code>max-length</code> 超出后边框与字数变红
      </p>
    </section>

    <section>
      <h3>纯预览 / 纯编辑</h3>
      <SrMarkdownEditor v-model="content" mode="preview" :height="200" />
      <p class="hint">
        右上角可以切换视图，<code>mode</code> 控制初始值。纯预览模式下编辑区隐藏， 适合「只检查最终效果」
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

.lead {
  margin: 0 0 12px;
  color: var(--sr-color-text-secondary);
  font-size: 12.5px;
  line-height: 1.7;
}

.full-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0 14px;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
}

.tool-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.tool-table th,
.tool-table td {
  padding: 6px 10px;
  border-bottom: 1px solid var(--sr-color-border-subtle);
  text-align: left;
  white-space: nowrap;
}

.tool-table th {
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text-secondary);
  font-weight: 600;
}

.tool-table tbody tr:last-child td {
  border-bottom: 0;
}

.tool-table code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--sr-color-bg-sunken);
  font-family: var(--sr-font-family-mono);
  font-size: 11px;
}

.code-block {
  margin: 14px 0 0;
  padding: 12px;
  border-radius: var(--sr-radius-base);
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text);
  font-family: var(--sr-font-family-mono);
  font-size: 11.5px;
  line-height: 1.7;
  overflow-x: auto;
}

h3 {
  margin: 0 0 12px;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.hint {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
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

.row {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 短代码渲染结果 */
:deep(.sc-gallery) {
  padding: 1px 6px;
  border-radius: var(--sr-radius-sm);
  background: var(--sr-color-primary-alpha-12);
  color: var(--sr-color-primary-text);
  text-decoration: none;
}

.flow {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.flow__col {
  flex: 1 1 220px;
  min-width: 0;
}

.flow__step {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 6px;
  color: var(--sr-color-text);
  font-size: 12.5px;
  font-weight: 600;
}

.flow__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--sr-color-primary-alpha-25);
  color: var(--sr-color-primary-text);
  font-size: 11px;
}

.flow__note {
  margin: 0;
  color: var(--sr-color-text-tertiary);
  font-size: 11.5px;
  line-height: 1.65;
}

.flow__note code {
  font-family: var(--sr-font-family-mono);
  font-size: 11px;
}

.picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.picker__search {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid var(--sr-color-border);
  border-radius: var(--sr-radius-base);
  background: var(--sr-color-bg-container);
  color: var(--sr-color-text);
  font-family: inherit;
  font-size: 12.5px;
  outline: none;
}

.picker__list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-height: 220px;
  overflow-y: auto;
}

.picker__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: transparent;
  color: var(--sr-color-text);
  font-family: inherit;
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--sr-motion-duration-fast) var(--sr-motion-easing-standard);
}

.picker__item.is-selected {
  border-color: var(--sr-color-primary);
  background: var(--sr-color-primary-alpha-12);
}

.picker__tag {
  flex: 0 0 auto;
  padding: 1px 6px;
  border-radius: var(--sr-radius-sm);
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text-tertiary);
  font-size: 10.5px;
}

.picker__title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.picker__date {
  flex: 0 0 auto;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

.picker__empty {
  margin: 0;
  padding: 16px 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  text-align: center;
}

.picker__hint {
  margin: 0;
  color: var(--sr-color-text-tertiary);
  font-size: 11.5px;
  line-height: 1.6;
}

.picker__close {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--sr-color-primary);
  font-family: inherit;
  font-size: 11.5px;
  cursor: pointer;
}

:deep(.sc-pick) {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 14px 0;
  padding: 14px 16px;
  border: 1px solid var(--sr-color-primary-alpha-25);
  border-radius: var(--sr-radius-base);
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text);
  text-decoration: none;
  font-size: 13px;
}

:deep(.sc-pick__star) {
  color: var(--sr-color-primary);
  font-size: 11px;
  font-weight: 600;
}

:deep(.sc-pick) span:last-child {
  color: var(--sr-color-text-secondary);
  font-size: 12px;
}

:deep(.sc-article) {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin: 14px 0;
  padding: 14px 16px;
  border: 1px solid var(--sr-color-border-subtle);
  border-left: 3px solid var(--sr-color-primary);
  border-radius: var(--sr-radius-base);
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text);
  text-decoration: none;
  transition: box-shadow var(--sr-motion-duration-fast) var(--sr-motion-easing-standard);
}

:deep(.sc-article:hover) {
  box-shadow: var(--sr-shadow-md);
}

:deep(.sc-article__tag) {
  align-self: flex-start;
  padding: 1px 7px;
  border-radius: var(--sr-radius-sm);
  background: var(--sr-color-primary-alpha-12);
  color: var(--sr-color-primary-text);
  font-size: 10.5px;
}

:deep(.sc-article__title) {
  font-size: 14px;
  font-weight: 600;
}

:deep(.sc-article__summary) {
  color: var(--sr-color-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

:deep(.sc-article__meta) {
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

:deep(.sc-download) {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 0;
  padding: 12px 14px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text);
  text-decoration: none;
  transition: box-shadow var(--sr-motion-duration-fast) var(--sr-motion-easing-standard);
}

:deep(.sc-download:hover) {
  box-shadow: var(--sr-shadow-md);
}

:deep(.sc-download__badge) {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--sr-radius-base);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

:deep(.sc-download__body) {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  font-size: 12.5px;
}

:deep(.sc-download__body) span {
  color: var(--sr-color-text-tertiary);
  font-size: 11.5px;
}

:deep(.sc-download__action) {
  flex: 0 0 auto;
  color: var(--sr-color-primary);
  font-size: 12px;
}

:deep(.sc-missing) {
  padding: 2px 6px;
  border-radius: var(--sr-radius-sm);
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-danger);
  font-size: 12px;
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
  font-size: 12.5px;
}

:deep(.sc-note p) {
  margin: 0;
  color: var(--sr-color-text-secondary);
  font-size: 12.5px;
}
</style>
