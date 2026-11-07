<script setup lang="ts">
import { SrIcon } from '@sunset-reverie/ui'

defineOptions({ name: 'IconDemo' })

const names = [
  'lucide:house',
  'lucide:inbox',
  'lucide:heart',
  'lucide:settings',
  'lucide:moon-star',
  'lucide:check',
]
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础</h3>
      <div class="row" style="gap: 16px">
        <SrIcon v-for="n in names" :key="n" :name="n" :size="24" />
      </div>
    </section>

    <section>
      <h3>尺寸（档位 / 数字 / 带单位）</h3>
      <div class="row" style="gap: 16px">
        <SrIcon name="lucide:house" size="xs" />
        <SrIcon name="lucide:house" size="sm" />
        <SrIcon name="lucide:house" size="md" />
        <SrIcon name="lucide:house" size="lg" />
        <SrIcon name="lucide:house" :size="32" />
        <SrIcon name="lucide:house" size="1.5rem" />
      </div>
      <p class="hint">默认 1em，跟着父级字号走</p>
    </section>

    <section>
      <h3>颜色继承（不传 color，跟随父级 currentColor）</h3>
      <div class="row" style="gap: 20px">
        <span class="inherit" style="color: #ff7a45"><SrIcon name="lucide:heart" :size="24" /></span>
        <span class="inherit" style="color: #10b981"><SrIcon name="lucide:check" :size="24" /></span>
        <span class="inherit" style="color: #3e3edc"><SrIcon name="lucide:house" :size="24" /></span>
        <span class="inherit" style="color: #8b5cf6"><SrIcon name="lucide:moon-star" :size="24" /></span>
      </div>
      <p class="hint">
        图标默认不输出内联颜色，所以父级设置 color 就会跟着变——这正是「放在按钮里自动匹配文字色」的原理
      </p>
    </section>

    <section>
      <h3>显式指定 color（覆盖继承）</h3>
      <div class="row" style="gap: 20px">
        <span style="color: #10b981">
          <SrIcon name="lucide:heart" :size="24" color="var(--sr-color-danger)" />
        </span>
        <SrIcon name="lucide:trash" :size="24" color="#ef4444" />
        <SrIcon name="lucide:check" :size="24" color="#10b981" />
      </div>
      <p class="hint">传了 color 就固定该颜色，不再跟随父级</p>
    </section>

    <section>
      <h3>在文字中内联（跟随字号与颜色）</h3>
      <div class="stack">
        <p class="text">这是正文里的图标 <SrIcon name="lucide:heart" /> 它和文字是同一个颜色与字号</p>
        <p class="text" style="color: #ff7a45">
          父级换成橙色后 <SrIcon name="lucide:moon-star" /> 图标也跟着变
        </p>
        <p class="text" style="font-size: 20px">字号放大后 <SrIcon name="lucide:settings" /> 图标同步放大</p>
      </div>
    </section>

    <section>
      <h3>变换</h3>
      <div class="row" style="gap: 16px">
        <SrIcon name="lucide:chevron-right" :size="24" />
        <SrIcon name="lucide:chevron-right" :size="24" :rotate="90" />
        <SrIcon name="lucide:chevron-right" :size="24" flip="horizontal" />
        <SrIcon name="lucide:chevron-right" :size="24" flip="vertical" />
        <SrIcon name="lucide:loader-circle" :size="24" spin />
      </div>
    </section>

    <section>
      <h3>无障碍（label）</h3>
      <div class="row" style="gap: 16px">
        <SrIcon name="lucide:inbox" :size="24" label="收件箱" />
        <SrIcon name="lucide:heart" :size="24" />
      </div>
      <p class="hint">不传 label 视为装饰性图标，自动加 aria-hidden，读屏会跳过</p>
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 24px;
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
.hint {
  margin: 8px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 继承演示：给一个浅底，避免图标在纯白上看不出边界 */
.inherit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--sr-color-bg-sunken);
}

.text {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
}
</style>
