<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useSlots, watch } from 'vue'

import type { SrEmojiItem } from '../../emoji-picker/src/emoji-picker'
import {
  BG_POSITION_MAP,
  TEXTAREA_SIZE_MAP,
  srBuildTextareaEmojiMap,
  srCountTextareaText,
  srCreateEmojiNode,
  srNormalizeBackgroundImage,
  srRenderRich,
  srSerializeRich,
  textareaProps,
} from './textarea'

defineOptions({ name: 'SrTextarea', inheritAttrs: false })

const props = defineProps(textareaProps)

const slots = useSlots()

const emit = defineEmits<{
  /** 内容变化，`v-model` 用 */
  'update:modelValue': [value: string]
  /** 内容变化（语义更明确，与 update 同时派发） */
  change: [value: string]
  /** 获得焦点 */
  focus: [event: FocusEvent]
  /** 失去焦点 */
  blur: [event: FocusEvent]
  /** 请求提交：`submitOnEnter` 下按 Enter，或外部调用暴露的 `submit()` */
  submit: [value: string]
}>()

/** 原生模式下的文本域 */
const textareaRef = ref<HTMLTextAreaElement | null>(null)

/** 富文本模式的编辑容器 */
const richRef = ref<HTMLElement | null>(null)

/** 是否聚焦 */
const focused = ref(false)

/**
 * 输入法是否在组合中
 *
 * @remarks 组合期间不能重建 DOM，否则候选词窗口会被打断。
 * 用普通变量而不是 ref：它不参与渲染，改它不该触发更新。
 */
let composing = false

/** 表情查找表：有值才进富文本模式 */
const emojiMap = computed(() => srBuildTextareaEmojiMap(props.emojiPackages))

/** 是否富文本模式 */
const rich = computed(() => !!emojiMap.value)

/** 用户视角的字数：一个表情算 1 个字 */
const count = computed(() => srCountTextareaText(props.modelValue, emojiMap.value))

/** 是否超出上限 */
const overLimit = computed(() => !!props.maxlength && count.value > props.maxlength)

/** 是否可编辑 */
const editable = computed(() => !props.disabled && !props.readonly)

/** 尺寸相关的 CSS 变量 */
const sizeVars = computed(() => {
  const metrics = TEXTAREA_SIZE_MAP[props.size]

  return {
    '--sr-textarea-padding-x': `${metrics.paddingX}px`,
    '--sr-textarea-padding-y': `${metrics.paddingY}px`,
    '--sr-textarea-font-size': `${metrics.fontSize}px`,
    '--sr-textarea-line-height': String(metrics.lineHeight),
    '--sr-textarea-rows': String(props.rows),
  } as Record<string, string>
})

/** 背景落点配置 */
const bgPosition = computed(() => BG_POSITION_MAP[props.backgroundPosition] ?? BG_POSITION_MAP.center)

/** 背景图层样式：地址 + 位置 + 尺寸 */
const bgLayerStyle = computed(() => {
  const image = srNormalizeBackgroundImage(props.backgroundImage)
  if (!image) return undefined

  return {
    backgroundImage: image,
    backgroundPosition: bgPosition.value.image,
    backgroundSize: props.backgroundSize,
  }
})

/** 背景层的 flex 对齐：背景文字跟着九宫格走 */
const bgContentStyle = computed(() => ({
  alignItems: bgPosition.value.align,
  justifyContent: bgPosition.value.justify,
}))

/** 背景文字样式 */
const bgTextStyle = computed(() => ({
  ...(props.backgroundTextSize > 0 ? { fontSize: `${props.backgroundTextSize}px` } : {}),
  opacity: String(props.backgroundTextOpacity),
}))

/**
 * 字数是否浮在输入区右下角
 *
 * @remarks 有 `footer` 工具栏时跟着工具栏排一行，没有时浮在内部——
 * 只为一行字数单独占条底栏太浪费垂直空间。
 */
const countInline = computed(() => props.showCount && !slots.footer)

/** 根节点类名 */
const classes = computed(() => [
  `sr-textarea--${props.size}`,
  `sr-textarea--${props.status}`,
  {
    'is-focused': focused.value,
    'is-disabled': props.disabled,
    'is-readonly': props.readonly,
    'is-rich': rich.value,
    'is-over': overLimit.value,
    'is-count-inline': countInline.value,
    'is-resizable': props.resize === 'vertical',
  },
])

/**
 * 让高度贴合内容
 *
 * @remarks 两种模式都要算：`rows` 决定下限，`maxRows` 决定上限，
 * 超过上限后交给内部滚动，避免把页面撑长。
 */
