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

/**
 * 折叠态浮层的视口坐标，按 item.key 记录
 *
 * 折叠态菜单需要能滚动，而滚动容器的 overflow 会把 absolute 浮层裁掉，
 * 所以浮层改用 position: fixed，坐标在悬停时从图标的位置读出来。
 */
const flyoutPos = ref<Record<string, { top: number; left: number }>>({})

/** 用户收起的分组名（含 `collapsed: true` 的默认值） */
const closedGroups = ref<Set<string>>(new Set())

/**
 * 实际生效的收起分组
 *
 * @remarks 外部搜索期间 items 只剩命中项，此时若还沿用折叠状态，
 * 用户会看到「结果数 1 / 74」却一项都没有。用 computed 临时架空，
 * 而不是直接清空 closedGroups —— 后者会让搜索结束时的折叠状态无法恢复。
 */
const effectiveClosedGroups = computed<Set<string>>(() =>
  props.filterActive ? new Set<string>() : closedGroups.value,
)

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
  // 搜索结果里折叠一个分组只会让命中项消失，此时标题退化为纯说明文字
  if (props.filterActive) return false
  return item.collapsible !== false
}

/**
 * 分组是否处于收起状态
 * @param item 导航项
 * @returns 是否收起
 */
function isGroupHidden(item: SrNavItem): boolean {
  // 收起态只有图标，分组折叠无从体现；若沿用折叠状态，
  // 被折叠组里的图标会一起消失，看起来像「菜单丢了」
  if (props.collapsed || props.filterActive) return false
  return Boolean(item.group && effectiveClosedGroups.value.has(item.group))
}

/**
 * 切换分组折叠
 * @param group 分组名
 */
function toggleGroup(group: string): void {
  if (props.disabled || props.filterActive) return
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
/**
 * 折叠态悬停父项时记录图标位置，供 fixed 定位的浮层使用
 * @param item 导航项
 * @param event 鼠标进入事件
 */
function onEntryEnter(item: SrNavItem, event: MouseEvent): void {
  if (!props.collapsed || !item.children?.length || !item.key) return

  const el = event.currentTarget as HTMLElement | null
  if (!el) return

  const navEl = el.closest('.sr-nav') as HTMLElement | null
  const rect = el.getBoundingClientRect()
  const navRect = navEl?.getBoundingClientRect()

  /**
   * .sr-nav 的 backdrop-filter 会让它成为 fixed 元素的包含块
   * （bare 模式没有这层滤镜，包含块退回视口）。
   * 两种情况下坐标的参照系不同，这里按实际生效的样式切换。
   */
  const navStyle = navEl ? getComputedStyle(navEl) : null
  const boxedByNav = Boolean(
    navStyle &&
    (navStyle.backdropFilter !== 'none' || navStyle.filter !== 'none' || navStyle.transform !== 'none'),
  )

  // left 贴侧栏右边缘：entry 是 fit-content，折叠态下只比图标宽一点
  const left = boxedByNav ? (navRect?.width ?? 0) + 8 : (navRect?.right ?? rect.right) + 8
  const top = boxedByNav ? rect.top - (navRect?.top ?? 0) : rect.top

  flyoutPos.value = {
    ...flyoutPos.value,
    [item.key]: { top, left },
  }
}

/**
 * 浮层的内联定位
 * @param item 导航项
 * @returns 首次悬停前返回 undefined，交给 CSS 的默认值
 */
function flyoutStyle(item: SrNavItem): Record<string, string> | undefined {
  const pos = item.key ? flyoutPos.value[item.key] : undefined
  if (!pos) return undefined
  return { top: `${pos.top}px`, left: `${pos.left}px` }
}

function pick(item: SrNavItem): void {
  if (props.disabled || item.disabled || !item.key) return

  // 有子项时先管展开
  if (item.children?.length) {
    const next = new Set(openKeys.value)
    if (next.has(item.key)) next.delete(item.key)
    else next.add(item.key)
    openKeys.value = next
    emit('update:openedKeys', [...next])

    // 打开 selectableParent 时，父项自己也能成为选中项
    // （默认关闭：多数后台的选中项是叶子节点）
    if (props.selectableParent && item.key !== props.modelValue) {
      emit('update:modelValue', item.key)
      emit('select', item.key, item)
    }

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
        'is-bare': bare,
      },
    ]"
    :style="rootStyle"
  >
    <!-- 品牌区：让导航能独立成一块完整的侧边栏 -->
    <div v-if="logo || title || $slots.header" class="sr-nav__brand">
      <slot name="header">
        <span class="sr-nav__brand-mark">
          <sr-icon v-if="logo" :name="logo" :size="18" />
        </span>
        <span v-if="!collapsed && title" class="sr-nav__brand-title">{{ title }}</span>
      </slot>
    </div>

    <div class="sr-nav__menu">
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
            :class="{ 'is-open': !effectiveClosedGroups.has(item.group) }"
            name="lucide:chevron-down"
            :size="14"
          />
        </button>

        <div v-if="!isGroupHidden(item)" class="sr-nav__entry" @mouseenter="onEntryEnter(item, $event)">
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
            <!-- 图标与角标是两件独立的事：折叠态图标必须保留，圆点只是附加装饰 -->
            <sr-icon v-if="item.icon" class="sr-nav__icon" :name="item.icon" :size="16" />
            <span v-if="collapsed && hasBadge(item)" class="sr-nav__dot" />
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
          <Transition name="sr-nav-sub">
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
          </Transition>

          <!-- 收起态：悬停浮层 -->
          <!--
            收起态浮层：常驻 DOM，显示与否完全交给 CSS 的 :hover。
            用 JS 的 enter/leave 控制会在穿越图标与浮层的间隙时误关，纯 CSS 没有时序问题。
          -->
          <div v-if="collapsed && item.children?.length" class="sr-nav__flyout" :style="flyoutStyle(item)">
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
    </div>

    <!-- 底部固定区：用户信息、版本号之类，和菜单之间用一条线隔开 -->
    <div v-if="$slots.footer" class="sr-nav__footer">
      <slot name="footer" />
    </div>
  </nav>
</template>
