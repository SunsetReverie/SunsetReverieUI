import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { SrLoadMore } from '..'

describe('SrLoadMore', () => {
  it('idle 时显示按钮', () => {
    const wrapper = mount(SrLoadMore)

    expect(wrapper.classes()).toContain('sr-load-more--idle')
    expect(wrapper.find('.sr-load-more__btn').text()).toBe('加载更多')
    wrapper.unmount()
  })

  it('点击按钮派发 load', async () => {
    const wrapper = mount(SrLoadMore)

    await wrapper.find('.sr-load-more__btn').trigger('click')
    expect(wrapper.emitted('load')).toHaveLength(1)
    wrapper.unmount()
  })

  it('loading 时显示转圈与文案', () => {
    const wrapper = mount(SrLoadMore, { props: { status: 'loading' } })

    expect(wrapper.find('.sr-load-more__btn').exists()).toBe(false)
    expect(wrapper.text()).toContain('加载中')
    wrapper.unmount()
  })

  it('done 时显示到底文案与分隔线', () => {
    const wrapper = mount(SrLoadMore, { props: { status: 'done' } })

    expect(wrapper.text()).toContain('没有更多了')
    expect(wrapper.findAll('.sr-load-more__line')).toHaveLength(2)
    wrapper.unmount()
  })

  it('disabled 时点击不派发', async () => {
    const wrapper = mount(SrLoadMore, { props: { disabled: true } })

    await wrapper.find('.sr-load-more__btn').trigger('click')
    expect(wrapper.emitted('load')).toBeUndefined()
    wrapper.unmount()
  })

  it('支持自定义文案', () => {
    const wrapper = mount(SrLoadMore, {
      props: { loadText: '下一批', loadingText: '请稍候', doneText: '到底了' },
    })

    expect(wrapper.find('.sr-load-more__btn').text()).toBe('下一批')

    const loading = mount(SrLoadMore, { props: { status: 'loading', loadingText: '请稍候' } })
    expect(loading.text()).toContain('请稍候')

    const done = mount(SrLoadMore, { props: { status: 'done', doneText: '到底了' } })
    expect(done.text()).toContain('到底了')

    wrapper.unmount()
    loading.unmount()
    done.unmount()
  })

  it('auto 模式进入可视区自动派发 load', async () => {
    // 用对象包一层：直接在闭包里赋值的局部变量会被 TS 控制流收窄成 null
    const stub: { callback: IntersectionObserverCallback | null } = { callback: null }
    const observe = vi.fn()
    const unobserve = vi.fn()
    const disconnect = vi.fn()

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          stub.callback = cb
        }

        observe = observe
        unobserve = unobserve
        disconnect = disconnect
      },
    )

    const wrapper = mount(SrLoadMore, { props: { auto: true } })
    await nextTick()

    expect(observe).toHaveBeenCalled()

    // 模拟元素进入可视区
    stub.callback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    await nextTick()
    expect(wrapper.emitted('load')).toHaveLength(1)

    // loading 期间即使仍在可视区也不再重复触发
    await wrapper.setProps({ status: 'loading' })
    stub.callback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    await nextTick()
    expect(wrapper.emitted('load')).toHaveLength(1)

    wrapper.unmount()
    expect(disconnect).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
