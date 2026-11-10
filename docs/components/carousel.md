# SrCarousel 轮播

数据驱动的内容轮播。支持滑动与淡入淡出两种效果、鼠标拖动与触摸滑动、纵向排列、自动播放与循环，封面文案通过 `#overlay` 插槽叠加。

<script setup>
import { ref } from 'vue'

const current = ref(0)
const vertical = ref(0)
const featured = ref(0)

const slides = [
  { title: '落日橙', bg: 'linear-gradient(135deg, #ff7a45, #ff9a6b)' },
  { title: '霞紫', bg: 'linear-gradient(135deg, #7a64b5, #9a86cc)' },
  { title: '暮蓝', bg: 'linear-gradient(135deg, #4a6fd4, #6b8fe8)' },
]

const articles = [
  { title: '用三层 Token 撑起两套视觉', author: '林深', date: '11-06', tag: '设计系统', cover: 'linear-gradient(135deg, #ff7a45, #ffb26b)' },
  { title: 'SSR 水合不一致的排查清单', author: '周夏', date: '11-05', tag: '工程实践', cover: 'linear-gradient(135deg, #7a64b5, #a78bfa)' },
  { title: '组件库里的动效该怎么收敛', author: '陈默', date: '11-04', tag: '动效', cover: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' },
]
</script>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrCarousel } from '@sunset-reverie/ui'

const current = ref(0)
const slides = [{ title: '一' }, { title: '二' }, { title: '三' }]
</script>

<template>
  <SrCarousel v-model="current" :items="slides" :height="200">
    <template #item="{ item, index }">
      <div class="slide">{{ item.title }}</div>
    </template>
  </SrCarousel>
</template>
```

## 基础用法

<div class="sr-demo is-block">
  <SrCarousel v-model="current" :items="slides" :height="200">
    <template #item="{ item, index }">
      <div
        :style="{ background: item.bg }"
        style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; width: 100%; height: 100%; color: #fff"
      >
        <strong style="font-size: 20px">{{ item.title }}</strong>
        <span style="font-size: 12px; opacity: 0.8">{{ index + 1 }} / {{ slides.length }}</span>
      </div>
    </template>
  </SrCarousel>

  <p style="margin: 10px 0 0; font-size: 13px; color: var(--vp-c-text-3)">
    当前第 {{ current + 1 }} 张，可以按住往左拖
  </p>
</div>

## 拖动与触摸

**默认就支持**，不需要额外配置：

| 操作 | 行为 |
| --- | --- |
| 鼠标按住拖动 | 内容跟手位移，松开时超过阈值就翻页，否则回弹 |
| 手机触摸滑动 | 同上，走同一套 Pointer Events |
| 键盘左右键 | 容器可聚焦，获得焦点后可用 |
| 点击箭头 / 指示器 | 直接切换 |

`dragThreshold` 控制翻页所需的位移比例，默认 `0.15`——宽度 400px 的轮播要拖过 60px 才翻页。太小容易误触，太大会让人觉得「拖了没反应」。

`draggable` 与 `touchable` 可以分别关闭：

```vue
<SrCarousel :draggable="false" />   <!-- 禁止鼠标拖动，保留触摸 -->
<SrCarousel :touchable="false" />   <!-- 禁止触摸，保留鼠标拖动 -->
```

> **实现细节**：指针捕获发生在**确认拖动之后**（位移超过 4px），而不是按下时。如果按下就 `setPointerCapture`，箭头和指示器上的 `click` 会被抢走，点了没反应。

## 循环

`loop` 默认开启：末张往后一张回到第一张，首张往前回到末张。

```vue
<SrCarousel :loop="false" />   <!-- 关闭后首尾两张的对应箭头禁用 -->
```

## 纵向轮播

`direction="vertical"` 让滑动方向、拖动轴、键盘（上下键）、箭头方向一起转，指示器移到右侧竖排：

<div class="sr-demo is-block">
  <SrCarousel v-model="vertical" :items="slides" :height="180" direction="vertical">
    <template #item="{ item, index }">
      <div
        :style="{ background: item.bg }"
        style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #fff; font-size: 18px"
      >
        {{ item.title }}（{{ index + 1 }}）
      </div>
    </template>
  </SrCarousel>
</div>

## 封面内容层

`#overlay` 是独立插槽，渲染在每张内容之上，跟着一起滑动。底部自带一层渐变压暗，浅色封面上的白字也能读清：

