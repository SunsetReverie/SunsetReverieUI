# SrDrawer 抽屉

从视口边缘滑出的面板，用于表单编辑、筛选条件、详情查看这类「不打断主流程」的场景。四方向、尺寸可变、圆角形态可选。

<script setup>
import { ref } from 'vue'

const basic = ref(false)
const inset = ref(false)
const left = ref(false)
const noHead = ref(false)
const lastReason = ref('')
</script>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrDrawer } from '@sunset-reverie/ui'

const open = ref(false)
</script>

<template>
  <SrButton @click="open = true">打开抽屉</SrButton>

  <SrDrawer v-model="open" title="筛选条件">
    <p>抽屉内容</p>
  </SrDrawer>
</template>
```

## 基础用法

<div class="sr-demo">
  <SrButton variant="primary" @click="basic = true">右侧滑出</SrButton>
  <SrButton variant="outline" @click="left = true">左侧滑出</SrButton>
  <SrButton variant="outline" @click="inset = true">圆角形态</SrButton>
  <SrButton variant="outline" @click="noHead = true">无头部</SrButton>
</div>

<SrDrawer v-model="basic" title="筛选条件">
  <p style="margin: 0 0 12px">点右上角关闭、按 Esc、点遮罩都能关掉。</p>
  <SrButton size="sm" variant="primary" @click="basic = false">应用筛选</SrButton>
</SrDrawer>

<SrDrawer v-model="left" title="左侧抽屉" placement="left">
  <p style="margin: 0">用于导航或大纲，从左侧滑出。</p>
</SrDrawer>

<SrDrawer v-model="inset" title="圆角抽屉" inset>
  <p style="margin: 0">四周留边、四角圆角，玻璃质感在这种形态下更明显。</p>
</SrDrawer>

<SrDrawer v-model="noHead" @close="lastReason = 'no-head'">
  <p style="margin: 0 0 12px">没有传 <code>title</code> 时不渲染头部，也没有右上角关闭按钮。</p>
  <SrButton size="sm" @click="noHead = false">关闭</SrButton>
</SrDrawer>

## 滑出方向

`placement` 四选一：`right`（默认）、`left`、`top`、`bottom`。

`size` 的含义跟着方向走——左右方向是**宽度**，上下方向是**高度**。

## 尺寸

`size` 支持三个预设，也可以传任意 CSS 值或数字（按 px）：

| 值 | 像素值 | 说明 |
| --- | --- | --- |
| `sm` | 320px | 左右方向作为宽度、上下方向作为高度 |
| `md` | 440px | 同上 |
| `lg` | 600px | 同上 |
| 数字 / 字符串 | 按 px 或原样透传 | 数字当 px，字符串原样用 |

```vue
<SrDrawer v-model="open" title="宽抽屉" size="lg" />
<SrDrawer v-model="open" title="自定义宽度" :size="520" />
```

## 圆角形态

`inset` 让抽屉**仍然贴边**，只把四个角做成圆角。贴边的那两条边圆角会被视口裁掉，视觉上只看到内侧两个角是圆的——这也正是常见后台抽屉的样子。

```vue
<SrDrawer v-model="open" title="圆角抽屉" inset />
```

## 头部与关闭

- `title` 为空 → 整块头部不渲染，也没有右上角关闭按钮
- `closable="false"` → 保留标题但不显示关闭按钮
- `maskClosable` / `escToClose` 分别控制点遮罩、按 Esc

三个都关掉时抽屉只能靠代码关闭，适合「必须先完成表单」的场景：

```vue
<SrDrawer v-model="open" title="必填信息" :closable="false" :mask-closable="false" :esc-to-close="false" />
```

## 事件

关闭时 `close` 会带上原因，便于区分用户是怎么关的：

| 原因 | 触发场景 |
| --- | --- |
| `close` | 点右上角关闭按钮 |
| `mask` | 点遮罩 |
| `esc` | 按 Esc |

```vue
<SrDrawer v-model="open" title="筛选" @close="(reason) => console.log(reason)" />
```

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | 是否打开，支持 `v-model` |
| `placement` | `'right' \| 'left' \| 'top' \| 'bottom'` | `'right'` | 滑出方向 |
| `size` | `'sm' \| 'md' \| 'lg' \| number \| string` | `''` | 尺寸；左右为宽、上下为高 |
| `title` | `string` | `''` | 标题，留空则不渲染头部 |
| `closable` | `boolean` | `true` | 显示右上角关闭按钮 |
| `maskClosable` | `boolean` | `true` | 点击遮罩关闭 |
| `escToClose` | `boolean` | `true` | 按 Esc 关闭 |
| `inset` | `boolean` | `false` | 圆角形态：贴边 + 四角圆角 |
| `mask` | `boolean` | `true` | 显示遮罩 |
| `lockScroll` | `boolean` | `true` | 打开时锁定页面滚动 |
| `zIndex` | `number` | — | 层级，需要盖在其他浮层之上时调大 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `open` | 开合状态变化 |
| `close` | `reason` | 关闭，`reason` 为 `'close' \| 'mask' \| 'esc'` |
| `visible-change` | `open` | 同上，语义化版本 |
| `opened` | — | 滑入动画结束后触发，适合在其中聚焦输入框 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 抽屉主体内容 |
| `header` | 自定义头部，覆盖 `title` |
| `footer` | 底部操作区，自带上边框 |

## 注意事项

- **面板是不透明底**（容器色叠两层，约 0.98）。玻璃风格下如果只用半透底，背后的页面文字会透进面板，读起来很干扰。
- 打开时默认锁定页面滚动；抽屉内容超长时内部自己滚，并隐藏了滚动条。
- 遮罩比面板低一层，`zIndex` 只需要管面板。
- 焦点在打开时移入面板、关闭时归还，Tab 在面板内循环。
