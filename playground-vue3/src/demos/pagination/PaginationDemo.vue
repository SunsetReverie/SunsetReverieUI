<script setup lang="ts">
import { ref } from 'vue'
import { SrPagination } from '@sunset-reverie/ui'

defineOptions({ name: 'PaginationDemo' })

const page = ref(1)
const pageSize = ref(10)
const simplePage = ref(1)
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础（页码收敛）</h3>
      <SrPagination v-model="page" :total="120" />
      <p class="hint">当前第 {{ page }} 页</p>
    </section>

    <section>
      <h3>每页条数与跳页</h3>
      <SrPagination v-model="page" v-model:page-size="pageSize" :total="200" show-jumper />
      <p class="hint">每页 {{ pageSize }} 条</p>
    </section>

    <section>
      <h3>简洁模式</h3>
      <SrPagination v-model="simplePage" :total="200" simple />
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
.hint {
  margin: 8px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
</style>
