# SrModal 弹窗

模态对话框，内置焦点陷阱、滚动锁定与嵌套层级管理。

<script setup>
import { ref } from 'vue'

const open = ref(false)
const wideOpen = ref(false)
const bareOpen = ref(false)
</script>

## 交互演示

<div class="sr-demo">
  <SrButton variant="primary" @click="open = true">打开弹窗</SrButton>
  <SrButton variant="outline" @click="wideOpen = true">宽弹窗</SrButton>
  <SrButton variant="text" @click="bareOpen = true">无遮罩</SrButton>
</div>

<SrModal v-model="open" title="基础弹窗" :width="440">
  点右上角关闭、按 Esc、点遮罩都能关掉。
</SrModal>

<SrModal v-model="wideOpen" title="宽弹窗" :width="720">
  内容多的时候用宽一点的尺寸，内部会自己处理滚动。
</SrModal>

<SrModal v-model="bareOpen" title="无遮罩" :show-mask="false" :width="400">
  不挡背景，适合不打断操作的场景。
</SrModal>

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
const open = ref(false)
</script>

<template>
  <sr-button @click="open = true">打开</sr-button>

  <sr-modal v-model="open" title="标题" :width="440">
    弹窗主体内容
  </sr-modal>
</template>
```

## 操作区

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrModal } from '@sunset-reverie/ui'

const open = ref(false)

/** 保存并关闭；真实项目里这里换成接口请求 */
function save(): void {
  open.value = false
}
</script>

<template>
  <SrButton variant="primary" @click="open = true">编辑配置</SrButton>

  <SrModal v-model="open" title="编辑配置">
    表单内容

    <template #footer>
      <SrButton variant="text" @click="open = false">取消</SrButton>
      <SrButton variant="primary" @click="save">保存</SrButton>
    </template>
  </SrModal>
</template>
```

面板是三段式布局：头部与底部固定，只有主体区域滚动。内容再长，关闭按钮和底部操作也始终可见。

## 关闭方式

| 方式 | 默认 | 关闭条件 |
| --- | --- | --- |
| 点击遮罩 | 开启 | `mask-closable` |
| 按 Esc | 开启 | `esc-to-close` |
| 右上角按钮 | 开启 | `closable` |
| `v-model` 置 false | — | 任意时刻 |

三种交互都会派发 `close` 事件并带上原因：`'mask' | 'esc' | 'close-button' | 'api'`。

## 焦点与滚动

打开时：

1. 页面滚动被锁定，且补偿滚动条宽度（避免内容横向跳动）
2. 焦点移入面板 —— 内容里有输入框就聚焦输入框，否则聚焦面板本身（不会落到关闭按钮上产生抢眼的焦点环）
3. Tab 键在面板内循环，不会跑到背景页面

关闭后焦点归还触发元素。

## 嵌套

```vue
<sr-modal v-model="outer">
  <sr-button @click="inner = true">打开内层</sr-button>

  <sr-modal v-model="inner" title="内层">
    Esc 只会关闭我
  </sr-modal>
</sr-modal>
```

弹层内部维护打开栈，只有最顶层响应 Esc；每层独立锁定滚动，按打开顺序依次解锁。

## 响应式

宽度小于 768px 时自动全屏（`border-radius: 0`，铺满视口）。

## API

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | 显示状态，支持 v-model |
| `title` | `string` | `''` | 标题，同时作为 `aria-labelledby` 来源 |
| `width` | `number \| string` | `480` | 数字按 px |
| `maskClosable` | `boolean` | `true` | 点击遮罩关闭 |
| `closable` | `boolean` | `true` | 显示关闭按钮 |
| `escToClose` | `boolean` | `true` | Esc 关闭 |
| `lockScroll` | `boolean` | `true` | 锁定页面滚动 |
| `centered` | `boolean` | `false` | 垂直居中（默认为距顶 10vh） |
| `showMask` | `boolean` | `true` | 是否渲染遮罩 |
| `teleportTo` | `string \| HTMLElement` | `'body'` | 挂载目标 |
| `zIndex` | `number` | 自动递增 | 同时打开多个时依次叠高 |

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `boolean` | v-model |
| `open` | — | 打开完成（DOM 已渲染、焦点已移入） |
| `close` | `SrModalCloseReason` | 请求关闭 |
| `afterClose` | — | 关闭完成（焦点已归还） |

| 插槽 | 说明 |
| --- | --- |
| `default` | 主体内容 |
| `header` | 自定义头部（覆盖 title） |
| `footer` | 操作区，存在时才渲染 |

## 无障碍

面板带 `role="dialog"`、`aria-modal="true"`，有 `title` 时自动关联 `aria-labelledby`。`$attrs` 落在**弹窗面板**上，不是遮罩层。

## 样式接入

```ts
import '@sunset-reverie/ui/components/modal/style.css'
```
