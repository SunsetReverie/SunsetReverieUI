/**
 * 全局消息 API
 *
 * 与轻提示的分工：Message 固定在顶部居中、极简一行、不提供关闭按钮，
 * 适合「操作结果」这类一闪而过的反馈；多位置 / 可关闭 / 队列用 srToast。
 *
 * 用法：
 *   srMessage('已保存')
 *   srMessage.success('创建成功')
 *   srMessage.error('网络异常', { duration: 5000 })
 *
 * 首次调用才创建容器与 Vue 应用，模块顶层不碰 document，SSR 安全。
 */

import { createApp, type App } from 'vue'

import MessageContainer from './message-container.vue'
import { srMessageItems, type SrMessageItem, type SrMessageType } from './store'

/** 单条消息的配置 */
export interface SrMessageOptions {
  /** 类型 @default 'info' */
  type?: SrMessageType
  /** 停留毫秒，0 表示不自动关闭 @default 2000 */
  duration?: number
  /** 自定义背景色（任意 CSS 颜色），设置后覆盖预设玻璃底 */
  backgroundColor?: string
}

/** 命令式 API 的函数签名 */
export interface SrMessageApi {
  (content: string, options?: SrMessageOptions): number
  info: (content: string, options?: SrMessageOptions) => number
  success: (content: string, options?: SrMessageOptions) => number
  warning: (content: string, options?: SrMessageOptions) => number
  error: (content: string, options?: SrMessageOptions) => number
  close: (id: number) => void
  closeAll: () => void
}

/** 同时存在的上限：顶部居中的消息叠太多会挡住页面 */
const MAX_COUNT = 3

/** id 种子 */
let seed = 0

/** 挂载的 Vue 应用实例 */
let app: App | null = null

/** 宿主节点 */
let host: HTMLElement | null = null

/** 各消息的定时器 */
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
  host.className = 'sr-message-root'
  document.body.appendChild(host)

  app = createApp(MessageContainer)
  app.mount(host)
}

/**
 * 关闭指定消息
 * @param id 消息 id
 */
function close(id: number): void {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }

  const index = srMessageItems.value.findIndex((item) => item.id === id)
  if (index >= 0) srMessageItems.value.splice(index, 1)
}

/**
 * 显示一条消息
 * @param content 文案
 * @param options 配置
 * @returns 消息 id；SSR 环境返回 -1
 */
function show(content: string, options: SrMessageOptions = {}): number {
  if (typeof document === 'undefined') return -1

  ensureContainer()

  const item: SrMessageItem = {
    id: (seed += 1),
    type: options.type ?? 'info',
    content,
    ...(options.backgroundColor ? { backgroundColor: options.backgroundColor } : {}),
  }

  srMessageItems.value.push(item)

  if (srMessageItems.value.length > MAX_COUNT) {
    const oldest = srMessageItems.value[0]
    if (oldest) close(oldest.id)
  }

  const duration = options.duration ?? 2000
  if (duration > 0) {
    timers.set(
      item.id,
      setTimeout(() => close(item.id), duration),
    )
  }

  return item.id
}

/** 关闭全部消息 */
function closeAll(): void {
  for (const id of [...timers.keys()]) clearTimeout(timers.get(id))
  timers.clear()
  srMessageItems.value.splice(0)
}

/** 全局消息入口 */
export const srMessage: SrMessageApi = Object.assign(
  (content: string, options?: SrMessageOptions) => show(content, options),
  {
    info: (content: string, options?: SrMessageOptions) => show(content, { ...options, type: 'info' }),
    success: (content: string, options?: SrMessageOptions) => show(content, { ...options, type: 'success' }),
    warning: (content: string, options?: SrMessageOptions) => show(content, { ...options, type: 'warning' }),
    error: (content: string, options?: SrMessageOptions) => show(content, { ...options, type: 'error' }),
    close,
    closeAll,
  },
)
