<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { srComputeFloating, srGetRect } from '../../../utils/floating'
import SrEmojiPicker from '../../emoji-picker/src/emoji-picker.vue'
import type { SrEmojiItem } from '../../emoji-picker/src/emoji-picker'
import SrIcon from '../../icon/src/icon.vue'
import { srCountMarkdownText } from '../../markdown/src/builtin-parser'
import type { SrMarkdownInsertField } from '../../markdown/src/extensions'
import SrMarkdown from '../../markdown/src/markdown.vue'
import SrSegmented from '../../segmented/src/segmented.vue'
import SrTooltip from '../../tooltip/src/tooltip.vue'
import {
  markdownEditorProps,
  SR_MARKDOWN_DEFAULT_TOOLBAR,
  type SrMarkdownEditorApi,
  type SrMarkdownEditorMode,
  type SrMarkdownToolbarItem,
  type SrMarkdownToolbarPreset,
} from './markdown-editor'

defineOptions({ name: 'SrMarkdownEditor', inheritAttrs: false })

const props = defineProps(markdownEditorProps)

const emit = defineEmits<{
  /** 内容变化 */
  'update:modelValue': [value: string]
  /** 内容变化（与 update 同时派发） */
  change: [value: string]
  /** 保存（Cmd/Ctrl + S） */
  save: [value: string]
  /** 上传失败 */
  'upload-error': [error: unknown]
  /** 视图模式变化 */
  'mode-change': [mode: SrMarkdownEditorMode]
}>()

/** 编辑区 */
const textareaRef = ref<HTMLTextAreaElement | null>(null)
/** 预览区滚动容器 */
const previewRef = ref<HTMLElement | null>(null)
/** 表情浮层 */
const emojiPanelRef = ref<HTMLElement | null>(null)
/** 表情按钮 */
const emojiButtonRef = ref<HTMLElement | null>(null)
/** 文件选择框 */
const fileRef = ref<HTMLInputElement | null>(null)

/** 当前视图模式 */
const currentMode = ref<SrMarkdownEditorMode>(props.mode)
/** 表情浮层是否展开 */
const emojiOpen = ref(false)
/** 表情浮层坐标 */
const emojiPos = ref({ top: 0, left: 0 })
/** 上传中 */
const uploading = ref(false)

/** 参数面板的当前配置 */
const insertPanel = ref<{
  title: string
  template: string
  fields: SrMarkdownInsertField[]
  width: number
} | null>(null)

/** 参数面板里各字段的值 */
const insertValues = ref<Record<string, string>>({})

/** 打开面板前的光标位置，确认时恢复，避免焦点移走后插错地方 */
let savedSelection: { start: number; end: number } | null = null

/** 字数 */
const count = computed(() => srCountMarkdownText(props.modelValue))

/** 是否超限 */
const overLimit = computed(() => props.maxLength > 0 && count.value > props.maxLength)

/** 视图选项的图标：分栏用左右两栏的示意图，比文字更直观 */
const MODE_ICONS: Record<SrMarkdownEditorMode, string> = {
  edit: 'lucide:pencil',
  split: 'lucide:columns-2',
  preview: 'lucide:eye',
}

/** 视图选项：text 模式不带图标，其余两种带 */
const modeOptions = computed(() =>
  (
    [
      { label: '编辑', value: 'edit' },
      { label: '分栏', value: 'split' },
      { label: '预览', value: 'preview' },
    ] as const
  ).map((option) =>
    props.modeToggle === 'text' ? { ...option } : { ...option, icon: MODE_ICONS[option.value] },
  ),
)

/** 当前生效的明暗主题 */
const resolvedTheme = ref<'light' | 'dark'>('light')

/** 主题属性观察器 */
let themeObserver: MutationObserver | null = null

/**
 * 读取根元素上的明暗标记
 *
 * @remarks 直接读 DOM 而不是 `useSrTheme().resolved`：演示站与 Nuxt 前台
 * 可能用首帧主题脚本单独写 `data-sr-theme`，那份状态不经过 composable，
 * 两边会不同步。以 DOM 属性为准最可靠。
 */
function readResolvedTheme(): void {
  if (typeof document === 'undefined') return
  resolvedTheme.value = document.documentElement.getAttribute('data-sr-theme') === 'dark' ? 'dark' : 'light'
}