<div class="sr-demo is-block">
  <SrCarousel v-model="featured" :items="articles" :height="240">
    <template #item="{ item }">
      <div :style="{ background: item.cover }" style="width: 100%; height: 100%" />
    </template>

    <template #overlay="{ item }">
      <span
        :style="{ alignSelf: 'flex-start', marginBottom: '8px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(255,255,255,.22)', fontSize: '11px' }"
      >
        {{ item.tag }}
      </span>
      <h4 style="margin: 0; font-size: 18px; font-weight: 600; line-height: 1.4">{{ item.title }}</h4>
      <div style="margin-top: 6px; font-size: 12px; opacity: 0.85">
        {{ item.author }} · {{ item.date }}
      </div>
    </template>
  </SrCarousel>
</div>

插槽作用域是 `{ item, index, active }`。覆盖层用 `pointer-events: none`，不会挡住拖动；里面的按钮需要自己加 `pointer-events: auto`。

## 淡入淡出

`effect="fade"` 改为叠层淡入，不做位移。`indicator-position="outside"` 把指示器放到框外：

```vue
<SrCarousel effect="fade" indicator-position="outside" />
```

## 自动播放

```vue
<SrCarousel autoplay :interval="3000" />
```

`pauseOnHover` 默认 `true`：用户停在某一张上说明正在看，此时自动切走会打断阅读。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `SrCarouselItem[]` | `[]` | 数据源，每项原样传给插槽；`SrCarouselItem` 是带索引签名的对象，插槽里可直接读业务字段 |
| `modelValue` | `number` | `0` | 当前索引，支持 `v-model` |
| `effect` | `'slide' \| 'fade'` | `'slide'` | 切换效果 |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 排列方向 |
| `autoplay` | `boolean` | `false` | 自动播放 |
| `interval` | `number` | `4000` | 自动播放间隔（ms），最小 500 |
| `pauseOnHover` | `boolean` | `true` | 悬停时暂停自动播放 |
| `loop` | `boolean` | `true` | 循环播放 |
| `indicators` | `boolean` | `true` | 显示指示器 |
| `indicatorPosition` | `'inside' \| 'outside'` | `'inside'` | 指示器位置 |
| `arrows` | `boolean` | `true` | 显示切换箭头 |
| `height` | `number \| string` | `240` | 高度；数字与纯数字字符串按 px，其它原样用 |
| `draggable` | `boolean` | `true` | 允许鼠标拖动 |
| `touchable` | `boolean` | `true` | 允许触摸滑动 |
| `dragThreshold` | `number` | `0.15` | 翻页所需的位移比例 |
| `disabled` | `boolean` | `false` | 禁用全部交互 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `index` | 当前索引变化，配合 `v-model` |
| `change` | `index, prevIndex` | 切换完成 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `item` | 每张内容，作用域 `{ item, index, active }` |
| `overlay` | 叠加在内容之上的信息层，作用域同上 |

`item` 是 `SrCarouselItem`（带索引签名的对象），所以 <code v-pre>`{{ item.title }}`</code> 可以直接写，不必像早期那样把插槽参数断言成业务类型。字段值仍是 `unknown`——组件不猜你的数据结构；用作 `:style` 或传给要求 `string` 的 prop 时收窄一次即可，例如 <code v-pre>`:style="{ background: String(item.bg ?? '') }"`</code>。

## 注意事项

- **必须绑 `v-model`**。不绑时点击箭头会派发 `update:modelValue`，但父组件不更新，表现就是「点了没反应」。
- **只有一张时不渲染箭头与指示器**，单张轮播没有切换语义。
- `modelValue` 越界时会被夹到合法范围，`items` 变短不会停在不存在的页。
- **没有做无限循环的克隆节点**。常见做法是在首尾各复制一张、滑到克隆位时瞬间跳回真实位，代价是首尾内容会被渲染两遍——有副作用的内容（自动播放的视频、埋点）会执行两次。这里选择到头折返。
- 拖动时会关闭过渡（跟手），松手才恢复动画；拖动中禁止文字选中与图片原生拖拽。
- `touch-action: pan-y` 让纵向页面滚动与横向拖动共存；纵向轮播时同理保留 `pan-x`。
- 动画尊重 `prefers-reduced-motion`：用户关掉动效时切换不再有过渡帧。
