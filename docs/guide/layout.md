# 页面布局

用 `SrRow` / `SrCol` 搭页面骨架。栅格是 24 等分制，和断点体系（`xs` / `sm` / `md` / `lg` / `xl`）配合使用。

组件级 API 见 [SrRow](/components/row) / [SrCol](/components/col)，这里讲**怎么组合出一个页面**。

## 基础

```vue
<SrRow :gutter="16">
  <SrCol :span="12">左半</SrCol>
  <SrCol :span="12">右半</SrCol>
</SrRow>
```

`span` 满 24。常用分法：

| 布局 | 写法 |
| --- | --- |
| 两等分 | `12 / 12` |
| 三等分 | `8 / 8 / 8` |
| 四等分 | `6 / 6 / 6 / 6` |
| 主次（2:1） | `16 / 8` |
| 侧栏 + 内容 | `6 / 18` |

## 响应式

`span` 可以传对象，按断点分档：

```vue
<SrCol :span="{ xs: 24, md: 12, xl: 8 }">卡片</SrCol>
```

含义：手机整行、平板一半、大屏三分之一。**从小到大写**，没写的断点会沿用上一档的值。

```vue
<!-- 一行放 1/2/4 个 -->
<SrRow :gutter="16">
  <SrCol v-for="i in 4" :key="i" :span="{ xs: 24, sm: 12, lg: 6 }">
    <SrCard>{{ i }}</SrCard>
  </SrCol>
</SrRow>
```

| 断点 | 宽度 | 典型设备 |
| --- | --- | --- |
| `xs` | < 576px | 手机 |
| `sm` | ≥ 576px | 大手机 / 小平板 |
| `md` | ≥ 768px | 平板 |
| `lg` | ≥ 992px | 笔记本 |
| `xl` | ≥ 1200px | 桌面 |

## 页面骨架

后台最常见的三段式：

```vue
<template>
  <div class="layout">
    <aside class="layout__side">
      <SrNav v-model="active" :items="navItems" />
    </aside>

    <main class="layout__main">
      <SrRow :gutter="16">
        <SrCol :span="{ xs: 24, lg: 6 }">
          <SrCard>统计卡片</SrCard>
        </SrCol>
        <SrCol :span="{ xs: 24, lg: 18 }">
          <SrPanel title="数据列表">
            <SrTable :data="rows" :columns="columns" />
          </SrPanel>
        </SrCol>
      </SrRow>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.layout__side {
  flex: 0 0 220px;
  border-right: 1px solid var(--sr-color-border-subtle);
}

.layout__main {
  flex: 1 1 auto;
  min-width: 0;   /* 关键：不加会让内部的表格撑破容器 */
  padding: 20px;
}
</style>
```

`min-width: 0` 是 flex 布局里的必备项——不加的话，内部有宽表格时会把整个容器撑开，导致横向滚动条出现在最外层。

## 卡片网格

等分卡片用栅格，不要用 flex + 计算宽度：

```vue
<SrRow :gutter="[16, 16]">
  <SrCol v-for="item in list" :key="item.id" :span="{ xs: 24, sm: 12, md: 8, xl: 6 }">
    <SrCard :title="item.title">{{ item.desc }}</SrCard>
  </SrCol>
</SrRow>
```

`gutter` 传数组时第一个是水平间距、第二个是垂直间距。只传数字则两个方向相同。

> **垂直间距别用 margin**。用 `gutter` 的第二个值，换行后的行间距才是均匀的。

## 表单布局

两种常见形态：

**单列表单**（字段少、输入框宽）：

```vue
<SrForm :model="model" :rules="rules" label-position="top">
  <SrFormItem label="名称" prop="name">
    <SrInput v-model="model.name" />
  </SrFormItem>
</SrForm>
```

**双列表单**（字段多、要省纵向空间）：

```vue
<SrForm :model="model" :rules="rules" label-position="left" :label-width="88">
  <SrRow :gutter="16">
    <SrCol :span="{ xs: 24, md: 12 }">
      <SrFormItem label="名称" prop="name">
        <SrInput v-model="model.name" />
      </SrFormItem>
    </SrCol>
    <SrCol :span="{ xs: 24, md: 12 }">
      <SrFormItem label="编码" prop="code">
        <SrInput v-model="model.code" />
      </SrFormItem>
    </SrCol>
  </SrRow>
</SrForm>
```

`label-position="left"` 时**一定要给 `label-width`**，否则每行标签宽度不同、输入框左边缘会参差不齐。

## 间距

纵向排列的块之间用 `gap`，不要用 `margin-bottom`：

```less
/* 推荐 */
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 避免：最后一个元素多出底部空白，还得写 :last-child 清掉 */
```

栅格内部横向间距交给 `gutter`，外层块的间距交给 `gap`，两者不混用。

## 常见错误

**栅格算错总和**

```vue
<!-- 24 + 24 = 48，第二列会换行 -->
<SrCol :span="24">A</SrCol>
<SrCol :span="24">B</SrCol>
```

一行内所有 `span` 加起来不超过 24，超了就换行（`wrap` 默认为 `true`）。

**小屏忘了降级**

```vue
<!-- 手机上还是 3 列，每列不到 100px -->
<SrCol :span="8">内容</SrCol>

<!-- 改成响应式 -->
<SrCol :span="{ xs: 24, md: 8 }">内容</SrCol>
```

**用栅格做纵向间距**

```vue
<!-- 错：栅格只管横向 -->
<SrCol :span="24" style="margin-bottom: 16px">

<!-- 对：用 gutter 的第二个值 -->
<SrRow :gutter="[16, 16]">
```

**表格放进 flex 容器忘了 `min-width: 0`**

表现为整页出现横向滚动条。这是 flex 子项默认 `min-width: auto` 导致的，加上就能正常让表格自己滚。

## 和 CSS Grid 怎么选

| 场景 | 用什么 |
| --- | --- |
| 页面级分栏（侧栏 + 内容） | flex + 固定宽度 |
| 卡片的均匀网格 | `SrRow` / `SrCol`（自带断点） |
| 复杂二维布局（门户、仪表盘） | 原生 `grid-template-areas` |
| 单行内的元素排列 | flex |

栅格的价值在于**断点降级**，如果你的布局不需要响应式，直接写 flex 更简单。
