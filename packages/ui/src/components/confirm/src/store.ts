import { ref } from 'vue'

import type { SrConfirmOptions } from './confirm'

/** 一条正在展示的命令式确认框 */
export interface SrConfirmItem {
  id: number
  options: SrConfirmOptions
  /** Promise 的 resolve，值为用户是否确认 */
  resolve: (value: boolean) => void
}

/** 当前确认框；同一时刻只允许一个，避免多层遮罩 */
export const srConfirmItems = ref<SrConfirmItem[]>([])

/**
 * 正在执行 onConfirm 的条目 id 集合。
 * 不把 ref 塞进 item 里：ref() 会深度解包，Ref<boolean> 会被抹成 boolean。
 * 每次替换整个 Set 来触发响应式更新。
 */
export const srConfirmLoadingIds = ref<Set<number>>(new Set())
