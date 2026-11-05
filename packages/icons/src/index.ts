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
  home: 'mdi:home',
  chevronDown: 'mdi:chevron-down',
  chevronRight: 'mdi:chevron-right',
  close: 'mdi:close',
  check: 'mdi:check',
  loading: 'mdi:loading',
  search: 'mdi:magnify',
  edit: 'mdi:pencil',
  delete: 'mdi:delete',
  success: 'mdi:check-circle',
  warning: 'mdi:alert',
  error: 'mdi:close-circle',
  info: 'mdi:information',
  themeLight: 'ph:sun',
  themeDark: 'ph:moon-stars',
  settings: 'ph:gear-six',
} as const satisfies Record<string, string>

/**
 * 校验图标名格式是否为「集合:图标名」
 * @param name 待校验字符串
 * @returns 格式合法返回 true
 */
export function srIsIconName(name: string): boolean {
  return /^[a-z0-9-]+:[a-z0-9-]+$/.test(name)
}