function syncHeight(): void {
  if (!props.autosize) return

  const metrics = TEXTAREA_SIZE_MAP[props.size]
  const lineHeight = metrics.fontSize * metrics.lineHeight
  const minHeight = props.rows * lineHeight + metrics.paddingY * 2
  const maxHeight = props.maxRows > 0 ? props.maxRows * lineHeight + metrics.paddingY * 2 : Infinity

  const el = rich.value ? richRef.value : textareaRef.value
  if (!el) return

  el.style.height = 'auto'
  el.style.height = `${Math.min(Math.max(el.scrollHeight, minHeight), maxHeight)}px`
  el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
}

/**
 * 把光标放到末尾
 */
function moveCaretToEnd(): void {
  const el = richRef.value
  if (!el) return

  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)

  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

/**
 * 在光标处插入一个节点
 * @param node 待插入节点
 *
 * @remarks 光标不在编辑区内（比如刚点开工具栏）时退化为追加到末尾，
 * 这样「点表情按钮插入」在未聚焦时也有确定行为。
 */
function insertNodeAtCaret(node: Node): void {
  const el = richRef.value
  if (!el) return

  const selection = window.getSelection()
  if (!selection || !selection.rangeCount || !el.contains(selection.anchorNode)) {
    el.appendChild(node)
    moveCaretToEnd()
    return
  }

  const range = selection.getRangeAt(0)
  range.deleteContents()
  range.insertNode(node)

  range.setStartAfter(node)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
}

/**
 * 原生模式输入
 * @param event 输入事件
 */
function onInnerInput(event: Event): void {
  const value = (event.target as HTMLTextAreaElement).value
  emit('update:modelValue', value)
  emit('change', value)
  nextTick(syncHeight)
}

/**
 * 富文本模式输入
 *
 * @remarks 每次输入都把 DOM 序列化回标记文本，`v-model` 收到的始终是文本，
 * 父组件不需要理解内部结构。
 */
function onRichInput(): void {
  const el = richRef.value
  if (!el || composing) return

  // 全删干净后浏览器可能留一个空 br，清掉它，否则 placeholder 不出现
  if (!el.textContent?.trim() && !el.querySelector('img')) el.textContent = ''

  const value = srSerializeRich(el)
  emit('update:modelValue', value)
  emit('change', value)
  nextTick(syncHeight)
}

/**
 * 插入一个换行
 *
 * @remarks
 * 不用 `insertNodeAtCaret(br)`：`<br>` 后面没有兄弟节点时，
 * 浏览器不肯把光标落到它之后，接着输入的文字会跑到换行前面。
 * `insertLineBreak` 会自己处理这个边界，各家浏览器行为一致。
 */
function insertBreak(): void {
  if (document.execCommand) {
    document.execCommand('insertLineBreak')
    onRichInput()
    return
  }

  insertNodeAtCaret(document.createElement('br'))
  onRichInput()
}

/**
 * 原生模式键盘事件
 *
 * @param event 键盘事件
 *
 * @remarks 只处理 `submitOnEnter`：松开原生行为时 Enter 就是换行，
 * 交给浏览器最省心，不要自己插内容。
 */
function onInnerKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Enter' || !props.submitOnEnter || event.shiftKey) return
  if (event.isComposing) return

  event.preventDefault()
  emit('submit', props.modelValue)
}

/**
 * 富文本模式键盘事件
 * @param event 键盘事件
 */
function onRichKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Enter') return
  // 输入法确认候选词的回车不能当成换行或提交
  if (event.isComposing || composing) return

  if (props.submitOnEnter && !event.shiftKey) {
    event.preventDefault()
    emit('submit', props.modelValue)
    return
  }

  event.preventDefault()
  insertBreak()
}

/**
 * 粘贴：只收纯文本
 * @param event 剪贴板事件
 *
 * @remarks 评论框里粘进带样式的富文本是灾难——颜色、字体、外链全会进来。
 */
function onRichPaste(event: ClipboardEvent): void {
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain') ?? ''
  if (!text) return

  // execCommand 会保留撤销栈，比手动拆节点更稳
  if (document.execCommand) {
    document.execCommand('insertText', false, text)
    return
  }

  insertNodeAtCaret(document.createTextNode(text))
}

/** 输入法开始 */
function onCompositionStart(): void {
  composing = true
}

/** 输入法结束：此时才把内容同步出去 */
function onCompositionEnd(): void {
  composing = false
  onRichInput()
}

/**
 * 聚焦
 * @param event 焦点事件
 */
function onFocus(event: FocusEvent): void {
  focused.value = true
  emit('focus', event)
}

/**
 * 失焦
 * @param event 焦点事件
 */
function onBlur(event: FocusEvent): void {
  focused.value = false
  emit('blur', event)
}

/**
 * 插入一个表情
 * @param item 表情项
 *
 * @remarks 只在富文本模式下有效：纯文本模式没有地方承载内联图片，
 * 硬插入 `[名称]` 反而会让用户以为没生效。
 */
