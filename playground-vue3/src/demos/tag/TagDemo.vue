<script setup lang="ts">
import { ref } from 'vue'
import { SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'TagDemo' })

const types = ['default', 'primary', 'success', 'warning', 'danger', 'info'] as const
const closable = ref(['设计', '前端', '组件库'])
</script>

<template>
  <div class="demo">
    <section>
      <h3>语义类型（light）</h3>
      <div class="row">
        <SrTag v-for="t in types" :key="t" :type="t">{{ t }}</SrTag>
      </div>
    </section>

    <section>
      <h3>深色档（dark）</h3>
      <div class="row">
        <SrTag v-for="t in types" :key="t" :type="t" variant="dark">{{ t }}</SrTag>
      </div>
    </section>

    <section>
      <h3>自定义基色</h3>
      <div class="row">
        <SrTag color="#8b5cf6">紫</SrTag>
        <SrTag color="#0ea5e9" variant="dark">天蓝</SrTag>
        <SrTag color="#10b981" variant="dark">深绿</SrTag>
      </div>
    </section>

    <section>
      <h3>尺寸与圆角</h3>
      <div class="row">
        <SrTag size="xs">xs</SrTag>
        <SrTag size="sm">sm</SrTag>
        <SrTag size="md">md</SrTag>
        <SrTag size="lg">lg</SrTag>
        <SrTag round type="primary">胶囊</SrTag>
      </div>
    </section>

    <section>
      <h3>可关闭</h3>
      <div class="row">
        <SrTag v-for="(t, i) in closable" :key="t" closable type="primary" @close="closable.splice(i, 1)">
          {{ t }}
        </SrTag>
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
