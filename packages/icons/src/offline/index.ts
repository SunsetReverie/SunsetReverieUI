/**
 * 离线图标集合
 *
 * 数据来自 `pnpm gen:icons` 的子集化产物：
 * 扫描源码中的「集合:图标名」→ 从 @iconify-json/<集合> 提取 → 只保留用到的。
 *
 * 为什么不整体打包：Lucide 全量 2100+ 图标约 2MB，会让库体积失控。
 *
 * 注意：本文件不得有顶层副作用（不在这里调用 addCollection），
 * 否则 package.json 的 sideEffects: false 会让打包器误摇除。
 * 注册动作由 SrIcon 在 setup 阶段执行。
 */

import lucide from '../collections/lucide.json'

/** 离线集合注册表：键为集合前缀，值为 Iconify 集合数据 */
export const SR_OFFLINE_COLLECTIONS: Record<string, unknown> = {
  lucide,
}
