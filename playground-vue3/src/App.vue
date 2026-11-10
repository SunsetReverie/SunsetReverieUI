<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  SR_THEME_PRESETS,
  SrBreadcrumb,
  SrButton,
  SrDrawer,
  SrIcon,
  SrAvatar,
  SrInput,
  SrNav,
  SrTabs,
  useSrBreakpoint,
  useSrTheme,
} from '@sunset-reverie/ui'

import { applyMotion, MOTION_MODES, readMotion, type SrMotionMode } from './motion'
import { demoEntries, demoGroups } from './demos/registry'
import { navItems, navKeyToRoute, routeToNavKey } from './router'

defineOptions({ name: 'PlaygroundApp' })

const route = useRoute()
const router = useRouter()

const {
  mode,
  resolved,
  style,
  preset,
  primary,
  setTheme,
  setStyle,
  setPreset,
  setPrimaryColor,
  resetPrimaryColor,
} = useSrTheme()
const { current: breakpoint, width } = useSrBreakpoint()

/** 侧栏是否收起（宽屏才有意义） */
const collapsed = ref(false)

/** 窄屏侧栏抽屉是否打开 */
const drawerOpen = ref(false)

/** 是否窄屏：侧栏从常驻变成抽屉 */
const isNarrow = computed(() => width.value < 768)

/** 外观设置抽屉 */
const settingOpen = ref(false)

/** 当前动效模式 */
const motionMode = ref<SrMotionMode>(readMotion())

/**
 * 切换动效模式
 * @param mode 目标模式
 */
function setMotion(mode: SrMotionMode): void {
  motionMode.value = mode
  applyMotion(mode)
}

/** 当前菜单项：组件演示页要拼上参数 */
const activeKey = computed(() => routeToNavKey(String(route.name ?? 'overview'), route.params.key as string))

/** 面包屑：分类 + 当前页 */
const crumbs = computed(() => {
  const group = route.meta?.group as string | undefined

  if (route.name === 'component') {
    const key = String(route.params.key ?? '')
    const entry = demoEntries.find((item) => item.key === key)
    const parent = demoGroups.find((g) => g.items.some((item) => item.key === key))
    return [
      { label: '夕梦 UI', href: '#/' },
      ...(parent ? [{ label: parent.title }] : []),
      { label: entry?.name ?? key },
    ]
  }

  const title = route.meta?.title as string | undefined
  return [
    { label: '夕梦 UI', href: '#/' },
    ...(group ? [{ label: group }] : []),
    ...(title ? [{ label: title }] : []),
  ]
})

/**
 * 顶栏菜单按钮：窄屏开抽屉，宽屏收起常驻侧栏
 * @returns 无
 */
function toggleSide(): void {
  if (isNarrow.value) drawerOpen.value = !drawerOpen.value
  else collapsed.value = !collapsed.value
}

/**
 * 点击菜单时跳路由，URL 跟着变，刷新也能回来
 * @param key 侧栏 key（组件演示带 c- 前缀）
 */
function onSelect(key: string): void {
  void router.push(navKeyToRoute(key))
  // 窄屏下选完就收起抽屉，否则菜单一直盖在内容上
  drawerOpen.value = false
}

/** 组件页搜索索引：侧栏只显示去掉 Sr 前缀的短名，描述也得能搜到 */
const searchIndex = new Map(
  demoEntries.map((item) => [`c-${item.key}`, `${item.name} ${item.key} ${item.description}`.toLowerCase()]),
)

/** 侧栏搜索词 */
const query = ref('')

/**
 * 过滤后的侧栏项：按显示名、分组、key 与组件说明匹配
 * 68 个组件平铺在侧栏里，没有搜索时找组件只能靠肉眼扫
 */
const filteredNavItems = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return navItems
  return navItems.filter((item) => {
    const text = [item.label, item.group, item.key, searchIndex.get(item.key ?? '')]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return text.includes(q)
  })
})

/** 取色器当前值：没自定义时用库默认主色 */
const primaryColor = computed(() => primary.value || '#ff7a45')

/**
 * 自定义品牌色：写进根变量与 localStorage，全站组件立即换色
 * @param event 原生取色器输入事件
 */
function onPrimaryColor(event: Event): void {
  setPrimaryColor((event.target as HTMLInputElement).value)
}

/** 主题选项 */
const themeItems = [
  { key: 'light', label: '亮色' },
  { key: 'dark', label: '暗色' },
  { key: 'auto', label: '跟随' },
]

/** 风格选项 */
const styleItems = [
  { key: 'glass', label: '玻璃' },
  { key: 'flat', label: '扁平' },
]
</script>

