# SrToast 轻提示

从屏幕边缘滑入的短提示，几秒后自动消失。**命令式调用**，不需要在模板里写组件。

<script setup>
import { srToast } from '@sunset-reverie/ui'
</script>

```ts
import { srToast } from '@sunset-reverie/ui'

srToast.success('保存成功')
```

## 四种类型

<div class="sr-demo">
  <SrButton size="sm" variant="outline" @click="srToast.info('这是一条提示')">info</SrButton>
  <SrButton size="sm" variant="outline" @click="srToast.success('保存成功')">success</SrButton>
  <SrButton size="sm" variant="outline" @click="srToast.warning('存储空间不足')">warning</SrButton>
  <SrButton size="sm" variant="outline" @click="srToast.error('请求失败，请重试')">error</SrButton>
</div>

四个方法都是 `srToast(type, options)` 的语法糖，等价于 `srToast(msg, { type: 'success' })`。

## 位置

`position` 六选一：`top`（默认）、`top-left`、`top-right`、`bottom`、`bottom-left`、`bottom-right`。

<div class="sr-demo">
  <SrButton size="sm" variant="outline" @click="srToast('右上角', { position: 'top-right' })">top-right</SrButton>
  <SrButton size="sm" variant="outline" @click="srToast('底部居中', { position: 'bottom' })">bottom</SrButton>
  <SrButton size="sm" variant="outline" @click="srToast('左下角', { position: 'bottom-left' })">bottom-left</SrButton>
</div>

同一位置的多条提示会纵向堆叠，超过 5 条时最旧的自动移除。

## 时长与关闭

<div class="sr-demo">
  <SrButton size="sm" variant="outline" @click="srToast('10 秒后才消失', { duration: 10000 })">长停留</SrButton>
  <SrButton size="sm" variant="outline" @click="srToast('不会自动消失', { duration: 0, closable: true })">手动关闭</SrButton>
  <SrButton size="sm" variant="outline" @click="srToast.closeAll()">全部关闭</SrButton>
</div>

- `duration: 0` 表示不自动关闭，此时建议同时开 `closable`
- `closable: true` 在右侧显示关闭按钮
- `close(id)` 关闭指定的一条，`closeAll()` 清空

## 返回值

每次调用返回一个数字 id，可用于精确关闭：

```ts
const id = srToast('处理中…', { duration: 0 })
await doSomething()
srToast.close(id)
```

## API

### 调用形式

```ts
srToast(message: string, options?: SrToastOptions): number
srToast.info / success / warning / error(message, options?): number
srToast.close(id: number): void
srToast.closeAll(): void
```

### SrToastOptions

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | 类型 |
| `duration` | `number` | `3000` | 停留毫秒，0 表示不自动关闭 |
| `position` | `'top' \| 'top-left' \| 'top-right' \| 'bottom' \| 'bottom-left' \| 'bottom-right'` | `'top'` | 出现位置 |
| `closable` | `boolean` | `false` | 显示关闭按钮 |
| `backgroundColor` | `string` | — | 自定义背景色，覆盖预设的玻璃底 |

## 注意事项

- **必须在客户端调用**。SSR 环境下没有 `document`，容器挂不上；如果在 `setup` 顶层调用会失效，放到事件回调或 `onMounted` 里。
- 容器是首次调用时才挂载的，模块顶层不碰 DOM——所以 import 本身是 SSR 安全的。
- 同一位置最多同时存在 5 条，超出时先进的被移除。
- Toast 适合「操作结果的即时反馈」，需要用户确认的用 `SrConfirm`，需要带标题与详情的用 `Notification`。
