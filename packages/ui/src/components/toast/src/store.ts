import { ref } from 'vue'

/** 提示类型 */
export type SrToastType = 'info' | 'success' | 'warning' | 'error'

/** 出现位置 */
export type SrToastPosition = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right'

/** 单条提示 */
export interface SrToastItem {
  id: number
  type: SrToastType
  message: string
  position: SrToastPosition
  closable: boolean
}

/**
 * 当前所有提示
 * 放在模块级：命令式 API 与渲染容器共享同一份数据，
 * 不需要经过组件树（Toast 天然是「组件树之外」的东西）。
 */
export const srToastItems = ref<SrToastItem[]>([])

/** 渲染顺序固定，避免每次分组顺序抖动 */
export const SR_TOAST_POSITIONS: SrToastPosition[] = [
  'top-left',
  'top',
  'top-right',
  'bottom-left',
  'bottom',
  'bottom-right',
]

/** 各类型对应的图标（均在离线集合内） */
export const SR_TOAST_ICONS: Record<SrToastType, string> = {
  info: 'mdi:information',
  success: 'mdi:check-circle',
  warning: 'mdi:alert',
  error: 'mdi:close-circle',
}
