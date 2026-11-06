/**
 * 命令式提示 API
 *
 * 用法：
 *   srToast('保存成功')
 *   srToast.success('保存成功')
 *   srToast.error('网络异常', { duration: 5000 })
 *
 * 实现要点：
 * 1. 首次调用时才创建容器与 Vue 应用 —— 不在模块顶层碰 document，SSR 安全
 * 2. 每个提示独立定时器，手动关闭时清掉，避免「关掉又被定时器移除一次」
 * 3. 最多同时 5 条，超出时先移除最早的，防止刷屏
 */

import { createApp, type App } from 'vue'

import ToastContainer from './toast-container.vue'
import { srToastItems, type SrToastItem, type SrToastPosition, type SrToastType } from './store'

/** 单条提示的配置 */
export interface SrToastOptions {
  /** 类型 @default 'info' */
  type?: SrToastType
  /** 停留毫秒，0 表示不自动关闭 @default 3000 */
  duration?: number
  /** 出现位置 @default 'top' */
  position?: SrToastPosition
  /** 是否显示关闭按钮 @default false */
  closable?: boolean
  /** 自定义背景色（任意 CSS 颜色），设置后覆盖预设玻璃底 */
  backgroundColor?: string
}

/** 命令式 API 的函数签名 */
export interface SrToastApi {
  (message: string, options?: SrToastOptions): number
  info: (message: string, options?: SrToastOptions) => number
  success: (message: string, options?: SrToastOptions) => number
  warning: (message: string, options?: SrToastOptions) => number
  error: (message: string, options?: SrToastOptions) => number
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

/** 各提示的定时器 */
const timers = new Map<number, ReturnType<typeof setTimeout>>()

/**
 * 确保容器已挂载
 *
 * 会校验宿主是否仍在文档中：热更新或外部清理 DOM 后能自愈，
 * 否则会出现「数据有了但页面上什么都没有」的静默失效。
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
  host.className = 'sr-toast-root'
  document.body.appendChild(host)

  app = createApp(ToastContainer)
  app.mount(host)
}

/**
 * 关闭指定提示
 * @param id 提示 id
 */
function close(id: number): void {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }

  const index = srToastItems.value.findIndex((item) => item.id === id)
  if (index >= 0) srToastItems.value.splice(index, 1)
}

/**
 * 显示一条提示
 * @param message 文案
 * @param options 配置
 * @returns 提示 id，可用于手动关闭；SSR 环境返回 -1
 */
function show(message: string, options: SrToastOptions = {}): number {
  if (typeof document === 'undefined') return -1

  ensureContainer()

  const item: SrToastItem = {
    id: (seed += 1),
    type: options.type ?? 'info',
    message,
    position: options.position ?? 'top',
    closable: options.closable ?? false,
    ...(options.backgroundColor ? { backgroundColor: options.backgroundColor } : {}),
  }

  srToastItems.value.push(item)

  // 超出上限：先关最早的
  if (srToastItems.value.length > MAX_COUNT) {
    const oldest = srToastItems.value[0]
    if (oldest) close(oldest.id)
  }

  const duration = options.duration ?? 3000
  if (duration > 0) {
    timers.set(
      item.id,
      setTimeout(() => close(item.id), duration),
    )
  }

  return item.id
}

/**
 * 关闭全部提示
 */
function closeAll(): void {
  for (const id of [...timers.keys()]) {
    clearTimeout(timers.get(id))
  }
  timers.clear()
  srToastItems.value.splice(0)
}

/**
 * 命令式提示入口
 *
 * 作为函数可直接调用，同时挂了 info / success / warning / error 快捷方法。
 */
export const srToast: SrToastApi = Object.assign(
  (message: string, options?: SrToastOptions) => show(message, options),
  {
    info: (message: string, options?: SrToastOptions) => show(message, { ...options, type: 'info' }),
    success: (message: string, options?: SrToastOptions) => show(message, { ...options, type: 'success' }),
    warning: (message: string, options?: SrToastOptions) => show(message, { ...options, type: 'warning' }),
    error: (message: string, options?: SrToastOptions) => show(message, { ...options, type: 'error' }),
    close,
    closeAll,
  },
)
