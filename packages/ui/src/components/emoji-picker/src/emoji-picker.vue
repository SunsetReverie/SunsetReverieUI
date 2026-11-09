<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { DEFAULT_EMOJI_PACKAGES } from './data'
import { emojiPickerProps, type SrEmojiItem } from './emoji-picker'
import { stringifyEmoji } from './parse'

defineOptions({ name: 'SrEmojiPicker', inheritAttrs: false })

const props = defineProps(emojiPickerProps)

const emit = defineEmits<{
  /** 选中某个表情 */
  select: [item: SrEmojiItem, mark: string]
  /** 选中后请求关闭（仅 `closeOnSelect` 时派发） */
  close: []
  /** 搜索关键词变化 */
  'search-change': [keyword: string]
}>()

/** 最近使用的表情，只在本次会话内保留 */
const recent = ref<SrEmojiItem[]>([])

/** 当前分类的 key；空串表示第一个包 */
const activeTab = ref('')

/**
 * 是否正在看「最近」
 *
 * @remarks 早期版本用 `activeTab === ''` 兼任「最近」，结果一旦选了表情
 * 就自动跳到最近视图、面板只剩刚选的那一个，连选根本没法用。
 * 视图状态和「最近」列表必须分开。
 */
const viewingRecent = ref(false)

/** 搜索关键词 */
const searchText = ref('')

/** 当前悬停的表情，用于顶部信息行 */
const hovered = ref<SrEmojiItem | null>(null)

/** 分类栏滚动容器 */
const tabsRef = ref<HTMLElement | null>(null)

/** 分类栏是否正在拖拽（只影响光标） */
const tabsDragging = ref(false)

/** 刚被点选的表情名，用来触发一次短暂的「已选中」动画 */
const pickedName = ref('')

/** 选中动画的复位定时器 */
let pickedTimer: ReturnType<typeof setTimeout> | null = null

/** 正在拖拽的指针 id */
let dragPointer: number | null = null
/** 拖拽起点 X */
let dragStartX = 0
/** 拖拽起点的 scrollLeft */
let dragStartScroll = 0
/** 本次按下是否已判定为拖拽（超过 4px） */
let dragMoved = false
/** 拖拽结束后抑制紧随其后的 click，避免误切 tab */
let suppressClick = false

/** 是否正在搜索 */
const isSearching = computed(() => props.searchable && searchText.value.trim().length > 0)

/** 实际使用的表情包 */
const packages = computed(() => (props.packages.length ? props.packages : DEFAULT_EMOJI_PACKAGES))

/** 是否显示「最近」tab */
const hasRecent = computed(() => props.showRecent && recent.value.length > 0 && !isSearching.value)

/** 当前分类的 key（空串时回落到第一个包） */
const currentPackKey = computed(() => activeTab.value || packages.value[0]?.key || '')

/** 实际高亮的 tab */
const activeKey = computed(() =>
  viewingRecent.value && hasRecent.value ? '__recent__' : currentPackKey.value,
)

/**
 * 所有表情拉平并去重
 *
 * @remarks 搜索是跨分类的，所以要先准备一份全集。
 * 顺序与 `buildEmojiMap` 一致：先出现的优先。
 */
const allEmojis = computed(() => {
  const seen = new Set<string>()
  const result: SrEmojiItem[] = []

  for (const pack of packages.value) {
    for (const item of pack.emojis) {
      if ((!item.char && !item.url) || seen.has(item.name)) continue
      seen.add(item.name)
      result.push(item)
    }
  }

  return result
})

/**
 * 当前应该展示的表情
 *
 * 搜索时跨所有分类按名称过滤；否则展示当前 tab。
 * 找不到 tab 时退回第一个包，避免数据变化后出现空白面板。
 */
const displayEmojis = computed<SrEmojiItem[]>(() => {
  if (isSearching.value) {
    const keyword = searchText.value.trim().toLowerCase()
    return allEmojis.value.filter((item) => item.name.toLowerCase().includes(keyword))
  }

  if (viewingRecent.value && hasRecent.value) return recent.value

  const pack = packages.value.find((item) => item.key === currentPackKey.value)
  return pack?.emojis ?? []
})

/** 信息行文案：悬停优先，其次搜索结果数，最后当前分类名 */
const metaText = computed(() => {
  if (hovered.value) return hovered.value.name
  if (isSearching.value) return `找到 ${displayEmojis.value.length} 个`
  if (viewingRecent.value && hasRecent.value) return '最近使用'
  return packages.value.find((item) => item.key === currentPackKey.value)?.name ?? ''
})

