import { ref } from 'vue'

/** 通知类型 */
export type SrNotificationType = 'info' | 'success' | 'warning' | 'error'

/** 通知出现的位置 */
export type SrNotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

/** 单条通知 */
export interface SrNotificationItem {
  id: number
  type: SrNotificationType
  title: string
  message: string
  position: SrNotificationPosition
  closable: boolean
  /** 自定义背景色（任意 CSS 颜色） */
  backgroundColor?: string
}

/** 当前所有通知：模块级共享，命令式 API 与容器不走组件树通信 */
export const srNotificationItems = ref<SrNotificationItem[]>([])

/** 渲染顺序固定，避免分组顺序抖动 */
export const SR_NOTIFICATION_POSITIONS: SrNotificationPosition[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
]

/** 各类型对应的图标（均在离线集合内） */
export const SR_NOTIFICATION_ICONS: Record<SrNotificationType, string> = {
  info: 'lucide:info',
  success: 'lucide:circle-check',
  warning: 'lucide:alert-triangle',
  error: 'lucide:circle-x',
}
