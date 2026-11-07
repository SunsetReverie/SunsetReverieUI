# SrConfirm 确认框

二次确认弹窗。**命令式调用 + Promise 化**，`await` 直接拿到用户的选择。

<script setup>
import { ref } from 'vue'
import { srConfirm } from '@sunset-reverie/ui'

const result = ref('')

async function askBasic() {
  const ok = await srConfirm({ title: '确认离开？', content: '未保存的修改会丢失' })
  result.value = ok ? '用户点了确认' : '用户取消了'
}

async function askDanger() {
  const ok = await srConfirm.danger({
    title: '删除这条记录？',
    content: '删除后不可恢复',
    onConfirm: () =>
      new Promise((resolve) => {
        // 模拟异步请求：确认按钮会进入 loading
        setTimeout(resolve, 900)
      }),
  })
  result.value = ok ? '已删除' : '已取消'
}
</script>

```ts
import { srConfirm } from '@sunset-reverie/ui'

const ok = await srConfirm({
  title: '删除这条记录？',
  content: '删除后不可恢复',
  type: 'danger',
})

if (ok) await api.delete(id)
```

## 基础用法

<div class="sr-demo is-column">
  <div style="display: flex; gap: 8px; flex-wrap: wrap">
    <SrButton size="sm" @click="askBasic">普通确认</SrButton>
    <SrButton size="sm" variant="danger" @click="askDanger">异步确认（带 loading）</SrButton>
  </div>
  <span style="font-size: 13px; color: var(--vp-c-text-3)">结果：{{ result || '—' }}</span>
</div>

## 三种类型

`type` 决定图标与确认按钮的样式：

<div class="sr-demo">
  <SrButton
    size="sm"
    variant="outline"
    @click="srConfirm({ type: 'primary', title: '提交表单？', content: '提交后仍可修改' })"
  >
    primary
  </SrButton>
  <SrButton
    size="sm"
    variant="outline"
    @click="srConfirm({ type: 'warning', title: '离开当前页面？', content: '未保存的内容会丢失' })"
  >
    warning
  </SrButton>
  <SrButton
    size="sm"
    variant="outline"
    @click="srConfirm({ type: 'danger', title: '永久删除？', content: '该操作不可撤销' })"
  >
    danger
  </SrButton>
</div>

三个快捷方法等价于手写 `type`：

```ts
srConfirm.primary({ title: '…' })
srConfirm.warning({ title: '…' })
srConfirm.danger({ title: '…' })
```

## 简写

只传一个字符串时，它作为 `title`，类型默认 `danger`：

```ts
const ok = await srConfirm('确定删除？')
```

适合极其简单的场景；有多行说明时还是用对象。

## 异步确认

`onConfirm` 返回 Promise 时，**确认按钮自动进入 loading**，Promise 完成才关闭并 resolve `true`：

```ts
const ok = await srConfirm.danger({
  title: '删除这条记录？',
  onConfirm: () => api.delete(id),   // 返回 Promise 即可
})
```

如果 Promise 抛错，弹窗**保持打开**，用户可以重试——这比直接关掉再弹一条错误提示要友好。

## API

### 调用形式

```ts
srConfirm(options | string): Promise<boolean>
srConfirm.open / primary / warning / danger(options | string): Promise<boolean>
```

返回 `Promise<boolean>`：确认 `true`、取消或点遮罩 `false`。

### SrConfirmOptions

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `'primary' \| 'warning' \| 'danger'` | `'danger'` | 类型，决定图标与确认按钮样式 |
| `title` | `string` | `''` | 标题 |
| `content` | `string` | `''` | 正文说明 |
| `confirmText` | `string` | `'确定'` | 确认按钮文案 |
| `cancelText` | `string` | `'取消'` | 取消按钮文案 |
| `showCancel` | `boolean` | `true` | 显示取消按钮 |
| `maskClosable` | `boolean` | `true` | 点遮罩是否关闭 |
| `width` | `number \| string` | `420` | 弹窗宽度 |
| `onConfirm` | `() => void \| Promise<void>` | — | 点击确认后的回调，返回 Promise 时自动 loading |

## 注意事项

- **不要用它做「仅告知」**。只有「需要用户决定」时才弹，否则用 Toast / Notification。
- `showCancel: false` 时只有一个确认按钮，此时 `maskClosable` 建议设为 `false`，避免用户点遮罩意外关闭后又不知道操作是否执行。
- `onConfirm` 抛错时弹窗不关闭，但**不会自动展示错误信息**，需要自己在 `onConfirm` 里 `srToast.error(...)`。
- SSR 环境下 `srConfirm()` 直接 resolve `false`，不会报错。
- 多个确认框可以同时存在（各自独立 Promise），但实际交互中建议避免——用户容易搞混在确认哪一件事。
