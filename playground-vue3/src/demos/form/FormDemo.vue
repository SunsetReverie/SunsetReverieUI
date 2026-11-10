<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  SrButton,
  SrCheckbox,
  SrDatePicker,
  SrForm,
  SrFormItem,
  SrInput,
  SrInputNumber,
  SrRadio,
  SrRadioGroup,
  SrSelect,
  SrSwitch,
  SrTag,
  srToast,
  type SrFormRule,
} from '@sunset-reverie/ui'

defineOptions({ name: 'FormDemo' })

/* ---------- 1. 基础校验 ---------- */

const basicRef = ref<InstanceType<typeof SrForm>>()
// 日期与数字各自用类型正确的字段，别把 Date / number 塞进字符串字段里
const basic = reactive({
  username: '',
  email: '',
  role: '',
  birthday: null as Date | null,
  quantity: 1,
})
const basicResult = ref('')

const roles = [
  { value: 'admin', label: '管理员' },
  { value: 'editor', label: '编辑' },
  { value: 'viewer', label: '访客' },
]

const basicRules: Record<string, SrFormRule | SrFormRule[]> = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 16, message: '长度在 3 到 16 个字符' },
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
  ],
  role: [{ required: true, message: '请选择角色' }],
}

async function submitBasic(): Promise<void> {
  const valid = await basicRef.value?.validate()
  basicResult.value = valid ? '校验通过，已提交' : '存在错误，请检查'
  if (valid) srToast.success('提交成功')
}

/* ---------- 2. 异步校验 ---------- */

const asyncRef = ref<InstanceType<typeof SrForm>>()
const asyncModel = reactive({ account: '' })
const asyncPending = ref(false)

/** 已占用的账号，用来模拟服务端唯一性检查 */
const taken = ['admin', 'root', 'test']

const asyncRules: Record<string, SrFormRule | SrFormRule[]> = {
  account: [
    { required: true, message: '请输入账号' },
    {
      // 返回 Promise：校验期间表单会等待，期间重复提交会被挡住
      validator: async (value) => {
        asyncPending.value = true
        await new Promise((resolve) => setTimeout(resolve, 600))
        asyncPending.value = false

        return taken.includes(String(value)) ? '该账号已被占用' : true
      },
    },
  ],
}

async function submitAsync(): Promise<void> {
  const valid = await asyncRef.value?.validate()
  if (valid) srToast.success('账号可用')
}

/* ---------- 3. 必填星号 ---------- */

const markModel = reactive({ name: '', phone: '' })

const markRules: Record<string, SrFormRule | SrFormRule[]> = {
  name: [{ required: true, message: '请输入姓名' }],
  phone: [{ required: true, message: '请输入手机号' }],
}

/* ---------- 4. 标签布局与宽度 ---------- */

const leftModel = reactive({ company: '夕梦科技', city: '杭州' })
const widths = ['88px', '120px', '160px'] as const

/* ---------- 5. 尺寸 ---------- */

const sizeModel = reactive({ a: '示例内容', b: 2 })
const sizes = ['sm', 'md', 'lg'] as const

/* ---------- 6. 整表禁用 ---------- */

const disabledModel = reactive({ note: '禁用状态下不能编辑', count: 3 })
const formDisabled = ref(true)

/* ---------- 7. 隐藏错误文案 ---------- */

const quietModel = reactive({ code: '' })
const quietRules: Record<string, SrFormRule | SrFormRule[]> = {
  code: [{ required: true, message: '这条提示不会显示' }],
}
const quietRef = ref<InstanceType<typeof SrForm>>()

/* ---------- 8. 自定义错误 ---------- */

const customError = ref('这个错误是外部塞进来的')
const customModel = reactive({ value: '' })

/* ---------- 9. 表单联动 ---------- */

const pwdModel = reactive({ password: '', confirm: '' })

const pwdRules: Record<string, SrFormRule | SrFormRule[]> = {
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '至少 6 位' },
  ],
  confirm: [
    { required: true, message: '请再次输入密码' },
    {
      // 依赖另一个字段：validator 的第二个参数是整份 model
      validator: (value, model) =>
        value === (model as { password: string }).password ? true : '两次输入的密码不一致',
    },
  ],
}

/* ---------- 10. 动态表单项 ---------- */

const dynamicModel = reactive<{ contacts: { name: string; phone: string }[] }>({
  contacts: [{ name: '', phone: '' }],
})

