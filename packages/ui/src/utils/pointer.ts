/**
 * 指针按下状态
 *
 * 解决的是「点击被吞」这一类问题：一次点击的事件序列是
 * `pointerdown → mousedown → blur → mouseup → click`，
 * 如果 `blur` 里同步做的更新改变了布局（例如表单项插入错误文案把居中弹窗顶高），
 * 按钮会在 mouseup 之前位移，浏览器就把这次点击判给共同的祖先元素 ——
 * 表现就是「第一次点没反应，第二次才生效」。
 *
 * 这里把「指针是否按下」做成模块级状态，需要推迟的更新等 pointerup 之后再执行，
 * 并放到宏任务里，确保 mouseup / click 都已派发完毕。
 */

/** 是否有指针正在按下 */
let pressed = false

/** 等待指针抬起的回调 */
const waiters = new Set<() => void>()

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    () => {
      pressed = true
    },
    true,
  )

  window.addEventListener('pointerup', release, true)
  // 触摸被系统中断时也要释放，否则回调永远等不到
  window.addEventListener('pointercancel', release, true)
}

/**
 * 指针抬起：执行等待中的回调
 * @returns {void}
 */
function release(): void {
  pressed = false
  if (waiters.size === 0) return

  const callbacks = [...waiters]
  waiters.clear()

  // 宏任务：click 在 pointerup 之后同步派发，这里再更新 DOM 就不会影响这次点击
  setTimeout(() => {
    for (const callback of callbacks) callback()
  }, 0)
}

/**
 * 当前是否有指针按下
 * @returns 按下中返回 true
 */
export function srIsPointerPressed(): boolean {
  return pressed
}

/**
 * 指针未按下时立即执行，按下中则等抬起（click 之后）再执行
 *
 * @param callback 需要执行的更新
 * @returns {void}
 */
export function srRunAfterPointerRelease(callback: () => void): void {
  if (!pressed) {
    callback()
    return
  }
  waiters.add(callback)
}
