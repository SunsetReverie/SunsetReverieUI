<script setup lang="ts">
import { computed, ref } from 'vue'

import { useSrBreakpoint, useSrTheme } from '@sunset-reverie/ui'

import OverviewView from './views/OverviewView.vue'
import ResponsiveLab from './views/ResponsiveLab.vue'
import ThemeLab from './views/ThemeLab.vue'

defineOptions({ name: 'PlaygroundApp' })

const { resolved, style, toggleTheme, toggleStyle } = useSrTheme()
const { current: breakpoint, width } = useSrBreakpoint()

/** 视图定义 */
const views = [
  { key: 'overview', label: '栅格概览', component: OverviewView },
  { key: 'theme', label: '主题实验室', component: ThemeLab },
  { key: 'responsive', label: '断点实验室', component: ResponsiveLab },
] as const

// 支持 ?tab=theme 直达某个视图，方便截图与分享复现链接
const tabParam = new URLSearchParams(window.location.search).get('tab')
const activeKey = ref<string>(tabParam && views.some((v) => v.key === tabParam) ? tabParam : 'overview')

/** 当前视图组件 */
const activeView = computed(() => views.find((v) => v.key === activeKey.value)?.component ?? OverviewView)
</script>

<template>
  <div class="pg">
    <header class="pg__bar">
      <div class="pg__brand">
        <span class="pg__sun" />
        <span>夕梦 UI · Playground</span>
      </div>

      <div class="pg__status">
        <span class="pg__pill">{{ breakpoint }} · {{ width }}px</span>
        <span class="pg__pill">{{ resolved }}</span>
        <span class="pg__pill">{{ style }}</span>
      </div>

      <div class="pg__actions">
        <button class="pg__btn" type="button" @click="toggleTheme">
          {{ resolved === 'dark' ? '切到浅色' : '切到暗色' }}
        </button>
        <button class="pg__btn" type="button" @click="toggleStyle">
          {{ style === 'glass' ? '切到扁平' : '切到玻璃' }}
        </button>
      </div>
    </header>

    <nav class="pg__tabs">
      <button
        v-for="view in views"
        :key="view.key"
        class="pg__tab"
        :class="{ 'is-active': activeKey === view.key }"
        type="button"
        @click="activeKey = view.key"
      >
        {{ view.label }}
      </button>
    </nav>

    <main class="pg__body">
      <component :is="activeView" />
    </main>
  </div>
</template>

<style lang="less">
@import './styles/playground.less';
</style>
