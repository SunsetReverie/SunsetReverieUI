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

/** 工具栏提示模式 */
const tipMode = ref<'light' | 'dark' | 'off'>('light')

/** 提示选项 */
const tipOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '关闭', value: 'off' },
]

/** 内联短代码扩展 */
const galleryExt: SrMarkdownExtension = {
  name: 'gallery',
  inline: /\{\{gallery\s+id=(\d+)\}\}/g,
  render: (match) => `<a class="sc-gallery" href="#g-${match[1]}">查看图集 #${match[1]}</a>`,
  insert: { label: '插入图集', icon: 'lucide:images', template: '{{gallery id=$1}}' },
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
      <h3>基础</h3>
      <SrMarkdownEditor v-model="content" :height="340" @save="onSave" />
      <p class="hint">
        左侧原生 textarea（输入法、撤销栈都能用），右侧实时预览。 工具栏 15 项，中间用竖线分组。
        <SrTag v-if="savedAt" size="sm" type="success">已保存 {{ savedAt }}</SrTag>
      </p>
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
