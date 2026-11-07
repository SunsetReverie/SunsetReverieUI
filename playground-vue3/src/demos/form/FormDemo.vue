<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrForm, SrFormItem, SrInput, SrSelect, srToast, type SrFormRule } from '@sunset-reverie/ui'

defineOptions({ name: 'FormDemo' })

const formRef = ref<InstanceType<typeof SrForm>>()
const model = ref({ username: '', email: '', role: '' })
const result = ref('')

const rules: Record<string, SrFormRule | SrFormRule[]> = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 16, message: '长度在 3 到 16 个字符' },
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
  ],
}

const layoutModel = ref({ name: '林深' })

async function submit(): Promise<void> {
  const valid = await formRef.value?.validate()
  result.value = valid ? '校验通过' : '存在错误'
  if (valid) srToast.success('提交成功')
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>校验与提交</h3>
      <SrForm
        ref="formRef"
        :model="model"
        :rules="rules"
        label-position="left"
        :label-width="72"
        style="max-width: 420px"
        @submit="submit"
      >
        <SrFormItem prop="username" label="用户名">
          <SrInput v-model="model.username" placeholder="3 到 16 个字符" />
        </SrFormItem>
        <SrFormItem prop="email" label="邮箱">
          <SrInput v-model="model.email" placeholder="name@example.com" />
        </SrFormItem>
        <SrFormItem prop="role" label="角色" :rules="{ required: true, message: '请选择角色' }">
          <SrSelect
            v-model="model.role"
            :options="[
              { value: 'dev', label: '开发' },
              { value: 'design', label: '设计' },
            ]"
            placeholder="选择角色"
          />
        </SrFormItem>
        <SrButton html-type="submit" variant="primary" size="sm">提交</SrButton>
        <span v-if="result" class="hint">{{ result }}</span>
      </SrForm>
    </section>

    <section>
      <h3>标签布局</h3>
      <div class="layouts">
        <div v-for="pos in ['top', 'left', 'right']" :key="pos">
          <span class="hint">labelPosition = {{ pos }}</span>
          <SrForm :model="layoutModel" :label-position="pos as 'top'" :label-width="54">
            <SrFormItem prop="name" label="名称">
              <SrInput v-model="layoutModel.name" size="sm" />
            </SrFormItem>
          </SrForm>
        </div>
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
.hint {
  margin-left: 12px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
.layouts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
.layouts .hint {
  display: block;
  margin: 0 0 8px;
}
</style>