/** 根节点样式：宽高都支持数字与字符串 */
const rootStyle = computed(() => {
  const toCss = (value: number | string | undefined): string | undefined => {
    if (value === undefined) return undefined
    return typeof value === 'number' ? `${value}px` : value
  }

  return {
    // 不传 width 时不能让面板宽度跟着内容走：tab 一多，
    // fit-content 会把 tab 的内容宽度也算进去，overflow-x 永远触发不了。
    // 改由 columns × 格子宽度算出，tab 超出才真正落到滚动上。
    width: toCss(props.width) ?? 'var(--sr-emoji-auto-width)',
    height: toCss(props.height),
    minHeight: `${props.minHeight}px`,
    '--sr-emoji-columns': String(props.columns),
  }
})

/** 内容区最大高度：设了固定 height 就交给 flex 分配 */
const panelStyle = computed(() =>
  props.height === undefined ? { maxHeight: `${props.maxHeight}px` } : undefined,
)

/** 网格列数 */
const gridStyle = computed(() => ({ gridTemplateColumns: `repeat(${props.columns}, 1fr)` }))

/**
 * 选中表情
 *
 * 同时把标记文本一起 emit 出去——调用方多半是往 textarea 里插入，
 * 让它自己调 `stringifyEmoji` 只是多一步且容易拼错。
 * @param item 表情项
 */
function onSelect(item: SrEmojiItem): void {
  if (props.disabled) return

  const next = [item, ...recent.value.filter((entry) => entry.name !== item.name)]
  recent.value = next.slice(0, 16)

  // 点下去要有个「收到了」的反馈，否则连选时看不出点中了哪一个
  pickedName.value = item.name
  if (pickedTimer) clearTimeout(pickedTimer)
  pickedTimer = setTimeout(() => {
    pickedName.value = ''
    pickedTimer = null
  }, 420)

  emit('select', item, stringifyEmoji(item))
  if (props.closeOnSelect) emit('close')
}

onBeforeUnmount(() => {
  if (pickedTimer) clearTimeout(pickedTimer)
})

/**
 * 分类栏滚轮：把纵向滚轮映射成横向滚动
 *
 * @remarks 普通鼠标只有纵向滚轮，不接管的话在 tab 上滚轮会让整个页面
 * 上下跳，完全帮不到用户。触控板的双轴手势（deltaX 更大）交给浏览器。
 * @param event 滚轮事件
 */
function onTabsWheel(event: WheelEvent): void {
  const el = tabsRef.value
  if (!el) return
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

  event.preventDefault()
  el.scrollLeft += event.deltaY
}

/**
 * 开始拖拽分类栏
 *
 * @remarks 用 Pointer Events 而不是 mouse / touch 两套：
 * 鼠标、触摸笔、触屏共用一份代码。捕获指针后拖出 tab 栏也能继续收到 move。
 * @param event 指针事件
 */
function onTabsPointerDown(event: PointerEvent): void {
  if (event.pointerType === 'mouse' && event.button !== 0) return

  const el = tabsRef.value
  if (!el) return

  dragPointer = event.pointerId
  dragStartX = event.clientX
  dragStartScroll = el.scrollLeft
  dragMoved = false
  suppressClick = false

  el.setPointerCapture?.(event.pointerId)
}

/**
 * 拖拽中
 * @param event 指针事件
 */
function onTabsPointerMove(event: PointerEvent): void {
  if (dragPointer !== event.pointerId) return

  const el = tabsRef.value
  if (!el) return

  const dx = event.clientX - dragStartX

  // 4px 阈值：手抖不算拖拽，正常点击仍能切 tab
  if (!dragMoved && Math.abs(dx) > 4) {
    dragMoved = true
    tabsDragging.value = true
  }
  if (!dragMoved) return

  el.scrollLeft = dragStartScroll - dx
  event.preventDefault()
}

/**
 * 结束拖拽
 * @param event 指针事件
 */
function onTabsPointerUp(event: PointerEvent): void {
  if (dragPointer !== event.pointerId) return

  tabsRef.value?.releasePointerCapture?.(event.pointerId)
  dragPointer = null
  tabsDragging.value = false

  // 拖过就不让松手时的 click 切到起手处那个 tab
  suppressClick = dragMoved
  dragMoved = false
}

/**
 * 捕获阶段拦掉拖拽产生的 click
 * @param event 点击事件
 */
