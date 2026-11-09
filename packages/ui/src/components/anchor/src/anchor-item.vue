<script setup lang="ts">
import type { SrAnchorItem } from './anchor'

defineOptions({ name: 'SrAnchorItem' })

defineProps<{
  /** 当前项 */
  item: SrAnchorItem
  /** 层级，0 是顶层 */
  depth: number
  /** 激活链路（含祖先） */
  activePath: Set<string>
  /** 当前激活项 key */
  currentKey: string
  /** 收集链接元素，供滑块定位 */
  setLinkRef: (el: Element | null, key: string) => void
}>()

const emit = defineEmits<{
  /** 点击某项 */
  click: [item: SrAnchorItem, event: MouseEvent]
}>()
</script>

<template>
  <li class="sr-anchor__item" :class="{ 'is-active': activePath.has(item.key) }">
    <a
      :ref="(el) => setLinkRef(el as Element | null, item.key)"
      class="sr-anchor__link"
      :href="item.href ?? `#${item.key}`"
      :aria-current="currentKey === item.key ? 'location' : undefined"
      @click="emit('click', item, $event)"
    >
      {{ item.title }}
    </a>

    <ul v-if="item.children?.length" class="sr-anchor__sub">
      <SrAnchorItem
        v-for="child in item.children"
        :key="child.key"
        :item="child"
        :depth="depth + 1"
        :active-path="activePath"
        :current-key="currentKey"
        :set-link-ref="setLinkRef"
        @click="(target, event) => emit('click', target, event)"
      />
    </ul>
  </li>
</template>
