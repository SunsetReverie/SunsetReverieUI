import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { srMessage } from '..'
import { srMessageItems } from '../src/store'

beforeEach(() => {
  srMessage.closeAll()
})

afterEach(() => {
  srMessage.closeAll()
  vi.useRealTimers()
  for (const node of document.querySelectorAll('.sr-message-root')) node.remove()
})

describe('srMessage', () => {
  it('可直接调用，默认 info 类型', () => {
    srMessage('已保存')

    expect(srMessageItems.value).toHaveLength(1)
    expect(srMessageItems.value[0]).toMatchObject({ type: 'info', content: '已保存' })
  })

  it('四个快捷方法设置对应类型', () => {
    // 逐条验证，避免同时存在 4 条触发 MAX_COUNT 淘汰
    for (const type of ['info', 'success', 'warning', 'error'] as const) {
      srMessage[type]('x', { duration: 0 })
      expect(srMessageItems.value.at(-1)?.type).toBe(type)
      srMessage.closeAll()
    }
  })

  it('backgroundColor 选项写入条目', () => {
    srMessage('自定义', { backgroundColor: '#10b981' })
    expect(srMessageItems.value[0]?.backgroundColor).toBe('#10b981')
  })

  it('color 与 iconColor 分别写入条目', () => {
    srMessage('深色底', {
      backgroundColor: '#1f2937',
      color: '#f1f5f9',
      iconColor: '#60a5fa',
    })

    const item = srMessageItems.value[0]
    expect(item?.backgroundColor).toBe('#1f2937')
    expect(item?.color).toBe('#f1f5f9')
    expect(item?.iconColor).toBe('#60a5fa')
  })

  it('不传颜色时条目上不出现多余字段', () => {
    srMessage('默认配色')
    const item = srMessageItems.value[0]

    expect(item?.color).toBeUndefined()
    expect(item?.iconColor).toBeUndefined()
    expect(item?.backgroundColor).toBeUndefined()
  })

  it('到期后自动移除', () => {
    vi.useFakeTimers()
    srMessage('自动关闭', { duration: 1000 })
    expect(srMessageItems.value).toHaveLength(1)

    vi.advanceTimersByTime(1100)
    expect(srMessageItems.value).toHaveLength(0)
  })

  it('duration 为 0 时不会自动关闭', () => {
    vi.useFakeTimers()
    srMessage('常驻', { duration: 0 })

    vi.advanceTimersByTime(10_000)
    expect(srMessageItems.value).toHaveLength(1)
  })

  it('返回的 id 可用于手动关闭', () => {
    const id = srMessage('提示', { duration: 0 })
    srMessage.close(id)
    expect(srMessageItems.value).toHaveLength(0)
  })

  it('最多同时 3 条，超出移除最早的', () => {
    srMessage('1', { duration: 0 })
    srMessage('2', { duration: 0 })
    srMessage('3', { duration: 0 })
    srMessage('4', { duration: 0 })

    expect(srMessageItems.value.map((item) => item.content)).toEqual(['2', '3', '4'])
  })
})
