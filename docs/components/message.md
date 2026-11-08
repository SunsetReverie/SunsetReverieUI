# SrMessage 全局消息

顶部居中出现的轻量提示。比 `SrToast` 更安静、停留更短，用于不需要打断操作的反馈。

<script setup>
import { srMessage } from '@sunset-reverie/ui'
</script>

## 交互演示

<div class="sr-demo">
  <SrButton size="sm" variant="outline" @click="srMessage('这是一条消息')">info</SrButton>
  <SrButton size="sm" variant="outline" @click="srMessage.success('操作成功')">success</SrButton>
  <SrButton size="sm" variant="outline" @click="srMessage.warning('请先选择数据')">warning</SrButton>
  <SrButton size="sm" variant="outline" @click="srMessage.error('保存失败')">error</SrButton>
</div>

## 基础用法

```ts
import { srMessage } from '@sunset-reverie/ui'

srMessage('已保存')
srMessage.success('创建成功')
srMessage.error('网络异常', { duration: 5000 })
```

不用在模板里放任何容器——**首次调用时才创建宿主节点并挂载 Vue 应用**，所以模块顶层不会碰到 `document`，SSR 环境下 import 它是安全的。

## 四种类型

| 类型 | 用途 |
| --- | --- |
| `info`（默认） | 中性提示 |
| `success` | 操作完成 |
| `warning` | 操作被阻止，但不算错误 |
| `error` | 失败 |

`srMessage()` 和 `srMessage.info()` 等价。

## 时长

默认 2000ms。`duration: 0` 表示不自动关闭：

<div class="sr-demo">
  <SrButton size="sm" variant="outline" @click="srMessage('5 秒后消失', { duration: 5000 })">长停留</SrButton>
  <SrButton size="sm" variant="outline" @click="srMessage('不会自动消失', { duration: 0 })">不自动关闭</SrButton>
  <SrButton size="sm" variant="outline" @click="srMessage.closeAll()">全部关闭</SrButton>
</div>

**`duration: 0` 要慎用**：Message 没有关闭按钮，弹出去就收不回来，只能靠 `close(id)` 或 `closeAll()`。用户会被那条消息一直挡着视线。

## 手动关闭

每次调用返回一个 `id`：

```ts
const id = srMessage('正在上传…', { duration: 0 })

// 上传完成后替换掉它
srMessage.close(id)
srMessage.success('上传完成')
```

批量清理：

```ts
srMessage.closeAll()
```

这个模式适合「先弹一条进度提示，操作结束后主动收起」——比让它自己超时更准确。

<div class="sr-demo">
  <SrButton size="sm" variant="outline" @click="srMessage.warning('这条会在 6 秒后自动关闭', { duration: 6000 })">演示替换</SrButton>
</div>

## 数量上限

同时最多 **3 条**。超过时**顶掉最早的一条**，不是拒绝新的：

```ts
srMessage('第一条')
srMessage('第二条')
srMessage('第三条')
srMessage('第四条')   // 第一条被自动关掉
```

3 条这个数字比 Toast（5 条）小，因为居中的消息叠多了会直接糊住页面主体。

## 自定义配色

三个颜色可以单独控制：

```ts
srMessage('浅色底', { backgroundColor: '#fdf2e9' })
srMessage('深色底', { backgroundColor: '#1f2937', color: '#f1f5f9', iconColor: '#60a5fa' })
```

<div class="sr-demo">
  <SrButton size="sm" variant="outline" @click="srMessage('浅色底的消息', { backgroundColor: '#fdf2e9' })">浅色底</SrButton>
  <SrButton
    size="sm"
    variant="outline"
    @click="srMessage('深色底要配浅色文字', { backgroundColor: '#1f2937', color: '#f1f5f9', iconColor: '#60a5fa' })"
  >深色底 + 浅色文字</SrButton>
</div>

| 选项 | 作用 | 不传时 |
| --- | --- | --- |
| `backgroundColor` | 背景色 | 预设的玻璃底 |
| `color` | 文字颜色 | `--sr-color-text`（深色） |
| `iconColor` | 图标颜色 | 跟随消息类型的主色 |

**深色背景必须同时传 `color`**。文字色不会自动跟随背景——只传 `backgroundColor: '#1c2027'` 的话，背景和文字都是深色，结果完全看不见：

```
背景 rgb(28, 32, 39)
文字 rgb(28, 32, 39)      ← 同色，不可见
```

`iconColor` 是独立的，不传时仍用类型自带的蓝 / 绿 / 黄 / 红。

常规提示直接用 `type` 的配色就够了，自定义三个颜色的场景主要是「让消息穿上品牌色」。

## 三种提示怎么选

| | `SrMessage` | `SrToast` | `SrNotification` |
| --- | --- | --- | --- |
| 位置 | 固定顶部居中 | 六处可选 | 右上角 |
| 默认时长 | 2000ms | 3000ms | 4500ms |
| 关闭按钮 | 无 | 可选 | 有 |
| 内容 | 一行文字 | 一行文字 | 标题 + 正文 + 操作 |
| 数量上限 | 3 | 5 | 5 |
| 场景 | 顺手告诉一声 | 需要注意到 | 需要处理 |

一句话区分：

- **Message**：操作成功了，闪一下就行
- **Toast**：要注意一下，但不用动手
- **Notification**：有内容要看，可能还要点一下

## API

### 调用形式

```ts
srMessage(content: string, options?: SrMessageOptions): number
srMessage.info / success / warning / error(content, options?): number
srMessage.close(id: number): void
srMessage.closeAll(): void
```

返回的 `number` 是这条消息的 id。

### SrMessageOptions

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | 类型 |
| `duration` | `number` | `2000` | 停留毫秒，`0` 表示不自动关闭 |
| `backgroundColor` | `string` | — | 自定义背景色，覆盖预设玻璃底 |
| `color` | `string` | — | 自定义文字颜色，深色背景下必须传 |
| `iconColor` | `string` | — | 自定义图标颜色，不传跟随类型主色 |

## 注意事项

- **位置固定为顶部居中**，没有 `position` 选项。这是刻意的：Message 的定位是「不占用户注意力」，允许出现在任何角落会削弱这一点。
- **没有关闭按钮**。所以 `duration: 0` 要配合 `close(id)` 使用，否则消息会一直挂着。
- **必须在客户端调用**（事件回调、`onMounted`、定时器里）。SSR 阶段调用是空操作，不会报错但也不会有反应。
- **不需要在每个组件里放容器**。宿主节点由库自己管理，`document.body` 里只会有一个。
- **深色背景要成对传 `color`。** 只改背景不改文字，两者会变成同一个颜色、完全看不见。`iconColor` 可以单独给，也可以不传（保留类型色）。
- **不要用它做长文案**。一行之外的文字会被截断，需要多行用 `SrNotification`。
- **连续触发会被顶掉**。批量操作时如果每条都弹消息，前面的会被后面的挤掉，用户可能什么都看不清——这种情况应该合并成一条「已处理 12 项」。
