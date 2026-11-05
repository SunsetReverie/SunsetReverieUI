<script setup lang="ts">
import { ref } from 'vue'

import { SrInput } from '@sunset-reverie/ui'

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
            <sr-icon name="mdi:magnify" :size="15" />
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
  </div>
</template>
