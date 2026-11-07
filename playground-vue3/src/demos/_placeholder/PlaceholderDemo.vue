<script setup lang="ts">
import { SrEmpty, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'PlaceholderDemo' })
</script>

<template>
  <div class="placeholder">
    <SrEmpty description="演示正在整理中，下方仍可查看完整的 API 表" size="lg">
      <template #action>
        <SrTag type="warning" size="sm">待补演示</SrTag>
      </template>
    </SrEmpty>
  </div>
</template>

<style scoped>
.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  border: 1px dashed var(--sr-color-border);
  border-radius: var(--sr-radius-base);
}
</style>
