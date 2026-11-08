import { ref } from 'vue'

/** 全局消息类型 */
export type SrMessageType = 'info' | 'success' | 'warning' | 'error'

/** 单条全局消息 */
export interface SrMessageItem {
  id: number
  type: SrMessageType
  content: string
  /** 自定义背景色（任意 CSS 颜色） */
  backgroundColor?: string
  /** 自定义文字颜色；深色背景下必须传，否则文字与背景同色 */
  color?: string
  /** 自定义图标颜色，不传则跟随类型的主色 */
  iconColor?: string
}

/**
 * 当前所有全局消息
 * 模块级共享，命令式 API 与渲染容器不走组件树通信。
 */
export const srMessageItems = ref<SrMessageItem[]>([])

/** 各类型对应的图标（均在离线集合内） */
export const SR_MESSAGE_ICONS: Record<SrMessageType, string> = {
  info: 'lucide:info',
  success: 'lucide:circle-check',
  warning: 'lucide:alert-triangle',
  error: 'lucide:circle-x',
}
