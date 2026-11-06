/**
 * 通知提醒 API
 *
 * 与轻提示的分工：Notification 是带标题与描述的通知卡片，
 * 信息量更大、停留更久、默认可手动关闭，落在页面四角。
 *
 * 用法：
 *   srNotification({ title: '同步完成', message: '3 个文件已更新' })
 *   srNotification.success({ title: '保存成功', message: '配置已同步' })
 *   srNotification.error({ title: '请求失败', duration: 0 })
 *
 * 首次调用才创建容器与 Vue 应用，模块顶层不碰 document，SSR 安全。
 */

import { createApp, type App } from 'vue'

import NotificationContainer from './notification-container.vue'
import {
  srNotificationItems,
  type SrNotificationItem,
  type SrNotificationPosition,
  type SrNotificationType,
} from './store'

/** 单条通知的配置（全部可选，标题与描述至少给一个） */
export interface SrNotificationOptions {
  /** 类型 @default 'info' */
  type?: SrNotificationType
  /** 标题 */
  title?: string
  /** 描述内容 */
  message?: string
  /** 停留毫秒，0 表示不自动关闭 @default 4500 */
  duration?: number
  /** 出现位置 @default 'top-right' */
  position?: SrNotificationPosition
  /** 是否显示关闭按钮 @default true */
  closable?: boolean
  /** 自定义背景色（任意 CSS 颜色），设置后覆盖预设玻璃底 */
  backgroundColor?: string
}

/** 命令式 API 的函数签名 */
export interface SrNotificationApi {
  (options: SrNotificationOptions): number
  open: (options: SrNotificationOptions) => number
  info: (options: SrNotificationOptions) => number
  success: (options: SrNotificationOptions) => number
  warning: (options: SrNotificationOptions) => number
  error: (options: SrNotificationOptions) => number
  close: (id: number) => void
  closeAll: () => void
}

/** 同时存在的上限 */
const MAX_COUNT = 5

/** id 种子 */
let seed = 0

/** 挂载的 Vue 应用实例 */
let app: App | null = null

/** 宿主节点 */
let host: HTMLElement | null = null

/** 各通知的定时器 */
const timers = new Map<number, ReturnType<typeof setTimeout>>()

/**
 * 确保容器已挂载；宿主被外部清理时能自愈
 * @returns {void}
 */
function ensureContainer(): void {
  if (typeof document === 'undefined') return
  if (app && host && document.body.contains(host)) return

  if (app) {
    app.unmount()
    app = null
  }
  if (host) {
    host.remove()
    host = null
  }

  host = document.createElement('div')
  host.className = 'sr-notification-root'
  document.body.appendChild(host)

  app = createApp(NotificationContainer)
  app.mount(host)
}

/**
 * 关闭指定通知
 * @param id 通知 id
 */
function close(id: number): void {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }

  const index = srNotificationItems.value.findIndex((item) => item.id === id)
  if (index >= 0) srNotificationItems.value.splice(index, 1)
}

/**
 * 显示一条通知
 * @param options 配置
 * @returns 通知 id；SSR 环境返回 -1
 */
function show(options: SrNotificationOptions = {}): number {
  if (typeof document === 'undefined') return -1

  ensureContainer()

  const item: SrNotificationItem = {
    id: (seed += 1),
    type: options.type ?? 'info',
    title: options.title ?? '',
    message: options.message ?? '',
    position: options.position ?? 'top-right',
    closable: options.closable ?? true,
    ...(options.backgroundColor ? { backgroundColor: options.backgroundColor } : {}),
  }

  srNotificationItems.value.push(item)

  if (srNotificationItems.value.length > MAX_COUNT) {
    const oldest = srNotificationItems.value[0]
    if (oldest) close(oldest.id)
  }

  const duration = options.duration ?? 4500
  if (duration > 0) {
    timers.set(
      item.id,
      setTimeout(() => close(item.id), duration),
    )
  }

  return item.id
}

/** 关闭全部通知 */
function closeAll(): void {
  for (const id of [...timers.keys()]) clearTimeout(timers.get(id))
  timers.clear()
  srNotificationItems.value.splice(0)
}

/** 通知提醒入口 */
export const srNotification: SrNotificationApi = Object.assign(
  (options: SrNotificationOptions) => show(options),
  {
    open: (options: SrNotificationOptions) => show(options),
    info: (options: SrNotificationOptions) => show({ ...options, type: 'info' }),
    success: (options: SrNotificationOptions) => show({ ...options, type: 'success' }),
    warning: (options: SrNotificationOptions) => show({ ...options, type: 'warning' }),
    error: (options: SrNotificationOptions) => show({ ...options, type: 'error' }),
    close,
    closeAll,
  },
)
