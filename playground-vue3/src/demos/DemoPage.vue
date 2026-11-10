<script setup lang="ts">
import { computed, defineAsyncComponent, h, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { SrButton, SrCodeBlock, SrIcon } from '@sunset-reverie/ui'

import propsData from './props.json'
import { findDemo } from './registry'

defineOptions({ name: 'DemoPage' })

/** 当前路由参数 */
const route = useRoute()

/** 当前组件条目 */
const entry = computed(() => findDemo(String(route.params.key ?? '')))

/** 演示加载中的占位：异步组件在慢网下也要有反馈 */
const DemoLoading = {
  /**
   * 渲染加载提示
   * @returns 提示节点
   */
  render: () => h('p', { class: 'demo-page__status' }, '演示加载中…'),
}

/** 演示加载失败的占位：不再是一片空白让人以为页面坏了 */
const DemoError = {
  /**
   * 渲染失败提示
   * @returns 提示节点
   */
  render: () => h('p', { class: 'demo-page__status is-error' }, '演示加载失败，请刷新页面重试。'),
}

/** 懒加载演示组件，带加载态与失败态 */
const demo = computed(() => {
  const found = entry.value
  if (!found) return null
  return defineAsyncComponent({
    loader: found.demo,
    loadingComponent: DemoLoading,
    errorComponent: DemoError,
    delay: 120,
  })
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

/** 单组组件 API 数据 */
interface ApiData {
  options: PropRow[]
  emits: EmitRow[]
  slots: string[]
}

/**
 * 当前页要展示的全部 API 数据
 *
 * 一个演示页可能对应多个组件（SrRow / SrCol 共用一个演示），
 * 过去只取主组件那一组，SrCol 的 Props 表就永远不显示。
 */
const apiList = computed<ApiData[]>(() => {
  const found = entry.value
  if (!found) return []
  const names = [found.api ?? found.key, ...(found.extraApi ?? [])]
  const data = propsData as Record<string, ApiData | undefined>
  return names.map((name) => data[name]).filter((item): item is ApiData => Boolean(item))
})

/** 合并后的事件列表 */
const emits = computed(() => apiList.value.flatMap((item) => item.emits))

/** 合并后的插槽列表（多组件同页时去重） */
const slots = computed(() => [...new Set(apiList.value.flatMap((item) => item.slots))])

/**
 * 把 props 变量名转成组件显示名
 * @param from 变量名，如 formItemProps
 * @returns 组件名，如 SrFormItem
 */
function sourceLabel(from: string): string {
  const base = from.replace(/Props$/, '')
  return 'Sr' + base.charAt(0).toUpperCase() + base.slice(1)
}

/** 按来源分组：Form 与 FormItem、Row 与 Col 混在一张表里会重名 */
const propGroups = computed(() => {
  const map = new Map<string, PropRow[]>()
  for (const item of apiList.value) {
    for (const row of item.options) {
      const list = map.get(row.from) ?? []
      list.push(row)
      map.set(row.from, list)
    }
  }
  return [...map.entries()].map(([from, options]) => ({ from, options }))
})

/**
 * 所有演示文件的源码加载器
 *
 * Vite 的 glob + ?raw 让源码跟着演示文件走：新增 demo 不必登记，
 * 也不用手抄示例代码（手抄的一定会过期）。
 */
const sourceLoaders = import.meta.glob('./**/*Demo.vue', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

/** 已加载的源码，切回同一页不必重复请求 */
const sourceCache = ref<Record<string, string>>({})

/** 当前演示的源码 */
const source = computed(() => sourceCache.value[entry.value?.key ?? ''] ?? '')

/** 源码面板是否展开 */
const sourceOpen = ref(false)

/** 源码是否加载失败 */
const sourceError = ref(false)

/** 当前演示对应的源码加载器（依赖「目录名 = 组件 key」的约定） */
const sourceLoader = computed(() => {
  const key = entry.value?.key
  if (!key) return null
  const prefix = `./${key}/`
  const file = Object.keys(sourceLoaders).find((path) => path.startsWith(prefix) && path.endsWith('Demo.vue'))
  return file ? sourceLoaders[file] : null
})

/**
 * 按需载入当前演示的源码
 *
 * 只在展开时请求，失败记在 sourceError 里；不会因单个 demo 的源码读取失败
 * 而让整个页面报错。
 * @returns 载入结束后 resolve
 */
async function loadSource(): Promise<void> {
  const key = entry.value?.key
  const loader = sourceLoader.value
  if (!key || !loader || sourceCache.value[key]) return
  sourceError.value = false
  try {
    const code = await loader()
    sourceCache.value = { ...sourceCache.value, [key]: code }
  } catch {
    sourceError.value = true
  }
}

/** 展开时、或带着展开状态切到别的组件页时，自动载入新页源码 */
watch([entry, sourceOpen], () => {
  if (sourceOpen.value) void loadSource()
})
</script>

<template>
  <div v-if="entry" class="demo-page">
    <header class="demo-page__head">
      <h1 class="demo-page__title">{{ entry.name }}</h1>
      <p class="demo-page__desc">{{ entry.description }}</p>
    </header>

    <component :is="demo" v-if="demo" />

    <!-- 示例源码：默认折叠，展开才去取 ?raw，可一键复制 -->
    <section v-if="sourceLoader" class="demo-page__source">
      <div class="demo-page__source-head">
        <SrButton variant="text" size="sm" :aria-expanded="sourceOpen" @click="sourceOpen = !sourceOpen">
          {{ sourceOpen ? '收起示例源码' : '查看示例源码' }}
          <SrIcon :name="sourceOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="14" />
        </SrButton>
        <span class="demo-page__source-hint">上方演示的完整源码，直接来自本仓库，可复制使用</span>
      </div>

      <div v-if="sourceOpen" class="demo-page__source-body">
        <p v-if="sourceError" class="demo-page__status is-error">示例源码加载失败，请刷新页面重试。</p>
        <p v-else-if="!source" class="demo-page__status">正在读取源码…</p>
        <SrCodeBlock
          v-else
          :code="source"
          lang="vue"
          copyable
          line-numbers
          :title="`${entry?.name ?? ''} 演示源码`"
        />
      </div>
    </section>

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

    <section v-if="emits.length" class="demo-page__api">
      <h2 class="demo-page__section">事件</h2>
      <div class="api-table">
        <div class="api-table__row api-table__row--head">
          <span>事件</span>
          <span>参数</span>
          <span />
          <span />
        </div>
        <div v-for="event in emits" :key="event.name" class="api-table__row">
          <code class="api-table__name">{{ event.name }}</code>
          <code class="api-table__type">{{ event.params.join(', ') || '—' }}</code>
          <span />
          <span />
        </div>
      </div>
    </section>

    <section v-if="slots.length" class="demo-page__api">
      <h2 class="demo-page__section">插槽</h2>
      <p class="demo-page__slots">
        <code v-for="slot in slots" :key="slot">{{ slot }}</code>
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

/* 示例源码：折叠条与演示之间留一道浅分隔，避免和演示内容混在一起 */
.demo-page__source {
  padding: 12px 14px;
  border: 1px solid var(--sr-color-border-subtle);
  border-radius: var(--sr-radius-base);
  background: color-mix(in srgb, var(--sr-color-bg-container) 45%, transparent);
}

.demo-page__source-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
}

.demo-page__source-hint {
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}

.demo-page__source-body {
  margin-top: 10px;
  /* 有的 demo 三四百行，不封顶会把下面的 API 表推到屏幕外 */
  max-height: 520px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.demo-page__status {
  margin: 0;
  padding: 16px 0;
  color: var(--sr-color-text-tertiary);
  font-size: 13px;
}

.demo-page__status.is-error {
  color: var(--sr-color-danger);
}

/* API 区块与上方演示之间留出一点额外呼吸 */
.demo-page__api {
  padding-top: 4px;
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
  grid-template-columns: 130px minmax(170px, 1.15fr) 100px minmax(150px, 1.5fr);
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
  /* 类型名里的 | 两侧有空格，允许在空格处折行，但不把单词拆开 */
  overflow-wrap: break-word;
}

.api-table__default {
  color: var(--sr-color-text-tertiary);
  font-family: var(--sr-font-family-mono);
}

.api-table__desc {
  color: var(--sr-color-text-secondary);
  line-height: 1.65;
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
