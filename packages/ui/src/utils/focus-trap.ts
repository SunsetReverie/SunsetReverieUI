/**
 * 焦点陷阱
 *
 * 弹层打开时把 Tab 焦点锁在内部，关闭后归还触发元素。
 * 不引入 focus-trap 之类的依赖：需求只有「循环 Tab」这一件事，手写更可控。
 */

/** 可聚焦元素选择器 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * 收集容器内可聚焦且可见的元素
 * @param container 容器元素
 * @returns 可聚焦元素列表（按 DOM 顺序）
 */
export function srGetFocusable(container: HTMLElement): HTMLElement[] {
  const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))

  return nodes.filter((node) => {
    // 用 offsetParent 判断可见性：display:none 与祖先隐藏都会返回 null
    const visible = node.offsetParent !== null || node === document.activeElement
    return visible && !node.hasAttribute('aria-hidden')
  })
}

/**
 * 把焦点移到容器内第一个可聚焦元素
 * @param container 容器元素
 * @returns 是否成功聚焦
 */
export function srFocusFirst(container: HTMLElement): boolean {
  const list = srGetFocusable(container)
  if (list.length === 0) {
    // 没有任何可聚焦元素时，让容器本身接住焦点，避免焦点跑回 body
    if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1')
    container.focus({ preventScroll: true })
    return false
  }
  list[0].focus({ preventScroll: true })
  return true
}

/**
 * 处理 Tab 键，实现首尾循环
 * @param container 容器元素
 * @param event 键盘事件
 * @returns 是否已接管（true 表示调用了 preventDefault）
 */
export function srTrapTab(container: HTMLElement, event: KeyboardEvent): boolean {
  const list = srGetFocusable(container)
  if (list.length === 0) {
    event.preventDefault()
    container.focus({ preventScroll: true })
    return true
  }

  const first = list[0]
  const last = list[list.length - 1]
  const active = document.activeElement as HTMLElement | null

  // 焦点已经不在容器内（比如被鼠标点到别处），先拉回来
  if (!active || !container.contains(active)) {
    event.preventDefault()
    ;(event.shiftKey ? last : first).focus({ preventScroll: true })
    return true
  }

  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus({ preventScroll: true })
    return true
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus({ preventScroll: true })
    return true
  }

  return false
}
