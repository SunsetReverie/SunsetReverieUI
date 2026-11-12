import { afterEach, describe, expect, it, vi } from 'vitest'

import { srIsPointerPressed, srRunAfterPointerRelease } from '../pointer'

/** 触发一次指针按下 */
function press(): void {
  window.dispatchEvent(new Event('pointerdown'))
}

/** 触发一次指针抬起 */
function release(): void {
  window.dispatchEvent(new Event('pointerup'))
}

afterEach(() => {
  release()
  vi.useRealTimers()
})

describe('pointer', () => {
  it('未按下时立即执行', () => {
    let ran = false
    srRunAfterPointerRelease(() => {
      ran = true
    })

    expect(ran).toBe(true)
  })

  it('按下期间推迟，抬起后（宏任务里）执行', () => {
    vi.useFakeTimers()
    press()
    expect(srIsPointerPressed()).toBe(true)

    let ran = false
    srRunAfterPointerRelease(() => {
      ran = true
    })

    // 按下中不执行：此时更新 DOM 会让这次点击丢失
    expect(ran).toBe(false)

    release()
    expect(srIsPointerPressed()).toBe(false)
    // 抬起后仍要等一拍，确保 mouseup / click 已派发完
    expect(ran).toBe(false)

    vi.runAllTimers()
    expect(ran).toBe(true)
  })

  it('多个等待回调在抬起后依次执行', () => {
    vi.useFakeTimers()
    press()

    const order: number[] = []
    srRunAfterPointerRelease(() => order.push(1))
    srRunAfterPointerRelease(() => order.push(2))

    expect(order).toHaveLength(0)
    release()
    vi.runAllTimers()

    expect(order).toEqual([1, 2])
  })

  it('pointercancel 同样会释放等待队列', () => {
    vi.useFakeTimers()
    press()

    let ran = false
    srRunAfterPointerRelease(() => {
      ran = true
    })

    window.dispatchEvent(new Event('pointercancel'))
    vi.runAllTimers()

    expect(ran).toBe(true)
  })
})
