# SrForm 表单

容器 + 校验。`SrForm` 管数据、规则与提交，`SrFormItem` 管单个字段的标签、必填标记与错误展示。

<script setup>
import { ref } from 'vue'
import { srToast } from '@sunset-reverie/ui'

const model = ref({ username: '', email: '' })
const formRef = ref(null)
const result = ref('')

const rules = {
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

/** 必填标记演示的数据 */
const markModel = ref({ name: '' })
const markRules = {
  name: [{ required: true, message: '请输入姓名' }],
}

async function submit() {
  const valid = await formRef.value?.validate()
  result.value = valid ? '校验通过，可以提交' : '存在错误，请检查'
}
</script>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrForm, SrFormItem, SrInput, srToast, type SrFormRule } from '@sunset-reverie/ui'

const model = ref({ username: '', email: '' })
const formRef = ref<InstanceType<typeof SrForm>>()

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

async function submit(): Promise<void> {
  const valid = await formRef.value?.validate()
  if (valid) srToast.success('已提交')
}
</script>

<template>
  <SrForm ref="formRef" :model="model" :rules="rules" label-position="left" @submit="submit">
    <SrFormItem prop="username" label="用户名">
      <SrInput v-model="model.username" />
    </SrFormItem>

    <SrFormItem prop="email" label="邮箱">
      <SrInput v-model="model.email" />
    </SrFormItem>

    <SrButton html-type="submit" variant="primary">提交</SrButton>
  </SrForm>
</template>
```

## 交互演示

直接改内容、点提交，能看到实时校验与错误文案：

<div class="sr-demo is-block">
  <SrForm ref="formRef" :model="model" :rules="rules" label-position="left" :label-width="72" style="max-width: 360px" @submit="submit">
    <SrFormItem prop="username" label="用户名">
      <SrInput v-model="model.username" placeholder="3 到 16 个字符" />
    </SrFormItem>
    <SrFormItem prop="email" label="邮箱">
      <SrInput v-model="model.email" placeholder="name@example.com" />
    </SrFormItem>
    <SrButton html-type="submit" variant="primary" size="sm">提交</SrButton>
    <span v-if="result" style="margin-left: 12px; font-size: 13px">{{ result }}</span>
  </SrForm>
</div>

## 校验规则

`SrFormRule` 支持以下约束，可组合：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `required` | `boolean` | 必填 |
| `message` | `string` | 失败提示，不给时用内置文案 |
| `min` | `number` | 字符串最小长度 / 数字最小值 / 数组最小长度 |
| `max` | `number` | 最大长度 / 最大值 |
| `pattern` | `RegExp` | 正则匹配 |
| `validator` | `(value, model) => boolean \| string \| Promise<…>` | 自定义校验，返回 `true` 通过、字符串为失败原因 |
| `trigger` | `'blur' \| 'change'` | 触发时机，默认 `blur` |

规则可以挂在表单级（`rules`，按字段名索引），也可以挂在字段级（`SrFormItem` 的 `rules`）。**字段级优先**：

```vue
<SrFormItem prop="code" label="编号" :rules="{ required: true, message: '编号必填' }">
  <SrInput v-model="model.code" />
