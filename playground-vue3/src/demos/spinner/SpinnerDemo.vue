<script setup lang="ts">
import { SrSpinner } from '@sunset-reverie/ui'

defineOptions({ name: 'SpinnerDemo' })

/** 同色系：由浅到深，最协调 */
const warmColors = ['#ffd8a8', '#ffc078', '#ffa94d', '#ff922b']

/** 四色：区分明显，适合表达「多个任务在并行」 */
const vividColors = ['#fca5a5', '#fcd34d', '#86efac', '#93c5fd']

/** 六种动画 */
const variants = [
  { key: 'ring', name: '圆环', desc: '通用，最不容易出错' },
  { key: 'gradient', name: '渐变环', desc: '现代感，适合深色底' },
  { key: 'dots', name: '三点', desc: '轻量，适合小尺寸' },
  { key: 'bars', name: '竖条', desc: '科技感，像均衡器' },
  { key: 'pulse', name: '扩散', desc: '沉稳，像呼吸' },
  { key: 'orbit', name: '绕轨', desc: '活泼，有故事感' },
] as const
</script>

<template>
  <div class="demo">
    <section>
      <h3>动画样式（variant）</h3>
      <div class="variants">
        <div v-for="v in variants" :key="v.key" class="variant">
          <div class="variant__stage">
            <SrSpinner :variant="v.key" :size="40" />
          </div>
          <p class="variant__name">{{ v.name }}</p>
          <p class="variant__desc">{{ v.desc }}</p>
          <code class="variant__code">{{ v.key }}</code>
        </div>
      </div>
      <p class="hint">
        全部用 CSS 绘制，不依赖图标或图片；颜色走 currentColor，尺寸由外层宽高驱动， 所以 12px 和 48px
        下都不会走形
      </p>
    </section>

    <section>
      <h3>多色（colors）</h3>
      <div class="grid">
        <div class="color-card">
          <div class="color-card__stage">
            <SrSpinner variant="dots" :size="40" :colors="warmColors" />
          </div>
          <p class="color-card__name">同色系（3 点）</p>
          <p class="color-card__desc">由浅到深，视觉最协调</p>
        </div>
        <div class="color-card">
          <div class="color-card__stage">
            <SrSpinner variant="bars" :size="40" :colors="warmColors" />
          </div>
          <p class="color-card__name">同色系（4 条）</p>
          <p class="color-card__desc">像一组并列的进度</p>
        </div>
        <div class="color-card">
          <div class="color-card__stage">
            <SrSpinner variant="dots" :size="40" :colors="vividColors" />
          </div>
          <p class="color-card__name">四色（3 点）</p>
          <p class="color-card__desc">取前 3 个，区分明显</p>
        </div>
        <div class="color-card">
          <div class="color-card__stage">
            <SrSpinner variant="bars" :size="40" :colors="vividColors" />
          </div>
          <p class="color-card__name">四色（4 条）</p>
          <p class="color-card__desc">适合「多个任务并行」</p>
        </div>
        <div class="color-card">
          <div class="color-card__stage">
            <SrSpinner variant="pulse" :size="40" :colors="['#fca5a5', '#93c5fd']" />
          </div>
          <p class="color-card__name">双色（2 圈）</p>
          <p class="color-card__desc">两圈不同色，扩散层次更清楚</p>
        </div>
        <div class="color-card">
          <div class="color-card__stage">
            <SrSpinner variant="bars" :size="40" />
          </div>
          <p class="color-card__name">不传（对照）</p>
          <p class="color-card__desc">全部用 currentcolor 单色</p>
        </div>
      </div>
      <p class="hint">
        数量不足会循环取用；<code>ring</code> / <code>gradient</code> /
        <code>orbit</code> 只有一个元素，仍是单色，会忽略 <code>colors</code>
      </p>
    </section>

    <section>
      <h3>同一变体的不同尺寸</h3>
      <div class="stack">
        <div v-for="v in variants.slice(0, 6)" :key="v.key" class="size-row">
          <span class="size-row__label">{{ v.key }}</span>
          <div class="row" style="gap: 18px; align-items: center">
            <SrSpinner :variant="v.key" :size="12" />
            <SrSpinner :variant="v.key" :size="18" />
            <SrSpinner :variant="v.key" :size="28" />
            <SrSpinner :variant="v.key" :size="40" />
          </div>
        </div>
      </div>
      <p class="hint">小到 12px 用在按钮里，大到 40px 用在整页加载</p>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="row" style="gap: 16px">
        <SrSpinner size="xs" />
        <SrSpinner size="sm" />
        <SrSpinner size="md" />
        <SrSpinner size="lg" />
        <SrSpinner :size="32" />
      </div>
    </section>

    <section>
      <h3>颜色与线宽</h3>
      <div class="row" style="gap: 16px">
        <SrSpinner color="var(--sr-color-success)" />
        <SrSpinner color="var(--sr-color-danger)" />
        <SrSpinner :stroke-width="1" />
        <SrSpinner :stroke-width="3" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.variants {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.variant {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 3px;
  padding: 14px 8px 10px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.variant__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
}

.variant__name {
  margin: 2px 0 0;
  color: var(--sr-color-text);
  font-size: 12.5px;
  font-weight: var(--sr-font-weight-medium);
}

.variant__desc {
  margin: 0;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
  text-align: center;
}

.variant__code {
  margin-top: 4px;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text-tertiary);
  font-family: var(--sr-font-family-mono);
  font-size: 10.5px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.color-card {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 3px;
  padding: 14px 10px 10px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.color-card__stage {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
}

.color-card__name {
  margin: 2px 0 0;
  color: var(--sr-color-text);
  font-size: 12.5px;
  font-weight: var(--sr-font-weight-medium);
}

.color-card__desc {
  margin: 0;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
  text-align: center;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.size-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.size-row__label {
  flex: 0 0 72px;
  color: var(--sr-color-text-tertiary);
  font-family: var(--sr-font-family-mono);
  font-size: 11px;
}

.hint {
  margin: 10px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 1.6;
}

.demo {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
h3 {
  margin: 0 0 10px;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  font-weight: 600;
}
.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}
</style>
