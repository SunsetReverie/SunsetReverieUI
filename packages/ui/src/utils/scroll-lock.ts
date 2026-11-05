/**
 * 页面滚动锁定
 *
 * 关键细节：直接给 body 设 overflow: hidden 会让滚动条消失，
 * 页面内容整体右移「滚动条宽度」那么多，视觉上会抖一下。
 * 因此需要同时补 padding-right，并在解锁时精确还原。
 *
 * 用计数而非布尔：允许 Modal 与 Drawer 同时打开、依次关闭。
 */

/** 当前锁定层数 */
let lockCount = 0
/** 锁定前的 inline 值，用于还原 */
let originalOverflow = ''
let originalPaddingRight = ''

/**
 * 计算滚动条宽度
 * @returns 宽度（px），无滚动条时为 0
 */
function getScrollbarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth
}

/**
 * 加锁
 * @returns {void}
 */
export function srLockScroll(): void {
  if (typeof document === 'undefined') return

  lockCount += 1
  if (lockCount > 1) return

  const body = document.body
  const scrollbar = getScrollbarWidth()

  originalOverflow = body.style.overflow
  originalPaddingRight = body.style.paddingRight

  body.style.overflow = 'hidden'
  if (scrollbar > 0) {
    const current = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0
    body.style.paddingRight = `${current + scrollbar}px`
  }
}

/**
 * 解锁
 * @returns {void}
 */
export function srUnlockScroll(): void {
  if (typeof document === 'undefined') return
  if (lockCount === 0) return

  lockCount -= 1
  if (lockCount > 0) return

  const body = document.body
  body.style.overflow = originalOverflow
  body.style.paddingRight = originalPaddingRight
}

/**
 * 强制重置（HMR 或异常中断后兜底）
 * @returns {void}
 */
export function srResetScrollLock(): void {
  lockCount = 0
  if (typeof document === 'undefined') return
  document.body.style.overflow = originalOverflow
  document.body.style.paddingRight = originalPaddingRight
}
