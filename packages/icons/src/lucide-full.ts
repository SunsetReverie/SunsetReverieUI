/**
 * Lucide 全量图标集合（2100 个）
 *
 * 与 `@sunset-reverie/icons/offline` 的分工：
 *   - `offline`：86 个常用子集，已经内联进 `@sunset-reverie/ui` 的产物，装核心库就能用；
 *   - 本入口：完整集合，供需要更多图标的项目**显式引入**，多付约 96KB（gzip）。
 *
 * 用法（应用入口同步调用一次，SSR 之前生效）：
 *
 * ```ts
 * import { srRegisterIcons } from '@sunset-reverie/ui'
 * import { LUCIDE_FULL } from '@sunset-reverie/icons/lucide-full'
 *
 * srRegisterIcons({ lucide: LUCIDE_FULL })
 * ```
 *
 * 不在模块顶层注册：package.json 的 `sideEffects: false` 会让打包器把顶层副作用摇掉。
 */

import lucideFull from './collections/lucide-full.json'

/** Lucide 全量集合数据；注册后 `<SrIcon name="lucide:任意图标" />` 都能本地渲染 */
export const LUCIDE_FULL: Record<string, unknown> = lucideFull

/** 全量集合包含的图标数量，便于运行时自检 */
export const LUCIDE_FULL_SIZE = Object.keys(
  (lucideFull as { icons?: Record<string, unknown> }).icons ?? {},
).length
