# SrSpace 间距

统一相邻元素的间距。用 flex + gap 实现，**不给子元素加 margin**。

<script setup>
import { ref } from 'vue'

const size = ref('sm')
</script>

## 交互演示

<div class="sr-demo">
  <SrButton size="sm">上一步</SrButton>
  <SrButton size="sm" variant="primary">下一步</SrButton>
  <SrButton size="sm" variant="outline">保存草稿</SrButton>
</div>

## 为什么用 gap 而不是 margin

给子元素加 `margin-right` 有两个老问题：

1. **最后一项多余的外边距**，需要 `:last-child` 清掉，但列表是动态的、有时又不是直接子元素
2. **和外层间距叠加**，明明设了 8px 结果看着像 16px

`gap` 只作用于**相邻元素之间**，没有首尾多余间距，也不与外层 margin 叠加。

## 基础用法

```vue
<SrSpace>
  <SrButton>上一步</SrButton>
  <SrButton>下一步</SrButton>
</SrSpace>
```

## 间距档位

<div class="sr-demo is-block">
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div v-for="s in ['xs', 'sm', 'md', 'lg']" :key="s" style="display: flex; align-items: center; gap: 12px">
      <span style="flex: 0 0 32px; font-size: 11px; color: var(--vp-c-text-3)">{{ s }}</span>
      <SrSpace :size="s">
        <SrTag size="sm">甲</SrTag>
        <SrTag size="sm">乙</SrTag>
        <SrTag size="sm">丙</SrTag>
      </SrSpace>
    </div>
  </div>
</div>

| `size` | 像素 |
| --- | --- |
| `xs` | 4 |
| `sm`（默认） | 8 |
| `md` | 12 |
| `lg` | 16 |

**传数字就直接当像素**：

```vue
<SrSpace :size="24">…</SrSpace>
```

这样一个组件同时覆盖「跟随设计令牌」和「临时微调」两种需求，不用记两套写法。

## 纵向

```vue
<SrSpace direction="vertical" align="start">
  <div>第一行</div>
  <div>第二行</div>
</SrSpace>
```

`direction="vertical"` 时，`align` 控制的是**水平**对齐。

## 换行

<div class="sr-demo is-block">
  <div style="max-width: 260px; padding: 12px; border: 1px dashed var(--vp-c-border)">
    <SrSpace wrap :size="8">
      <SrTag v-for="i in 12" :key="i" size="sm">选项 {{ i }}</SrTag>
    </SrSpace>
  </div>
</div>

容器不够宽时自动换行，行间距与列间距共用同一个 `gap`。

## 对齐方式

| `align` | 效果 |
| --- | --- |
| `start` | 交叉轴起点对齐 |
| `center`（默认） | 居中 |
| `end` | 交叉轴终点对齐 |
| `baseline` | 按文字基线，适合大小字混排 |

## 行内模式

```vue
<p>
  一段文字，
  <SrSpace inline :size="4">
    <SrTag size="sm">行内</SrTag>
  </SrSpace>
  后面继续。
</p>
```

`inline` 用 `inline-flex`，能夹在段落里而不独占一行。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 排列方向 |
| `size` | `SrSize \| number` | `'sm'` | 间距，档位或像素 |
| `align` | `'start' \| 'center' \| 'end' \| 'baseline'` | `'center'` | 交叉轴对齐 |
| `wrap` | `boolean` | `false` | 空间不足时换行 |
| `inline` | `boolean` | `false` | 行内模式 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| `default` | 需要排布的内容 |

## 注意事项

- **只处理直接子元素**。嵌套结构的间距要在内层再套一个 `SrSpace`。
- **不认识文本节点**。夹在元素之间的纯文本会变成独立的 flex item，需要包一层。
- **`wrap` 时行间距等于列间距**。想要不同的行间距，得自己写 `row-gap`。
- **不要和外层 `SrSpace` 叠同样的间距**。嵌套时内层值建议更小，视觉层级才清楚。
