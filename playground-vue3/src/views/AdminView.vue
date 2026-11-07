<script setup lang="ts">
import { computed, ref } from 'vue'

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
  SrTag,
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

/** 统计卡片 */
const stats = [
  { label: '组件总数', value: '34', delta: '+4 本周' },
  { label: '本周发布', value: '6', delta: '较上周 +2' },
  { label: '待处理问题', value: '12', delta: '3 个高优先级' },
]

/** 表格列 */
const columns: SrTableColumn[] = [
  { key: 'name', title: '组件', minWidth: 140 },
  { key: 'owner', title: '负责人', width: 110 },
  { key: 'status', title: '状态', width: 110 },
  { key: 'updated', title: '更新时间', width: 130, align: 'right' },
]

/** 表格数据 */
const rows: SrTableRow[] = [
  { id: 1, name: 'SrTable', owner: '林深', status: 'stable', updated: '11-06' },
  { id: 2, name: 'SrNav', owner: '周夏', status: 'beta', updated: '11-07' },
  { id: 3, name: 'SrDrawer', owner: '陈默', status: 'stable', updated: '11-05' },
  { id: 4, name: 'SrTag', owner: '苏白', status: 'beta', updated: '11-07' },
]

/** 状态文案 */
const statusText: Record<string, string> = { stable: '稳定', beta: '预览版' }

/** 折叠按钮提示 */
const toggleText = computed(() => (collapsed.value ? '展开侧栏' : '收起侧栏'))
</script>

<template>
  <div>
    <p class="panel__desc" style="margin: 0 0 16px">
      侧栏可折叠、顶部固定 header，内容区独立滚动 —— 就是一个最小可用的后台骨架。 侧栏用
      <code style="font-family: var(--sr-font-family-mono)">SrNav</code>，header 里的面包屑、
      搜索、通知、用户菜单也都是现成组件拼的。
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
          <button class="admin__toggle" type="button" :title="toggleText" @click="collapsed = !collapsed">
            <SrIcon name="lucide:menu" :size="16" />
          </button>

          <SrBreadcrumb :items="crumbs" separator-icon="lucide:chevron-right" />

          <div class="admin__actions">
            <SrInput class="admin__search" size="sm" placeholder="搜索组件">
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
              <button class="admin__user" type="button">
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

          <SrCard title="最近更新" subtitle="按更新时间排序" style="margin-top: 16px">
            <SrTable :columns="columns" :data="rows">
              <template #cell-status="{ value }">
                <SrTag :type="value === 'stable' ? 'success' : 'warning'" size="sm" round>
                  {{ statusText[value as string] ?? value }}
                </SrTag>
              </template>
            </SrTable>

            <template #footer>
              <SrButton size="sm" variant="text">查看全部</SrButton>
              <SrButton size="sm" variant="primary">新建组件</SrButton>
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
  height: 620px;
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