function insertEmoji(item: SrEmojiItem): void {
  if (!rich.value || !editable.value || !richRef.value) return

  const el = richRef.value
  if (document.activeElement !== el) el.focus()

  insertNodeAtCaret(srCreateEmojiNode(item))
  onRichInput()
}

/**
 * 在光标处插入文本
 * @param text 纯文本
 */
function insertText(text: string): void {
  if (!text || !editable.value) return

  if (rich.value) {
    richRef.value?.focus()
    insertNodeAtCaret(document.createTextNode(text))
    onRichInput()
    return
  }

  const el = textareaRef.value
  if (!el) return

  const start = el.selectionStart ?? props.modelValue.length
  const end = el.selectionEnd ?? start
  const next = props.modelValue.slice(0, start) + text + props.modelValue.slice(end)

  emit('update:modelValue', next)
  emit('change', next)

  nextTick(() => {
    el.focus()
    el.setSelectionRange(start + text.length, start + text.length)
    syncHeight()
  })
}

/** 清空内容 */
function clear(): void {
  if (rich.value && richRef.value) richRef.value.textContent = ''
  emit('update:modelValue', '')
  emit('change', '')
  nextTick(syncHeight)
}

/** 聚焦编辑区 */
function focus(): void {
  if (rich.value) {
    richRef.value?.focus()
    moveCaretToEnd()
    return
  }

  const el = textareaRef.value
  if (!el) return

  el.focus()
  const end = el.value.length
  el.setSelectionRange(end, end)
}

/** 失焦 */
function blur(): void {
  const el = rich.value ? richRef.value : textareaRef.value
  ;(el as HTMLElement | null)?.blur()
}

/** 主动派发提交事件，供外部按钮调用 */
function submit(): void {
  emit('submit', props.modelValue)
}

/** 读取当前值 */
function getValue(): string {
  return props.modelValue
}

defineExpose({ focus, blur, clear, insertEmoji, insertText, submit, getValue })

// 外部改值时重建富文本内容；输入引起的变化会被序列化比较挡掉，光标不受影响
watch(
  () => props.modelValue,
  (value) => {
    if (rich.value && richRef.value && !composing) {
      if (srSerializeRich(richRef.value) !== value) {
        srRenderRich(richRef.value, value, emojiMap.value)
        moveCaretToEnd()
      }
    }
    nextTick(syncHeight)
  },
)

// 尺寸、行数、模式变化都要重算高度
watch([() => props.size, () => props.rows, () => props.maxRows, rich], () => nextTick(syncHeight))

watch(rich, (isRich) => {
  if (!isRich) return
  nextTick(() => {
    if (!richRef.value) return
    srRenderRich(richRef.value, props.modelValue, emojiMap.value)
    syncHeight()
  })
})

onMounted(() => {
  if (rich.value && richRef.value) srRenderRich(richRef.value, props.modelValue, emojiMap.value)
  syncHeight()
})
</script>

<template>
  <div class="sr-textarea" :class="classes" :style="sizeVars">
    <!-- 背景层：图片与文字都在内容下层，不挡点击也不参与选中 -->
    <div
      v-if="backgroundImage || backgroundText"
      class="sr-textarea__bg"
      :style="[bgLayerStyle, bgContentStyle]"
      aria-hidden="true"
    >
      <span v-if="backgroundText" class="sr-textarea__bg-text" :style="bgTextStyle">
        {{ backgroundText }}
      </span>
    </div>

    <div class="sr-textarea__body">
      <div
        v-if="rich"
        ref="richRef"
        class="sr-textarea__rich"
        :class="{ 'is-empty': !modelValue }"
        :contenteditable="editable"
        :data-placeholder="placeholder"
        role="textbox"
        aria-multiline="true"
        v-bind="$attrs"
        @input="onRichInput"
        @keydown="onRichKeydown"
        @paste="onRichPaste"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
        @focus="onFocus"
        @blur="onBlur"
      />
      <textarea
        v-else
        ref="textareaRef"
        class="sr-textarea__inner"
        :value="modelValue"
        :rows="rows"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        v-bind="$attrs"
        @input="onInnerInput"
        @keydown="onInnerKeydown"
        @focus="onFocus"
        @blur="onBlur"
      />
    </div>

    <div v-if="$slots.footer" class="sr-textarea__footer">
      <div class="sr-textarea__footer-main">
        <slot name="footer" :count="count" :maxlength="maxlength" :submit="submit" />
      </div>
      <span v-if="showCount" class="sr-textarea__count" :class="{ 'is-over': overLimit }">
        {{ count }}<template v-if="maxlength"> / {{ maxlength }}</template>
      </span>
    </div>
    <span
      v-else-if="showCount"
      class="sr-textarea__count sr-textarea__count--inline"
      :class="{ 'is-over': overLimit }"
    >
      {{ count }}<template v-if="maxlength"> / {{ maxlength }}</template>
    </span>
  </div>
</template>
