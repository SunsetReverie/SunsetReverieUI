/**
 * 命令式确认框 API
 *
 *   const ok = await srConfirm({ title: '删除记录？', content: '删除后不可恢复', type: 'danger' })
 *   const ok2 = await srConfirm.danger({ title: '删除', onConfirm: () => api.delete(id) })
 *
 * 首次调用才挂载容器，模块顶层不碰 document，SSR 安全（SSR 下直接 resolve(false)）。
 */

import { createApp, type App } from 'vue'

import ConfirmContainer from './confirm-container.vue'
import type { SrConfirmOptions, SrConfirmType } from './confirm'
import { srConfirmItems, srConfirmLoadingIds, type SrConfirmItem } from './store'

/** 命令式 API 签名 */
export interface SrConfirmApi {
  (options: SrConfirmOptions | string): Promise<boolean>
  open: (options: SrConfirmOptions | string) => Promise<boolean>
  primary: (options: SrConfirmOptions | string) => Promise<boolean>
  warning: (options: SrConfirmOptions | string) => Promise<boolean>
  danger: (options: SrConfirmOptions | string) => Promise<boolean>
}

/** id 种子 */
let seed = 0

/** 挂载的 Vue 应用实例 */
let app: App | null = null

/** 宿主节点 */
let host: HTMLElement | null = null

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
  host.className = 'sr-confirm-host'
  document.body.appendChild(host)

  app = createApp(ConfirmContainer)
  app.mount(host)
}

/**
 * 归一化参数：字符串按内容处理
 * @param input 配置或文本
 * @returns 配置对象
 */
function normalize(input: SrConfirmOptions | string): SrConfirmOptions {
  return typeof input === 'string' ? { content: input } : input
}

/**
 * 设置指定条目的加载态
 * @param id 条目 id
 * @param value 是否加载中
 */
function setLoading(id: number, value: boolean): void {
  const next = new Set(srConfirmLoadingIds.value)
  if (value) next.add(id)
  else next.delete(id)
  srConfirmLoadingIds.value = next
}

/**
 * 移除并 resolve 指定确认框
 * @param item 条目
 * @param value 用户是否确认
 */
async function finish(item: SrConfirmItem, value: boolean): Promise<void> {
  if (value && item.options.onConfirm) {
    setLoading(item.id, true)
    try {
      await item.options.onConfirm()
    } catch {
      // 失败时保持打开，允许重试；不 resolve，调用方仍在等待
      setLoading(item.id, false)
      return
    }
  }

  setLoading(item.id, false)
  const index = srConfirmItems.value.findIndex((entry) => entry.id === item.id)
  if (index >= 0) srConfirmItems.value.splice(index, 1)
  item.resolve(value)
}

/**
 * 用户做出选择：由容器在 confirm / cancel 事件里调用
 * @param id 条目 id
 * @param value 是否确认
 */
export function resolveConfirm(id: number, value: boolean): void {
  const item = srConfirmItems.value.find((entry) => entry.id === id)
  if (item) void finish(item, value)
}

/**
 * 打开一个确认框
 * @param input 配置或文本
 * @param forcedType 快捷方法指定的类型
 * @returns 用户是否确认
 */
function show(input: SrConfirmOptions | string, forcedType?: SrConfirmType): Promise<boolean> {
  const options = { ...normalize(input) }
  if (forcedType) options.type = forcedType

  if (typeof document === 'undefined') return Promise.resolve(false)

  ensureContainer()

  // 已有确认框先按「取消」结束，避免遮罩叠多层
  for (const existing of [...srConfirmItems.value]) existing.resolve(false)
  srConfirmItems.value.splice(0)

  return new Promise<boolean>((resolve) => {
    srConfirmItems.value.push({
      id: (seed += 1),
      options: { ...options },
      resolve,
    })
  })
}

/** 命令式确认框入口 */
export const srConfirm: SrConfirmApi = Object.assign((options: SrConfirmOptions | string) => show(options), {
  open: (options: SrConfirmOptions | string) => show(options),
  primary: (options: SrConfirmOptions | string) => show(options, 'primary'),
  warning: (options: SrConfirmOptions | string) => show(options, 'warning'),
  danger: (options: SrConfirmOptions | string) => show(options, 'danger'),
})
