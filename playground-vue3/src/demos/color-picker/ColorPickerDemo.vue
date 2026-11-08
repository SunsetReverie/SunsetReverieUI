<script setup lang="ts">
import { ref } from 'vue'
import { SrColorPicker, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'ColorPickerDemo' })

/** 基础值 */
const color = ref('#3e3edc')

/** RGB 格式 */
const rgbColor = ref('rgb(31, 122, 77)')

/** HSL 格式 */
const hslColor = ref('hsl(24, 90%, 58%)')

/** 带透明度 */
const alphaColor = ref('rgba(62, 62, 220, 0.6)')

/** 预设色板 */
const presets = ['#3e3edc', '#ff7a45', '#1f7a4d', '#e0b100', '#d64545', '#8b5cf6', '#0ea5e9', '#64748b']

/** 主题色应用演示 */
const themeColor = ref('#3e3edc')

/** 禁用值 */
const disabledColor = ref('#64748b')
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础用法</h3>
      <div class="row">
        <SrColorPicker v-model="color" clearable />
        <SrTag size="sm">{{ color || '空' }}</SrTag>
      </div>
      <p class="hint">点触发器打开面板：拖饱和度区、拖色相条、或直接用十六进制输入</p>
    </section>

    <section>
      <h3>三种输出格式</h3>
      <div class="row">
        <div class="field">
          <span class="label">hex（默认）</span>
          <SrColorPicker v-model="color" format="hex" />
        </div>
        <div class="field">
          <span class="label">rgb</span>
          <SrColorPicker v-model="rgbColor" format="rgb" />
        </div>
        <div class="field">
          <span class="label">hsl</span>
          <SrColorPicker v-model="hslColor" format="hsl" />
        </div>
      </div>
      <p class="hint">输入可以混着来（hex / rgb / hsl 都认），输出统一按 <code>format</code></p>
    </section>

    <section>
      <h3>透明度（showAlpha）</h3>
      <div class="row">
        <SrColorPicker v-model="alphaColor" show-alpha format="rgb" />
        <SrTag size="sm">{{ alphaColor }}</SrTag>
      </div>
      <p class="hint">多一条透明度滑条，背景是棋盘格——棋盘格表示「这里透明」，不是灰色</p>
    </section>

    <section>
      <h3>预设色板</h3>
      <div class="row">
        <SrColorPicker v-model="color" :presets="presets" />
      </div>
      <p class="hint">点预设直接选中，当前色会有一圈描边标记</p>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="row">
        <div v-for="s in ['sm', 'md', 'lg']" :key="s" class="field">
          <span class="label">{{ s }}</span>
          <SrColorPicker v-model="color" :size="s as 'sm'" />
        </div>
      </div>
    </section>

    <section>
      <h3>禁用</h3>
      <div class="row">
        <SrColorPicker v-model="disabledColor" disabled />
      </div>
      <p class="hint">禁用时触发器变灰、点了不展开</p>
    </section>

    <section>
      <h3>组合：主题色设置</h3>
      <div class="card">
        <div class="row" style="justify-content: space-between">
          <div>
            <p class="card__title">主题色</p>
            <p class="card__desc">用于按钮、链接、选中态等强调元素</p>
          </div>
          <SrColorPicker v-model="themeColor" :presets="presets.slice(0, 6)" />
        </div>
        <div class="divider" />
        <div class="row">
          <span class="preview-btn" :style="{ background: themeColor }">主要按钮</span>
          <span class="preview-text" :style="{ color: themeColor }">这是链接文字</span>
          <span class="preview-dot" :style="{ background: themeColor }" />
        </div>
      </div>
      <p class="hint">右侧色块实时反映当前选择，适合「改完就能看到效果」的设置页</p>
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

h3 {
  margin: 0 0 12px;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.hint {
  margin: 8px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 1.6;
}

.hint code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--sr-color-bg-sunken);
  font-family: var(--sr-font-family-mono);
  font-size: 11.5px;
}

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}

.card {
  padding: 16px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
  max-width: 560px;
}

.card__title {
  margin: 0;
  color: var(--sr-color-text);
  font-size: 13px;
  font-weight: 600;
}

.card__desc {
  margin: 3px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.divider {
  height: 1px;
  margin: 14px 0;
  background: var(--sr-color-border-subtle);
}

.preview-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 14px;
  border-radius: var(--sr-form-radius);
  color: #fff;
  font-size: 13px;
}

.preview-text {
  font-size: 13px;
  text-decoration: underline;
}

.preview-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
</style>
