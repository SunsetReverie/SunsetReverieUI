/**
 * 图标名类型与常用常量
 *
 * W1 阶段 type 为 string；W4 实现 SrIcon 时改为联合字面量，
 * 以便 Volar 在模板中提供补全与拼写校验。
 */

/** 图标名，格式「集合:图标名」 */
export type SrIconName = string

/** 常用图标常量：避免业务侧手写字符串拼错 */
export const SR_ICONS = {
  home: 'lucide:house',
  chevronDown: 'lucide:chevron-down',
  chevronRight: 'lucide:chevron-right',
  close: 'lucide:x',
  check: 'lucide:check',
  loading: 'lucide:loader-circle',
  search: 'lucide:search',
  edit: 'lucide:pencil',
  delete: 'lucide:trash',
  success: 'lucide:circle-check',
  warning: 'lucide:triangle-exclamation-point',
  error: 'lucide:circle-x',
  info: 'lucide:info',
  themeLight: 'lucide:sun',
  themeDark: 'lucide:moon-star',
  settings: 'lucide:settings',
} as const satisfies Record<string, string>

/**
 * 校验图标名格式是否为「集合:图标名」
 * @param name 待校验字符串
 * @returns 格式合法返回 true
 */
export function srIsIconName(name: string): boolean {
  return /^[a-z0-9-]+:[a-z0-9-]+$/.test(name)
}
