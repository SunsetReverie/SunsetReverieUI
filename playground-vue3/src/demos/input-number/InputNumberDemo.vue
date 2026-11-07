<script setup lang="ts">
import { ref } from 'vue'
import { SrInputNumber } from '@sunset-reverie/ui'

defineOptions({ name: 'InputNumberDemo' })

const count = ref(1)
const price = ref(9.9)
const plain = ref(3)
</script>

<template>
  <div class="demo">
    <section>
      <h3>范围限制</h3>
      <div class="row">
        <SrInputNumber v-model="count" :min="0" :max="10" style="width: 150px" />
        <span class="hint">当前 {{ count }}（0 ~ 10）</span>
      </div>
    </section>

    <section>
      <h3>步长与精度</h3>
      <div class="row">
        <SrInputNumber v-model="price" :step="0.1" :min="0" :precision="2" style="width: 150px" />
        <span class="hint">step 0.1 · precision 2</span>
      </div>
    </section>

    <section>
      <h3>无步进按钮与校验态</h3>
      <div class="row">
        <SrInputNumber v-model="plain" :controls="false" style="width: 150px" />
        <SrInputNumber v-model="plain" status="error" style="width: 150px" />
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
  gap: 12px;
}
.hint {
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
</style>
