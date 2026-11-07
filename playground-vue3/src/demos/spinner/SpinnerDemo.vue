<script setup lang="ts">
import { SrSpinner } from '@sunset-reverie/ui'

defineOptions({ name: 'SpinnerDemo' })
</script>

<template>
  <div class="demo">
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
