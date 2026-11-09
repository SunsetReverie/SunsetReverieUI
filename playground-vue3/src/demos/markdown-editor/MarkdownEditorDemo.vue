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
import { ref } from 'vue'

defineOptions({ name: 'MarkdownEditorDemo' })

/** 基础内容 */
const content = ref(`## 用法说明

写 Markdown 就行，右侧实时预览。

- 支持 **加粗**、*斜体*、~~删除线~~
- 支持 \`行内代码\` 与代码块
- 支持 [链接](https://example.com) 与图片

> 快捷键：Cmd/Ctrl + B / I / K，Cmd/Ctrl + S 保存。`)

/** 短代码内容 */
const shortcodeContent = ref(`正文里插入一个图集入口：{{gallery id=1}}

试试工具栏最右边的「插入图集」按钮，它会插好模板并把光标停在数字上。

::: note 提示
块级短代码也能用，围栏内部的内容会交给扩展处理。
:::`)

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

/** 内联短代码扩展 */
const galleryExt: SrMarkdownExtension = {
  name: 'gallery',
  inline: /\{\{gallery\s+id=(\d+)\}\}/g,
  render: (match) => `<a class="sc-gallery" href="#g-${match[1]}">查看图集 #${match[1]}</a>`,
  insert: { label: '插入图集', icon: 'lucide:layout-grid', template: '{{gallery id=$1}}' },
}

/** 块级短代码扩展 */
const noteExt: SrMarkdownExtension = {
  name: 'note',
  block: /^:::\s*note\s+(.*?)\n([\s\S]*?)\n:::\s*$/gm,
  render: (match, ctx) =>
    `<div class="sc-note"><strong>${ctx.escape(match[1] ?? '')}</strong><p>${ctx.escape(match[2] ?? '')}</p></div>`,
  insert: {
    label: '插入提示',
    icon: 'lucide:info',
    template: '::: note 提示\n$1\n:::',
    placeholder: '内容',
  },
}

/** 短代码扩展列表 */
const extensions = [noteExt, galleryExt]

/**
 * 完整工具栏：默认 12 个预设 + 分隔符 + 1 个自定义动作。
 * 短代码按钮和表情按钮不需要写在这里——它们由 extensions.insert
 * 和 emojiPackages 自动追加到末尾。
 */
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
    action: (api: SrMarkdownEditorApi) => {
      api.insert(new Date().toLocaleDateString('zh-CN'), false)
    },
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
        <SrTag size="sm">2 短代码（自动）</SrTag>
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
              <td>ℹ / ▦</td>
              <td>自动追加</td>
              <td><code>extension.insert</code></td>
              <td>插入短代码模板并选中占位，用扩展自己的图标与文案</td>
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
      <h3>短代码扩展</h3>
      <SrMarkdownEditor v-model="shortcodeContent" :extensions="extensions" :height="320" />
      <p class="hint">
        扩展里配 <code>insert</code> 后，工具栏会自动多出「插入图集」「插入提示」两个按钮——
        不用另外配工具栏，也不会记错语法
      </p>
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