/**
 * 实际交给 SrTooltip 的配色
 *
 * auto 跟随主题：浅色主题白玻璃、深色主题黑玻璃；
 * 显式指定 light / dark 时不受主题切换影响。
 */
const resolvedTooltipVariant = computed<'light' | 'dark'>(() => {
  if (props.tooltipVariant !== 'auto') return props.tooltipVariant
  return resolvedTheme.value === 'dark' ? 'dark' : 'light'
})

// setup 阶段先读一次：等 onMounted 再读会让首次渲染拿到错误的配色，
// 主题切换后的组件挂载尤其明显
readResolvedTheme()

onMounted(() => {
  if (typeof MutationObserver === 'undefined') return
  themeObserver = new MutationObserver(readResolvedTheme)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-sr-theme'],
  })
})

/** 编辑区高度 */
const bodyHeight = computed(() => (typeof props.height === 'number' ? `${props.height}px` : props.height))

/** 预设图标 */
const PRESET_ICONS: Record<string, string> = {
  bold: 'lucide:bold',
  italic: 'lucide:italic',
  strike: 'lucide:strikethrough',
  heading: 'lucide:heading',
  'list-ul': 'lucide:list',
  'list-ol': 'lucide:list-ordered',
  quote: 'lucide:quote',
  code: 'lucide:code',
  'code-block': 'lucide:square-code',
  link: 'lucide:link',
  image: 'lucide:image',
  hr: 'lucide:minus',
  emoji: 'lucide:smile',
}

/** 预设提示文案 */
const PRESET_LABELS: Record<string, string> = {
  bold: '粗体',
  italic: '斜体',
  strike: '删除线',
  heading: '标题',
  'list-ul': '无序列表',
  'list-ol': '有序列表',
  quote: '引用',
  code: '行内代码',
  'code-block': '代码块',
  link: '链接',
  image: '插入图片（外链）',
  hr: '分割线',
  emoji: '表情',
}

// ============================ 光标操作 ============================

/**
 * 把新值写回组件并把光标放到指定位置
 *
 * @remarks 直接改 `textarea.value` 而不是等 Vue 重渲染：
 * 后面要立刻设置选区，等一帧的话光标会先跳到末尾。
 * @param next 新值
 * @param from 选区起点
 * @param to 选区终点，默认与起点相同
 */
function applyValue(next: string, from: number, to = from): void {
  emit('update:modelValue', next)
  emit('change', next)

  nextTick(() => {
    const el = textareaRef.value
    if (!el) return

    el.value = next
    el.focus()
    el.setSelectionRange(from, to)
    scrollCaretIntoView(el, next, from)
  })
}

/**
 * 把光标滚进可视区
 * @param el 编辑区
 * @param value 当前值
 * @param position 光标位置
 */
function scrollCaretIntoView(el: HTMLTextAreaElement, value: string, position: number): void {
  const style = getComputedStyle(el)
  const lineHeight = parseFloat(style.lineHeight) || 22
  const line = value.slice(0, position).split('\n').length - 1
  const caretTop = line * lineHeight
  const viewTop = el.scrollTop
  const viewBottom = viewTop + el.clientHeight

  if (caretTop < viewTop || caretTop + lineHeight > viewBottom) {
    el.scrollTop = Math.max(0, caretTop - el.clientHeight / 2 + lineHeight / 2)
  }
}

/**
 * 插入文本
 * @param text 要插入的内容
 * @param block 是否保证前后有空行
 */
function insert(text: string, block = true): void {
  const el = textareaRef.value
  if (!el) return

  const value = props.modelValue
  const start = el.selectionStart
  const end = el.selectionEnd

  // 块级插入时补空行，避免粘到上一段末尾
  const needsBlank = block && start > 0 && value[start - 1] !== '\n'
  const inserted = (needsBlank ? '\n\n' : '') + text
  const next = value.slice(0, start) + inserted + value.slice(end)

  applyValue(next, start + inserted.length)
}

/**
 * 插入并选中其中一段文字
 *
 * @remarks 短代码的占位部分（如 `id=1` 里的 `1`）插完直接选中，
 * 用户接着输入就覆盖掉了。
 * @param text 完整文本
 * @param target 需要选中的子串
 */
