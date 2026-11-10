<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import apiData from '../demos/props.json'
import { demoEntries, demoGroups } from '../demos/registry'
import { navItems } from '../router'

import {
  SrAvatar,
  SrBadge,
  SrBreadcrumb,
  SrButton,
  SrCard,
  SrDropdown,
  SrIcon,
  SrInput,
  SrNav,
  SrTable,
  type SrNavItem,
  type SrTableColumn,
  type SrTableRow,
} from '@sunset-reverie/ui'

defineOptions({ name: 'AdminView' })

/** 侧栏是否收起 */
const collapsed = ref(false)

/** 当前选中菜单 */
const menuKey = ref('overview')

/** 侧栏菜单：品牌 + 分组 + 子项 */
const menus: SrNavItem[] = [
  { group: '工作台', key: 'overview', label: '概览', icon: 'lucide:house' },
  {
    group: '工作台',
    key: 'res',
    label: '资源',
    icon: 'lucide:inbox',
    children: [
      { key: 'file', label: '文件' },
      { key: 'image', label: '图片' },
      { key: 'video', label: '视频' },
    ],
  },
  {
    group: '工作台',
    key: 'team',
    label: '团队',
    icon: 'lucide:heart',
    children: [
      { key: 'member', label: '成员' },
      { key: 'role', label: '角色' },
    ],
  },
  { group: '系统', key: 'setting', label: '设置', icon: 'lucide:settings', divider: true },
  { group: '系统', key: 'trash', label: '回收站', icon: 'lucide:trash' },
]

/** 面包屑 */
const crumbs = [{ label: '工作台', href: '#' }, { label: '概览' }]

/** 用户菜单 */
const userMenus = [
  { key: 'profile', label: '个人资料', icon: 'lucide:heart' },
  { key: 'setting', label: '账号设置', icon: 'lucide:settings' },
  { key: 'logout', label: '退出登录', danger: true, divided: true },
]

const router = useRouter()

/** 搜索词：真正过滤下方的组件表，不再是个摆设输入框 */
const keyword = ref('')

/** 是否展开全部组件行 */
const showAll = ref(false)

/**
 * 统计卡片
 *
 * 全部取自注册表与路由，避免样张里出现「34 个组件 / 本周发布 6」这类
 * 和库里 68 个组件对不上的编造数字。
 */
const stats = computed(() => [
  { label: '组件演示', value: String(demoEntries.length), delta: '每个都有独立页面' },
  { label: '组件分类', value: String(demoGroups.length), delta: '侧栏按分类分组' },
  {
    label: '实验室',
    value: String(navItems.filter((item) => item.group === '实验室').length),
    delta: '主题 / 断点 / 视觉审计等',
  },
])

/** 表格列：字段都来自注册表与 API 产物，不编造负责人与更新时间 */
const columns: SrTableColumn[] = [
  { key: 'name', title: '组件', minWidth: 150 },
  { key: 'group', title: '分类', width: 130 },
  { key: 'props', title: 'Props 数', width: 100, align: 'right' },
  { key: 'page', title: '演示页', width: 130 },
]

/** 表格数据：整个组件库都能搜，默认只显示前 6 条 */
const allRows: SrTableRow[] = demoEntries.map((item, index) => {
  const group = demoGroups.find((g) => g.items.includes(item))?.title ?? '—'
  const apiKey = item.api ?? item.key
  const options = (apiData as Record<string, { options?: unknown[] } | undefined>)[apiKey]?.options ?? []

  return {
    id: index + 1,
    name: item.name,
    group,
    props: options.length,
    page: `#/c/${item.key}`,
    search: `${item.name} ${item.key} ${group} ${item.description}`.toLowerCase(),
  }
})

/** 当前展示的行：有搜索词时显示全部命中，否则按 showAll 截断 */
const rows = computed<SrTableRow[]>(() => {
  const q = keyword.value.trim().toLowerCase()
  const matched = q ? allRows.filter((row) => String(row.search).includes(q)) : allRows
  return showAll.value || q ? matched : matched.slice(0, 6)
})

/**
 * 打开当前列表里的第一个组件演示页
 * @returns 无；没有命中时什么也不做
 */
function openFirst(): void {
  const first = rows.value[0]
  if (!first) return
  const key = String(first.page).replace('#/c/', '')
  void router.push({ name: 'component', params: { key } })
}

/** 折叠按钮提示 */
const toggleText = computed(() => (collapsed.value ? '展开侧栏' : '收起侧栏'))
</script>

