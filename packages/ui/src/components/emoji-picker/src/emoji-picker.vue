<script setup lang="ts">
import { computed, ref, watch } from 'vue'

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

/** 当前 tab 的 key；空字符串表示「最近」 */
const activeTab = ref('')

/** 搜索关键词 */
const searchText = ref('')

/** 当前悬停的表情，用于顶部信息行 */
const hovered = ref<SrEmojiItem | null>(null)

/** 是否正在搜索 */
const isSearching = computed(() => props.searchable && searchText.value.trim().length > 0)

/** 实际使用的表情包 */
const packages = computed(() => (props.packages.length ? props.packages : DEFAULT_EMOJI_PACKAGES))

/** 是否显示「最近」tab */
const hasRecent = computed(() => props.showRecent && recent.value.length > 0 && !isSearching.value)

/**
 * 实际高亮的 tab
 *
 * @remarks `activeTab` 为空串时表示「最近」，但最近为空时没有这个 tab，
 * 此时应当高亮第一个包——直接用 `activeTab === pack.key` 会导致
 * 初始状态下没有任何 tab 处于选中态。
 */
const activeKey = computed(() => {
  if (activeTab.value) return activeTab.value
  return hasRecent.value ? '__recent__' : (packages.value[0]?.key ?? '')
})

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

  if (!activeTab.value) {
    return hasRecent.value ? recent.value : (packages.value[0]?.emojis ?? [])
  }

  const pack = packages.value.find((item) => item.key === activeTab.value)
  return pack?.emojis ?? packages.value[0]?.emojis ?? []
})

/** 信息行文案：悬停优先，其次搜索结果数，最后当前分类名 */
const metaText = computed(() => {
  if (hovered.value) return hovered.value.name
  if (isSearching.value) return `找到 ${displayEmojis.value.length} 个`
  if (!activeTab.value && hasRecent.value) return '最近使用'
  return packages.value.find((item) => item.key === activeKey.value)?.name ?? ''
})

/** 根节点样式：宽高都支持数字与字符串 */
const rootStyle = computed(() => {
  const toCss = (value: number | string | undefined): string | undefined => {
    if (value === undefined) return undefined
    return typeof value === 'number' ? `${value}px` : value
  }

  return {
    width: toCss(props.width),
    height: toCss(props.height),
    minHeight: `${props.minHeight}px`,
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

  emit('select', item, stringifyEmoji(item))
  if (props.closeOnSelect) emit('close')
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
    <div v-if="!isSearching" class="sr-emoji-picker__tabs" role="tablist">
      <button
        v-if="hasRecent"
        class="sr-emoji-picker__tab"
        :class="{ 'is-active': activeKey === '__recent__' }"
        type="button"
        role="tab"
        :aria-selected="activeKey === '__recent__'"
        @click="activeTab = ''"
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
        @click="activeTab = pack.key"
      >
        {{ pack.name }}
      </button>
    </div>
  </div>
</template>
