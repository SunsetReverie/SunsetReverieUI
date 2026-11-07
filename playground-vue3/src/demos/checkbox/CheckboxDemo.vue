<script setup lang="ts">
import { ref } from 'vue'
import { SrCheckbox, SrCheckboxGroup } from '@sunset-reverie/ui'

defineOptions({ name: 'CheckboxDemo' })

const single = ref(true)
const multi = ref(['apple'])

const fruits = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'cherry', label: '樱桃' },
  { value: 'durian', label: '榴莲（禁用）', disabled: true },
]
</script>

<template>
  <div class="demo">
    <section>
      <h3>单个使用</h3>
      <div class="row">
        <SrCheckbox v-model="single" label="接收通知" />
        <SrCheckbox v-model="single" disabled label="禁用" />
        <SrCheckbox :model-value="false" indeterminate label="半选（纯视觉）" />
      </div>
    </section>

    <section>
      <h3>多选组</h3>
      <SrCheckboxGroup v-model="multi">
        <SrCheckbox v-for="f in fruits" :key="f.value" :value="f.value" :disabled="f.disabled">
          {{ f.label }}
        </SrCheckbox>
      </SrCheckboxGroup>
      <p class="hint">已选：{{ multi.join('、') || '无' }}</p>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="row">
        <SrCheckbox v-model="single" size="sm" label="sm" />
        <SrCheckbox v-model="single" size="md" label="md" />
        <SrCheckbox v-model="single" size="lg" label="lg" />
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
  gap: 14px;
}
.hint {
  margin: 8px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
</style>