const dynamicRules: Record<string, SrFormRule | SrFormRule[]> = {
  name: [{ required: true, message: '请输入联系人' }],
  phone: [{ pattern: /^\d{11}$/, message: '手机号 11 位数字' }],
}

/** 加一行 */
function addContact(): void {
  dynamicModel.contacts.push({ name: '', phone: '' })
}

/**
 * 删一行
 * @param index 行号
 */
function removeContact(index: number): void {
  dynamicModel.contacts.splice(index, 1)
}

/* ---------- 11. 清空校验态 ---------- */

const clearRef = ref<InstanceType<typeof SrForm>>()
const clearModel = reactive({ text: '' })
const clearRules: Record<string, SrFormRule | SrFormRule[]> = {
  text: [{ required: true, message: '必填' }],
}

/** 单独校验某个字段 */
async function validateOne(): Promise<void> {
  const ok = await clearRef.value?.validateField('text')
  srToast.info(ok ? '该字段通过' : '该字段未通过')
}
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础校验</h3>
      <SrForm
        ref="basicRef"
        :model="basic"
        :rules="basicRules"
        label-position="left"
        :label-width="80"
        style="max-width: 460px"
      >
        <SrFormItem label="用户名" prop="username">
          <SrInput v-model="basic.username" placeholder="3-16 个字符" clearable />
        </SrFormItem>
        <SrFormItem label="邮箱" prop="email">
          <SrInput v-model="basic.email" placeholder="name@example.com" clearable />
        </SrFormItem>
        <SrFormItem label="角色" prop="role">
          <SrSelect v-model="basic.role" :options="roles" placeholder="请选择" clearable />
        </SrFormItem>
        <SrFormItem>
          <div class="row">
            <SrButton variant="primary" @click="submitBasic">提交</SrButton>
            <SrButton variant="text" @click="basicRef?.clearValidate()">清空校验</SrButton>
            <SrTag
              v-if="basicResult"
              :type="basicResult === '校验通过，已提交' ? 'success' : 'danger'"
              size="sm"
            >
              {{ basicResult }}
            </SrTag>
          </div>
        </SrFormItem>
      </SrForm>
      <p class="hint">
        规则按顺序执行，任何一条失败就停止；<code>trigger</code> 默认是 blur，也可以改成 change
      </p>
    </section>

    <section>
      <h3>异步校验（服务端唯一性）</h3>
      <SrForm
        ref="asyncRef"
        :model="asyncModel"
        :rules="asyncRules"
        label-position="left"
        :label-width="80"
        style="max-width: 460px"
      >
        <SrFormItem label="账号" prop="account">
          <SrInput v-model="asyncModel.account" placeholder="试试 admin / root / test" clearable />
        </SrFormItem>
        <SrFormItem>
          <div class="row">
            <SrButton variant="primary" :loading="asyncPending" @click="submitAsync">提交</SrButton>
            <span v-if="asyncPending" class="hint" style="margin: 0">正在校验…</span>
          </div>
        </SrFormItem>
      </SrForm>
      <p class="hint">
        <code>validator</code> 返回 Promise 时表单会等待结果。演示里固定延迟 600ms， 用 admin / root / test
        会提示已占用
      </p>
    </section>

    <section>
      <h3>必填星号（hideRequiredMark）</h3>
      <div class="grid">
        <div class="card">
          <span class="tag">默认：显示星号</span>
          <SrForm :model="markModel" :rules="markRules" label-position="left" :label-width="60">
            <SrFormItem label="姓名" prop="name">
              <SrInput v-model="markModel.name" placeholder="必填" />
            </SrFormItem>
            <SrFormItem label="手机" prop="phone">
              <SrInput v-model="markModel.phone" placeholder="必填" />
            </SrFormItem>
          </SrForm>
        </div>
        <div class="card">
          <span class="tag">hide-required-mark</span>
          <SrForm
            :model="markModel"
            :rules="markRules"
            label-position="left"
            :label-width="60"
            hide-required-mark
          >
            <SrFormItem label="姓名" prop="name">
              <SrInput v-model="markModel.name" placeholder="必填" />
            </SrFormItem>
            <SrFormItem label="手机" prop="phone">
              <SrInput v-model="markModel.phone" placeholder="必填" />
            </SrFormItem>
          </SrForm>
        </div>
      </div>
      <p class="hint">
        星号只是视觉标记，关掉之后必填校验依然生效。有些设计规范不在标签上打星， 改为在占位文案里写「必填」
      </p>
    </section>

    <section>
      <h3>标签布局（top / left / right）</h3>
      <div class="grid">
        <div v-for="pos in ['top', 'left', 'right'] as const" :key="pos" class="card">
          <span class="tag">label-position = {{ pos }}</span>
          <SrForm :model="leftModel" :label-position="pos" :label-width="72">
            <SrFormItem label="公司">
              <SrInput v-model="leftModel.company" />
            </SrFormItem>
            <SrFormItem label="城市">
              <SrInput v-model="leftModel.city" />
            </SrFormItem>
          </SrForm>
        </div>
      </div>
    </section>

    <section>
      <h3>标签宽度（labelWidth）</h3>
      <div class="stack">
        <div v-for="w in widths" :key="w" class="size-row">
          <span class="size-row__label">{{ w }}</span>
          <SrForm :model="leftModel" label-position="left" :label-width="w" class="grow">
            <SrFormItem label="联系人姓名">
              <SrInput v-model="leftModel.company" />
            </SrFormItem>
          </SrForm>
        </div>
      </div>
      <p class="hint">固定宽度让多行标签左对齐，比按内容自适应更整齐</p>
    </section>

    <section>
      <h3>四档尺寸（size）</h3>
      <div class="stack">
        <div v-for="s in sizes" :key="s" class="size-row">
          <span class="size-row__label">{{ s }}</span>
          <SrForm :model="sizeModel" :size="s" label-position="left" :label-width="56" class="grow">
            <SrFormItem label="文本">
              <SrInput v-model="sizeModel.a" />
            </SrFormItem>
            <SrFormItem label="数量">
              <SrInputNumber v-model="sizeModel.b" :min="0" :max="99" />
            </SrFormItem>
          </SrForm>
        </div>
      </div>
      <p class="hint">表单的 size 会下发给所有子控件，不需要逐个设置</p>
    </section>

    <section>
      <h3>整表禁用（disabled）</h3>
      <div class="card" style="max-width: 460px">
        <div class="row" style="margin-bottom: 12px">
          <SrSwitch v-model="formDisabled" />
          <span class="hint" style="margin: 0">{{ formDisabled ? '已禁用' : '可编辑' }}</span>
        </div>
        <SrForm :model="disabledModel" :disabled="formDisabled" label-position="left" :label-width="72">
          <SrFormItem label="备注">
            <SrInput v-model="disabledModel.note" />
          </SrFormItem>
          <SrFormItem label="数量">
            <SrInputNumber v-model="disabledModel.count" :min="0" :max="9" />
          </SrFormItem>
        </SrForm>
      </div>
      <p class="hint">
        表单级 disabled 会下发给输入框、数字框、选择器、开关、复选框、单选、日期与上传；
        <strong>按钮不受影响</strong>——否则禁用后连提交都点不了。
      </p>
    </section>

    <section>
      <h3>隐藏错误文案（showMessage）</h3>
      <SrForm
        ref="quietRef"
        :model="quietModel"
        :rules="quietRules"
        label-position="left"
        :label-width="72"
        :show-message="false"
        style="max-width: 460px"
      >
        <SrFormItem label="编码" prop="code">
          <SrInput v-model="quietModel.code" placeholder="留空后点提交" />
        </SrFormItem>
        <SrFormItem>
          <SrButton variant="primary" @click="quietRef?.validate()">提交</SrButton>
        </SrFormItem>
      </SrForm>
      <p class="hint">关掉后只保留边框变红，不占纵向空间，适合表单项很密的后台页</p>
    </section>

    <section>
      <h3>自定义错误（error）</h3>
      <div class="grid">
        <div class="card">
          <span class="tag">由 error 属性控制（不受校验影响）</span>
          <SrForm :model="customModel" label-position="left" :label-width="72">
            <SrFormItem label="接口返回" :error="customError">
              <SrInput v-model="customModel.value" placeholder="这个框会一直是红的" />
            </SrFormItem>
          </SrForm>
          <SrButton
            size="xs"
            variant="outline"
            @click="customError = customError ? '' : '这个错误是外部塞进来的'"
          >
            切换错误
          </SrButton>
        </div>
        <div class="card">
          <span class="tag">错误文案会优先于规则校验的结果</span>
          <p class="hint" style="margin: 0">
            典型用法：提交后服务端返回字段级错误，直接写到 <code>error</code> 上， 不用伪造一条校验规则
          </p>
        </div>
      </div>
    </section>

    <section>
      <h3>表单联动（确认密码）</h3>
      <SrForm
        :model="pwdModel"
        :rules="pwdRules"
        label-position="left"
        :label-width="88"
        style="max-width: 460px"
      >
        <SrFormItem label="密码" prop="password">
          <SrInput v-model="pwdModel.password" type="password" show-password placeholder="至少 6 位" />
        </SrFormItem>
        <SrFormItem label="确认密码" prop="confirm">
          <SrInput v-model="pwdModel.confirm" type="password" placeholder="再输一次" />
        </SrFormItem>
      </SrForm>
      <p class="hint"><code>validator</code> 的第二个参数是整份 model，可以直接拿别的字段做比较</p>
    </section>

    <section>
      <h3>动态表单项</h3>
      <SrForm :model="dynamicModel" label-position="left" :label-width="72" style="max-width: 560px">
        <SrFormItem
          v-for="(contact, index) in dynamicModel.contacts"
          :key="index"
          :label="`联系人 ${index + 1}`"
          :prop="`contacts.${index}.name`"
          :rules="dynamicRules.name"
        >
          <div class="row">
            <SrInput v-model="contact.name" placeholder="姓名" />
            <SrInput v-model="contact.phone" placeholder="手机号" />
            <SrButton
              variant="text"
              :disabled="dynamicModel.contacts.length === 1"
              @click="removeContact(index)"
            >
              删除
            </SrButton>
          </div>
        </SrFormItem>
        <SrFormItem>
          <SrButton variant="outline" @click="addContact">+ 添加联系人</SrButton>
        </SrFormItem>
      </SrForm>
      <p class="hint">
        <code>prop</code> 用 <code>contacts.0.name</code> 这种路径指向数组元素， 增删之后校验依然对准正确的行
      </p>
    </section>

    <section>
      <h3>单独校验某个字段（validateField）</h3>
      <SrForm
        ref="clearRef"
        :model="clearModel"
        :rules="clearRules"
        label-position="left"
        :label-width="72"
        style="max-width: 460px"
      >
        <SrFormItem label="必填项" prop="text">
          <SrInput v-model="clearModel.text" placeholder="留空后点下面的按钮" />
        </SrFormItem>
        <SrFormItem>
          <div class="row">
            <SrButton variant="primary" @click="validateOne">只校验这一项</SrButton>
            <SrButton variant="text" @click="clearRef?.clearValidate()">清空校验态</SrButton>
          </div>
        </SrFormItem>
      </SrForm>
      <p class="hint">
        方法：<code>validate()</code> 全表校验、<code>validateField(prop)</code> 单项、
        <code>clearValidate()</code> 清掉所有错误态
      </p>
    </section>

    <section>
      <h3>综合表单</h3>
      <SrForm :model="basic" label-position="left" :label-width="88" style="max-width: 520px">
        <SrFormItem label="开关">
          <SrSwitch />
        </SrFormItem>
        <SrFormItem label="多选">
          <SrCheckbox>选项一</SrCheckbox>
        </SrFormItem>
        <SrFormItem label="单选组">
          <SrRadioGroup :model-value="'a'">
            <SrRadio value="a">A</SrRadio>
            <SrRadio value="b">B</SrRadio>
          </SrRadioGroup>
        </SrFormItem>
        <SrFormItem label="日期">
          <SrDatePicker v-model="basic.birthday" />
        </SrFormItem>
        <SrFormItem label="数字">
          <SrInputNumber v-model="basic.quantity" :min="0" />
        </SrFormItem>
      </SrForm>
      <p class="hint">各种控件放进表单后高度自动对齐，label 宽度统一由表单控制</p>
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 26px;
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
  line-height: 1.6;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.size-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.size-row__label {
  flex: 0 0 56px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  line-height: 32px;
}

.grow {
  flex: 1 1 auto;
  min-width: 0;
}

.card {
  padding: 12px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 55%, transparent);
}

.tag {
  display: block;
  margin-bottom: 8px;
  color: var(--sr-color-text-tertiary);
  font-size: 11px;
}
</style>