<template>
  <div>
    <p class="panel__desc" style="margin: 0 0 16px">
      侧栏可折叠、顶部固定 header，内容区独立滚动 —— 就是一个最小可用的后台骨架。 侧栏用
      <code style="font-family: var(--sr-font-family-mono)">SrNav</code>，header 里的面包屑、
      搜索、通知、用户菜单也都是现成组件拼的。下面的统计与表格直接读演示注册表和 API
      产物，搜索、展开、按钮都是真的。
    </p>

    <!-- 模拟一个应用窗口，这样在演示页里也能看出真实布局 -->
    <div class="admin" :class="{ 'is-collapsed': collapsed }">
      <aside class="admin__side">
        <SrNav
          v-model="menuKey"
          bare
          :items="menus"
          logo="lucide:moon-star"
          title="夕梦 UI"
          mode="vertical"
          active-style="bar"
          :collapsed="collapsed"
          :width="204"
        />
      </aside>

      <div class="admin__main">
        <header class="admin__header">
          <button
            class="admin__toggle"
            type="button"
            :title="toggleText"
            :aria-label="toggleText"
            @click="collapsed = !collapsed"
          >
            <SrIcon name="lucide:menu" :size="16" />
          </button>

          <SrBreadcrumb :items="crumbs" separator-icon="lucide:chevron-right" />

          <div class="admin__actions">
            <SrInput
              v-model="keyword"
              class="admin__search"
              size="sm"
              clearable
              placeholder="搜索组件"
              aria-label="搜索组件"
            >
              <template #prefix>
                <SrIcon name="lucide:search" :size="14" />
              </template>
            </SrInput>

            <SrBadge dot>
              <button class="admin__icon-btn" type="button" aria-label="通知">
                <SrIcon name="lucide:inbox" :size="16" />
              </button>
            </SrBadge>

            <SrDropdown :items="userMenus" placement="bottom-end">
              <button class="admin__user" type="button" aria-label="用户菜单">
                <SrAvatar alt="林" size="sm" />
                <span class="admin__user-name">林深</span>
                <SrIcon name="lucide:chevron-down" :size="14" />
              </button>
            </SrDropdown>
          </div>
        </header>

        <div class="admin__content">
          <div class="admin__stats">
            <SrCard v-for="item in stats" :key="item.label" :title="item.label" size="sm">
              <p class="admin__stat-value">{{ item.value }}</p>
              <p class="admin__stat-delta">{{ item.delta }}</p>
            </SrCard>
          </div>

          <SrCard
            title="组件清单"
            :subtitle="`来自演示注册表 · 当前显示 ${rows.length} / ${allRows.length}`"
            style="margin-top: 16px"
          >
            <SrTable v-if="rows.length" :columns="columns" :data="rows" />
            <p v-else class="admin__empty">没有匹配的组件，换个关键词试试</p>

            <template #footer>
              <SrButton size="sm" variant="text" @click="showAll = !showAll">
                {{ showAll ? '只看前 6 条' : `查看全部 ${allRows.length} 个` }}
              </SrButton>
              <SrButton size="sm" variant="primary" :disabled="!rows.length" @click="openFirst">
                打开组件页
              </SrButton>
            </template>
          </SrCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin {
  display: flex;
  /* 小视口里 620px 会把页面撑到一屏半，按视口高度收敛 */
  height: min(620px, 78vh);
  overflow: hidden;
  border: 1px solid var(--sr-color-border);
  border-radius: 16px;
  background: var(--sr-color-bg-sunken);
  box-shadow: var(--sr-shadow-md);
}

.admin__side {
  flex: 0 0 auto;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid var(--sr-color-border-subtle);
}

.admin__main {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
}

/* header 固定，不随内容滚动 */
.admin__header {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 0 0 auto;
  height: 56px;
  padding: 0 18px;
  border-bottom: 1px solid var(--sr-color-border-subtle);
  background: color-mix(in srgb, var(--sr-color-bg-container) 62%, transparent);
  backdrop-filter: var(--sr-glass-filter);
}

.admin__toggle,
.admin__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: var(--sr-radius-sm);
  background: transparent;
  color: var(--sr-color-text-secondary);
  cursor: pointer;
  transition: background-color var(--sr-motion-duration-fast) var(--sr-motion-easing-standard);
}

.admin__toggle:hover,
.admin__icon-btn:hover {
  background: var(--sr-color-primary-alpha-08);
  color: var(--sr-color-primary-text);
}

.admin__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.admin__search {
  width: 168px;
  max-width: 40vw;
}

.admin__empty {
  margin: 0;
  padding: 24px 0;
  color: var(--sr-color-text-tertiary);
  font-size: 13px;
  text-align: center;
}

.admin__toggle:focus-visible,
.admin__icon-btn:focus-visible,
.admin__user:focus-visible {
  outline: 2px solid var(--sr-color-primary);
  outline-offset: 2px;
}

@media (max-width: 620px) {
  .admin__side {
    display: none;
  }

  .admin__user-name {
    display: none;
  }
}

.admin__user {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 3px 8px 3px 4px;
  border: 0;
  border-radius: var(--sr-radius-full);
  background: transparent;
  color: var(--sr-color-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: background-color var(--sr-motion-duration-fast) var(--sr-motion-easing-standard);
}

.admin__user:hover {
  background: var(--sr-color-primary-alpha-08);
}

.admin__user-name {
  white-space: nowrap;
}

/* 内容区自己滚，header 与侧栏都不动 */
.admin__content {
  flex: 1 1 auto;
  padding: 18px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--sr-color-text) 20%, transparent) transparent;
}

.admin__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 14px;
}

.admin__stat-value {
  margin: 0;
  color: var(--sr-color-text);
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
}

.admin__stat-delta {
  margin: 4px 0 0;
  color: var(--sr-color-text-tertiary);
  font-size: 12px;
}
</style>
