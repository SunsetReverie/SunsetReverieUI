<script setup lang="ts">
import { ref } from 'vue'

import { SrButton, SrIcon } from '@sunset-reverie/ui'

defineOptions({ name: 'ComponentsView' })

/** 变体清单 */
const variants = ['primary', 'secondary', 'outline', 'text', 'danger'] as const

/** 尺寸清单 */
const sizes = ['xs', 'sm', 'md', 'lg'] as const

/** 演示用图标（同时会被 gen-offline-icons 扫描收录） */
const icons = ['mdi:home', 'mdi:check', 'mdi:magnify', 'mdi:loading', 'ph:sun', 'ph:moon-stars']

/** 加载态演示 */
const loading = ref(false)

/**
 * 触发一次 2 秒的加载态
 * @returns {void}
 */
function triggerLoading(): void {
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<template>
  <div>
    <section class="panel">
      <h2 class="panel__title">按钮变体</h2>
      <p class="panel__desc">
        变体只改 CSS 变量的值，基础结构与交互逻辑完全共用。切到暗色 / 玻璃风格后颜色自动适配。
      </p>

      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <sr-button v-for="variant in variants" :key="variant" :variant="variant">
          {{ variant }}
        </sr-button>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">尺寸</h2>
      <p class="panel__desc">
        尺寸走内联 CSS 变量，支持按断点分档。下方最后一个按钮的 size 是
        <code style="font-family: var(--sr-font-family-mono)">{ xs: 'sm', md: 'lg' }</code>
        —— 缩放窗口看它切换。
      </p>

      <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center">
        <sr-button v-for="size in sizes" :key="size" :size="size" variant="primary">
          {{ size }}
        </sr-button>
        <sr-button :size="{ xs: 'sm', md: 'lg' }" variant="outline">响应式尺寸</sr-button>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">状态</h2>
      <p class="panel__desc">
        加载态用 <code style="font-family: var(--sr-font-family-mono)">opacity: 0</code>
        隐藏内容而非移除，宽度因此不会塌陷，避免布局跳动。
      </p>

      <div style="display: flex; gap: 10px; flex-wrap: wrap">
        <sr-button variant="primary" :loading="loading" @click="triggerLoading"> 点我加载 </sr-button>
        <sr-button variant="primary" disabled>禁用</sr-button>
        <sr-button variant="primary" round>胶囊按钮</sr-button>
      </div>

      <div style="margin-top: 12px">
        <sr-button variant="secondary" block>占满整行的按钮</sr-button>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">图标</h2>
      <p class="panel__desc">
        图标走 Iconify 离线集合，<code style="font-family: var(--sr-font-family-mono)">name</code>
        用「集合:图标名」。下面这些名字会在构建前由子集化脚本收录。
      </p>

      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center; margin-bottom: 16px">
        <span
          v-for="icon in icons"
          :key="icon"
          style="display: flex; flex-direction: column; align-items: center; gap: 4px"
        >
          <sr-icon :name="icon" :size="22" :label="icon" />
          <code style="font-size: 10px; color: var(--sr-color-text-tertiary)">{{ icon }}</code>
        </span>
      </div>

      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px">
        <sr-button variant="primary" icon="mdi:check">带图标</sr-button>
        <sr-button variant="outline" icon="mdi:close" icon-position="right">图标在右</sr-button>
        <sr-button variant="secondary">
          <template #icon><sr-icon name="mdi:magnify" /></template>
          自定义图标插槽
        </sr-button>
      </div>

      <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap">
        <sr-icon name="ph:sun" :size="28" color="var(--sr-color-primary)" />
        <sr-icon name="mdi:loading" :size="28" spin />
        <sr-icon name="mdi:check" :size="28" rotate="45" />
        <sr-icon name="mdi:check" :size="28" flip="horizontal" />
        <sr-icon name="mdi:home" :size="28" flip="both" />
      </div>
    </section>
  </div>
</template>