</SrFormItem>
```

### 异步校验

`validator` 返回 Promise 时，表单会等它 resolve 再更新状态：

```ts
const rules = {
  username: {
    validator: async (value) => {
      const exists = await checkName(String(value))
      return exists ? '该用户名已被占用' : true
    },
    trigger: 'blur',
  },
}
```

## 标签布局

`labelPosition` 三选一：

| 值 | 形态 |
| --- | --- |
| `top`（默认） | 标签在控件上方，单列堆叠 |
| `left` | 两列网格，标签文字左对齐 |
| `right` | 两列网格，标签文字右对齐，贴着控件 |

`left` / `right` 走 grid 布局，`labelWidth` 控制标签列宽度；`SrFormItem` 也能单独设 `labelWidth` 覆盖。

<div class="sr-demo">
  <div v-for="pos in ['top', 'left', 'right']" :key="pos" style="min-width: 180px">
    <span class="sr-demo__label">labelPosition = {{ pos }}</span>
    <SrForm :model="layoutModel" :label-position="pos" :label-width="54">
      <SrFormItem prop="name" label="名称">
        <SrInput v-model="layoutModel.name" size="sm" />
      </SrFormItem>
    </SrForm>
  </div>
</div>

## 调用方法

通过 `ref` 拿实例：

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `validate()` | `() => Promise<boolean>` | 校验全部字段，全过返回 `true` |
| `validateField(prop)` | `(prop: string) => Promise<boolean>` | 只校验一个字段 |
| `clearValidate(prop?)` | `(prop?: string) => void` | 清除校验状态，不传则清全部 |

`SrFormItem` 自身暴露 `validate()` 与 `clear()`。

## 必填标记

必填项的标签后面会跟一个红色星号。有些设计规范不在标签上打星，用 `hide-required-mark` 关掉：

<div class="sr-demo is-block">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px">
    <div>
      <p style="margin: 0 0 8px; font-size: 12px; color: var(--vp-c-text-3)">默认</p>
      <SrForm :model="markModel" :rules="markRules" label-position="left" :label-width="60">
        <SrFormItem label="姓名" prop="name">
          <SrInput v-model="markModel.name" placeholder="必填" />
        </SrFormItem>
      </SrForm>
    </div>
    <div>
      <p style="margin: 0 0 8px; font-size: 12px; color: var(--vp-c-text-3)">hide-required-mark</p>
      <SrForm :model="markModel" :rules="markRules" label-position="left" :label-width="60" hide-required-mark>
        <SrFormItem label="姓名" prop="name">
          <SrInput v-model="markModel.name" placeholder="必填" />
        </SrFormItem>
      </SrForm>
    </div>
  </div>
</div>

星号是纯视觉标记（CSS 伪元素），关掉之后**必填校验照旧生效**，错误提示也照常显示。

单个字段想单独控制，可以在 `SrFormItem` 的 label 插槽里自己画：

```vue
<SrFormItem prop="name">
  <template #label>
    <span>姓名</span>
    <em v-if="showMark" style="color: var(--sr-color-danger)">*</em>
  </template>
  <SrInput v-model="model.name" />
</SrFormItem>
```

## 错误展示

- 失败时 `SrFormItem` 加 `is-error`，并把 `aria-invalid` 下发到内部控件
- `showMessage="false"` 只保留边框变色，不显示文案
- `error` 传字符串可手动指定错误（优先于校验结果），适合展示服务端返回的字段错误

```vue
<SrFormItem prop="email" label="邮箱" :error="serverErrors.email">
  <SrInput v-model="model.email" />
</SrFormItem>
```

## Props（SrForm）

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `model` | `Record<string, unknown>` | `{}` | 表单数据对象 |
| `rules` | `Record<string, SrFormRule \| SrFormRule[]>` | `{}` | 全局校验规则 |
| `labelWidth` | `string \| number` | `'88px'` | 标签列宽度 |
| `labelPosition` | `'top' \| 'left' \| 'right'` | `'top'` | 标签位置 |
| `hideRequiredMark` | `boolean` | `false` | 隐藏必填项标签后的星号 |
| `size` | `SrSize` | 继承配置 | 表单级尺寸，下发给子控件 |
| `disabled` | `boolean` | `false` | 整表禁用 |
| `showMessage` | `boolean` | `true` | 是否显示错误文案 |

## Props（SrFormItem）

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `prop` | `string` | `''` | 对应 `model` 中的字段名 |
| `label` | `string` | `''` | 标签文案 |
| `rules` | `SrFormRule \| SrFormRule[]` | — | 字段级规则，优先于表单级 |
| `required` | `boolean` | `false` | 强制显示必填星号（没配 rules 时也用） |
| `error` | `string` | `''` | 手动错误文案，优先于校验结果 |
| `labelWidth` | `string \| number` | — | 单独覆盖标签宽度 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `submit` | `model` | 原生提交事件 |
| `validate-fail` | `errors` | 校验失败，`errors` 为 `Record<string, string>` |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 表单项与操作按钮 |

## 注意事项

- **`hideRequiredMark` 只影响星号显示**，不改变校验行为。它加的是根元素的类名，样式层面用 `content: none` 干掉伪元素。

- **`prop` 必须和 `model` 的字段名一致**，否则规则取不到值，校验会静默通过。
- **`required` 只是显示星号**，不参与校验。真正拦截输入的是 `rules` 里的 `{ required: true }`。
- 校验态通过 `provide/inject` 下发，`SrFormItem` 必须放在 `SrForm` 内部才有效。
- `trigger` 默认 `blur`，想边输边校验改成 `'change'`；两种规则可以同时存在（不同 trigger）。
- `submit` 依赖原生 `<form>` 的提交行为，触发按钮要用 `html-type="submit"`，或用 `<SrButton html-type="submit">`。
