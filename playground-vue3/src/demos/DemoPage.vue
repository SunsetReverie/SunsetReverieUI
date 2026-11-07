<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'

import propsData from './props.json'
import { findDemo } from './registry'

defineOptions({ name: 'DemoPage' })

/** 当前路由参数 */
const route = useRoute()

/** 当前组件条目 */
const entry = computed(() => findDemo(String(route.params.key ?? '')))

/** 懒加载演示组件 */
const demo = computed(() => {
  const found = entry.value
  if (!found) return null
  return defineAsyncComponent(found.demo)
})

/** 该组件的 API 数据（来自源码提取） */
const api = computed(() => {
  const key = entry.value?.api ?? entry.value?.key
  if (!key) return null
  return (propsData as Record<string, { options: PropRow[]; emits: EmitRow[]; slots: string[] }>)[key] ?? null
})

interface PropRow {
  /** 来自哪个 props 变量，如 formProps / formItemProps */
  from: string
  name: string
  type: string
  default: string
  description: string
}

interface EmitRow {
  name: string
  params: string[]
}

/**
 * 把 props 变量名转成组件显示名
 * @param from 变量名，如 formItemProps
 * @returns 组件名，如 SrFormItem
 */
function sourceLabel(from: string): string {
  const base = from.replace(/Props$/, '')
  return 'Sr' + base.charAt(0).toUpperCase() + base.slice(1)
}

/** 按来源分组：Form 与 FormItem 会在同一页出现，混在一张表里会重名 */
const propGroups = computed(() => {
  const rows = api.value?.options ?? []
  const map = new Map<string, PropRow[]>()
  for (const row of rows) {
    const list = map.get(row.from) ?? []
    list.push(row)
    map.set(row.from, list)
  }
  return [...map.entries()].map(([from, options]) => ({ from, options }))
})
</script>

<template>
  <div v-if="entry" class="demo-page">
    <header class="demo-page__head">
      <h1 class="demo-page__title">{{ entry.name }}</h1>
      <p class="demo-page__desc">{{ entry.description }}</p>
    </header>

    <component :is="demo" v-if="demo" />

    <section v-if="propGroups.length" class="demo-page__api">
      <h2 class="demo-page__section">Props</h2>
      <div v-for="group in propGroups" :key="group.from" class="api-group">
        <h3 v-if="propGroups.length > 1" class="api-group__title">{{ sourceLabel(group.from) }}</h3>
        <div class="api-table">
          <div class="api-table__row api-table__row--head">
            <span>名称</span>
            <span>类型</span>
            <span>默认值</span>
            <span>说明</span>
          </div>
          <div v-for="option in group.options" :key="option.name" class="api-table__row">
            <code class="api-table__name">{{ option.name }}</code>
            <code class="api-table__type">{{ option.type }}</code>
            <code class="api-table__default">{{ option.default || '—' }}</code>
            <span class="api-table__desc">{{ option.description }}</span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="api && api.emits.length" class="demo-page__api">
      <h2 class="demo-page__section">事件</h2>
      <div class="api-table">
        <div class="api-table__row api-table__row--head">
          <span>事件</span>
          <span>参数</span>
          <span />
          <span />
        </div>
        <div v-for="event in api.emits" :key="event.name" class="api-table__row">
          <code class="api-table__name">{{ event.name }}</code>
          <code class="api-table__type">{{ event.params.join(', ') || '—' }}</code>
          <span />
          <span />
        </div>
      </div>
    </section>

    <section v-if="api && api.slots.length" class="demo-page__api">
      <h2 class="demo-page__section">插槽</h2>
      <p class="demo-page__slots">
        <code v-for="slot in api.slots" :key="slot">{{ slot }}</code>
      </p>
    </section>
  </div>

  <div v-else class="demo-page__empty">
    <p>没有找到这个组件的演示。</p>
    <RouterLink to="/overview">回到概览</RouterLink>
  </div>
</template>

<style scoped>
.demo-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1080px;
  margin: 0 auto;
}

.demo-page__head {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--sr-color-border-subtle);
}

.demo-page__title {
  margin: 0;
  color: var(--sr-color-text);
  font-size: 22px;
  font-weight: var(--sr-font-weight-semibold);
}

.demo-page__desc {
  margin: 6px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 13px;
  line-height: 1.7;
}

.demo-page__section {
  margin: 0 0 10px;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  font-weight: var(--sr-font-weight-semibold);
}

/* 多组 Props（如 Form 与 FormItem）之间留出间隔 */
.api-group + .api-group {
  margin-top: 16px;
}

.api-group__title {
  margin: 0 0 8px;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
  font-weight: 600;
}

/* API 表：四列网格，窄屏自动折行 */
.api-table {
  overflow: hidden;
  border: 1px solid var(--sr-color-border);
  border-radius: var(--sr-radius-base);
}

.api-table__row {
  display: grid;
  grid-template-columns: 140px minmax(120px, 1fr) 110px minmax(160px, 1.6fr);
  gap: 12px;
  padding: 9px 14px;
  border-bottom: 1px solid var(--sr-color-border-subtle);
  color: var(--sr-color-text-secondary);
  font-size: 12.5px;
  line-height: 1.6;
}

.api-table__row:last-child {
  border-bottom: 0;
}

.api-table__row--head {
  background: var(--sr-color-bg-sunken);
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.api-table__name {
  color: var(--sr-color-primary-text);
  font-family: var(--sr-font-family-mono);
}

.api-table__type {
  color: var(--sr-color-text-tertiary);
  font-family: var(--sr-font-family-mono);
  word-break: break-word;
}

.api-table__default {
  color: var(--sr-color-text-tertiary);
  font-family: var(--sr-font-family-mono);
}

.demo-page__slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
}

.demo-page__slots code {
  padding: 2px 8px;
  border-radius: var(--sr-radius-sm);
  background: var(--sr-color-primary-alpha-08);
  color: var(--sr-color-primary-text);
  font-family: var(--sr-font-family-mono);
  font-size: 12px;
}

.demo-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 80px 0;
  color: var(--sr-color-text-tertiary);
}

@media (max-width: 860px) {
  .api-table__row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
