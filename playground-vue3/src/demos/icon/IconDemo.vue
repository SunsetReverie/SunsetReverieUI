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
    </section>

    <section>
      <h3>颜色与变换</h3>
      <div class="row" style="gap: 16px">
        <span style="color: var(--sr-color-primary)"><SrIcon name="lucide:heart" :size="24" /></span>
        <span style="color: var(--sr-color-success)"><SrIcon name="lucide:check" :size="24" /></span>
        <SrIcon name="lucide:chevron-right" :size="24" :rotate="90" />
        <SrIcon name="lucide:chevron-right" :size="24" flip="horizontal" />
        <SrIcon name="lucide:loader-circle" :size="24" spin />
      </div>
    </section>
  </div>
</template>

<style scoped>
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
