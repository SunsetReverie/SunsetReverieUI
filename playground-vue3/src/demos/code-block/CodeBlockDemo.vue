<script setup lang="ts">
import { srHighlightCode } from '../../utils/highlight'
import { SrButton, SrCodeBlock, SrSegmented, SrTag, srCopyText, srNotification } from '@sunset-reverie/ui'
import { ref } from 'vue'

defineOptions({ name: 'CodeBlockDemo' })

/** 示例代码 */
const sample = `export function greet(name: string) {
  // 打招呼
  const text = \`你好，\${name}\`
  return text
}`

/** 尺寸 */
const size = ref<'sm' | 'md' | 'lg'>('md')

/** 尺寸选项 */
const sizeOptions = [
  { label: '小', value: 'sm' },
  { label: '中', value: 'md' },
  { label: '大', value: 'lg' },
]

/** 复制后调用通知系统的示例代码，同时也是下面按钮真正跑的逻辑 */
const notifySample = [
  "import { srCopyText, srNotification } from '@sunset-reverie/ui'",
  '',
  'async function copyAndNotify(code: string): Promise<void> {',
  '  const ok = await srCopyText(code)',
  '  if (ok) {',
  "    srNotification.success({ title: '已复制', message: `共 ${code.split('\\n').length} 行` })",
  '  } else {',
  "    srNotification.error({ title: '复制失败', message: '浏览器拒绝了剪贴板访问' })",
  '  }',
  '}',
].join('\n')

/**
 * 复制示例代码并弹一条全局通知
 *
 * SrCodeBlock 的复制按钮只给内联「已复制」反馈，不派发事件；
 * 要接通知系统，就在业务层自己复制再调用 srNotification。
 * @returns 复制与通知都结束后 resolve
 */
async function copyAndNotify(): Promise<void> {
  const ok = await srCopyText(notifySample)
  if (ok) {
    srNotification.success({
      title: '代码已复制到剪贴板',
      message: `共 ${notifySample.split('\n').length} 行，粘贴即可使用`,
    })
    return
  }
  srNotification.error({ title: '复制失败', message: '浏览器拒绝了剪贴板访问，请检查站点权限' })
}

/** 不复制，只发一条通知，用来看清通知本身长什么样 */
function notifyOnly(): void {
  srNotification.info({
    title: '这是通知系统',
    message: 'srNotification 挂到 body 上，和代码块在哪个容器里无关',
  })
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础</h3>
      <SrCodeBlock :code="sample" lang="ts" />
      <p class="hint">
        不传 <code>highlight</code> 时按纯文本展示，内部会做 HTML 转义—— 代码里的
        <code>&lt;script&gt;</code> 只会显示成字面文本
      </p>
    </section>

    <section>
      <h3>行号与标题</h3>
      <SrCodeBlock :code="sample" lang="ts" title="greet.ts" line-numbers :highlight="srHighlightCode" />
      <p class="hint">
        行号是独立一列，不切分高亮结果——按行拆分会把块注释和多行字符串的着色切断。 横滚时行号固定在左侧
      </p>
    </section>

    <section>
      <h3>接入高亮器</h3>
      <SrCodeBlock :code="sample" lang="ts" title="greet.ts" line-numbers :highlight="srHighlightCode" />
      <p class="hint">
        传一个 <code>(code, lang) =&gt; string</code> 的函数即可，这里用的是演示站统一的
        <code>srHighlightCode</code>。返回的 HTML 会直接插入 DOM，所以要自己处理转义； highlight.js 的
        <code>highlight()</code> 和 shiki 的 <code>codeToHtml()</code> 返回的都已转义，可直接用
      </p>
    </section>

    <section>
      <h3>尺寸</h3>
      <SrSegmented v-model="size" :options="sizeOptions" size="sm" />
      <SrCodeBlock
        :code="sample"
        lang="ts"
        :size="size"
        :highlight="srHighlightCode"
        title="greet.ts"
        line-numbers
      />
    </section>

    <section>
      <h3>折行</h3>
      <SrCodeBlock
        code="const veryLongVariableName = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11 }"
        lang="ts"
        wrap
        :highlight="srHighlightCode"
      />
      <p class="hint">折行时行号自动隐藏——行号按逻辑行算，折行后一行会占多个视觉行，两者必然对不上</p>
    </section>

    <section>
      <h3>无顶栏</h3>
      <SrCodeBlock code="a = 1" :copyable="false" />
      <p class="hint">没有标题、没有语言、也不显示复制按钮时，顶栏整条不渲染，避免出现一条空白条</p>
    </section>

    <section>
      <h3>深色代码块</h3>
      <div class="compare">
        <div class="compare__side">
          <span class="compare__cap">跟随全局主题</span>
          <SrCodeBlock :code="sample" lang="ts" title="greet.ts" line-numbers :highlight="srHighlightCode" />
        </div>
        <div class="compare__side compare__side--dark" data-sr-theme="dark">
          <span class="compare__cap">data-sr-theme="dark"</span>
          <SrCodeBlock :code="sample" lang="ts" title="greet.ts" line-numbers :highlight="srHighlightCode" />
        </div>
      </div>
      <p class="hint">
        深色不是 CodeBlock 的 prop：给任意祖先加 <code>data-sr-theme="dark"</code>，容器底色与高亮 token
        会一起换成暗色那套。前提是高亮器备了暗色配色——演示站在
        <code>[data-sr-theme='dark'] .sr-code</code>
        下配了一套，否则浅色底上的深字会看不见。
      </p>
    </section>

    <section>
      <h3>复制后调用通知系统</h3>
      <SrCodeBlock
        :code="notifySample"
        lang="ts"
        title="copy-and-notify.ts"
        line-numbers
        :highlight="srHighlightCode"
      />
      <div class="row">
        <SrButton size="sm" variant="primary" @click="copyAndNotify">复制上面的代码并通知</SrButton>
        <SrButton size="sm" variant="outline" @click="notifyOnly">只发一条通知</SrButton>
        <SrButton size="sm" variant="text" @click="srNotification.closeAll()">清空通知</SrButton>
        <SrTag size="sm" type="primary">看右上角</SrTag>
      </div>
      <p class="hint">
        SrCodeBlock 的复制按钮只改自己的文案（已复制 /
        复制失败），<strong>不派发事件</strong>：把复制反馈强塞进全局通知，
        对只想安静看代码的人是打扰。需要全局提示时就在业务层复制并调用
        <code>srNotification</code>，上面这段代码就是按钮真正执行的逻辑；通知挂到
        <code>body</code>，和代码块在哪个主题容器里无关。
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
  margin: 8px 0 0;
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

.compare {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.compare__side {
  display: grid;
  gap: 8px;
  align-content: start;
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-md);
  background: var(--sr-color-bg-page);
}

.compare__side--dark {
  border-color: var(--sr-color-border);
}

.compare__cap {
  color: var(--sr-color-text-secondary);
  font-family: var(--sr-font-family-mono);
  font-size: 11.5px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 10px;
}
</style>
