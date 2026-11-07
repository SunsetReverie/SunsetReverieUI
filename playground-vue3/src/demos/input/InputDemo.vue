<script setup lang="ts">
import { ref } from 'vue'
import { SrInput } from '@sunset-reverie/ui'

defineOptions({ name: 'InputDemo' })

const basic = ref('')
const withIcon = ref('')
const password = ref('12345678')
const status = ref('')
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础与尺寸</h3>
      <div class="grid">
        <SrInput v-model="basic" placeholder="请输入内容" />
        <SrInput v-model="basic" size="sm" placeholder="sm" />
      </div>
    </section>

    <section>
      <h3>前后缀与清空</h3>
      <div class="grid">
        <SrInput v-model="withIcon" placeholder="搜索组件" clearable>
          <template #prefix>
            <SrIcon name="lucide:search" :size="14" />
          </template>
        </SrInput>
        <SrInput v-model="withIcon" placeholder="带后缀">
          <template #suffix>
            <SrTag size="xs">⌘K</SrTag>
          </template>
        </SrInput>
      </div>
    </section>

    <section>
      <h3>密码与字数统计</h3>
      <div class="grid">
        <SrInput v-model="password" type="password" show-password placeholder="密码" />
        <SrInput v-model="basic" :maxlength="20" show-count placeholder="最多 20 字" />
      </div>
    </section>

    <section>
      <h3>校验态</h3>
      <div class="grid">
        <SrInput v-model="status" status="error" placeholder="error" />
        <SrInput v-model="status" status="success" placeholder="success" />
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
