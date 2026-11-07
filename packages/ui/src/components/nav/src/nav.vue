<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useSrConfig } from '../../../composables/use-sr-config'
import type { SrSize } from '../../../types/config'
import SrIcon from '../../icon/src/icon.vue'
import { navProps, type SrNavItem } from './nav'

defineOptions({ name: 'SrNav' })

const props = defineProps(navProps)

const emit = defineEmits<{
  'update:modelValue': [key: string]
  /** 选中某项 */
  select: [key: string, item: SrNavItem]
  /** 展开/收起子菜单 */
  'update:openedKeys': [keys: string[]]
  /** 整体收起状态变化 */
  'update:collapsed': [collapsed: boolean]
}>()

const config = useSrConfig()

/** 最终尺寸 */
const resolvedSize = computed<SrSize>(() => props.size ?? config.value.size)

/** 展开中的父项 key */
const openKeys = ref<Set<string>>(new Set())

/** 收起的分组名 */
const closedGroups = ref<Set<string>>(new Set())

// 初次挂载时把「默认收起」的分组记下来
watch(
  () => props.items,
  (items) => {
    const next = new Set(closedGroups.value)
    for (const item of items) {
      if (item.group && item.collapsed) next.add(item.group)
    }
    closedGroups.value = next
  },
  { immediate: true, deep: true },
)

/** 根样式：宽度与最大高度 */
const rootStyle = computed(() => {
  const style: Record<string, string> = {}
  const width = props.collapsed ? props.collapsedWidth : props.width
  style.width = typeof width === 'number' ? `${width}px` : width

  if (props.maxHeight !== undefined) {
    style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  }
  return style
})

/**
 * 分组是否可折叠
 * @param item 分组首项
 * @returns 是否可折叠
 */
function isGroupCollapsible(item: SrNavItem): boolean {
  return item.collapsible !== false
}

/**
 * 分组是否处于收起状态
 * @param item 导航项
 * @returns 是否收起
 */
function isGroupHidden(item: SrNavItem): boolean {
  return Boolean(item.group && closedGroups.value.has(item.group))
}

/**
 * 切换分组折叠
 * @param group 分组名
 */
function toggleGroup(group: string): void {
  if (props.disabled) return
  const next = new Set(closedGroups.value)
  if (next.has(group)) next.delete(group)
  else next.add(group)
  closedGroups.value = next
}

/**
 * 是否有可见徽标
 * @param item 导航项
 * @returns 是否显示
 */
function hasBadge(item: SrNavItem): boolean {
  return item.badge !== undefined && item.badge !== ''
}

/**
 * 点击导航项
 * @param item 导航项
 */
function pick(item: SrNavItem): void {
  if (props.disabled || item.disabled || !item.key) return

  // 有子项时先管展开，不改变选中
  if (item.children?.length) {
    const next = new Set(openKeys.value)
    if (next.has(item.key)) next.delete(item.key)
    else next.add(item.key)
    openKeys.value = next
    emit('update:openedKeys', [...next])
    return
  }

  if (item.key === props.modelValue) return
  emit('update:modelValue', item.key)
  emit('select', item.key, item)
}
</script>

<template>
  <nav
    class="sr-nav"
    :class="[
      `sr-nav--${resolvedSize}`,
      `sr-nav--${mode}`,
      `sr-nav--active-${activeStyle}`,
      {
        'is-disabled': disabled,
        'is-collapsed': collapsed,
      },
    ]"
    :style="rootStyle"
  >
    <template v-for="(item, index) in items" :key="item.key ?? index">
      <div v-if="item.divider" class="sr-nav__divider" role="separator" />

      <!--
        收起态不渲染分组标题：文字被隐藏后只剩一个空按钮，
        既占高度又能点（点了会折叠整组），看起来就是"可点的空白"
      -->
      <button
        v-if="!collapsed && item.group && item.group !== items[index - 1]?.group"
        class="sr-nav__group"
        :class="{ 'is-toggle': isGroupCollapsible(item) }"
        type="button"
        :disabled="!isGroupCollapsible(item) || disabled"
        @click="toggleGroup(item.group)"
      >
        <span v-if="!collapsed" class="sr-nav__group-text">{{ item.group }}</span>
        <sr-icon
          v-if="isGroupCollapsible(item) && !collapsed"
          class="sr-nav__group-arrow"
          :class="{ 'is-open': !closedGroups.has(item.group) }"
          name="lucide:chevron-down"
          :size="14"
        />
      </button>

      <div v-if="!isGroupHidden(item)" class="sr-nav__entry">
        <button
          class="sr-nav__item"
          :class="{
            'is-active': item.key === modelValue,
            'is-disabled': item.disabled || disabled,
            'is-parent': Boolean(item.children?.length),
          }"
          type="button"
          :aria-current="item.key === modelValue ? 'page' : undefined"
          :aria-expanded="item.children?.length ? openKeys.has(item.key ?? '') : undefined"
          :disabled="item.disabled || disabled"
          @click="pick(item)"
        >
          <span v-if="collapsed && hasBadge(item)" class="sr-nav__dot" />
          <sr-icon v-else-if="item.icon" class="sr-nav__icon" :name="item.icon" :size="16" />
          <span v-if="!collapsed" class="sr-nav__label">{{ item.label }}</span>
          <span v-if="!collapsed && hasBadge(item)" class="sr-nav__badge">{{ item.badge }}</span>
          <sr-icon
            v-if="!collapsed && item.children?.length"
            class="sr-nav__arrow"
            :class="{ 'is-open': openKeys.has(item.key ?? '') }"
            name="lucide:chevron-right"
            :size="14"
          />
        </button>

        <!-- 展开态：子项就地展开 -->
        <div
          v-if="!collapsed && item.children?.length && openKeys.has(item.key ?? '')"
          class="sr-nav__children"
        >
          <button
            v-for="child in item.children"
            :key="child.key"
            class="sr-nav__item sr-nav__item--child"
            :class="{ 'is-active': child.key === modelValue, 'is-disabled': child.disabled }"
            type="button"
            :disabled="child.disabled || disabled"
            @click="pick(child)"
          >
            <sr-icon v-if="child.icon" class="sr-nav__icon" :name="child.icon" :size="15" />
            <span class="sr-nav__label">{{ child.label }}</span>
            <span v-if="hasBadge(child)" class="sr-nav__badge">{{ child.badge }}</span>
          </button>
        </div>

        <!-- 收起态：悬停浮层 -->
        <!--
          收起态浮层：常驻 DOM，显示与否完全交给 CSS 的 :hover。
          用 JS 的 enter/leave 控制会在穿越图标与浮层的间隙时误关，纯 CSS 没有时序问题。
        -->
        <div v-if="collapsed && item.children?.length" class="sr-nav__flyout">
          <span class="sr-nav__flyout-title">{{ item.label }}</span>
          <button
            v-for="child in item.children"
            :key="child.key"
            class="sr-nav__item sr-nav__item--child sr-nav__item--plain"
            :class="{ 'is-active': child.key === modelValue, 'is-disabled': child.disabled }"
            type="button"
            :disabled="child.disabled || disabled"
            @click="pick(child)"
          >
            <span class="sr-nav__label">{{ child.label }}</span>
          </button>
        </div>
      </div>
    </template>
  </nav>
</template>
