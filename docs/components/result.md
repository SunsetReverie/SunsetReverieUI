# SrResult 结果页

操作完成后的整页反馈：提交成功、支付失败、无权限。原来每个业务各写一遍图标 + 标题 + 按钮的竖排布局，抽出来统一。

<script setup>
import { ref } from 'vue'

const status = ref('success')
</script>

## 交互演示

<div class="sr-demo is-block">
  <div style="display: flex; gap: 8px; margin-bottom: 14px">
    <SrButton
      v-for="s in ['success', 'error', 'warning', 'info']"
      :key="s"
      size="xs"
      :variant="status === s ? 'primary' : 'outline'"
      @click="status = s"
    >{{ s }}</SrButton>
  </div>
  <SrResult
    :status="status"
    :title="status === 'success' ? '操作成功' : status === 'error' ? '操作失败' : status === 'warning' ? '需要确认' : '提示信息'"
    sub-title="切换按钮看图标与配色如何变化"
    compact
  />
</div>

## 四种状态

| `status` | 图标 | 用途 |
| --- | --- | --- |
| `success` | 对勾 | 提交成功、支付完成 |
| `error` | 叉号 | 失败、链接失效 |
| `warning` | 三角警告 | 待审核、待激活 |
| `info`（默认） | 问号 | 无权限、暂无数据 |

<div class="sr-demo is-block">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px">
    <SrResult status="success" title="提交成功" sub-title="1 个工作日内联系你" compact />
    <SrResult status="error" title="提交失败" sub-title="服务暂不可用" compact />
    <SrResult status="warning" title="等待审核" sub-title="通过后邮件通知" compact />
    <SrResult status="info" title="暂无权限" sub-title="联系管理员开通" compact />
  </div>
</div>

图标底色是**状态色的低透明度叠加**（12%，暗色下 18%），不是实心色块——实心圆会压住图标本身的笔画。

## 基础用法

```vue
<SrResult
  status="success"
  title="订单提交成功"
  sub-title="订单号 20261108001，预计 11 月 10 日送达"
>
  <template #extra>
    <SrButton variant="primary">查看订单</SrButton>
    <SrButton variant="outline">返回列表</SrButton>
  </template>
</SrResult>
```

<div class="sr-demo is-block">
  <SrResult status="success" title="订单提交成功" sub-title="订单号 20261108001，预计 11 月 10 日送达">
    <template #extra>
      <SrButton variant="primary">查看订单</SrButton>
      <SrButton variant="outline">返回列表</SrButton>
    </template>
  </SrResult>
</div>

不传 `compact` 时图标 72px、标题 20px，适合占满整页。

## 紧凑模式

`compact` 缩到 48px 图标，上下留白也减半：

<div class="sr-demo is-block">
  <div style="max-width: 380px; border: 1px solid var(--sr-color-border-subtle); border-radius: 8px">
    <SrResult status="error" title="删除失败" sub-title="该记录被其他数据引用" compact>
      <template #extra>
        <SrButton size="sm" variant="outline">取消</SrButton>
        <SrButton size="sm" variant="primary">查看引用</SrButton>
      </template>
    </SrResult>
  </div>
</div>

放在弹窗、抽屉、卡片里用这个，全尺寸会显得空。

## 额外信息

默认插槽会套一层浅底容器，适合放订单摘要、失败原因：

<div class="sr-demo is-block">
  <SrResult status="success" title="支付成功" sub-title="款项已到账">
    <div style="display: flex; flex-direction: column; gap: 8px">
      <div style="display: flex; gap: 12px"><span style="flex: 0 0 72px; color: var(--vp-c-text-3); font-size: 12px">订单号</span><span>20261108001</span></div>
      <div style="display: flex; gap: 12px"><span style="flex: 0 0 72px; color: var(--vp-c-text-3); font-size: 12px">金额</span><strong>¥ 12,800.00</strong></div>
      <div style="display: flex; gap: 12px"><span style="flex: 0 0 72px; color: var(--vp-c-text-3); font-size: 12px">时间</span><span>2026-11-08 14:32</span></div>
    </div>
  </SrResult>
</div>

## 自定义图标

`icon` 传图标名就替换掉状态图标，**颜色仍跟随 `status`**：

<div class="sr-demo is-block">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px">
    <SrResult icon="lucide:heart" status="success" title="收藏成功" compact />
    <SrResult icon="lucide:box" status="info" title="已发货" compact />
  </div>
</div>

想做插画或自定义图形，用 `#icon` 插槽：

```vue
<SrResult status="success" title="完成实名认证">
  <template #icon>
    <img src="/illustrations/verified.svg" alt="" />
  </template>
</SrResult>
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `status` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | 结果类型，决定图标与配色 |
| `title` | `string` | `''` | 主标题 |
| `subTitle` | `string` | `''` | 副标题 / 说明 |
| `icon` | `string` | `''` | 自定义图标名，覆盖状态图标 |
| `compact` | `boolean` | `false` | 紧凑模式 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| `icon` | 自定义图标区域（可放 SVG、插画） |
| `title` | 自定义标题 |
| `subTitle` | 自定义副标题 |
| `default` | 额外信息，自动套浅底容器 |
| `extra` | 操作区，按钮组 |

## 注意事项

- **没有 404 / 403 / 500 这类专用枚举**。用 `error` 或 `warning`，文案自己写——业务语义千差万别，枚举列不完。
- **`compact` 只改尺寸，不改结构**，切换不会丢内容。
- **`extra` 不传就不渲染**，所以「只展示不操作」的场景不会留一块空白。
- **容器带 `role="status"`**，读屏软件会朗读标题与说明。
- **整页使用时建议外面套一层最小高度**，否则在内容少的页面里会贴在顶上。
