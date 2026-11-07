<script setup lang="ts">
import { reactive, ref } from 'vue'

import {
  SrButton,
  SrForm,
  SrFormItem,
  SrInput,
  SrInputNumber,
  SrSelect,
  srToast,
  SrPanel,
} from '@sunset-reverie/ui'

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

// ---------- 数字输入 ----------
/** 基础计数 */
const numberBasic = ref<number | null>(1)
/** 价格：两位小数 */
const numberPrice = ref<number | null>(19.9)
/** 边界钳制 0 ~ 10 */
const numberRange = ref<number | null>(5)
/** 两侧分列按钮 */
const numberBoth = ref<number | null>(0)
/** 隐藏步进按钮 */
const numberPlain = ref<number | null>(8)
/** 四档尺寸各自独立绑定，点击能立即看到反馈 */
const numberSizes = ref<(number | null)[]>([3, 3, 3, 3])

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
    <SrPanel>
      <h2 class="panel__title">基础用法</h2>
      <p class="panel__desc">
        v-model 双向绑定，尺寸默认继承全局配置（未配置时为 md）。右下角实时显示绑定值。
      </p>

      <div style="display: grid; gap: 12px; max-width: 420px">
        <sr-input v-model="basic" placeholder="请输入内容" clearable />
        <code style="font-size: 12px; color: var(--sr-color-text-secondary)"> v-model = "{{ basic }}" </code>
      </div>
    </SrPanel>

    <SrPanel>
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
    </SrPanel>

    <SrPanel>
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
    </SrPanel>

    <SrPanel>
      <h2 class="panel__title">清空与密码</h2>
      <p class="panel__desc">
        清空按钮点击后自动回焦；密码切换会保留光标位置。这两个按钮
        <code style="font-family: var(--sr-font-family-mono)">tabindex="-1"</code>，不打断键盘输入流。
      </p>

      <div style="display: grid; gap: 12px; max-width: 420px">
        <sr-input v-model="basic" placeholder="有值时出现清空按钮" clearable />
        <sr-input v-model="password" type="password" show-password placeholder="请输入密码" />
      </div>
    </SrPanel>

    <SrPanel>
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
    </SrPanel>

    <SrPanel>
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
    </SrPanel>

    <SrPanel>
      <h2 class="panel__title">禁用与只读</h2>
      <p class="panel__desc">禁用态整体降低对比度并禁止交互；只读态保留文本可选中复制。</p>

      <div style="display: grid; gap: 12px; max-width: 420px">
        <sr-input model-value="禁用状态" disabled />
        <sr-input model-value="只读状态，可以选中复制" readonly />
      </div>
    </SrPanel>

    <SrPanel>
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
    </SrPanel>

    <SrPanel>
      <h2 class="panel__title">数字输入</h2>
      <p class="panel__desc">
        <code style="font-family: var(--sr-font-family-mono)">SrInputNumber</code>
        复用输入框的尺寸、固定圆角与校验态，额外提供步进按钮、上下方向键、边界钳制和小数精度。
        输入过程中的「1.」「-」这类中间态不会被格式化打断，失焦时才规范化。
      </p>

      <div style="display: grid; gap: 16px; max-width: 420px">
        <div>
          <div style="font-size: 12px; color: var(--sr-color-text-secondary); margin-bottom: 6px">
            基础用法（点击右侧按钮或按 ↑ / ↓）
          </div>
          <sr-input-number v-model="numberBasic" />
          <code style="font-size: 12px; color: var(--sr-color-text-secondary)">
            v-model = {{ numberBasic }}
          </code>
        </div>

        <div>
          <div style="font-size: 12px; color: var(--sr-color-text-secondary); margin-bottom: 6px">
            小数精度：step = 0.1，显式 precision = 2
          </div>
          <sr-input-number v-model="numberPrice" :step="0.1" :precision="2" />
          <code style="font-size: 12px; color: var(--sr-color-text-secondary)">
            v-model = {{ numberPrice }}
          </code>
        </div>

        <div>
          <div style="font-size: 12px; color: var(--sr-color-text-secondary); margin-bottom: 6px">
            边界 0 ~ 10：到边界时按钮自动禁用，手动输入越界值失焦后钳回
          </div>
          <sr-input-number v-model="numberRange" :min="0" :max="10" />
        </div>

        <div>
          <div style="font-size: 12px; color: var(--sr-color-text-secondary); margin-bottom: 6px">
            controlsPosition = "both"（两侧分列）
          </div>
          <sr-input-number v-model="numberBoth" controls-position="both" :step="2" />
        </div>

        <div>
          <div style="font-size: 12px; color: var(--sr-color-text-secondary); margin-bottom: 6px">
            四档尺寸，圆角固定不随尺寸变化
          </div>
          <div style="display: grid; gap: 8px">
            <sr-input-number
              v-for="(size, index) in sizes"
              :key="size"
              v-model="numberSizes[index]"
              :size="size"
            />
          </div>
        </div>

        <div>
          <div style="font-size: 12px; color: var(--sr-color-text-secondary); margin-bottom: 6px">
            隐藏步进按钮 / 禁用 / 只读
          </div>
          <div style="display: grid; gap: 8px">
            <sr-input-number v-model="numberPlain" :controls="false" placeholder="纯数字输入" />
            <sr-input-number :model-value="6" disabled />
            <sr-input-number :model-value="6" readonly />
          </div>
        </div>
      </div>
    </SrPanel>
    <SrPanel>
      <h2 class="panel__title">表单校验</h2>
      <p class="panel__desc">
        规则分「失焦」与「输入」两种时机；一旦出现错误会转为实时校验，改对即消失。 错误文案通过
        <code style="font-family: var(--sr-font-family-mono)">aria-describedby</code>
        与控件关联，控件的边框与
        <code style="font-family: var(--sr-font-family-mono)">aria-invalid</code> 由表单项自动下发。
      </p>

      <h2 class="panel__title" style="margin-top: 24px">标签布局</h2>
      <p class="panel__desc">
        <code style="font-family: var(--sr-font-family-mono)">labelPosition</code> 支持
        top（默认）、left、right 三种，left/right 走两列网格，可用
        <code style="font-family: var(--sr-font-family-mono)">labelWidth</code> 统一宽度。
      </p>

      <div class="layout-grid">
        <div v-for="pos in ['top', 'left', 'right']" :key="pos">
          <p class="layout-label">labelPosition = {{ pos }}</p>
          <sr-form :model="{ name: '林深' }" :label-position="pos as 'top'" :label-width="54">
            <sr-form-item prop="name" label="名称">
              <sr-input />
            </sr-form-item>
          </sr-form>
        </div>
      </div>

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
    </SrPanel>
  </div>

  <SrPanel>
    <h2 class="panel__title">表单组件 Props 速查</h2>
    <p class="panel__desc">
      本页三个输入类组件的全部 props。尺寸不传时继承
      <code style="font-family: var(--sr-font-family-mono)">SrConfigProvider</code> 的全局配置；
      校验态不传时跟随所在 <code style="font-family: var(--sr-font-family-mono)">SrFormItem</code>。
    </p>

    <h3 style="font-size: 14px; margin: 18px 0 8px">SrInput</h3>
    <table class="props-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>类型</th>
          <th>默认</th>
          <th>说明</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>modelValue</code></td>
          <td><code>string | number</code></td>
          <td><code>''</code></td>
          <td>绑定值，v-model</td>
        </tr>
        <tr>
          <td><code>type</code></td>
          <td><code>string</code></td>
          <td><code>'text'</code></td>
          <td>原生类型；<code>textarea</code> 走多行分支</td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>SrSize | 断点对象</code></td>
          <td>继承配置</td>
          <td>xs / sm / md / lg，支持按断点分档</td>
        </tr>
        <tr>
          <td><code>placeholder</code></td>
          <td><code>string</code></td>
          <td><code>''</code></td>
          <td>占位文案</td>
        </tr>
        <tr>
          <td><code>disabled</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>禁用</td>
        </tr>
        <tr>
          <td><code>readonly</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>只读，可选中复制</td>
        </tr>
        <tr>
          <td><code>clearable</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>有值时显示清空按钮</td>
        </tr>
        <tr>
          <td><code>showPassword</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td><code>type="password"</code> 时显示明文切换</td>
        </tr>
        <tr>
          <td><code>maxlength</code></td>
          <td><code>number</code></td>
          <td>—</td>
          <td>最大长度，配合字数统计</td>
        </tr>
        <tr>
          <td><code>showCount</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>显示字数统计</td>
        </tr>
        <tr>
          <td><code>status</code></td>
          <td><code>default | error | warning | success</code></td>
          <td><code>'default'</code></td>
          <td>校验态，影响边框与图标颜色</td>
        </tr>
        <tr>
          <td><code>rows</code></td>
          <td><code>number</code></td>
          <td><code>3</code></td>
          <td>textarea 行数</td>
        </tr>
        <tr>
          <td><code>autosize</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>textarea 高度随内容自适应</td>
        </tr>
      </tbody>
    </table>
    <p class="panel__desc" style="margin: 10px 0 0">
      事件：<code>update:modelValue</code> / <code>change</code> / <code>focus</code> / <code>blur</code> /
      <code>clear</code> / <code>enter</code>；插槽：<code>prefix</code> / <code>suffix</code>。
    </p>

    <h3 style="font-size: 14px; margin: 22px 0 8px">SrSelect</h3>
    <table class="props-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>类型</th>
          <th>默认</th>
          <th>说明</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>modelValue</code></td>
          <td><code>string | number | array</code></td>
          <td>—</td>
          <td>绑定值，多选时为数组</td>
        </tr>
        <tr>
          <td><code>options</code></td>
          <td><code>SrSelectOption[]</code></td>
          <td><code>[]</code></td>
          <td>选项，可带 <code>disabled</code></td>
        </tr>
        <tr>
          <td><code>multiple</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>多选，面板不自动关闭</td>
        </tr>
        <tr>
          <td><code>filterable</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>显示搜索框</td>
        </tr>
        <tr>
          <td><code>clearable</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>可清空</td>
        </tr>
        <tr>
          <td><code>disabled</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>禁用</td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>SrSize</code></td>
          <td>继承配置</td>
          <td>xs / sm / md / lg</td>
        </tr>
        <tr>
          <td><code>status</code></td>
          <td><code>default | error | warning | success</code></td>
          <td><code>'default'</code></td>
          <td>校验态</td>
        </tr>
        <tr>
          <td><code>placeholder</code></td>
          <td><code>string</code></td>
          <td><code>'请选择'</code></td>
          <td>占位文案</td>
        </tr>
        <tr>
          <td><code>emptyText</code></td>
          <td><code>string</code></td>
          <td>内置</td>
          <td>无匹配项时的文案</td>
        </tr>
        <tr>
          <td><code>maxHeight</code></td>
          <td><code>number</code></td>
          <td><code>260</code></td>
          <td>下拉面板最大高度（px）</td>
        </tr>
      </tbody>
    </table>

    <h3 style="font-size: 14px; margin: 22px 0 8px">
      SrInputNumber
      <em style="font-style: normal; font-size: 12px; color: var(--sr-color-primary)">本轮新增</em>
    </h3>
    <table class="props-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>类型</th>
          <th>默认</th>
          <th>说明</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>modelValue</code></td>
          <td><code>number | null</code></td>
          <td><code>null</code></td>
          <td>绑定值，空值为 null</td>
        </tr>
        <tr>
          <td><code>min</code></td>
          <td><code>number</code></td>
          <td><code>-Infinity</code></td>
          <td>最小值，到达时减按钮禁用</td>
        </tr>
        <tr>
          <td><code>max</code></td>
          <td><code>number</code></td>
          <td><code>Infinity</code></td>
          <td>最大值，到达时加按钮禁用</td>
        </tr>
        <tr>
          <td><code>step</code></td>
          <td><code>number</code></td>
          <td><code>1</code></td>
          <td>每次步进的增量</td>
        </tr>
        <tr>
          <td><code>precision</code></td>
          <td><code>number</code></td>
          <td>由 step 推导</td>
          <td>小数位，抹平浮点误差</td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td><code>SrSize | 断点对象</code></td>
          <td>继承配置</td>
          <td>与 SrInput 完全对齐</td>
        </tr>
        <tr>
          <td><code>placeholder</code></td>
          <td><code>string</code></td>
          <td><code>''</code></td>
          <td>占位文案</td>
        </tr>
        <tr>
          <td><code>disabled</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>禁用，隐藏步进按钮</td>
        </tr>
        <tr>
          <td><code>readonly</code></td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
          <td>只读，步进按钮禁用</td>
        </tr>
        <tr>
          <td><code>controls</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>是否显示步进按钮</td>
        </tr>
        <tr>
          <td><code>controlsPosition</code></td>
          <td><code>'right' | 'both'</code></td>
          <td><code>'right'</code></td>
          <td>右侧竖排或两侧分列</td>
        </tr>
        <tr>
          <td><code>status</code></td>
          <td><code>default | error | warning | success</code></td>
          <td><code>'default'</code></td>
          <td>校验态，复用输入框边框</td>
        </tr>
      </tbody>
    </table>
    <p class="panel__desc" style="margin: 10px 0 0">
      事件：<code>update:modelValue</code> / <code>change</code> / <code>focus</code> / <code>blur</code> /
      <code>step(value, type)</code>；键盘：↑ / ↓ 步进，Enter 立即规范化，失焦自动钳制到边界。
    </p>
  </SrPanel>
</template>

<style scoped>
.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.layout-label {
  margin: 0 0 8px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
</style>