function insertWithSelection(text: string, target: string): void {
  const el = textareaRef.value
  if (!el) return

  const value = props.modelValue
  const start = el.selectionStart
  const end = el.selectionEnd
  const next = value.slice(0, start) + text + value.slice(end)

  const offset = text.indexOf(target)
  const from = offset >= 0 ? start + offset : start + text.length
  const to = offset >= 0 ? from + target.length : from

  applyValue(next, from, to)
}

/**
 * 用前后缀包裹选区
 * @param before 前缀
 * @param after 后缀
 * @param placeholder 无选区时的占位文字
 */
function wrap(before: string, after: string, placeholder = '文本'): void {
  const el = textareaRef.value
  if (!el) return

  const value = props.modelValue
  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = value.slice(start, end) || placeholder
  const next = value.slice(0, start) + before + selected + after + value.slice(end)

  const from = start + before.length
  applyValue(next, from, from + selected.length)
}

/**
 * 给选中行加前缀
 * @param marker 前缀，如 `'- '`
 * @param ordered 是否用递增序号
 */
function prefixLines(marker: string, ordered = false): void {
  const el = textareaRef.value
  if (!el) return

  const value = props.modelValue
  const start = el.selectionStart
  const end = el.selectionEnd

  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  const lineEndIdx = value.indexOf('\n', end)
  const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx

  const block = value.slice(lineStart, lineEnd)
  const next = block
    .split('\n')
    .map((line, i) => {
      // 先剥掉已有前缀，实现「再点一次取消」
      const cleaned = line.replace(/^\s{0,3}(?:[-*+]|\d+[.)])\s+/, '')
      return (ordered ? `${i + 1}. ` : marker) + cleaned
    })
    .join('\n')

  const replacement = value.slice(0, lineStart) + next + value.slice(lineEnd)
  applyValue(replacement, lineStart + next.length)
}

// ============================ 短代码参数面板 ============================

/**
 * 把模板里的 `{key}` 换成面板值
 *
 * @remarks 值里的花括号和换行会破坏短代码语法（正则以 `}` 收尾），
 * 所以替换前统一剥掉；空格保留，让文件名之类的值仍然可读。
 */
function fillInsertTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_matched, key: string) =>
    String(values[key] ?? '')
      .replace(/[{}]/g, '')
      .replace(/[\r\n]+/g, ' ')
      .trim(),
  )
}

/**
 * 写入某个字段的值
 *
 * @remarks 用「替换整个对象」而不是动态键赋值：模板里
 * `v-model="values[key]"` 的响应式更新在不同编译路径下不稳定，
 * 而 computed 依赖的是整个 insertValues.value。
 */
function setInsertValue(key: string, event: Event): void {
  const value = (event.target as HTMLInputElement).value
  insertValues.value = { ...insertValues.value, [key]: value }
}

/** 必填项是否都填了 */
const canSubmitInsert = computed(() =>
  (insertPanel.value?.fields ?? []).every(
    (field) => !field.required || Boolean(insertValues.value[field.key]?.trim()),
  ),
)

/**
 * 打开参数面板
 * @param config 扩展上的 insert 配置
 */
function openInsertPanel(config: {
  label: string
  template: string
  fields?: SrMarkdownInsertField[]
  panelTitle?: string
  panelWidth?: number
}): void {
  const fields = config.fields ?? []
  const values: Record<string, string> = {}

  for (const field of fields) values[field.key] = field.default ?? ''

  const el = textareaRef.value
  savedSelection = el ? { start: el.selectionStart, end: el.selectionEnd } : null

  insertValues.value = values
  insertPanel.value = {
    title: config.panelTitle ?? config.label,
    template: config.template,
    fields,
    width: config.panelWidth ?? 360,
  }
}

/** 关闭参数面板 */
function closeInsertPanel(): void {
  insertPanel.value = null
  savedSelection = null
}

/** 确认插入：恢复选区 → 拼模板 → 走统一的插入逻辑 */
function confirmInsertPanel(): void {
  const panel = insertPanel.value
  if (!panel || !canSubmitInsert.value) return

  const text = fillInsertTemplate(panel.template, insertValues.value)

  const el = textareaRef.value
  if (el && savedSelection) {
    el.focus()
    el.setSelectionRange(savedSelection.start, savedSelection.end)
  }

  insert(text, true)
  closeInsertPanel()
}

/** Esc 关闭面板 */
function onPanelKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && insertPanel.value) closeInsertPanel()
}

