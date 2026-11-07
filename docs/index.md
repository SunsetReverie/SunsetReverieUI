---
layout: home

hero:
  name: 夕梦 UI
  text: SunsetReverie-UI
  tagline: Vue 3 / Nuxt 4 组件库 · 毛玻璃与扁平双风格 · 三层 Token<br>为「需要长期维护的中后台」而设计
  image:
    src: /logo.svg
    alt: 夕梦 UI
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 浏览组件
      link: /components/button
    - theme: alt
      text: Token 验证页
      link: /token-gallery.html
---

<div class="sr-features">

<div class="sr-feature">
<span class="doc-icon" style="--icon: url(/icons/puzzle.svg)"></span>
<h3>三层 Token</h3>
<p>L1 原始色板 → L2 语义映射 → L3 组件级，全部由一个 TypeScript 文件生成 Less 变量、TS 常量与 CSS 变量。</p>
</div>

<div class="sr-feature">
<span class="doc-icon" style="--icon: url(/icons/feather.svg)"></span>
<h3>双风格切换</h3>
<p>毛玻璃与扁平共享同一批变量名，只覆写值。组件样式只写一次，不需要 if 分支。</p>
</div>

<div class="sr-feature">
<span class="doc-icon" style="--icon: url(/icons/rocket.svg)"></span>
<h3>SSR 零闪烁</h3>
<p>内联脚本在首次绘制前决定主题，服务端输出确定的根属性，Nuxt 下无需额外配置。</p>
</div>

<div class="sr-feature">
<span class="doc-icon" style="--icon: url(/icons/box.svg)"></span>
<h3>34 个组件</h3>
<p>覆盖 P0 / P1 全部能力与大部分 P2：表格固定列与分页、侧边栏导航、标签页四种外观、确认框与加载更多。</p>
</div>

<div class="sr-feature">
<span class="doc-icon" style="--icon: url(/icons/circle-check.svg)"></span>
<h3>水合可验证</h3>
<p>30 个组件的 SSR 冒烟测试 + Nuxt 水合 e2e，断言告警数为 0；新组件漏测会被 lint:smoke 拦下。</p>
</div>

<div class="sr-feature">
<span class="doc-icon" style="--icon: url(/icons/shield-check.svg)"></span>
<h3>类型友好</h3>
<p>组件 props 全部由 TS 推导，插槽用 defineSlots 声明，Volar 下模板内即可获得补全。</p>
</div>

</div>

## 它长什么样

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SrButton, SrForm, SrFormItem, SrInput } from '@sunset-reverie/ui'

const model = ref({ name: '' })
</script>

<template>
  <SrForm :model="model" label-position="left">
    <SrFormItem prop="name" label="名称" :rules="{ required: true, message: '请输入名称' }">
      <SrInput v-model="model.name" placeholder="组件名" />
    </SrFormItem>

    <SrButton variant="primary">保存</SrButton>
  </SrForm>
</template>
```

样式只需两行：

```ts
// main.ts
import '@sunset-reverie/ui/base.css'   // 基础层：reset、变量、工具类
import '@sunset-reverie/ui/style.css'  // 组件样式
```

## 什么时候适合用它

| 适合 | 不适合 |
| --- | --- |
| 中后台系统，组件数量可控、样式需要统一 | 需要开箱即用的整套设计资产与模板 |
| 需要同时支持 SSR 与客户端渲染 | 只需要几个按钮，不值得引入整套体系 |
| 团队想完全掌控样式来源，不依赖黑盒 | 期望跟随某个大型社区的生态与插件 |
| 需要亮暗 × 毛玻璃/扁平四种组合 | 只做营销页等静态页面 |
