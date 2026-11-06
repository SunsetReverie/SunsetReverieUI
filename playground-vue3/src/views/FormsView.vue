<script setup lang="ts">
import { reactive, ref } from 'vue'

import { SrButton, SrForm, SrFormItem, SrInput, SrSelect, srToast } from '@sunset-reverie/ui'

defineOptions({ name: 'FormsView' })

/** 基础输入 */
const basic = ref('')
/** 带前后缀 */
const withAffix = ref('https://')
/** 密码 */
const password = ref('sr-secret')
/** 字数统计 */
const counted = ref('夕梦 UI')
/** 校验态 */
const errorValue = ref('not-an-email')
const warningValue = ref('待确认')
const successValue = ref('已通过')
/** 多行 */
const textarea = ref('')
/** 自适应高度 */
const autosizeValue = ref('输入内容后高度会自动跟随……')

/** 尺寸档位 */
const sizes = ['xs', 'sm', 'md', 'lg'] as const

// ---------- 下拉选择 ----------
/** 水果选项 */
const fruitOptions = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'cherry', label: '樱桃' },
  { value: 'durian', label: '榴莲（缺货）', disabled: true },
]

/** 单选 */
const single = ref<string | number | undefined>('banana')
/** 多选 */
const multiple = ref<(string | number)[]>(['apple', 'cherry'])
/** 可搜索 */
const searchable = ref<string | number | undefined>(undefined)
/** 禁用 */
const disabledSelect = ref<string | number | undefined>('apple')

// ---------- 表单校验 ----------
/** 表单数据 */
const formModel = reactive({
  username: '',
  email: '',
  role: undefined as string | number | undefined,
  tags: [] as (string | number)[],
})

/** 校验规则 */
const formRules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, message: '用户名至少 3 个字符' },
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
  ],
  role: [{ required: true, message: '请选择角色' }],
}

/** 表单实例 */
const formRef = ref<InstanceType<typeof SrForm> | null>(null)
/** 最近一次校验结果 */
const validateResult = ref('')

/** 角色选项 */
const roleOptions = [
  { value: 'admin', label: '管理员' },
  { value: 'editor', label: '编辑' },
  { value: 'viewer', label: '访客' },
]

/**
 * 提交表单
 */
async function submitForm(): Promise<void> {
  const valid = await formRef.value?.validate()
  validateResult.value = valid ? '全部通过，已提交' : '存在错误，请检查'
  if (valid) srToast.success('表单校验通过')
}

/** 重置表单 */
function resetForm(): void {
  formModel.username = ''
  formModel.email = ''
  formModel.role = undefined
  formModel.tags = []
  formRef.value?.clearValidate()
  validateResult.value = ''
}
</script>

