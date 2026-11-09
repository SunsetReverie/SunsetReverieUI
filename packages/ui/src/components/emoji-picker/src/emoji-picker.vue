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
}>()

/** 最近使用的表情，只在本次会话内保留 */
const recent = ref<SrEmojiItem[]>([])

/** 当前 tab 的 key；空字符串表示「最近」 */
const activeTab = ref('')

/** 实际使用的表情包 */
const packages = computed(() => (props.packages.length ? props.packages : DEFAULT_EMOJI_PACKAGES))

/** 是否显示「最近」tab */
const hasRecent = computed(() => props.showRecent && recent.value.length > 0)

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
 * 当前 tab 的表情列表
 *
 * 找不到 tab 时退回第一个包，避免数据变化后出现空白面板。
 */
const currentEmojis = computed(() => {
  if (!activeTab.value) {
    return hasRecent.value ? recent.value : (packages.value[0]?.emojis ?? [])
  }

  const pack = packages.value.find((item) => item.key === activeTab.value)
  return pack?.emojis ?? packages.value[0]?.emojis ?? []
})

/**
 * 选中表情
 *
 * 同时把标记文本一起 emit 出去——调用方多半是往 textarea 里插入，
 * 让它自己调 `stringifyEmoji` 只是多一步且容易拼错。
 * @param item 表情项
 */
function onSelect(item: SrEmojiItem): void {
  if (props.disabled) return

  // 最近使用去重后置顶，最多留 16 个
  const next = [item, ...recent.value.filter((entry) => entry.name !== item.name)]
  recent.value = next.slice(0, 16)

  emit('select', item, stringifyEmoji(item))
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
</script>

<template>
  <div
    class="sr-emoji-picker"
    :class="[`sr-emoji-picker--${size}`, `is-tab-${tabPosition}`, { 'is-disabled': disabled }]"
  >
    <div class="sr-emoji-picker__tabs" role="tablist" :class="`is-${tabPosition}`">
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

    <div class="sr-emoji-picker__panel" :style="{ maxHeight: `${maxHeight}px` }" role="tabpanel">
      <div
        v-if="currentEmojis.length"
        class="sr-emoji-picker__grid"
        :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }"
      >
        <button
          v-for="item in currentEmojis"
          :key="item.name"
          class="sr-emoji-picker__item"
          type="button"
          :title="item.name"
          :aria-label="item.name"
          @click="onSelect(item)"
        >
          <img v-if="item.url" class="sr-emoji-picker__img" :src="item.url" :alt="item.name" loading="lazy" />
          <span v-else class="sr-emoji-picker__char">{{ item.char }}</span>
        </button>
      </div>

      <p v-else class="sr-emoji-picker__empty">这个表情包是空的</p>
    </div>
  </div>
</template>
