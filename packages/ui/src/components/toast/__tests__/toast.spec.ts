import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { srToast } from '..'
import { srToastItems } from '../src/store'

beforeEach(() => {
  srToast.closeAll()
})

afterEach(() => {
  srToast.closeAll()
  vi.useRealTimers()
  // 清掉命令式 API 挂载的宿主节点，避免跨用例污染
  for (const node of document.querySelectorAll('.sr-toast-root')) node.remove()
})

describe('srToast', () => {
  it('可直接调用，默认 info 类型与 top 位置', () => {
    srToast('一条提示')

    expect(srToastItems.value).toHaveLength(1)
    expect(srToastItems.value[0]).toMatchObject({
      type: 'info',
      position: 'top',
      message: '一条提示',
      closable: false,
    })
  })

  it('四个快捷方法设置对应类型', () => {
    srToast.info('a')
    srToast.success('b')
    srToast.warning('c')
    srToast.error('d')

    expect(srToastItems.value.map((item) => item.type)).toEqual(['info', 'success', 'warning', 'error'])
  })

  it('返回的 id 可用于手动关闭', () => {
    const id = srToast('提示', { duration: 0 })
    expect(srToastItems.value).toHaveLength(1)

    srToast.close(id)
    expect(srToastItems.value).toHaveLength(0)
  })

  it('到期后自动移除', () => {
    vi.useFakeTimers()
    srToast('自动关闭', { duration: 1000 })

    expect(srToastItems.value).toHaveLength(1)

    vi.advanceTimersByTime(1100)
    expect(srToastItems.value).toHaveLength(0)
  })

  it('duration 为 0 时不会自动关闭', () => {
    vi.useFakeTimers()
    srToast('常驻', { duration: 0 })

    vi.advanceTimersByTime(10_000)
    expect(srToastItems.value).toHaveLength(1)
  })

  it('手动关闭会清掉定时器，不会二次移除', () => {
    vi.useFakeTimers()
    const id = srToast('提示', { duration: 1000 })

    srToast.close(id)
    // 再推进时间，不应报错也不应影响后续提示
    vi.advanceTimersByTime(2000)

    expect(srToastItems.value).toHaveLength(0)
  })

  it('超过 5 条时移除最早的一条', () => {
    for (let index = 0; index < 7; index += 1) {
      srToast(`第 ${index} 条`, { duration: 0 })
    }

    expect(srToastItems.value).toHaveLength(5)
    // 最早的 0、1 已被挤掉
    expect(srToastItems.value[0].message).toBe('第 2 条')
  })

  it('closeAll 清空全部', () => {
    srToast.info('a')
    srToast.error('b')

    srToast.closeAll()
    expect(srToastItems.value).toHaveLength(0)
  })

  it('支持自定义位置与可关闭标记', () => {
    srToast('右下角', { position: 'bottom-right', closable: true })

    expect(srToastItems.value[0]).toMatchObject({
      position: 'bottom-right',
      closable: true,
    })
  })

  it('首次调用才创建宿主节点', () => {
    expect(document.querySelectorAll('.sr-toast-root')).toHaveLength(0)

    srToast('触发')
    expect(document.querySelectorAll('.sr-toast-root').length).toBe(1)

    // 第二次不再新建
    srToast('再来一条')
    expect(document.querySelectorAll('.sr-toast-root').length).toBe(1)
  })
})
