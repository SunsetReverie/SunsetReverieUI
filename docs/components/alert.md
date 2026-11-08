# SrAlert 警告提示

在页面里静态展示一条提示，比 `SrToast` 更「常驻」——它不自动消失，占着版面，用来提醒用户注意当前页面的状况。

<script setup>
import { ref } from 'vue'

const closed = ref(false)
const showAgain = ref(false)
</script>

## 交互演示

<div class="sr-demo is-block">
  <div style="display: flex; flex-direction: column; gap: 10px">
    <SrAlert type="info" title="通用提示" description="这里是一段说明文字，用来解释发生了什么。" />
    <SrAlert type="success" title="操作成功" description="配置已保存，下次构建时生效。" />
    <SrAlert type="warning" title="需要注意" description="当前使用的是默认密钥，建议尽快替换。" />
    <SrAlert type="error" title="出错了" description="请求超时，请检查网络后重试。" />
  </div>
</div>

## 四种类型

| `type` | 用途 |
| --- | --- |
| `info`（默认） | 中性提示、补充说明 |
| `success` | 操作完成 |
| `warning` | 有风险但没出错 |
| `error` | 失败、不可继续 |

图标与配色自动对应，不需要自己传。

## 只有描述

不传 `title` 时只有一行文字，更紧凑：

```vue
<SrAlert description="保存成功。" />
<SrAlert type="warning" description="还有 3 个文件没提交。" />
```

<div class="sr-demo is-block">
  <div style="display: flex; flex-direction: column; gap: 10px">
    <SrAlert description="单行提示，不带标题。" />
    <SrAlert type="success" description="保存成功。" />
  </div>
</div>

## 可关闭

```vue
<SrAlert type="warning" title="可以关掉" description="点右边的 ×" closable @close="onClose" />
```

<div class="sr-demo is-block">
  <div style="display: flex; flex-direction: column; gap: 10px">
    <SrAlert v-if="!closed" type="warning" title="点右侧的 × 试试" description="关掉之后不会再出现" closable @close="closed = true" />
    <SrButton v-else size="sm" variant="outline" @click="closed = false">恢复</SrButton>
  </div>
</div>

组件关闭后自己会隐藏，但**不会恢复**——想让它重新出现得靠 `v-if` 或 `v-show` 控制，因为「关闭」是用户意图，不该被内部状态悄悄推翻。

## 通栏

`banner` 去掉左右边框和圆角，贴住容器边缘：

<div class="sr-demo is-block" style="padding: 0; overflow: hidden">
  <SrAlert type="warning" banner description="通栏模式适合放在页面或卡片顶部横贯一条。" />
</div>

最典型的用法是表单页顶部：

```vue
<div class="card">
  <SrAlert type="warning" banner description="有 2 个必填项还没填" />
  <div class="body"><!-- 表单 --></div>
</div>
```

## 居中

`center` 让图标与文字水平居中，适合放在空状态或结果页上方：

<div class="sr-demo is-block">
  <SrAlert type="info" center title="暂无数据" description="调整筛选条件后再试一次。" />
</div>

## 隐藏图标

```vue
<SrAlert :show-icon="false" title="没有图标" description="极简风格。" />
```

<div class="sr-demo is-block">
  <SrAlert :show-icon="false" title="没有图标" description="只剩文字，适合信息密度高的地方。" />
</div>

## 富内容

默认插槽替换 `description`，可以放列表、链接、按钮组：

```vue
<SrAlert type="error" title="提交失败">
  <p>服务端返回了 3 个字段错误：</p>
  <ul>
    <li>邮箱格式不正确</li>
    <li>手机号已被占用</li>
  </ul>
</SrAlert>
```

<div class="sr-demo is-block">
  <SrAlert type="error" title="提交失败">
    <p style="margin: 0">服务端返回了 2 个字段错误：</p>
    <ul style="margin: 6px 0 0; padding-left: 18px">
      <li>邮箱格式不正确</li>
      <li>手机号已被占用</li>
    </ul>
  </SrAlert>
</div>

`#title` 插槽可以放标签之类的内容：

<div class="sr-demo is-block">
  <SrAlert type="success">
    <template #title>
      部署成功
      <SrTag type="success" size="sm" style="margin-left: 6px">v1.2.0</SrTag>
    </template>
    <span>用时 42 秒</span>
  </SrAlert>
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | 类型，决定图标与配色 |
| `title` | `string` | `''` | 标题 |
| `description` | `string` | `''` | 描述文案，可用默认插槽替代 |
| `showIcon` | `boolean` | `true` | 显示图标 |
| `closable` | `boolean` | `false` | 显示关闭按钮 |
| `banner` | `boolean` | `false` | 通栏样式 |
| `center` | `boolean` | `false` | 内容居中 |

## 事件

| 事件 | 说明 |
| --- | --- |
| `close` | 点了关闭按钮（此时组件已隐藏） |

## 插槽

| 名称 | 说明 |
| --- | --- |
| `default` | 描述内容，替换 `description` |
| `title` | 标题内容，替换 `title` |

## 注意事项

- **`close` 之后组件自己隐藏但不复位**。要重新展示，用 `v-if` 控制并重置状态。
- **这是静态提示，不是通知**。需要「弹出后自动消失」用 `SrToast`；需要「右上角浮层带标题和操作」用 `SrNotification`。
- **`banner` 需要容器裁切**。它去掉了左右圆角，如果要保持整体圆角，给外层加 `overflow: hidden`。
- **暗色下背景会自动加深**（8% → 16% 语义色），否则深底上几乎看不出色块。
