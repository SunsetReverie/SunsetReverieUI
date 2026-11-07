<script setup lang="ts">
import { SrAvatar } from '@sunset-reverie/ui'

defineOptions({ name: 'AvatarDemo' })

const people = ['林深', '周夏', '陈默', '苏白', '顾言', '沈川']
</script>

<template>
  <div class="demo">
    <section>
      <h3>自动取色（同一人始终同色）</h3>
      <div class="row">
        <SrAvatar v-for="p in people" :key="p" :alt="p" size="lg" />
      </div>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="row">
        <SrAvatar alt="XS" size="xs" />
        <SrAvatar alt="SM" size="sm" />
        <SrAvatar alt="MD" size="md" />
        <SrAvatar alt="LG" size="lg" />
        <SrAvatar alt="48" :size="48" />
      </div>
    </section>

    <section>
      <h3>形状、图标与自定义色</h3>
      <div class="row">
        <SrAvatar alt="方" shape="square" size="lg" />
        <SrAvatar icon="lucide:heart" size="lg" />
        <SrAvatar alt="林深" color="#0ea5e9" />
        <SrAvatar alt="周夏" color="#10b981" />
        <SrAvatar alt="陈默" color="#f59e0b" />
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}
</style>