<template>
  <div>
    <section class="panel">
      <h2 class="panel__title">基础用法</h2>
      <p class="panel__desc">
        v-model 双向绑定，尺寸默认继承全局配置（未配置时为 md）。右下角实时显示绑定值。
      </p>

      <div style="display: grid; gap: 12px; max-width: 420px">
        <sr-input v-model="basic" placeholder="请输入内容" clearable />
        <code style="font-size: 12px; color: var(--sr-color-text-secondary)"> v-model = "{{ basic }}" </code>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">尺寸</h2>
      <p class="panel__desc">
        四档尺寸，最后一个按钮用的是响应式对象
        <code style="font-family: var(--sr-font-family-mono)">{ xs: 'sm', md: 'lg' }</code
        >，缩放窗口可见切换。
      </p>

      <div style="display: grid; gap: 12px; max-width: 420px">
        <sr-input v-for="size in sizes" :key="size" :size="size" :placeholder="`尺寸 ${size}`" />
        <sr-input :size="{ xs: 'sm', md: 'lg' }" placeholder="响应式尺寸" />
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">前后缀与按钮</h2>
      <p class="panel__desc">前缀用于协议、货币等固定文本，后缀可放单位或校验提示。前后缀不参与输入。</p>

      <div style="display: grid; gap: 12px; max-width: 420px">
        <sr-input v-model="withAffix" placeholder="https://">
          <template #prefix>
            <span style="font-size: 12px">URL</span>
          </template>
        </sr-input>

        <sr-input placeholder="搜索组件">
          <template #prefix>
            <sr-icon name="lucide:search" :size="15" />
          </template>
        </sr-input>

        <sr-input placeholder="0.00">
          <template #suffix>
            <span style="font-size: 12px">元</span>
          </template>
        </sr-input>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">清空与密码</h2>
      <p class="panel__desc">
        清空按钮点击后自动回焦；密码切换会保留光标位置。这两个按钮
        <code style="font-family: var(--sr-font-family-mono)">tabindex="-1"</code>，不打断键盘输入流。
      </p>

      <div style="display: grid; gap: 12px; max-width: 420px">
        <sr-input v-model="basic" placeholder="有值时出现清空按钮" clearable />
        <sr-input v-model="password" type="password" show-password placeholder="请输入密码" />
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">字数统计与校验态</h2>
      <p class="panel__desc">
        校验态只改变边框与焦点环颜色，不内置提示文案 —— 文案与布局交给 SrFormItem（W9）。
      </p>

      <div style="display: grid; gap: 12px; max-width: 420px">
        <sr-input v-model="counted" :maxlength="20" show-count clearable />
        <sr-input v-model="errorValue" status="error" />
        <sr-input v-model="warningValue" status="warning" />
        <sr-input v-model="successValue" status="success" />
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">多行文本</h2>
      <p class="panel__desc">type="textarea" 走独立分支；开启 autosize 后高度随内容增长，省掉手动拖拽。</p>

      <div style="display: grid; gap: 12px; max-width: 560px">
        <sr-input
          v-model="textarea"
          type="textarea"
          :rows="3"
          placeholder="固定 3 行"
          show-count
          :maxlength="200"
        />
        <sr-input v-model="autosizeValue" type="textarea" autosize placeholder="高度自适应" />
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">禁用与只读</h2>
      <p class="panel__desc">禁用态整体降低对比度并禁止交互；只读态保留文本可选中复制。</p>

      <div style="display: grid; gap: 12px; max-width: 420px">
        <sr-input model-value="禁用状态" disabled />
        <sr-input model-value="只读状态，可以选中复制" readonly />
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">下拉选择</h2>
      <p class="panel__desc">
        面板位置由 <code style="font-family: var(--sr-font-family-mono)">srComputeFloating</code> 计算，
        空间不足会自动翻转。多选时触发器高度随标签换行变化，面板位置实时测量。
      </p>

      <div style="display: grid; gap: 14px; max-width: 420px">
        <div>
          <div style="font-size: 12px; color: var(--sr-color-text-secondary); margin-bottom: 6px">
            单选（可清空）
          </div>
          <sr-select v-model="single" :options="fruitOptions" clearable placeholder="请选择水果" />
        </div>

        <div>
          <div style="font-size: 12px; color: var(--sr-color-text-secondary); margin-bottom: 6px">
            多选（不关闭面板，可连续勾选）
          </div>
          <sr-select v-model="multiple" :options="fruitOptions" multiple clearable />
        </div>

        <div>
          <div style="font-size: 12px; color: var(--sr-color-text-secondary); margin-bottom: 6px">可搜索</div>
          <sr-select
            v-model="searchable"
            :options="fruitOptions"
            filterable
            clearable
            placeholder="输入关键字筛选"
          />
        </div>

        <div>
          <div style="font-size: 12px; color: var(--sr-color-text-secondary); margin-bottom: 6px">禁用</div>
          <sr-select v-model="disabledSelect" :options="fruitOptions" disabled />
        </div>

        <div>
          <div style="font-size: 12px; color: var(--sr-color-text-secondary); margin-bottom: 6px">
            四档尺寸
          </div>
          <div style="display: grid; gap: 8px">
            <sr-select
              v-for="size in sizes"
              :key="size"
              :size="size"
              :model-value="'apple'"
              :options="fruitOptions"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="panel">
      <h2 class="panel__title">表单校验</h2>
      <p class="panel__desc">
        规则分「失焦」与「输入」两种时机；一旦出现错误会转为实时校验，改对即消失。 错误文案通过
        <code style="font-family: var(--sr-font-family-mono)">aria-describedby</code>
        与控件关联，控件的边框与
        <code style="font-family: var(--sr-font-family-mono)">aria-invalid</code> 由表单项自动下发。
      </p>

      <sr-form
        ref="formRef"
        :model="formModel"
        :rules="formRules"
        label-position="left"
        :label-width="92"
        style="max-width: 520px"
      >
        <sr-form-item prop="username" label="用户名">
          <sr-input v-model="formModel.username" placeholder="至少 3 个字符" clearable />
        </sr-form-item>

        <sr-form-item prop="email" label="邮箱">
          <sr-input v-model="formModel.email" placeholder="you@example.com" />
        </sr-form-item>

        <sr-form-item prop="role" label="角色">
          <sr-select v-model="formModel.role" :options="roleOptions" placeholder="请选择角色" />
        </sr-form-item>

        <sr-form-item label="标签">
          <sr-select v-model="formModel.tags" :options="roleOptions" multiple placeholder="可多选" />
        </sr-form-item>

        <div style="display: flex; gap: 10px; align-items: center; padding-left: 92px">
          <sr-button variant="primary" @click="submitForm">提交</sr-button>
          <sr-button variant="text" @click="resetForm">重置</sr-button>
          <span
            v-if="validateResult"
            style="font-size: 12px"
            :style="{
              color: validateResult.includes('通过') ? 'var(--sr-color-success)' : 'var(--sr-color-danger)',
            }"
          >
            {{ validateResult }}
          </span>
        </div>
      </sr-form>
    </section>
  </div>
</template>
