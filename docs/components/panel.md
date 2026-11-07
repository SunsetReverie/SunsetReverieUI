# SrPanel 分区面板

轻量的分区容器。比 `SrCard` 更素：默认没有边框和阴影，只负责把内容分成一块块带标题的区域。可选折叠。

<script setup>
import { ref } from 'vue'

const open = ref(true)
</script>

```vue
<script setup lang="ts">
import { SrPanel } from '@sunset-reverie/ui'
</script>

<template>
  <SrPanel title="筛选条件" description="支持多选">
    面板内容
  </SrPanel>
</template>
```

## 基础用法

<div class="sr-demo is-block">
  <SrPanel title="筛选条件" description="勾选后立即生效">
    <p style="margin: 0">面板主体内容，默认没有边框与背景。</p>
  </SrPanel>
</div>

它的定位是**文档与表单页的分节容器**——一页里有五六个区块时，用它比用 `SrCard` 更轻，不会让页面到处是框。

## 可折叠

`collapsible` 打开折叠能力，`v-model` 控制展开状态：

<div class="sr-demo is-block">
  <SrPanel v-model="open" title="高级配置" description="点击标题右侧箭头折叠" collapsible>
    <p style="margin: 0">当前状态：{{ open ? '展开' : '收起' }}</p>
  </SrPanel>
</div>

折叠时用 `max-height` 过渡，高度自适应内容，不需要指定具体像素。

## 去内边距

`flush` 去掉内容区留白，交给内容自己控制——图表、表格、图片这类自带边距的内容用它才不会多出一圈空白：

```vue
<SrPanel title="调用趋势" flush>
  <Chart />
</SrPanel>
```

## 头部自定义

`#header` 覆盖整个头部（标题 + 描述），`#extra` 落在标题右侧：

<div class="sr-demo is-block">
  <SrPanel>
    <template #header>
      <h3 style="margin: 0; font-size: 15px; font-weight: 600">自定义头部</h3>
      <p style="margin: 4px 0 0; font-size: 12px; color: var(--sr-color-text-tertiary)">
        整块替换，可以是任意结构
      </p>
    </template>

    <template #extra>
      <SrButton size="xs" variant="text">查看全部</SrButton>
    </template>

    <p style="margin: 0">主体内容</p>
  </SrPanel>
</div>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | `''` | 标题 |
| `description` | `string` | `''` | 标题下方的说明 |
| `collapsible` | `boolean` | `false` | 是否可折叠 |
| `modelValue` | `boolean` | `true` | 展开状态，支持 `v-model` |
| `flush` | `boolean` | `false` | 去掉内容区内边距 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `open` | 展开状态变化 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 主体内容 |
| `header` | 完全自定义头部，覆盖 `title` / `description` |
| `extra` | 标题右侧的附加内容 |

## 注意事项

- **没有头部内容时不渲染头部区**，不会留下一条空白。
- `flush` 只去掉内容区的内边距，头部不受影响。
- 面板自身没有外边距。多个面板纵向排列时，间距由父容器给：

  ```css
  .page { display: flex; flex-direction: column; gap: 16px; }
  ```
- 与 `SrCard` 的分工：`Card` 是页面里独立的信息块（有边框、可悬停），`Panel` 是页面内的分节（无边框、可折叠）。
