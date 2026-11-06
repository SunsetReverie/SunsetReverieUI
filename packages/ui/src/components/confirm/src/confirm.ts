import type { ExtractPropTypes, PropType } from 'vue'

/** 确认框类型：决定图标、图标底色与确认按钮颜色（三者始终同色） */
export type SrConfirmType = 'primary' | 'warning' | 'danger'

/** 各类型对应的图标 */
export const SR_CONFIRM_ICONS: Record<SrConfirmType, string> = {
  primary: 'lucide:info',
  warning: 'lucide:alert-triangle',
  danger: 'lucide:circle-x',
}

export const confirmProps = {
  /** 是否显示，支持 v-model */
  modelValue: {
    type: Boolean,
    default: false,
  },
  /** 类型 @default 'primary' */
  type: {
    type: String as PropType<SrConfirmType>,
    default: 'primary',
  },
  /** 标题 */
  title: {
    type: String,
    default: '',
  },
  /** 说明内容 */
  content: {
    type: String,
    default: '',
  },
  /** 确认按钮文字 */
  confirmText: {
    type: String,
    default: '确认',
  },
  /** 取消按钮文字 */
  cancelText: {
    type: String,
    default: '取消',
  },
  /** 是否显示取消按钮 */
  showCancel: {
    type: Boolean,
    default: true,
  },
  /** 确认按钮加载态，期间禁止关闭 */
  loading: {
    type: Boolean,
    default: false,
  },
  /** 点击遮罩是否取消 @default false */
  maskClosable: {
    type: Boolean,
    default: false,
  },
  /** 面板宽度 */
  width: {
    type: [Number, String] as PropType<number | string>,
    default: 420,
  },
} as const

export type SrConfirmProps = ExtractPropTypes<typeof confirmProps>

/**
 * 命令式配置
 * 与声明式 props 一一对应，另加一个可返回 Promise 的 onConfirm 钩子。
 */
export interface SrConfirmOptions {
  type?: SrConfirmType
  title?: string
  content?: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  maskClosable?: boolean
  width?: number | string
  /**
   * 点击确认后执行；返回 Promise 时自动进入 loading，
   * Promise 完成后才关闭并 resolve(true)。抛错则保持打开以便重试。
   */
  onConfirm?: () => void | Promise<void>
}
