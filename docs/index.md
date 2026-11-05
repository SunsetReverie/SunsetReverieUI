---
layout: home

hero:
  name: 夕梦 UI
  text: SunsetReverie-UI
  tagline: Vue 3 / Nuxt 4 组件库 · 毛玻璃与扁平双风格 · 三层 Token 体系
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 浏览组件
      link: /components/button

features:
  - title: 三层 Token
    details: L1 原始色板 → L2 语义映射 → L3 组件级，全部由一个 TypeScript 文件生成 Less 变量、TS 常量与 CSS 变量。
  - title: 双风格切换
    details: 毛玻璃与扁平共享同一批变量名，只覆写值。组件样式只写一次，不需要 if 分支。
  - title: SSR 零闪烁
    details: 内联脚本在首次绘制前决定主题，服务端输出确定的根属性，Nuxt 下无需额外配置。
  - title: 24 栅格
    details: 能被 3/4/6/8 整除，响应式 span 与 gutter 全部由 CSS 媒体查询完成，JS 不参与布局。
  - title: 按需引入
    details: 每个组件有独立入口与独立 CSS，配 resolver 或子路径导入都能只打包用到的部分。
  - title: 类型友好
    details: 组件 props 全部由 TS 推导，插槽用 defineSlots 声明，Volar 下模板内即可获得补全。
---
