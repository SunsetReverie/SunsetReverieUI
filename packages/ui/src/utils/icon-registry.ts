/**
 * 离线图标集合注册
 *
 * 关键约束：必须在 SSR 渲染之前完成注册，否则服务端会产出空 SVG，
 * 客户端再渲染出图标 —— 这正是水合不匹配的典型来源。
 *
 * 因此注册动作由 SrIcon 在 setup 阶段触发（setup 在服务端同样执行），
 * 而不是放到 onMounted 里。模块级 flag 保证整个进程只注册一次。
 *
 * 同时这也满足 icons 包的 sideEffects: false —— 注册不是模块顶层副作用。
 */

import { addCollection } from '@iconify/vue'

import { SR_OFFLINE_COLLECTIONS } from '@sunset-reverie/icons/offline'

/** 是否已完成注册（模块级，跨实例共享） */
let registered = false

/**
 * 注册全部离线图标集合
 * 幂等：重复调用不会重复注册
 * @returns {void}
 */
export function srEnsureOfflineIcons(): void {
  if (registered) return
  registered = true

  for (const [prefix, data] of Object.entries(SR_OFFLINE_COLLECTIONS)) {
    if (!data) continue
    addCollection(data as Parameters<typeof addCollection>[0], prefix)
  }
}
