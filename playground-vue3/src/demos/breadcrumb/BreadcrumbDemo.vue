<script setup lang="ts">
import { SrBreadcrumb, type SrBreadcrumbItem } from '@sunset-reverie/ui'

defineOptions({ name: 'BreadcrumbDemo' })

const basic: SrBreadcrumbItem[] = [
  { label: '工作台', href: '#/overview' },
  { label: '组件', href: '#/c/button' },
  { label: 'SrBreadcrumb' },
]

const withIcon: SrBreadcrumbItem[] = [
  { label: '首页', href: '#/', icon: 'lucide:house' },
  { label: '组件', href: '#/c/button', icon: 'lucide:inbox' },
  { label: '面包屑' },
]

const longPath: SrBreadcrumbItem[] = [
  { label: '工作台', href: '#/' },
  { label: '组件', href: '#/c/button' },
  { label: '导航', href: '#/c/nav' },
  { label: '面包屑', href: '#/c/breadcrumb' },
  { label: '示例', href: '#/c/breadcrumb' },
  { label: '详情' },
]

const withDisabled: SrBreadcrumbItem[] = [
  { label: '工作台', href: '#/' },
  { label: '无权限目录', href: '#/x', disabled: true },
  { label: '当前页' },
]
</script>

<template>
  <div class="demo">
    <section>
      <h3>基础（末项自动标为当前页）</h3>
      <SrBreadcrumb :items="basic" />
    </section>

    <section>
      <h3>三种分隔符</h3>
      <div class="stack">
        <SrBreadcrumb :items="basic" />
        <SrBreadcrumb :items="basic" separator="›" />
        <SrBreadcrumb :items="basic" separator-icon="lucide:chevron-right" />
      </div>
    </section>

    <section>
      <h3>带图标</h3>
      <SrBreadcrumb :items="withIcon" separator-icon="lucide:chevron-right" />
    </section>

    <section>
      <h3>超长折叠（max-items）</h3>
      <div class="stack">
        <SrBreadcrumb :items="longPath" separator-icon="lucide:chevron-right" />
        <SrBreadcrumb :items="longPath" :max-items="4" separator-icon="lucide:chevron-right" />
        <SrBreadcrumb :items="longPath" :max-items="3" separator-icon="lucide:chevron-right" />
      </div>
      <p class="hint">不传 max-items 不折叠；传 4 / 3 时中间折叠成省略号，保留首项与末两项</p>
    </section>

    <section>
      <h3>禁用项（只展示不可点）</h3>
      <SrBreadcrumb :items="withDisabled" separator-icon="lucide:chevron-right" />
      <p class="hint">「无权限目录」不会渲染 &lt;a&gt;，避免点进去 404</p>
    </section>

    <section>
      <h3>自定义分隔符插槽</h3>
      <SrBreadcrumb :items="basic">
        <template #separator>
          <span style="color: var(--sr-color-primary); margin: 0 6px">→</span>
        </template>
      </SrBreadcrumb>
    </section>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  gap: 26px;
}
h3 {
  margin: 0 0 10px;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  font-weight: 600;
}
.hint {
  margin: 8px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
