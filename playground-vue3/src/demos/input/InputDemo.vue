<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrIcon, SrInput, SrInputNumber, SrSelect, SrTag } from '@sunset-reverie/ui'

defineOptions({ name: 'InputDemo' })

const basic = ref('')
const email = ref('demo@starriver.dev')
const amount = ref('1200')
const weight = ref('65')
const search = ref('')
const password = ref('12345678')
const limited = ref('')
const status = ref('')
const count = ref(1)
const pick = ref('')
const options = [
  { value: 'a', label: '选项 A' },
  { value: 'b', label: '选项 B' },
]
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础</h3>
      <div class="grid">
        <SrInput v-model="basic" placeholder="请输入内容" />
        <SrInput v-model="basic" placeholder="带初始值" />
      </div>
    </section>

    <section>
      <h3>四档尺寸（xs / sm / md / lg）</h3>
      <div class="stack">
        <div v-for="s in ['xs', 'sm', 'md', 'lg']" :key="s" class="size-row">
          <span class="size-row__label">size = {{ s }}</span>
          <SrInput v-model="basic" :size="s as 'md'" :placeholder="`${s} 档输入框`" />
        </div>
      </div>
      <p class="hint">高度依次 24 / 28 / 32 / 40px；字号与左右内边距同步缩放，图标也应该跟着变</p>
    </section>

    <section>
      <h3>尺寸对齐（同档位的按钮与选择器）</h3>
      <div class="stack">
        <div v-for="s in ['sm', 'md', 'lg']" :key="s" class="size-row">
          <span class="size-row__label">{{ s }}</span>
          <div class="size-row__group">
            <SrInput v-model="basic" :size="s as 'md'" placeholder="输入" />
            <SrSelect v-model="pick" :options="options" :size="s as 'md'" placeholder="选择" />
            <SrButton :size="s as 'md'" variant="primary">按钮</SrButton>
            <SrInputNumber v-model="count" :size="s as 'md'" :min="0" :max="99" />
          </div>
        </div>
      </div>
      <p class="hint">同一档位下四种控件高度一致，混排时不会参差</p>
    </section>

    <section>
      <h3>前后插槽（prefix / suffix）</h3>
      <div class="grid">
        <SrInput v-model="email" placeholder="邮箱">
          <template #prefix>
            <SrIcon name="lucide:inbox" :size="14" />
          </template>
        </SrInput>

        <SrInput v-model="amount" placeholder="金额">
          <template #suffix>
            <span class="unit">元</span>
          </template>
        </SrInput>

        <SrInput v-model="weight" placeholder="重量">
          <template #prefix>
            <SrIcon name="lucide:box" :size="14" />
          </template>
          <template #suffix>
            <span class="unit">kg</span>
          </template>
        </SrInput>

        <SrInput v-model="search" placeholder="搜索组件" clearable>
          <template #prefix>
            <SrIcon name="lucide:search" :size="14" />
          </template>
          <template #suffix>
            <SrTag size="xs">⌘K</SrTag>
          </template>
        </SrInput>
      </div>
      <p class="hint">
        prefix / suffix 是插槽而不是 prop，里面可以放图标、单位、按钮等任意内容；清空按钮与它们不冲突
      </p>
    </section>

    <section>
      <h3>与数字输入组合（右侧步进 + 后缀图标）</h3>
      <div class="grid">
        <SrInputNumber v-model="count" :min="0" :max="99" style="width: 100%" />

        <div class="combo">
          <SrInputNumber v-model="count" :min="0" :max="99" controls-position="both" style="flex: 1" />
          <SrIcon name="lucide:arrow-right" :size="14" class="combo__tail" />
        </div>
      </div>
      <p class="hint">controls-position="both" 把步进按钮放到两侧；数字输入没有 prefix/suffix 插槽</p>
    </section>

    <section>
      <h3>密码与字数统计</h3>
      <div class="grid">
        <SrInput v-model="password" type="password" show-password placeholder="密码" />
        <SrInput v-model="limited" :maxlength="20" show-count placeholder="最多 20 字" />
      </div>
    </section>

    <section>
      <h3>校验态</h3>
      <div class="grid">
        <SrInput v-model="status" status="error" placeholder="error" />
        <SrInput v-model="status" status="warning" placeholder="warning" />
        <SrInput v-model="status" status="success" placeholder="success" />
      </div>
    </section>

    <section>
      <h3>禁用与只读</h3>
      <div class="grid">
        <SrInput :model-value="'禁用状态'" disabled />
        <SrInput :model-value="'只读，可选中复制'" readonly />
      </div>
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 24px;
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
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}

.unit {
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  white-space: nowrap;
}

.combo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.size-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.size-row__label {
  flex: 0 0 84px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.size-row__group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.combo__tail {
  color: var(--sr-color-text-tertiary);
}
</style>
