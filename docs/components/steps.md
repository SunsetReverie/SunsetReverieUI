# SrSteps 步骤条

展示流程进行到哪一步。进度由 `current` 决定，其余状态自动推导。

<script setup>
import { ref } from 'vue'

const basicSteps = [
  { title: '填写信息', description: '基础资料' },
  { title: '上传材料', description: '身份证与照片' },
  { title: '等待审核', description: '1 个工作日' },
  { title: '完成', description: '可下载回执' },
]

const current = ref(1)
const clickableCurrent = ref(0)
const verticalCurrent = ref(2)
</script>

## 交互演示

<div class="sr-demo is-block">
  <SrSteps :items="basicSteps" :current="current" />
  <div style="display: flex; gap: 8px; margin-top: 14px">
    <SrButton size="sm" variant="outline" :disabled="current === 0" @click="current -= 1">上一步</SrButton>
    <SrButton size="sm" variant="primary" :disabled="current === 3" @click="current += 1">下一步</SrButton>
  </div>
</div>

## 状态怎么推导

传 `current` 就够了，不用逐项指定：

| 位置 | 状态 | 显示 |
| --- | --- | --- |
| `index < current` | 已完成 | 对勾 + 主色实心圆 |
| `index === current` | 进行中 | 序号 + 主色描边 |
| `index > current` | 未开始 | 序号 + 灰色 |

某一项想单独指定，在 `items` 里给它 `status`，会覆盖推导结果。

## 出错状态

当前步设成 `error`，后面的步骤停在未开始：

```vue
<SrSteps :items="steps" :current="2" status="error" />
```

<div class="sr-demo is-block">
  <SrSteps :items="basicSteps" :current="2" status="error" />
</div>

只有 `current` 那一步会变成红色叉号——出错的总是「当前正在做的那件事」。

## 单项指定状态

```vue
<SrSteps
  :items="[
    { title: '读取配置', status: 'finish' },
    { title: '连接数据库', status: 'error' },
    { title: '同步数据' },
  ]"
  :current="2"
/>
```

<div class="sr-demo is-block">
  <SrSteps
    :items="[
      { title: '读取配置', status: 'finish' },
      { title: '连接数据库', status: 'error' },
      { title: '同步数据' },
      { title: '清理临时文件' },
    ]"
    :current="2"
  />
</div>

上面第 1 步本该是「已完成」，被显式改成 error，用来表达「这一步曾经失败过」。

## 简洁模式

`simple` 去掉描述、缩小圆点：

<div class="sr-demo is-block">
  <SrSteps :items="basicSteps" :current="1" simple />
</div>

适合塞在卡片标题栏或工具栏里——那里空间只有一行。

## 可点击

`clickable` 让用户能跳回之前填过的步骤：

<div class="sr-demo is-block">
  <SrSteps :items="basicSteps" :current="clickableCurrent" clickable @change="clickableCurrent = $event" />
</div>

点当前步不会触发事件（没有意义），禁用的步骤也点不了。

## 标题位置

`labelPlacement="vertical"` 让标题与描述上下排列，和圆点同一行：

<div class="sr-demo is-block">
  <SrSteps :items="basicSteps" :current="1" label-placement="vertical" />
</div>

默认是 `horizontal`（标题在圆点下方），文案短时更省横向空间；文案长时用这个模式，标题不会被挤成两行。

## 纵向

<div class="sr-demo is-block">
  <SrSteps
    :items="[
      { title: '提交申请', description: '11-08 10:24 已提交' },
      { title: '初审通过', description: '11-08 14:02 由林深审批' },
      { title: '复审中', description: '预计今天完成' },
      { title: '放款', description: '待处理' },
    ]"
    :current="verticalCurrent"
    direction="vertical"
  />
</div>

适合描述较长，或者放在侧栏、抽屉里。

## 虚线连接线

`lineStyle="dashed"` 让未完成的部分显示为虚线：

<div class="sr-demo is-block">
  <SrSteps :items="basicSteps" :current="1" direction="vertical" line-style="dashed" />
</div>

已完成的连接线仍是实线主色，所以「走过」和「没走过」的区别更明显。

## 自定义图标

`items` 里传 `icon` 就替代序号 / 状态图标：

<div class="sr-demo is-block">
  <SrSteps
    :items="[
      { title: '购物车', icon: 'lucide:box' },
      { title: '地址', description: '已填写' },
      { title: '支付', description: '等待付款' },
    ]"
    :current="1"
  />
</div>

注意：传了 `icon` 之后**不会**在完成时自动变成对勾，图标是固定的。

## 尺寸

<div class="sr-demo is-block">
  <div style="display: flex; flex-direction: column; gap: 18px">
    <SrSteps :items="basicSteps.slice(0, 3)" :current="1" size="small" />
    <SrSteps :items="basicSteps.slice(0, 3)" :current="1" />
    <SrSteps :items="basicSteps.slice(0, 3)" :current="1" size="large" />
  </div>
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `SrStepItem[]` | `[]` | 步骤数据 |
| `current` | `number` | `0` | 当前第几步（从 0 开始） |
| `status` | `'process' \| 'error'` | `'process'` | 当前步的状态 |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 方向 |
| `labelPlacement` | `'horizontal' \| 'vertical'` | `'horizontal'` | 标题与描述的位置 |
| `simple` | `boolean` | `false` | 简洁模式 |
| `clickable` | `boolean` | `false` | 允许点击切换 |
| `lineStyle` | `'solid' \| 'dashed'` | `'solid'` | 连接线样式 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |

### SrStepItem

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 标题 |
| `description` | `string` | 描述 |
| `icon` | `string` | 自定义图标，传了就不再显示序号 |
| `status` | `SrStepStatus` | 覆盖该项的状态 |
| `disabled` | `boolean` | 禁用，不可点击 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | `index` | 点击某一步（需 `clickable`） |

## 插槽

| 名称 | 参数 | 说明 |
| --- | --- | --- |
| `title` | `{ item, index, status }` | 自定义标题 |
| `description` | `{ item, index, status }` | 自定义描述 |

## 注意事项

- **`current` 从 0 开始**，不是 1。传 `4` 而只有 4 步时，全部都会是「已完成」。
- **`icon` 会覆盖状态图标**。传了图标的步骤，完成时不会变成对勾。
- **`simple` 会隐藏描述**，但 `items` 里的 `description` 不用删，切回来还在。
- **`clickable` 不改变 `current`**。组件是受控的，必须监听 `change` 自己更新，否则点了没反应。
- **横向步骤条在窄屏会挤**。超过 5 步建议改成纵向或简洁模式。
