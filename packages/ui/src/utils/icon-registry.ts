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

  for (const [, data] of Object.entries(SR_OFFLINE_COLLECTIONS)) {
    if (!data) continue

    // 刻意不传第二个参数：@iconify/vue 有两个构建，这个参数在
    // iconify.mjs 里是 provider、在 offline.mjs 里是图标名前缀，
    // 传了会把图标注册到错误位置（表现为渲染出空 SVG）。
    // 集合数据自带 prefix，让 Iconify 自己读即可，两种构建都正确。
    addCollection(data as Parameters<typeof addCollection>[0])
  }
}

/**
 * 注册额外的图标集合
 *
 * 核心库内联了 86 个常用图标，够组件自己用；业务侧需要更多图标时，
 * 装 `@sunset-reverie/icons` 包、把对应集合注册进来即可（运行时不发网络请求）：
 *
 * ```ts
 * import { srRegisterIcons } from '@sunset-reverie/ui'
 * import { LUCIDE_FULL } from '@sunset-reverie/icons/lucide-full'
 *
 * srRegisterIcons({ lucide: LUCIDE_FULL })
 * ```
 *
 * 必须在**应用入口同步调用**（SSR 渲染之前），不要放到 `onMounted`，
 * 否则服务端会先产出空 SVG、客户端再渲染出图标，导致水合不匹配。
 * 同一个 prefix 重复注册不会报错，Iconify 会按图标名合并。
 * @param collections 集合数据；也接受直接传数组
 * @returns {void}
 */
export function srRegisterIcons(collections: Record<string, unknown> | unknown[]): void {
  const list = Array.isArray(collections) ? collections : Object.values(collections)

  for (const item of list) {
    if (!item || typeof item !== 'object') continue

    // 与 srEnsureOfflineIcons 同样的理由：不传第二个参数，让集合数据自带的 prefix 生效
    addCollection(item as Parameters<typeof addCollection>[0])
  }
}
