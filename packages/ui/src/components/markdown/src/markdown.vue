<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { buildEmojiMap } from '../../emoji-picker/src/parse'
import { srMessage } from '../../message'
import { parseMarkdownBuiltin } from './builtin-parser'
import { srPreprocess } from './extensions'
import { markdownProps, SR_MARKDOWN_BUILTIN } from './markdown'

defineOptions({ name: 'SrMarkdown', inheritAttrs: false })

const props = defineProps(markdownProps)

const emit = defineEmits<{
  /**
   * 代码块复制成功
   * @param text 被复制的代码文本
   */
  copy: [text: string]
}>()

/** 渲染结果 */
const rendered = ref('')

/** 异步引擎是否还在渲染 */
const pending = ref(false)

/**
 * 表情查找表
 *
 * @remarks
 * 只在表情包变化时重建。输入框每敲一个字都会重渲染，
 * 若每次都扫一遍几百条表情，长文里会有明显开销。
 */
const emojiMap = computed(() => (props.emojiPackages.length ? buildEmojiMap(props.emojiPackages) : undefined))

/**
 * 渲染批次号
 *
 * @remarks 异步引擎下连续改 `source` 会并发多个 Promise，
 * 先发的可能后到。用递增的批次号丢弃过期结果，避免内容倒退。
 */
let batch = 0

/**
 * 最终输出前的收尾：先还原短代码占位符，再交给外部清洗
 * @param html 引擎产出的 HTML
 * @returns 可插入 DOM 的 HTML
 */
function finalize(html: string): string {
  return props.sanitize ? props.sanitize(html) : html
}

/**
 * 执行一次渲染
 */
function run(): void {
  const current = ++batch
  const { text, restore } = srPreprocess(props.source, props.extensions)

  // 内置解析器是同步的，直接出结果
  if (props.engine === SR_MARKDOWN_BUILTIN) {
    rendered.value = finalize(
      restore(
        parseMarkdownBuiltin(text, {
          highlight: props.codeHighlight,
          lineNumbers: props.codeLineNumbers,
          copy: props.codeCopy,
          emoji: emojiMap.value,
        }),
      ),
    )
    pending.value = false
    return
  }

  // 没传引擎：原样展示源码，不去猜用户想用什么
  if (!props.engine) {
    if (import.meta.env?.DEV) {
      console.warn('[SrMarkdown] 未传 engine，已原样展示源码。传 "builtin" 或 markdown-it 实例。')
    }
    rendered.value = finalize(`<pre class="sr-md__pre-body"><code>${escapeSource(text)}</code></pre>`)
    pending.value = false
    return
  }

  let output: string | Promise<string>

  try {
    output = props.engine.render(text)
  } catch {
    // 引擎同步抛错时不要让整块内容消失
    rendered.value = finalize(restore(''))
    pending.value = false
    return
  }

  if (typeof output === 'string') {
    rendered.value = finalize(restore(output))
    pending.value = false
    return
  }

  pending.value = true
  output
    .then((html) => {
      if (current !== batch) return
      rendered.value = finalize(restore(html))
      pending.value = false
    })
    .catch(() => {
      if (current !== batch) return
      pending.value = false
    })
}

/**
 * 把源码转义成可见文本（无引擎时的兜底）
 * @param text 源码
 * @returns 转义结果
 */
function escapeSource(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 把文本写进剪贴板
 *
 * @param text 待复制文本
 * @returns 是否复制成功
 *
 * @remarks 非安全上下文（http 内网）没有 `navigator.clipboard`，
 * 退回临时 textarea + `execCommand`，这是唯一还能用的老办法。
 */
async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // 权限被拒，继续走兜底
  }

  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  }
}

/**
 * 内容区点击（事件委托）
 *
 * @param event 点击事件
 *
 * @remarks 复制按钮是 `v-html` 插进来的节点，拿不到 Vue 的事件绑定，
 * 所以统一在内容区上委托。文案直接改 DOM：重渲染会替换节点，改旧的也无害。
 */
async function onContentClick(event: MouseEvent): Promise<void> {
  const target = event.target as HTMLElement | null
  const button = target?.closest?.('.sr-md__copy') as HTMLElement | null
  if (!button) return

  const text = button.closest('.sr-md__pre')?.querySelector('code')?.textContent ?? ''
  if (!text) return

  const ok = await writeClipboard(text)

  // 成功才对外发事件：失败时外部不该收到「已复制」的信号
  if (ok) {
    emit('copy', text)
    if (props.codeCopyNotify) srMessage.success('已复制到剪贴板')
  }

  button.textContent = ok ? '已复制' : '复制失败'
  button.classList.toggle('is-copied', ok)

  window.setTimeout(() => {
    button.textContent = '复制'
    button.classList.remove('is-copied')
  }, 1600)
}

// setup 阶段同步跑一次：同步引擎在 SSR 时就能产出内容，
// 不会出现「服务端空、客户端才填充」的水合不一致
run()

watch(
  () =>
    [
      props.source,
      props.extensions,
      props.engine,
      props.sanitize,
      props.codeHighlight,
      props.codeLineNumbers,
      props.codeCopy,
      props.codeCopyNotify,
      props.emojiPackages,
    ] as const,
  run,
  { deep: true },
)
</script>

<template>
  <div class="sr-md" :class="[`sr-md--${size}`, `sr-md--theme-${theme}`, { 'is-pending': pending }]">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="sr-md__content" @click="onContentClick" v-html="rendered" />
  </div>
</template>