watch(insertPanel, (open) => {
  if (typeof document === 'undefined') return
  if (open) document.addEventListener('keydown', onPanelKeydown)
  else document.removeEventListener('keydown', onPanelKeydown)
})

// ============================ 工具栏 ============================

/** 实际的工具栏项 */
const toolbarItems = computed<SrMarkdownToolbarItem[]>(() => {
  if (props.toolbar === false) return []

  const base = [...(props.toolbar ?? SR_MARKDOWN_DEFAULT_TOOLBAR)]

  // 扩展自带的插入按钮
  for (const extension of props.extensions) {
    const insertConfig = extension.insert
    if (!insertConfig) continue

    base.push({
      key: `ext-${extension.name}`,
      label: insertConfig.label,
      icon: insertConfig.icon,
      action: () => {
        // 有字段就先弹参数面板，没有则维持「直接插模板」的旧行为
        if (insertConfig.fields?.length) {
          openInsertPanel(insertConfig)
          return
        }

        const placeholder = insertConfig.placeholder ?? '1'
        insertWithSelection(insertConfig.template.replace(/\$1/g, placeholder), placeholder)
      },
    })
  }

  // 配了表情包才有表情按钮
  if (props.emojiPackages.length) {
    base.push({
      key: 'emoji',
      label: PRESET_LABELS.emoji ?? '表情',
      icon: PRESET_ICONS.emoji,
      // 实际由 onToolbarClick 的 key 分支接管，这里给个空实现满足类型
      action: () => {
        void toggleEmoji()
      },
    })
  }

  return base
})

/** 是否显示工具栏 */
const showToolbar = computed(() => props.toolbar !== false && toolbarItems.value.length > 0)

/**
 * 工具栏项的展示信息
 * @param item 工具栏项
 * @returns 图标、文案、禁用态
 */
function describe(item: SrMarkdownToolbarItem): { icon?: string; label: string; disabled?: boolean } {
  if (typeof item === 'string') {
    // 同一个按钮在两种配置下是两件事：配了 upload 是「选文件上传」，
    // 没配是「贴一个外链地址」。图标与提示都跟着变，不能都叫「图片」——
    // 工具栏里往往还有图集这类短代码按钮，含糊的文案会让人分不清点哪个。
    if (item === 'image' && props.upload) {
      return { icon: 'lucide:upload', label: '上传图片' }
    }

    return { icon: PRESET_ICONS[item], label: PRESET_LABELS[item] ?? item }
  }

  return { icon: item.icon, label: item.label, disabled: item.disabled }
}

/**
 * 工具栏项的稳定 key
 * @param item 工具栏项
 * @param index 下标
 * @returns key
 */
function itemKey(item: SrMarkdownToolbarItem, index: number): string {
  return typeof item === 'string' ? `${item}-${index}` : item.key
}

/**
 * 是否表情按钮
 * @param item 工具栏项
 * @returns 结果
 */
function isEmojiButton(item: SrMarkdownToolbarItem): boolean {
  return typeof item === 'object' && item.key === 'emoji'
}

/**
 * 执行预设动作
 * @param preset 预设名
 */
function runPreset(preset: SrMarkdownToolbarPreset): void {
  switch (preset) {
    case 'bold':
      wrap('**', '**', '粗体')
      break
    case 'italic':
      wrap('*', '*', '斜体')
      break
    case 'strike':
      wrap('~~', '~~', '删除线')
      break
    case 'heading':
      prefixLines('## ')
      break
    case 'list-ul':
      prefixLines('- ')
      break
    case 'list-ol':
      prefixLines('', true)
      break
    case 'quote':
      prefixLines('> ')
      break
    case 'code':
      wrap('`', '`', '代码')
      break
    case 'code-block':
      insert('```\n代码\n```')
      break
    case 'link':
      wrap('[', '](https://)', '链接文字')
      break
    case 'image':
      pickImage()
      break
    case 'hr':
      insert('---')
      break
    default:
      break
  }
}

/**
 * 点击工具栏项
 * @param item 工具栏项
 */
function onToolbarClick(item: SrMarkdownToolbarItem): void {
  if (props.readonly || uploading.value) return

  if (typeof item === 'string') {
    if (item === '|') return
    runPreset(item)
    return
  }

  if (item.disabled) return

  if (item.key === 'emoji') {
    void toggleEmoji()
    return
  }

  item.action(editorApi())
}

