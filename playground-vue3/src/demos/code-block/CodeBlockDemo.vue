<script setup lang="ts">
import { srHighlightCode } from '../../utils/highlight'
import { SrCodeBlock, SrSegmented } from '@sunset-reverie/ui'
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
</style>
