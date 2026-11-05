<script setup lang="ts">
import { computed, ref } from 'vue'

import GlassTuner from '../components/GlassTuner.vue'
import {
  SR_PRIMARY_STORAGE_KEY,
  SR_THEME_PRESETS,
  SR_STYLE_STORAGE_KEY,
  SR_THEME_STORAGE_KEY,
  useSrTheme,
} from '@sunset-reverie/ui'

defineOptions({ name: 'ThemeLab' })

const {
  mode,
  resolved,
  style,
  primary,
  preset,
  systemDark,
  setTheme,
  setStyle,
  setPrimaryColor,
  setPreset,
  resetPrimaryColor,
} = useSrTheme()

/** 预设主题色来自库生成的常量，playground 不再自己维护一份 */

/** 颜色输入框的本地值 */
const customColor = ref('#FF7A45')

/** 模式与风格选项（放 script 里，避免模板中出现 TS 断言语法） */
const themeModes = ['light', 'dark', 'auto'] as const
const styleModes = ['flat', 'glass'] as const

/** 当前状态表 */
const stateRows = computed(() => [
  { key: 'mode', value: mode.value },
  { key: 'resolved', value: resolved.value },
  { key: 'style', value: style.value },
  { key: 'systemDark', value: String(systemDark.value) },
  { key: 'primary', value: primary.value || '（默认）' },
  { key: 'storage.theme', value: SR_THEME_STORAGE_KEY },
  { key: 'storage.style', value: SR_STYLE_STORAGE_KEY },
  { key: 'storage.primary', value: SR_PRIMARY_STORAGE_KEY },
])

/**
 * 应用自定义颜色
 * @returns {void}
 */
function applyCustom(): void {
  setPrimaryColor(customColor.value)
}
</script>

<template>
  <div>
    <section class="panel">
      <h2 class="panel__title">当前状态</h2>
      <p class="panel__desc">
        三个根属性 + 一份模块级状态共同驱动视觉效果。这里展示的是 useSrTheme 暴露的实时值。
      </p>

      <div v-for="row in stateRows" :key="row.key" class="kv">
        <span class="kv__key">{{ row.key }}</span>
        <span class="kv__val">{{ row.value }}</span>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">明暗模式</h2>
      <p class="panel__desc">
        auto 跟随系统；选择具体值后会写入 localStorage，刷新后由内联脚本在首帧恢复，不会白闪。
      </p>

      <div class="pg__actions">
        <button
          v-for="item in themeModes"
          :key="item"
          class="pg__btn"
          :style="
            mode === item
              ? { borderColor: 'var(--sr-color-primary)', color: 'var(--sr-color-primary)' }
              : undefined
          "
          type="button"
          @click="setTheme(item)"
        >
          {{ item }}
        </button>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">质感风格</h2>
      <p class="panel__desc">
        flat 与 glass 共享同一批变量名，只覆写值。下面的示例卡片通过 .sr-surface mixin
        自动适配，组件里没有任何风格分支。
      </p>

      <div class="pg__actions" style="margin-bottom: 16px">
        <button
          v-for="item in styleModes"
          :key="item"
          class="pg__btn"
          :style="
            style === item
              ? { borderColor: 'var(--sr-color-primary)', color: 'var(--sr-color-primary)' }
              : undefined
          "
          type="button"
          @click="setStyle(item)"
        >
          {{ item }}
        </button>
      </div>

      <div
        style="
          padding: 20px;
          border-radius: var(--sr-radius-base);
          border: 1px solid var(--sr-color-border);
          background: var(--sr-color-bg-elevated);
          box-shadow: var(--sr-shadow-md), var(--sr-glass-highlight);
          backdrop-filter: var(--sr-glass-filter);
          -webkit-backdrop-filter: var(--sr-glass-filter);
        "
      >
        <strong style="display: block; margin-bottom: 4px">示例表面</strong>
        <span style="font-size: 13px; color: var(--sr-color-text-secondary)">
          圆角 {{ style === 'glass' ? '12px' : '6px' }} · 阴影 {{ style === 'glass' ? '高扩散' : '紧凑' }} ·
          模糊由下方参数实时控制
        </span>
      </div>

      <div style="margin-top: 16px">
        <GlassTuner />
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">主题色</h2>
      <p class="panel__desc">
        只覆写主色，hover / active / 透明派生全部自动计算。支持 color-mix 时交给浏览器算，否则退化为 HSL
        调整。
      </p>

      <div class="pg__actions" style="margin-bottom: 16px; flex-wrap: wrap">
        <button
          v-for="item in SR_THEME_PRESETS"
          :key="item.key"
          class="pg__btn"
          :style="
            preset === item.key
              ? { borderColor: 'var(--sr-color-primary)', color: 'var(--sr-color-primary)' }
              : undefined
          "
          type="button"
          @click="setPreset(item.key)"
        >
          <span
            :style="{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: item.primary,
              marginRight: '6px',
              verticalAlign: 'middle',
            }"
          />
          {{ item.label }}
        </button>
        <button class="pg__btn" type="button" @click="resetPrimaryColor">恢复默认</button>
      </div>

      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
        <input
          v-model="customColor"
          type="color"
          style="width: 44px; height: 32px; border: 0; background: none"
        />
        <input
          v-model="customColor"
          type="text"
          style="
            padding: 4px 8px;
            border-radius: var(--sr-radius-base);
            border: 1px solid var(--sr-color-border);
            background: var(--sr-color-bg-container);
            color: var(--sr-color-text);
            font-family: var(--sr-font-family-mono);
            font-size: 12px;
            width: 130px;
          "
        />
        <button class="pg__btn" type="button" @click="applyCustom">应用</button>
      </div>

      <div style="margin-top: 16px; display: flex; gap: 8px">
        <span
          v-for="token in ['--sr-color-primary', '--sr-color-primary-hover', '--sr-color-primary-alpha-25']"
          :key="token"
          :style="{
            flex: '1',
            height: '36px',
            borderRadius: 'var(--sr-radius-base)',
            background: `var(${token})`,
            border: '1px solid var(--sr-color-border)',
          }"
          :title="token"
        />
      </div>
    </section>
  </div>
</template>