/**
 * 图片按钮：有 upload 走文件选择，没有就插模板
 */
function pickImage(): void {
  if (!props.upload) {
    insert('![图片描述](https://)')
    return
  }

  fileRef.value?.click()
}

/**
 * 选完文件
 * @param event 变更事件
 */
async function onFileChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  // 清空以便再次选同一个文件也能触发 change
  input.value = ''

  if (!file || !props.upload) return

  uploading.value = true

  try {
    const url = await props.upload(file)
    insert(`![${file.name}](${url})`, false)
  } catch (error) {
    emit('upload-error', error)
  } finally {
    uploading.value = false
  }
}

// ============================ 交互 ============================

/**
 * 输入
 * @param event 输入事件
 */
function onInput(event: Event): void {
  const value = (event.target as HTMLTextAreaElement).value
  emit('update:modelValue', value)
  emit('change', value)
}

/**
 * 键盘快捷键
 * @param event 键盘事件
 */
function onKeydown(event: KeyboardEvent): void {
  if (props.readonly) return

  const meta = event.metaKey || event.ctrlKey

  if (meta && event.key.toLowerCase() === 's') {
    event.preventDefault()
    emit('save', props.modelValue)
    return
  }

  if (meta && event.key.toLowerCase() === 'b') {
    event.preventDefault()
    wrap('**', '**', '粗体')
    return
  }

  if (meta && event.key.toLowerCase() === 'i') {
    event.preventDefault()
    wrap('*', '*', '斜体')
    return
  }

  if (meta && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    wrap('[', '](https://)', '链接文字')
    return
  }

  if (event.key !== 'Tab') return

  event.preventDefault()

  const el = textareaRef.value
  if (!el) return

  const value = props.modelValue
  const start = el.selectionStart
  const end = el.selectionEnd

  // 跨行选区：整块缩进 / 反缩进
  if (value.slice(start, end).includes('\n')) {
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const shifted = value
      .slice(lineStart, end)
      .split('\n')
      .map((line) => (event.shiftKey ? line.replace(/^ {1,2}/, '') : `  ${line}`))
      .join('\n')

    applyValue(value.slice(0, lineStart) + shifted + value.slice(end), lineStart + shifted.length)
    return
  }

  if (event.shiftKey) {
    // 单行反缩进：删掉光标前最多两个空格
    const before = value.slice(0, start)
    const trimmed = before.replace(/ {1,2}$/, '')
    if (trimmed !== before) applyValue(trimmed + value.slice(end), trimmed.length)
    return
  }

  applyValue(`${value.slice(0, start)}  ${value.slice(end)}`, start + 2)
}

/**
 * 编辑区滚动 → 预览区按比例跟随
 *
 * @remarks 只做比例映射，不做行对行。行对行需要把预览区每个块元素
 * 和源码行号对应起来，内容差异大时反而更不自然。
 */
function onEditScroll(): void {
  if (currentMode.value !== 'split') return

  const el = textareaRef.value
  const target = previewRef.value
  if (!el || !target) return

  const editable = el.scrollHeight - el.clientHeight
  if (editable <= 0) return

  const ratio = el.scrollTop / editable
  target.scrollTop = ratio * (target.scrollHeight - target.clientHeight)
}

// ============================ 表情浮层 ============================

/** 打开/关闭表情浮层 */
async function toggleEmoji(): Promise<void> {
  if (props.readonly) return

  emojiOpen.value = !emojiOpen.value
  if (!emojiOpen.value) return

  await nextTick()
  updateEmojiPosition()
}

/**
 * 计算浮层位置
 *
 * @remarks 浮层被 Teleport 到 body，必须用视口坐标。
 * 下方放不下时自动翻到上方。
 */
function updateEmojiPosition(): void {
  const trigger = emojiButtonRef.value
  const panel = emojiPanelRef.value
  if (!trigger || !panel) return

  const result = srComputeFloating({
    reference: srGetRect(trigger),
    floating: { width: panel.offsetWidth || 300, height: panel.offsetHeight || 280 },
    placement: 'bottom-end',
    offset: 6,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    padding: 8,
  })

  emojiPos.value = { top: result.top, left: result.left }
}

/**
 * 选中表情
 * @param item 表情项
 * @param mark 标记文本
 */