<template>
  <div class="pg" :class="{ 'is-collapsed': collapsed && !isNarrow, 'is-drawer-open': drawerOpen }">
    <!-- 侧栏：用组件库自己的 SrNav -->
    <aside class="pg__side">
      <div class="pg__search">
        <SrInput
          v-model="query"
          size="sm"
          clearable
          placeholder="搜索组件 / 页面"
          aria-label="搜索组件与页面"
        >
          <template #prefix>
            <SrIcon name="lucide:search" :size="14" />
          </template>
        </SrInput>
        <p v-if="query.trim()" class="pg__search-meta">
          {{ filteredNavItems.length }} / {{ navItems.length }} 项
        </p>
      </div>

      <SrNav
        bare
        :items="filteredNavItems"
        :filter-active="Boolean(query.trim())"
        :model-value="activeKey"
        logo="lucide:moon-star"
        title="夕梦 UI"
        mode="vertical"
        active-style="bar"
        :collapsed="collapsed"
        :width="216"
        @select="onSelect"
      >
        <template #footer>
          <SrAvatar alt="林" size="sm" />
          <span class="pg__user">
            <span class="pg__user-name">林深</span>
            <span class="pg__user-role">组件库维护</span>
          </span>
        </template>
      </SrNav>

      <p v-if="!filteredNavItems.length" class="pg__search-empty">没有匹配的页面，换个关键词试试</p>
    </aside>

    <!-- 窄屏抽屉的遮罩：点一下就收起，不用非得找到关闭按钮 -->
    <button
      v-if="isNarrow && drawerOpen"
      class="pg__scrim"
      type="button"
      aria-label="关闭导航"
      @click="drawerOpen = false"
    ></button>

    <div class="pg__main">
      <header class="pg__header">
        <button
          class="pg__icon-btn"
          type="button"
          :title="isNarrow ? (drawerOpen ? '关闭导航' : '打开导航') : collapsed ? '展开侧栏' : '收起侧栏'"
          :aria-label="
            isNarrow ? (drawerOpen ? '关闭导航' : '打开导航') : collapsed ? '展开侧栏' : '收起侧栏'
          "
          :aria-expanded="isNarrow ? drawerOpen : !collapsed"
          @click="toggleSide"
        >
          <SrIcon name="lucide:menu" :size="16" />
        </button>

        <SrBreadcrumb :items="crumbs" separator-icon="lucide:chevron-right" />

        <div class="pg__header-actions">
          <span class="pg__pill">{{ breakpoint }} · {{ width }}px</span>

          <button
            class="pg__icon-btn"
            type="button"
            :title="resolved === 'dark' ? '切到浅色' : '切到暗色'"
            :aria-label="resolved === 'dark' ? '切到浅色' : '切到暗色'"
            @click="setTheme(resolved === 'dark' ? 'light' : 'dark')"
          >
            <SrIcon :name="resolved === 'dark' ? 'lucide:sun' : 'lucide:moon-star'" :size="16" />
          </button>

          <button
            class="pg__icon-btn"
            type="button"
            title="外观设置"
            aria-label="外观设置"
            @click="settingOpen = true"
          >
            <SrIcon name="lucide:settings" :size="16" />
          </button>
        </div>
      </header>

      <main class="pg__body">
        <RouterView v-slot="{ Component }">
          <Transition name="pg-view" mode="out-in">
            <component :is="Component" :key="route.name" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <!-- 外观设置：把原来堆在顶栏的一排操作收进来 -->
    <SrDrawer v-model="settingOpen" title="外观设置" :size="360">
      <div class="setting">
        <div class="setting__row">
          <span class="setting__label">主题</span>
          <SrTabs
            :items="themeItems"
            :model-value="String(mode)"
            type="pill"
            size="sm"
            @update:model-value="(key: string) => setTheme(key as 'light')"
          />
        </div>

        <div class="setting__row">
          <span class="setting__label">品牌色</span>
          <div class="setting__swatches">
            <button
              v-for="item in SR_THEME_PRESETS"
              :key="item.key"
              class="setting__swatch"
              :class="{ 'is-active': preset === item.key }"
              :style="{ background: item.primary }"
              :title="item.label"
              :aria-label="`切换到${item.label}`"
              type="button"
              @click="setPreset(item.key)"
            />
            <label class="setting__color" :title="`自定义品牌色 ${primaryColor}`">
              <input type="color" :value="primaryColor" aria-label="自定义品牌色" @input="onPrimaryColor" />
              <span>自定义</span>
            </label>
          </div>
        </div>

        <div class="setting__row">
          <span class="setting__label">质感</span>
          <SrTabs
            :items="styleItems"
            :model-value="style"
            type="pill"
            size="sm"
            @update:model-value="(key: string) => setStyle(key as 'glass')"
          />
        </div>

        <div class="setting__row">
          <span class="setting__label">动效</span>
          <SrTabs
            :items="MOTION_MODES.map((item) => ({ key: item.key, label: item.label }))"
            :model-value="motionMode"
            type="pill"
            size="sm"
            @update:model-value="(key: string) => setMotion(key as SrMotionMode)"
          />
        </div>

        <div class="setting__row">
          <span class="setting__label">其他</span>
          <SrButton size="sm" variant="outline" @click="resetPrimaryColor()">恢复默认配色</SrButton>
        </div>

        <p class="setting__hint">
          以上设置都会写进本机 localStorage；「动效 · 无」会同时关掉过渡与循环动画，适合低端设备。
        </p>
      </div>
    </SrDrawer>
  </div>
</template>

<style lang="less">
@import './styles/playground.less';
</style>
