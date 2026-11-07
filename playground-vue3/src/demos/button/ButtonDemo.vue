<script setup lang="ts">
import { SrButton } from '@sunset-reverie/ui'

defineOptions({ name: 'ButtonDemo' })

const variants = ['primary', 'secondary', 'outline', 'text', 'success', 'warning', 'danger'] as const
</script>

<template>
  <div class="demo">
    <section>
      <h3>变体</h3>
      <div class="row">
        <SrButton v-for="v in variants" :key="v" :variant="v">{{ v }}</SrButton>
      </div>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="row">
        <SrButton size="xs">xs</SrButton>
        <SrButton size="sm">sm</SrButton>
        <SrButton size="md">md</SrButton>
        <SrButton size="lg">lg</SrButton>
      </div>
    </section>

    <section>
      <h3>状态</h3>
      <div class="row">
        <SrButton loading>加载中</SrButton>
        <SrButton disabled>禁用</SrButton>
        <SrButton round variant="primary">胶囊</SrButton>
        <SrButton icon="lucide:heart" variant="outline">带图标</SrButton>
      </div>
    </section>

    <section>
      <h3>自定义背景色</h3>
      <div class="row">
        <SrButton bg="#8b5cf6">紫</SrButton>
        <SrButton bg="#0ea5e9" round>天蓝</SrButton>
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
</style>
