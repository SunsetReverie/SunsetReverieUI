<script setup lang="ts">
import { ref } from 'vue'
import { SrRadio, SrRadioGroup } from '@sunset-reverie/ui'

defineOptions({ name: 'RadioDemo' })

const picked = ref('standard')

const plans = [
  { value: 'free', label: '免费版' },
  { value: 'standard', label: '标准版' },
  { value: 'pro', label: '专业版' },
  { value: 'enterprise', label: '企业版（禁用）', disabled: true },
]
</script>

<template>
  <div class="demo">
    <section>
      <h3>单选组</h3>
      <SrRadioGroup v-model="picked">
        <SrRadio v-for="p in plans" :key="p.value" :value="p.value" :disabled="p.disabled">
          {{ p.label }}
        </SrRadio>
      </SrRadioGroup>
      <p class="hint">已选：{{ picked }}</p>
    </section>

    <section>
      <h3>横向排列</h3>
      <SrRadioGroup v-model="picked" style="flex-direction: row; gap: 20px">
        <SrRadio value="standard" label="标准" />
        <SrRadio value="pro" label="专业" />
      </SrRadioGroup>
    </section>

    <section>
      <h3>整组禁用</h3>
      <SrRadioGroup v-model="picked" disabled>
        <SrRadio value="standard" label="禁用 A" />
        <SrRadio value="pro" label="禁用 B" />
      </SrRadioGroup>
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
