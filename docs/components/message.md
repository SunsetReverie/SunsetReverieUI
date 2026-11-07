# SrMessage 全局消息

顶部居中出现的轻量提示。比 `SrToast` 更安静、停留更短，用于不需要打断操作的反馈。

<script setup>
import { srMessage } from '@sunset-reverie/ui'
</script>

```ts
import { srMessage } from '@sunset-reverie/ui'

srMessage.success('操作成功')
```

## 四种类型

<div class="sr-demo">
  <SrButton size="sm" variant="outline" @click="srMessage('这是一条消息')">info</SrButton>
  <SrButton size="sm" variant="outline" @click="srMessage.success('操作成功')">success</SrButton>
  <SrButton size="sm" variant="outline" @click="srMessage.warning('请先选择数据')">warning</SrButton>
  <SrButton size="sm" variant="outline" @click="srMessage.error('保存失败')">error</SrButton>
</div>

## 与 Toast 的区别

| | `SrMessage` | `SrToast` |
| --- | --- | --- |
| 位置 | 固定顶部居中 | 六个位置可选 |
| 默认时长 | 2000ms | 3000ms |
| 视觉 | 更轻，无关闭按钮 | 可带关闭按钮 |
| 场景 | 即时反馈、不打断 | 需要用户注意到 |

简单说：**Message 是「顺手告诉用户一声」，Toast 是「请用户注意到」**。

## 时长

<div class="sr-demo">
  <SrButton size="sm" variant="outline" @click="srMessage('5 秒后消失', { duration: 5000 })">长停留</SrButton>
  <SrButton size="sm" variant="outline" @click="srMessage('不会自动消失', { duration: 0 })">不自动关闭</SrButton>
  <SrButton size="sm" variant="outline" @click="srMessage.closeAll()">全部关闭</SrButton>
</div>

`duration: 0` 不自动关闭。Message 没有关闭按钮，只能靠 `close(id)` / `closeAll()` 或用例自己再弹一条替换。

## API

### 调用形式

```ts
srMessage(content: string, options?: SrMessageOptions): number
srMessage.info / success / warning / error(content, options?): number
srMessage.close(id: number): void
srMessage.closeAll(): void
```

### SrMessageOptions

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | 类型 |
| `duration` | `number` | `2000` | 停留毫秒，0 表示不自动关闭 |
| `backgroundColor` | `string` | — | 自定义背景色 |

## 注意事项

- **位置固定为顶部居中**，没有 `position` 选项。这是刻意的：Message 的定位就是「不占用户注意力」，允许它出现在任何角落会削弱这一点。
- 顶部堆叠上限比 Toast 小（5 条），因为居中的消息叠多了会挡住页面主体。
- 和 Toast 一样，必须在客户端调用（事件回调或 `onMounted` 里），SSR 阶段调用无效。
- 只在页面最外层调用一次即可，不需要在每个组件里写容器。
