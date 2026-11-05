/**
 * 离线图标集合
 *
 * W4 由 scripts/gen-offline-icons.mjs 扫描源码中的「集合:图标名」后子集化生成，
 * 运行期通过 Iconify 的 addCollection 注册，避免内网环境请求 api.iconify.design。
 *
 * 注意：本文件不得有顶层副作用（不在这里调用 addCollection），
 * 否则 package.json 的 sideEffects: false 会让打包器误摇除。注册动作由 SrIcon 执行。
 */

/** 离线集合注册表：键为集合前缀，值为 Iconify 集合数据 */
export const SR_OFFLINE_COLLECTIONS: Record<string, unknown> = {}
