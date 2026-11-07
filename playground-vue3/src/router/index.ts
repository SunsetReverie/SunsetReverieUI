import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

import type { SrNavItem } from '@sunset-reverie/ui'

import { demoGroups } from '../demos/registry'

/**
 * 演示站路由
 *
 * 用 hash 而不是 history：演示站是纯静态产物，可能挂在任何静态服务器上
 * （nginx、python -m http.server、对象存储…），这些环境不一定配 SPA fallback。
 * hash 模式下刷新、分享、前进后退都正常，且不依赖服务端配置。
 *
 * 组件演示走 `/c/:key` 一个动态路由，具体渲染哪个 demo 由注册表决定 ——
 * 新增组件不需要改这里。
 */
const labRoutes: RouteRecordRaw[] = [
  {
    path: '/overview',
    name: 'overview',
    component: () => import('../views/OverviewView.vue'),
    meta: { title: '概览', group: '实验室' },
  },
  {
    path: '/theme',
    name: 'theme',
    component: () => import('../views/ThemeLab.vue'),
    meta: { title: '主题实验室', group: '实验室' },
  },
  {
    path: '/responsive',
    name: 'responsive',
    component: () => import('../views/ResponsiveLab.vue'),
    meta: { title: '断点实验室', group: '实验室' },
  },
  {
    path: '/audit',
    name: 'audit',
    component: () => import('../views/AuditView.vue'),
    meta: { title: '视觉审计', group: '实验室' },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { title: '后台布局', group: '实验室' },
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/overview' },
    ...labRoutes,
    {
      path: '/c/:key',
      name: 'component',
      component: () => import('../demos/DemoPage.vue'),
      meta: { title: '组件演示' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/overview' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

/** 各实验室页面对应的图标 */
const LAB_ICONS: Record<string, string> = {
  overview: 'lucide:house',
  theme: 'lucide:sun',
  responsive: 'lucide:settings',
  audit: 'lucide:eye',
  admin: 'lucide:moon-star',
}

/**
 * 侧栏菜单
 *
 * 一组件一项：找组件时直接看左侧列表，不用在长页面里翻。
 * 分组来自注册表，新增组件自动出现在这里。
 */
export const navItems: SrNavItem[] = [
  ...labRoutes.map((route) => ({
    group: '实验室',
    key: route.name as string,
    label: route.meta?.title as string,
    icon: LAB_ICONS[route.name as string],
  })),
  ...demoGroups.flatMap((group) =>
    group.items.map((item) => ({
      group: group.title,
      key: `c-${item.key}`,
      label: item.name.replace(/^Sr/, ''),
      icon: 'lucide:box',
    })),
  ),
]

/**
 * 侧栏 key 与路由的双向映射
 * @param key 侧栏 key
 * @returns 路由位置
 */
export function navKeyToRoute(key: string): { name: string; params?: Record<string, string> } {
  if (key.startsWith('c-')) return { name: 'component', params: { key: key.slice(2) } }
  return { name: key }
}

/**
 * 路由转侧栏 key
 * @param routeName 路由名
 * @param paramKey 组件演示的 key
 * @returns 侧栏 key
 */
export function routeToNavKey(routeName: string, paramKey?: string): string {
  if (routeName === 'component' && paramKey) return `c-${paramKey}`
  return routeName
}