function onEmojiSelect(item: SrEmojiItem, mark: string): void {
  void item
  insert(mark, false)
}

/**
 * 点击外部关闭浮层
 * @param event 指针事件
 */
function onDocumentPointerDown(event: PointerEvent): void {
  if (!emojiOpen.value) return

  const target = event.target as Node | null
  if (!target) return
  if (emojiPanelRef.value?.contains(target)) return
  if (emojiButtonRef.value?.contains(target)) return

  emojiOpen.value = false
}

/** 视口变化时重新定位 */
function onViewportChange(): void {
  if (emojiOpen.value) updateEmojiPosition()
}

/** 浮层打开时才挂全局监听 */
function toggleGlobalListeners(on: boolean): void {
  if (typeof document === 'undefined') return

  if (on) {
    document.addEventListener('pointerdown', onDocumentPointerDown, true)
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
  } else {
    document.removeEventListener('pointerdown', onDocumentPointerDown, true)
    window.removeEventListener('resize', onViewportChange)
    window.removeEventListener('scroll', onViewportChange, true)
  }
}

watch(emojiOpen, toggleGlobalListeners)

onBeforeUnmount(() => {
  toggleGlobalListeners(false)
  document.removeEventListener('keydown', onPanelKeydown)
  themeObserver?.disconnect()
  themeObserver = null
})

// ============================ 对外 API ============================

/**
 * 编辑器 API
 *
 * @remarks 每次调用返回新对象，方法都绑定在当前组件实例的闭包上，
 * 外部存下来长期调用也没问题。
 */
function editorApi(): SrMarkdownEditorApi {
  return {
    insert: (text, block) => insert(text, block),
    wrap: (before, after, placeholder) => wrap(before, after, placeholder),
    prefixLines: (marker, ordered) => prefixLines(marker, ordered),
    focus: () => textareaRef.value?.focus(),
    getValue: () => props.modelValue,
    setValue: (value: string) => {
      emit('update:modelValue', value)
      emit('change', value)
    },
  }
}

/** 视图切换对外通知 */
watch(currentMode, (mode) => emit('mode-change', mode))

/** 外部改 mode 时同步 */
watch(
  () => props.mode,
  (mode) => {
    currentMode.value = mode
  },
)

defineExpose({
  /** 编辑器 API */
  ...editorApi(),
  /** 打开表情浮层 */
  openEmoji: () => {
    emojiOpen.value = true
    nextTick(updateEmojiPosition)
  },
  /** 关闭表情浮层 */
  closeEmoji: () => {
    emojiOpen.value = false
  },
})
</script>

