import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

import type { SrNavItem } from '@sunset-reverie/ui'

/**
 * 演示站路由
 *
 * 用 hash 而不是 history：演示站是纯静态产物，可能挂在任何静态服务器上
 * （nginx、python -m http.server、对象存储…），这些环境不一定配 SPA fallback。
 * hash 模式下刷新、分享、前进后退都正常，且不依赖服务端配置。
 */
const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/overview' },
  {
    path: '/overview',
    name: 'overview',
    component: () => import('../views/OverviewView.vue'),
    meta: { title: '概览', group: '开始' },
  },
  {
    path: '/theme',
    name: 'theme',
    component: () => import('../views/ThemeLab.vue'),
    meta: { title: '主题实验室', group: '设计系统' },
  },
  {
    path: '/responsive',
    name: 'responsive',
    component: () => import('../views/ResponsiveLab.vue'),
    meta: { title: '断点实验室', group: '设计系统' },
  },
  {
    path: '/audit',
    name: 'audit',
    component: () => import('../views/AuditView.vue'),
    meta: { title: '视觉审计', group: '设计系统' },
  },
  {
    path: '/components',
    name: 'components',
    component: () => import('../views/ComponentsView.vue'),
    meta: { title: '基础组件', group: '组件' },
  },
  {
    path: '/forms',
    name: 'forms',
    component: () => import('../views/FormsView.vue'),
    meta: { title: '表单', group: '组件' },
  },
  {
    path: '/controls',
    name: 'controls',
    component: () => import('../views/ControlsView.vue'),
    meta: { title: '选择控件', group: '组件' },
  },
  {
    path: '/table',
    name: 'table',
    component: () => import('../views/TableView.vue'),
    meta: { title: '数据表格', group: '组件' },
  },
  {
    path: '/display',
    name: 'display',
    component: () => import('../views/DisplayView.vue'),
    meta: { title: '容器与展示', group: '组件' },
  },
  {
    path: '/feedback',
    name: 'feedback',
    component: () => import('../views/FeedbackView.vue'),
    meta: { title: '反馈', group: '组件' },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { title: '后台布局', group: '示例' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/overview' },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

/** 各页面对应的图标 */
const ICONS: Record<string, string> = {
  overview: 'lucide:house',
  theme: 'lucide:sun',
  responsive: 'lucide:settings',
  audit: 'lucide:eye',
  components: 'lucide:inbox',
  forms: 'lucide:pencil',
  controls: 'lucide:check',
  table: 'lucide:image',
  display: 'lucide:play',
  feedback: 'lucide:info',
  admin: 'lucide:moon-star',
}

/** 侧栏菜单：由路由表生成，避免两处维护顺序 */
export const navItems: SrNavItem[] = routes
  .filter((route) => route.name)
  .map((route) => ({
    group: route.meta?.group as string,
    key: route.name as string,
    label: route.meta?.title as string,
    icon: ICONS[route.name as string],
  }))