function onTabsClickCapture(event: MouseEvent): void {
  if (!suppressClick) return

  suppressClick = false
  event.preventDefault()
  event.stopPropagation()
}

/**
 * 切到某个分类
 *
 * @remarks 同时退出「最近」视图。模板里用一条表达式写两个赋值会用到分号，
 * 而 Vue 模板表达式不支持多语句，所以收在这里。
 * @param key 分类 key
 */
function selectPack(key: string): void {
  viewingRecent.value = false
  activeTab.value = key
}

/**
 * 搜索输入
 * @param event 输入事件
 */
function onSearchInput(event: Event): void {
  searchText.value = (event.target as HTMLInputElement).value
  hovered.value = null
  emit('search-change', searchText.value)
}

/**
 * 清空搜索
 */
function clearSearch(): void {
  searchText.value = ''
  emit('search-change', '')
}

// 表情包变化后，如果当前 tab 已不存在，回到第一个
watch(
  packages,
  (list) => {
    if (activeTab.value && !list.some((item) => item.key === activeTab.value)) {
      activeTab.value = ''
    }
    if (viewingRecent.value && !recent.value.length) viewingRecent.value = false
  },
  { immediate: true },
)

// 关闭搜索时清掉关键词，避免下次打开还留着旧条件
watch(isSearching, (on, off) => {
  if (!on && off) hovered.value = null
})
</script>

<template>
  <div
    class="sr-emoji-picker"
    :class="[`sr-emoji-picker--${size}`, `is-tab-${tabPosition}`, { 'is-disabled': disabled }]"
    :style="rootStyle"
  >
    <!-- 搜索框 -->
    <div v-if="searchable" class="sr-emoji-picker__search">
      <input
        class="sr-emoji-picker__search-input"
        type="search"
        :value="searchText"
        :placeholder="searchPlaceholder"
        :aria-label="searchPlaceholder"
        @input="onSearchInput"
      />
      <button
        v-if="searchText"
        class="sr-emoji-picker__search-clear"
        type="button"
        aria-label="清空搜索"
        @click="clearSearch"
      >
        ×
      </button>
    </div>

    <!-- 内容区 -->
    <div class="sr-emoji-picker__panel" :style="panelStyle" role="tabpanel">
      <p class="sr-emoji-picker__meta" aria-live="polite">{{ metaText }}</p>

      <div v-if="displayEmojis.length" class="sr-emoji-picker__grid" :style="gridStyle">
        <button
          v-for="item in displayEmojis"
          :key="`${item.name}-${item.url ?? item.char}`"
          class="sr-emoji-picker__item"
          :class="{ 'is-picked': pickedName === item.name }"
          type="button"
          :title="item.name"
          :aria-label="item.name"
          @click="onSelect(item)"
          @mouseenter="hovered = item"
          @mouseleave="hovered = null"
          @focus="hovered = item"
          @blur="hovered = null"
        >
          <img v-if="item.url" class="sr-emoji-picker__img" :src="item.url" :alt="item.name" loading="lazy" />
          <span v-else class="sr-emoji-picker__char">{{ item.char }}</span>
        </button>
      </div>

      <p v-else class="sr-emoji-picker__empty">
        {{ isSearching ? '没有匹配的表情' : '这个表情包是空的' }}
      </p>
    </div>

    <!-- 分类栏 -->
    <div
      v-if="!isSearching"
      ref="tabsRef"
      class="sr-emoji-picker__tabs"
      :class="{ 'is-dragging': tabsDragging }"
      role="tablist"
      @wheel="onTabsWheel"
      @pointerdown="onTabsPointerDown"
      @pointermove="onTabsPointerMove"
      @pointerup="onTabsPointerUp"
      @pointercancel="onTabsPointerUp"
      @click.capture="onTabsClickCapture"
    >
      <button
        v-if="hasRecent"
        class="sr-emoji-picker__tab"
        :class="{ 'is-active': activeKey === '__recent__' }"
        type="button"
        role="tab"
        :aria-selected="activeKey === '__recent__'"
        @click="viewingRecent = true"
      >
        最近
      </button>

      <button
        v-for="pack in packages"
        :key="pack.key"
        class="sr-emoji-picker__tab"
        :class="{ 'is-active': activeKey === pack.key }"
        type="button"
        role="tab"
        :aria-selected="activeKey === pack.key"
        @click="selectPack(pack.key)"
      >
        {{ pack.name }}
      </button>
    </div>
  </div>
</template>
