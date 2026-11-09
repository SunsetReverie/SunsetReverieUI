<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

import { srCopyText } from '../../../utils/clipboard'
import SrIcon from '../../icon/src/icon.vue'
import { codeBlockProps } from './code-block'

defineOptions({ name: 'SrCodeBlock', inheritAttrs: false })

const props = defineProps(codeBlockProps)

/** 复制按钮的状态 */
const copyState = ref<'idle' | 'done' | 'fail'>('idle')

/** 状态恢复定时器 */
let resetTimer: ReturnType<typeof setTimeout> | null = null

/**
 * HTML 转义
 *
 * 只在不传 `highlight` 时用到：高亮器返回的已经是转义过的 HTML，
 * 再转义一次会把 `<span>` 也变成文本。
 * @param text 原始代码
 * @returns 转义结果
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** 代码的 HTML 片段 */
const highlighted = computed(() => {
  if (props.highlight) {
    try {
      return props.highlight(props.code, props.lang)
    } catch {
      // 高亮器出错就退回纯文本，不要让整块内容消失
      return escapeHtml(props.code)
    }
  }

  return escapeHtml(props.code)
})

/** 行号文本：一整列，不按行拆分 */
const gutter = computed(() => {
  const count = props.code.split('\n').length
  return Array.from({ length: count }, (_, i) => i + 1).join('\n')
})

/**
 * 是否显示行号
 *
 * 折行模式下不显示：行号是按「逻辑行」算的，
 * 而折行后一行会占多个视觉行，两者必然对不上。
 */
const showGutter = computed(() => props.lineNumbers && !props.wrap)

/** 顶栏标题：文件名优先，其次语言 */
const barTitle = computed(() => {
  if (props.title) return props.title
  return props.lang && props.lang !== 'text' ? props.lang : ''
})

/** 是否需要顶栏 */
const hasBar = computed(() => Boolean(barTitle.value) || props.copyable)

/** 复制按钮文案 */
const copyLabel = computed(() => {
  if (copyState.value === 'done') return '已复制'
  if (copyState.value === 'fail') return '复制失败'
  return '复制'
})

/**
 * 复制代码
 *
 * 取的是 props 里的原始文本而不是 DOM 的 textContent——
 * 后者在高亮后会被拆成很多 `<span>`，还可能带上行号兄弟节点。
 */
async function onCopy(): Promise<void> {
  const ok = await srCopyText(props.code)

  copyState.value = ok ? 'done' : 'fail'

  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    copyState.value = 'idle'
    resetTimer = null
  }, 2000)
}

onBeforeUnmount(() => {
  if (resetTimer) clearTimeout(resetTimer)
})
</script>

<template>
  <div
    class="sr-code"
    :class="[
      `sr-code--${size}`,
      {
        'is-wrap': wrap,
        'is-copied': copyState === 'done',
        'is-copy-fail': copyState === 'fail',
      },
    ]"
  >
    <div v-if="hasBar" class="sr-code__bar">
      <span v-if="barTitle" class="sr-code__title">{{ barTitle }}</span>
      <span v-else class="sr-code__title" />

      <button v-if="copyable" class="sr-code__copy" type="button" :aria-label="copyLabel" @click="onCopy">
        <SrIcon :name="copyState === 'idle' ? 'lucide:copy' : 'lucide:check'" :size="12" />
        <span class="sr-code__copy-text">{{ copyLabel }}</span>
      </button>
    </div>

    <div class="sr-code__body">
      <span v-if="showGutter" class="sr-code__gutter" aria-hidden="true">{{ gutter }}</span>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <pre class="sr-code__pre"><code class="sr-code__code" v-html="highlighted" /></pre>
    </div>
  </div>
</template>
