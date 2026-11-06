import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { srNotification } from '..'
import { srNotificationItems } from '../src/store'

beforeEach(() => {
  srNotification.closeAll()
})

afterEach(() => {
  srNotification.closeAll()
  vi.useRealTimers()
  for (const node of document.querySelectorAll('.sr-notification-root')) node.remove()
})

describe('srNotification', () => {
  it('对象参数可直接调用，带默认值', () => {
    srNotification({ title: '标题', message: '描述' })

    expect(srNotificationItems.value).toHaveLength(1)
    expect(srNotificationItems.value[0]).toMatchObject({
      type: 'info',
      title: '标题',
      message: '描述',
      position: 'top-right',
      closable: true,
    })
  })

  it('四个快捷方法设置对应类型', () => {
    for (const type of ['info', 'success', 'warning', 'error'] as const) {
      srNotification[type]({ title: type, duration: 0 })
      expect(srNotificationItems.value.at(-1)?.type).toBe(type)
      srNotification.closeAll()
    }
  })

  it('open 等价于直接调用', () => {
    srNotification.open({ title: '打开' })
    expect(srNotificationItems.value[0]?.title).toBe('打开')
  })

  it('支持位置与自定义背景色', () => {
    srNotification({
      title: '自定义',
      position: 'bottom-left',
      backgroundColor: 'rgba(16, 185, 129, 0.9)',
      duration: 0,
    })

    expect(srNotificationItems.value[0]).toMatchObject({
      position: 'bottom-left',
      backgroundColor: 'rgba(16, 185, 129, 0.9)',
    })
  })

  it('到期后自动移除', () => {
    vi.useFakeTimers()
    srNotification({ title: '自动关闭', duration: 1000 })
    expect(srNotificationItems.value).toHaveLength(1)

    vi.advanceTimersByTime(1100)
    expect(srNotificationItems.value).toHaveLength(0)
  })

  it('duration 为 0 时不会自动关闭', () => {
    vi.useFakeTimers()
    srNotification({ title: '常驻', duration: 0 })

    vi.advanceTimersByTime(10_000)
    expect(srNotificationItems.value).toHaveLength(1)
  })

  it('返回的 id 可用于手动关闭', () => {
    const id = srNotification({ title: '提示', duration: 0 })
    srNotification.close(id)
    expect(srNotificationItems.value).toHaveLength(0)
  })
})
