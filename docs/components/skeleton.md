# SrSkeleton 骨架屏

加载时占住布局的占位块。相比 Spinner，它的价值是**内容出现时不会整块位移**。

<script setup>
import { ref } from 'vue'

const loading = ref(true)
const delay = ref(true)
</script>

## 交互演示

<div class="sr-demo is-block">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px">
    <div>
      <p style="margin: 0 0 8px; font-size: 12px; color: var(--vp-c-text-3)">带头像 + 两行</p>
      <SrSkeleton avatar round :rows="2" />
    </div>
    <div>
      <p style="margin: 0 0 8px; font-size: 12px; color: var(--vp-c-text-3)">只要文字段落</p>
      <SrSkeleton :rows="4" />
    </div>
    <div>
      <p style="margin: 0 0 8px; font-size: 12px; color: var(--vp-c-text-3)">静态（无动画）</p>
      <SrSkeleton :rows="3" :animated="false" />
    </div>
  </div>
</div>

## 基础用法

```vue
<SrSkeleton />
```

默认渲染「标题 + 3 行段落」。不传插槽时就是一个纯占位块。

## 包裹真实内容

最常用的形态：`loading` 为 true 时显示骨架，为 false 时显示内容。

```vue
<SrSkeleton :loading="loading" avatar :rows="3">
  <ArticleCard :data="article" />
</SrSkeleton>
```

<div class="sr-demo is-block">
  <SrButton size="sm" variant="outline" @click="delay = !delay">
    {{ delay ? '切到已加载' : '切到加载中' }}
  </SrButton>
  <div style="margin-top: 12px; padding: 12px; border: 1px solid var(--sr-color-border-subtle); border-radius: 8px">
    <SrSkeleton :loading="delay" avatar :rows="2">
      <div style="display: flex; align-items: center; gap: 10px">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--sr-color-primary-alpha-12)"></div>
        <div>
          <p style="margin: 0; font-size: 14px; font-weight: 600">用三层 Token 撑起两套视觉</p>
          <p style="margin: 2px 0 0; font-size: 12px; color: var(--vp-c-text-3)">林深 · 11-08</p>
        </div>
      </div>
    </SrSkeleton>
  </div>
</div>

切换时注意骨架和内容的高度是一致的，所以不会跳。

## 各种组合

| 写法 | 效果 |
| --- | --- |
| `<SrSkeleton />` | 标题 + 3 行 |
| `<SrSkeleton :rows="0" />` | 只有标题 |
| `<SrSkeleton :title="false" :rows="1" />` | 只有一条横线，适合表格行 |
| `<SrSkeleton avatar round :rows="2" />` | 圆形头像 + 两行 |
| `<SrSkeleton :animated="false" />` | 静态灰块，无扫光 |

<div class="sr-demo is-block">
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px">
    <SrSkeleton :rows="0" />
    <SrSkeleton :title="false" :rows="1" />
    <SrSkeleton :rows="0" avatar round />
  </div>
</div>

**最后一行会短一些**（62% 宽），这是刻意的：等宽的色块看起来像表格，不等宽才像自然断句。

## 尺寸

<div class="sr-demo is-block">
  <div style="display: flex; flex-direction: column; gap: 14px; max-width: 320px">
    <SrSkeleton size="sm" avatar :rows="2" />
    <SrSkeleton avatar :rows="2" />
    <SrSkeleton size="lg" avatar :rows="2" />
  </div>
</div>

尺寸影响行高、间距与头像大小，继承 `SrConfigProvider` 的全局尺寸。

## 常见场景

**列表项** —— 循环渲染，每个带圆形头像：

```vue
<SrSkeleton v-for="i in 5" :key="i" avatar round :rows="1" size="sm" />
```

**表格加载态** —— 关掉标题，纯横条：

```vue
<SrSkeleton :title="false" :rows="1" />
```

**详情页** —— 段落多一些：

```vue
<SrSkeleton avatar :rows="6" />
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `loading` | `boolean` | `true` | 加载中；为 `false` 时渲染默认插槽 |
| `rows` | `number` | `3` | 段落行数，`0` 表示不显示段落 |
| `title` | `boolean` | `true` | 显示标题占位 |
| `avatar` | `boolean` | `false` | 显示头像占位 |
| `round` | `boolean` | `false` | 头像是否为圆形 |
| `animated` | `boolean` | `true` | 扫光动画 |
| `size` | `SrSize` | 继承配置 | 尺寸档位 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| `default` | `loading` 为 `false` 时渲染的真实内容 |

## 注意事项

- **`prefers-reduced-motion: reduce` 下自动关闭动画**，不需要手动传 `animated="false"`。
- **骨架和真实内容高度尽量对齐**。如果差太多，切换时仍然会跳——这个组件只能占位，不能替你对齐。
- 骨架块没有语义，根元素带 `role="status"` 与一段视觉隐藏的「加载中」文案，供读屏软件识别。
- **不要用它替代 Spinner**：按钮内的短等待、提交反馈用 `SrSpinner` 更合适，骨架是给「一整块内容即将出现」用的。