<template>
  <div
    class="sr-mde"
    :class="[`sr-mde--${size}`, `is-${currentMode}`, { 'is-readonly': readonly, 'is-over': overLimit }]"
  >
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="sr-mde__bar">
      <slot name="toolbar" :api="editorApi()" :items="toolbarItems">
        <div class="sr-mde__tools">
          <template v-for="(item, index) in toolbarItems" :key="itemKey(item, index)">
            <span v-if="item === '|'" class="sr-mde__sep" aria-hidden="true" />

            <!--
              用 Tooltip 的 disabled 开关而不是写两份 button：
              关掉 tips 时触发层仍在，但退回原生 title，按钮不会失去说明。
              触发层自己监听 focusin，键盘用户也能看到提示。
            -->
            <SrTooltip
              v-else
              :content="describe(item).label"
              :variant="resolvedTooltipVariant"
              :placement="tooltipPlacement"
              :disabled="!tooltips"
            >
              <button
                :ref="isEmojiButton(item) ? (el) => (emojiButtonRef = el as HTMLElement | null) : undefined"
                class="sr-mde__tool"
                type="button"
                :title="tooltips ? undefined : describe(item).label"
                :aria-label="describe(item).label"
                :disabled="readonly || describe(item).disabled || uploading"
                @click="onToolbarClick(item)"
              >
                <SrIcon v-if="describe(item).icon" :name="describe(item).icon ?? ''" :size="14" />
                <span v-else class="sr-mde__tool-text">{{ describe(item).label }}</span>
              </button>
            </SrTooltip>
          </template>

          <span v-if="uploading" class="sr-mde__hint">上传中…</span>
        </div>
      </slot>

      <div class="sr-mde__bar-right">
        <SrSegmented
          v-model="currentMode"
          :options="modeOptions"
          :icon-only="modeToggle === 'icon'"
          size="sm"
        />
      </div>
    </div>

    <!-- 主体 -->
    <div class="sr-mde__body" :style="{ height: bodyHeight }">
      <div v-show="currentMode !== 'preview'" class="sr-mde__pane sr-mde__pane--edit">
        <textarea
          ref="textareaRef"
          class="sr-mde__textarea"
          :value="modelValue"
          :placeholder="placeholder"
          :readonly="readonly"
          spellcheck="false"
          @input="onInput"
          @keydown="onKeydown"
          @scroll="onEditScroll"
        />
      </div>

      <div v-show="currentMode !== 'edit'" ref="previewRef" class="sr-mde__pane sr-mde__pane--preview">
        <slot name="preview" :value="modelValue">
          <SrMarkdown
            :source="modelValue"
            :engine="engine"
            :extensions="extensions"
            :theme="theme"
            :sanitize="sanitize"
            :size="size"
          />
          <p v-if="!modelValue.trim()" class="sr-mde__empty">{{ placeholder }}</p>
        </slot>
      </div>
    </div>

    <!-- 底栏 -->
    <div v-if="showCount" class="sr-mde__foot">
      <span class="sr-mde__count" :class="{ 'is-over': overLimit }">
        {{ count }}<template v-if="maxLength > 0"> / {{ maxLength }}</template>
      </span>
    </div>

    <!-- 隐藏的文件选择 -->
    <input ref="fileRef" class="sr-mde__file" type="file" accept="image/*" @change="onFileChange" />

    <!-- 短代码参数面板 -->
    <Teleport to="body">
      <div v-if="insertPanel" class="sr-mde-insert-overlay" @click.self="closeInsertPanel">
        <div
          class="sr-mde-insert"
          :style="{ width: `${insertPanel.width}px` }"
          role="dialog"
          aria-modal="true"
          :aria-label="insertPanel.title"
        >
          <div class="sr-mde-insert__head">
            <span class="sr-mde-insert__title">{{ insertPanel.title }}</span>
            <button class="sr-mde-insert__close" type="button" aria-label="关闭" @click="closeInsertPanel">
              ×
            </button>
          </div>

          <div class="sr-mde-insert__body">
            <label v-for="field in insertPanel.fields" :key="field.key" class="sr-mde-insert__field">
              <span class="sr-mde-insert__label">
                {{ field.label }}
                <em v-if="field.required" class="sr-mde-insert__required">*</em>
              </span>

              <select
                v-if="field.type === 'select'"
                :value="insertValues[field.key]"
                class="sr-mde-insert__control"
                :aria-label="field.label"
                @input="setInsertValue(field.key, $event)"
              >
                <option v-for="opt in field.options ?? []" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>

              <textarea
                v-else-if="field.type === 'textarea'"
                :value="insertValues[field.key]"
                class="sr-mde-insert__control sr-mde-insert__control--area"
                :placeholder="field.placeholder"
                :aria-label="field.label"
                rows="3"
                @input="setInsertValue(field.key, $event)"
              />

              <input
                v-else
                :value="insertValues[field.key]"
                class="sr-mde-insert__control"
                :type="field.type === 'number' ? 'number' : 'text'"
                :placeholder="field.placeholder"
                :aria-label="field.label"
                @input="setInsertValue(field.key, $event)"
              />

              <small v-if="field.help" class="sr-mde-insert__help">{{ field.help }}</small>
            </label>
          </div>

          <div class="sr-mde-insert__foot">
            <button class="sr-mde-insert__btn" type="button" @click="closeInsertPanel">取消</button>
            <button
              class="sr-mde-insert__btn sr-mde-insert__btn--primary"
              type="button"
              :disabled="!canSubmitInsert"
              @click="confirmInsertPanel"
            >
              插入
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 表情浮层 -->
    <Teleport to="body">
      <div
        v-if="emojiOpen"
        ref="emojiPanelRef"
        class="sr-mde__emoji"
        :style="{ top: `${emojiPos.top}px`, left: `${emojiPos.left}px` }"
      >
        <SrEmojiPicker :packages="emojiPackages" :size="size" :columns="8" @select="onEmojiSelect" />
      </div>
    </Teleport>
  </div>
</template>
