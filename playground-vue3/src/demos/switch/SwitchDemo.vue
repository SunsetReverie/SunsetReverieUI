<script setup lang="ts">
import { ref } from 'vue'
import { SrSwitch } from '@sunset-reverie/ui'

defineOptions({ name: 'SwitchDemo' })

const on = ref(true)
const text = ref(true)
</script>

<template>
  <div class="demo">
    <section>
      <h3>三种状态</h3>
      <div class="row">
        <SrSwitch v-model="on" />
        <SrSwitch :model-value="true" disabled />
        <SrSwitch :model-value="true" loading />
      </div>
      <p class="hint">正常 / 禁用 / 加载中</p>
    </section>

    <section>
      <h3>带文字</h3>
      <div class="row">
        <SrSwitch v-model="text" checked-text="开" unchecked-text="关" />
        <SrSwitch v-model="text" checked-text="启用" unchecked-text="停用" size="lg" />
      </div>
    </section>

    <section>
      <h3>尺寸</h3>
      <div class="row">
        <SrSwitch v-model="on" size="xs" />
        <SrSwitch v-model="on" size="sm" />
        <SrSwitch v-model="on" size="md" />
        <SrSwitch v-model="on" size="lg" />
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
