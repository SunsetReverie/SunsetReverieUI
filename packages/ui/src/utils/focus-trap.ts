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
 * 打开弹层时的初始聚焦策略
 *
 * 规则来自 WAI-ARIA dialog 模式：
 * 1. 内容里有输入类元素 → 直接聚焦它（用户打开表单弹窗就是想打字）
 * 2. 否则聚焦容器本身 —— 不要落到第一个按钮上，
 *    那通常是关闭按钮，会让界面一打开就出现一个抢眼的焦点环
 * @param container 容器元素
 * @returns 是否聚焦到了具体控件（false 表示聚焦的是容器本身）
 */
export function srFocusFirst(container: HTMLElement): boolean {
  const list = srGetFocusable(container)

  const input = list.find((element) => /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName))
  if (input) {
    input.focus({ preventScroll: true })
    return true
  }

  // 容器需要可聚焦才能接收焦点；outline 由调用方的样式负责（面板已设 outline: none）
  if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1')
  container.focus({ preventScroll: true })
  return false
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
