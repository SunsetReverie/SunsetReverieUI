import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { SrConfirm, srConfirm } from '..'
import { resolveConfirm } from '../src/confirm-api'
import { srConfirmItems, srConfirmLoadingIds } from '../src/store'

beforeEach(() => {
  srConfirmItems.value.splice(0)
})

afterEach(() => {
  srConfirmItems.value.splice(0)
  vi.useRealTimers()
  for (const node of document.querySelectorAll('.sr-confirm-host')) node.remove()
})

/** 挂载声明式确认框，stub Teleport 便于原位断言 */
function mountConfirm(props: Record<string, unknown> = {}) {
  return mount(SrConfirm, {
    props: { modelValue: true, title: '确定删除？', content: '删除后不可恢复', ...props },
    global: { stubs: { teleport: true, transition: false } },
    attachTo: document.body,
  })
}

describe('SrConfirm', () => {
  it('渲染标题、内容与两个按钮', () => {
    const wrapper = mountConfirm()

    expect(wrapper.text()).toContain('确定删除？')
    expect(wrapper.text()).toContain('删除后不可恢复')
    expect(wrapper.text()).toContain('取消')
    expect(wrapper.text()).toContain('确认')

    wrapper.unmount()
  })

  it('类型决定图标与确认按钮变体', () => {
    const wrapper = mountConfirm({ type: 'danger' })

    expect(wrapper.find('.sr-confirm--danger').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'SrIcon' }).props('name')).toBe('lucide:circle-x')
    expect(wrapper.html()).toContain('sr-button--danger')

    wrapper.unmount()
  })

  it('showCancel 为 false 时不渲染取消按钮', () => {
    const wrapper = mountConfirm({ showCancel: false })
    expect(wrapper.text()).not.toContain('取消')
    wrapper.unmount()
  })

  it('点击确认 / 取消派发对应事件', async () => {
    const wrapper = mountConfirm()
    const buttons = wrapper.findAll('button')

    await buttons[buttons.length - 1].trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)

    await buttons[0].trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)

    wrapper.unmount()
  })
})

describe('srConfirm', () => {
  it('字符串参数按内容处理，可 resolve 为 true', async () => {
    const result = srConfirm('确定继续？')
    await nextTick()

    expect(srConfirmItems.value).toHaveLength(1)
    expect(srConfirmItems.value[0]?.options.content).toBe('确定继续？')

    resolveConfirm(srConfirmItems.value[0]!.id, true)
    await expect(result).resolves.toBe(true)
    expect(srConfirmItems.value).toHaveLength(0)
  })

  it('取消 resolve 为 false', async () => {
    const result = srConfirm({ title: '删除' })
    await nextTick()

    resolveConfirm(srConfirmItems.value[0]!.id, false)
    await expect(result).resolves.toBe(false)
  })

  it('快捷方法设置类型', async () => {
    const result = srConfirm.warning({ title: '注意' })
    await nextTick()

    expect(srConfirmItems.value[0]?.options.type).toBe('warning')
    resolveConfirm(srConfirmItems.value[0]!.id, false)
    await result
  })

  it('onConfirm 返回 Promise 时先进入 loading 再关闭', async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })

    const result = srConfirm({
      title: '删除',
      onConfirm: () => gate,
    })
    await nextTick()

    const item = srConfirmItems.value[0]!
    resolveConfirm(item.id, true)
    await nextTick()

    expect(srConfirmLoadingIds.value.has(item.id)).toBe(true)
    expect(srConfirmItems.value).toHaveLength(1)

    release()
    await result
    expect(srConfirmItems.value).toHaveLength(0)
    await expect(result).resolves.toBe(true)
  })

  it('onConfirm 抛错时保持打开以便重试', async () => {
    const result = srConfirm({
      title: '重试',
      onConfirm: () => Promise.reject(new Error('failed')),
    })
    await nextTick()

    const item = srConfirmItems.value[0]!
    resolveConfirm(item.id, true)
    await nextTick()
    await nextTick()

    expect(srConfirmLoadingIds.value.has(item.id)).toBe(false)
    expect(srConfirmItems.value).toHaveLength(1)

    // 收尾，避免未 resolve 的 Promise 挂住测试进程
    resolveConfirm(item.id, false)
    await expect(result).resolves.toBe(false)
  })
})
