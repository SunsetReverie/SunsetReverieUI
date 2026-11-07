# SrCarousel 轮播

数据驱动的图片/内容轮播。支持滑动与淡入淡出两种效果、自动播放、循环、触摸滑动与键盘切换。

<script setup>
import { ref } from 'vue'

const current = ref(0)
const fadeCurrent = ref(0)

const slides = [
  { title: '落日橙', bg: 'linear-gradient(135deg, #ff7a45, #ff9a6b)' },
  { title: '霞紫', bg: 'linear-gradient(135deg, #7a64b5, #9a86cc)' },
  { title: '暮蓝', bg: 'linear-gradient(135deg, #4a6fd4, #6b8fe8)' },
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
    当前第 {{ current + 1 }} 张
  </p>
</div>

`#item` 是作用域插槽，参数为 `{ item, index, active }`，内容完全由调用方渲染。

## 淡入淡出

`effect="fade"` 改为叠层淡入，不做横向位移：

<div class="sr-demo is-block">
  <SrCarousel v-model="fadeCurrent" :items="slides" effect="fade" :height="180" indicator-position="outside">
    <template #item="{ item }">
      <div
        :style="{ background: item.bg }"
        style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #fff; font-size: 18px"
      >
        {{ item.title }}
      </div>
    </template>
  </SrCarousel>
</div>

`indicator-position="outside"` 把指示器放到框外，适合浅色内容——压在图片上会看不清。

## 自动播放

`autoplay` 开启后按 `interval` 自动切换，默认**悬停时暂停**：

```vue
<SrCarousel v-model="current" :items="slides" autoplay :interval="3000" />
```

`pauseOnHover` 默认 `true`：用户停在某一张上说明正在看，此时自动切走会打断阅读。确实需要一直播放时设为 `false`。

## 循环与边界

<div class="sr-demo is-block">
  <SrCarousel v-model="current" :items="slides" :height="150" :loop="false">
    <template #item="{ item, index }">
      <div
        :style="{ background: item.bg }"
        style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #fff"
      >
        {{ item.title }}（不循环，{{ index + 1 }}/{{ slides.length }}）
      </div>
    </template>
  </SrCarousel>
</div>

`loop: false` 时，首尾两张对应方向的箭头会禁用。

## 交互方式

| 方式 | 说明 |
| --- | --- |
| 点击箭头 | 上一张 / 下一张 |
| 点击指示器 | 跳到指定页 |
| 触摸左右滑动 | 横向位移超过 40px 才翻页，避免误触 |
| 键盘左右方向键 | 容器可聚焦，获得焦点后可用 |

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `unknown[]` | `[]` | 数据源，每项原样传给 `#item` 插槽 |
| `modelValue` | `number` | `0` | 当前索引，支持 `v-model` |
| `effect` | `'slide' \| 'fade'` | `'slide'` | 切换效果 |
| `autoplay` | `boolean` | `false` | 自动播放 |
| `interval` | `number` | `4000` | 自动播放间隔（ms），最小 500 |
| `pauseOnHover` | `boolean` | `true` | 悬停时暂停自动播放 |
| `loop` | `boolean` | `true` | 循环播放 |
| `indicators` | `boolean` | `true` | 显示指示器 |
| `indicatorPosition` | `'inside' \| 'outside'` | `'inside'` | 指示器位置 |
| `arrows` | `boolean` | `true` | 显示左右箭头 |
| `height` | `number \| string` | `240` | 高度，数字按 px |
| `touchable` | `boolean` | `true` | 允许触摸滑动 |
| `disabled` | `boolean` | `false` | 禁用全部交互 |

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `index` | 当前索引变化，配合 `v-model` |
| `change` | `index, prevIndex` | 切换完成 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `item` | 每张幻灯片的内容，作用域 `{ item, index, active }` |

## 注意事项

- **必须绑 `v-model`**。不绑时点击箭头会派发 `update:modelValue`，但父组件不更新，表现就是「点了没反应」。
- **只有一张时不渲染箭头与指示器**，单张轮播没有切换语义。
- `modelValue` 越界时会被夹到合法范围，`items` 变短不会停在不存在的页。
- 指示器 `inside` 时用白色系（压在图片上可读），`outside` 时用文字色系。
- **没有做无限循环的克隆节点**。常见做法是在首尾各复制一张、滑到克隆位时瞬间跳回真实位，代价是首尾内容会被渲染两遍——有副作用的内容（如自动播放的视频、埋点）会执行两次。这里选择到头折返。
- 动画尊重 `prefers-reduced-motion`：用户关掉动效时切换不再有过渡帧。
