# SrDescriptions 描述列表

详情页的「字段名 / 值」成对排版。手写这个结构不难，但每加一个字段就要复制一遍标签和样式，用组件能省掉这些重复。

<script setup>
import { ref } from 'vue'

const basicItems = [
  { label: '姓名', value: '林深' },
  { label: '工号', value: 'SR-2026-018' },
  { label: '部门', value: '设计工程' },
  { label: '职级', value: 'P7' },
  { label: '入职时间', value: '2024-03-12' },
  { label: '状态', value: '在职' },
]

const column = ref(3)
const bordered = ref(false)

const spanItems = [
  { label: '订单号', value: '20261108001' },
  { label: '下单时间', value: '2026-11-08 14:32' },
  { label: '支付方式', value: '对公转账' },
  { label: '收货地址', value: '浙江省杭州市西湖区文三路 100 号 A 座 1801 室', span: 3 },
]
</script>

## 交互演示

<div class="sr-demo is-block">
  <div style="display: flex; gap: 8px; margin-bottom: 14px">
    <SrButton v-for="c in [1, 2, 3, 4]" :key="c" size="xs" :variant="column === c ? 'primary' : 'outline'" @click="column = c">{{ c }} 列</SrButton>
    <SrButton size="xs" :variant="bordered ? 'primary' : 'outline'" @click="bordered = !bordered">边框</SrButton>
  </div>
  <SrDescriptions :items="basicItems" :column="column" :border="bordered" />
</div>

## 基础用法

```vue
<SrDescriptions :items="[
  { label: '姓名', value: '林深' },
  { label: '工号', value: 'SR-2026-018' },
]" />
```

<div class="sr-demo is-block">
  <SrDescriptions :items="basicItems" />
</div>

字段名后面**自动跟一个全角冒号**（CSS 伪元素），不用在 `label` 里手写。

`value` 不传时显示 `—`，避免出现空白格。

## 列数

`column` 默认 3。窄屏会自动降级：992px 以下 2 列，768px 以下 1 列。

```vue
<SrDescriptions :items="items" :column="4" />
```

降级是 CSS media query 直接覆盖 `grid-template-columns` 实现的——因为 `column` 是内联样式，优先级最高，改 CSS 变量压不住它。

## 带边框

`border` 切换成表格观感，字段名有独立底色：

<div class="sr-demo is-block">
  <SrDescriptions :items="basicItems" :column="3" border />
</div>

信息密度高的后台详情页常用这个模式；普通展示页用无边框更轻。

## 跨列

长内容（地址、备注）给 `span`，避免挤在窄格里反复换行：

<div class="sr-demo is-block">
  <SrDescriptions :items="spanItems" :column="3" border />
</div>

`span` 超过 `column` 时会被夹到列数，不会顶出一行。

## 上下排

`direction="vertical"` 让字段名在上、值在下：

<div class="sr-demo is-block">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px">
    <SrDescriptions :items="basicItems.slice(0, 4)" :column="2" direction="vertical" />
    <SrDescriptions :items="basicItems.slice(0, 4)" :column="2" direction="vertical" border />
  </div>
</div>

值很长、或者列数少的时候比左右排更好读。

## 固定字段名宽度

`labelWidth` 让多行字段名左对齐：

```vue
<SrDescriptions :items="items" :label-width="90" />   <!-- 90px -->
<SrDescriptions :items="items" label-width="5em" />    <!-- 也行 -->
```

只在 `direction="horizontal"` 下生效——上下排时字段名本来就独占一行，不需要宽度。

<div class="sr-demo is-block">
  <div style="display: flex; flex-direction: column; gap: 16px">
    <SrDescriptions :items="basicItems.slice(0, 4)" :column="2" :label-width="90" />
    <SrDescriptions :items="basicItems.slice(0, 4)" :column="2" :label-width="120" />
  </div>
</div>

## 标题与操作

<div class="sr-demo is-block">
  <SrDescriptions :items="basicItems.slice(0, 4)" :column="4" title="订单详情">
    <template #extra>
      <SrTag type="success" size="sm">已支付</SrTag>
    </template>
  </SrDescriptions>
</div>

`extra` 插槽放在右上角，通常放状态标签或操作按钮。

## 自定义值

`#value` 插槽按字段渲染不同内容：

<div class="sr-demo is-block">
  <SrDescriptions :items="basicItems.slice(0, 4)" :column="2">
    <template #value="{ item }">
      <SrTag v-if="item.label === '状态'" type="success" size="sm">{{ item.value }}</SrTag>
      <strong v-else-if="item.label === '姓名'" style="color: var(--sr-color-primary-text)">{{ item.value }}</strong>
      <span v-else>{{ item.value }}</span>
    </template>
  </SrDescriptions>
</div>

常见用法：状态渲染成 `SrTag`、金额加粗、链接可点。

## 尺寸

<div class="sr-demo is-block">
  <div style="display: flex; flex-direction: column; gap: 16px">
    <SrDescriptions :items="basicItems.slice(0, 3)" :column="3" size="small" border />
    <SrDescriptions :items="basicItems.slice(0, 3)" :column="3" border />
    <SrDescriptions :items="basicItems.slice(0, 3)" :column="3" size="large" border />
  </div>
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `SrDescriptionItem[]` | `[]` | 字段列表 |
| `column` | `number` | `3` | 每行列数 |
| `border` | `boolean` | `false` | 带边框 |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 字段名与值的方向 |
| `labelWidth` | `string \| number` | — | 字段名宽度（仅 horizontal） |
| `title` | `string` | `''` | 标题 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |

### SrDescriptionItem

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string` | 字段名 |
| `value` | `string \| number` | 字段值，不传显示 `—` |
| `span` | `number` | 占几列，超过 `column` 会被夹住 |

## 插槽

| 名称 | 参数 | 说明 |
| --- | --- | --- |
| `title` | — | 自定义标题 |
| `extra` | — | 右上角额外内容 |
| `label` | `{ item, index }` | 自定义字段名 |
| `value` | `{ item, index }` | 自定义字段值 |

## 注意事项

- **冒号是伪元素，不是文案**。用 `#label` 插槽会替换整个字段名容器，冒号仍在；想把冒号也去掉得自己改样式。
- **`span` 只在同一行的格子之间生效**。所有格子的 `span` 加起来不等于 `column` 时，最后一行会留空。
- **窄屏下边框模式会自动切成上下排**，否则字段名会占掉一半宽度。
- **数据变化时整块重排**，没有过渡动画——详情页很少动态增删字段，加动画反而干扰阅读。
