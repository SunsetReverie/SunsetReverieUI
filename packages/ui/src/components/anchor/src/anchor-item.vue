<script setup lang="ts">
import { computed } from 'vue'

import SrIcon from '../../icon/src/icon.vue'
import type { SrAnchorItem, SrAnchorTitleScope } from './anchor'

defineOptions({ name: 'SrAnchorItem' })

const props = defineProps<{
  /** 当前项 */
  item: SrAnchorItem
  /** 层级，0 是顶层 */
  depth: number
  /** 同层内的序号，从 1 开始 */
  index: number
  /** 激活链路（含祖先） */
  activePath: Set<string>
  /** 当前激活项 key */
  currentKey: string
  /** 收集链接元素，供滑块定位 */
  setLinkRef: (el: Element | null, key: string) => void
  /** 最多显示的层级，0 表示不限 */
  maxDepth: number
  /** 父级是否可折叠 */
  collapsible: boolean
  /** 已展开的父级 */
  expandedKeys: Set<string>
  /** 切换折叠 */
  toggle: (key: string) => void
  /** 是否显示箭头 */
  showToggle: boolean
  /** 箭头位置 */
  togglePosition: 'left' | 'right'
  /**
   * `#title` 插槽函数
   *
   * 以函数形式逐层下传，而不是用 `<template #title>` 递归转发：
   * 后者每次渲染都会新建插槽函数，Vue 会判定插槽不稳定并强制子组件更新，
   * 递归组件里会无限重渲染、把页面卡死。
   */
  titleSlot?: (scope: SrAnchorTitleScope) => unknown
}>()

const emit = defineEmits<{
  /** 点击某项 */
  click: [item: SrAnchorItem, event: MouseEvent]
}>()

/** 有没有子项 */
const hasChildren = computed(() => Boolean(props.item.children?.length))

/** 是否还能再往下渲染一层（受 maxDepth 限制） */
const canRenderChildren = computed(() => {
  if (!hasChildren.value) return false
  if (props.maxDepth <= 0) return true
  return props.depth + 1 < props.maxDepth
})

/** 是否显示折叠箭头 */
const toggleVisible = computed(() => props.collapsible && props.showToggle && hasChildren.value)

/** 当前是否展开 */
const expanded = computed(() => props.expandedKeys.has(props.item.key))

/** `#title` 插槽参数 */
const titleScope = computed<SrAnchorTitleScope>(() => ({
  item: props.item,
  depth: props.depth,
  index: props.index,
  active: props.activePath.has(props.item.key),
  current: props.currentKey === props.item.key,
}))
</script>

<template>
  <li
    class="sr-anchor__item"
    :class="{
      'is-active': activePath.has(item.key),
      'is-current': currentKey === item.key,
    }"
  >
    <div class="sr-anchor__row">
      <button
        v-if="toggleVisible && togglePosition === 'left'"
        class="sr-anchor__toggle"
        :class="{ 'is-expanded': expanded }"
        type="button"
        :aria-expanded="expanded"
        :aria-label="expanded ? '折叠' : '展开'"
        @click="toggle(item.key)"
      >
        <SrIcon name="lucide:chevron-right" :size="12" />
      </button>

      <a
        :ref="(el) => setLinkRef(el as Element | null, item.key)"
        class="sr-anchor__link"
        :href="item.href ?? `#${item.key}`"
        :aria-current="currentKey === item.key ? 'location' : undefined"
        @click="emit('click', item, $event)"
      >
        <component :is="titleSlot" v-if="titleSlot" v-bind="titleScope" />
        <template v-else>{{ item.title }}</template>
      </a>

      <button
        v-if="toggleVisible && togglePosition === 'right'"
        class="sr-anchor__toggle sr-anchor__toggle--right"
        :class="{ 'is-expanded': expanded }"
        type="button"
        :aria-expanded="expanded"
        :aria-label="expanded ? '折叠' : '展开'"
        @click="toggle(item.key)"
      >
        <SrIcon name="lucide:chevron-right" :size="12" />
      </button>
    </div>

    <!-- 折叠时用 v-show 而非 v-if：保留子级已测量的位置，展开后滑块不用重算 -->
    <ul v-if="canRenderChildren" v-show="!collapsible || expanded" class="sr-anchor__sub">
      <SrAnchorItem
        v-for="(child, i) in item.children"
        :key="child.key"
        :item="child"
        :depth="depth + 1"
        :index="i + 1"
        :active-path="activePath"
        :current-key="currentKey"
        :set-link-ref="setLinkRef"
        :max-depth="maxDepth"
        :collapsible="collapsible"
        :expanded-keys="expandedKeys"
        :toggle="toggle"
        :show-toggle="showToggle"
        :toggle-position="togglePosition"
        :title-slot="titleSlot"
        @click="(target, event) => emit('click', target, event)"
      />
    </ul>
  </li>
</template>
