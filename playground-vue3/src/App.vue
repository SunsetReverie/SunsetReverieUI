<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  SR_THEME_PRESETS,
  SrBreadcrumb,
  SrButton,
  SrDrawer,
  SrIcon,
  SrNav,
  SrTabs,
  useSrBreakpoint,
  useSrTheme,
} from '@sunset-reverie/ui'

import { applyMotion, MOTION_MODES, readMotion, type SrMotionMode } from './motion'
import { navItems } from './router'

defineOptions({ name: 'PlaygroundApp' })

const route = useRoute()
const router = useRouter()

const { mode, resolved, style, preset, setTheme, setStyle, setPreset, resetPrimaryColor } = useSrTheme()
const { current: breakpoint, width } = useSrBreakpoint()

/** 侧栏是否收起 */
const collapsed = ref(false)

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

/** 当前菜单项，直接来自路由名 */
const activeKey = computed(() => String(route.name ?? 'overview'))

/** 面包屑：分类 + 当前页 */
const crumbs = computed(() => {
  const group = route.meta?.group as string | undefined
  const title = route.meta?.title as string | undefined
  return [
    { label: '夕梦 UI', href: '#/' },
    ...(group ? [{ label: group }] : []),
    ...(title ? [{ label: title }] : []),
  ]
})

/**
 * 点击菜单时跳路由，URL 跟着变，刷新也能回来
 * @param key 路由名
 */
function onSelect(key: string): void {
  void router.push({ name: key })
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
  <div class="pg" :class="{ 'is-collapsed': collapsed }">
    <!-- 侧栏：用组件库自己的 SrNav -->
    <aside class="pg__side">
      <SrNav
        :items="navItems"
        :model-value="activeKey"
        logo="lucide:moon-star"
        title="夕梦 UI"
        mode="vertical"
        active-style="bar"
        :collapsed="collapsed"
        :width="216"
        @select="onSelect"
      />
    </aside>

    <div class="pg__main">
      <header class="pg__header">
        <button
          class="pg__icon-btn"
          type="button"
          :title="collapsed ? '展开侧栏' : '收起侧栏'"
          @click="collapsed = !collapsed"
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
            @click="setTheme(resolved === 'dark' ? 'light' : 'dark')"
          >
            <SrIcon :name="resolved === 'dark' ? 'lucide:sun' : 'lucide:moon-star'" :size="16" />
          </button>

          <button class="pg__icon-btn" type="button" title="外观设置" @click="settingOpen = true">
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
