# SrNotification 通知

带标题与详情的卡片式通知，从屏幕角落滑入。适合承载**有信息量**的提醒，而不是一句话的状态反馈。

<script setup>
import { srNotification } from '@sunset-reverie/ui'
</script>

```ts
import { srNotification } from '@sunset-reverie/ui'

srNotification.success({
  title: '部署完成',
  message: '构建产物已推送到生产环境',
})
```

## 基础用法

<div class="sr-demo">
  <SrButton
    size="sm"
    variant="outline"
    @click="srNotification.info({ title: '新版本可用', message: '内部预览版已就绪，包含 8 项改进' })"
  >
    info
  </SrButton>
  <SrButton
    size="sm"
    variant="outline"
    @click="srNotification.success({ title: '部署完成', message: '构建产物已推送到生产环境' })"
  >
    success
  </SrButton>
  <SrButton
    size="sm"
    variant="outline"
    @click="srNotification.warning({ title: '存储空间不足', message: '已使用 92%，请及时清理' })"
  >
    warning
  </SrButton>
  <SrButton
    size="sm"
    variant="outline"
    @click="srNotification.error({ title: '同步失败', message: '网络异常，请稍后重试' })"
  >
    error
  </SrButton>
</div>

注意参数形式：**第一个参数是对象**，不像 Toast / Message 那样先接一个字符串。因为通知的核心是标题 + 详情，用对象更自然。

## 位置

`position` 四选一：`top-right`（默认）、`top-left`、`bottom-right`、`bottom-left`。通知只出现在角落，不做居中。

<div class="sr-demo">
  <SrButton
    size="sm"
    variant="outline"
    @click="srNotification({ type: 'info', title: '左上角', message: 'position: top-left', position: 'top-left' })"
  >
    top-left
  </SrButton>
  <SrButton
    size="sm"
    variant="outline"
    @click="srNotification({ type: 'info', title: '右下角', message: 'position: bottom-right', position: 'bottom-right' })"
  >
    bottom-right
  </SrButton>
</div>

## 关闭

默认显示关闭按钮（`closable: true`），停留 4500ms：

<div class="sr-demo">
  <SrButton
    size="sm"
    variant="outline"
    @click="srNotification({ title: '常驻通知', message: '需要手动关闭', duration: 0 })"
  >
    duration = 0
  </SrButton>
  <SrButton
    size="sm"
    variant="outline"
    @click="srNotification({ title: '无关闭按钮', message: '只能等它自己消失', closable: false, duration: 5000 })"
  >
    隐藏关闭按钮
  </SrButton>
  <SrButton size="sm" variant="outline" @click="srNotification.closeAll()">全部关闭</SrButton>
</div>

## API

### 调用形式

```ts
srNotification(options: SrNotificationOptions): number
srNotification.open / info / success / warning / error(options): number
srNotification.close(id: number): void
srNotification.closeAll(): void
```

### SrNotificationOptions

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | 类型 |
| `title` | `string` | `''` | 标题 |
| `message` | `string` | `''` | 描述内容 |
| `duration` | `number` | `4500` | 停留毫秒，0 表示不自动关闭 |
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'top-right'` | 出现位置 |
| `closable` | `boolean` | `true` | 显示关闭按钮 |
| `backgroundColor` | `string` | — | 自定义背景色 |

## 注意事项

- **只有标题没详情时**，布局会自动收紧，不会留出空白行。
- 停留时间默认 4.5 秒，比 Toast（3 秒）长——因为通知有内容要读。
- 同时最多 5 条，超出时最早的被移除。
- 需要用户做决定（确认/取消）时不要用通知，用 `SrConfirm`；通知只做「告知」。
- 和另外两个一样，必须在客户端调用。
