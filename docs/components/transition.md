# SrTransition 过渡

对 Vue 内置 `<Transition>` 的薄封装，提供几套预设动画，并统一处理 `prefers-reduced-motion`。

<script setup>
import { ref } from 'vue'

const show = ref(true)
const name = ref('fade')
</script>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrTransition } from '@sunset-reverie/ui'

const show = ref(true)
</script>

<template>
  <SrTransition name="fade-up">
    <div v-if="show">内容</div>
  </SrTransition>
</template>
```

## 预设

`name` 五选一：

| 值 | 效果 |
| --- | --- |
| `fade`（默认） | 只淡入淡出 |
| `fade-up` | 淡入 + 从下方 8px 上移 |
| `zoom` | 淡入 + 从 0.92 倍放大 |
| `collapse` | 高度展开/收起 |
| `list` | 列表项进出，配合 `v-for` 使用 |

<div class="sr-demo is-column">
  <div style="display: flex; gap: 8px; flex-wrap: wrap">
    <SrButton v-for="n in ['fade', 'fade-up', 'zoom', 'collapse']" :key="n" size="sm" variant="outline" @click="name = n">
      {{ n }}
    </SrButton>
    <SrButton size="sm" variant="primary" @click="show = !show">{{ show ? '隐藏' : '显示' }}</SrButton>
  </div>

  <SrTransition :name="name">
    <div v-if="show" style="padding: 16px; border-radius: 8px; background: var(--sr-color-primary-alpha-12); color: var(--sr-color-primary-text)">
      当前过渡：{{ name }}
    </div>
  </SrTransition>
</div>

## 关闭动画

`enabled="false"` 时直接切换、不产生过渡帧，但**仍然走 Vue 的 Transition 流程**（`v-if` 的挂载卸载语义不变）。

用于用户设置里关掉了动画的场景：

```vue
<SrTransition :enabled="motionEnabled" name="fade-up">…</SrTransition>
```

## 进出模式

`mode` 对应 Vue 的同名属性：

| 值 | 行为 |
| --- | --- |
| 不传（默认） | 进出同时进行 |
| `out-in` | 旧的先退场，新的再进场 |
| `in-out` | 新的先进场，旧的再退场 |

页面级路由切换通常用 `out-in`，避免两屏内容同时存在造成布局跳动。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `'fade' \| 'fade-up' \| 'zoom' \| 'collapse' \| 'list'` | `'fade'` | 过渡名 |
| `enabled` | `boolean` | `true` | 是否启用动画 |
| `appear` | `boolean` | `false` | 首次渲染是否也播放 |
| `mode` | `'in-out' \| 'out-in'` | — | 进出场模式 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 参与过渡的内容，**必须包含单个根节点**，且由 `v-if` / `v-show` 控制 |

## 注意事项

- 插槽内容**只能有一个根元素**，多个会报错——这是 Vue `<Transition>` 的约束，不是本组件的。
- `collapse` 依赖内容高度，内容高度为 0（如 `display: none` 的子元素）时不会有动画。
- `list` 用于 `v-for`，需要配合 `<TransitionGroup>` 的语义；本组件对它做了适配，但**每个列表项必须有稳定的 `key`**。
- 用户开启系统的「减少动效」时，所有预设都会自动降级为直接切换。
