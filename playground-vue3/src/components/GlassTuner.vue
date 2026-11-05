<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'

import { SrButton, useSrTheme } from '@sunset-reverie/ui'

defineOptions({ name: 'GlassTuner' })

const { style } = useSrTheme()

/** 玻璃参数（初始值与 token 默认值一致） */
const params = reactive({
  /** backdrop-filter 模糊半径 px */
  blur: 16,
  /** 饱和度增强 % */
  saturate: 180,
  /** 辉光扩散半径 px */
  glowBlur: 22,
  /** 辉光强度 % */
  glowStrength: 55,
})

/** 是否处于玻璃风格：只有此时参数才生效 */
const active = computed(() => style.value === 'glass')

/**
 * 把参数写到根元素
 *
 * 用内联样式而不是改 token 文件：内联优先级最高，能实时预览，
 * 且切回扁平风格时移除即可完全还原，不留痕迹。
 */
function apply(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement.style

  if (!active.value) {
    // 扁平风格下必须清掉，否则辉光会跟着漏到 flat 里
    root.removeProperty('--sr-glass-blur')
    root.removeProperty('--sr-glass-saturate')
    root.removeProperty('--sr-glass-filter')
    root.removeProperty('--sr-shadow-glow-blur')
    root.removeProperty('--sr-glow-base')
    return
  }

  root.setProperty('--sr-glass-blur', `${params.blur}px`)
  root.setProperty('--sr-glass-saturate', `${params.saturate}%`)
  root.setProperty('--sr-glass-filter', `blur(${params.blur}px) saturate(${params.saturate}%)`)
  root.setProperty('--sr-shadow-glow-blur', `${params.glowBlur}px`)
  root.setProperty('--sr-glow-base', `${params.glowStrength}%`)
}

/** 还原为 token 默认值 */
function reset(): void {
  params.blur = 16
  params.saturate = 180
  params.glowBlur = 22
  params.glowStrength = 55
}

watch(params, apply, { deep: true })
watch(active, apply)

onMounted(apply)

/** 滑块定义 */
const sliders = [
  { key: 'blur', label: '模糊半径', min: 0, max: 40, step: 1, unit: 'px' },
  { key: 'saturate', label: '饱和度', min: 100, max: 260, step: 5, unit: '%' },
  { key: 'glowBlur', label: '辉光扩散', min: 0, max: 56, step: 1, unit: 'px' },
  { key: 'glowStrength', label: '辉光强度', min: 0, max: 100, step: 1, unit: '%' },
] as const
</script>

<template>
  <div class="tuner">
    <div class="tuner__hint" :class="{ 'is-off': !active }">
      {{
        active
          ? '拖动滑块实时预览，满意后把数值告诉我，我写回 token'
          : '当前是扁平风格，参数暂不生效 —— 先切到玻璃风格'
      }}
    </div>

    <div v-for="slider in sliders" :key="slider.key" class="tuner__row">
      <span class="tuner__label">{{ slider.label }}</span>

      <input
        v-model.number="params[slider.key]"
        class="tuner__range"
        type="range"
        :min="slider.min"
        :max="slider.max"
        :step="slider.step"
        :disabled="!active"
      />

      <code class="tuner__value">{{ params[slider.key] }}{{ slider.unit }}</code>
    </div>

    <div class="tuner__preview">
      <sr-button variant="primary">主按钮</sr-button>
      <sr-button variant="danger">危险</sr-button>
      <sr-button variant="outline">描边</sr-button>
      <sr-button variant="secondary">次要</sr-button>
      <sr-button variant="text" class="tuner__reset" @click="reset">重置参数</sr-button>
    </div>
  </div>
</template>

<style scoped>
.tuner {
  display: grid;
  gap: 10px;
}

.tuner__hint {
  padding: 8px 10px;
  border-radius: var(--sr-radius-sm);
  background: var(--sr-color-primary-alpha-08);
  color: var(--sr-color-text-secondary);
  font-size: var(--sr-font-size-sm);
}

.tuner__hint.is-off {
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text-tertiary);
}

.tuner__row {
  display: grid;
  grid-template-columns: 84px 1fr 62px;
  align-items: center;
  gap: 10px;
}

.tuner__label {
  color: var(--sr-color-text-secondary);
  font-size: var(--sr-font-size-sm);
}

.tuner__range {
  width: 100%;
  accent-color: var(--sr-color-primary);
  cursor: pointer;
}

.tuner__range:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.tuner__value {
  color: var(--sr-color-text);
  font-family: var(--sr-font-family-mono);
  font-size: 12px;
  text-align: right;
}

.tuner__preview {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 6px;
  border-top: 1px dashed var(--sr-color-border-subtle);
}

.tuner__reset {
  margin-inline-start: auto;
}
</style>
